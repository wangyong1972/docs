# Source index and speaker notes

Reviewed 2026-10-23. Weekly Paper 2026-10-16. Published claims, inferences and proposed applications are distinguished on slides. No downloaded research code or GPU experiment was executed.

## 01. SieveIVF



- Threshold-Aware IVF Execution for Large-Scale Training Data Deduplication
- Hu et al., arXiv v1, August 4, 2026
- Adaptive query work with partition-major execution

- [Paper v1](https://arxiv.org/html/2608.03199v1)

**中文讲解：** 读数必须区分相同 index/search 参数与相同 recall。后者是关键生产比较。

## 02. A known threshold creates a stopping signal



- Dedup candidate retrieval seeks neighbors above application similarity threshold τ.
- Fixed nprobe gives easy and difficult queries the same partition budget.
- Observed qualifying neighbors often concentrate early in centroid-distance order.

- [Paper v1](https://arxiv.org/html/2608.03199v1)

**中文讲解：** 这是候选边检索阶段。后续图构建、保留代表样本及训练影响均不在检索加速数字内。

## 03. Consecutive threshold-empty partitions stop a query



- Preserve the IVF centroid-distance partition order.
- Reset stale to zero after any qualifying local result. Increment stale after an empty result.
- Stop at W consecutive threshold-empty partitions or the nprobe cap.

- [Paper v1](https://arxiv.org/html/2608.03199v1)

**中文讲解：** Empty 指没有满足 τ 的返回候选，而不是 partition 没有数据。规则是近似停止启发式，可能漏掉后面的命中。

## 04. Continuous batching preserves partition locality



- Each query tracks its next rank, stale count, and accumulated results.
- Ready query–partition items group by destination IVF partition.
- Partition-local microbatches reuse search machinery as query state advances.

- [Paper v1](https://arxiv.org/html/2608.03199v1)

**中文讲解：** 逐 query 串行搜索容易破坏 SIMD、缓存与并行度。动态 regrouping 是系统贡献的重要部分。第 4.2 节。

## 05. Lookahead exposes committed work



- Initially every query must search ranks 1 through min(W, nprobe).
- A hit at rank j extends the stop line to at least min(j + W, nprobe).
- Only committed prefix ranks enter the queue. Completion order does not alter the final stop line.

- [Paper v1](https://arxiv.org/html/2608.03199v1)

**中文讲解：** Lookahead 的等价性相对于同一停止规则成立，不是相对于穷举所有 partitions 的精确召回保证。第 4.3 节。

## 06. Integration keeps the existing index format



- The authors implement the executor in Lance.
- It reuses on-disk IVF layout, within-partition search, and final bounded top-k merge.
- Microbatches contain up to 16K ready items for one partition.

- [Paper v1](https://arxiv.org/html/2608.03199v1)

**中文讲解：** 论文称已实现，不代表专用 public code 已发布。本次未核实专用仓库，不能链接 Lance 主仓库冒充该实现。第 5 节。

## 07. Experimental workloads



Workload group | Base vectors | Index setup
--- | --- | ---
Four Hunyuan domains | 9.9M each, 768 dimensions | 2,400 partitions
LAION-100M | 99.9M, 512 dimensions | 16 shards × 1,500 partitions
DEEP-100M | 99.9M, 96 dimensions | 16 shards × 1,500 partitions

- [Paper v1](https://arxiv.org/html/2608.03199v1)

**中文讲解：** 100K held-out queries。默认 cosine IVF_RQ7、exact centroid assignment、nprobe=90、k=10、W=8。第 6.1 节。

## 08. Same-parameter headline results



Comparison | Speedup | Pooled filtered top-10 recall loss
--- | --- | ---
Hunyuan W=8 | 4.1–7.6× | 0.03–1.13 percentage points
Public 100M W=8 | 6.1–8.4× | 1.43–2.29 percentage points
Hunyuan matched recall | 1.09–1.22× | Fixed-probe frontier interpolation

- [Paper v1](https://arxiv.org/html/2608.03199v1)

**中文讲解：** 第三行来自 measured fixed-probe settings 的等召回插值。不能把前两行当成相同质量下 4–8 倍。第 6.2 节。

## 09. Execution ablations explain the speedup



- Serial threshold traversal reduces work but fragments partition calls.
- Continuous batching restores grouped execution and supplies most of the throughput gain.
- Lookahead increases microbatch occupancy and helps low-concurrency workloads.

- [Paper v1](https://arxiv.org/html/2608.03199v1)

**中文讲解：** 第 6.3 节平均 microbatch 从 24–51 增到 162–209。实际收益依赖 batch、缓存、阈值与负载分布。

## 10. Operating envelope and recall limits



- Exact centroid assignment is a stated precondition for the stopping signal.
- Smaller W skips more work but can lose important late neighbors.
- Filtered top-k recall differs from complete threshold-edge recall needed by some dedup graphs.

- [Paper v1](https://arxiv.org/html/2608.03199v1)

**中文讲解：** 不能从 top-10 pooled metric 推断所有重复边都完整，也不能从漏边率直接推导训练质量不变。

## 11. Data infrastructure application proposal



- Inference: pass similarity predicates into physical execution rather than filtering only at the end.
- Proposed application: version τ, W, nprobe, embeddings, and index builds as a dedup recipe.
- Proposed application: audit missed edges by domain and duplicate-cluster tail size.

- [Paper v1](https://arxiv.org/html/2608.03199v1)

**中文讲解：** 需要把召回预算、图决策与删除策略串成可复查闭环。这里是应用建议。

## 12. Reproduction and acceptance gates



- Use a small public embedding corpus with exact normalized ground truth.
- Compare fixed probing across a tuned frontier against W sweeps at equal recall.
- Measure wall time, partition searches, microbatch occupancy, and downstream retained-set quality.

- [Paper v1](https://arxiv.org/html/2608.03199v1)

**中文讲解：** 未执行研究代码或 GPU 作业。没有 verified dedicated public implementation 是复现的实际缺口。
