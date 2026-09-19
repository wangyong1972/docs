# OmniTable — Introduction Deck

Reading material and two presentation versions for the **VLDB 2026 Best Industry Paper** on
unifying logical structure while separating physical layout in a data lake.

---

## 📄 The Paper

| | |
|---|---|
| **Title** | OmniTable: A Unified Wide-Table System for Petabyte-Scale LLM Data Curation and Exploration |
| **Authors** | Yuzhuo Fu et al. — 19 authors, all at **Ant Group**; corresponding author Jun Zhou |
| **Venue** | PVLDB Vol. 19, No. 12, pp. 4276–4289, 2026 |
| **Award** | **VLDB 2026 Best Industry Paper** |
| **DOI** | [10.14778/3827998.3828032](https://doi.org/10.14778/3827998.3828032) |
| **arXiv** | [2609.11148](https://arxiv.org/abs/2609.11148) (2026-09-10), CC BY-NC-ND 4.0 |
| **PDF** | [vldb.org/pvldb/vol19/p4276-fu.pdf](https://www.vldb.org/pvldb/vol19/p4276-fu.pdf) |

**No official code repository exists.** The paper is an architecture blueprint for an internal
production system; it contains no code-availability or artifact statement, and no Ant Group
repository for OmniTable is published. Searching GitHub for "OmniTable" returns only unrelated
projects. The system itself runs at Ant Group on 35 PB / 305B+ records.

---

## 🎬 Two Versions

The deck exists in two builds, because the paper's material splits into two registers:
single-file HTML for the argument, Slidev for code and diagrams.

### 1. Outline deck — single-file HTML

- **Live:** [https://wangyong1972.github.io/docs/papers/omnitable/](https://wangyong1972.github.io/docs/papers/omnitable/)
- **Local:** `papers/omnitable/deck.html`
- **PDF:** `papers/omnitable/deck.pdf` (26 pages)
- **Slides:** 26 across 6 sections

No build step, no dependencies — open the file directly. Left outline sidebar is derived from the
DOM, plus laser pointer, fullscreen, theme/font/transition settings, print-to-PDF, and `#N` deep links.

### 2. Slidev deck — code-heavy build

- **Live (built SPA):** [https://wangyong1972.github.io/docs/papers/omnitable/slidev/build/](https://wangyong1972.github.io/docs/papers/omnitable/slidev/build/)
- **Source:** `papers/omnitable/slidev/slides.md`
- **PDF:** `papers/omnitable/slidev/slides-export.pdf` (34 pages)
- **Slides:** 34

Shiki-highlighted code with step-through line highlighting, Mermaid diagrams (virtual-view graph,
five-layer Table Family, query-resolution flowchart, Prepare–Execute–Commit sequence diagram), and
incremental reveals. This is the better version when the audience wants the implementation detail.

---

## 🎯 What the Deck Argues

Focused on the **data-lake** angle rather than the LLM-lifecycle plumbing:

- **Where lakehouse formats stop** — Delta Lake / Iceberg / Paimon give ACID, time travel and schema
  evolution, but the table is simultaneously the logical *and* physical unit.
- **The wide table is a virtual view** — one logical table, no physical existence, resolved per query.
- **The Table Family** — five-layer entity model (`LogicalTable` → `LogicalColumn` →
  `PhysicalTableGroup` → `PhysicalTable` → `PhysicalColumn`) with exactly **one layer of indirection**
  between semantics and layout.
- **How a query actually resolves** — a multi-table JOIN on the global key with `UNION ALL` across
  batches, plus predicate pushdown, column pruning and batch pruning.
- **Column splitting past the 1200-column wall** — crossing MaxCompute's hard limit by rewriting
  mapping pointers only: P95 25 s → 38 s across 200 → 2500 logical columns (1.53×).
- **Keeping it consistent** — Prepare–Execute–Commit, staged writes, snapshot reads, atomic publish.

Reconstructed SQL and illustrative table names are **labelled as such on the slides**; the paper
describes its rewrite but never prints the SQL.

---

## 🛠 Rebuilding the Slidev Version

```bash
cd papers/omnitable/slidev
pnpm install
pnpm exec slidev                                  # live preview on :3030
pnpm exec slidev export --executable-path "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
pnpm exec slidev build --base /docs/papers/omnitable/slidev/build/ --out build
```

- Use **pnpm**, not npm.
- Export must be pointed at the system Chrome; Playwright's managed browser cannot be installed here.
- `slidev export` prints success and then exits non-zero because a Chrome helper lingers — trust the output file.
- The `--base` value must match the published path or the built SPA loads no assets.

---

## ✅ QA Notes

Both decks were verified for content clipping by measuring real geometry in headless Chrome, not by
eyeballing a build:

- **Outline deck:** all 26 slides measured against the fixed 1400×900 stage — 0 clipped, 0 tight,
  navigation verified in sync. Two real defects were caught this way and fixed (a 31 px overflow on
  the virtual-view diagram, and a **602 px** overflow from a vertical Table Family graph, converted
  to horizontal and split across two slides).
- **Slidev deck:** all 34 slides measured — 0 clipped, 0 tight, and 0 horizontal overflow (the
  bundled verifier only measures the bottom edge, so a separate horizontal check was added for the
  Mermaid graphs).

The outline deck also carries a **deck-local `@media print` fix**. The upstream template's print CSS
breaks only *after* `#stage` and leaves `#stage` / `#stage-wrap` at `height:100vh; overflow:hidden`,
so a 26-slide deck printed as a single clipped page. The override here gives each slide its own page.
