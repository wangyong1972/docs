// generate.cjs — Data-Juicer deck (English, 16:9, editable .pptx).
// Run: NODE_PATH=/tmp/pptx-tools/node_modules node deck-source/generate.cjs
const PptxGenJS = require('pptxgenjs');
const K = require('../../_shared/deck-kit.cjs');

const A = K.ACCENTS['data-juicer'];
const TOPIC = 'Data-Juicer';
const SRC = 'arxiv 2309.02033 · 2501.14755 · github.com/datajuicer/data-juicer';
const LABEL = 'Data-Juicer 1.0 → 2.0';

const pptx = new PptxGenJS();
pptx.layout = 'LAYOUT_WIDE';
pptx.author = 'wangyong1972';
pptx.title = 'Data-Juicer 1.0 → 2.0 — Architecture Review';

// ---------- helpers ----------
function titleSlide() {
  const s = pptx.addSlide();
  K.darkBg(s);
  s.addText('THE DATA OPERATING SYSTEM', { x: K.M, y: 1.25, w: 7.5, h: 0.35, fontFace: K.BODY, fontSize: 12, bold: true, color: K.h(A), charSpacing: 3 });
  s.addText('Data-Juicer 1.0 → 2.0', { x: K.M, y: 1.62, w: 11.5, h: 1.0, fontFace: K.HEAD, fontSize: 46, bold: true, color: K.h(K.PAPER) });
  s.addText('Cloud-Scale Adaptive Data Processing for and with Foundation Models', { x: K.M, y: 2.62, w: 10.5, h: 0.6, fontFace: K.BODY, fontSize: 18, color: 'C9D6E8', italic: true });
  s.addText([
    { text: 'SIGMOD 2024 Companion (v1)   ', options: { color: K.h('9FB6D4') } },
    { text: '  ·  ', options: { color: K.h('4A6E94') } },
    { text: 'NeurIPS 2025 Spotlight (2.0)', options: { color: K.h('9FB6D4') } },
  ], { x: K.M, y: 3.35, w: 10, h: 0.4, fontFace: K.BODY, fontSize: 14, bold: true });
  const pills = ['Operators + YAML recipes', 'Ray · MaxCompute', 'Multimodal (img/video/audio)', 'Runtime Probe (adaptive)'];
  let px = K.M;
  pills.forEach((p, i) => {
    const pw = p.length * 0.082 + 0.5;
    s.addShape('roundRect', { x: px, y: 4.35, w: pw, h: 0.42, rectRadius: 0.2, fill: { color: K.h('1E3660') }, line: { color: K.h('355275'), width: 1 } });
    s.addText(p, { x: px, y: 4.35, w: pw, h: 0.42, fontFace: K.BODY, fontSize: 11, color: K.h('D6E2F2'), align: 'center', valign: 'middle' });
    px += pw + 0.18;
  });
  s.addText('Architecture review · English · 14 slides', { x: K.M, y: 6.7, w: 6, h: 0.3, fontFace: K.BODY, fontSize: 10.5, color: K.h('7E93B3') });
  return s;
}

let n = 0;
function add(notes) {
  const s = pptx.addSlide();
  if (notes) s.addNotes(notes);
  return s;
}

titleSlide();

// 2 — motivation
{
  const s = add('Four challenges from paper-1 §1; the framing is "data engineering lags the model side".');
  K.contentHeader(s, A, 'Motivation', 'Why general-purpose data infrastructure for LLMs', 'LLM quality is data-sensitive, but data engineering lacked reusable, evaluable, composable abstractions.');
  const items = [
    ['C1 · Heterogeneous recipes', 'Every team re-implements cleaning; no standard abstraction.'],
    ['C2 · Expensive feedback', 'Validating a recipe means retraining a billion-parameter model.'],
    ['C3 · Poor reuse', 'Researchers cannot easily reuse a data pipeline.'],
    ['C4 · Massive volume', 'Billions–trillions of tokens; sys-level optimization often bypassed.'],
  ];
  const cw = (K.W - 2 * K.M - 0.6) / 2;
  const ch = 1.55;
  items.forEach((it, i) => {
    const x = K.M + (i % 2) * (cw + 0.3);
    const y = 2.25 + Math.floor(i / 2) * (ch + 0.24);
    K.card(s, { x, y, w: cw, h: ch, title: it[0], body: it[1], accent: A, titleSize: 13 });
  });
  s.addText('2.0 lifts this to scale + modality: TB-scale, 10k+ cores, and image/video/audio in the same operator model.', { x: K.M, y: 6.15, w: K.W - 2 * K.M, h: 0.4, fontFace: K.BODY, fontSize: 12, color: K.h(K.MUTED), italic: true });
  K.footer(s, LABEL, SRC);
}

// 3 — evolution view
{
  const s = add('Data-Juicer 1.0 (SIGMOD 2024 Companion) vs 2.0 (NeurIPS 2025 Spotlight). 2.0 is a runtime refactor, not a re-proof of quality.');
  K.contentHeader(s, A, 'Evolution', 'One system, two releases — what 2.0 rebuilt', 'v1 proves data→model quality; v2 rebuilds the runtime for multimodal + cloud scale + adaptive planning.');
  const col1 = { x: K.M, y: 2.2, w: (K.W - 2 * K.M - 0.4) / 2, h: 4.35 };
  const col2 = { x: col1.x + col1.w + 0.4, y: 2.2, w: col1.w, h: 4.35 };
  s.addShape('roundRect', { ...col1, rectRadius: 0.05, fill: { color: K.h(K.PANEL) }, line: { color: K.h(K.HAIR), width: 1 } });
  s.addText('Data-Juicer 1.0', { x: col1.x + 0.18, y: col1.y + 0.14, w: col1.w - 0.36, h: 0.4, fontFace: K.BODY, fontSize: 16, bold: true, color: K.h(K.SLATE) });
  s.addText([
    { text: '4 operator kinds (Formatter/Mapper/Filter/Dedup)', options: { bullet: true, breakLine: true } },
    { text: 'HF-datasets · Arrow · text/meta/stats', options: { bullet: true, breakLine: true } },
    { text: 'YAML/JSONnet recipes (jsonargparse)', options: { bullet: true, breakLine: true } },
    { text: 'Ray / Beam / Flink distributed', options: { bullet: true, breakLine: true } },
    { text: 'Static, greedy OP-fusion + reordering', options: { bullet: true, breakLine: true } },
    { text: 'Data→model eval loop (HELM, GPT-4)', options: { bullet: true } },
  ], { x: col1.x + 0.2, y: col1.y + 0.6, w: col1.w - 0.4, h: col1.h - 0.7, fontFace: K.BODY, fontSize: 12.5, color: K.h(K.INK), lineSpacingMultiple: 1.05, paraSpaceAfter: 8 });
  s.addShape('roundRect', { ...col2, rectRadius: 0.05, fill: { color: K.h('EAF2F2') }, line: { color: K.h(A), width: 1.25 } });
  s.addText('Data-Juicer 2.0', { x: col2.x + 0.18, y: col2.y + 0.14, w: col2.w - 0.36, h: 0.4, fontFace: K.BODY, fontSize: 16, bold: true, color: K.h(A) });
  s.addText([
    { text: 'Multimodal + token-aligned schema (img/video/audio)', options: { bullet: true, breakLine: true } },
    { text: '5 new compositional OPs (Grouper/Aggregator/Fused/Script/Human)', options: { bullet: true, breakLine: true } },
    { text: 'Facade dataset: HF / Ray Data / MaxFrame', options: { bullet: true, breakLine: true } },
    { text: 'Dataset hubs: HuggingFace + ModelScope', options: { bullet: true, breakLine: true } },
    { text: 'Runtime Probe → adaptive reorder / batch / GPU', options: { bullet: true, breakLine: true } },
    { text: 'Sample-level fault tolerance · streaming JSONL', options: { bullet: true } },
  ], { x: col2.x + 0.2, y: col2.y + 0.6, w: col2.w - 0.4, h: col2.h - 0.7, fontFace: K.BODY, fontSize: 12.5, color: K.h(K.INK), lineSpacingMultiple: 1.05, paraSpaceAfter: 8 });
  // center arrow
  s.addShape('chevron', { x: col1.x + col1.w - 0.06, y: 4.0, w: 0.52, h: 0.5, fill: { color: K.h(A) }, line: { type: 'none' } });
  K.footer(s, LABEL, SRC);
}

// 4 — core abstractions
{
  const s = add('Operator base classes from data_juicer/ops/base_op.py; Filter compute_stats→bool split is the load-bearing design.');
  K.contentHeader(s, A, 'Core abstractions', 'Operators as the minimal composable unit', 'A Filter returns statistics first and a boolean second — the analyzer reasons over full evidence, not just survivors.');
  const rows = [
    [ { text: 'Type', options: { bold: true, fill: A, color: 'FFFFFF' } }, { text: 'Contract', options: { bold: true, fill: A, color: 'FFFFFF' } }, { text: 'Role', options: { bold: true, fill: A, color: 'FFFFFF' } } ],
    [ 'Formatter', 'load_dataset() → Dataset', 'read external formats' ],
    [ 'Mapper', 'process(sample) → Dict', 'per-sample transform' ],
    [ 'Filter', 'compute_stats() + process() → bool', 'stats first, then filter' ],
    [ 'Deduplicator', 'compute_hash + process(dataset)', 'exact / MinHash / SimHash' ],
    [ 'Selector', 'process(dataset)', 'rank / sample' ],
    [ 'Grouper · Aggregator · Pipeline', 'batch / orchestrate', '2.0 compositional ops' ],
  ];
  K.tab(s, { x: K.M, y: 2.15, w: K.W - 2 * K.M, colW: [2.6, 4.0, 5.6], rows, rowH: 0.37, baseSize: 11 });
  s.addText('Sample model: text / meta / stats  (2.0 adds query/response/history + images[] + meta{src,version}).  ~230 OPs in repo (mapper 138, filter 58, dedup 10).', { x: K.M, y: 5.4, w: K.W - 2 * K.M, h: 0.5, fontFace: K.BODY, fontSize: 11.5, color: K.h(K.MUTED) });
  const stats = [
    ['230', 'documented operators (8 kinds)'],
    ['8', 'operator categories'],
    ['200+', 'ops · 50+ community recipes'],
  ];
  let sx = K.M;
  stats.forEach((st) => {
    const w = 2.6;
    K.stat(s, A, { x: sx, y: 6.0, w, value: st[0], caption: st[1] });
    sx += w + 1.6;
  });
  K.footer(s, LABEL, SRC);
}

// 5 — architecture / data flow
{
  const s = add('Lifecycle: raw → build/validate → operator DAG → export → analyze/trace → (train→eval). Ray = Data + Actors + Tasks.');
  K.contentHeader(s, A, 'Architecture · data flow', 'Raw data → recipes → analyzable dataset', 'One YAML recipe drives both standalone and distributed (Ray / MaxFrame) execution.');
  const steps = ['Resolve source\nHF / ModelScope / local', 'Build + validate\nDatasetBuilder · DataValidator', 'Operator DAG\nMapper/Filter/Dedup…', 'Export\nsharded write', 'Analyze · Trace\nstats / lineage', 'Train → Eval\nfeedback'];
  const cw = (K.W - 2 * K.M) / 6;
  steps.forEach((t, i) => {
    const x = K.M + i * cw;
    const y = 2.3;
    K.badge(s, A, { x: x + cw / 2 - 0.26, y, n: i + 1 });
    s.addText(t, { x: x + 0.05, y: y + 0.66, w: cw - 0.1, h: 1.0, fontFace: K.BODY, fontSize: 10.5, color: K.h(K.INK), align: 'center', valign: 'top' });
    if (i < 5) s.addShape('rightArrow', { x: x + cw - 0.16, y: y + 0.12, w: 0.24, h: 0.3, fill: { color: K.h(K.HAIR) }, line: { type: 'none' } });
  });
  K.card(s, { x: K.M, y: 4.15, w: K.W - 2 * K.M, h: 2.15, title: 'Engine facade + adaptive execution', body: 'Engine facade: HuggingFace Dataset → Ray Data (map_batches + ActorPoolStrategy / TaskPoolStrategy) → MaxFrame-DataFrame.\nAdaptive: runtime Probe dry-runs each OP (min(1000, remaining) samples) and measures speed → reorders the DAG fast→slow → tunes batch size and GPU/parallelism. fusion_strategy defaults to "probe".', accent: A, bodySize: 12 });
  K.footer(s, LABEL, SRC);
}

// 6 — implementation details
{
  const s = add('Recipe is a YAML process list; config via jsonargparse auto-registers OP args. Dedup defaults verified in repo sources.');
  K.contentHeader(s, A, 'Implementation', 'Recipes, Ray, and the dedup core', 'Concrete defaults that make this an adoptable reference implementation.');
  const cols = [
    ['Recipe = declarative YAML', 'process: list of <op_name>: {kwargs}. jsonargparse parses CLI + YAML/JSON/JSONnet + env + defaults.', 'demos/process_on_ray/configs/demo.yaml'],
    ['Ray integration', 'ray.data.map_batches with TaskPoolStrategy; elastic ActorPoolStrategy; @ray.remote node probes; vLLM pipeline OPs.', 'core/data/ray_dataset.py'],
    ['Dedup (verified defaults)', 'MD5 exact · MinHash (256 perms, Jaccard 0.7) · SimHash (win 6, blocks 6, hamming 4) · BTS union-find (3.3×).', 'ops/deduplicator/*.py'],
  ];
  const cw = (K.W - 2 * K.M - 0.6) / 3;
  cols.forEach((c, i) => {
    const x = K.M + i * (cw + 0.3);
    K.card(s, { x, y: 2.2, w: cw, h: 3.3, title: c[0], body: c[1], accent: A, bodySize: 11.5 });
    s.addText(c[2], { x: x + 0.16, y: 5.1, w: cw - 0.32, h: 0.3, fontFace: K.BODY, fontSize: 9, color: K.h(A), italic: true });
  });
  K.footer(s, LABEL, SRC);
}

// 7 — scale & performance
{
  const s = add('Verified numbers: paper-2 §5.4 / Table 1. Do NOT cite README "2-10x fusion" (conflicts with 24.91/42.04/70.22%).');
  K.contentHeader(s, A, 'Scale & performance', 'Cloud-scale, only verified figures', 'Wall-clock results on Alibaba Cloud (ECS / PAI-DLC / MaxCompute); treat as directional, not vendor-neutral.');
  const stats = [
    ['70B', 'samples in ≈2.1 h on 6,400 cores', 27],
    ['5 TB', 'dedup in 2.8 h on 1,280 cores', 27],
    ['3.3×', 'MinHash engine vs vanilla Ray', 24],
    ['−70%', 'reorder+fusion (13-OP recipe)', 24],
  ];
  let sx = K.M, sy = 2.25;
  stats.forEach((st, i) => {
    const w = (K.W - 2 * K.M - 0.9) / 4;
    K.stat(s, A, { x: sx, y: sy, w, value: st[0], caption: st[1], valueSize: st[2] });
    sx += w + 0.3;
  });
  const rows = [
    [ { text: 'Workload / engine', options: { bold: true, fill: A, color: 'FFFFFF' } }, { text: 'Result', options: { bold: true, fill: A, color: 'FFFFFF' } }, { text: 'Context', options: { bold: true, fill: A, color: 'FFFFFF' } } ],
    [ 'OP fusion + reorder (v1)', 'up to −24.91% e2e', '14 OPs, 5 fusible (paper-1 §7.2.2)' ],
    [ 'OP fusion + reorder (v2)', 'up to −70.22%', '13-OP recipe (paper-2 §5.5)' ],
    [ 'GPU allocation', '≥50% saved, up to 99%', 'BLIP-2 8669→305 s (8×A100)' ],
    [ 'MaxCompute vs Ray', 'text ~1/4 time; multimodal 1.5× slower', 'paper-2 §5.4' ],
    [ 'AI-CPFS storage', '1625 vs 4396 s = 2.7×', '3× bandwidth + RDMA' ],
  ];
  K.tab(s, { x: K.M, y: 3.35, w: K.W - 2 * K.M, colW: [3.2, 4.0, 5.0], rows, rowH: 0.37, baseSize: 10.5 });
  K.footer(s, LABEL, SRC);
}

// 8 — evaluation & findings
{
  const s = add('Paper-1 closes data→quality loop (HELM-16, GPT-4 pairwise). Paper-2 validates throughput only — do NOT claim 2.0 improves model quality.');
  K.contentHeader(s, A, 'Evaluation & findings', 'Quality loop (v1) vs systems study (2.0)', 'Asymmetric evidence: the two papers prove different things.');
  K.card(s, { x: K.M, y: 2.2, w: 5.9, h: 3.9, title: 'Paper 1 — data → model quality', body: 'LLaMA-1.3B / 150B tokens; 16 HELM tasks; fixed recipe, data is the only variable.\n\n• up to +7.45% avg across 16 benchmarks\n• up to +17.5% GPT-4 pairwise win rate\n• up to −90.4% (ZH) / −56.8% avg data kept', accent: A, bodySize: 12 });
  K.card(s, { x: K.M + 6.2, y: 2.2, w: 6.0, h: 3.9, title: 'Paper 2 — system/scale only', body: 'Three scales (560K → 70B samples), 3 engines, 3 workload classes.\n\n• Measures throughput, CPU/GPU allocation, reordering gain\n• Model-quality results are CITED from the separate Sandbox paper (ICML’25), not run here', accent: A, bodySize: 12 });
  K.footer(s, LABEL, SRC);
}

// 9 — repo walkthrough
{
  const s = add('Repo datajuicer/data-juicer @ 1e9720d0, Apache-2.0, ~7k stars, 1,417 files / 863 .py. Ops split by category.');
  K.contentHeader(s, A, 'Open source', 'Repository walkthrough (commit 1e9720d0)', 'Apache-2.0 · ~7k stars · three-tier stability tags (Stable / Beta / Alpha).');
  const rows = [
    [ { text: 'Path / module', options: { bold: true, fill: A, color: 'FFFFFF' } }, { text: 'What to read for', options: { bold: true, fill: A, color: 'FFFFFF' } } ],
    [ 'ops/base_op.py', 'OP hierarchy, Registry, per-engine _supported_exec_modes' ],
    [ 'core/adapter.py', 'Probe (probe_small_batch) + batch_size_strategy' ],
    [ 'ops/op_fusion.py', 'fusion_strategy: greedy | probe' ],
    [ 'core/data/{ray_dataset,dj_dataset}.py', 'engine facade + multimodal schema' ],
    [ 'ops/deduplicator/*.py', 'MD5 / MinHash (256, 0.7) / SimHash (6,6,4) / BTS' ],
    [ 'config/config_all.yaml', 'every global default + validator block' ],
  ];
  K.tab(s, { x: K.M, y: 2.15, w: K.W - 2 * K.M, colW: [4.6, 7.6], rows, rowH: 0.42, baseSize: 11 });
  K.footer(s, LABEL, SRC);
}

// 10 — strengths
{
  const s = add('Strengths: operator model + recipe-as-product, stats/bool separation, verified dedup, runtime probe, honest maturity labels.');
  K.contentHeader(s, A, 'Assessment', 'Strengths', '');
  const items = [
    ['Recipe-as-product', 'YAML is versionable, diffable, CI-able — the strongest enterprise artifact.'],
    ['Filter stats/bool split', 'evidence (stats) decoupled from decision (filter).'],
    ['Verified dedup', 'MD5 + MinHash + SimHash with C++/Cython; distributed union-find 3.3×.'],
    ['Runtime Probe', 'data-aware reordering/batch/GPU instead of static assumptions.'],
    ['Multimodal breadth', 'img/video/audio + interleaved data + SFT/RFT converters.'],
    ['Honest maturity tags', 'Stable/Beta/Alpha per operator — the best adoption signal.'],
  ];
  const cw = (K.W - 2 * K.M - 0.6) / 2;
  items.forEach((it, i) => {
    K.card(s, { x: K.M + (i % 2) * (cw + 0.3), y: 2.15 + Math.floor(i / 2) * 1.42, w: cw, h: 1.28, title: it[0], body: it[1], accent: A, titleSize: 12.5, bodySize: 10.5 });
  });
  K.footer(s, LABEL, SRC);
}

// 11 — limitations
{
  const s = add('Limitations: engine inequality, no noise bars, vendor-adjacent numbers, paper/repo drift, weak identity+versioning.');
  K.contentHeader(s, A, 'Assessment', 'Limitations & unresolved questions', '');
  s.addText([
    { text: 'No quality re-proof in 2.0 — throughput only; 1.0 headlines have no seeds/error bars.', options: { bullet: true, breakLine: true } },
    { text: 'Engines are not equivalent — Ray head-node bottleneck; MaxCompute wins text, loses multimodal.', options: { bullet: true, breakLine: true } },
    { text: 'Vendor-adjacent numbers — all 2.0 large-scale runs on Alibaba Cloud infra.', options: { bullet: true, breakLine: true } },
    { text: 'Paper/repo drift — operator counts (50/100+/150+/200+/230) and CLI entry point mismatch HEAD.', options: { bullet: true, breakLine: true } },
    { text: 'Record identity = caller-supplied __dj__uid; no system dataset version/digest.', options: { bullet: true, breakLine: true } },
    { text: 'Multimodal schema embeds structure into a string; each modality grows the token surface.', options: { bullet: true } },
  ], { x: K.M, y: 2.2, w: K.W - 2 * K.M, h: 4.4, fontFace: K.BODY, fontSize: 14, color: K.h(K.INK), lineSpacingMultiple: 1.08, paraSpaceAfter: 12 });
  K.footer(s, LABEL, SRC);
}

// 12 — lessons
{
  const s = add('Enterprise mapping: recipe+sigual implemented; policy partial; identity & version are the hard gaps.');
  K.contentHeader(s, A, 'Enterprise lessons', 'Mapping onto a data-lake control plane', 'Interpretation — what a homegrown platform should copy vs add.');
  const rows = [
    [ { text: 'Concept', options: { bold: true, fill: A, color: 'FFFFFF' } }, { text: 'Data-Juicer today', options: { bold: true, fill: A, color: 'FFFFFF' } }, { text: 'Verdict', options: { bold: true, fill: A, color: 'FFFFFF' } } ],
    [ 'Recipe', 'YAML, jsonargparse, Git-versionable', 'strong — copy it' ],
    [ 'Signal (stats)', 'compute_stats; but keep_stats defaults false', 'implemented; persist it' ],
    [ 'Policy', 'op thresholds + validators block', 'partial; add registry/audit' ],
    [ 'Record identity', '__dj__uid, caller-supplied', 'partial — add digest id' ],
    [ 'Dataset version', 'no content-addressed id / manifest', 'missing — add it' ],
    [ 'Provenance', 'Tracer + per-OP lineage reports', 'partial; make it a graph' ],
  ];
  K.tab(s, { x: K.M, y: 2.15, w: K.W - 2 * K.M, colW: [2.6, 5.6, 4.0], rows, rowH: 0.42, baseSize: 11 });
  K.footer(s, LABEL, SRC);
}

// 13 — key takeaways
{
  const s = add('Takeaways: adopt recipe+operator+probe; add stable identity + versioning + queryable lineage.');
  K.contentHeader(s, A, 'Key takeaways', 'What to take into a review', '');
  const items = [
    ['01', 'Treat recipes, operators, and signals as production-grade primitives — they are the directly borrowable core.'],
    ['02', 'Copy the Probe idea: measure first, then order the DAG and allocate resources.'],
    ['03', 'Do not treat the 3-engine facade as free — publish a per-operator support matrix.'],
    ['04', 'Add the two missing governance layers: stable record id + content-addressed dataset version.'],
  ];
  items.forEach((it, i) => {
    const y = 2.25 + i * 1.12;
    K.badge(s, A, { x: K.M, y, n: it[0], d: 0.5 });
    s.addText(it[1], { x: K.M + 0.72, y, w: K.W - 2 * K.M - 0.72, h: 0.95, fontFace: K.BODY, fontSize: 13.5, color: K.h(K.INK), valign: 'top', lineSpacingMultiple: 1.05 });
  });
  K.footer(s, LABEL, SRC);
}

// 14 — references
{
  const s = add('References: both papers, repo, docs, Sandbox paper.');
  K.contentHeader(s, A, 'References', 'Sources & links', '');
  const rows = [
    [ { text: 'Source', options: { bold: true, fill: A, color: 'FFFFFF' } }, { text: 'URL', options: { bold: true, fill: A, color: 'FFFFFF' } } ],
    [ 'Data-Juicer (SIGMOD 2024 Companion)', 'arxiv.org/abs/2309.02033' ],
    [ 'Data-Juicer 2.0 (NeurIPS 2025)', 'arxiv.org/abs/2501.14755' ],
    [ 'Repository (Apache-2.0)', 'github.com/datajuicer/data-juicer' ],
    [ 'Documentation', 'datajuicer.github.io/data-juicer' ],
    [ 'Data-Juicer Sandbox (ICML 2025)', 'arxiv.org/abs/2407.11784' ],
  ];
  K.tab(s, { x: K.M, y: 2.3, w: K.W - 2 * K.M, colW: [5.2, 7.0], rows, rowH: 0.5, baseSize: 12 });
  K.footer(s, LABEL, SRC);
}

pptx.writeFile({ fileName: '/Users/wangyong/projects/github/wangyong1972/docs/papers/data-juicer/deck.pptx' })
  .then(() => console.log('WROTE deck.pptx (data-juicer)'))
  .catch((e) => { console.error(e); process.exit(1); });