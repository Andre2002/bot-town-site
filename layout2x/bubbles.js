// Live status, phase A4 (plan rev 3/4, approved by Andre 2026-10-29): speech bubbles, ?status=1 only.
//   one line, <=24 chars, 4s on / 8-20s off per bot, <=3 on screen, never overlapping (lower id wins; a check beats a line).
//   working: verb + short task title ("fixing walkers.js…"); idle: light chatter; sleeping: "Zzz"; finish: check icon.
//   No secrets, URLs or full prompts: task text is cut to its first clause, URLs/tokens/emails dropped, then clipped to 24.
// Replaces A3's code-drawn check glyph: a finished (or short) task shows the check bubble for CHECK_S (spots.js, 4s).
// Art: Frame's final icons (check + 6 task icons, 22x22) are copied as-is into ART; bubble box, tail and Zzz stay code placeholders.
// Pure scheduling + geometry (draw aside), so tests/bubbles.test.js runs it in node.
(function (root) {
  const ART = 'assets/town2x/ui/bubbles/';   // expected files: bubble_9s.png (9-slice, 8px corners), tail.png, icon_check.png, icon_zzz.png
  // art files present in ART (Frame's final icons, copied as-is 2026-10-30); only these are loaded, the rest stay code placeholders (no 404s)
  const HAS_ART = ['icon_check.png', 'icon_build.png', 'icon_write.png', 'icon_research.png', 'icon_design.png', 'icon_finance.png', 'icon_message.png'];
  const MAX_CHARS = 24, MAX_ON = 3, ON_S = 4, OFF_MIN = 8, OFF_MAX = 20;
  const FONT = 18, PAD = 8, H = 30, TAIL = 8, ICON = 22, GAP = 4;   // world px (98px figure)
  // task icons (Frame's spec, /workspace/proof/town-2x/a4_icons/sizes.md): 22x22 canvas, drawn 1:1 centred; icon-only bubble 38x30,
  // icon + text bubble = ICON + 4 + text + 2*PAD. Picked from the task words; none matched -> text only.
  const ICONS = ['build', 'write', 'research', 'design', 'finance', 'message'];
  const ICON_OF = [[/\b(fix|bug|patch|build|pr\b|pr #|code|deploy|walker|\.js)/i, 'build'], [/\b(write|copy|doc|post|blog|script)/i, 'write'], [/\b(research|find|scout|qa|test|review|audit)/i, 'research'],
    [/\b(art|design|image|gen|sprite|ui|clip|motion|walk cycle)/i, 'design'], [/\b(invoice|budget|finance|pay|cost|bill)/i, 'finance'], [/\b(mail|email|message|dm|slack|reply)/i, 'message']];
  const iconOf = task => { const s = safe(task); const m = ICON_OF.find(([r]) => r.test(s)); return m ? m[1] : null; };
  const CHAT = ['nice day!', 'coffee time', 'hmm…', 'hi there', 'what next?', 'lovely square', 'stretching legs'];
  const VERB = [[/\b(fix|bug|patch)/i, 'fixing'], [/\b(review|pr\b|pr #)/i, 'reviewing'], [/\b(qa|test|check)/i, 'testing'], [/\b(clip|video|motion|walk cycle)/i, 'animating'],
    [/\b(art|image|gen|sprite)/i, 'drawing'], [/\b(write|copy|post|doc)/i, 'writing'], [/\b(research|find|scout)/i, 'researching']];
  const hash = s => { let h = 2166136261; for (const c of String(s)) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return (h >>> 0) / 4294967296; };
  // task -> safe short title
  function safe(task) {
    let s = String(task || '').replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, ' ').replace(/<[^>]*>?/g, ' ').replace(/[<>]/g, ' ').split(/[\n;!?]|[.:](?=\s|$)|\s[-–—]\s/)[0];
    s = s.replace(/\bhttps?:\/\/\S+|\bwww\.\S+|\S+@\S+\.\S+/gi, '').replace(/\b(sk|pk|ghp|gho|xox[abp]|AKIA)[-_A-Za-z0-9]{6,}\b/g, '').replace(/\b[A-Za-z0-9_\-]{24,}\b/g, '');
    return s.replace(/\s+/g, ' ').trim();
  }
  const clip = s => s.length <= MAX_CHARS ? s : s.slice(0, MAX_CHARS - 1).replace(/\s+\S*$/, '') + '…';
  function line(b, t) {
    if (b.state === 'sleeping') return { kind: 'zzz', text: 'Zzz' };
    if (b.state === 'working') { const s = safe(b.task); if (!s) return { kind: 'text', text: 'working…' };
      const v = (VERB.find(([r]) => r.test(s)) || [0, 'on'])[1]; return { kind: 'text', icon: iconOf(b.task), text: clip(`${v} ${s.replace(/^(fix|review|qa|test|write|research|find|draw|gen|make|animate)\w*\s+/i, '')}…`.replace(/……$/, '…')) }; }
    const n = Math.floor(t / (ON_S + OFF_MAX)); return { kind: 'text', text: CHAT[Math.floor(hash(b.id + ':' + n) * CHAT.length)] };
  }
  // is bot b's line bubble on at sim time t? Each cycle: ON_S on, then a per-bot, per-cycle 8-20s off. Phase seeded by id.
  function cycleOn(id, t) {
    let at = -hash(id) * (ON_S + OFF_MAX), k = 0;
    if (t < at) return false;
    // walk cycles (bounded: t in sim seconds; a cycle is >= 12s)
    const len = c => ON_S + OFF_MIN + hash(id + '#' + c) * (OFF_MAX - OFF_MIN);
    const skip = Math.max(0, Math.floor((t - at) / (ON_S + OFF_MAX)) - 1);   // jump close, then step (deterministic either way)
    for (; k < skip; k++) at += len(k);
    while (at + len(k) <= t) at += len(k++);
    return t - at < ON_S;
  }
  // the bubble rect for bot b (feet x,y; label rect b.lab) with content c; measure(text, F) -> px
  function rect(b, c, measure) {
    const w = c.kind === 'text' ? Math.ceil(measure(c.text, FONT)) + PAD * 2 + (c.icon ? ICON + 4 : 0) : ICON + PAD * 2;   // icon only: 38x30
    const head = b.y - 98, labTop = b.lab && b.lab.side === 'above' ? b.lab.y : head;
    const bottom = Math.min(head, labTop) - GAP - TAIL;
    return { x: Math.round(b.x - w / 2), y: Math.round(bottom - H), w, h: H, tx: b.x, ty: Math.min(head, labTop) - GAP };
  }
  const hit = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  // bots: [{id, x, y, state, task, check, lab}] shown on screen; t: sim s; checkS: check duration; bounds {w,h}
  // -> [{id, kind, text, x, y, w, h, tx, ty, alpha}] at most MAX_ON, none overlapping each other
  function pick(bots, t, measure, opts) {
    const o = opts || {}, CS = o.checkS || 4, cand = [];
    const AV = (o.avoid || []).concat(bots.filter(b => b.lab).map(b => b.lab));   // keep-out rects + every bot's name label (#158 QA)
    for (const b of bots) {
      const k = b.check != null ? t - b.check : -1;
      if (k >= 0 && k < CS) { cand.push({ b, c: { kind: 'check', text: '✓' }, pri: 0, alpha: Math.min(1, (CS - k) / 0.5, k / 0.15 + 0.2) }); continue; }
      if (cycleOn(b.id, t)) cand.push({ b, c: line(b, t), pri: 1, alpha: 1 });
    }
    cand.sort((p, q) => p.pri - q.pri || (p.b.id < q.b.id ? -1 : p.b.id > q.b.id ? 1 : 0));
    const out = [];
    for (const x of cand) { if (out.length >= MAX_ON) break;
      let r = rect(x.b, x.c, measure); if (o.bounds) r.x = Math.max(0, Math.min(o.bounds.w - r.w, r.x));
      if (r.y < 0) continue;
      if (out.some(p => hit(p, r)) || AV.some(a => hit(a, r))) continue;
      out.push(Object.assign(r, { id: x.b.id, kind: x.c.kind, icon: x.c.icon || null, text: x.c.text, alpha: x.alpha })); }
    return out;
  }
  const ok = i => i && i.complete && i.naturalWidth;
  // draw one bubble. art: { box, tail, check, zzz } Image objects, any missing -> code placeholder
  function draw(g, u, art) {
    const A = art || {}; g.save(); g.globalAlpha = u.alpha;
    if (ok(A.box)) { const s = 8, i = A.box, W = i.naturalWidth, Hh = i.naturalHeight;   // 9-slice, corners kept native
      const P = [[0, s, u.x, u.w ? s : 0], [s, W - 2 * s, u.x + s, u.w - 2 * s], [W - s, s, u.x + u.w - s, s]], Q = [[0, s, u.y, s], [s, Hh - 2 * s, u.y + s, u.h - 2 * s], [Hh - s, s, u.y + u.h - s, s]];
      for (const [sx, sw, dx, dw] of P) for (const [sy, sh, dy, dh] of Q) g.drawImage(i, sx, sy, sw, sh, dx, dy, dw, dh); }
    else { g.fillStyle = '#fffdf5'; g.strokeStyle = '#2a2a2a'; g.lineWidth = 2; g.beginPath(); g.roundRect(u.x + 1, u.y + 1, u.w - 2, u.h - 2, 8); g.fill(); g.stroke(); }
    if (ok(A.tail)) g.drawImage(A.tail, Math.round(u.tx - A.tail.naturalWidth / 2), u.y + u.h - 2);
    else { g.fillStyle = '#fffdf5'; g.strokeStyle = '#2a2a2a'; g.lineWidth = 2; g.beginPath(); g.moveTo(u.tx - 6, u.y + u.h - 2); g.lineTo(u.tx, u.ty); g.lineTo(u.tx + 6, u.y + u.h - 2); g.fill(); g.stroke();
      g.fillRect(u.tx - 5, u.y + u.h - 4, 10, 3); }
    const cx = u.x + u.w / 2, cy = u.y + u.h / 2;
    if (u.kind === 'check') { if (ok(A.check)) g.drawImage(A.check, Math.round(cx - A.check.naturalWidth / 2), Math.round(cy - A.check.naturalHeight / 2));
      else { g.strokeStyle = '#2e9e4f'; g.lineWidth = 4; g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath(); g.moveTo(cx - 8, cy); g.lineTo(cx - 2, cy + 6); g.lineTo(cx + 9, cy - 7); g.stroke(); } }
    else if (u.kind === 'zzz' && ok(A.zzz)) g.drawImage(A.zzz, Math.round(cx - A.zzz.naturalWidth / 2), Math.round(cy - A.zzz.naturalHeight / 2));
    else { let tx = cx;
      if (u.icon) { const ix = u.x + PAD, iy = Math.round(cy - ICON / 2), im = (A.icons || {})[u.icon]; tx = cx + (ICON + 4) / 2;
        if (ok(im)) g.drawImage(im, ix + Math.round((ICON - im.naturalWidth) / 2), iy + Math.round((ICON - im.naturalHeight) / 2));
        else placeholderIcon(g, u.icon, ix, iy); }
      g.fillStyle = u.kind === 'zzz' ? '#6b5b95' : '#222'; g.font = `bold ${FONT}px sans-serif`; g.textBaseline = 'middle'; g.textAlign = 'center'; g.fillText(u.text, tx, cy + 1); }
    g.restore();
  }
  // code placeholder for a task icon (22x22 box, a coloured tile with a 1-letter mark), until Frame's icon_<name>.png lands
  const PH = { build: ['#8a8f98', 'B'], write: ['#d9c38a', 'W'], research: ['#5b8fd6', 'R'], design: ['#c0559b', 'D'], finance: ['#d4a72c', '$'], message: ['#e07a3a', 'M'] };
  function placeholderIcon(g, n, x, y) { const [c, t] = PH[n] || ['#999', '?']; g.fillStyle = c; g.strokeStyle = '#2a2a2a'; g.lineWidth = 1;
    g.fillRect(x + 1, y + 1, ICON - 2, ICON - 2); g.strokeRect(x + 1.5, y + 1.5, ICON - 3, ICON - 3); g.fillStyle = '#fff'; g.font = 'bold 14px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(t, x + ICON / 2, y + ICON / 2 + 1); }
  const API = { ART, ICONS, iconOf, PAD, HAS_ART, MAX_CHARS, MAX_ON, ON_S, OFF_MIN, OFF_MAX, FONT, H, TAIL, ICON, CHAT, safe, clip, line, cycleOn, rect, hit, pick, draw };
  if (typeof module !== 'undefined' && module.exports) module.exports = API; else root.BOT_BUBBLES = API;
})(typeof window !== 'undefined' ? window : globalThis);
