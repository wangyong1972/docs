// generate.cjs — DataComp-LM deck (English, 16:9, editable .pptx).
// Run: NODE_PATH=/tmp/pptx-tools/node_modules node deck-source/generate.cjs
const PptxGenJS = require('pptxgenjs');
const K = require('../../_shared/deck-kit.cjs');

const A = K.ACCENTS['datacomp-lm'];
const SRC = 'arxiv 2406.11794 · NeurIPS 2024 D&B · github.com/mlfoundations/dclm';
const LABEL = 'DataComp-LM';

const pptx = new PptxGenJS();
pptx.layout = 'LAYOUT_WIDE';
pptx.author = 'wangyong1972';
pptx.title = 'DataComp-LM — data–model–evaluation loop';

function add(notes) { const s = pptx.addSlide(); if (notes) s.addNotes(notes); return s; }
function bullets(s, arr, x, y, w, h, size = 13) {
  s.addText(arr.map((t) => ({ text: t, options: { bullet: { code: '25AA' }, breakLine: true } })), { x, y, w, h, fontFace: K.BODY, fontSize: size, color: K.h(K.INK), lineSpacingMultiple: 1.05, paraSpaceAfter: 9, valign: 'top' });
}

// 1 — title
{
  const s = pptx.addSlide();
  K.darkBg(s);
  s.addText('A BENCHMARK FOR TRAINING DATA', { x: K.M, y: 1.25, w: 7.5, h: 0.35, fontFace: K.BODY, fontSize: 12, bold: true, color: K.h(A), charSpacing: 3 });
  s.addText('DataComp-LM', { x: K.M, y: 1.62, w: 10, h: 1.0, fontFace: K.HEAD, fontSize: 52, bold: true, color: K.h(K.PAPER) });
  s.addText('Fix the model. Fix the evaluation. Change only the data.', { x: K.M, y: 2.66, w: 11, h: 0.6, fontFace: K.BODY, fontSize: 17, color: 'C9D6E8', italic: true });
  s.addText('NeurIPS 2024 · Datasets & Benchmarks Track', { x: K.M, y: 3.4, w: 8, h: 0.4, fontFace: K.BODY, fontSize: 14, bold: true, color: '9FB6D4' });
  const pills = ['240T-token pool', '416 logged experiments', '53-task eval suite', 'rank transfer r ≥ 0.84'];
  let px = K.M;
  pills.forEach((p) => {
    const pw = p.length * 0.078 + 0.5;
    s.addShape('roundRect', { x: px, y: 4.35, w: pw, h: 0.42, rectRadius: 0.2, fill: { color: K.h('241F4A') }, line: { color: K.h('3A3268'), width: 1 } });
    s.addText(p, { x: px, y: 4.35, w: pw, h: 0.42, fontFace: K.BODY, fontSize: 11, color: 'DAD5F5', align: 'center', valign: 'middle' });
    px += pw + 0.16;
  });
  s.addText('Architecture review · English · 14 slides', { x: K.M, y: 6.7, w: 6, h: 0.3, fontFace: K.BODY, fontSize: 10.5, color: '8A7FB8' });
}

// 2 — motivation
{
  const s = add('Motivation: controlled comparison. Is A better than B because of data, or architecture/LR/compute? Closed sets hidden.');
  K.contentHeader(s, A, 'Motivation', 'Is it the data, or the recipe around it?', 'Prior results confound dataset with architecture, learning rate, and compute; closed-model training sets are undisclosed.');
  K.card(s, { x: K.M, y: 2.25, w: K.W - 2 * K.M, h: 1.7, title: 'The core question', body: 'Given a fixed training code + a fixed evaluation suite, ask: which dataset recipe scores best? DataComp (CLIP) proved this for vision; DataComp-LM ports it to LLM pretraining at 240T-token scale.', bodySize: 13 });
  const cols = [
    ['Controlled', 'Everything except data is frozen: architecture (OpenLM), token budget, hyperparameters, evaluation.'],
    ['Standardized', 'One 53-task suite reduced to MMLU 5-shot + Core-22 + Extended-53 centered accuracy.'],
    ['Reusable', 'Pool, code, checkpoints, and a 416-row experiment ledger all released (MIT).'],
  ];
  const cw = (K.W - 2 * K.M - 0.6) / 3;
  cols.forEach((c, i) => K.card(s, { x: K.M + i * (cw + 0.3), y: 4.25, w: cw, h: 2.1, title: c[0], body: c[1], bodySize: 11.5 }));
  K.footer(s, LABEL, SRC);
}

// 3 — overview
{
  const s = add('Overview: DCLM-Pool (all CC 2013-2022, 240T) + two tracks (filter, mixing) + fixed OpenLM training + 53-task eval.');
  K.contentHeader(s, A, 'Methodology overview', 'A data competition with a fixed harness', '');
  const steps = ['DCLM-Pool\n240T tokens · 200B docs · CC 2013–2022', 'Recipes\nfilter track · mixing track', 'Fixed training\nOpenLM, token=20×N', 'Fixed eval\n53 tasks → Core/Ext/MMLU', 'Score + rank\nr transfers 400M→7B'];
  const cw = (K.W - 2 * K.M) / 5;
  steps.forEach((t, i) => {
    const x = K.M + i * cw, y = 2.25;
    K.badge(s, A, { x: x + cw / 2 - 0.26, y, n: i + 1 });
    s.addText(t, { x: x + 0.04, y: y + 0.68, w: cw - 0.08, h: 1.3, fontFace: K.BODY, fontSize: 10, color: K.h(K.INK), align: 'center', valign: 'top' });
    if (i < 4) s.addShape('rightArrow', { x: x + cw - 0.15, y: y + 0.12, w: 0.22, h: 0.28, fill: { color: K.h(K.HAIR) }, line: { type: 'none' } });
  });
  const rows = [
    [ { text: 'Scale', options: { bold: true, fill: A, color: 'FFFFFF' } }, { text: 'Params', options: { bold: true, fill: A, color: 'FFFFFF' } }, { text: 'Tokens', options: { bold: true, fill: A, color: 'FFFFFF' } }, { text: 'H100 hrs', options: { bold: true, fill: A, color: 'FFFFFF' } } ],
    [ '400M-1x', '412M', '8.2B', '26' ],
    [ '1B-1x', '1.4B', '28.8B', '240' ],
    [ '3B-1x', '2.8B', '55.9B', '740' ],
    [ '7B-1x', '6.9B', '138B', '3,700' ],
    [ '7B-2x', '6.9B', '276B', '7,300' ],
  ];
  K.tab(s, { x: K.M, y: 3.55, w: K.W - 2 * K.M, colW: [2.6, 2.6, 2.6, 4.4], rows, rowH: 0.36, baseSize: 11 });
  s.addText('Two tracks only: filter + mixing. Dedup is a stage inside filtering — there is no separate dedup track.', { x: K.M, y: 6.1, w: K.W - 2 * K.M, h: 0.4, fontFace: K.BODY, fontSize: 12, color: K.h(K.MUTED), italic: true });
  K.footer(s, LABEL, SRC);
}

// 4 — core abstractions
{
  const s = add('Abstractions: recipe (filter/mix), reference JSON (uuid), DCLM-RefinedWeb reference pool, exp_data ledger.');
  K.contentHeader(s, A, 'Core abstractions', 'Recipe, reference JSON, and the experiment ledger', '');
  const cols = [
    ['Dataset recipe', 'A reproducible pipeline: HTML extract → heuristic filters → dedup → model filter → (mix weights). Documented and versioned.'],
    ['Reference JSON (uuid)', 'Every raw_source/untokenized/tokenized/model/eval is an ID card in exp_data/ — lineage is data, not docs.'],
    ['DCLM-RefinedWeb', 'The "reference crawl": all DCLM-Baseline steps except the fastText filter — isolates the model-filter decision.'],
  ];
  const cw = (K.W - 2 * K.M - 0.6) / 3;
  cols.forEach((c, i) => K.card(s, { x: K.M + i * (cw + 0.3), y: 2.25, w: cw, h: 2.6, title: c[0], body: c[1], bodySize: 12 }));
  K.card(s, { x: K.M, y: 5.15, w: K.W - 2 * K.M, h: 1.5, title: 'DCLM-Baseline — the authors’ own top recipe', body: 'resiliparse HTML extraction  →  RefinedWeb heuristics (incl. Gopher subset)  →  BFF dedup (min-ngram 13)  →  fastText (OH-2.5 + ELI5) top-10%.  Trained 7B / 2.6T → Core 57.1 · MMLU 63.7 · Ext 45.4.', bodySize: 12.5 });
  K.footer(s, LABEL, SRC);
}

// 5 — experimental loop
{
  const s = add('The loop: recipe → tokenize+shuffle → train → eval → score → iterate. Fixed evaluator is the enabling decision.');
  K.contentHeader(s, A, 'The experimental loop', 'Recipe → controlled training → standardized evaluation', 'Rank transfer (r = 0.838 / 0.956 / 0.982) makes cheap small-model iteration trustworthy.');
  const nodes = [
    ['Recipe', 'filter + mix over the pool'],
    ['Tokenize + shuffle', 'official Rust tokshuf + manifest'],
    ['Train', 'OpenLM, fixed scale hyperparams'],
    ['Evaluate', '53 tasks → Core/Ext/MMLU'],
    ['Score & rank', 'attach score to the recipe uuid'],
  ];
  const cw = (K.W - 2 * K.M) / 5;
  nodes.forEach((t, i) => {
    const x = K.M + i * cw, y = 2.5, cy = 4.6;
    K.badge(s, A, { x: x + cw / 2 - 0.42, y: cy, n: i + 1, d: 0.84 });
    s.addText(t[0], { x: x + 0.05, y: cy + 0.9, w: cw - 0.1, h: 0.4, fontFace: K.BODY, fontSize: 13, bold: true, color: K.h(K.NAVY), align: 'center' });
    s.addText(t[1], { x: x + 0.05, y: cy + 1.3, w: cw - 0.1, h: 0.6, fontFace: K.BODY, fontSize: 10, color: K.h(K.MUTED), align: 'center' });
    if (i < 4) s.addShape('rightArrow', { x: x + cw - 0.18, y: cy + 0.26, w: 0.3, h: 0.3, fill: { color: K.h(A) }, line: { type: 'none' } });
  });
  s.addShape('line', { x: K.M, y: 3.4, w: K.W - 2 * K.M, h: 0, line: { color: K.h(K.HAIR), width: 1 } });
  K.footer(s, LABEL, SRC);
}

// 6 — implementation
{
  const s = add('Implementation: Ray mapper engine (declarative YAML) + Rust BFF dedup + Rust tokshuf; OpenLM training; LLM-Foundry eval.');
  K.contentHeader(s, A, 'Implementation', 'Ray mappers, Rust dedup/shuffle, OpenLM, LLM-Foundry', '');
  const cols = [
    ['Ray mapper engine', 'baselines/core/processor.py: factory/decorator + declarative YAML pipelines + _aggregate hooks; per-document transforms.', 'ray_processing/process.py'],
    ['Rust tools (not in Ray YAML)', 'BFF = Bloom near-dup with --annotate audit; tokshuf = single-machine tokenize + global shuffle → webdataset.', 'dedup/bff · rust_processing/tokshuf-rs'],
    ['Training + eval', 'OpenLM (FSDP), sequence 2048, GPT-NeoX 50k. Eval via LLM-Foundry (NOT lm-eval-harness), 53 tasks.', 'training/train.py · eval/*.yaml'],
  ];
  const cw = (K.W - 2 * K.M - 0.6) / 3;
  cols.forEach((c, i) => {
    const x = K.M + i * (cw + 0.3);
    K.card(s, { x, y: 2.2, w: cw, h: 3.0, title: c[0], body: c[1], bodySize: 11 });
    s.addText(c[2], { x: x + 0.16, y: 4.85, w: cw - 0.32, h: 0.3, fontFace: K.BODY, fontSize: 9, color: K.h(A), italic: true });
  });
  K.footer(s, LABEL, SRC);
}

// 7 — model-based filtering (native bar chart)
{
  const s = add('Model-based filtering is the key lever: fastText OH-2.5+ELI5 best, PageRank worst (Table 4, 1B-1x Core).');
  K.contentHeader(s, A, 'Findings', 'Model-based filtering is the biggest lever', 'Core accuracy, 1B-1x (paper Table 4). fastText OH-2.5+ELI5 wins; PageRank is useless.');
  const labels = ['PageRank', 'BGE', 'SemDedup', 'RefinedWeb\nrepro', 'AskLLM', 'perplexity', 'top-k\nlogits', 'fastText\nOH-2.5+ELI5'];
  const values = [26.1, 27.2, 27.1, 27.5, 28.6, 29.0, 29.2, 30.2];
  s.addChart(pptx.charts.BAR, [{ name: 'Core (1B-1x)', labels, values }], {
    x: K.M, y: 2.15, w: K.W - 2 * K.M, h: 4.4, barDir: 'bar',
    showTitle: false, showLegend: false, showValue: true, dataLabelPosition: 'outEnd', dataLabelColor: K.h(K.INK), dataLabelFontSize: 10,
    chartColors: [K.h('D8A0A0'), K.h(K.HAIR), K.h(K.HAIR), K.h(K.HAIR), K.h('C3BCEE'), K.h('A79DE3'), K.h('8B7DD8'), K.h(A)],
    catAxisLabelColor: K.h(K.MUTED), catAxisLabelFontSize: 9.5,
    valAxisLabelColor: K.h(K.MUTED), valAxisLabelFontSize: 9,
    valGridLine: { color: K.h(K.HAIR), size: 1 }, catGridLine: { style: 'none' },
    valAxisMinVal: 0, valAxisMaxVal: 33,
    chartColorsOpacity: 90, dataLabelFormatCode: '0.0',
  });
  K.footer(s, LABEL, SRC);
}

// 8 — evaluation & findings
{
  const s = add('Headline: DCLM-Baseline 7B/2.6T Core 57.1/MMLU 63.7/Ext 45.4; +6.6pp MMLU vs MAP-Neo at 40% less compute. Rank transfer r.');
  K.contentHeader(s, A, 'Evaluation & findings', 'Headline results and rank transfer', '');
  const stats = [['57.1', 'Core (7B / 2.6T)', 30], ['63.7', 'MMLU 5-shot', 30], ['+6.6 pp', 'MMLU vs MAP-Neo (−40% compute)', 22], ['r≈0.96', 'rank transfer 400M→7B', 20]];
  const w4 = (K.W - 2 * K.M - 0.9) / 4;
  let sx = K.M, sy = 2.2;
  stats.forEach((st) => { K.stat(s, A, { x: sx, y: sy, w: w4, value: st[0], caption: st[1], valueSize: st[2] }); sx += w4 + 0.3; });
  const rows = [
    [ { text: 'Finding', options: { bold: true, fill: A, color: 'FFFFFF' } }, { text: 'Evidence', options: { bold: true, fill: A, color: 'FFFFFF' } } ],
    [ 'Mixing hurts a strong CC-only set', 'DCLM-Baseline +33% external → −1.2 Core pp (Table 6)' ],
    [ 'Decontamination ≠ the gains', 'MMLU 51.8→52.7, HellaSwag 77.9→78.4 (Table 7)' ],
    [ 'Aggressive dedup hides a regression', 'min-ngram 5: Core ok, MMLU collapses to 32.5 (Table 19)' ],
  ];
  K.tab(s, { x: K.M, y: 3.9, w: K.W - 2 * K.M, colW: [5.2, 7.0], rows, rowH: 0.44, baseSize: 11 });
  K.footer(s, LABEL, SRC);
}

// 9 — repo walkthrough
{
  const s = add('Repo mlfoundations/dclm (MIT): baselines/ (Ray mappers), training/ (OpenLM), eval/ (LLM-Foundry), dedup/bff, exp_data/ ledger.');
  K.contentHeader(s, A, 'Open source', 'Repository walkthrough (MIT)', '');
  const rows = [
    [ { text: 'Path', options: { bold: true, fill: A, color: 'FFFFFF' } }, { text: 'What it does', options: { bold: true, fill: A, color: 'FFFFFF' } } ],
    [ 'baselines/baselines_configs/*.yaml', 'DCLM-Baseline recipe + fastText filter' ],
    [ 'baselines/core/processor.py', 'Ray mapper engine (reusable)' ],
    [ 'training/{train,hyperparameters}.py', 'OpenLM training + scale registry' ],
    [ 'eval/{eval_meta_data.csv,aggregated_metrics.py}', '53-task list + Core-22 + v1/v2 migration' ],
    [ 'exp_data/ + tools/eval_expdb.py', 'uuid-keyed experiment ledger' ],
    [ 'dedup/bff · rust_processing/tokshuf-rs', 'Rust dedup + tokenize/shuffle' ],
  ];
  K.tab(s, { x: K.M, y: 2.15, w: K.W - 2 * K.M, colW: [5.4, 6.8], rows, rowH: 0.46, baseSize: 11 });
  K.footer(s, LABEL, SRC);
}

// 10 — strengths
{
  const s = add('Strengths: controlled ablation at 240T; measured rank transfer; near-complete artifacts; deliberately kept negative results.');
  K.contentHeader(s, A, 'Assessment', 'Strengths', '');
  const items = [
    ['Controlled at scale', '240T pool, 416 logged runs, 5 scales, per-task published results.'],
    ['Measured rank transfer', 'r = 0.838/0.956/0.982 justifies cheap small-model iteration.'],
    ['Near-complete assets', 'code, pool, reference pool, dataset (+score columns), 1B/7B weights, 416-row CSV.'],
    ['Negative results kept', 'PageRank fails, SemDedup-with-BGE fails, AskLLM ≠ quality, WET extraction costs 3.4 Core pp.'],
    ['Reference-set insight', 'the reference set (OH-2.5/ELI5), not the classifier algorithm, is the asset.'],
    ['Experiment ledger', 'uuid-keyed exp_data/ = a minimal viable data-catalog contract.'],
  ];
  const cw = (K.W - 2 * K.M - 0.6) / 2;
  items.forEach((it, i) => {
    K.card(s, { x: K.M + (i % 2) * (cw + 0.3), y: 2.15 + Math.floor(i / 2) * 1.42, w: cw, h: 1.28, title: it[0], body: it[1], titleSize: 12.5, bodySize: 10.5 });
  });
  K.footer(s, LABEL, SRC);
}

// 11 — limitations
{
  const s = add('Limitations: single-dimension ablations, ≤7B, English, eval-framework sensitivity, metric v1/v2, empty leaderboard.');
  K.contentHeader(s, A, 'Assessment', 'Limitations & benchmark-vs-production boundary', '');
  bullets(s, [
    'Only single-dimension ablations; nothing beyond 7B; one tokenizer (GPT-NeoX); code/math are weak; PII deliberately untreated.',
    'Eval-framework sensitivity: LightEval vs LLM-Foundry can erase a ~10-point gap. Numbers are not lm-eval-harness portable.',
    'Metric versioning: pre-Sept-2025 scores are Core/Extended v1 (the paper); repo default is v2 after the centering-bug fix.',
    'Version conflicts: arXiv "64%/2.6T/40%" vs NeurIPS "63%/2T/half"; pool 240T vs "over 300T"; dataset 3.8T vs "4T/3B docs".',
    'The live leaderboard has only baseline rows (06-19-2024) — "how top submissions beat baseline" is not answerable from current artifacts.',
  ], K.M, 2.2, K.W - 2 * K.M, 4.4, 13);
  K.footer(s, LABEL, SRC);
}

// 12 — lessons
{
  const s = add('Benchmark infra vs reusable production infra: keep the Ray mapper, Rust tools, reference-JSON lineage, enrichers; drop the fixed-scale registry and centered rubric.');
  K.contentHeader(s, A, 'Enterprise lessons', 'What is benchmark vs what is production', '');
  K.card(s, { x: K.M, y: 2.2, w: 5.95, h: 3.4, title: 'Benchmark-specific (little reuse)', body: 'fixed --scale registry (chinchilla_multiplier) · 53-task YAMLs + centered baselines (the rubric, proven buggy) · leaderboard plumbing (eval_expdb/submit/TSV) · model-soup/cooldown/long-context stage.', bodySize: 12 });
  K.card(s, { x: K.M + 6.2, y: 2.2, w: 5.95, h: 3.4, title: 'Reusable production pieces', body: 'Ray mapper engine (processor.py + YAML) · Rust BFF dedup + tokshuf · fastText LID/quality enrichers · reverse-engineered filters + banlists · reference-JSON lineage · publish automation.', bodySize: 12 });
  K.card(s, { x: K.M, y: 5.85, w: K.W - 2 * K.M, h: 0.95, title: 'The meta-lesson', body: 'Fix and version the evaluator before optimizing data; prove small-scale predictivity by measuring rank transfer, not assuming it.', bodySize: 12 });
  K.footer(s, LABEL, SRC);
}

// 13 — key takeaways
{
  const s = add('Takeaways: fixed evaluator first; measured rank transfer; reference set is the asset; keep an experiment ledger; audit dedup.');
  K.contentHeader(s, A, 'Key takeaways', 'What to bring into a review', '');
  const items = [
    ['01', 'Fix and version the evaluator before tuning data — otherwise nothing is measurable.'],
    ['02', 'Prove (measure) rank transfer, don’t assume small-model sweeps predict large models.'],
    ['03', 'The reference set — not the classifier algorithm — is the high-ROI asset to invest in.'],
    ['04', 'Deduplicate with audit + record what was removed; one headline metric can hide a regression.'],
    ['05', 'Keep lineage as data (uuid ledger), not prose — it becomes your catalog contract.'],
  ];
  items.forEach((it, i) => {
    const y = 2.2 + i * 0.92;
    K.badge(s, A, { x: K.M, y, n: it[0], d: 0.44 });
    s.addText(it[1], { x: K.M + 0.64, y: y - 0.02, w: K.W - 2 * K.M - 0.64, h: 0.8, fontFace: K.BODY, fontSize: 13, color: K.h(K.INK), valign: 'top', lineSpacingMultiple: 1.03 });
  });
  K.footer(s, LABEL, SRC);
}

// 14 — references
{
  const s = add('References: arXiv, NeurIPS, repo, project, dataset, checkpoints.');
  K.contentHeader(s, A, 'References', 'Sources & links', '');
  const rows = [
    [ { text: 'Source', options: { bold: true, fill: A, color: 'FFFFFF' } }, { text: 'URL', options: { bold: true, fill: A, color: 'FFFFFF' } } ],
    [ 'DataComp-LM (NeurIPS 2024 D&B)', 'arxiv.org/abs/2406.11794' ],
    [ 'Repository (MIT)', 'github.com/mlfoundations/dclm' ],
    [ 'Project / leaderboard', 'datacomp.ai/dclm' ],
    [ 'Dataset', 'huggingface.co/datasets/mlfoundations/dclm-baseline-1.0' ],
    [ 'Checkpoints', 'apple/DCLM-7B · TRI-ML/DCLM-1B' ],
  ];
  K.tab(s, { x: K.M, y: 2.3, w: K.W - 2 * K.M, colW: [5.2, 7.0], rows, rowH: 0.5, baseSize: 12 });
  K.footer(s, LABEL, SRC);
}

pptx.writeFile({ fileName: '/Users/wangyong/projects/github/wangyong1972/docs/papers/datacomp-lm/deck.pptx' })
  .then(() => console.log('WROTE deck.pptx (datacomp-lm)'))
  .catch((e) => { console.error(e); process.exit(1); });