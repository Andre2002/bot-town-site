// Board click panel (plan v2, /workspace/proof/town-2x/plans/board_click_plan.md, approved by Andre 2026-10-31 with changes): ?status=1 only.
// Click/tap the map board (board.js RECT) -> a read-only panel over the dimmed town. Desktop: closeup.png at 3x (642x435), up to 8 cards
// 108x84 on the 4x2 grid (pitch 144x132), name 16 bold + task 14/16 on 2 lines max (word wrap, grapheme break for long words, '…' on
// overflow), no state line, no slip. Under 700px wide: a 343px bottom sheet, cards 343x64. Card text = the feed's cleanTask output.
// Fonts end in colour-emoji families so emoji draw as real glyphs. Pure layout here (tests/boardview.test.js); drawing takes a 2d context.
(function (root) {
  const EMOJI = "'Apple Color Emoji','Segoe UI Emoji','Noto Color Emoji'";
  const FONT = { title: `bold 18px sans-serif, ${EMOJI}`, name: `bold 16px sans-serif, ${EMOJI}`, body: `14px sans-serif, ${EMOJI}`, wait: `bold 14px sans-serif, ${EMOJI}` };
  const MAX_CARDS = 8, LINES = 2, LH = 16, ELL = '…';
  const ART = 'assets/taskboard/closeup.png', SCALE = 3;
  const PANEL = { w: 642, h: 435 }, CORK = { x: 30, y: 72, w: 582, h: 273 }, PLATE = { x: 198, y: 36, w: 249, h: 24 };
  const CARD = { w: 108, h: 84, pad: 6, top: 12, nameH: 18, gap: 6 };   // 12 + 18 + 6 + 2x16 + 16 = 84
  const PITCH = { x: 144, y: 132 };
  const GRID0 = { x: CORK.x + Math.round((CORK.w - (3 * PITCH.x + CARD.w)) / 2), y: CORK.y + Math.round((CORK.h - (PITCH.y + CARD.h)) / 2) };
  const SHEET = { w: 343, bar: 44, card: { w: 343, h: 64, pad: 10, top: 6, nameH: 18, gap: 2 }, gapY: 8, maxVh: 0.7, breakpoint: 700 };
  const SEG = typeof Intl !== 'undefined' && Intl.Segmenter ? new Intl.Segmenter() : null;
  const graphemes = s => SEG ? Array.from(SEG.segment(s), x => x.segment) : Array.from(s);

  // text -> at most `lines` lines that each measure <= maxW. Wraps at spaces; a word wider than maxW breaks by grapheme;
  // if anything is left over, the last line is shortened until it fits with a trailing '…'.
  function wrap(text, maxW, measure, lines = LINES) {
    const out = []; const words = String(text || '').split(' ').filter(Boolean); let i = 0, cut = false;
    while (i < words.length) {
      if (out.length === lines) { cut = true; break; }
      let line = '';
      while (i < words.length) {
        const w = words[i], cand = line ? line + ' ' + w : w;
        if (measure(cand) <= maxW) { line = cand; i++; continue; }
        if (!line) {   // a single word wider than the line: break it by grapheme
          const g = graphemes(w); let k = 0, part = '';
          while (k < g.length && measure(part + g[k]) <= maxW) part += g[k++];
          if (!k) { part = g[0]; k = 1; }
          line = part; words[i] = g.slice(k).join('');
        }
        break;
      }
      out.push(line);
    }
    if (cut && out.length) {
      let g = graphemes(out[out.length - 1]);
      while (g.length && measure(g.join('').replace(/\s+$/, '') + ELL) > maxW) g.pop();
      out[out.length - 1] = g.join('').replace(/\s+$/, '') + ELL;
    }
    return out;
  }
  // status model + board state -> cards: working bots in board slot order, then the rest in roster order; max 8 (the rest are not shown: there is no waiting state)
  function cards(model, board) {
    const working = (model || []).filter(b => b.state === 'working');
    const slotIx = id => { if (!board) return -1; const i = board.slots.findIndex(n => n && n.bot === id && n.out == null); return i; };
    const order = working.map((b, r) => ({ b, k: slotIx(b.id) >= 0 ? slotIx(b.id) : 100 + r })).sort((a, z) => a.k - z.k).map(x => x.b);
    return { cards: order.slice(0, MAX_CARDS).map(b => ({ id: b.id, name: b.name, task: b.task || '' })) };
  }
  const isSheet = vw => vw < SHEET.breakpoint;
  // card rects, panel-local: desktop grid (4x2) or sheet list
  function cardRects(n, sheet) {
    const r = [];
    for (let i = 0; i < Math.min(n, MAX_CARDS); i++) r.push(sheet ? { x: 0, y: SHEET.bar + SHEET.gapY + i * (SHEET.card.h + SHEET.gapY), w: SHEET.card.w, h: SHEET.card.h }
      : { x: GRID0.x + (i % 4) * PITCH.x, y: GRID0.y + Math.floor(i / 4) * PITCH.y, w: CARD.w, h: CARD.h });
    return r;
  }
  const slotRects = () => { const r = []; for (let i = 0; i < MAX_CARDS; i++) r.push({ x: GRID0.x + (i % 4) * PITCH.x, y: GRID0.y + Math.floor(i / 4) * PITCH.y, w: CARD.w, h: CARD.h }); return r; };
  const sheetHeight = (n, vh) => Math.min(Math.round(vh * SHEET.maxVh), SHEET.bar + SHEET.gapY + Math.max(1, n) * (SHEET.card.h + SHEET.gapY));
  // a card's text layout (panel-local), with the measure function of a context set to each font
  function cardText(c, rect, sheet, measureWith) {
    const C = sheet ? SHEET.card : CARD, maxW = rect.w - 2 * C.pad;
    const name = wrap(c.name, maxW, measureWith(FONT.name), 1)[0] || '';
    const body = wrap(c.task, maxW, measureWith(FONT.body), LINES);
    return { name: { text: name, x: rect.x + C.pad, y: rect.y + C.top }, body: body.map((t, i) => ({ text: t, x: rect.x + C.pad, y: rect.y + C.top + C.nameH + C.gap + i * LH })), maxW };
  }
  const measurer = g => font => s => { g.font = font; return g.measureText(s).width; };
  function pin(g, x, y) { g.fillStyle = '#7a1f1f'; g.beginPath(); g.arc(x, y, 5, 0, 7); g.fill(); g.fillStyle = '#e06a5a'; g.beginPath(); g.arc(x - 1.5, y - 1.5, 2, 0, 7); g.fill(); }
  function drawCard(g, c, rect, sheet) {
    g.fillStyle = sheet ? '#f3e6c4' : '#f6ecd0'; g.fillRect(rect.x, rect.y, rect.w, rect.h);
    g.strokeStyle = '#8a6a3a'; g.lineWidth = 2; g.strokeRect(rect.x + 1, rect.y + 1, rect.w - 2, rect.h - 2);
    if (!sheet) pin(g, rect.x + rect.w / 2, rect.y + 5);
    const L = cardText(c, rect, sheet, measurer(g)); g.textBaseline = 'top'; g.fillStyle = '#2b1a0e';
    g.font = FONT.name; g.fillText(L.name.text, L.name.x, L.name.y + 1);
    g.font = FONT.body; g.fillStyle = '#3d2a18'; for (const l of L.body) g.fillText(l.text, l.x, l.y + 1);
    return L;
  }
  // desktop panel onto a 642x435 context; art = loaded closeup.png (or null -> plain wood). Returns the card layouts.
  function drawPanel(g, data, art) {
    g.clearRect(0, 0, PANEL.w, PANEL.h); g.imageSmoothingEnabled = false;
    if (art && art.complete && art.naturalWidth) g.drawImage(art, 0, 0, art.naturalWidth * SCALE, art.naturalHeight * SCALE);
    else { g.fillStyle = '#996242'; g.fillRect(0, 0, PANEL.w, PANEL.h); g.fillStyle = '#c3a87c'; g.fillRect(CORK.x, CORK.y, CORK.w, CORK.h); }
    g.textBaseline = 'middle'; g.font = FONT.title; g.fillStyle = '#3d2517';
    const tw = g.measureText('Task Board').width; g.fillText('Task Board', PLATE.x + (PLATE.w - tw) / 2, PLATE.y + PLATE.h / 2 + 1);
    const rects = cardRects(data.cards.length, false);
    slotRects().forEach((s, i) => { if (i >= data.cards.length) pin(g, s.x + s.w / 2, s.y + 5); });
    return data.cards.map((c, i) => Object.assign({ rect: rects[i] }, drawCard(g, c, rects[i], false)));
  }
  // mobile sheet onto a 343 x h context
  function drawSheet(g, data, h) {
    g.clearRect(0, 0, SHEET.w, h); g.fillStyle = '#5a3a22'; g.fillRect(0, 0, SHEET.w, h);
    g.fillStyle = '#3d2517'; g.fillRect(0, 0, SHEET.w, SHEET.bar);
    g.textBaseline = 'middle'; g.font = FONT.title; g.fillStyle = '#f6ecd0'; g.fillText('Task Board', 12, SHEET.bar / 2 + 1);
    if (!data.cards.length) { g.font = FONT.body; g.fillStyle = '#e2bc7e'; g.textBaseline = 'top'; g.fillText('No one is working right now', 12, SHEET.bar + 20); return []; }
    const rects = cardRects(data.cards.length, true);
    return data.cards.map((c, i) => Object.assign({ rect: rects[i] }, drawCard(g, c, rects[i], true)));
  }
  const API = { EMOJI, FONT, MAX_CARDS, LINES, LH, ART, SCALE, PANEL, CORK, PLATE, CARD, PITCH, GRID0, SHEET, graphemes, wrap, cards, isSheet, cardRects, slotRects, sheetHeight, cardText, measurer, drawPanel, drawSheet };
  if (typeof module !== 'undefined' && module.exports) module.exports = API; else root.BOT_BOARDVIEW = API;
})(typeof window !== 'undefined' ? window : globalThis);
