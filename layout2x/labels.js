// Live status name labels (?status=1 only): place each bot's name so it never covers another bot's figure.
// Fix for the #154 QA find (Lloyd's label over Scout's legs at the stacked square spots, 120 px apart in y).
// Each label tries, in order: above its head (3 stack levels), then beside its head (right, then left), at 28px, then 22px,
// then 18px. The first spot that hits no other bot's figure box and no label already placed wins. Labels are placed
// left to right. With bounds (the canvas, {w, h}) a spot must also lie fully inside the canvas: an above label is slid
// sideways to fit, a side label off the edge is skipped; if nothing fits, the fallback is clamped inside (#155 QA follow-up). Pure geometry, so tests/labels.test.js runs it in node with a stand-in text measure.
(function (root) {
  const SIZES = [28, 22, 18], FIG = { w: 48, h: 98, below: 9 };   // figure box: 48 wide, head 98 above the feet, shadow 9 below
  const fig = b => ({ x: b.x - FIG.w / 2, y: b.y - FIG.h, w: FIG.w, h: FIG.h + FIG.below });
  const hit = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  // candidate rects for a label of width w (text + 8) and size F, for a bot with feet at (x, y)
  function candidates(b, w, F) {
    const h = F + 4, top = b.y - FIG.h, out = [];
    for (let lvl = 0; lvl < 3; lvl++) out.push({ x: b.x - w / 2, y: top - 6 - h - lvl * (h + 4), w, h, F, lvl, side: 'above' });
    out.push({ x: b.x + FIG.w / 2 + 4, y: top + 4, w, h, F, lvl: 0, side: 'right' });
    out.push({ x: b.x - FIG.w / 2 - 4 - w, y: top + 4, w, h, F, lvl: 0, side: 'left' });
    return out;
  }
  // bots: [{id, name, x, y}] (feet); measure(text, F) -> text width in px. Returns the bots with .lab = {x, y, w, h, F, lvl, side, clear}
  const inside = (c, B) => !B || (c.x >= 0 && c.y >= 0 && c.x + c.w <= B.w && c.y + c.h <= B.h);
  const clamp = (c, B) => B ? Object.assign({}, c, { x: Math.max(0, Math.min(B.w - c.w, c.x)), y: Math.max(0, Math.min(B.h - c.h, c.y)) }) : c;
  function place(bots, measure, bounds) {
    const figs = bots.map(b => ({ id: b.id, r: fig(b) })), placed = [];
    for (const b of bots.slice().sort((p, q) => p.x - q.x || p.y - q.y)) {
      let pick = null, first = null;
      for (const F of SIZES) { for (let c of candidates(b, measure(b.name, F) + 8, F)) {
        if (c.side === 'above') c = clamp(c, bounds);   // above: slide along the edge; sides: skip when off the canvas
        if (!first) first = clamp(c, bounds);
        if (!inside(c, bounds)) continue;
        if (!figs.some(f => f.id !== b.id && hit(c, f.r)) && !placed.some(p => hit(c, p))) { pick = c; break; } }
        if (pick) break; }
      b.lab = Object.assign({}, pick || first, { clear: !!pick }); placed.push(b.lab);
    }
    return bots;
  }
  const API = { SIZES, FIG, fig, hit, candidates, inside, clamp, place };
  if (typeof module !== 'undefined' && module.exports) module.exports = API; else root.BOT_LABELS = API;
})(typeof window !== 'undefined' ? window : globalThis);
