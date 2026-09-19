# docs — Presentations & Reference

This repository hosts online presentations and reference documentation by [wangyong1972](https://github.com/wangyong1972).

Hosted live via GitHub Pages:
👉 **[https://wangyong1972.github.io/docs/](https://wangyong1972.github.io/docs/)**

---

## 📽 Presentations

### [Presentation Skills Guide](https://wangyong1972.github.io/docs/presentation-skills/)
- **Live Slide Deck:** [https://wangyong1972.github.io/docs/presentation-skills/](https://wangyong1972.github.io/docs/presentation-skills/)
- **Local Path:** `presentation-skills/deck.html`
- **Topics Covered:**
  - `generate-outline-deck` — Single-file interactive HTML presentation framework with auto-derived left outline sidebar, toolbar (laser pointer, fullscreen, PDF export), dark-mode default, and deep-link navigation.
  - `pptx` — Native Microsoft PowerPoint OpenXML presentation authoring via `pptxgenjs` and template surgery.
  - Local marketplace setup (`claude-plugins-local`) and registering in Claude Code.
  - Local preview, headless rendering QA, and publishing to GitHub Pages.

---

## 📚 Papers

### [OmniTable — Logical Unification, Physical Separation](https://wangyong1972.github.io/docs/papers/omnitable/)
- **Outline Deck:** [https://wangyong1972.github.io/docs/papers/omnitable/](https://wangyong1972.github.io/docs/papers/omnitable/)
- **Slidev Deck (built SPA):** [https://wangyong1972.github.io/docs/papers/omnitable/slidev/build/](https://wangyong1972.github.io/docs/papers/omnitable/slidev/build/)
- **Local Path:** `papers/omnitable/`
- **Paper:** [OmniTable: A Unified Wide-Table System for Petabyte-Scale LLM Data Curation and Exploration](https://arxiv.org/abs/2609.11148) — PVLDB Vol. 19, No. 12, 2026 · **VLDB 2026 Best Industry Paper** · Ant Group
- **Topics Covered:**
  - Where lakehouse formats (Delta Lake / Iceberg / Paimon) stop — the table is both the logical *and* physical unit.
  - The wide table as a **virtual view**: no physical existence, resolved per query.
  - The **Table Family** five-layer entity model and its single layer of indirection between semantics and layout.
  - Query resolution: multi-table JOIN on the global key, `UNION ALL` across batches, pushdown / column prune / batch prune.
  - Column splitting past MaxCompute's ~1200-column wall by rewriting mapping pointers only.
  - Prepare–Execute–Commit: staged writes, snapshot reads, atomic publish.
- **Note:** the paper has **no public code repository**; it is an architecture blueprint for an internal Ant Group system.

### [DataProphet — Predicting Data Influence Before Training](https://wangyong1972.github.io/docs/papers/DataProphet/)
- **Outline Deck:** [https://wangyong1972.github.io/docs/papers/DataProphet/](https://wangyong1972.github.io/docs/papers/DataProphet/)
- **Slidev Deck (built SPA):** [https://wangyong1972.github.io/docs/papers/DataProphet/slidev/build/](https://wangyong1972.github.io/docs/papers/DataProphet/slidev/build/)
- **Local Path:** `papers/DataProphet/`
- **Paper:** [Demystifying Supervision Data Generalization in Multimodal LMs](https://proceedings.iclr.cc/paper_files/paper/2026/hash/edcd1aa172dceda2ea9d45a48f25d3e3-Abstract-Conference.html) — **ICLR 2026** · [code (MIT)](https://github.com/DataProphet26/dataprophet) · [dataset](https://huggingface.co/datasets/THUQiXuan/DataProphet)
- **Topics Covered:**
  - Predicting a dataset's influence on a target benchmark **before any training**, with a training-free metric.
  - The measured **14 × 14 influence matrix**: influence is asymmetric, and dataset-specific rather than task-category-specific.
  - DATAPROPHET = multimodal perplexity × cross-modal similarity × source diversity, and why the product form matters.
  - Why influence being asymmetric forces a **two-way evaluation protocol** (τ_Tgt and τ_Src).
  - Ablation ordering: perplexity ≫ image similarity ≈ diversity > text similarity; plus four heuristics that failed.
  - Data selection on real, synthetic and RL pools — including why "beats the Oracle by 0.2%" should be discounted.

---

### [Data-Juicer 1.0 → 2.0 — A Data OS for Foundation Models](https://wangyong1972.github.io/docs/papers/data-juicer/)
- **Local Path:** `papers/data-juicer/`
- **Papers:** [Data-Juicer](https://arxiv.org/abs/2309.02033) · [Data-Juicer 2.0](https://arxiv.org/abs/2501.14755) — **SIGMOD 2024 Companion** + **NeurIPS 2025 Spotlight** · [code (Apache-2.0)](https://github.com/datajuicer/data-juicer)
- **Deliverables:** `README.md` (bilingual 17-section summary) · `deck.pptx` (editable English deck) · `deck-source/` · `sources.md`
- **Topics Covered:**
  - The Operator abstraction + YAML recipes; Filter's `compute_stats → bool` split; `text/meta/stats` sample model.
  - The 1.0 → 2.0 evolution: multimodal token-aligned schema, Ray/MaxCompute facade, runtime Probe (adaptive reordering/batch/GPU).
  - Verified scale figures (70B samples ≈2.1 h @ 6,400 cores; 5 TB dedup 2.8 h) and the two hard governance gaps (record identity, dataset versioning).

### [Dolma — Three Trillion Tokens as Documents + Attributes](https://wangyong1972.github.io/docs/papers/dolma/)
- **Local Path:** `papers/dolma/`
- **Paper:** [Dolma: an Open Corpus of Three Trillion Tokens](https://aclanthology.org/2024.acl-long.840/) — **ACL 2024 Best Resource Paper** · [code](https://github.com/allenai/dolma) · [dataset](https://huggingface.co/datasets/allenai/dolma)
- **Deliverables:** `README.md` (bilingual) · `deck.pptx` · `deck-source/` · `sources.md`
- **Topics Covered:**
  - Documents stored once, attributes as detached span scores, thresholds applied at `dolma mix` via JSONPath.
  - Exact-key Bloom dedup (URL 53.2% → doc 14.9% → paragraph 18.7%) — *not* MinHash; Rust rayon + Python multiprocessing, no Spark.
  - Why the "three trillion" ≠ "trained-on" (3,059B full vs 1,715B actually trained in v1.7), and the signal-preserving lifecycle.

### [DataComp-LM — Fix the Model, Change Only the Data](https://wangyong1972.github.io/docs/papers/datacomp-lm/)
- **Local Path:** `papers/datacomp-lm/`
- **Paper:** [DataComp-LM: In Search of the Next Generation of Training Sets](https://arxiv.org/abs/2406.11794) — **NeurIPS 2024 Datasets & Benchmarks** · [code (MIT)](https://github.com/mlfoundations/dclm) · [leaderboard](https://datacomp.ai/dclm/)
- **Deliverables:** `README.md` (bilingual) · `deck.pptx` · `deck-source/` · `sources.md`
- **Topics Covered:**
  - The DCLM-Pool (240T tokens, CC 2013–2022), two tracks (filter + mixing), fixed OpenLM training, 53-task evaluation.
  - DCLM-Baseline (7B/2.6T: Core 57.1 / MMLU 63.7 / Ext 45.4), 416 logged experiments, and measured rank transfer r = 0.838/0.956/0.982.
  - Benchmark infrastructure vs reusable production infrastructure, and the careful versioning of the evaluation metric (v1/v2).

---

## 💻 Running Locally

You can open the presentation directly in any browser:

```bash
# Clone this repo
git clone https://github.com/wangyong1972/docs.git ~/projects/github/wangyong1972/docs
cd ~/projects/github/wangyong1972/docs

# Open in default browser
open presentation-skills/deck.html

# Or launch local HTTP server
python3 -m http.server 8000
# Visit http://127.0.0.1:8000/presentation-skills/
```

### Shortcuts in the Presentation
- `→` / `Space` / `PageDown`: Next slide
- `←` / `PageUp`: Previous slide
- `Home` / `End`: First / last slide
- `o`: Toggle left outline sidebar
- `l`: Toggle laser pointer dot (follows mouse)
- `f`: Fullscreen
- `p`: Browser print-to-PDF
- `s`: Settings (switch dark/light theme, typography, transitions)
- `#N` URL hash: Direct deep link to slide `N` (e.g. `deck.html#5`)
