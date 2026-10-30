/* Tile walkers for the 2x town (RPG Maker-style movement). Loaded by index.html (?walkers=1) and by tools/checks/walk2x.py.
   Spec (Andre via Vega, 2026-10-27): 48px tiles, collision = the tile at the walker's feet, y-sorted sprites; every road is
   two one-tile lanes, keep right; speed stored as frames per tile (60 ticks/s); a step claims its next tile at its start and
   keeps the old tile until half way; standing walkers are obstacles for planning; blocked: wait 0.5-1s and retry, after 2
   failures side-step, ~3s re-plan, ~6s new goal; head-on: the lower id side-steps right or waits; claims settle once per
   tick in id order (a lost claim is not a timeout); paths stay on road tiles except the final door / board-spot approach;
   walk frames 0-1-2-1, two per tile step, the standing frame only when idle.
   Geometry: the layout's streets are not on one global 48px grid (High Street y684, Oak Lane y459 ...), so each road carries
   its own two lane tracks (lane centres 24px and 72px into the 96px road). A track's tiles sit on the crossing points with
   the tracks of the roads it meets and are spread evenly in between (step = span / floor(span / 48), so >= 48px and never
   overlapping). Main Street's lanes run on across the town square to High Street (the square is paved; it is the link). */
(function () {
  const T = window.TOWN2X, ASSETS = (window.TOWN_ASSETS || { assets: [] }).assets;
  const TILE = 48, HALF = 24, FOOT = { w: 48, h: 24 }, FEET = 12, HZ = 60;
  const FPT = { stroll: 30, brisk: 24, hurry: 16 };            // frames per tile: 2, 2.5 and 3.75 tiles/s
  const WAIT = [0.5, 1.0], SIDESTEP_AFTER = 2, REPLAN_S = 2, REGOAL_S = 4.5, WRONG_WAY = 8, LANE_COST = 1.5, DOOR_CLEAR = 16;
  const SEQ = [0, 1, 2, 1];                                   // walk cycle; the standing frame is 'stand'
  const rnd = () => Math.random();
  const find = id => [...T.streets, ...T.spokes].find(r => r.id === id);
  const H = ['oak_lane', 'ivy_lane', 'high_street', 'pub_yard', 'library_walk', 'works_road'].map(id => { const r = find(id); return { id, y: r.y, h: r.h, a: r.x, b: r.x + r.w }; });
  const V = ['res_lane', 'main_street', 'teleport_path'].map(id => { const r = find(id); return { id, x: r.x, w: r.w, a: r.y, b: r.y + r.h }; });
  const errors = [];
  for (const r of [...H, ...V]) if ((r.h || r.w) !== 2 * TILE) errors.push(`${r.id} is ${r.h || r.w}px wide, two lanes need ${2 * TILE}`);
  const SQ = T.square;
  for (const v of V) if (Math.abs(v.a - (SQ.y + SQ.h)) < 1 && v.x >= SQ.x && v.x + v.w <= SQ.x + SQ.w) { v.a = SQ.y; v.link = { x: v.x, y: SQ.y, w: v.w, h: SQ.h }; }
  for (const h of H) for (const v of V) {   // a road that ends against another runs across it, so their lanes cross
    if (h.y < v.b && h.y + h.h > v.a) { if (Math.abs(h.b - v.x) < 1) h.b = v.x + v.w; if (Math.abs(h.a - (v.x + v.w)) < 1) h.a = v.x; }
    if (v.x < h.b && v.x + v.w > h.a) { if (Math.abs(v.a - (h.y + h.h)) < 1) v.a = h.y; if (Math.abs(v.b - h.y) < 1) v.b = h.y + h.h; }
  }
  // tracks: rows run west/east (north lane westbound, south lane eastbound: keep right); cols run north/south (west lane southbound)
  const rows = [], cols = [];
  for (const h of H) { rows.push({ road: h.id, c: h.y + HALF, a: h.a, b: h.b, dir: -1, lane: 0 }); rows.push({ road: h.id, c: h.y + TILE + HALF, a: h.a, b: h.b, dir: 1, lane: 1 }); }
  for (const v of V) { cols.push({ road: v.id, c: v.x + HALF, a: v.a, b: v.b, dir: 1, lane: 0 }); cols.push({ road: v.id, c: v.x + TILE + HALF, a: v.a, b: v.b, dir: -1, lane: 1 }); }
  const crosses = (r, c) => c.c > r.a && c.c < r.b && r.c > c.a && r.c < c.b;
  function spread(t, others) {
    const fixed = others.filter(o => t.isRow ? crosses(t, o) : crosses(o, t)).map(o => o.c);
    let anchors = [...new Set(fixed.map(v => Math.round(v * 100) / 100))].sort((p, q) => p - q);
    for (const e of [t.a + HALF, t.b - HALF]) if (!anchors.some(v => Math.abs(v - e) < TILE)) anchors.push(e);
    anchors.sort((p, q) => p - q);
    const out = [];
    for (let i = 0; i < anchors.length; i++) {
      out.push(anchors[i]);
      if (i + 1 < anchors.length) { const d = anchors[i + 1] - anchors[i], n = Math.floor(d / TILE); for (let k = 1; k < n; k++) out.push(anchors[i] + d * k / n); }
    }
    return out;
  }
  rows.forEach(r => r.isRow = true);
  const N = {}, nodes = [];      // node id -> { id, x, y (feet), cx, cy, road: bool, edges: [] }
  const key = (x, y) => `${Math.round(x * 100) / 100},${Math.round(y * 100) / 100}`;
  function node(cx, cy, extra) { const k = key(cx, cy); if (!N[k]) { N[k] = Object.assign({ id: k, cx, cy, x: cx, y: cy + FEET, road: true, edges: [], tracks: [] }, extra || {}); nodes.push(N[k]); } return N[k]; }
  function link(a, b, kind, dirOk) {
    const len = Math.hypot(a.x - b.x, a.y - b.y), cost = kind === 'lane' ? LANE_COST : kind === 'approach' ? 1 : (len / TILE) * (dirOk ? 1 : WRONG_WAY);
    const old = a.edges.find(e => e.to === b.id); if (old) { if (cost < old.cost) Object.assign(old, { cost, kind }); return; }
    a.edges.push({ to: b.id, len, cost, kind });
  }
  for (const t of rows) { t.pos = spread(t, cols); t.cells = t.pos.map(x => { const n = node(x, t.c); n.tracks.push(t); return n; }); }
  for (const t of cols) { t.pos = spread(t, rows); t.cells = t.pos.map(y => { const n = node(t.c, y); n.tracks.push(t); return n; }); }
  for (const t of [...rows, ...cols]) for (let i = 0; i + 1 < t.cells.length; i++) { link(t.cells[i], t.cells[i + 1], 'track', t.dir > 0); link(t.cells[i + 1], t.cells[i], 'track', t.dir < 0); }
  for (const [list, isRow] of [[rows, true], [cols, false]]) for (let i = 0; i + 1 < list.length; i += 2) {
    const A = list[i], B = list[i + 1];
    for (const a of A.cells) { const b = N[isRow ? key(a.cx, B.c) : key(B.c, a.cy)]; if (b) { link(a, b, 'lane'); link(b, a, 'lane'); } }
  }
  for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) { const a = nodes[i], b = nodes[j]; if (Math.abs(a.x - b.x) < TILE - 0.01 && Math.abs(a.y - b.y) < TILE - 0.01) errors.push(`tiles ${a.id} and ${b.id} overlap`); }
  // off-road ends: doors (the layout's door point, 4px below the door) and the two task-board reading spots
  const BLD = T.buildings, doorPt = b => ({ x: b.x + b.door.x + b.door.w / 2, y: Math.max(b.y + b.door.y + b.door.h, b.y + b.h) + 4 });
  const roadNodes = nodes.slice();
  function below(p) {   // the nearest lane tile straight below a point (same track, the closest row under it)
    let best = null; for (const n of roadNodes) { if (n.y <= p.y || Math.abs(n.x - p.x) > HALF || n.y - p.y > 128) continue; if (!best || n.y < best.y || (n.y === best.y && Math.abs(n.x - p.x) < Math.abs(best.x - p.x))) best = n; }
    return best;
  }
  const DOORS = {}, SPOTS = [];
  for (const b of BLD) {
    if (!b.door) continue; const p = doorPt(b); let r = below(p); if (!r) { errors.push(`door ${b.id}: no lane tile below`); continue; }
    {   // a door's approach (lane tile and both lane neighbours) never touches a crossing or a crossing's exit tile: the hotspot moves along the
        // building front to straight above the nearest lane tile that is clear (the building art does not move)
      const crossing = n => n.tracks.some(t => t.isRow) && n.tracks.some(t => !t.isRow);
      const t0 = r.tracks.find(t => t.isRow);
      if (t0) { const c = t0.cells, i0 = c.indexOf(r), nearX = n => crossing(n) || n.edges.some(e => N[e.to] && N[e.to].road && crossing(N[e.to])),   // a crossing tile, or a crossing's exit tile
            bad = i => !c[i] || [i - 1, i, i + 1].some(j => c[j] && nearX(c[j]));
        if (bad(i0)) { let best = null;
          for (let k = 1; k < c.length && !best; k++) for (const i of [i0 + k, i0 - k]) if (!best && !bad(i) && c[i].x > b.x + 24 && c[i].x < b.x + b.w - 24) best = c[i];
          if (best) { r = best; p.x = r.x; } else errors.push(`door ${b.id}: no lane tile clear of a crossing under the building front`); } }
    }
    const d = { id: 'door:' + b.id, x: p.x, y: p.y, cx: p.x, cy: p.y - FEET, road: false, edges: [], tracks: [], door: b.id, roadNode: r.id };
    N[d.id] = d; nodes.push(d); link(d, r, 'approach'); link(r, d, 'approach');
    const t = r.tracks.find(t => t.isRow), i = t ? t.cells.indexOf(r) : -1;
    DOORS[b.id] = { node: d.id, road: r.id, zone: [d.id, r.id, ...(t ? [t.cells[i - 1], t.cells[i + 1]].filter(Boolean).map(n => n.id) : [])], len: Math.hypot(d.x - r.x, d.y - r.y) };
  }
  const BOARD = ASSETS.find(a => a.id === 'board_spot');
  if (BOARD) {
    const k = BOARD.base, yard = rows.find(r => r.road === 'pub_yard' && r.lane === 0);
    const near = yard.cells.slice().sort((p, q) => Math.abs(p.x - BOARD.anchor.x) - Math.abs(q.x - BOARD.anchor.x)).slice(0, 2).sort((p, q) => p.x - q.x);
    near.forEach((r, i) => { const s = { id: 'spot:' + i, x: r.x, y: k.y + k.h + 4 + FOOT.h, road: false, edges: [], tracks: [], spot: i, roadNode: r.id }; s.cx = s.x; s.cy = s.y - FEET; N[s.id] = s; nodes.push(s); link(s, r, 'approach'); link(r, s, 'approach'); SPOTS.push({ node: s.id, road: r.id, len: r.y - s.y }); });
  }
  const PROPS = ASSETS.filter(a => a.kind === 'prop');
  const footBox = (x, y) => ({ x: x - FOOT.w / 2, y: y - FOOT.h, w: FOOT.w, h: FOOT.h });
  const ovl = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  for (const n of nodes) for (const p of PROPS) if (ovl(footBox(n.x, n.y), p.base)) errors.push(`tile ${n.id} overlaps prop ${p.id}`);
  const ROADS = [...T.streets, ...T.spokes, ...V.filter(v => v.link).map(v => v.link)];

  // ---------------- simulation ----------------
  const S = { t: 0, tick: 0, walkers: [], owner: {}, want: {}, zoneWant: {}, log: [], naive: false, lostClaims: 0 };
  const lg = (w, ev, detail) => S.log.push({ t: +S.t.toFixed(3), id: w.id, ev, at: w.at, detail: detail || '' });
  const free = (id, w) => (S.owner[id] == null || S.owner[id] === w.id);
  const leaverOf = id => S.walkers.find(o => o.moving && o.from === id && o.released);
  const standing = o => !o.moving && !o.inside;
  function astar(from, goal, w, avoid) {
    const G = { [from]: 0 }, P = {}, open = [from], goalN = N[goal], h = id => Math.hypot(N[id].x - goalN.x, N[id].y - goalN.y) / TILE;
    const blockedBy = {}; if (avoid) for (const o of S.walkers) if (o !== w && standing(o) && o.at) blockedBy[o.at] = 1;
    const F = { [from]: h(from) }, done = {};
    while (open.length) {
      let bi = 0; for (let i = 1; i < open.length; i++) if (F[open[i]] < F[open[bi]]) bi = i;
      const u = open.splice(bi, 1)[0]; if (u === goal) break; if (done[u]) continue; done[u] = 1;
      for (const e of N[u].edges) {
        const v = N[e.to]; if (!v.road && e.to !== goal) continue;          // off-road only as the final approach
        if (!N[u].road && u !== from) continue;
        if (blockedBy[e.to] && e.to !== goal) continue;
        const g = G[u] + e.cost; if (G[e.to] == null || g < G[e.to]) { G[e.to] = g; P[e.to] = u; F[e.to] = g + h(e.to); open.push(e.to); }
      }
    }
    if (G[goal] == null) return null;
    const out = []; for (let k = goal; k !== from; k = P[k]) out.unshift(k); return out;
  }
  function pickGoal(w) {
    const r = rnd();
    if (r < 0.4) { const ds = Object.keys(DOORS); const d = ds[Math.floor(rnd() * ds.length)]; return { kind: 'door', node: DOORS[d].node, door: d, stay: 2 + rnd() * 4 }; }
    if (r < 0.55 && SPOTS.length) { const s = SPOTS[Math.floor(rnd() * SPOTS.length)]; if (S.owner[s.node] == null && !S.walkers.some(o => o.goal && o.goal.node === s.node)) return { kind: 'spot', node: s.node, stay: 3 + rnd() * 2 }; }
    let n; do { n = roadNodes[Math.floor(rnd() * roadNodes.length)]; } while ((S.owner[n.id] != null && S.owner[n.id] !== w.id) || isBox(n.id));   // nobody idles inside a crossing
    return { kind: 'road', node: n.id, stay: 0.5 + rnd() * 1.5 };
  }
  const isBox = id => { const n = N[id]; return n.road && n.tracks.some(t => t.isRow) && n.tracks.some(t => !t.isRow); };
  function dropBox(w) { for (const id of w.box || []) if (id !== w.at && id !== w.from && S.owner[id] === w.id && !(w.zone && w.zone.includes(id))) delete S.owner[id]; w.box = null; }
  function plan(w, avoid) {
    dropBox(w);
    const p = (avoid && astar(w.at, w.goal.node, w, true)) || astar(w.at, w.goal.node, w, false);
    w.path = p || []; if (!p) lg(w, 'noroute', w.goal.node);
  }
  function setGoal(w, g) { if (w.zone && !w.inside && !w.moving && N[w.at].road) {   // never drop the zone while on the door approach
    const keep = [w.at, w.from]; for (const id of w.zone) if (!keep.includes(id) && S.owner[id] === w.id) delete S.owner[id]; w.zone = null; } w.goal = g || (w.brain && w.brain(w)) || pickGoal(w); w.blk = null; plan(w, true); }   // a live bot (spots.js, ?status=1) has a brain that picks its goal by state and clock
  function addWalker(id, at, pace, goal) {
    const n = N[at], w = { id, at, from: null, x: n.x, y: n.y, moving: false, released: false, prog: 0, len: 0, v: 0, pace, fpt: FPT[pace], phase: 0, frame: 'stand', dir: 'down', path: [], goal: null, blk: null, retryAt: 0, inside: false, until: 0, stats: { steps: 0 } };
    S.owner[at] = id; S.walkers.push(w); setGoal(w, goal); return w;
  }
  function spawn(n) {
    const paces = ['stroll', 'stroll', 'brisk', 'hurry'];
    for (let i = 0; i < n; i++) { let c; do { c = roadNodes[Math.floor(rnd() * roadNodes.length)]; } while (S.owner[c.id] != null); addWalker(i + 1, c.id, paces[Math.floor(rnd() * paces.length)]); }
  }
  const facing = (a, b) => { const dx = b.x - a.x, dy = b.y - a.y; return Math.abs(dx) >= Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'); };
  function start(w, to, claimed) {
    const a = N[w.at], b = N[to];
    dropGap(w); S.owner[to] = w.id; claimed.add(to);
    w.from = w.at; w.at = to; w.moving = true; w.released = false; w.prog = 0; w.len = Math.hypot(b.x - a.x, b.y - a.y);
    w.v = TILE / w.fpt; const L = leaverOf(to); if (L && L !== w) w.v = Math.min(w.v, L.v);   // never close on a body still leaving the tile
    w.dir = facing(a, b); w.frame = SEQ[w.phase % 4]; w.stats.steps++;
    w.offStep = !a.road || !b.road;
  }
  function dropGap(w) { if (w.gap != null && S.owner[w.gap] === w.id && w.gap !== w.at) delete S.owner[w.gap]; w.gap = null; w.last = null; }
  // the wait log names who holds what: every hold has an owner id (a free tile can still be off limits: first call, a crossing's tiles, a door zone)
  function whyBlocked(w, next, claimed, qd, zw) {
    const by = id => `walker ${S.owner[id]}`;
    if (S.owner[next] != null && S.owner[next] !== w.id) return `held by ${by(next)}`;
    if (claimed.has(next)) return 'claimed this tick by another walker';
    if (qd && qd.id !== w.id && S.owner[next] == null) return `free, first call to waiting walker ${qd.id}`;
    if (zw) return `free, ${zw[0]} zone first call to walker ${zw[1]}`;
    const k = w.path.findIndex(id => !isBox(id)), hold = isBox(next) ? (k < 0 ? w.path : w.path.slice(0, k + 1)) : [];
    const hb = hold.find(id => S.owner[id] != null && S.owner[id] !== w.id); if (hb) return `free, crossing tile ${hb} held by ${by(hb)}`;
    const dn = !N[next].road && N[next].door ? N[next] : null;
    if (dn) { const z = DOORS[dn.door].zone.find(id => S.owner[id] != null && S.owner[id] !== w.id); if (z) return `free, ${dn.door} zone tile ${z} held by ${by(z)}`;
      const L = DOORS[dn.door].zone.map(leaverOf).find(q => q && q !== w); if (L) return `free, ${dn.door} zone tile still being left by walker ${L.id}`; }
    const L = leaverOf(next); if (L && L !== w) return `free, still being left by walker ${L.id}`;
    return 'free, blocked this tick';
  }
  function zoneFree(w, zone) { return zone.every(id => free(id, w) && !(leaverOf(id) && leaverOf(id) !== w)); }
  function claimZone(w, zone) { for (const id of zone) S.owner[id] = w.id; w.zone = zone; }
  function dropZone(w, keep) { for (const id of w.zone || []) if (id !== keep && S.owner[id] === w.id) delete S.owner[id]; w.zone = null; }
  function sidestep(w, claimed, prefer) {
    const here = N[w.at], nx = w.path[0] ? N[w.path[0]] : null;
    const hx = nx ? Math.sign(Math.round(nx.x - here.x)) : 0, hy = nx ? Math.sign(Math.round(nx.y - here.y)) : 0;
    const right = [-hy, hx];
    const cands = here.edges.map(e => N[e.to]).filter(n => n.road && free(n.id, w) && !claimed.has(n.id) && !leaverOf(n.id) && n.id !== (nx && nx.id) && !(isBox(n.id) && !isBox(w.at)))
      .map(n => { const dx = Math.sign(Math.round(n.x - here.x)), dy = Math.sign(Math.round(n.y - here.y)); return { n, perp: dx * hx + dy * hy === 0, right: dx === right[0] && dy === right[1] }; })
      .filter(c => (c.perp || prefer === 'any') && (prefer !== 'right' || c.right)).sort((p, q) => (q.perp - p.perp) || (q.right - p.right));
    if (!cands.length) return false;
    start(w, cands[0].n.id, claimed); return true;
  }
  function tick() {
    const dt = 1 / HZ; S.t += dt; S.tick++;
    for (const w of S.walkers) {
      if (w.inside || !w.moving) continue;
      const before = w.prog; w.prog = Math.min(w.len, w.prog + w.v);
      const a = N[w.from], b = N[w.at], k = w.len ? w.prog / w.len : 1;
      w.x = a.x + (b.x - a.x) * k; w.y = a.y + (b.y - a.y) * k;
      if (before < w.len / 2 && w.prog >= w.len / 2) { w.phase++; w.frame = SEQ[w.phase % 4]; if (!w.offStep && S.owner[w.from] === w.id && !(w.zone && w.zone.includes(w.from))) { delete S.owner[w.from]; w.released = true; } }
      if (w.prog >= w.len) {
        w.moving = false; w.phase++; w.frame = SEQ[w.phase % 4];
        if (S.owner[w.from] === w.id && !(w.zone && w.zone.includes(w.from))) delete S.owner[w.from];
        if (w.zone && b.road) dropZone(w, w.at);
        if (w.box && !isBox(w.at)) w.box = null;          // out of the door: the zone goes, the lane tile stays
        w.last = w.from; w.from = null; w.released = false;
      }
    }
    const claimed = new Set();
    const since = w => w.blk ? w.blk.t0 : Infinity;
    for (const w of S.walkers.slice().sort((p, q) => (since(p) - since(q)) || (p.id - q.id))) { decide(w, claimed); if (!w.moving) { w.frame = 'stand'; w.phase = 0; } }
  }
  function decide(w, claimed) {
    {
      if (w.moving) return;
      if (w.inside) {   // leaving a building: the door zone must be clear (16px door clearance)
        if (S.t < w.until) return;
        const D = DOORS[w.inside], zone = D.zone;
        if (!S.naive && (!zoneFree(w, zone) || zone.some(id => claimed.has(id)))) return;
        w.inside = false; w.at = D.node; const n = N[D.node]; w.x = n.x; w.y = n.y; lg(w, 'exit', D.node);
        setGoal(w); claimZone(w, zone); zone.forEach(id => claimed.add(id)); return;
      }
      if (!w.path.length) {
        if (w.goal && w.at === w.goal.node) {
          if (w.until === 0) { w.until = S.t + w.goal.stay; }
          if (w.goal.kind === 'door' && !w.inside) { w.inside = w.goal.door; dropZone(w); if (S.owner[w.at] === w.id) delete S.owner[w.at]; dropGap(w); lg(w, 'enter', w.at); w.until = S.t + w.goal.stay; return; }
          if (S.t < w.until) return;
          w.until = 0; setGoal(w);
        } else if (w.goal) plan(w, true);
        if (!w.path.length) { return; }
      }
      if (w.blk && !S.naive) {   // the timeouts run on the clock, not only at a retry: ~3s re-plan, ~6s a new goal
        const held = S.t - w.blk.t0;
        if (held >= REGOAL_S) { lg(w, 'regoal', `blocked ${held.toFixed(2)}s at ${w.path[0]}`); setGoal(w); w.retryAt = 0; }
        else if (held >= REPLAN_S && !w.blk.replanned) { const b0 = w.blk; b0.replanned = true; plan(w, true); w.blk = b0; lg(w, 'replan', `blocked ${held.toFixed(2)}s, new route via ${w.path[0]}`); w.retryAt = 0; }
        if (!w.path.length) return;
      }
      if (S.t < w.retryAt) { return; }
      const next = w.path[0];
      // the door zone (door tile, its lane tile, that tile's two lane neighbours) is reserved from the step onto the lane tile
      // until the walker is inside (or, leaving, until it is back on the lane tile): nobody comes within 16px of the approach
      const dn = !N[next].road && N[next].door ? N[next] : (w.path[1] && N[w.path[1]].door && N[w.path[1]].roadNode === next ? N[w.path[1]] : null);
      const isApproach = dn && !(w.zone && w.zone === DOORS[dn.door].zone);
      if (S.naive) { w.path.shift(); start(w, next, claimed); return; }
      // a walker that has waited for a tile has first call on it when it frees (no starving at a merge), so the others yield
      const qd = S.want[next], qw = qd && qd.id !== w.id && S.walkers.find(q => q.id === qd.id);
      const queued = S.owner[next] == null && qw && !qw.moving && !qw.inside && qw.path[0] === next && qw.blk && qd.t0 < (w.blk ? w.blk.t0 : S.t);
      // a door-goer waiting for its zone holds first call on the zone's free tiles, so passing traffic can't starve it
      const zw = Object.entries(S.zoneWant).find(([d, id]) => id !== w.id && DOORS[d].zone.includes(next) && S.walkers.some(q => q.id === id && !q.moving && !q.inside && q.blk && q.blk.zone === d));
      { // spacing: the walker ahead on this lane stands still, so it takes the tile in between as its gap (one empty tile)
        const p1 = w.path[1], q = p1 != null && S.walkers.find(o => o.id === S.owner[p1]), a = N[next], c = q && N[q.at];
        if (q && q !== w && !q.moving && !q.inside && q.at === p1 && q.gap == null && c.road && S.owner[next] == null && !claimed.has(next) && !isBox(next) && !isBox(p1)
            && (Math.abs(a.y - c.y) < 1 || Math.abs(a.x - c.x) < 1) && !Object.values(DOORS).some(D => D.zone.includes(next))) { S.owner[next] = q.id; q.gap = next; }
      }
      let ok = free(next, w) && !claimed.has(next) && !queued && !(zw && S.owner[next] == null);
      // don't block the box: a walker enters a crossing (tiles on two crossing tracks) only when the first tile after it is free
      // crossing the box: a walker entering a crossing claims every crossing tile on its way through plus the tile after,
      // all at once, so walkers inside a crossing never wait on each other (no gridlock rings in the box)
      let boxHold = null;
      if (ok && isBox(next) && !isBox(w.at)) {
        const k = w.path.findIndex(id => !isBox(id)); boxHold = (k < 0 ? w.path : w.path.slice(0, k + 1)).slice(1);
        if (boxHold.some(id => !free(id, w) || claimed.has(id))) ok = false;
        const dIn = boxHold.find(id => !N[id].road && N[id].door);   // a door straight off the crossing: its zone goes with the crossing
        if (ok && dIn) { const zone = DOORS[N[dIn].door].zone; if (zoneFree(w, zone) && !zone.some(id => claimed.has(id) && S.owner[id] !== w.id)) { claimZone(w, zone); zone.forEach(id => claimed.add(id)); } else ok = false; }
      }
      if (ok && isApproach) { const zone = DOORS[dn.door].zone; ok = zoneFree(w, zone) && !zone.some(id => claimed.has(id) && S.owner[id] !== w.id); if (ok) { claimZone(w, zone); if (S.zoneWant[dn.door] === w.id) delete S.zoneWant[dn.door]; } else if (free(next, w) && !claimed.has(next)) { if (!w.blk) w.blk = { t0: S.t, fails: 0, replanned: false }; w.blk.zone = dn.door; if (S.zoneWant[dn.door] == null || !S.walkers.some(q => q.id === S.zoneWant[dn.door] && q.blk && q.blk.zone === dn.door && !q.moving)) S.zoneWant[dn.door] = w.id; } }
      if (ok && boxHold) { for (const id of boxHold) { S.owner[id] = w.id; claimed.add(id); } w.box = boxHold; }
      if (ok) { if (S.want[next] && S.want[next].id === w.id) delete S.want[next]; w.path.shift(); start(w, next, claimed); w.blk = null; w.follow0 = null; return; }
      if (claimed.has(next) && S.owner[next] !== w.id) { S.lostClaims++; if (w.blk) w.blk.t0 += 1 / HZ; return; }   // lost this tick's settle: not a timeout
      const o = S.walkers.find(q => q.id === S.owner[next]);
      // following: the tile is held by a walker mid-step leaving it, it frees within half a step; not a block (for up to 0.5 s)
      if (o && o.moving && o.from === next) { if (w.follow0 == null) w.follow0 = S.t; if (S.t - w.follow0 < 0.5) return; }
      w.follow0 = null;
      if (o && !o.moving && o.path[0] === w.at && w.id < o.id) {   // head-on: the lower id steps aside to its right, or waits
        if (sidestep(w, claimed, 'right')) { lg(w, 'headon-sidestep', `yields to ${o.id}`); plan(w, true); return; }
        if (!w.blk || !w.blk.headon) lg(w, 'headon-wait', `right tile taken, waits for ${o.id}`);
      }
      if (!w.blk) w.blk = { t0: S.t, fails: 0, replanned: false };
      if (!S.want[next] || S.want[next].t0 > w.blk.t0 || !S.walkers.some(q => q.id === S.want[next].id && q.path[0] === next && !q.moving)) S.want[next] = { id: w.id, t0: w.blk.t0 };
      // gridlock breaker: a ring of standing walkers each waiting on the next (3 or more; two are a head-on) never clears by
      // waiting, so its lowest id steps to any free lane tile (right first) and re-plans; logged as 'gridlock'
      if (o) {
        const ring = [w]; let cur = o;
        for (let i = 0; i < 40 && cur && !cur.moving && !cur.inside && cur.path[0] && !ring.includes(cur); i++) { ring.push(cur); cur = S.walkers.find(q => q.id === S.owner[cur.path[0]]); }
        if (cur === w && ring.length >= 3 && Math.min(...ring.map(q => q.id)) === w.id) {
          for (const m of ring.slice().sort((p, q) => p.id - q.id)) { const b0 = m.blk; if (sidestep(m, claimed, 'any')) { lg(m, 'gridlock', `ring of ${ring.length} (${ring.map(q => q.id).join('>')}): steps aside`); plan(m, true); m.blk = b0; return; } }
        }
      }
      w.blk.fails++; if (o && !o.moving && o.path[0] === w.at) w.blk.headon = true;
      if (w.blk.fails > SIDESTEP_AFTER && !w.blk.stepped) { const b0 = w.blk; if (sidestep(w, claimed)) { b0.stepped = true; lg(w, 'sidestep', `after ${b0.fails - 1} failed tries at ${next}`); plan(w, true); w.blk = b0; return; } }
      w.retryAt = S.t + WAIT[0] + rnd() * (WAIT[1] - WAIT[0]); lg(w, 'wait', `${next} ${whyBlocked(w, next, claimed, qd, zw)}, retry in ${(w.retryAt - S.t).toFixed(2)}s`);
    }
  }
  window.WALK2X = { S, N, nodes, roadNodes, rows, cols, DOORS, SPOTS, PROPS, ROADS, FOOT, TILE, FPT, HZ, DOOR_CLEAR, errors, SEQ, tick, spawn, addWalker, setGoal, astar, footBox, ovl,
    run(n) { for (let i = 0; i < n; i++) tick(); }, at: (x, y) => { let b = null, d = 1e9; for (const n of roadNodes) { const e = Math.hypot(n.x - x, n.y - y); if (e < d) { d = e; b = n; } } return b.id; } };
})();
