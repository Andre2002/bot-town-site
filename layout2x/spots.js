// Live bot status, phase A2 (plan rev 3/4, approved by Andre 2026-10-29): where a live bot goes, by state and PT clock.
// Destinations, claims, idle rotation and sleep/wake on top of the tile walkers (walkers.js). Mock data only (no feed: B1).
//   working  -> a work tile beside the role's shop door (roster.json shop; lots without a door get tiles on their road edge)
//   idle     -> 7am-12pm any outdoor spot (square, bench seats, park); 12pm-6pm also indoor (library, town hall);
//               6pm-12am the pub (indoors) or the square: the park is closed, there is no pub patio spot
//   sleeping -> 12am-7am PT: the bot walks to its house door and goes in (hidden). A task overnight wakes it: out to the
//               shop, work, then back to bed. Wake is 7am (status.js WAKE_AT).
// Claims: one bot per spot/seat/work tile, claimed before setting off and released on leaving; the engine's tile claims
// and door-zone reservations still apply on the way. A state or band change re-goals the bot at its next tile (no teleports).
// No dock yet: the layout has no dock, so the plan's dock fishing spot is left out until the art/lot exists.
// Spot nodes are added only when install() runs (?status=1), so the plain walkers (tools/checks/walk2x.py) are unchanged.
(function (root) {
  const OUTDOOR = ['square', 'bench', 'park'], INDOOR = ['library', 'hall'];
  const WEIGHT = { square: 3, bench: 2, park: 2, library: 1, hall: 1, pub: 2 };
  const STAY = [60, 180];                                 // an idle stop lasts 1-3 min, then the bot picks again in its band
  const H = m => m * 60;
  // the idle band for a PT clock (minutes past midnight): which kinds of idle spot are open
  function band(min) {
    if (min < H(7)) return { id: 'night', kinds: [] };
    if (min < H(12)) return { id: 'day', kinds: OUTDOOR.slice() };
    if (min < H(18)) return { id: 'afternoon', kinds: [...OUTDOOR, ...INDOOR] };
    return { id: 'evening', kinds: ['pub', 'square'] };
  }
  const parkOpen = min => band(min).kinds.includes('park');
  // weighted pick of an idle kind from the open kinds that still have a free spot (indoor kinds never fill)
  function pickKind(kinds, hasFree, rnd) {
    const open = kinds.filter(hasFree); if (!open.length) return null;
    let r = rnd() * open.reduce((s, k) => s + WEIGHT[k], 0);
    for (const k of open) { r -= WEIGHT[k]; if (r < 0) return k; } return open[open.length - 1];
  }
  // where a bot in a mode goes: { kind, door } for indoors, { kind, spot } for an outdoor tile, or null (stroll)
  function destination(bot, mode, min, freeSpots, rnd) {
    if (mode === 'sleeping') return { kind: 'bed', door: bot.house };
    if (mode === 'working') { const s = freeSpots('work:' + bot.shop)[0]; return s ? { kind: 'work', spot: s } : null; }
    const k = pickKind(band(min).kinds, k => INDOOR.includes(k) || k === 'pub' || freeSpots(k).length > 0, rnd);
    if (!k) return null;
    if (INDOOR.includes(k) || k === 'pub') return { kind: k, door: k };
    const f = freeSpots(k); return { kind: k, spot: f[Math.floor(rnd() * f.length)] };
  }

  // ---- spot geometry (feet points, absolute 2x layout px) ----
  function layoutSpots(T, ASSETS) {
    const SQ = T.square, B = id => T.buildings.find(b => b.id === id), P = id => ASSETS.find(a => a.id === id);
    const out = [];   // { id, kind, x, y, via: {x, y} = where to look for the road tile it is reached from }
    // square: two columns either side of Main Street's lanes across the square, 4 rows, clear of the lamps and the bench
    [1464, 1704].forEach((x, c) => [900, 1020, 1140, 1260].forEach((y, r) => out.push({ id: `square:${c}${r}`, kind: 'square', x, y, via: { x: c ? 1608 : 1560, y } })));
    { const b = P('bench_square').base, y = b.y + b.h + 26;   // 2 seats in front of the bench; west seat from Main Street, east seat from Pub Yard
      out.push({ id: 'bench:0', kind: 'bench', x: b.x + 26, y, via: { x: 1608, y } }); out.push({ id: 'bench:1', kind: 'bench', x: b.x + b.w - 26, y, via: { x: 2090, y: 1272 } }); }
    { const pk = B('park'); [0, 1, 2, 3].forEach(i => { const x = pk.x + 150 + i * 220; out.push({ id: 'park:' + i, kind: 'park', x, y: pk.y + 60, via: { x, y: pk.y - 40 } }); }); }
    // work tiles: 3 per shop beside the door (72 and 144 px off the door, clear of the 16 px door clearance); a lot with no door
    // gets 3 along its road edge
    for (const id of ['lab', 'workshop', 'mage_shop', 'library', 'hall', 'spare_w1', 'tbd', 'teleport']) {
      const b = B(id); if (!b) continue;
      if (b.door) { const dx = b.x + b.door.x + b.door.w / 2, y = Math.max(b.y + b.door.y + b.door.h, b.y + b.h) + 4;
        const offs = [72, -72, 144, -144, 216].filter(o => dx + o - 24 > b.x && dx + o + 24 < b.x + b.w).slice(0, 3);
        offs.forEach((o, i) => out.push({ id: `work:${id}:${i}`, kind: 'work:' + id, x: dx + o, y, via: { x: dx + o, y: y + 30 } }));
      } else if (id === 'teleport') { [0, 1, 2].forEach(i => out.push({ id: `work:${id}:${i}`, kind: 'work:' + id, x: b.x - 40, y: b.y + 60 + i * 64, via: { x: b.x - 100, y: b.y + 60 + i * 64 } })); }
      else { const top = id === 'tbd', y = top ? b.y + b.h + 20 : b.y + b.h + 4; [0, 1, 2].forEach(i => { const x = b.x + 120 + i * 120; out.push({ id: `work:${id}:${i}`, kind: 'work:' + id, x, y, via: { x, y: y + 60 } }); }); }
    }
    return out;
  }

  // add the spot nodes to the walker graph, each linked by an off-road approach to its nearest road tile
  function install(W, T, ASSETS, opts) {
    opts = opts || {};
    const rnd = opts.rnd || Math.random, errors = [];
    const SP = layoutSpots(T, ASSETS), BY = {}, KIND = {};
    for (const s of SP) {
      let r = null, d = 1e9; for (const n of W.roadNodes) { const e = Math.hypot(n.x - s.via.x, n.y - s.via.y); if (e < d) { d = e; r = n; } }
      const id = 'live:' + s.id, n = { id, x: s.x, y: s.y, cx: s.x, cy: s.y - 12, road: false, edges: [], tracks: [], live: s.id, roadNode: r.id };
      const len = Math.hypot(n.x - r.x, n.y - r.y);
      n.edges.push({ to: r.id, len, cost: 1, kind: 'approach' }); r.edges.push({ to: id, len, cost: 1, kind: 'approach' });
      W.N[id] = n; W.nodes.push(n); Object.assign(s, { node: id, road: r.id, len }); BY[s.id] = s; (KIND[s.kind] = KIND[s.kind] || []).push(s);
      for (const p of W.PROPS) if (W.ovl(W.footBox(n.x, n.y), p.base)) errors.push(`spot ${s.id} overlaps prop ${p.id}`);
    }
    for (let i = 0; i < SP.length; i++) for (let j = i + 1; j < SP.length; j++) if (W.ovl(W.footBox(SP[i].x, SP[i].y), W.footBox(SP[j].x, SP[j].y))) errors.push(`spots ${SP[i].id} and ${SP[j].id} overlap`);
    const CLAIM = {};          // spot id -> bot id: claimed before setting off, released on leaving
    const freeSpots = k => (KIND[k] || []).filter(s => CLAIM[s.id] == null);
    const bots = [];
    function release(w) { for (const k of Object.keys(CLAIM)) if (CLAIM[k] === w.bot.id) delete CLAIM[k]; }
    // the brain: the walkers engine asks it for a goal whenever the bot needs one (arrived and stayed, blocked too long, woke up)
    function brain(w) {
      const min = opts.clock(), mode = w.mode, b = w.bot;
      release(w);
      const d = destination(b, mode, min, freeSpots, rnd); w.dest = d; w.band = band(min).id;
      if (!d) { const n = W.roadNodes[Math.floor(rnd() * W.roadNodes.length)]; return { kind: 'road', node: n.id, stay: 5 + rnd() * 10 }; }
      if (d.door) { const D = W.DOORS[d.door]; if (!D) return null; return { kind: 'door', node: D.node, door: d.door, stay: d.kind === 'bed' ? Infinity : STAY[0] + rnd() * (STAY[1] - STAY[0]), live: d.kind }; }
      CLAIM[d.spot.id] = b.id;
      return { kind: 'spot', node: d.spot.node, stay: d.kind === 'work' ? Infinity : STAY[0] + rnd() * (STAY[1] - STAY[0]), live: d.kind, spot: d.spot.id };
    }
    const modeOf = id => { const m = opts.model().find(x => x.id === id); return m ? m.state : 'idle'; };
    function add(bot, at, id) {
      const w = W.addWalker(id, at, 'brisk', { kind: 'road', node: at, stay: 0 }); w.bot = bot; w.mode = modeOf(bot.id); w.brain = brain;
      W.setGoal(w); bots.push(w); return w;
    }
    // put a bot straight at its first destination (page load only: the town opens settled)
    function settle(w) {
      const g = w.goal; if (!g) return;
      if (S().owner[w.at] === w.id) delete S().owner[w.at];
      const n = W.N[g.node]; w.at = g.node; w.x = n.x; w.y = n.y; w.path = []; w.until = S().t + g.stay;
      if (g.kind === 'door') w.inside = g.door; else S().owner[g.node] = w.id;
    }
    const S = () => W.S;
    // once per tick before the engine: a changed state or idle band re-goals the bot at its next tile; asleep or working
    // indoors, the stay ends when the state changes (the bot comes out of the door, the zone permitting)
    function update() {
      const min = opts.clock(), bid = band(min).id;
      for (const w of bots) {
        const m = modeOf(w.bot.id), closed = w.mode === 'idle' && w.dest && !(['work', 'bed'].includes(w.dest.kind)) && !band(min).kinds.includes(w.dest.kind);
        if (m === w.mode && !closed) continue;
        if (w.moving) continue;                               // mid-step: re-goal once the step lands on its tile
        const was = w.mode; w.mode = m;
        if (w.inside) { w.until = 0; w.log = `${was}->${m}`; continue; }   // comes out next tick; the exit asks the brain
        w.until = 0; W.setGoal(w);
      }
    }
    return { spots: SP, BY, KIND, CLAIM, bots, errors, add, settle, update, brain, freeSpots };
  }

  const API = { OUTDOOR, INDOOR, WEIGHT, STAY, band, parkOpen, pickKind, destination, layoutSpots, install };
  if (typeof module !== 'undefined' && module.exports) module.exports = API; else root.BOT_SPOTS = API;
})(typeof window !== 'undefined' ? window : globalThis);
