# Source index and speaker notes

Reviewed 2026-10-23. Weekly Paper 2026-10-09. Published claims, inferences and proposed applications are distinguished on slides. No downloaded research code or GPU experiment was executed.

## 01. MULTI-SCORE



- Zero-Shot Multimodal Retrieval with Multi-Scale Contextual Representations
- Sourajit Saha and Tejas Gokhale, ACL 2026
- Two-stage retrieval across text, image, video, and audio

- [ACL paper](https://aclanthology.org/2026.acl-long.930.pdf)
- [Official implementation](https://github.com/sourajitcs/multiscore/tree/0fcaf7bcdee10374aeedf1de8048ebe3325a9831)

**中文讲解：** 任务是相关性检索与重排。它没有给出重复关系、连通分量或训练数据删除策略。

## 02. Retrieval separates filtering from alignment



- Stage 1 converts expensive corpus scoring into progressive embedding refinement.
- Stage 2 applies fine-grained multimodal reasoning only to a candidate shortlist.
- The method avoids task-specific fine-tuning while still relying on pretrained backbones.

- [ACL paper](https://aclanthology.org/2026.acl-long.930.pdf)
- [Official implementation](https://github.com/sourajitcs/multiscore/tree/0fcaf7bcdee10374aeedf1de8048ebe3325a9831)

**中文讲解：** Fine-tuning-free 不意味着零模型成本，也不意味着无需离线 caption 和 embedding。第 3 节。

## 03. Matryoshka representations support early rejection



- Nested embedding prefixes provide several representation resolutions.
- Pyramid Rank starts with short vectors and refines surviving candidates.
- An admissible similarity upper bound determines which candidates can still cross the relevance threshold.

- [ACL paper](https://aclanthology.org/2026.acl-long.930.pdf)
- [Official implementation](https://github.com/sourajitcs/multiscore/tree/0fcaf7bcdee10374aeedf1de8048ebe3325a9831)

**中文讲解：** 上界与 epsilon 保证建立在论文的表示与排序假设下，不能直接推广到任意截断 embedding。第 3.1 节。

## 04. Pyramid Rank controls expensive similarity work



- The algorithm searches a relevance threshold while climbing the representation pyramid.
- Low-relevance candidates exit before full-dimensional dot products.
- Offline captions support common text representations for heterogeneous corpus items.

- [ACL paper](https://aclanthology.org/2026.acl-long.930.pdf)
- [Official implementation](https://github.com/sourajitcs/multiscore/tree/0fcaf7bcdee10374aeedf1de8048ebe3325a9831)

**中文讲解：** caption 负责粗筛，会产生信息瓶颈。重排再强也无法挽回 Stage 1 已经丢掉的目标。

## 05. Bidirectional contextual scoring



- Query-to-candidate and candidate-to-query prompts encode alignment in both directions.
- The hidden state preceding an embedding marker aggregates the contextual prompt.
- The contextual embedding score captures relations that isolated encoders can miss.

- [ACL paper](https://aclanthology.org/2026.acl-long.930.pdf)
- [Official implementation](https://github.com/sourajitcs/multiscore/tree/0fcaf7bcdee10374aeedf1de8048ebe3325a9831)

**中文讲解：** 这是使用 MLLM 表示的推理式相关性打分，不是训练一个新的双塔模型。第 3.2 节。

## 06. Question answering scores semantic coverage



- The query becomes question–answer pairs.
- Each candidate serves as evidence for answering those questions.
- Answer agreement yields a relevance signal and a local explanation of ranking.

- [ACL paper](https://aclanthology.org/2026.acl-long.930.pdf)
- [Official implementation](https://github.com/sourajitcs/multiscore/tree/0fcaf7bcdee10374aeedf1de8048ebe3325a9831)

**中文讲解：** 生成问题质量、答案可判定性以及模型幻觉都会影响分数。可解释输出也需要审计。

## 07. Score fusion and candidate budgets



- Stage 2 combines contextual and QA relevance with a weighting parameter.
- Shortlist size determines how many native-modality inputs reach expensive inference.
- Caption, embedding, and prompt versions jointly define a retrievable corpus snapshot.

- [ACL paper](https://aclanthology.org/2026.acl-long.930.pdf)
- [Official implementation](https://github.com/sourajitcs/multiscore/tree/0fcaf7bcdee10374aeedf1de8048ebe3325a9831)

**中文讲解：** 参数 alpha 与 top-K 均应作为检索配置版本保存。单独记录 embedding 模型不足以复现结果。

## 08. Published evaluation coverage



Axis | Reported scope
--- | ---
Task types | 12 MMIR tasks
Datasets | 32
Universal corpus | 5.7 million items
Comparison claim | Outperforms supervised methods on 23 datasets

- [ACL paper](https://aclanthology.org/2026.acl-long.930.pdf)
- [Official implementation](https://github.com/sourajitcs/multiscore/tree/0fcaf7bcdee10374aeedf1de8048ebe3325a9831)

**中文讲解：** ACL 摘要与实验范围。结果依赖数据集、候选池和使用的 backbone，不能把所有任务均胜出作为结论。

## 09. Baselines and latency need common conditions



- Compare zero-shot encoders, supervised retrieval, and naive multiscale filtering.
- Separate offline caption/embedding cost from online Stage 1 and Stage 2 latency.
- Reranking dominates the reported online budget in the implementation documentation.

- [ACL paper](https://aclanthology.org/2026.acl-long.930.pdf)
- [Official implementation](https://github.com/sourajitcs/multiscore/tree/0fcaf7bcdee10374aeedf1de8048ebe3325a9831)

**中文讲解：** 官方仓库 README 提供耗时与硬件设置，但不能把多 GPU batch 吞吐直接当作单请求延迟 SLO。

## 10. Failure modes and transfer limits



- Stage 1 caption omissions reduce attainable recall.
- QA and contextual prompts inherit backbone biases and domain sensitivity.
- Retrieval relevance does not define a safe deduplication threshold or deletion policy.

- [ACL paper](https://aclanthology.org/2026.acl-long.930.pdf)
- [Official implementation](https://github.com/sourajitcs/multiscore/tree/0fcaf7bcdee10374aeedf1de8048ebe3325a9831)

**中文讲解：** 用于训练数据查重时还需独立标注 duplicate relation，并验证阈值和下游模型损失。论文未交付这个闭环。

## 11. Serving architecture implications



- Inference: split cheap corpus filtering from independently scalable multimodal rerank workers.
- Proposed application: cache caption and QA artifacts under content and model version keys.
- Proposed application: monitor candidate recall and rerank quality separately.

- [ACL paper](https://aclanthology.org/2026.acl-long.930.pdf)
- [Official implementation](https://github.com/sourajitcs/multiscore/tree/0fcaf7bcdee10374aeedf1de8048ebe3325a9831)

**中文讲解：** 缓存是否安全取决于 prompt、backbone 与原始媒体版本。只缓存最终排序会隐藏错误来源。

## 12. Reproduction with a bounded corpus



- Pin the paper implementation and backbone checkpoints before a small CPU/GPU budgeted run.
- Compare Stage 1 alone, contextual scoring alone, QA alone, and full fusion.
- Report recall at shortlist K, final retrieval metrics, offline GPU hours, and tail latency.

- [ACL paper](https://aclanthology.org/2026.acl-long.930.pdf)
- [Official implementation](https://github.com/sourajitcs/multiscore/tree/0fcaf7bcdee10374aeedf1de8048ebe3325a9831)

**中文讲解：** 官方代码可用，但本次仅阅读文档与论文，没有下载运行模型或验证实验数值。
