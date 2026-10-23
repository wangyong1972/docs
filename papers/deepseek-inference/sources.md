# Source index

Reviewed 2026-10-23. Static inspection only. Claims marked as deployment documentation do not imply released implementation.

## Reviewed snapshots

- DeepInfer: `9bd9cf243fc53ef9afbf8f04d391d989117d6ab9` (2026-10-21)
- deepseek-harness: `687f282e8625c6b8d11ff58211a90524be2e4317`
- deepseek-recipe: `935817c66f5d6e64838f419692545f06787e485f`

The companion inventory is contextual, not a claim of deep review of every library. Vendor gitlink commits appear in slide 21.

## 01. DeepSeek DeepInfer: a source-level systems review

Released runtime, execution boundaries, and engineering implications

- DeepInfer snapshot 9bd9cf243fc53ef9afbf8f04d391d989117d6ab9
- Reviewed 23 October 2026 for AI and data infrastructure engineering leaders
- Companion repositories provide context. Most slides trace inference implementation.

- [DeepInfer release scope](https://github.com/deepseek-ai/DeepInfer/blob/9bd9cf243fc53ef9afbf8f04d391d989117d6ab9/README.md#L1-L42)

**中文讲解：** 重点读实际执行路径。代码能证明的实现、官方部署文档、工程推断分别说明。性能数据没有在本机复测。

## 02. The release boundary

Offline inference includes model execution and local cache machinery

- [Explicit release boundary](https://github.com/deepseek-ai/DeepInfer/blob/9bd9cf243fc53ef9afbf8f04d391d989117d6ab9/README.md#L33-L42)
- [Integration hooks](https://github.com/deepseek-ai/DeepInfer/blob/9bd9cf243fc53ef9afbf8f04d391d989117d6ab9/deepinfer/engine/llm_engine.py#L787-L849)

**中文讲解：** README 说缺 KV cache system，不代表没有 GPU KV 管理。必须区分本地执行内存与跨机器、可持久化的缓存服务。

## 03. Repository inventory by system layer

The recent runtime release builds on earlier infrastructure libraries

- [Official infra index](https://github.com/deepseek-ai/open-infra-index)
- [Vendor dependencies](https://github.com/deepseek-ai/DeepInfer/blob/9bd9cf243fc53ef9afbf8f04d391d989117d6ab9/.gitmodules#L1-L18)
- [Official organization](https://github.com/deepseek-ai)
- [Inventory snapshot](https://github.com/wangyong1972/docs/blob/main/papers/deepseek-inference/inventory.json)

**中文讲解：** 2026 年新发布的推理组件和 2025 年开源周项目不是同一批。这里列相关系统仓库，不把所有模型权重仓库混入。

## 04. “Search” and “filesystem” have distinct meanings

No standalone open search backend has been established in this review

- [Search provider code](https://github.com/deepseek-ai/deepseek-harness/blob/687f282e8625c6b8d11ff58211a90524be2e4317/packages/web/web-deepseek-api/src/search.ts#L1-L95)
- [ripgrep execution](https://github.com/deepseek-ai/deepseek-harness/blob/687f282e8625c6b8d11ff58211a90524be2e4317/packages/fs/tool-fs-search/src/search-core.ts#L1-L40)
- [Filesystem contract](https://github.com/deepseek-ai/deepseek-harness/blob/687f282e8625c6b8d11ff58211a90524be2e4317/packages/fs/README.md#L10-L38)
- [3FS](https://github.com/deepseek-ai/3FS)

**中文讲解：** 用户说的 search 仍可能指其他项目。已验证的 web search 是 API 客户端，不是爬虫或索引后端。文件系统工具与 3FS 也不能混为一谈。

## 05. The public entry point

LLM.generate adds every request before driving the engine loop

- _add_request copies sampling parameters, tokenizes if needed, converts IDs to int32.
- The offline example configures EP/DP/CP, memory fraction, token budget and sequence cap.

- [LLM.generate / _add_request](https://github.com/deepseek-ai/DeepInfer/blob/9bd9cf243fc53ef9afbf8f04d391d989117d6ab9/deepinfer/entrypoints/llm.py#L90-L184)
- [Offline configuration](https://github.com/deepseek-ai/DeepInfer/blob/9bd9cf243fc53ef9afbf8f04d391d989117d6ab9/examples/offline_inference.py#L25-L60)

**中文讲解：** 这不是 HTTP server。批量输入由 Python API 注入 engine，适合离线推理与集成验证。

## 06. Request and token execution flow

One request moves through admission, metadata, forward, sampling, and reclamation

- [Engine step](https://github.com/deepseek-ai/DeepInfer/blob/9bd9cf243fc53ef9afbf8f04d391d989117d6ab9/deepinfer/engine/llm_engine.py#L860-L1029)
- [Worker loop](https://github.com/deepseek-ai/DeepInfer/blob/9bd9cf243fc53ef9afbf8f04d391d989117d6ab9/deepinfer/worker/worker.py#L89-L189)

**中文讲解：** 按调用链读代码比按目录猜架构更可靠。step 返回的结果在异步路径可能属于上一个 batch。

## 07. Batch type requires group agreement

NORMAL engines vote on prefill versus decode across DP ranks

- The watermark is 0.9. Configured intervals create ALL and ANY attempt points.
- Idle ranks execute a placeholder prefill step when another rank has work.
- A second vote falls back to decode when admission fails everywhere.

- [Scheduler._schedule](https://github.com/deepseek-ai/DeepInfer/blob/9bd9cf243fc53ef9afbf8f04d391d989117d6ab9/csrc/engine/scheduler.hpp#L275-L344)
- [Watermark](https://github.com/deepseek-ai/DeepInfer/blob/9bd9cf243fc53ef9afbf8f04d391d989117d6ab9/csrc/engine/scheduler.hpp#L78-L105)

**中文讲解：** 这保证 collective 的执行步型一致。ANY 尝试给孤立 rank 兜底，第二次投票避免 waiting 有请求却无法分配时反复空跑。

## 08. Prefill admission and chunking

The queue head must satisfy memory, sequence, and token constraints

- _schedule_prefill scans waiting requests from the front and stops at an unschedulable head.
- AllocStatus::LATER waits for blocks. NEVER rejects a request that exceeds total capacity.
- The remaining batch-token budget bounds each chunk, aligned to CP requirements.
- The scheduler also limits prompt count and aggregate key length. Forked prefixes require block/state cloning.

- [Scheduler._schedule_prefill](https://github.com/deepseek-ai/DeepInfer/blob/9bd9cf243fc53ef9afbf8f04d391d989117d6ab9/csrc/engine/scheduler.hpp#L351-L550)

**中文讲解：** 公开版本这段 admission 主要受 token、slot、KV 限制。部署 Q&A 描述的跨实例 compute-quota 路由不能当作这里已经完整实现。

## 09. Decode admission and preemption

Memory pressure can terminate requests or send them back for recomputation

- The scheduler admits prompted requests and prepares forked state and tail blocks.
- It sorts running sequences by output length, visits the short-output end, and preempts from the opposite end when blocks run out.
- _append_slot grows each admitted sequence, then MTPVarlen.schedule chooses verification lengths.
- _preempt stops structured-output requests and stop-on-preemption configurations. Other requests reset and re-enter waiting.

- [Scheduler._schedule_decode](https://github.com/deepseek-ai/DeepInfer/blob/9bd9cf243fc53ef9afbf8f04d391d989117d6ab9/csrc/engine/scheduler.hpp#L559-L661)
- [Scheduler._preempt](https://github.com/deepseek-ai/DeepInfer/blob/9bd9cf243fc53ef9afbf8f04d391d989117d6ab9/csrc/engine/scheduler.hpp#L766-L790)
- [Completion invariant](https://github.com/deepseek-ai/DeepInfer/blob/9bd9cf243fc53ef9afbf8f04d391d989117d6ab9/csrc/engine/scheduler.hpp#L98-L104)

**中文讲解：** 这里的排序键是已生成长度，不是预测完成时间。COMPLETION 引擎没有 prefill 通道，构造时强制 stop_preempted_request=true。

## 10. Asynchronous scheduling overlaps retirement

The worker launches current forward before retiring previous sampling results

- Prompt and non-ZOS steps retire immediately. ZOS decode keeps one previous step in flight.
- execute_main_model and execute_sample wrap their device launch sections in forbid_cuda_sync().

- [Worker.execute_model_step](https://github.com/deepseek-ai/DeepInfer/blob/9bd9cf243fc53ef9afbf8f04d391d989117d6ab9/deepinfer/worker/worker.py#L89-L189)
- [Launch synchronization boundary](https://github.com/deepseek-ai/DeepInfer/blob/9bd9cf243fc53ef9afbf8f04d391d989117d6ab9/deepinfer/worker/model_runner.py#L308-L368)

**中文讲解：** “zero overhead”是优化目标，不是没有 CPU 工作。关键是 CPU bookkeeping 与下一次 GPU forward 重叠，而不是神奇地消失。

## 11. Scheduling ahead requires device corrections

CPU sequence lengths can lag the most recent sampling decision

- prepare_zos_inputs maps overlapping sequences between the current and previous batch.
- GPU kernels use prior acceptance counts to correct key lengths and confidence rates to adjust query lengths.
- Varlen query lengths copy back asynchronously. The worker waits for that copy before updating CPU sampling metadata.
- The final drain explicitly synchronizes and processes remaining in-flight work.

- [Worker._correct_seqlens_qk](https://github.com/deepseek-ai/DeepInfer/blob/9bd9cf243fc53ef9afbf8f04d391d989117d6ab9/deepinfer/worker/worker.py#L191-L246)
- [Retirement and drain](https://github.com/deepseek-ai/DeepInfer/blob/9bd9cf243fc53ef9afbf8f04d391d989117d6ab9/deepinfer/worker/worker.py#L248-L283)
- [C++ ZOS input preparation](https://github.com/deepseek-ai/DeepInfer/blob/9bd9cf243fc53ef9afbf8f04d391d989117d6ab9/csrc/engine/zos.cpp#L142-L277)

**中文讲解：** 异步优化把依赖转成显式 remap 和事件。集成时不能绕开 flush，也不能把 CPU cache.num_tokens 当作最新 GPU 状态。

## 12. Object lifetime is part of correctness

Pooled outputs and borrowed vectors need explicit ownership rules

- LLMEngine.step documents that RequestOutput objects expire on the next step.
- The offline loop clones each output before retaining it.
- Scheduler outputs borrow clone/zero vector storage that the next schedule() clears.
- Deferred release collects metadata, outputs, and block/state unpins across worker execution.

- [Output lifetime contract](https://github.com/deepseek-ai/DeepInfer/blob/9bd9cf243fc53ef9afbf8f04d391d989117d6ab9/deepinfer/engine/llm_engine.py#L860-L870)
- [Offline output cloning](https://github.com/deepseek-ai/DeepInfer/blob/9bd9cf243fc53ef9afbf8f04d391d989117d6ab9/deepinfer/entrypoints/llm.py#L186-L198)
- [Borrowed vector contract](https://github.com/deepseek-ai/DeepInfer/blob/9bd9cf243fc53ef9afbf8f04d391d989117d6ab9/csrc/engine/scheduler.hpp#L275-L285)
- [DeferredRelease](https://github.com/deepseek-ai/DeepInfer/blob/9bd9cf243fc53ef9afbf8f04d391d989117d6ab9/deepinfer/engine/llm_engine.py#L69-L112)

**中文讲解：** 对外做 streaming wrapper 时尤其容易踩这个坑：必须复制或明确转移生命周期，不能把池化指针异步留给网络线程。

## 13. Local block allocation and sharing

BlockManager tracks free blocks and reference counts under a lock

- Block ID 0 is reserved as an empty sentinel.
- Sequence block tables reference physical storage. Fork paths pin shared data and clone writable tail blocks.
- A separate state manager reserves recurrent/compression state slots alongside KV blocks.

- [Blocks / BlockManager](https://github.com/deepseek-ai/DeepInfer/blob/9bd9cf243fc53ef9afbf8f04d391d989117d6ab9/csrc/engine/block_manager.hpp#L27-L160)
- [Fork cloning](https://github.com/deepseek-ai/DeepInfer/blob/9bd9cf243fc53ef9afbf8f04d391d989117d6ab9/csrc/engine/scheduler.hpp#L598-L619)
- [State allocation check](https://github.com/deepseek-ai/DeepInfer/blob/9bd9cf243fc53ef9afbf8f04d391d989117d6ab9/csrc/engine/scheduler.hpp#L195-L210)

**中文讲解：** 公开代码能读到显存内 block 分配和共享语义，但这不等于前缀 hash 索引、跨实例恢复、存储 GC 都已开源。

## 14. KV memory includes multiple representations

Cache sizing follows attention layout, indexer precision, and rollback history

- [KV bytes and ring sizing](https://github.com/deepseek-ai/DeepInfer/blob/9bd9cf243fc53ef9afbf8f04d391d989117d6ab9/deepinfer/worker/cache_engine.py#L44-L146)
- [Layer sharing maps](https://github.com/deepseek-ai/DeepInfer/blob/9bd9cf243fc53ef9afbf8f04d391d989117d6ab9/deepinfer/worker/cache_engine.py#L153-L188)

**中文讲解：** 不能直接套传统 MHA 的 layers×heads×head_dim 公式。这里有压缩、量化、状态环和跨层共享，容量规划必须按实际模型配置计算。

## 15. Bounded replay compacts consumer work

YoCo keeps a bounded suffix where the model structure permits it

- The model configuration divides producer and consumer layers at n_prefill_layer.
- yoco_boundary_compact gathers kept query rows. With CP, it gathers contributions and redistributes compact rows.
- Consumer metadata switches query-aligned fields and the SWA visibility domain.
- README defaults use compact mode and 140 retained tokens. The suffix must cover SWA plus maximum backtracking.

- [YoCo boundary operations](https://github.com/deepseek-ai/DeepInfer/blob/9bd9cf243fc53ef9afbf8f04d391d989117d6ab9/deepinfer/model_executor/models/v4_modules/yoco.py#L14-L77)
- [Consumer metadata](https://github.com/deepseek-ai/DeepInfer/blob/9bd9cf243fc53ef9afbf8f04d391d989117d6ab9/deepinfer/model_executor/input_metadata/yoco.py#L94-L142)
- [Release configuration](https://github.com/deepseek-ai/DeepInfer/blob/9bd9cf243fc53ef9afbf8f04d391d989117d6ab9/README.md#L23-L29)

**中文讲解：** 这不是任意模型都能截断 prefix。依赖 YoCo 层结构和恢复状态，140 是该版本 V4.1 配置，不是通用窗口。

## 16. Attention and experts use different groups

DP, CP, and EP compose around the model execution path

- [ParallelProcessGroup.create_process_groups](https://github.com/deepseek-ai/DeepInfer/blob/9bd9cf243fc53ef9afbf8f04d391d989117d6ab9/deepinfer/model_executor/parallel_utils/parallel_state.py#L77-L130)
- [CP all-gather buffer](https://github.com/deepseek-ai/DeepInfer/blob/9bd9cf243fc53ef9afbf8f04d391d989117d6ab9/deepinfer/model_executor/parallel_utils/cp.py#L14-L51)
- [Deployment choices, documentation](https://github.com/deepseek-ai/DeepInfer/blob/9bd9cf243fc53ef9afbf8f04d391d989117d6ab9/doc/inference_deployment_qa.md#L40-L70)

**中文讲解：** 源码支持 CP，部署 Q&A 同时说当前生产配置未使用 TP/CP。支持能力与具体线上配置需要分开看。

## 17. MoE dispatch, expert compute, and combine

The forward path explicitly coordinates communication and shared experts

- DeepEP owns token exchange and handles. Routed expert weights use rank-local physical expert rows.
- The standard path limits communication SM use while computing shared experts. A separate mega-MoE branch exists.

- [MoE.forward](https://github.com/deepseek-ai/DeepInfer/blob/9bd9cf243fc53ef9afbf8f04d391d989117d6ab9/deepinfer/model_executor/models/v4_modules/mlp.py#L565-L616)
- [dispatch / combine](https://github.com/deepseek-ai/DeepInfer/blob/9bd9cf243fc53ef9afbf8f04d391d989117d6ab9/deepinfer/model_executor/models/v4_modules/mlp.py#L461-L510)
- [Expert parameter layout](https://github.com/deepseek-ai/DeepInfer/blob/9bd9cf243fc53ef9afbf8f04d391d989117d6ab9/deepinfer/model_executor/models/v4_modules/moe.py#L70-L112)

**中文讲解：** 通信开销与计算并行设计绑定。单看 GEMM 吞吐不能推导整个 MoE step 的收益。

## 18. EPLB balances physical expert replicas

The policy uses historical per-step load rather than only total token counts

- rebalance_experts_global allocates redundant replicas to hot logical experts.
- _batch_greedy_indices places physical experts under per-rank capacity constraints.
- The placement objective sums the per-step maximum rank load over the history window.
- Shuffle code offers batched P2P and an intranode symmetric-memory/IPC path. This differs from request routing across replicas.

- [Replica selection and greedy placement](https://github.com/deepseek-ai/DeepInfer/blob/9bd9cf243fc53ef9afbf8f04d391d989117d6ab9/deepinfer/model_executor/eplb/policy.py#L12-L140)
- [Weight shuffle paths](https://github.com/deepseek-ai/DeepInfer/blob/9bd9cf243fc53ef9afbf8f04d391d989117d6ab9/deepinfer/model_executor/eplb/shuffle.py#L1-L12)
- [Intranode shuffle](https://github.com/deepseek-ai/DeepInfer/blob/9bd9cf243fc53ef9afbf8f04d391d989117d6ab9/deepinfer/model_executor/eplb/shuffle.py#L150-L175)

**中文讲解：** EPLB 改 expert 布局，DP load balancer 改请求去向。两者优化不同失衡来源，不能因为有 EPLB 就宣称公开了完整服务路由。

## 19. Attention combines SWA and compressed KV

Prefill and decode use different data paths into sparse attention kernels

- [Prefill and decode attention](https://github.com/deepseek-ai/DeepInfer/blob/9bd9cf243fc53ef9afbf8f04d391d989117d6ab9/deepinfer/model_executor/models/v4_modules/attn.py#L589-L670)
- [Fused projection operations](https://github.com/deepseek-ai/DeepInfer/blob/9bd9cf243fc53ef9afbf8f04d391d989117d6ab9/deepinfer/model_executor/models/v4_modules/attn.py#L158-L226)

**中文讲解：** 这里描述的是 V4 模块实现，不把 V3 的 MLA 简图直接套过来。SWA、压缩索引和共享层会改变数据可见范围。

## 20. Indexer logits feed TopK attention selection

DeepSelect selects token indices inside the model

- DeepGEMM computes dense or sparse FP8/FP4 MQA logits.
- Prefill chunks the query computation to bound temporary score storage. Decode uses paged metadata.
- Candidate-block paths restore token indices after TopK selection.

- [MQA._topk_prefill](https://github.com/deepseek-ai/DeepInfer/blob/9bd9cf243fc53ef9afbf8f04d391d989117d6ab9/deepinfer/model_executor/models/v4_modules/index_attn.py#L284-L376)
- [Paged decode logits](https://github.com/deepseek-ai/DeepInfer/blob/9bd9cf243fc53ef9afbf8f04d391d989117d6ab9/deepinfer/model_executor/models/v4_modules/index_attn.py#L378-L454)

**中文讲解：** 模型内部的检索/TopK 与 web search 是不同概念。这里返回注意力 token 索引，不是文档搜索结果。

## 21. Kernel dependencies are pinned separately

DeepInfer records exact vendor gitlinks rather than bundling all implementation

- [Pinned vendor tree](https://github.com/deepseek-ai/DeepInfer/tree/9bd9cf243fc53ef9afbf8f04d391d989117d6ab9/vendor)
- [Submodule URLs](https://github.com/deepseek-ai/DeepInfer/blob/9bd9cf243fc53ef9afbf8f04d391d989117d6ab9/.gitmodules#L1-L18)
- [Kernel use](https://github.com/deepseek-ai/DeepInfer/blob/9bd9cf243fc53ef9afbf8f04d391d989117d6ab9/deepinfer/model_executor/models/v4_modules/index_attn.py#L10-L24)

**中文讲解：** 本次深读重点是 runtime 与库的接口，不声称逐行审计所有 vendor kernel。复现时必须递归获取这些锁定版本。

## 22. Graph buckets influence execution cost

The graph runner selects the smallest captured bucket that covers total_q

- Capture stores reusable graph outputs and input buffers, sharing a memory pool.
- The replay path uses a graph handle for timing when supported.
- Bucket padding affects both execution cost and the speculative scheduler’s best batch choice.

- [Capture / select / replay](https://github.com/deepseek-ai/DeepInfer/blob/9bd9cf243fc53ef9afbf8f04d391d989117d6ab9/deepinfer/worker/cuda_graph_runner.py#L82-L156)
- [Graph-aware throughput estimate](https://github.com/deepseek-ai/DeepInfer/blob/9bd9cf243fc53ef9afbf8f04d391d989117d6ab9/csrc/engine/mtp_varlen.hpp#L226-L253)

**中文讲解：** 有效 token 数与 graph bucket 大小是两个量。调参要同时看 padding、内存与测得的耗时曲线，不能只增加 batch 上限。

## 23. Confidence scheduling chooses verification work

MTPVarlen maximizes expected accepted tokens per estimated step time

- One golden token per sequence forms the baseline. Ranked confidence estimates add draft verification slots.
- N−2 confidence chooses total work. N−1 information allocates per-sequence lengths, with GPU correction under ZOS.
- Measured forward/sampler times update runtime estimates. No decode curve falls back to all available drafts.

- [MTPVarlen.schedule](https://github.com/deepseek-ai/DeepInfer/blob/9bd9cf243fc53ef9afbf8f04d391d989117d6ab9/csrc/engine/mtp_varlen.hpp#L133-L267)
- [Runtime feedback](https://github.com/deepseek-ai/DeepInfer/blob/9bd9cf243fc53ef9afbf8f04d391d989117d6ab9/deepinfer/engine/llm_engine.py#L984-L1003)

**中文讲解：** DSpark 的关键是 draft 和 verification 的联合系统设计。这里不是固定每个请求验证 5 个 token，nextn 只是最大草稿长度。

## 24. A device kernel redistributes the token budget

The CUDA TileLang implementation ranks cumulative draft confidence

- Phase 1 gathers prior rows through remap and computes cumulative products. Fresh rows use zero rates.
- Phase 2 counts better candidates in parallel. Higher confidence wins, with lower flat index breaking ties.
- Each sequence gets one golden token plus its selected drafts. This is an explicit rank-counting kernel, not a full sort.

- [CUDA confidence kernel](https://github.com/deepseek-ai/DeepInfer/blob/9bd9cf243fc53ef9afbf8f04d391d989117d6ab9/deepinfer/model_executor/layers/tilelang_ops/cuda/schedule_mtp_varlen.py#L14-L83)
- [Wrapper and reference](https://github.com/deepseek-ai/DeepInfer/blob/9bd9cf243fc53ef9afbf8f04d391d989117d6ab9/deepinfer/model_executor/layers/tilelang_ops/schedule_mtp_varlen.py#L11-L85)

**中文讲解：** 示例按代码手算，未运行 GPU。pairwise rank counting 的工作量随 batch 和 nextn 增长，适合结合实际小 nextn 和测量结果评估，不能凭算法名假设无限扩展。

## 25. Output constraints interact with recovery

Determinism and structured decoding require explicit configurations

- [Determinism settings](https://github.com/deepseek-ai/DeepInfer/blob/9bd9cf243fc53ef9afbf8f04d391d989117d6ab9/README.md#L27-L29)
- [Compiler.dispatch_and_compile](https://github.com/deepseek-ai/DeepInfer/blob/9bd9cf243fc53ef9afbf8f04d391d989117d6ab9/deepinfer/structure_output/compiler.py#L54-L70)
- [Matcher mask and rollback](https://github.com/deepseek-ai/DeepInfer/blob/9bd9cf243fc53ef9afbf8f04d391d989117d6ab9/deepinfer/structure_output/matcher.py#L181-L223)
- [Preemption constraint](https://github.com/deepseek-ai/DeepInfer/blob/9bd9cf243fc53ef9afbf8f04d391d989117d6ab9/csrc/engine/scheduler.hpp#L766-L787)

**中文讲解：** “支持 JSON schema”不代表任何资源压力下都可透明重试。服务层要把 FINISHED_PREEMPTED 等结束原因准确传给上层。

## 26. Recipe supplies a protocol boundary

deepseek-recipe converts conversations and output streams around an inference backend

- Rust libraries and Python bindings handle API conversion, prompt rendering, token encoding, and response parsing.
- PromptTokenizer.encode_ids receives explicit special-token ranges rather than treating all matching text as control tokens.
- The caller supplies inference, tool execution, and HTTP transport. Constraint declarations still require backend enforcement.

- [Recipe release scope](https://github.com/deepseek-ai/deepseek-recipe/blob/935817c66f5d6e64838f419692545f06787e485f/README.md#L9-L43)
- [Special-token-aware tokenizer](https://github.com/deepseek-ai/deepseek-recipe/blob/935817c66f5d6e64838f419692545f06787e485f/deepseek-recipe-encoding/src/tokenizer.rs#L13-L121)

**中文讲解：** 要做兼容 API，tokenizer.encode(prompt) 之外还有协议语义。Recipe 是可复用边界，但不会自动把 DeepInfer 变成完整在线服务。

## 27. Benchmark scope and reproducibility

The published Pareto curves use different prefill and decode deployments

- [Benchmark hardware](https://github.com/deepseek-ai/DeepInfer/blob/9bd9cf243fc53ef9afbf8f04d391d989117d6ab9/README.md#L77-L84)
- [Sweep inputs / output](https://github.com/deepseek-ai/DeepInfer/blob/9bd9cf243fc53ef9afbf8f04d391d989117d6ab9/examples/sweep/run_sweep.sh#L1-L90)
- [Deployment claims, documentation only](https://github.com/deepseek-ai/DeepInfer/blob/9bd9cf243fc53ef9afbf8f04d391d989117d6ab9/doc/inference_deployment_qa.md#L15-L26)

**中文讲解：** 本 deck 不转抄图中曲线点，也不把离线结果当作线上 SLA。官方部署文档的集群规模、收入和约 80% 离线效率是陈述，不是本次验证结果。

## 28. Deployment prerequisites and missing services

The released target is Linux with recent datacenter accelerators

- Supported model: DeepSeek-V4.1-Flash. Hardware: NVIDIA SM100 or Huawei Ascend 950.
- README requires GCC ≥13, Python 3.12, CUDA 13 or CANN 9.2. A Mac cannot validate device execution.
- A full service still needs request routing, cache lookup/storage lifecycle, inter-stage transfer, cancellation, and API transport.
- Published Q&A describes external KV storage on 3FS and DP balancing. Those descriptions do not establish complete released source.

- [Hardware / prerequisites](https://github.com/deepseek-ai/DeepInfer/blob/9bd9cf243fc53ef9afbf8f04d391d989117d6ab9/README.md#L33-L52)
- [Storage and routing, documentation](https://github.com/deepseek-ai/DeepInfer/blob/9bd9cf243fc53ef9afbf8f04d391d989117d6ab9/doc/inference_deployment_qa.md#L130-L197)
- [Unimplemented service hooks](https://github.com/deepseek-ai/DeepInfer/blob/9bd9cf243fc53ef9afbf8f04d391d989117d6ab9/deepinfer/engine/llm_engine.py#L801-L849)

**中文讲解：** 平台适配不等于任意显卡兼容。上线评估应先建立硬件、模型、锁定依赖和失败恢复矩阵，再考虑吞吐优化。

## 29. Engineering takeaways

The strongest reusable ideas lie at state and execution boundaries

- [Async correction](https://github.com/deepseek-ai/DeepInfer/blob/9bd9cf243fc53ef9afbf8f04d391d989117d6ab9/deepinfer/worker/worker.py#L191-L246)
- [Expert placement](https://github.com/deepseek-ai/DeepInfer/blob/9bd9cf243fc53ef9afbf8f04d391d989117d6ab9/deepinfer/model_executor/eplb/policy.py#L12-L73)
- [Runtime optimization](https://github.com/deepseek-ai/DeepInfer/blob/9bd9cf243fc53ef9afbf8f04d391d989117d6ab9/csrc/engine/mtp_varlen.hpp#L221-L265)

**中文讲解：** 这些是基于代码的工程建议，不是作者承诺。可先复用思想、验证局部组件，再决定是否整体采用 runtime。

## 30. Source map and remaining evidence gaps

Every technical slide links a reviewed snapshot and source location

- Read next: entrypoints/llm.py, engine/llm_engine.py, csrc/engine/scheduler.hpp, worker/worker.py.
- Model path: v4_modules/attn.py, index_attn.py, mlp.py, plus worker/cache_engine.py.
- Companions: harness search/file seams and Recipe token encoding. Full source index includes per-slide links.
- Limits: static review, no GPU benchmark, no audit of the unreleased cache/routing services, and no verified standalone search backend.

- [Complete source index](https://github.com/wangyong1972/docs/blob/main/papers/deepseek-inference/sources.md)
- [Reproducible authoring source](https://github.com/wangyong1972/docs/blob/main/papers/deepseek-inference/deck-source/slides.json)
- [Reviewed DeepInfer commit](https://github.com/deepseek-ai/DeepInfer/commit/9bd9cf243fc53ef9afbf8f04d391d989117d6ab9)

**中文讲解：** 可以沿 source index 复查每个结论。若用户的 search 指另一个新仓库，需要具体名称后补充，不能用猜测填空。
