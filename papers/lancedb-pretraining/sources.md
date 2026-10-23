# Source index and speaker notes

Reviewed 2026-10-23. Weekly Paper 2026-10-16. Published claims, inferences and proposed applications are distinguished on slides. No downloaded research code or GPU experiment was executed.

## 01. A Practical LLM Pretraining Pipeline



- One Lance table spans curation, tokenization, loading, and analysis
- LanceDB engineering tutorial and public example code
- A 124M model demonstration with explicit scaling limits

- [Blog](https://www.lancedb.com/blog/practical-llm-pretraining)
- [Example source](https://github.com/lancedb/training/blob/5df544f45c5ced4598df3a3278214a66c937d698/examples/llm_pretraining/README.md)

**中文讲解：** 这是 blog+code 工程示例，不是大规模 foundation model 训练的系统证明。

## 02. The table carries raw and derived state



- Raw text remains available alongside curation flags and token IDs.
- Derived columns capture new signals instead of exporting a separate corpus for every stage.
- SQL predicates define selected training rows.

- [Blog](https://www.lancedb.com/blog/practical-llm-pretraining)
- [Example source](https://github.com/lancedb/training/blob/5df544f45c5ced4598df3a3278214a66c937d698/examples/llm_pretraining/README.md)

**中文讲解：** 统一表有利于 lineage，但不自动证明跨列 backfill 和训练读取是一致快照。需要显式 pin dataset version。

## 03. Example modules expose the lifecycle



- ingest.py writes FineWeb-Edu or synthetic records into a Lance table.
- curate.py computes curation signals and an exact-dedup flag.
- tokenize_data.py and geneva_backfill.py populate token columns through local or distributed paths.

- [Blog](https://www.lancedb.com/blog/practical-llm-pretraining)
- [Example source](https://github.com/lancedb/training/blob/5df544f45c5ced4598df3a3278214a66c937d698/examples/llm_pretraining/README.md)

**中文讲解：** 模块路径均来自公开 example README。静态读取代码，不执行下载的数据管线。

## 04. Exact dedup has a precise semantic scope



- The example collapses whitespace and computes an MD5 content hash.
- Rows with the same normalized hash share an exact-match identity.
- Embedding retrieval in later analysis does not turn curation into semantic deduplication.

- [Normalized hash code](https://github.com/lancedb/training/blob/5df544f45c5ced4598df3a3278214a66c937d698/examples/llm_pretraining/curate.py#L46-L80)

**中文讲解：** normalized exact hash 可消除规范化后同文，但不会识别语义改写、跨语言重复或图片重复。

## 05. Backfill and training have different resource needs



- Tokenization and embeddings can populate derived columns through checkpointed backfills.
- Training consumes token columns after curation filters.
- Separating enrichment from training prevents tokenizer or embedding work from repeatedly occupying the hot path.

- [Blog](https://www.lancedb.com/blog/practical-llm-pretraining)
- [Example source](https://github.com/lancedb/training/blob/5df544f45c5ced4598df3a3278214a66c937d698/examples/llm_pretraining/README.md)

**中文讲解：** 增量列计算是数据平面机制。任务恢复与训练恢复分别需要 state，不能混用一个 checkpoint 概念。

## 06. StreamingDataset shuffles and packs in the loader



- The example uses lancedb.streaming.StreamingDataset.
- Loader-side packing assembles token sequences without a mandatory offline packed-corpus export.
- Read batch size, I/O queue depth, and transform parallelism control the CPU pipeline.

- [Blog](https://www.lancedb.com/blog/practical-llm-pretraining)
- [Example source](https://github.com/lancedb/training/blob/5df544f45c5ced4598df3a3278214a66c937d698/examples/llm_pretraining/README.md)

**中文讲解：** 需要同时统计有效 token、padding、CPU 时间及 HBM 输入等待。单看 rows/s 会掩盖序列长度变化。

## 07. Resume semantics constrain data partitioning



- The README exposes num_splits and resume-auto options.
- num_splits must divide the global batch and be divisible by world_size × num_workers when workers are enabled.
- A stable table snapshot and loader state are needed to explain replay or omission across restarts.

- [Loader constraints](https://github.com/lancedb/training/blob/5df544f45c5ced4598df3a3278214a66c937d698/examples/llm_pretraining/train.py#L425-L437)
- [Resume state](https://github.com/lancedb/training/blob/5df544f45c5ced4598df3a3278214a66c937d698/examples/llm_pretraining/train.py#L467-L500)

**中文讲解：** README 的 world-size 约束不是任意 elastic training 保证。应注入失败测样本覆盖，而不是只看 loss 能继续下降。

## 08. Loader A/B controls use identical packed blocks



- The example can export common packed blocks as Lance, Parquet, pre-shuffled Parquet, and MDS.
- Common logical blocks reduce tokenization and packing confounders in loader comparisons.
- CPU transforms and thread settings can dominate throughput.

- [Blog](https://www.lancedb.com/blog/practical-llm-pretraining)
- [Example source](https://github.com/lancedb/training/blob/5df544f45c5ced4598df3a3278214a66c937d698/examples/llm_pretraining/README.md)

**中文讲解：** 对比要固定 token 顺序、block 内容、存储位置与预取预算，不能拿不同数据准备方式的吞吐直接比较。

## 09. Evidence classification



Source item | Supported interpretation
--- | ---
124M GPT-like run | Small-model end-to-end demonstration
Eight-GPU command | Reproducible configuration example
Loader A/B code | A control design to examine data loading
Training-data forensics | Search and attribution tools on the same table

- [Blog](https://www.lancedb.com/blog/practical-llm-pretraining)
- [Example source](https://github.com/lancedb/training/blob/5df544f45c5ced4598df3a3278214a66c937d698/examples/llm_pretraining/README.md)

**中文讲解：** 博客的演示耗时不能外推为大模型训练加速比。代码可见不代表本文已在对应硬件复现。

## 10. Scaling gaps remain measurable



- One table does not eliminate object-store bandwidth, cache, or metadata bottlenecks.
- Large distributed runs need evidence for sample coverage, recovery, and worker imbalance.
- Model quality and total training cost require matched-token baselines beyond a 124M demo.

- [Blog](https://www.lancedb.com/blog/practical-llm-pretraining)
- [Example source](https://github.com/lancedb/training/blob/5df544f45c5ced4598df3a3278214a66c937d698/examples/llm_pretraining/README.md)

**中文讲解：** 工程选型需分离读吞吐、数据准备成本和最终训练质量。作者示例给出起点而非规模上界。

## 11. Architecture application proposal



- Inference: a stable record key can connect selected data to post-training attribution.
- Proposed application: pin table version, filter expression, tokenizer, and loader config in each run manifest.
- Proposed application: keep expensive annotations reusable across independent experiments.

- [Blog](https://www.lancedb.com/blog/practical-llm-pretraining)
- [Example source](https://github.com/lancedb/training/blob/5df544f45c5ced4598df3a3278214a66c937d698/examples/llm_pretraining/README.md)

**中文讲解：** 不要在 deck 中写入真实业务或雇主数据。通用 run manifest 足以解释设计。

## 12. Reproduction without a large training job



- Start with the documented synthetic corpus and byte tokenizer under an explicit budget.
- Validate normalized-hash groups and count emitted tokens across resume boundaries.
- Then compare loaders with identical blocks before scaling the model or GPU count.

- [Blog](https://www.lancedb.com/blog/practical-llm-pretraining)
- [Example source](https://github.com/lancedb/training/blob/5df544f45c5ced4598df3a3278214a66c937d698/examples/llm_pretraining/README.md)

**中文讲解：** 这些是下一步建议，本次未执行研究代码。实现入口为 lancedb/training 的 llm_pretraining example。
