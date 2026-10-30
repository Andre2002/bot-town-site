// Live status, phase A3 (plan rev 3/4, approved by Andre 2026-10-29): the task board loop, ?status=1 only.
//   task starts -> the bot walks to the board, pins a note in a free slot, then walks to its shop and works;
//   task ends   -> it walks back to the board, takes its note off, then goes idle (or to bed).
// The board (board_r17b.png, 216x160) and the 8 notes (note_N_fit, 23x26, 4x2 slots from board_pin_slots_r17.json) are
// separate sprites, copied as-is from gen_r17 (no new gens). Notes are markers only: no text is drawn.
// Placement: town 1780,926. The square plan puts the board at square-local 664,146 (town 1800,926); it is shifted 20px west
// so its right edge (x1996) clears lamp_sq_ne (x2000) by 4px. A stopgap until the square redesign lands.
// The old board_spot prop is hidden under ?status=1 and drawn as before without the flag. A full board queues the next
// note; it is pinned when a slot frees. Pure state + geometry, so tests/board.test.js runs it in node.
(function (root) {
  const ART = 'assets/town2x/props/taskboard_r17/';
  const RECT = { x: 1780, y: 926, w: 216, h: 160 };
  const NOTE = { w: 23, h: 26 };
  // slot rects, board-local (board_pin_slots_r17.json, 4x2: top row y67, bottom row y94; columns centred on the pegs)
  const SLOTS = [[40, 67], [78, 67], [115, 67], [153, 67], [40, 94], [78, 94], [115, 94], [153, 94]].map(([x, y], i) => ({ id: i + 1, x, y, w: NOTE.w, h: NOTE.h }));
  const NOTES = [1, 2, 3, 4, 5, 6, 7, 8].map(i => ART + `note_${i}_fit_r17${i === 5 || i === 7 ? 'b' : ''}.png`);
  // two standing spots (feet), one at each end of the board and just below it, so a bot pinning stands beside the slots,
  // never in front of them (slot columns run x1820-1956; the stands' 48px figures cover x1772-1820 and x1956-2004).
  // One-way flow, so nobody meets head-on: bots line up in a 4-spot queue line below the board (QUEUE, front = 0, entered at
  // the back from Main Street's east lane x1608 cy1216), step from the front spot onto whichever stand is free, and leave by
  // the stand's own exit to its own road tile: the west stand straight to x1608 cy1066 (between the square spot rows at y1020
  // and y1140), the east stand down past the lamp to Pub Yard's lane x2088 cy1272 (path = its waypoint from the road tile;
  // bench:1's approach starts from that tile too, the two legs fan apart). No two of the board walk-ups cross or share a road tile
  // (below the line there is no gap between square:13's and bench:0's approaches for a body to pass west). Bots that find the
  // line full wait on the free square spot nearest the board (spots.js).
  const STANDS = [{ id: 'board:0', kind: 'board', x: 1796, y: 1130, via: { x: 1608, y: 1066 } },
    { id: 'board:1', kind: 'board', x: 1980, y: 1140, via: { x: 2088, y: 1272 }, path: [{ x: 1968, y: 1260 }] }];
  const QUEUE = [1912, 1846, 1782, 1718].map((x, i) => ({ id: 'boardq:' + i, kind: 'boardq', x, y: i ? 1220 : 1194 }));
  const QUEUE_VIA = { x: 1608, y: 1216 };   // the back of the line's road tile
  const PIN_S = 4, ANIM_IN = 0.45, ANIM_OUT = 0.4;   // seconds at the board; note pop-in and fall-off
  const ease = u => 1 - Math.pow(1 - u, 3);
  // a note's look at sim time t: pops in (scale 0 -> 1.15 -> 1, drops 10px onto its pin), falls off (drops 14px, shrinks, fades)
  function noteFrame(n, t) {
    if (n.out != null) { const u = Math.min(1, Math.max(0, (t - n.out) / ANIM_OUT)); return { alpha: 1 - u, scale: 1 - 0.4 * u, dy: 14 * ease(u), rot: 0.35 * u, done: u >= 1 }; }
    const u = Math.min(1, Math.max(0, (t - n.t0) / ANIM_IN)); if (u >= 1) return { alpha: 1, scale: 1, dy: 0, rot: 0, done: false };
    const s = u < 0.7 ? 1.15 * ease(u / 0.7) : 1.15 - 0.15 * ((u - 0.7) / 0.3);
    return { alpha: Math.min(1, u * 3), scale: s, dy: -10 * (1 - ease(u)), rot: 0, done: false };
  }
  function create() {
    const slots = SLOTS.map(() => null), queue = [];   // slot -> { bot, note, t0, out }
    const slotOf = id => slots.findIndex(n => n && n.bot === id && n.out == null);
    const has = id => slotOf(id) >= 0 || queue.includes(id);
    function place(id, t) { const i = slots.findIndex(n => n == null); if (i < 0) return -1; slots[i] = { bot: id, note: i, t0: t, out: null }; return i; }
    // pin: a free slot, else the queue. A bot that already has a note keeps it (it took its note onto its slot)
    function pin(id, t) { if (has(id)) return slotOf(id); const i = place(id, t); if (i < 0) queue.push(id); return i; }
    function unpin(id, t) { const q = queue.indexOf(id); if (q >= 0) { queue.splice(q, 1); return true; } const i = slotOf(id); if (i < 0) return false; slots[i].out = t; return true; }
    // once per tick: finished fall-offs free their slot; the queue fills free slots in order
    function update(t) { for (let i = 0; i < slots.length; i++) if (slots[i] && slots[i].out != null && noteFrame(slots[i], t).done) slots[i] = null;
      while (queue.length && slots.some(n => n == null)) place(queue.shift(), t); }
    return { slots, queue, has, pin, unpin, update, slotOf, STANDS, QUEUE, QUEUE_VIA, PIN_S, RECT };
  }
  // draw the board and its notes (images: { board, notes: [8] } loaded Image objects)
  function draw(g, B, t, im) {
    if (im.board && im.board.complete && im.board.naturalWidth) g.drawImage(im.board, RECT.x, RECT.y);
    B.slots.forEach((n, i) => { if (!n) return; const s = SLOTS[i], f = noteFrame(n, t), img = im.notes[n.note];
      if (!img || !img.complete || !img.naturalWidth || f.alpha <= 0) return;
      g.save(); g.globalAlpha = f.alpha; g.translate(RECT.x + s.x + s.w / 2, RECT.y + s.y + f.dy + 3); g.rotate(f.rot); g.scale(f.scale, f.scale);
      g.drawImage(img, -s.w / 2, -3); g.restore(); });   // scaled about the pin (3px below the note top)
  }
  const API = { ART, RECT, NOTE, SLOTS, NOTES, STANDS, QUEUE, QUEUE_VIA, PIN_S, ANIM_IN, ANIM_OUT, noteFrame, create, draw };
  if (typeof module !== 'undefined' && module.exports) module.exports = API; else root.BOT_BOARD = API;
})(typeof window !== 'undefined' ? window : globalThis);
