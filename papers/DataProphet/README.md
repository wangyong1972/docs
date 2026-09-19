# DataProphet — Introduction Deck

Reading material and two presentation versions for the **ICLR 2026** paper on predicting,
before any training, how much a supervision dataset will help a target benchmark.

---

## 📄 The Paper

| | |
|---|---|
| **Title** | Demystifying Supervision Data Generalization in Multimodal LMs |
| **Authors** | Xuan Qi (UPenn / Tsinghua), Luxi He (Princeton), Dan Roth (UPenn), Xingyu Fu (UPenn / Princeton) |
| **Venue** | **ICLR 2026** |
| **Page** | [ICLR 2026 proceedings](https://proceedings.iclr.cc/paper_files/paper/2026/hash/edcd1aa172dceda2ea9d45a48f25d3e3-Abstract-Conference.html) |
| **Code** | [github.com/DataProphet26/dataprophet](https://github.com/DataProphet26/dataprophet) — **MIT** |
| **Data** | [huggingface.co/datasets/THUQiXuan/DataProphet](https://huggingface.co/datasets/THUQiXuan/DataProphet) |
| **Project** | [dataprophet26.github.io](https://dataprophet26.github.io/) |

**The core question:** given a training dataset, can you predict its influence on a target benchmark
*before any training takes place*? The answer is yes, and without training — via a metric that
multiplies multimodal perplexity, cross-modal similarity, and source-data diversity.

**The stronger half is the measurement, not the method.** Across a measured 14 × 14 influence matrix
(14 datasets × 7 task families), the paper shows that intuitive task similarity is an unreliable guide:
influence is **asymmetric** (Open-Spatial → DocVQA is 15.92% while the reverse is 26.14%), and
transfer is decided by the **individual dataset** rather than the task category (training on OCR-VQA
helps the map task GeomVerse by 21.74%, more than the same-family OCR task ScreenQA at 17.88%).

---

## 🎬 Two Versions

### 1. Outline deck — single-file HTML

- **Live:** [https://wangyong1972.github.io/docs/papers/DataProphet/](https://wangyong1972.github.io/docs/papers/DataProphet/)
- **Local:** `papers/DataProphet/deck.html`
- **PDF:** `papers/DataProphet/deck.pdf` (22 pages)
- **Slides:** 22 across 5 sections

No build step and no dependencies. Left outline sidebar derived from the DOM, plus laser pointer,
fullscreen, theme/font/transition settings, print-to-PDF, and `#N` deep links.

### 2. Slidev deck — math and diagrams

- **Live (built SPA):** [https://wangyong1972.github.io/docs/papers/DataProphet/slidev/build/](https://wangyong1972.github.io/docs/papers/DataProphet/slidev/build/)
- **Source:** `papers/DataProphet/slidev/slides.md`
- **PDF:** `papers/DataProphet/slidev/slides-export.pdf` (29 pages)
- **Slides:** 29

KaTeX-rendered equations, Shiki code highlighting, and incremental reveals. This is the better
version for the metric itself — the perplexity, silhouette and entropy definitions are all typeset.

---

## 🎯 What the Deck Argues

- **The question** — predicting influence with zero training, and why that is worth having
- **What intuition gets wrong** — the three counter-intuitive findings, each with its numbers
- **The metric** — perplexity × similarity × diversity, why it is a *product*, and the two-way
  evaluation protocol that the asymmetry finding forces
- **Results** — τ = 0.860 correlation, the ablation ordering (perplexity ≫ image similarity ≈
  diversity > text similarity), the four heuristics that failed, and selection on real, synthetic
  and RL pools
- **Assessment** — the one claim to reject, and the constraints to write down

The deck is deliberately explicit about the weakest claim: the paper reports DATAPROPHET
**edging its "Oracle" by 0.2%**, but there are no seeds or confidence intervals, and the Oracle is
built from 20K-per-source observations extrapolated to a 280K mixture — exactly as DATAPROPHET is,
so it is not a strict upper bound. That is flagged on the slide rather than smoothed over.

---

## 🛠 Rebuilding the Slidev Version

```bash
cd papers/DataProphet/slidev
pnpm install
pnpm exec slidev                                  # live preview on :3030
pnpm exec slidev export --executable-path "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
pnpm exec slidev build --base /docs/papers/DataProphet/slidev/build/ --out build
```

- Use **pnpm**, not npm.
- The `--base` value must match the published path or the built SPA loads no assets.
- **Run the build, not just the dev server, before publishing.** A multi-line `\begin{aligned}`
  KaTeX block rendered fine in the dev server but broke the production build with
  `Attribute name cannot contain U+0022 ...`. Dev-server verification alone would have shipped a
  broken SPA.

---

## ✅ QA Notes

Both decks were verified by measuring real geometry in headless Chrome:

- **Outline deck:** all 22 slides measured against the fixed 1400×900 stage — 0 clipped, 0 tight,
  navigation verified in sync.
- **Slidev deck:** all 29 slides measured — 0 clipped, and 0 horizontal overflow. One slide sits at
  33px of vertical headroom (fits, close). A separate horizontal check was needed because the bundled
  verifier only measures the bottom edge, and wide display math overflows sideways — the perplexity
  equation did, by 75px, before being compressed.
- **Production build verified**, which is what caught the KaTeX regression above.

The outline deck also carries a deck-local `@media print` fix, since the upstream template's print CSS
leaves `#stage` / `#stage-wrap` at `height:100vh; overflow:hidden` and prints a multi-slide deck as a
single clipped page.
