# Source index and speaker notes

Reviewed 2026-10-23. Weekly Paper 2026-10-16. Published claims, inferences and proposed applications are distinguished on slides. No downloaded research code or GPU experiment was executed.

## 01. AdaFrame



- Hierarchical Multimodal Deduplication with Adaptive Information Budgeting
- Video advertisement analysis with a content-dependent frame budget
- arXiv v1, October 13, 2026

- [Paper v1](https://arxiv.org/html/2610.19127v1)

**中文讲解：** 场景是视频广告的帧选择及分析。文中 dedup 主要是视频内部冗余帧，不应理解成全库视频去重系统。

## 02. Uniform sampling spends tokens on redundancy



- Repeated or static frames consume VLM inputs with limited extra evidence.
- Human-oriented video summaries may omit details useful to machine extraction.
- The proposed cascade filters cheap redundancy before semantic selection and VLM inference.

- [Paper v1](https://arxiv.org/html/2610.19127v1)

**中文讲解：** 目标任务包括 topic、sentiment、effectiveness。对长电影或安全关键瞬时事件不能直接套用广告的预算策略。

## 03. Semantic energy combines change and salience



- Semantic velocity is the mean CLIP distance between adjacent frames.
- Attention yield combines text, face, and opening/closing positional cues.
- Semantic energy multiplies temporal change by average attention yield.

- [Paper v1](https://arxiv.org/html/2610.19127v1)

**中文讲解：** 权重为 0.4、0.35、0.25，作者在 50 个 held-out ads 上调节。这些 salience 先验明显与广告任务相关。第 4.2 节。

## 04. ISD caps the information budget



- Center the frame embedding matrix and compute its singular values.
- ISD is the smallest rank explaining 90% of squared singular-value energy.
- The frame budget combines duration/energy growth with an ISD-derived ceiling.

- [Paper v1](https://arxiv.org/html/2610.19127v1)

**中文讲解：** ISD 是 embedding 的有效维度代理，不是视频中真实事件数量，也不保证短暂但重要内容必被保留。

## 05. Tier 1 uses perceptual-hash voting



- Compute pHash, dHash, and wHash for each frame.
- A pair counts as duplicate when at least two hashes have Hamming distance below threshold 10.
- One representative per group advances to the next stage.

- [Paper v1](https://arxiv.org/html/2610.19127v1)

**中文讲解：** hash voting 面向近像素重复。单次 hash 比较便宜，但全体候选的配对策略仍影响总复杂度。第 4.3.1 节。

## 06. Tier 2 removes perceptual variants



- AlexNet-based LPIPS compares surviving frames.
- The default merge threshold is 0.15.
- This catches lighting and minor appearance changes that survive hash voting.

- [Paper v1](https://arxiv.org/html/2610.19127v1)

**中文讲解：** LPIPS 较小表示感知相似，不保证任务语义完全一致，例如 OCR 小字变化仍可能重要。第 4.3.2 节。

## 07. Tier 3 balances semantics and time



- CLIP ViT-B/32 embeddings enter k-means with K derived from ISD.
- Temporal-aware NMS subtracts a proximity penalty from attention yield.
- Selection favors informative representatives spread over the timeline.

- [Paper v1](https://arxiv.org/html/2610.19127v1)

**中文讲解：** 默认 temporal decay 2 秒、lambda 0.3。跨时间分散能减少邻近帧扎堆，但也可能稀释连续动作证据。第 4.3.3 节。

## 08. Audio and text remain separate inputs



- The system integrates Whisper-large-v3 transcription and Tesseract OCR.
- Selected visual frames join audio/text signals for VLM extraction.
- Removing visual frames changes only one part of the multimodal pipeline cost.

- [Paper v1](https://arxiv.org/html/2610.19127v1)

**中文讲解：** 不要把 VLM 输入费用下降当成 decode、CLIP、LPIPS、ASR、OCR 与存储总成本下降。第 4.4 与 5.3 节。

## 09. Published results on 500 advertisements



Metric | Uniform 1 FPS | AdaFrame
--- | --- | ---
Frames per video | 47.7 | 24.6
VLM cost for 500 videos | $5.74 | $1.43
Topic accuracy | 84.4% | 86.0%
Primary sentiment accuracy | 71.9% | 79.4%

- [Paper v1](https://arxiv.org/html/2610.19127v1)

**中文讲解：** 表 2，Gemini 2.5 Flash。主 sentiment metric 使用句向量相似度大于 0.7，不能当成 30 类 exact-match accuracy。

## 10. Baselines and quality definitions



- Nine baselines include random, scene detection, CLIP-only, DSNet, and native video input.
- All methods use the same 500 randomly sampled Pitt Ads videos.
- The reported 48% fewer frames and 75% lower cost refer to Uniform-1FPS and VLM expenses.

- [Paper v1](https://arxiv.org/html/2610.19127v1)

**中文讲解：** sentiment exact match 约 30%，论文采用语义匹配为主指标。费用受当时 API 定价、token 和输入方式影响。

## 11. Failure modes and implementation status



- Advertisement-specific salience can miss brief, subtle, or non-salient events.
- Thresholds and ISD depend on the embedding space and candidate sampling.
- The paper says code will be released upon publication. No dedicated public repository is verified here.

- [Paper v1](https://arxiv.org/html/2610.19127v1)

**中文讲解：** 不要伪造 code 链接。500 ads 与单一主 provider 的结果不足以证明任意视频数据管线总成本下降 75%。

## 12. A bounded evaluation proposal



- Compare all selectors at matched frame and VLM-token budgets on a new domain.
- Measure preprocessing wall time, OCR/ASR costs, extraction quality, and total expense.
- Audit short events, text changes, and human disagreement before adopting frame deletion.

- [Paper v1](https://arxiv.org/html/2610.19127v1)

**中文讲解：** 以上是拟议应用与复现路径，尚未执行。可以保存被删帧的索引及理由，支持回溯错误和重新预算。
