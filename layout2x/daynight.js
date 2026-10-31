// Live bot status, phase A5 (plan rev 4): day/night on top of the town sim clock (status.js clock(): ?clock=HH:MM, the dev slider,
// else the live PT clock). Night is ~7pm-6am with a dusk ramp 5pm-7pm and a dawn ramp 6am-7am; a multiply tint darkens the
// world, then lamp glows are added in code (placeholders until window/lamp glow art lands). Status glows and name labels are
// repainted over the tint so they stay full brightness. Mode: 'auto' (clock), 'day' or 'night' (?night=1 / ?night=0, or the button).
(function (root) {
  const DUSK_FROM = 17 * 60, NIGHT_FROM = 19 * 60, DAWN_FROM = 6 * 60, DAY_FROM = 7 * 60;
  const TINT = '#2a3a78', MAX = 1;   // full-night multiply colour; MAX scales the tint strength
  const MODES = ['auto', 'day', 'night'];
  // 0 = full day, 1 = full night, for minutes past midnight
  function darkness(min) {
    min = ((min % 1440) + 1440) % 1440;
    if (min >= NIGHT_FROM || min < DAWN_FROM) return 1;
    if (min >= DUSK_FROM) return (min - DUSK_FROM) / (NIGHT_FROM - DUSK_FROM);
    if (min < DAY_FROM) return 1 - (min - DAWN_FROM) / (DAY_FROM - DAWN_FROM);
    return 0;
  }
  const level = (mode, min) => mode === 'night' ? 1 : mode === 'day' ? 0 : darkness(min);
  const phase = (k, min) => k <= 0 ? 'day' : k >= 1 ? 'night' : min != null && ((min % 1440) + 1440) % 1440 < 12 * 60 ? 'dawn' : 'dusk';   // the 6-7am ramp is dawn
  const mix = (a, b, k) => Math.round(a + (b - a) * k);
  function tintColour(k) {   // white (no change) -> TINT
    const t = parseInt(TINT.slice(1), 16), r = t >> 16, gg = (t >> 8) & 255, b = t & 255;
    return `rgb(${mix(255, r, k * MAX)},${mix(255, gg, k * MAX)},${mix(255, b, k * MAX)})`;
  }
  // g: 2d context in world coords; rect: {x,y,w,h}; lamps: [{x,y}] light points
  const GLOW_R = 60, POOL = { rx: 40, ry: 12 };   // lamp head glow radius (was 120) and ground pool, world px
  function draw(g, k, rect, lamps) {
    if (k <= 0) return;
    g.save(); g.globalCompositeOperation = 'multiply'; g.fillStyle = tintColour(k); g.fillRect(rect.x, rect.y, rect.w, rect.h);
    g.globalCompositeOperation = 'lighter';
    // lamp glow (A4, Andre 2026-10-30: was a 120px halo): ~half radius, brighter centre, quick falloff, lighting the lamp head,
    // plus a small flattened pool on the ground at the lamp's base (p.by) when given
    for (const p of lamps || []) {
      const R = GLOW_R, gr = g.createRadialGradient(p.x, p.y, 0, p.x, p.y, R);
      gr.addColorStop(0, `rgba(255,214,130,${0.9 * k})`); gr.addColorStop(0.25, `rgba(255,200,110,${0.5 * k})`); gr.addColorStop(0.6, `rgba(255,190,100,${0.12 * k})`); gr.addColorStop(1, 'rgba(255,190,100,0)');
      g.fillStyle = gr; g.beginPath(); g.arc(p.x, p.y, R, 0, Math.PI * 2); g.fill();
      if (p.by != null) { g.save(); g.translate(p.x, p.by); g.scale(1, POOL.ry / POOL.rx); const pr = g.createRadialGradient(0, 0, 0, 0, 0, POOL.rx);
        pr.addColorStop(0, `rgba(255,200,110,${0.35 * k})`); pr.addColorStop(1, 'rgba(255,200,110,0)'); g.fillStyle = pr; g.beginPath(); g.arc(0, 0, POOL.rx, 0, Math.PI * 2); g.fill(); g.restore(); }
    }
    g.restore();
  }
  const parseMode = s => s === '1' ? 'night' : s === '0' ? 'day' : 'auto';
  const next = m => MODES[(MODES.indexOf(m) + 1) % MODES.length];
  const API = { GLOW_R, POOL, DUSK_FROM, NIGHT_FROM, DAWN_FROM, DAY_FROM, TINT, MODES, darkness, level, phase, tintColour, draw, parseMode, next };
  if (typeof module !== 'undefined' && module.exports) module.exports = API; else root.BOT_DAYNIGHT = API;
})(typeof window !== 'undefined' ? window : globalThis);
