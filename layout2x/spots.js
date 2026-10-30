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
  const DEBOUNCE = 20, CHECK_S = 4;                       // A3: task-start debounce and check-mark time, sim seconds
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

  // A3 load seeding: the feed's since (ISO) says how long a task has run; under deb s it is still pending (the bot shows the
  // non-working mode for the clock and leaves after the rest of deb s of sim time). No or bad since: treated as long running.
  function seed(raw, since, nowMs, min, deb) {
    const p = since ? Date.parse(since) : NaN, age = Number.isFinite(p) ? Math.min(1e6, Math.max(0, (nowMs - p) / 1000)) : 1e6;
    return { age, mode: raw === 'working' && age < deb ? (band(min).id === 'night' ? 'sleeping' : 'idle') : raw };
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
    const BD = opts.board || null;   // A3 task board (board.js create()); null: no board loop (A2 behaviour)
    const SP = layoutSpots(T, ASSETS).concat(BD ? BD.STANDS.map(s => ({ ...s, via: { ...s.via } })) : []), BY = {}, KIND = {};
    for (const s of SP) {
      let r = null, d = 1e9; for (const n of W.roadNodes) { const e = Math.hypot(n.x - s.via.x, n.y - s.via.y); if (e < d) { d = e; r = n; } }
      const id = 'live:' + s.id, n = { id, x: s.x, y: s.y, cx: s.x, cy: s.y - 12, road: false, edges: [], tracks: [], live: s.id, roadNode: r.id };
      const link = (p, q) => { const l = Math.hypot(p.x - q.x, p.y - q.y); p.edges.push({ to: q.id, len: l, cost: 1, kind: 'approach' }); q.edges.push({ to: p.id, len: l, cost: 1, kind: 'approach' }); return l; };
      let len = 0, legs = [];
      if (s.path) {   // a walk-up through waypoints (A3 east board stand): road tile -> wp... -> stand, all legs off-road
        let p = r; s.wpNodes = s.path.map((q, i) => { const m = { id: id + ':wp' + i, wp: true, wpOf: id, x: q.x, y: q.y, cx: q.x, cy: q.y - 12, road: false, edges: [], tracks: [], live: s.id + ':wp', roadNode: r.id };
          W.N[m.id] = m; W.nodes.push(m); legs.push(link(p, m)); p = m; return m.id; }); legs.push(link(p, n)); len = legs.reduce((a, b) => a + b, 0);
      } else { len = link(r, n); legs = [len]; }
      W.N[id] = n; W.nodes.push(n); Object.assign(s, { node: id, road: r.id, len, legs }); BY[s.id] = s; (KIND[s.kind] = KIND[s.kind] || []).push(s);
      for (const p of W.PROPS) if (W.ovl(W.footBox(n.x, n.y), p.base)) errors.push(`spot ${s.id} overlaps prop ${p.id}`);
    }
    const QL = [];   // A3 board queue line, front first: off-road spots linked in a row, the back one to its road tile, the front one to both stands
    if (BD) { BD.QUEUE.forEach((q, i) => { const m = { id: 'live:' + q.id, wq: true, x: q.x, y: q.y, cx: q.x, cy: q.y - 12, road: false, edges: [], tracks: [], live: q.id };
        W.N[m.id] = m; W.nodes.push(m); QL.push({ ...q, node: m.id, legs: [] }); });
      const L2 = (p, q) => { const l = Math.hypot(p.x - q.x, p.y - q.y); p.edges.push({ to: q.id, len: l, cost: 1, kind: 'approach' }); q.edges.push({ to: p.id, len: l, cost: 1, kind: 'approach' }); return l; };
      let r = null, d = 1e9; for (const n of W.roadNodes) { const e = Math.hypot(n.x - BD.QUEUE_VIA.x, n.y - BD.QUEUE_VIA.y); if (e < d) { d = e; r = n; } }
      const back = QL[QL.length - 1]; back.road = r.id; back.legs.push(L2(r, W.N[back.node])); W.N[back.node].roadNode = r.id;
      for (let i = 0; i + 1 < QL.length; i++) QL[i + 1].legs.push(L2(W.N[QL[i + 1].node], W.N[QL[i].node]));
      for (const st of KIND.board || []) { st.fromQ = L2(W.N[QL[0].node], W.N[st.node]); }
      for (const q of QL) { BY[q.id] = q; (KIND.boardq = KIND.boardq || []).push(q); for (const p of W.PROPS) if (W.ovl(W.footBox(q.x, q.y), p.base)) errors.push(`spot ${q.id} overlaps prop ${p.id}`); }
      SP.push(...QL); }
    for (let i = 0; i < SP.length; i++) for (let j = i + 1; j < SP.length; j++) if (W.ovl(W.footBox(SP[i].x, SP[i].y), W.footBox(SP[j].x, SP[j].y))) errors.push(`spots ${SP[i].id} and ${SP[j].id} overlap`);
    const CLAIM = {};          // spot id -> bot id: claimed before setting off, released on leaving
    const freeSpots = k => (KIND[k] || []).filter(s => CLAIM[s.id] == null);
    const S = () => W.S;
    const bots = [];
    // A3 rules (Vega, 2026-10-30), timed on town sim time (W.S.t): a task start counts only once 'working' has held DEBOUNCE s
    // (a shorter task gets a check mark and no trip); a task end is not debounced, except that an idle blip under DEBOUNCE s
    // while the bot is at work is ignored (it keeps working and keeps its note). The feed's since only seeds this on load.
    if (BD) W.S.offClear = true;   // A3 only: off-road legs (stands, the line, walk-ups) keep clear of bodies (walkers.js)
    let lastT = null; const DEB = BD ? DEBOUNCE : 0, WAITQ = [], waits = [];   // WAITQ: bots waiting for a board stand, in arrival order; waits: seconds each waited
    function eff(w) {
      const raw = modeOf(w.bot.id), t = S().t;
      if (raw !== w.raw) { if (w.raw === 'working' && w.mode !== 'working' && t - w.rawT < DEB) w.check = t; w.raw = raw; w.rawT = t; }   // short task: check mark only
      if (raw === 'working') return w.mode === 'working' || t - w.rawT >= DEB ? 'working' : w.mode;
      if (w.mode !== 'working') return raw;
      const g = w.goal, atWork = g && g.live === 'work' && w.at === g.node && !w.moving;
      return atWork && t - w.rawT < DEB ? 'working' : raw;   // on the way: cuts back now; at work: blips under DEB are ignored
    }
    function release(w) { for (const k of Object.keys(CLAIM)) if (CLAIM[k] === w.bot.id) delete CLAIM[k]; }
    // the brain: the walkers engine asks it for a goal whenever the bot needs one (arrived and stayed, blocked too long, woke up)
    function brain(w) {
      const min = opts.clock(), mode = w.mode, b = w.bot;
      if (BD) {   // A3: arrived at the board (and stayed PIN_S): pin when working, take the note off otherwise
        const g = w.goal, here = g && g.live === 'board' && w.at === g.node && !w.moving;
        if (here) { if (mode === 'working') BD.pin(b.id, S().t); else if (BD.unpin(b.id, S().t)) w.check = S().t; }
        const want = mode === 'working' ? !BD.has(b.id) : BD.has(b.id);   // working without a note: pin first; done with a note: clear first
        const qi = WAITQ.indexOf(b.id); if (!want && qi >= 0) WAITQ.splice(qi, 1);
        const act = mode === 'working' ? 'pin' : 'clear', toStand = st => ({ kind: 'spot', node: st.node, stay: BD.PIN_S, live: 'board', spot: st.id, act });
        const mine = want && !here && (KIND.board || []).find(st => CLAIM[st.id] === b.id);   // re-asked on the way (blocked): keep its stand
        if (mine) return toStand(mine);
        const onStand = want && (KIND.board || []).find(st => w.at === st.node && !w.moving && (CLAIM[st.id] == null || CLAIM[st.id] === b.id));
        if (onStand) { CLAIM[onStand.id] = b.id; const i = WAITQ.indexOf(b.id); if (i >= 0) WAITQ.splice(i, 1); if (w.waitAcc != null) { waits.push({ bot: b.id, s: +w.waitAcc.toFixed(2) }); w.waitAcc = null; } return toStand(onStand); }   // already on a stand
        if (want) { w.dest = { kind: 'board' }; w.band = band(min).id; if (w.waitAcc == null) w.waitAcc = 0;
          const inLine = QL.findIndex(q => w.at === q.node && !w.moving), t = S().t;
          const held = QL.findIndex(q => CLAIM[q.id] === b.id);
          release(w);
          const atQ = i => ({ kind: 'spot', node: QL[i].node, stay: 0.25, live: 'board-q', spot: QL[i].id });
          if (inLine === 0) {   // at the front: step onto a free stand whose last bot has left it
            const busy = st => W.S.walkers.some(o => o !== w && (o.at === st.node || (o.moving && (o.from === st.node || (o.path || []).includes(st.node)))));
            const st = freeSpots('board').filter(x => !busy(x))[0];
            if (st) { CLAIM[st.id] = b.id; waits.push({ bot: b.id, s: +w.waitAcc.toFixed(2) }); w.waitAcc = null; return toStand(st); }
            CLAIM[QL[0].id] = b.id; return atQ(0); }
          if (inLine > 0) {   // shuffle up the line: the spot ahead is taken only by a bot already in the line (one still on its way
            // there from outside gives it up: it comes up behind and is re-placed when it is blocked)
            const ahead = QL[inLine - 1], inQ = id => QL.some(q => q.node === id), held = W.S.walkers.some(o => o !== w && ((o.at === ahead.node && !o.moving) || (o.moving && o.goal && o.goal.node === ahead.node && inQ(o.from))));
            const k = held ? inLine : inLine - 1; if (k < inLine && CLAIM[ahead.id] && CLAIM[ahead.id] !== b.id) delete CLAIM[ahead.id];
            CLAIM[QL[k].id] = b.id; return atQ(k); }
          if (held >= 0 && CLAIM[QL[held].id] == null) { CLAIM[QL[held].id] = b.id; return atQ(held); }   // still on its way to the back of the line
          // far off: walk to the line's road tile first and claim a place on arrival (a far bot holding a place would make
          // nearer bots wait behind an empty spot)
          const qr = W.N[QL[QL.length - 1].road], near = QL.some(q => q.node === w.at || q.node === w.from) || Math.hypot(w.x - qr.x, w.y - qr.y) <= 120;   // by the line, not just near it as the crow flies
          if (!near && !WAITQ.includes(b.id)) return { kind: 'road', node: qr.id, stay: 0, live: 'board-go' };
          // join the line at the free spot just behind the last claimed one (it walks up the line's spots to get there)
          for (let i = WAITQ.length - 1; i >= 0; i--) { const o = bots.find(x => x.bot.id === WAITQ[i]); if (!o || !o.goal || o.goal.live !== 'board-wait') WAITQ.splice(i, 1); }   // drop stale waiters
          let k = QL.length; while (k > 0 && CLAIM[QL[k - 1].id] == null) k--; const qi = WAITQ.indexOf(b.id);
          if (k < QL.length && (qi === 0 || (qi < 0 && !WAITQ.length))) { if (qi === 0) WAITQ.shift(); CLAIM[QL[k].id] = b.id; return atQ(k); }
          if (qi < 0) WAITQ.push(b.id);   // line full: wait (in arrival order) off the road, on the free square spot nearest the board
          const R = BD.RECT, dd = q => Math.hypot(q.x - R.x - R.w / 2, q.y - R.y - R.h), ws = freeSpots('square').sort((p, q) => dd(p) - dd(q))[0];
          if (ws) { CLAIM[ws.id] = b.id; return { kind: 'spot', node: ws.node, stay: 0.5, live: 'board-wait', spot: ws.id }; }
          return { kind: 'spot', node: w.at, stay: 1, live: 'board-wait' }; }
        if (w.waitAcc != null) w.waitAcc = null;
      }
      release(w);
      const d = destination(b, mode, min, freeSpots, rnd); w.dest = d; w.band = band(min).id;
      if (!d) { const n = W.roadNodes[Math.floor(rnd() * W.roadNodes.length)]; return { kind: 'road', node: n.id, stay: 5 + rnd() * 10 }; }
      if (d.door) { const D = W.DOORS[d.door]; if (!D) return null; return { kind: 'door', node: D.node, door: d.door, stay: d.kind === 'bed' ? Infinity : STAY[0] + rnd() * (STAY[1] - STAY[0]), live: d.kind }; }
      CLAIM[d.spot.id] = b.id;
      return { kind: 'spot', node: d.spot.node, stay: d.kind === 'work' ? Infinity : STAY[0] + rnd() * (STAY[1] - STAY[0]), live: d.kind, spot: d.spot.id };
    }
    const modeOf = id => { const m = opts.model().find(x => x.id === id); return m ? m.state : 'idle'; };
    function add(bot, at, id) {
      const w = W.addWalker(id, at, 'brisk', { kind: 'road', node: at, stay: 0 }); w.bot = bot; w.brain = brain;
      // seed the debounce from the feed's since (load only): a task under DEB s old is still pending; its remaining time runs on sim time
      const raw = modeOf(bot.id), row = opts.model().find(x => x.id === bot.id), now = opts.now ? opts.now() : Date.now();
      const sd = seed(raw, row && row.since, now, opts.clock(), DEB); w.raw = raw; w.rawT = S().t - sd.age; w.mode = sd.mode;
      if (BD && w.mode === 'working') BD.pin(bot.id, -10);   // the town opens settled: a bot already at work has its note up
      W.setGoal(w); bots.push(w); return w;
    }
    // put a bot straight at its first destination (page load only: the town opens settled)
    function settle(w) {
      const g = w.goal; if (!g) return;
      if (S().owner[w.at] === w.id) delete S().owner[w.at];
      const n = W.N[g.node]; w.at = g.node; w.x = n.x; w.y = n.y; w.path = []; w.until = S().t + g.stay;
      if (g.kind === 'door') w.inside = g.door; else S().owner[g.node] = w.id;
    }
    // once per tick before the engine: a changed state or idle band re-goals the bot at its next tile; asleep or working
    // indoors, the stay ends when the state changes (the bot comes out of the door, the zone permitting)
    function update() {
      const min = opts.clock(), bid = band(min).id;
      if (BD) { BD.update(S().t); const dt = S().t - (lastT == null ? S().t : lastT); lastT = S().t;   // waiting = standing still in the board line or a wait spot
        for (const w of bots) if (w.waitAcc != null && !w.moving && w.goal && /^board-(q|wait)$/.test(w.goal.live || '') && w.at === w.goal.node) w.waitAcc += dt; }
      for (const w of bots) {
        const m = eff(w), closed = w.mode === 'idle' && w.dest && !(['work', 'bed', 'board'].includes(w.dest.kind)) && !band(min).kinds.includes(w.dest.kind);
        if (m === w.mode && !closed) continue;
        // mid-step: the step finishes on its tile and the new route starts there (setGoal plans from w.at, the tile being
        // stepped onto). The engine starts the next step in the same tick it lands, so waiting for !moving only caught bots that
        // stood still (A3 fix). Inside a door zone or a crossing box the bot keeps its route until it is clear of them.
        if (w.moving && (w.zone || w.box)) continue;
        const was = w.mode; w.mode = m;
        if (w.inside) { w.until = 0; w.log = `${was}->${m}`; continue; }   // comes out next tick; the exit asks the brain
        w.until = 0; W.setGoal(w);
      }
    }
    return { spots: SP, BY, KIND, CLAIM, bots, errors, add, settle, update, brain, freeSpots, board: BD, WAITQ, waits, QL, DEBOUNCE: DEB, CHECK_S };
  }

  const API = { DEBOUNCE, CHECK_S, seed, OUTDOOR, INDOOR, WEIGHT, STAY, band, parkOpen, pickKind, destination, layoutSpots, install };
  if (typeof module !== 'undefined' && module.exports) module.exports = API; else root.BOT_SPOTS = API;
})(typeof window !== 'undefined' ? window : globalThis);
