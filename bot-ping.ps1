# bot-ping: report a bot's state to Bot Town. No dependencies (PowerShell 5+), no AI calls. Port of bot-ping.sh.
#   bot-ping.ps1 join <name> [role]        token saved to ~/.config/bot-town/<name>.token (user-only)
#   bot-ping.ps1 <name> working "task"     or: bot-ping.ps1 <name> idle | asleep
#   bot-ping.ps1 <name> role <Role or a few words>   change the role, keep the token
# Env: BOT_TOWN_OWNER, BOT_TOWN_OWNER_KEY, BOT_TOWN_URL. Never prints tokens.
$ErrorActionPreference = 'Stop'
$Url = if ($env:BOT_TOWN_URL) { $env:BOT_TOWN_URL } else { 'https://bot-town.andrelesliemarks.workers.dev' }
$Dir = if ($env:BOT_TOWN_DIR) { $env:BOT_TOWN_DIR } else { Join-Path $HOME '.config/bot-town' }
function Die($m) { [Console]::Error.WriteLine("bot-ping: $m"); exit 1 }
function Save($path, $text) {
  Set-Content -LiteralPath $path -Value $text -NoNewline
  if ($IsLinux -or $IsMacOS) { chmod 600 $path } else { icacls $path /inheritance:r /grant:r "$($env:USERNAME):F" | Out-Null }
}
function Owner { $o = $env:BOT_TOWN_OWNER; $f = Join-Path $Dir 'owner'
  if (-not $o -and (Test-Path $f)) { $o = (Get-Content -Raw $f).Trim() }
  if (-not $o) { Die 'set BOT_TOWN_OWNER to your town name (lowercase letters, digits, dashes)' }; $o }
if ($args.Count -lt 2) { Get-Content $PSCommandPath | Select-Object -Skip 1 -First 2; exit 2 }
New-Item -ItemType Directory -Force $Dir | Out-Null
if ($args[0] -eq 'join') {
  $name = $args[1]; $role = $args[2]; $own = Owner
  $key = $env:BOT_TOWN_OWNER_KEY; $kf = Join-Path $Dir 'owner.key'
  if (-not $key -and (Test-Path $kf)) { $key = (Get-Content -Raw $kf).Trim() }
  $q = "owner=$([uri]::EscapeDataString($own))&bot=$([uri]::EscapeDataString($name))"
  if ($role) { $q += "&role=$([uri]::EscapeDataString($role))" }
  $h = @{}; if ($key) { $h.Authorization = "Bearer $key" }
  try { $r = Invoke-RestMethod -Uri "$Url/join?$q" -Headers $h -TimeoutSec 10 }
  catch { Die "join failed: $($_.ErrorDetails.Message)" }
  Save (Join-Path $Dir "$name.token") $r.token; Set-Content (Join-Path $Dir 'owner') $own -NoNewline
  if ($r.owner_key) { Save $kf $r.owner_key; "Claimed town '$own'. Owner key saved to $kf (keep it safe)." }
  "$name joined town '$own'. Token saved to $(Join-Path $Dir "$name.token")"; exit 0
}
$name = $args[0]; $state = $args[1]; $task = $args[2]
if ($state -notin 'working','idle','asleep','role') { Die 'state must be working, idle or asleep' }
$tf = Join-Path $Dir "$name.token"; if (-not (Test-Path $tf)) { Die "no token for '$name'; run: bot-ping.ps1 join `"$name`" <role>" }
if ($state -eq 'role') {
  if (-not $task) { Die 'usage: bot-ping.ps1 <name> role <Role or a few words>' }
  $rb = @{ owner = (Owner); bot = $name; role = $task.Substring(0, [Math]::Min(80, $task.Length)) }
  try { $r = Invoke-RestMethod -Method Post -Uri "$Url/role" -Headers @{ Authorization = "Bearer $((Get-Content -Raw $tf).Trim())" } -ContentType 'application/json' -Body ($rb | ConvertTo-Json -Compress) -TimeoutSec 10 }
  catch { Die "role change failed: $($_.ErrorDetails.Message)" }
  "$name is now $($r.role)"; exit 0
}
$body = @{ owner = (Owner); bot = $name; state = $state }
if ($task) { $body.task = $task.Substring(0, [Math]::Min(80, $task.Length)) }
try { Invoke-RestMethod -Method Post -Uri "$Url/event" -Headers @{ Authorization = "Bearer $((Get-Content -Raw $tf).Trim())" } -ContentType 'application/json' -Body ($body | ConvertTo-Json -Compress) -TimeoutSec 5 | Out-Null }
catch { Die "server said $($_.Exception.Message)" }
