---
theme: seriph
title: DataProphet — Predicting Data Influence Before Training
info: |
  An introduction to DataProphet (ICLR 2026): can you predict, before any training,
  how much a supervision dataset will help a target benchmark? Focus on the
  counter-intuitive evidence, the training-free metric, and what to discount.
transition: slide-left
mdc: true
highlighter: shiki
lineNumbers: false
---

# DataProphet

### Demystifying Supervision Data Generalization in Multimodal LMs

Can you predict — *before any training* — how much a given supervision dataset will help a given target benchmark?

<div class="pt-10">
  <span class="px-2 py-1 rounded bg-white bg-opacity-10 text-sm">
    ICLR 2026 · code &amp; data released (MIT)
  </span>
</div>

<!--
The paper's stronger half is the measurement, not the method. Lead with the evidence.
-->

---
layout: default
---

# What this deck covers

<v-clicks>

- **The question** — predicting data influence with zero training
- **What intuition gets wrong** — three counter-intuitive findings from a measured 14×14 matrix
- **The metric** — perplexity × similarity × diversity, and why it is a product
- **Results** — correlation, ablation, and data selection on real and synthetic pools
- **Assessment** — the one claim to reject, and the constraints to write down

</v-clicks>

<!--
Every number here is from the paper except where explicitly flagged as my own verification.
-->

---
layout: section
---

# The Question

Can influence be predicted before any training takes place?

---

# The paper

| | |
|---|---|
| **Title** | Demystifying Supervision Data Generalization in Multimodal LMs |
| **Venue** | ICLR 2026 |
| **Authors** | Xuan Qi (UPenn / Tsinghua), Luxi He (Princeton), Dan Roth (UPenn), Xingyu Fu (UPenn / Princeton) |
| **Code** | `github.com/DataProphet26/dataprophet` — **MIT**, 17 files |
| **Data** | HuggingFace `THUQiXuan/DataProphet` |
| **Project** | `dataprophet26.github.io` |

<div class="pt-4 opacity-80 text-sm">

Completed during Xuan Qi's summer research internship at UPenn. Reproducibility is unusually good for an ICLR paper.

</div>

---

# The question, stated precisely

<div class="p-4 rounded border border-gray-400 border-opacity-30">

Given a training dataset $D_i$, can we predict its influence on a target benchmark $T_j$ **before any training takes place**?

</div>

<v-clicks>

- Influence is a **relative performance change**:

$$\Delta_{s\to t}=\frac{A^{s}_{t}-A_{t}}{A_{t}}$$

- i.e. how much target $t$ improves after fine-tuning on source $s$; the reverse is $\Delta_{t\to s}$
- The conventional approach trusts **intuitive task similarity** — text-rich vs vision-centric

</v-clicks>

---

# The setup: a complete 14 × 14 matrix

<div class="grid grid-cols-2 gap-6 pt-2">

<div class="p-4 rounded border border-gray-400 border-opacity-30">

**Design**

- Base model **InternVL3-2B**
- **20K** train / **1K** test per source
- **Fixed compute** — same volume, model, optimizer, scheduler, epochs, batch size
- Full-parameter SFT, 1 epoch, lr 1e−5 (LLaMA-Factory)

</div>

<div class="p-4 rounded border border-gray-400 border-opacity-30">

**14 datasets, 7 task families (2 each)**

- **OCR** — OCR-VQA, ScreenQA
- **Chart** — ChartQA, Chart2Text
- **Document** — DocVQA, FinanceQA
- **General VQA** — A-OKVQA, VC-GVQA
- **Spatial** — Open-Spatial, CLEVR-Relation
- **Counting** — CLEVR-Counting, TallyQA
- **Map** — GeomVerse, MapQA

</div>

</div>

<div class="pt-4 opacity-80 text-sm">

Every claim in the paper rests on this one matrix — measured, not assumed.

</div>

---
layout: section
---

# What Intuition Gets Wrong

Three findings from the measured matrix

---

# Finding 1 — influence is *asymmetric*

<div class="grid grid-cols-2 gap-6 pt-2">

<div class="p-4 rounded border border-gray-400 border-opacity-30">

**Open-Spatial → DocVQA**

<div class="text-3xl pt-2">15.92%</div>

</div>

<div class="p-4 rounded border border-gray-400 border-opacity-30">

**DocVQA → Open-Spatial**

<div class="text-3xl pt-2">26.14%</div>

</div>

</div>

<v-clicks>

- $\Delta_{s\to t}\neq\Delta_{t\to s}$ — influence is not a symmetric similarity score
- Diagonal gains are still largest: same-distribution data remains most influential

</v-clicks>

<br>

> **Implication:** influence is a **directed graph**, not a scalar property of a dataset. Any single "how good is this dataset" number discards this by construction.

---

# Finding 2 — same task family ≠ most help

After training on **OCR-VQA**:

<div class="grid grid-cols-2 gap-6 pt-4">

<div class="p-4 rounded border border-gray-400 border-opacity-30">

**ScreenQA** — also OCR

<div class="text-3xl pt-2">+17.88%</div>

</div>

<div class="p-4 rounded border border-gray-400 border-opacity-30">

**GeomVerse** — map understanding

<div class="text-3xl pt-2">+21.74%</div>

</div>

</div>

<div class="pt-6 text-lg opacity-90">

Training on OCR helps a *map* task more than it helps another *OCR* task. The paper's phrasing: influence is decided by the **individual dataset**, not the task category.

</div>

---

# Finding 3 — text-rich helps vision-centric most

The intuition: OCR and charts both require extracting text and numbers from images, so OCR data should help chart tasks most.

After training on **ScreenQA** (an OCR dataset):

<div class="grid grid-cols-2 gap-6 pt-4">

<div class="p-4 rounded border border-gray-400 border-opacity-30">

**Text-rich targets**

- ChartQA — **+5.61%**
- Chart2Text — **+6.13%**

</div>

<div class="p-4 rounded border border-gray-400 border-opacity-30">

**Vision-centric targets**

- Open-Spatial — **+12.86%**
- CLEVR-Relation — **+7.96%**

</div>

</div>

<div class="pt-6 text-lg opacity-90">

The result is the **reverse** of the intuition. Surface similarity does not predict transfer.

</div>

---
layout: statement
---

# Intuition about task similarity

# is an unreliable guide

# to transfer

---
layout: section
---

# The Metric

A predictor you can actually compute

---

# DATAPROPHET, in one equation

$$\mathcal{M}(s\to t)=\mathrm{QSim}\cdot \mathrm{ASim}\cdot \mathrm{ISim}\cdot \mathrm{PPL}(s)\cdot \frac{\mathrm{Sil}+H}{\mathrm{PPL}(t)}$$

<v-clicks>

- **QSim / ASim / ISim** — question, answer and image similarity between source and target
- **PPL(s) / PPL(t)** — multimodal perplexity of the source, divided by the target's
- **Sil + H** — source question diversity (silhouette + cluster-balance entropy)
- Every component is computed with the **frozen base model** — no training anywhere

</v-clicks>

---

# Component 1 — multimodal perplexity

$$\mathrm{PPL}(\mathcal{D})=\exp\left(-\mathbb{E}_{\mathcal{D}}\,\mathbb{E}_{t}\log p_\theta(a_t \mid I,\ \tau_Q(Q),\ a_{<t})\right)$$

<v-clicks>

- **Hypothesis:** intrinsically *harder* source data provides greater value for enhancing capability
- Precedent in LLM work — perplexity as a data-quality estimator for corpus pruning
- **Insufficient alone:** perplexity-only gives $\tau_{\mathrm{Tgt}}=0.274$

</v-clicks>

<div class="pt-4 opacity-80 text-sm">

It is, however, the single most important factor once combined — see the ablation.

</div>

---

# Component 2 — cross-dataset similarity

<v-clicks>

- If source data resembles the target in the model's **embedding space**, it should be closer to "learning the target distribution"
- Encode **questions, answers and images separately** with the base MLLM's **frozen encoders**, ℓ₂-normalize, take expected cosine similarity → **QSim, ASim, ISim**

</v-clicks>

<div class="pt-2 p-4 rounded border border-gray-400 border-opacity-30">

**A negative result worth recording:** encoding question and answer *jointly* as `QASim` was **6% worse** in τ than keeping them separate.

</div>

<div class="pt-4 opacity-80 text-sm">

Still not enough on its own: PPL × similarity gives $\tau_{\mathrm{Tgt}}=0.658$.

</div>

---

# Component 3 — source question diversity

<v-clicks>

- **Hypothesis:** a source whose questions cover more ground encourages more generalizable skills
- Embed each source question, **K-means into K = 10** clusters, then measure separation and balance

</v-clicks>

<div class="grid grid-cols-2 gap-6 pt-2">

<div class="p-4 rounded border border-gray-400 border-opacity-30">

**Silhouette — separation**

$$\mathrm{Sil}=\mathbb{E}_{u\sim U}\Big[\tfrac{b(u)-a(u)}{\max\{a(u),b(u)\}}\Big]$$

$a(u)$ = mean intra-cluster distance; $b(u)$ = nearest other cluster.

</div>

<div class="p-4 rounded border border-gray-400 border-opacity-30">

**Entropy — balance**

$$H=-(\log K)^{-1}\sum_{k=1}^{K}\pi_k\log\pi_k$$

$\pi_k$ = empirical cluster proportion.

</div>

</div>

<div class="pt-4 opacity-80 text-sm">

Diversity = **Sil + H**: larger means broader coverage with better-separated, better-balanced clusters.

</div>

---

# Why a product — and how it is scored

<div class="p-4 rounded border border-gray-400 border-opacity-30">

Successful transfer requires **simultaneous** alignment in text, vision, difficulty relative to the base model, and question coverage. The product form therefore **down-weights the score when any single factor is weak**.

</div>

<v-clicks>

- A weighted **sum** would let a strong factor mask a weak one — a product does not
- **Two-way protocol**, because influence is asymmetric: $\tau=(\tau_{\mathrm{Tgt}}+\tau_{\mathrm{Src}})/2$
  - $\tau_{\mathrm{Tgt}}$ — fix a target, rank the 14 sources, compare with reality
  - $\tau_{\mathrm{Src}}$ — fix a source, rank the 14 targets, compare with reality

</v-clicks>

<!--
A single direction could not test whether the predictor captures the asymmetry it claims to model.
-->

---
layout: section
---

# Results

Prediction, ablation, and selection

---

# Does it predict the rankings?

<div class="grid grid-cols-3 gap-4 pt-2">

<div class="p-4 rounded border border-gray-400 border-opacity-30">

**τ_Tgt average**

<div class="text-3xl pt-1">0.863</div>
<div class="text-sm opacity-70">range 0.736 – 0.933</div>

</div>

<div class="p-4 rounded border border-gray-400 border-opacity-30">

**τ_Src average**

<div class="text-3xl pt-1">0.857</div>
<div class="text-sm opacity-70">range 0.822 – 0.911</div>

</div>

<div class="p-4 rounded border border-gray-400 border-opacity-30">

**Headline**

<div class="text-3xl pt-1">86.0%</div>
<div class="text-sm opacity-70">Kendall's τ, both directions</div>

</div>

</div>

<v-clicks>

- Consistently high across all 7 task families — not driven by one easy target
- The metric captures the **asymmetry**, which a symmetric similarity score could not

</v-clicks>

---

# Ablation: what actually carries the signal

| Variant | Kendall's τ (avg) |
|---|---|
| **Full DATAPROPHET** | **0.860** |
| w/o Answer Similarity | 0.810 |
| w/o Question Similarity | 0.778 |
| w/o Diversity (Silhouette & Entropy) | 0.659 |
| w/o Image Similarity | 0.625 |
| **w/o Perplexity** | **0.487** |

<div class="pt-4 opacity-90">

Ordering: **perplexity > image similarity ≈ diversity > text similarity**.

</div>

---

# The heuristics that did *not* work

All of these were tried, and none improved prediction:

<div class="grid grid-cols-2 gap-6 pt-2">

<div class="p-4 rounded border border-gray-400 border-opacity-30">

- Question difficulty
- Model's familiarity with the image

</div>

<div class="p-4 rounded border border-gray-400 border-opacity-30">

- Model's familiarity with the question
- Answer length — adding it **decreased τ by 0.15**

</div>

</div>

<div class="pt-6 text-lg opacity-90">

Most "sensible-looking" data properties do not predict transfer. Publishing this list is more useful to successors than publishing only what worked.

</div>

---

# From prediction to selection

Fixed budget **N = 280K** — reweight each source by its DATAPROPHET score.

<div class="grid grid-cols-2 gap-6 pt-2">

<div class="p-4 rounded border border-gray-400 border-opacity-30">

**Real data**

| Method | Avg | Δ |
|---|---|---|
| Uniform | 67.6 | — |
| ICONS | 69.6 | +2.0 |
| Oracle | 70.8 | +3.2 |
| **D.P.** | **71.0** | **+3.4** |

</div>

<div class="p-4 rounded border border-gray-400 border-opacity-30">

**Synthetic data (~1.4M pool)**

| Method | Avg | Δ |
|---|---|---|
| Uniform | 55.1 | — |
| ICONS | 60.8 | +5.7 |
| **D.P.** | **62.0** | **+6.9** |

</div>

</div>

<div class="pt-3 opacity-80 text-sm">

D.P. beats the trained selector in both settings — reportedly **edging the Oracle by 0.2%**.

</div>

---

# It also works for RL, and ranks the generators

<v-clicks>

- **GRPO** via **verl** on Qwen2.5VL-3B-Instruct, prompt budget 300×14:
  - Real RL data: no-RL 55.7 → Equal 58.3 → **D.P. 59.5**
  - Synthetic RL data: baseline 56.4 → Random 56.4 → **D.P. 57.7**
- So the SFT conclusion **transfers to post-training** — a genuine broadening

</v-clicks>

<div class="pt-2 p-4 rounded border border-gray-400 border-opacity-30">

**A neat by-product:** of the selected synthetic items, **38% came from GPT-5 and 62% from Gemini 2.5 Pro** — the selector implicitly ranks Gemini's data higher.

</div>

---
layout: section
---

# Assessment

What to take, and what to discount

---

# What to take

<v-clicks>

- **Treat influence as a directed quantity.** $\Delta_{s\to t}\neq\Delta_{t\to s}$ is measured, so a single quality score per dataset is structurally insufficient. **This is the big one.**
- **"Looks similar" is not evidence.** If mixture weights come from task-similarity intuition, this paper says that heuristic is unreliable
- **Perplexity is the best single cheap signal** — and it points the same way as the dedup finding that high-frequency repetition means low information density
- **Multiply when conditions must hold jointly** — sums hide weak factors
- **Publish the failed heuristics** — four of them here, all plausible, none predictive

</v-clicks>

---

# What to discount

<v-clicks>

- **"Beats the Oracle by 0.2%" is not a real result.** No seeds, no variance, no confidence intervals — 0.2% on a 14-benchmark macro average is indistinguishable from noise. Worse, the Oracle is built from **20K-per-source** observations extrapolated to a 280K mixture, exactly as D.P. is, so it is not a strict upper bound
- **Everything rests on one 2B model** (InternVL3-2B). The matrix, the ablations, the gains — no second family, no larger model
- **"Training-free" is not "model-free."** PPL uses the base model and the similarities use its frozen encoders, so **scores do not transfer across models** — change the base and recompute everything
- **2 datasets per task family** is thin support for a general claim about task *categories*
- **Small scale**: 20K samples, 1 epoch. Real instruction tuning is 100K–millions, multi-epoch
- **The Gemini-vs-GPT-5 comparison is confounded** — the two generators saw *different* image halves

</v-clicks>

---

# Takeaways for our own work

<v-clicks>

- **Model data value as a matrix, not a vector.** If you must collapse it, be explicit about which direction you are collapsing
- **Budget for a cheap scorer.** Perplexity over candidates plus one embedding pass is far cheaper than a proxy sweep — but not free at millions of candidates
- **Write down the base-model dependency.** Any embedding- or perplexity-based score is bound to the model that produced it; that must be stated before anyone plans to reuse it
- **Use a selector's preferences to rank sources** — "62% of picked items came from Gemini" is a lightweight, useful way to compare data generators
- **Reproducibility is achievable** — MIT code, public dataset, project page. Worth matching

</v-clicks>

---
layout: center
---

# Questions

<div class="pt-6 opacity-70 text-sm">

Full written analysis (Chinese + English) lives in `my-wiki/05-References/`.

</div>

---
layout: end
---

# Thank you

<style>
.slidev-layout table { font-size: 0.8em; }
.slidev-layout code { font-size: 0.9em; }
/* keep wide display math inside the 980px canvas */
.katex-display { font-size: 0.88em; }
</style>
