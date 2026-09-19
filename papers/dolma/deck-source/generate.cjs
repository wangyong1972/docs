// generate.cjs — Dolma deck (English, 16:9, editable .pptx).
// Run: NODE_PATH=/tmp/pptx-tools/node_modules node deck-source/generate.cjs
const PptxGenJS = require('pptxgenjs');
const K = require('../../_shared/deck-kit.cjs');

const A = K.ACCENTS['dolma'];
const SRC = 'aclanthology.org/2024.acl-long.840 · arxiv 2402.00159 · github.com/allenai/dolma';
const LABEL = 'Dolma';

const pptx = new PptxGenJS();
pptx.layout = 'LAYOUT_WIDE';
pptx.author = 'wangyong1972';
pptx.title = 'Dolma — 3T-token open corpus architecture';

function add(notes) { const s = pptx.addSlide(); if (notes) s.addNotes(notes); return s; }
function bullets(s, arr, x, y, w, h, size = 13) {
  s.addText(arr.map((t) => ({ text: t, options: { bullet: { code: '25AA' }, breakLine: true } })), { x, y, w, h, fontFace: K.BODY, fontSize: size, color: K.h(K.INK), lineSpacingMultiple: 1.05, paraSpaceAfter: 9, valign: 'top' });
}

// 1 — title
{
  const s = pptx.addSlide();
  K.darkBg(s);
  s.addText('OPEN PRETRAINING CORPUS', { x: K.M, y: 1.25, w: 7.5, h: 0.35, fontFace: K.BODY, fontSize: 12, bold: true, color: K.h(A), charSpacing: 3 });
  s.addText('Dolma', { x: K.M, y: 1.62, w: 10, h: 1.0, fontFace: K.HEAD, fontSize: 52, bold: true, color: K.h(K.PAPER) });
  s.addText('Three trillion tokens, built as documents + attributes, then filtered at mix time.', { x: K.M, y: 2.66, w: 11, h: 0.6, fontFace: K.BODY, fontSize: 17, color: 'C9D6E8', italic: true });
  s.addText('ACL 2024 · Best Resource Paper Award', { x: K.M, y: 3.4, w: 8, h: 0.4, fontFace: K.BODY, fontSize: 14, bold: true, color: '9FB6D4' });
  const pills = ['3.06T tokens · 4.37B docs', 'Bloom-filter dedup (not MinHash)', 'Signals stored, policy applied late', 'Trains OLMo'];
  let px = K.M;
  pills.forEach((p) => {
    const pw = p.length * 0.078 + 0.5;
    s.addShape('roundRect', { x: px, y: 4.35, w: pw, h: 0.42, rectRadius: 0.2, fill: { color: K.h('1E3660') }, line: { color: K.h('355275'), width: 1 } });
    s.addText(p, { x: px, y: 4.35, w: pw, h: 0.42, fontFace: K.BODY, fontSize: 11, color: 'D6E2F2', align: 'center', valign: 'middle' });
    px += pw + 0.16;
  });
  s.addText('Architecture review · English · 14 slides', { x: K.M, y: 6.7, w: 6, h: 0.3, fontFace: K.BODY, fontSize: 10.5, color: '7E93B3' });
}

// 2 — motivation
{
  const s = add('Motivation: scale + openness + reproducibility; contrast C4/Pile/RedPajama; licensing constraints drive source choices.');
  K.contentHeader(s, A, 'Motivation', 'A corpus that is both large and reproducible', 'Prior good corpora were either small (C4 175B, The Pile 387B) or lightly-curated CC (RedPajama v2); closed models hide data + process.');
  const cols = [
    ['Scale with diversity', '3.06T tokens across web, code, social, academic, books, encyclopedic — six source families.'],
    ['Openness as a constraint', 'ODC-BY data + Apache-2.0 toolkit; Books3 deliberately avoided for licensing.'],
    ['Reproducible pipeline', 'Every step (linearize → tag → dedup → mix → tokenize) parameterized and replayable.'],
  ];
  const cw = (K.W - 2 * K.M - 0.6) / 3;
  cols.forEach((c, i) => {
    K.card(s, { x: K.M + i * (cw + 0.3), y: 2.3, w: cw, h: 2.5, title: c[0], body: c[1], titleSize: 13, bodySize: 11.5 });
  });
  s.addText('Built primarily to train OLMo: data policy is chosen by model ablations, and the model is the evidence for the data.', { x: K.M, y: 5.4, w: K.W - 2 * K.M, h: 0.5, fontFace: K.BODY, fontSize: 12.5, color: K.h(K.MUTED), italic: true });
  K.footer(s, LABEL, SRC);
}

// 3 — overview
{
  const s = add('Overview: corpus (3.06T) + toolkit (dolma CLI) + OLMo. Source table per paper Table 1.');
  K.contentHeader(s, A, 'Methodology overview', 'Corpus · toolkit · model, as one artifact set', 'The paper treats the corpus, the pipeline, and the trained model as a single released system.');
  const rows = [
    [ { text: 'Source', options: { bold: true, fill: A, color: 'FFFFFF' } }, { text: 'Type', options: { bold: true, fill: A, color: 'FFFFFF' } }, { text: 'Llama tokens', options: { bold: true, fill: A, color: 'FFFFFF' } }, { text: '%', options: { bold: true, fill: A, color: 'FFFFFF' } } ],
    [ 'Common Crawl', 'web pages (25 snapshots 2020-05→2023-06)', '2,479B', '81.0' ],
    [ 'The Stack', 'code', '411B', '13.4' ],
    [ 'Reddit', 'social (Pushshift)', '89B', '2.9' ],
    [ 'peS2o', 'academic (S2)', '70B', '2.3' ],
    [ 'Gutenberg / Wiki', 'books / encyclopedic', '10.3B', '0.35' ],
  ];
  K.tab(s, { x: K.M, y: 2.15, w: K.W - 2 * K.M, colW: [2.4, 5.4, 2.3, 2.1], rows, rowH: 0.44, baseSize: 11 });
  const stats = [['3,059B', 'Llama tokens (the "three trillion")'], ['4,367M', 'documents'], ['11.5 TB', 'final size (200 TB raw in)']];
  let sx = K.M;
  stats.forEach((st) => { K.stat(s, A, { x: sx, y: 5.45, w: 3.3, value: st[0], caption: st[1], valueSize: 26 }); sx += 4.0; });
  K.footer(s, LABEL, SRC);
}

// 4 — core abstractions
{
  const s = add('Documents {id,text,source,...} + detached attributes {source,id,attributes} with [start,end,score] spans. Signal/policy separation is the centerpiece.');
  K.contentHeader(s, A, 'Core abstractions', 'Documents and attributes live apart', 'Store signals separately and threshold late — re-derive v1.5→v1.6→v1.7 from the same tagged data.');
  K.card(s, { x: K.M, y: 2.15, w: 6.0, h: 3.1, title: 'Document (one JSONL line)', body: '{ id, text, source, added, created, metadata }\n\nid must be stable across versions and unique per source — used to trace the source and maintain a blocklist. "Paragraph" = text ending in \\n.', bodySize: 11.5 });
  K.card(s, { x: K.M + 6.25, y: 2.15, w: 6.0, h: 3.1, title: 'Attributes (detached, same row order)', body: '{ source, id, attributes: {…} }\n\nSpan scores are [start, end, score] triples. Attribute files must line up exactly (row count + sort order) with documents.', bodySize: 11.5 });
  K.card(s, { x: K.M, y: 5.5, w: K.W - 2 * K.M, h: 1.2, title: 'Why it matters', body: '"We don’t want to duplicate multiple copies just because we updated the toxicity classifier" — tags are facts, thresholds are a later configuration. `dolma tag/dedupe` write attributes; `dolma mix` applies policy as JSONPath predicates.', bodySize: 12 });
  K.footer(s, LABEL, SRC);
}

// 5 — lifecycle
{
  const s = add('Lifecycle raw → linearize → tag → dedup → mix → tokenize. Dedup writes attributes only; mix applies filters via JSONPath.');
  K.contentHeader(s, A, 'Data lifecycle', 'Raw source → tagged → deduped → mixed → final', 'Dedup and mix are separate: dedup marks duplicates; mix drops them plus applies every other policy.');
  const steps = ['Raw sources\nCC WARC / Stack / Reddit…', 'Linearize\nchoose document split', 'Tag (dolma tag)\nlang · quality · toxicity · PII', 'Dedup (dolma dedupe)\nBloom: URL → doc → para', 'Mix (dolma mix)\nJSONPath filters + sampling', 'Tokenize\n.npy + id/src map'];
  const cw = (K.W - 2 * K.M) / 6;
  steps.forEach((t, i) => {
    const x = K.M + i * cw, y = 2.3;
    K.badge(s, A, { x: x + cw / 2 - 0.26, y, n: i + 1 });
    s.addText(t, { x: x + 0.03, y: y + 0.68, w: cw - 0.06, h: 1.15, fontFace: K.BODY, fontSize: 9.8, color: K.h(K.INK), align: 'center', valign: 'top' });
    if (i < 5) s.addShape('rightArrow', { x: x + cw - 0.15, y: y + 0.12, w: 0.22, h: 0.28, fill: { color: K.h(K.HAIR) }, line: { type: 'none' } });
  });
  K.card(s, { x: K.M, y: 4.35, w: K.W - 2 * K.M, h: 2.0, title: 'Signal is preserved, policy is deferred', body: 'Language / quality / toxicity / PII are computed as continuous scores (e.g. toxicity threshold is chosen at mix time). Decontamination reuses the same Bloom mechanism: seed the filter with eval examples, flag matches at mix → 0.003% removed.', bodySize: 12 });
  K.footer(s, LABEL, SRC);
}

// 6 — implementation
{
  const s = add('Dedup is exact-key Bloom (60B docs, 1e-6), NOT MinHash. Filters are JSONPath over attributes. Rust (rayon) + Python multiprocessing, no Spark/EMR.');
  K.contentHeader(s, A, 'Implementation', 'Bloom dedup, JSONPath policy, Rust+PyO3', 'The concrete mechanics that make the pipeline reproducible.');
  const cols = [
    ['Dedup (Bloom, 3 stages)', 'URL 53.2% → document 14.9% → paragraph 18.7%. exact keys; Bloom params 60B docs / 1e-6 FPR. MinHash appears only inherited from The Stack.', 'configs/dolma-v1_6/doc_dedupe/cc_en_head.yaml'],
    ['Policy = JSONPath in YAML', 'Filters select on attribute values, e.g. Word count < 50. Thresholds never live in code — that is what makes re-derivation cheap.', 'configs/dolma-v1_5/mixing/cc-head.yaml'],
    ['Rust core + Python CLI', 'deduper & mixer are Rust (rayon) wrapped in PyO3; taggers are Python multiprocessing. Paths are local or S3. processes: 188.', 'src/{deduper,mixer,bloom_filter}.rs'],
  ];
  const cw = (K.W - 2 * K.M - 0.6) / 3;
  cols.forEach((c, i) => {
    const x = K.M + i * (cw + 0.3);
    K.card(s, { x, y: 2.2, w: cw, h: 3.3, title: c[0], body: c[1], bodySize: 11.5 });
    s.addText(c[2], { x: x + 0.16, y: 5.1, w: cw - 0.32, h: 0.3, fontFace: K.BODY, fontSize: 9, color: K.h(A), italic: true });
  });
  K.footer(s, LABEL, SRC);
}

// 7 — scale & performance
{
  const s = add('Verified: 122 CPU-h/TB; 200TB on c6a.48xlarge in 5 days. Token counts per source (Table 1). v1..v1.7 releases.');
  K.contentHeader(s, A, 'Scale & performance', 'Cost discipline, counted in plannable units', '');
  const stats = [['122', 'CPU-hours per TB (toolkit)', 30], ['53.2%', 'of docs removed — URL dedup', 26], ['5 days', '200 TB raw · c6a.48xlarge', 26], ['84.2%', 'of CC filtered (CCNet)', 26]];
  const w4 = (K.W - 2 * K.M - 0.9) / 4;
  let sx = K.M, sy = 2.2;
  stats.forEach((st) => { K.stat(s, A, { x: sx, y: sy, w: w4, value: st[0], caption: st[1], valueSize: st[2] }); sx += w4 + 0.3; });
  const rows = [
    [ { text: 'Stage', options: { bold: true, fill: A, color: 'FFFFFF' } }, { text: 'Removal / result', options: { bold: true, fill: A, color: 'FFFFFF' } }, { text: 'Context', options: { bold: true, fill: A, color: 'FFFFFF' } } ],
    [ 'Language ID (fastText 0.5)', '61.7%', 'all sources' ],
    [ 'CCNet total', '84.2% → 27.7 TB', '175.1 TB in' ],
    [ 'URL / doc / paragraph dedup', '53.2% / 14.9% / 18.7%', 'exact-key Bloom' ],
    [ 'version v1 → v1.7', '6.0 → 4.5 TB', 're-derived from tags' ],
    [ 'trained-on vs full (v1.7)', '1,715B vs 2,308B tokens', 'different numbers — keep both' ],
  ];
  K.tab(s, { x: K.M, y: 3.25, w: K.W - 2 * K.M, colW: [3.4, 3.4, 5.4], rows, rowH: 0.37, baseSize: 10.5 });
  K.footer(s, LABEL, SRC);
}

// 8 — evaluation & findings
{
  const s = add('Ablations 1.2B/150B. Key: no prescribed mixture; in-domain saturates (~5% ≈ 24%); toxicity threshold deliberately loosened for scale.');
  K.contentHeader(s, A, 'Evaluation & findings', 'Evidence-backed data policy', '');
  const rows = [
    [ { text: 'Ablation', options: { bold: true, fill: A, color: 'FFFFFF' } }, { text: 'Finding', options: { bold: true, fill: A, color: 'FFFFFF' } } ],
    [ 'Quality filter', 'C4 NoPunc alone > C4 All / Gopher All; no model-based filter used' ],
    [ 'Toxicity threshold', 'adopted τ=0.4 (5.5–7.3% cut) over τ=0.0004 (better but −29–35%) — scale vs quality, stated openly' ],
    [ 'Mixture', 'NOT prescribed: sampling vs realized proportions differ −4×; ~5% in-domain suffices' ],
    [ 'Code fraction', '0/5/15% ablation: C4-only model fails all bAbI tasks' ],
    [ 'Validation', 'OLMo-1B (3.1T tokens) avg 60.3 — beats TinyLlama, Pythia; loses to StableLM₂' ],
  ];
  K.tab(s, { x: K.M, y: 2.15, w: K.W - 2 * K.M, colW: [3.0, 9.2], rows, rowH: 0.5, baseSize: 11.5 });
  K.footer(s, LABEL, SRC);
}

// 9 — repo walkthrough
{
  const s = add('Repo allenai/dolma: python/dolma (cli/core/taggers/warc) + src/ (Rust) + configs/. CLI dolma {tag,dedupe,mix,tokens}.');
  K.contentHeader(s, A, 'Open source', 'Repository walkthrough', 'Apache-2.0 toolkit · Rust core + Python CLI · config-driven');
  const rows = [
    [ { text: 'Path', options: { bold: true, fill: A, color: 'FFFFFF' } }, { text: 'What it does', options: { bold: true, fill: A, color: 'FFFFFF' } } ],
    [ 'python/dolma/cli/{tagger,deduper,mixer,tokenizer}.py', 'the four main commands' ],
    [ 'python/dolma/taggers/{language,gopher,c4,quality,jigsaw,pii,length}.py', 'built-in signal taggers (≈26)' ],
    [ 'python/dolma/warc/processor.py', 'Common Crawl WARC processing' ],
    [ 'src/{deduper,mixer,bloom_filter,wimbd}.rs', 'Rust performance core (rayon, PyO3)' ],
    [ 'configs/dolma-v1_5|v1_6|v1_7/', 'versions + mixing + decontamination runbooks' ],
  ];
  K.tab(s, { x: K.M, y: 2.2, w: K.W - 2 * K.M, colW: [5.6, 6.6], rows, rowH: 0.48, baseSize: 11 });
  K.footer(s, LABEL, SRC);
}

// 10 — strengths
{
  const s = add('Strengths: signal/policy separation (3T-token proof), stable identity, thresholds-in-config, honest scale-vs-safety tradeoff.');
  K.contentHeader(s, A, 'Assessment', 'Strengths', '');
  const items = [
    ['Signal/policy separation', 'v1.5→v1.6→v1.7 re-derived from one set of tags — the 3T-token proof.'],
    ['Stable (source,id)', 'traceable identity; blocklists and PII-removal as side files, not corpus rewrites.'],
    ['Thresholds in config', 'JSONPath filters make policy changes auditable diffs.'],
    ['Composable filters, deliberate', 'Gopher (subset) only; no model-based quality filter (documented rationale).'],
    ['Runbook with outputs', 'decontamination README records CLI + measured Bloom sizes.'],
    ['Honest tradeoffs', 'publishes the looser toxicity threshold and commits to a fix.'],
  ];
  const cw = (K.W - 2 * K.M - 0.6) / 2;
  items.forEach((it, i) => {
    K.card(s, { x: K.M + (i % 2) * (cw + 0.3), y: 2.15 + Math.floor(i / 2) * 1.42, w: cw, h: 1.28, title: it[0], body: it[1], titleSize: 12.5, bodySize: 10.5 });
  });
  K.footer(s, LABEL, SRC);
}

// 11 — limitations
{
  const s = add('Limitations: English-only; single-config ablation; text-centric (no multimodal). PII-rate contradiction flagged as erratum.');
  K.contentHeader(s, A, 'Assessment', 'Limitations & what a multimodal system needs', '');
  bullets(s, [
    'English-only — authors state it "reinforces English as the default".',
    'All data policy decided by a single 1.2B / 150B-token proxy, extrapolated to 3T.',
    'Bloom has false positives; "quality" and "toxicity" definitions are inherently ideological.',
    'Text-centric: character-offset attributes, exact-key dedup, and regex PII have no media analogue.',
    'A multimodal system adds: perceptual-hash/embedding dedup, ASR language ID, face/voice/license-plate PII, audio/video decode throughput.',
    'Reproducibility is partial in practice (Pushshift retired; raw CC not retained).',
  ], K.M, 2.2, K.W - 2 * K.M, 4.4, 13.5);
  K.footer(s, LABEL, SRC);
}

// 12 — lessons
{
  const s = add('Enterprise mapping: Dolma is the reference for signal/policy separation, versioning, lineage. Interpretation.');
  K.contentHeader(s, A, 'Enterprise lessons', 'The data-lake control-plane playbook', '');
  const rows = [
    [ { text: 'Concept', options: { bold: true, fill: A, color: 'FFFFFF' } }, { text: 'Dolma today', options: { bold: true, fill: A, color: 'FFFFFF' } }, { text: 'Verdict', options: { bold: true, fill: A, color: 'FFFFFF' } } ],
    [ 'Record identity', '(source,id) composite, version-stable', 'reference' ],
    [ 'Signal', 'detached attributes with span scores', 'reference' ],
    [ 'Policy', 'JSONPath filters, threshold in config', 'reference' ],
    [ 'Dataset version', 'v1.5→v1.7 re-derivation + HF revisions', 'reference' ],
    [ 'Provenance', 'id + blocklist side files + runbooks', 'reference' ],
    [ 'Recipe', 'per-source mix YAML (declarative build)', 'partial' ],
  ];
  K.tab(s, { x: K.M, y: 2.15, w: K.W - 2 * K.M, colW: [2.8, 5.6, 3.8], rows, rowH: 0.42, baseSize: 11 });
  K.footer(s, LABEL, SRC);
}

// 13 — key takeaways
{
  const s = add('Takeaways: split tag from build; thresholds in config; track full vs trained token counts; malta signal/policy separation.');
  K.contentHeader(s, A, 'Key takeaways', 'What to bring into a review', '');
  const items = [
    ['01', 'Split "tag" from "build" into two idempotent services — re-versioning is a mixer run, not a re-annotation.'],
    ['02', 'Keep two token counts per version: full-corpus vs actually-trained-on (2,308B vs 1,715B).'],
    ['03', 'Make rejection a queried artifact (dedup writes attributes; random_number enables splits).'],
    ['04', 'Preserve an externally round-trippable id — the precondition for takedowns and incident response.'],
  ];
  items.forEach((it, i) => {
    const y = 2.25 + i * 1.14;
    K.badge(s, A, { x: K.M, y, n: it[0], d: 0.5 });
    s.addText(it[1], { x: K.M + 0.72, y, w: K.W - 2 * K.M - 0.72, h: 0.95, fontFace: K.BODY, fontSize: 13.5, color: K.h(K.INK), valign: 'top', lineSpacingMultiple: 1.05 });
  });
  K.footer(s, LABEL, SRC);
}

// 14 — references
{
  const s = add('References: ACL paper, arXiv, HF dataset card, repo, OLMo.');
  K.contentHeader(s, A, 'References', 'Sources & links', '');
  const rows = [
    [ { text: 'Source', options: { bold: true, fill: A, color: 'FFFFFF' } }, { text: 'URL', options: { bold: true, fill: A, color: 'FFFFFF' } } ],
    [ 'Dolma (ACL 2024 long, Best Resource Paper)', 'aclanthology.org/2024.acl-long.840' ],
    [ 'arXiv', 'arxiv.org/abs/2402.00159' ],
    [ 'Repository (Apache-2.0)', 'github.com/allenai/dolma' ],
    [ 'Dataset card', 'huggingface.co/datasets/allenai/dolma' ],
    [ 'OLMo (trained on Dolma)', 'allenai.org/olmo' ],
  ];
  K.tab(s, { x: K.M, y: 2.3, w: K.W - 2 * K.M, colW: [5.2, 7.0], rows, rowH: 0.5, baseSize: 12 });
  K.footer(s, LABEL, SRC);
}

pptx.writeFile({ fileName: '/Users/wangyong/projects/github/wangyong1972/docs/papers/dolma/deck.pptx' })
  .then(() => console.log('WROTE deck.pptx (dolma)'))
  .catch((e) => { console.error(e); process.exit(1); });