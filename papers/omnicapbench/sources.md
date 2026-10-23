# Source index and speaker notes

Reviewed 2026-10-23. Weekly Paper 2026-10-16. Published claims, inferences and proposed applications are distinguished on slides. No downloaded research code or GPU experiment was executed.

## 01. OmniCapBench



- A Deep-Structured Evaluation Framework for Fine-Grained Audio-Visual Captioning
- 786 videos with localized structural and semantic evaluation
- arXiv v1, October 2026

- [Paper v1](https://arxiv.org/html/2610.12458v1)
- [Project](https://github.com/Tencent-Hunyuan/OmniCapBench/tree/24328d3faff0a6f8519fc5072a195edac6f093d1)

**中文讲解：** 核心贡献是把长文本整体评分拆为可定位的结构单元，再进行局部语义检查。

## 02. Global caption scores hide local errors



- A fluent paragraph can omit an event, confuse entity identity, or misplace a timestamp.
- One scalar score mixes perception, temporal alignment, and language style.
- The benchmark seeks separate diagnostics for what happened and when/where it happened.

- [Paper v1](https://arxiv.org/html/2610.12458v1)
- [Project](https://github.com/Tencent-Hunyuan/OmniCapBench/tree/24328d3faff0a6f8519fc5072a195edac6f093d1)

**中文讲解：** caption 流畅不等于理解正确，但新的结构化任务也会引入指令遵循能力的影响。

## 03. Three dependent native tracks



Track | Representation | Purpose
--- | --- | ---
References | Persistent entity IDs | Identity across the video
Events | Audio/dialogue intervals | Auditory content and boundaries
Shots/subshots | Visual time segments and links | Anchor entities and events

- [Paper v1](https://arxiv.org/html/2610.12458v1)
- [Project](https://github.com/Tencent-Hunyuan/OmniCapBench/tree/24328d3faff0a6f8519fc5072a195edac6f093d1)

**中文讲解：** 源于 MTSS 的解耦设计，论文细化 subshot 与连续时间范围。ID、时间与 cross-link 共同构成结构约束。

## 04. Construction follows dependency order



- Candidate videos pass audio, duration, quality, and density filters.
- Generation builds references before events and shots.
- An iterative evaluator/validator/refinement loop checks structure while enriching descriptions.

- [Paper v1](https://arxiv.org/html/2610.12458v1)
- [Project](https://github.com/Tencent-Hunyuan/OmniCapBench/tree/24328d3faff0a6f8519fc5072a195edac6f093d1)

**中文讲解：** 局部文字 refinement 保持 ID、时间与 links 不变，避免语言润色改变已确认拓扑。第 3.1 节。

## 05. Native unit generation exposes explicit structure



- The model receives a video and returns structured JSON tracks.
- Generation must create defined references and valid temporal links.
- This task evaluates structure production together with perceptual and semantic understanding.

- [Paper v1](https://arxiv.org/html/2610.12458v1)
- [Project](https://github.com/Tencent-Hunyuan/OmniCapBench/tree/24328d3faff0a6f8519fc5072a195edac6f093d1)

**中文讲解：** 不能声称 JSON 把模型内部 reasoning 直接变成可观测真值。它只是要求显式输出的评测协议。

## 06. Validation precedes semantic judgment



- Undefined IDs, reversed intervals, and impossible links fail deterministic checks.
- Shots and events match by temporal intersection-over-union.
- References and subshots use bounded local LLM-assisted matching.

- [Paper v1](https://arxiv.org/html/2610.12458v1)
- [Project](https://github.com/Tencent-Hunyuan/OmniCapBench/tree/24328d3faff0a6f8519fc5072a195edac6f093d1)

**中文讲解：** 并非所有 matching 都是纯规则。必须保留 matcher 模型、prompt 与候选配对结果以审计偏差。

## 07. Semantic scores operate on aligned units



- Only structurally valid and matched units receive bounded semantic-equivalence scoring.
- Unmatched or invalid units remain structural errors.
- Separate metric families expose identity, temporal, and audio–visual grounding weaknesses.

- [Paper v1](https://arxiv.org/html/2610.12458v1)
- [Project](https://github.com/Tencent-Hunyuan/OmniCapBench/tree/24328d3faff0a6f8519fc5072a195edac6f093d1)

**中文讲解：** 语义分数的分母与结构召回不同，不能只选语义高分而忽略大量未匹配单元。

## 08. Selected reported structural metrics



Model | Schema compliance | Cross-shot consistency | Event–visual alignment F1
--- | --- | --- | ---
Gemini 3.1-Pro | 97.36 | 34.43 | 51.46
Qwen3-Omni-Instruct | 89.02 | 9.85 | 13.33
MiniCPM-o-2.6 | 72.13 | 4.29 | 2.46

- [Paper v1](https://arxiv.org/html/2610.12458v1)
- [Project](https://github.com/Tencent-Hunyuan/OmniCapBench/tree/24328d3faff0a6f8519fc5072a195edac6f093d1)

**中文讲解：** 表 3 数值。SGC 与 CCC、EVSA 的含义不同，schema 高分不能推断跨镜头身份追踪正确。

## 09. Benchmark comparisons have task boundaries



- The study compares proprietary and open omnimodal model families.
- Specialized free-form captioning models struggle with structured instruction following.
- The paper excludes those specialized models from the main structured evaluation.

- [Paper v1](https://arxiv.org/html/2610.12458v1)
- [Project](https://github.com/Tencent-Hunyuan/OmniCapBench/tree/24328d3faff0a6f8519fc5072a195edac6f093d1)

**中文讲解：** 这种排除说明评测协议会影响可比较模型集合，不能据此宣称 specialized captioner 全面弱于通用模型。

## 10. Reference and judge bias remain



- 786 curated videos provide diagnostic depth rather than exhaustive domain coverage.
- Automatic generation, local refinement, and LLM matching can share model biases.
- API versions, fallback behavior, and semantic judges affect repeatability.

- [Paper v1](https://arxiv.org/html/2610.12458v1)
- [Project](https://github.com/Tencent-Hunyuan/OmniCapBench/tree/24328d3faff0a6f8519fc5072a195edac6f093d1)

**中文讲解：** 结构化减少整体 judge 的模糊性，却没有消除语义判断和标注的不确定性。需保留人工审计样本。

## 11. Evaluation platform application proposal



- Inference: store entity IDs, intervals, and cross-links as versioned annotation tables.
- Proposed application: report schema validity, matching recall, and semantic quality separately.
- Proposed application: route localized failure types to targeted relabeling or model tests.

- [Paper v1](https://arxiv.org/html/2610.12458v1)
- [Project](https://github.com/Tencent-Hunyuan/OmniCapBench/tree/24328d3faff0a6f8519fc5072a195edac6f093d1)

**中文讲解：** 为错误建立可追踪定位比单个总分更适合数据质量迭代，但需要明确 schema 演进策略。

## 12. Reproduction and acceptance gates



- Pin the dataset release, schema, model API versions, matcher, and prompts.
- Replay validation with corrupt IDs and time spans to verify failure accounting.
- Double-label a stratified human sample and report judge agreement and per-duration slices.

- [Paper v1](https://arxiv.org/html/2610.12458v1)
- [Project](https://github.com/Tencent-Hunyuan/OmniCapBench/tree/24328d3faff0a6f8519fc5072a195edac6f093d1)

**中文讲解：** 项目仓库存在。本次阅读论文与来源，没有执行模型推理或复现完整 leaderboard。
