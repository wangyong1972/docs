// deck-kit.cjs — shared visual system for the three paper decks.
// One coherent design: navy/slate "midnight" base, one cool accent per deck,
// Cambria display headings + Calibri body (both ship with Office and render
// true-to-width in LibreOffice QA). 16:9 = LAYOUT_WIDE (13.333" x 7.5").
//
// Usage: const kit = require('../../_shared/deck-kit.cjs')

const W = 13.333;   // slide width (inches)
const H = 7.5;      // slide height
const M = 0.55;     // outer margin

const NAVY  = '14273F';   // dominant dark
const INK   = '1B2433';   // near-black text on light
const SLATE = '3A4A63';
const MUTED = '5B6B84';
const PAPER = 'FFFFFF';
const PANEL = 'F3F6FB';
const HAIR  = 'DDE5F0';
const GOOD  = '2E8B57';

const ACCENTS = {
  'data-juicer': '149A9A',
  'dolma':       '3E6FCC',
  'datacomp-lm': '6B5BD6',
};

const HEAD = 'Cambria';
const BODY = 'Calibri';

const h = (hex) => hex;

// Dark title/section/end background (with a subtle corner orb, not a stripe).
function darkBg(slide) {
  slide.background = { color: h(NAVY) };
  slide.addShape('ellipse', { x: W - 1.95, y: -0.95, w: 2.7, h: 2.7, fill: { color: h('162A45') }, line: { color: h('2C4568'), width: 1.25 } });
  slide.addShape('ellipse', { x: W - 1.4, y: -0.4, w: 1.05, h: 1.05, fill: { color: h('1E3660') }, line: { color: h('2C4568'), width: 1 } });
}

// Light content slide: kicker + title + optional subtitle + hairline.
function contentHeader(slide, accent, tag, title, subtitle) {
  slide.background = { color: h(PAPER) };
  slide.addText(tag.toUpperCase(), { x: M, y: 0.34, w: 3.2, h: 0.3, fontFace: BODY, fontSize: 11, bold: true, color: h(accent), charSpacing: 2, valign: 'middle' });
  slide.addText(title, { x: M, y: 0.6, w: W - 2 * M, h: 0.85, fontFace: HEAD, fontSize: 27, bold: true, color: h(NAVY), valign: 'top' });
  if (subtitle) {
    slide.addText(subtitle, { x: M, y: 1.36, w: W - 2 * M, h: 0.42, fontFace: BODY, fontSize: 12.5, color: h(MUTED), valign: 'top' });
  }
  slide.addShape('line', { x: M, y: 1.9, w: W - 2 * M, h: 0, line: { color: h(HAIR), width: 1 } });
}

function footer(slide, label, source) {
  slide.addText(`${label}   ·   ${source}`, { x: M, y: H - 0.4, w: W - 2 * M, h: 0.28, fontFace: BODY, fontSize: 8.5, color: h(MUTED), align: 'right', valign: 'middle' });
}

function badge(slide, accent, { x, y, n, d = 0.52 }) {
  slide.addShape('ellipse', { x, y, w: d, h: d, fill: { color: h(accent) }, line: { color: h(accent) } });
  slide.addText(String(n), { x, y, w: d, h: d, fontFace: HEAD, fontSize: 14, bold: true, color: h(PAPER), align: 'center', valign: 'middle', charSpacing: 0 });
}

function card(slide, opts) {
  const { x, y, w, h: hh, fill = PANEL, line = HAIR, title, body, titleColor = NAVY, bodyColor = INK, titleSize = 13.5, bodySize = 11.5 } = opts;
  slide.addShape('roundRect', { x, y, w, h: hh, rectRadius: 0.06, fill: { color: h(fill) }, line: { color: h(line), width: 1 } });
  let ty = y + 0.14;
  if (title) {
    slide.addText(title, { x: x + 0.16, y: ty, w: w - 0.32, h: 0.34, fontFace: BODY, fontSize: titleSize, bold: true, color: h(titleColor), valign: 'top' });
    ty += 0.36;
  }
  if (body) {
    slide.addText(body, { x: x + 0.16, y: ty, w: w - 0.32, h: hh - (ty - y) - 0.12, fontFace: BODY, fontSize: bodySize, color: h(bodyColor), valign: 'top', lineSpacingMultiple: 1.02 });
  }
}

function stat(slide, accent, { x, y, w, value, caption, valueSize = 29 }) {
  slide.addText(value, { x, y, w, h: 0.66, fontFace: HEAD, fontSize: valueSize, bold: true, color: h(accent), valign: 'top' });
  slide.addText(caption, { x, y: y + 0.66, w, h: 0.72, fontFace: BODY, fontSize: 10.5, color: h(MUTED), valign: 'top', lineSpacingMultiple: 1.0 });
}

// Native PowerPoint table (safe; only addChart has the corruption footguns).
// rows: [[ {text, opts}, ... ], ...]; opts per cell: {bold, fill, color, align, fontSize}
function tab(slide, { x, y, w, colW, rows, baseSize = 11, rowH = 0.34, accent }) {
  const tableRows = rows.map((r) =>
    r.map((c) => {
      const cell = typeof c === 'string' ? { text: c } : { text: c.text, options: c.options || {} };
      const o = cell.options;
      return {
        text: cell.text,
        options: {
          fontFace: BODY,
          fontSize: o && o.fontSize ? o.fontSize : baseSize,
          color: h((o && o.color) || INK),
          bold: !!(o && o.bold),
          fill: { color: h((o && o.fill) || PAPER) },
          align: (o && o.align) || 'left',
          valign: 'middle',
          border: { type: 'none' },
        },
      };
    })
  );
  slide.addTable(tableRows, { x, y, w, colW, rowH, border: { type: 'none' }, valign: 'middle', margin: 0.05 });
}

module.exports = { W, H, M, NAVY, INK, SLATE, MUTED, PAPER, PANEL, HAIR, GOOD, ACCENTS, HEAD, BODY, h, darkBg, contentHeader, footer, badge, card, stat, tab };