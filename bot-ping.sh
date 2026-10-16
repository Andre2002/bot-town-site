#!/usr/bin/env bash
# bot-ping: report a bot's state to Bot Town. Zero dependencies (bash + curl), no AI calls.
#   bot-ping join <name> [role]          get a token, saved to ~/.config/bot-town/<name>.token (chmod 600)
#   bot-ping <name> working "task"       or: bot-ping <name> idle | asleep
# Env: BOT_TOWN_OWNER (your town; saved after the first join), BOT_TOWN_OWNER_KEY (needed to add bots to a
# claimed town; the first join saves it to ~/.config/bot-town/owner.key), BOT_TOWN_URL (default: the live server).
# Roles: Chief of Staff, Engineer, Designer, Researcher, Writer, Analyst. Never prints tokens.
set -u
URL="${BOT_TOWN_URL:-https://bot-town.andrelesliemarks.workers.dev}"
DIR="${BOT_TOWN_DIR:-$HOME/.config/bot-town}"
die() { echo "bot-ping: $*" >&2; exit 1; }
usage() { sed -n '3,4p' "$0" | sed 's/^# \{0,1\}//' >&2; exit 2; }
esc() { local s=${1//\\/\\\\}; s=${s//\"/\\\"}; printf '%s' "$s" | tr -d '\000-\037'; }
urlenc() { local s=$1 o= c i; for ((i=0;i<${#s};i++)); do c=${s:i:1}; case $c in [A-Za-z0-9._~-]) o+=$c;; ' ') o+=%20;; *) o+=$(printf '%%%02X' "'$c");; esac; done; printf '%s' "$o"; }
field() { sed -n "s/.*\"$1\":\"\([^\"]*\)\".*/\1/p"; }
owner() { local o="${BOT_TOWN_OWNER:-}"; [ -z "$o" ] && [ -f "$DIR/owner" ] && o=$(cat "$DIR/owner"); [ -n "$o" ] || die "set BOT_TOWN_OWNER to your town name (lowercase letters, digits, dashes)"; printf '%s' "$o"; }
save() { (umask 077; printf '%s' "$2" > "$1"); chmod 600 "$1"; }

[ $# -ge 1 ] || usage
mkdir -p "$DIR" && chmod 700 "$DIR"
if [ "$1" = join ]; then
  [ $# -ge 2 ] || usage
  name=$2 role=${3:-} own=$(owner)
  key="${BOT_TOWN_OWNER_KEY:-}"; [ -z "$key" ] && [ -f "$DIR/owner.key" ] && key=$(cat "$DIR/owner.key")
  q="owner=$(urlenc "$own")&bot=$(urlenc "$name")"; [ -n "$role" ] && q+="&role=$(urlenc "$role")"
  if [ -n "$key" ]; then res=$(curl -sS -m 10 -H @- "$URL/join?$q" <<<"Authorization: Bearer $key") || die "server unreachable"
  else res=$(curl -sS -m 10 "$URL/join?$q") || die "server unreachable"; fi
  tok=$(printf '%s' "$res" | field token)
  [ -n "$tok" ] || die "join failed: $(printf '%s' "$res" | field error)"
  save "$DIR/$name.token" "$tok"; printf '%s' "$own" > "$DIR/owner"
  ok=$(printf '%s' "$res" | field owner_key)
  [ -n "$ok" ] && save "$DIR/owner.key" "$ok" && echo "Claimed town '$own'. Owner key saved to $DIR/owner.key (keep it safe)."
  echo "$name joined town '$own'. Token saved to $DIR/$name.token"
  exit 0
fi
[ $# -ge 2 ] || usage
name=$1 state=$2 task=${3:-}
case $state in working|idle|asleep) ;; *) die "state must be working, idle or asleep";; esac
[ -f "$DIR/$name.token" ] || die "no token for '$name'; run: bot-ping join \"$name\" <role>"
body="{\"owner\":\"$(esc "$(owner)")\",\"bot\":\"$(esc "$name")\",\"state\":\"$state\""
[ -n "$task" ] && body+=",\"task\":\"$(esc "${task:0:80}")\""
body+="}"
code=$(curl -s -m 5 -o /dev/null -w '%{http_code}' -H @- -H 'Content-Type: application/json' -d "$body" "$URL/event" <<<"Authorization: Bearer $(cat "$DIR/$name.token")") || exit 0
case $code in 2*) exit 0;; *) echo "bot-ping: server said $code" >&2; exit 1;; esac
