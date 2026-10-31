// Live status, phase B1 (plan rev 5, "B1 · Real data feed", decided by Vega 2026-10-30): the feed adapter for ?status=1.
//   Source: bot-ping Worker events {owner, bot, state, task}. The Worker's public read route is pending Andre's approval, so the
//   URL is configurable (?feed=<same-origin path | allowed Worker origin>, else the default; default FEED_URL below) and is a local fixture until then. Accepted bodies: an array or
//   {statuses:[...]} of {id, state, task, since} (getStatuses() schema), or bot-ping style {bot, state, task, ts}.
//   Rules: asleep -> sleeping; names map through roster.json (id or name, case-insensitive), off-roster bots are hidden;
//   since = the server timestamp (a future since is clamped to now); no event for 15 min = stale, shown as idle; poll every 30 s (backoff x2 to 5 min after a failure, reset on success; no overlapping polls); a failed poll (incl. an empty or
//   garbage 200) keeps the last
//   known state (then the stale rule applies); no mock fallback. Task text: control + zero-width chars dropped, HTML, URLs,
//   tokens and emails stripped, cut to 24 chars. With the clock (resolve): fed working beats the 12-7am clock sleep, the clock
//   sleep beats a fed idle, a fed sleeping shows sleeping.
// Pure (fetch, clock and timers injected), so tests/feed.test.js runs it in node with a fake clock and fetch.
(function (root) {
  const FEED_URL = 'feed.fixture.json';
  const POLL_MS = 30 * 1000, MAX_POLL_MS = 5 * 60 * 1000, STALE_MS = 15 * 60 * 1000, MAX_CHARS = 24;
  const FEED_ORIGINS = ['https://bot-town.andrelesliemarks.workers.dev'];   // allowed ?feed= origins besides same-origin paths
  const SLEEP_FROM = 0, WAKE_AT = 7 * 60;
  const STATE_MAP = { working: 'working', idle: 'idle', asleep: 'sleeping', sleeping: 'sleeping' };
  // control chars (C0, DEL, C1) and zero-width / invisible format chars (ZWSP..RLM, bidi embeds/isolates, word joiner.., BOM, soft hyphen)
  const INVISIBLE = /[\u0000-\u001f\u007f-\u009f\u00ad\u061c\u180e\u200b-\u200f\u202a-\u202e\u2060-\u206f\ufeff]/g;

  function cleanTask(task) {
    if (task == null) return null;
    let s = String(task).replace(INVISIBLE, ' ');
    s = s.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, ' ').replace(/<[^>]*>?/g, ' ').replace(/[<>]/g, ' ');
    s = s.replace(/\bhttps?:\/\/\S+|\bwww\.\S+|\S+@\S+\.\S+/gi, ' ').replace(/\b(sk|pk|ghp|gho|ghs|github_pat|xox[abprs]|AKIA)[-_A-Za-z0-9]{6,}\b/g, ' ').replace(/\b[A-Za-z0-9_\-]{24,}\b/g, ' ');
    s = s.replace(/\s+/g, ' ').trim();
    if (s.length > MAX_CHARS) s = s.slice(0, MAX_CHARS).trim();
    return s || null;
  }
  function toMs(t) { if (t == null || t === '') return null; const v = typeof t === 'number' ? (t < 1e12 ? t * 1000 : t) : Date.parse(t); return Number.isFinite(v) ? v : null; }
  function rosterIndex(roster) { const ix = {}; for (const b of roster.bots) { ix[String(b.id).toLowerCase()] = b.id; ix[String(b.name).toLowerCase()] = b.id; } return ix; }

  // raw feed body -> {id: {id, state, task, since(ms)}}, newest event per roster bot; off-roster and unknown states dropped
  function normalize(body, roster) {
    const list = Array.isArray(body) ? body : (body && (body.statuses || body.events)) || [];
    const ix = rosterIndex(roster), out = {};
    for (const e of list) {
      if (!e || typeof e !== 'object') continue;
      const id = ix[String(e.id != null ? e.id : e.bot).trim().toLowerCase()]; if (!id) continue;
      const state = STATE_MAP[String(e.state || '').toLowerCase()]; if (!state) continue;
      const since = toMs(e.since != null ? e.since : e.ts);   // future values are clamped to now in statuses() / at ingest by create()
      const prev = out[id]; if (prev && (prev.since || 0) > (since || 0)) continue;
      out[id] = { id, state, task: state === 'working' ? cleanTask(e.task) : null, since };
    }
    return out;
  }
  // last known map + now -> [{id, state, task, since(ISO)}]; stale (or no since) -> idle
  function statuses(last, now) {
    return Object.values(last).map(s => {
      if (s.since != null && s.since > now) s = Object.assign({}, s, { since: now });   // a future since is clamped to now, so it still goes stale
      const stale = s.since == null || now - s.since > STALE_MS;
      return { id: s.id, state: stale ? 'idle' : s.state, task: stale ? null : s.task, since: s.since == null ? null : new Date(s.since).toISOString(), stale };
    });
  }
  // fed state + PT minutes -> shown state (status.model's resolver in live mode)
  function resolve(entry, min) {
    const fed = entry && STATE_MAP[entry.state] ? STATE_MAP[entry.state] : 'idle';
    if (fed === 'working' || fed === 'sleeping') return fed;
    return min >= SLEEP_FROM && min < WAKE_AT ? 'sleeping' : 'idle';
  }

  // ?feed= value -> URL to poll: same-origin paths (no scheme, no //host) or an allowed origin; anything else -> default fixture
  function feedUrl(v) {
    if (v == null || v === '') return FEED_URL; const u = String(v).trim();
    if (/^[\w\-./?=&%~]+$/.test(u) && !u.startsWith('//') && !/^[a-z][a-z0-9+.\-]*:/i.test(u) && !u.includes('..')) return u;
    let x; try { x = new URL(u); } catch (e) { return FEED_URL; }
    return FEED_ORIGINS.includes(x.origin) && !x.username && !x.password ? x.href : FEED_URL;
  }
  // opts: {url, roster, fetch, now, setInterval, clearInterval, pollMs, onUpdate}
  // opts: also setTimeout/clearTimeout. Poll every 30 s; after a failure the delay doubles up to 5 min, reset to 30 s on success.
  function create(opts) {
    const o = Object.assign({ url: FEED_URL, pollMs: POLL_MS, maxPollMs: MAX_POLL_MS, now: () => Date.now() }, opts);
    const st = o.setTimeout || setTimeout, ct = o.clearTimeout || clearTimeout;
    const F = { url: o.url, last: {}, ok: null, error: null, polls: 0, fetches: 0, lastOk: null, timer: null, inflight: null, delay: o.pollMs, running: false };
    const fail = msg => { F.ok = false; F.error = msg; F.delay = Math.min(o.maxPollMs, F.delay * 2); };
    F.poll = () => {
      F.polls++;
      if (F.inflight) return F.inflight;   // no overlapping polls: a poll while one is in flight shares it
      F.fetches++;
      F.inflight = (async () => {
        try {
          const r = await o.fetch(o.url, { cache: 'no-store' });
          if (!r || !r.ok) throw new Error('HTTP ' + (r ? r.status : '?'));
          let body; try { body = await r.json(); } catch (e) { throw new Error('bad JSON'); }
          const m = normalize(body, o.roster), now = o.now();
          if (!Object.keys(m).length) throw new Error('no usable entries');   // empty / garbage 200 = feed down
          for (const k in m) if (m[k].since != null && m[k].since > now) m[k].since = now;
          F.last = m; F.ok = true; F.error = null; F.lastOk = now; F.delay = o.pollMs;
        } catch (e) { fail(String(e && e.message || e)); }   // keep F.last: last known state, then the stale rule
        F.inflight = null;
        if (o.onUpdate) o.onUpdate(F);
        return F;
      })();
      return F.inflight;
    };
    const loop = async () => { F.timer = null; await F.poll(); if (F.running) F.timer = st(loop, F.delay); };
    F.getStatuses = () => statuses(F.last, o.now());
    F.start = () => { if (!F.running) { F.running = true; loop(); } return F; };
    F.stop = () => { F.running = false; if (F.timer) ct(F.timer); F.timer = null; };
    return F;
  }

  const API = { FEED_URL, FEED_ORIGINS, feedUrl, MAX_POLL_MS, POLL_MS, STALE_MS, MAX_CHARS, STATE_MAP, cleanTask, normalize, statuses, resolve, create };
  if (typeof module !== 'undefined' && module.exports) module.exports = API; else root.BOT_FEED = API;
})(typeof window !== 'undefined' ? window : globalThis);
