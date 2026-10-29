// Live bot status, phase A1 (plan rev 3, approved by Andre 2026-10-29): the 3-state model, the mock status source and the
// state colours. No movement (A2), board (A3), bubbles (A4) or day/night (A5). Works in the page (window.BOT_STATUS) and in
// node (module.exports) so tests/status.test.js can drive it without a browser.
(function (root) {
  const TZ = 'America/Los_Angeles';
  const STATES = ['working', 'idle', 'sleeping'];
  const RING = { working: '#5cb85c', idle: '#9aa0a6', sleeping: '#6b5b95' };
  const SLEEP_FROM = 0, WAKE_AT = 7 * 60;        // minutes past midnight PT: idle bots sleep 12:00am-7:00am (7am is the plan's pick, to confirm)
  const OVERNIGHT_TASK_WAKES = true;             // a task arriving overnight wakes the bot (plan default, to confirm)

  // minutes past midnight in PT for a Date (DST-aware via Intl)
  function ptMinutes(date) {
    const p = new Intl.DateTimeFormat('en-US', { timeZone: TZ, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(date);
    const h = +p.find(x => x.type === 'hour').value, m = +p.find(x => x.type === 'minute').value;
    return (h % 24) * 60 + m;
  }
  const asleepAt = min => min >= SLEEP_FROM && min < WAKE_AT;
  // "HH:MM" -> minutes, or null
  function parseClock(s) { const m = /^(\d{1,2}):(\d{2})$/.exec(String(s || '')); if (!m || +m[1] > 23 || +m[2] > 59) return null; return +m[1] * 60 + +m[2]; }
  const fmtClock = min => `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`;

  // one feed entry (or none) + the PT clock -> the bot's shown state
  function resolve(entry, min) {
    const fed = entry && STATES.includes(entry.state) ? entry.state : 'idle';   // missing or unknown -> idle; sleep is clock-only, so a feed 'sleeping' counts as idle (Vega, 2026-10-29)
    if (fed === 'working') return (asleepAt(min) && !OVERNIGHT_TASK_WAKES) ? 'sleeping' : 'working';
    return asleepAt(min) ? 'sleeping' : 'idle';
  }
  // roster + feed statuses + clock -> [{id, name, role, shop, house, state, task, since, ring}] in roster order; feed ids not in the roster are dropped
  function model(roster, statuses, min) {
    const by = {}; for (const s of statuses || []) if (s && s.id) by[s.id] = s;
    return roster.bots.map(b => {
      const e = by[b.id], state = resolve(e, min);
      return { id: b.id, name: b.name, role: b.role, shop: b.shop, house: b.house, state, task: state === 'working' ? (e.task || null) : null, since: e ? e.since || null : null, ring: RING[state] };
    });
  }
  // the mock source: getStatuses() -> [{id, state, task, since}] (B's feed adapter replaces this)
  function mockSource(mockJson) { return { getStatuses: () => (mockJson.statuses || []).map(s => ({ id: s.id, state: s.state, task: s.task ?? null, since: s.since ?? null })) }; }

  // draw a state ring under a figure's feet (rings stay full brightness)
  // soft flat ground glow under the feet, about the shadow's width: working pulses gently (2.4s), idle is steady grey, sleeping is a deep purple, darker than idle
  const GLOW = { rx: 28, ry: 8, period: 2400, working: [0.45, 0.80], idle: 0.60, sleeping: 0.85 };
  const glowAlpha = (state, ms) => state === 'working' ? GLOW.working[0] + (GLOW.working[1] - GLOW.working[0]) * (0.5 - 0.5 * Math.cos(2 * Math.PI * ((ms || 0) % GLOW.period) / GLOW.period)) : (GLOW[state] != null ? GLOW[state] : GLOW.idle);
  function drawGlow(g, x, y, state, ms) { g.save(); g.globalAlpha = glowAlpha(state, ms); g.fillStyle = RING[state]; g.beginPath(); g.ellipse(x, y, GLOW.rx, GLOW.ry, 0, 0, Math.PI * 2); g.fill(); g.restore(); }

  const API = { TZ, STATES, RING, SLEEP_FROM, WAKE_AT, OVERNIGHT_TASK_WAKES, ptMinutes, asleepAt, parseClock, fmtClock, resolve, model, mockSource, GLOW, glowAlpha, drawGlow };
  if (typeof module !== 'undefined' && module.exports) module.exports = API; else root.BOT_STATUS = API;
})(typeof window !== 'undefined' ? window : globalThis);
