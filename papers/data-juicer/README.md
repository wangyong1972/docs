# Data-Juicer 1.0 → 2.0：面向基础模型的一站式/云规模数据操作系统

> 本主题把两篇论文作为一个「演化中的同一系统」来分析：**Data-Juicer**（SIGMOD 2024 Companion）与 **Data-Juicer 2.0**（NeurIPS 2025 Spotlight）。
> 配套文件：本目录 `deck.pptx`（英文架构评审 deck，约 13 页）与 `sources.md`（权威来源 + 量化主张核对表）。
>
> **标注约定**：〔论文〕= 直接来自论文正文/图表；〔仓库〕= 来自 `datajuicer/data-juicer` 代码/配置（快照 commit `1e9720d0`）；〔解读〕= 本文作者的架构判断，非论文/仓库原话。

---

## 一、标题与书目信息

### 论文 1 — Data-Juicer
- **标题**：Data-Juicer: A One-Stop Data Processing System for Large Language Models
- **作者**：Daoyuan Chen\*, Yilun Huang\*, Zhijian Ma\*, Hesen Chen\*, Xuchen Pan†, Ce Ge†, Dawei Gao†, Yuexiang Xie, Zhaoyang Liu, Jinyang Gao, Yaliang Li‡, Bolin Ding‡, Jingren Zhou（均来自阿里集团）〔论文〕
- **发表**：SIGMOD/PODS 2024 **Companion** 卷，页 120–134，DOI `10.1145/3626246.3653385`〔Crossref/仓库 BibTeX；论文正文未出现 "SIGMOD"〕
- **arXiv**：`2309.02033`（20 页，10 图，9 表）
- **注意**：不要写成 "demo track"——Crossref 记录只有 `proceedings-article`；稳妥写法是 "SIGMOD 2024 Companion"。

### 论文 2 — Data-Juicer 2.0
- **标题**：Data-Juicer 2.0: Cloud-Scale Adaptive Data Processing **for and with** Foundation Models（注意是 "for **and with**"）
- **作者**：Daoyuan Chen, Yilun Huang, Xuchen Pan, Nana Jiang, Haibin Wang, Yilei Zhang, Ce Ge, Yushuo Chen, Wenhao Zhang, Zhijian Ma, Jun Huang, Wei Lin, Yaliang Li, Bolin Ding, Jingren Zhou〔论文〕
- **发表**：**NeurIPS 2025（Spotlight）**〔README badge / 仓库 BibTeX〕
- **arXiv**：`2501.14755`（43 页，16 图，4 表）

### 代码
- **仓库**：https://github.com/datajuicer/data-juicer（Apache-2.0；论文 2 写的是 `modelscope/data-juicer`，现已迁到 `datajuicer` org）〔仓库〕
- **文档**：https://datajuicer.github.io/data-juicer/
- **PyPI**：`py-data-juicer`；Docker：`datajuicer/data-juicer`

---

## 二、执行摘要

Data-Juicer（DJ）把「LLM/多模态模型的训练数据清洗与合成」抽象成**可组合的算子（Operator）**与**可版本化的 YAML 配方（recipe）**。1.0 版用四类原子算子（Formatter / Mapper / Filter / Deduplicator，代码中另有 Selector）+ HuggingFace-datasets（Arrow 列存）建立了「配方 → 处理 → 分析 → 训练 → 评估 → 反馈」的闭环，并证明**用更少、更干净的数据训练出更好的模型**：在 LLaMA-1.3B / 150B token 预训练上，16 个 HELM 任务平均分**最高 +7.45%**，GPT-4 两两对比胜率**最高 +17.5%**〔论文 1 摘要/§7〕。

2.0 版是**一次运行时重构，而非质量增益的再证明**：它把重点从「数据对模型质量的影响」转向「云规模 + 多模态 + 自适应执行」。三条主线：① **多模态**（图像/视频/音频，带特殊 token 的 text 对齐 schema）；② **云原生成熟度**（Ray Data / MaxCompute、HuggingFace / ModelScope 数据集 hub）；③ **自适应与规模规划**（运行时 Probe 测速驱动 OP 重排、批大小、GPU/并行度分配）。关键性能：70B 样本在 6400 核上约 2.1 小时完成；5TB 去重在 1280 核上 2.8 小时〔论文 2 §5.4/表 1〕。

**一句话定位**〔解读〕：Data-Juicer 是「**处理/执行系统强、数据治理弱**」。配方、信号（stats）、策略即代码、按 OP 的血缘报告都很成熟；但**记录级稳定身份与数据集版本**是两块硬缺口——这正是其 provenance 只能当"日志读"、不能当"图查询"的根因。

---

## 三、要解决的问题

论文 1 把 LLM 数据工程归纳为四个挑战〔论文 1 §1〕：

1. **C1 配方高度异构**——不同团队各写一套清洗逻辑，无标准抽象。
2. **C2 反馈太贵**——要验证某个数据配方好坏，得重训十亿级模型，代价极高、周期极长。
3. **C3 易用性/可扩展性差**——研究者和工程师难以复用一个数据管线。
4. **C4 数据量大**——数十亿到数万亿 token，而"系统级优化"常被现有研究绕过。

论文 2 则把问题升级到**规模与模态**：TB 级、万核以上的处理；图像/视频/音频与文本的联合清洗；以及"同一套算子如何在不同计算引擎（单机 / Ray / MaxCompute）上运行而不重写"。

---

## 四、为什么重要

LLM 质量对**数据**极其敏感，而数据工程的工程化程度长期落后于模型侧。Data-Juicer 的价值在于把"数据清洗"从一次性脚本变成**可复用、可组合、可评估的基础设施**——与 Dolma（偏"语料产物 + 可复现"）和 DataComp-LM（偏"数据-模型-评估基准环"）不同，DJ 站的是**通用算子库 + 执行引擎**这一层（详见第十五节对比）。对要沉淀"企业数据中台/数据加工平台"的团队，它是最接近可直接借用的开源参考实现。

---

## 五、核心思想

1. **算子即最小可组合单元**：一切清洗/合成/分析都表达为 OP，OP 有统一生命周期（compute_stats → process），由 `Registry` 注册、按名称在配方里引用。〔论文 1 §3；仓库 `base_op.py`〕
2. **配方即声明**：一个 YAML 就是一条数据产品线，`process:` 列表按顺序声明算子与参数；配得上的东西 Git 可版本化、可 diff。〔论文 1 §5.1〕
3. **"text / meta / stats" 三段式样本**：原始内容、元数据、算出的统计量（可被下游算子复用）显式分开——这是"信号与证据"分离的雏形。〔论文 1 §3.1〕
4. **分析-处理-训练闭环（Data-in-the-LLM-dev-Loop）**：analyze → refine → process → 再 analyze → train + 自动 eval（质量退化即早停）→ 与 Reference Models 对照。〔论文 1 §4.4〕
5. **2.0：运行时自省（Probe）**：在真实数据上先"试跑"各算子测速/测资源，再用测得的速度驱动重排、批大小与 GPU 分配——从 1.0 的"贪心静态优化"变成"数据感知的自适应规划"。〔论文 2 §4.2/App. G〕
6. **2.0：Facade 数据集 + 多模态对齐 schema**：一个 `Data-Juicer-Dataset` 门面屏蔽底层引擎差异；多模态用 `<__dj__image>` 这类特殊 token 嵌在文本流里、以 `<|__dj__eoc|>` 做 chunk 对齐。〔论文 2 §4.1〕
7. **2.0：策略与机制尽量分离**：清洗"判据"以算子阈值形式出现在配方里，`DataValidator` 用声明式 `validators:` 块校验 schema/字段。〔论文 2 §4.1；仓库 `config_all.yaml`〕

---

## 六、系统架构 / 数据生命周期

### 6.1 数据生命周期（端到端）
```
原始数据（本地 / S3 / HDFS / HuggingFace / ModelScope）
   → DatasetBuilder + DataValidator（来源解析 + schema 校验）
   → 算子 DAG（Mapper/Filter/Dedup/Selector/Grouper/Aggregator/Pipeline）
   → Export（分片写出）
   → Analyzer / Tracer / Visualizer（统计、逐样本变更、血缘报告）
   →（可选）训练 + Evaluator → 反馈回配方
```
〔论文 1 §4–5；论文 2 §4.1；仓库 `core/` 目录结构〕

### 6.2 执行引擎抽象（Facade）
- 单机：HuggingFace `Dataset`；分布式：`Ray Data`（+ 分区/检查点）；云：`MaxFrame-DataFrame`（MaxCompute）。〔论文 2 App. E.1〕
- 论文 1 还提到 **Apache Beam / Flink** 路径（通过把底层接口替换为 Beam 对应实现），并承认多引擎意味着"额外的代码开发"。〔论文 1 §6/App. B.3.5〕
- 〔解读〕三引擎并非完全等价：论文 2 自述 Ray 有单头节点传输瓶颈、MaxCompute 文本任务比 Ray 快约 4×（一半核）、多模态却慢约 1.5×。**"引擎无关"更多是最小公分母 + 逃生舱，而不是零成本抽象。**

---

## 七、主要抽象与数据模型

### 7.1 Operator 抽象（核心）
基类层次〔仓库 `data_juicer/ops/base_op.py`〕：

| 类型 | 契约 | 说明 |
|---|---|---|
| `Formatter` | `load_dataset() -> Dataset` | 把外部格式读成内部数据集 |
| `Mapper` | `process(sample)->Dict` | 样本级变换（改/增字段） |
| `Filter` | `compute_stats(sample)->Dict` + `process(sample)->bool` | **先出统计量、再出布尔**——分析器可看到全量统计而非仅过滤后子集 |
| `Deduplicator` | `compute_hash` + `process(dataset)->Dataset` | 数据集级去重（精确/近似） |
| `Selector` | `process(dataset)->Dataset` | 按排序/采样挑选样本 |
| `Grouper` / `Aggregator` | 批级聚合/分组 | 2.0 新增的组合算子 |
| `Pipeline` | 编排子算子（含 Ray vLLM 推理） | 2.0/仓库 |

- **Filter 的"统计量/布尔"分离是承重设计**：它把"计算指标"与"按指标过滤"解耦，分析器因此能看到过滤之前的全量统计分布。〔论文 1 §3.2〕
- 每个 OP 声明 `_supported_exec_modes`（如 `Mapper/Filter/Pipeline = ("default","ray","ray_partitioned")`，而 `Deduplicator = ("default",)`）——这是机器可读的"每引擎支持矩阵"，也解释了为什么存在 `ray_*_deduplicator` 独立类。〔仓库 `base_op.py`〕

### 7.2 算子规模（数字口径不一，需注明版本）
- 论文 1：**over 50** 个文本算子、**20+** 配方。〔论文 1 摘要/§8〕
- 论文 2：摘要 "**100+**"、§1 又写 "**150+ 多模态**"、§2 写 "**新增约 100**"——**同一文档内自相矛盾**。〔论文 2〕
- 仓库当前：**200+**（README 徽章）、**230**（`docs/Operators.md` 精确到 8 类：aggregator 4 / dedup 10 / filter 58 / formatter 8 / grouper 3 / mapper 138 / pipeline 3 / selector 6）。〔仓库〕
- 代表算子（含实现细节，〔仓库〕）：`text_length_filter`（长度区间）、`perplexity_filter`（困惑度阈值）、`document_deduplicator`（MD5 精确）、`document_minhash_deduplicator`（**num_permutations=256, jaccard_threshold=0.7**）、`document_simhash_deduplicator`（**window=6, blocks=6, hamming=4**）、`image_text_similarity_filter`（CLIP 余弦）、`video_motion_score_filter`（光流/RAFT）、`image_captioning_mapper`、`topk_specified_field_selector`、`key_value_grouper`。

### 7.3 数据集表示与多模态 schema
- **1.0**：样本 = 结构化行，逻辑上分 `text` / `meta` / `stats`；底层 HF-datasets（Arrow 列存）。支持 txt/json/parquet/html/md/pdf/code 等。〔论文 1 §3.1〕
- **2.0**：`DJDataset` / `NestedDataset`；多模态数据通过**特殊 token**（`<__dj__image>` / `<__dj__audio>` / `<__dj__video>`）嵌入 `text`，`<|__dj__eoc|>` 做 chunk 对齐，支持简单图文对与 **MMC4 式交织数据**。样本 JSON 含 `text`（含内联 token）、`query/response/history`（后训练）、`images:[paths]`、`meta:{src,version}`、`stats:{...}`。〔论文 2 §4.1/App. E.2〕
- 双向转换工具：`tools/fmt_conversion/` 含 `dj_to_llava.py`、`dj_to_mmc4.py`、`dj_to_alpaca.py`、`ms_swift_sharegpt_to_dj.py` 等。〔仓库〕

---

## 八、处理与执行模型

### 8.1 配方（配置）机制
- `dj-process --config recipe.yaml`；Python API `NestedDataset.from_dict(...).process([...])`；`DJDataset.load(src).process(...).export(dst)`。〔README / 论文 2 Listing 8〕
- 配置解析用 **jsonargparse**（支持命令行、YAML/JSON/JSONnet、环境变量、默认值的混合）；OP 参数通过 `parser.add_class_arguments(theclass=op_cls, nested_key=op_name, ...)` 自动注册，再按类型 `sort_op_by_types_and_names()` 分派。〔仓库 `data_juicer/config/config.py`〕
- 顶层字段（`config_all.yaml`）：`project_name`、`dataset_path`、`dataset.configs[].{type: local|hf|modelscope, path, weight}`、`validators`、`export_path/shard_size`、`keep_stats_in_res_ds`、`op_fusion`、`fusion_strategy: greedy|probe`（**默认 probe**）、`adaptive_batch_size`、`executor_type: default|ray|ray_partitioned`、`use_dag`、`partition.mode: auto|manual`、`image_key/video_key/audio_key` 等。〔仓库〕
- ⚠️ 〔仓库〕CLI 入口点存在漂移：`pyproject.toml` 把 `dj-process` 指向 `data_juicer.tools.process_data:main`，但该路径在 HEAD 缺省（真实文件在仓库根 `tools/process_data.py`）。**脚本化前需在干净 venv 里装一次 `py-data-juicer` 验证。**

### 8.2 Ray 集成（关键实现）
- `ray_dataset.py`：`import ray`、`from ray.data import ActorPoolStrategy, TaskPoolStrategy`；`map_batches(..., compute=TaskPoolStrategy(size=op.num_proc))`，弹性规模用 `ActorPoolStrategy(min_size, max_size)`。〔仓库〕
- `ray_executor.py` / `ray_executor_partitioned.py`（PartitionedRayExecutor，分区 + 检查点 + actor/task 并发上限）；`utils/ray_utils.py` 有 `@ray.remote` 的节点探针（收集每节点 CPU/GPU/内存）。〔仓库〕
- Ray **Data + Actors + Tasks** 三者都在用；去重里还有真实的远端 actor pool（BTS union-find）。〔论文 2 App. F.1；仓库〕
- `ops/pipeline/*_with_ray_vllm_pipeline.py`：把 vLLM 推理做成 pipeline 算子。〔仓库〕

### 8.3 自适应执行（2.0 核心）
- **Probe**：`Adapter.probe_small_batch()` 随机采样（默认 `min(1000, remaining_data_size)`）试跑各算子，测 `speed`/`resource`。〔论文 2 App. G；仓库 `core/adapter.py`〕
- **重排**：1.0 是贪心（只把融合算子挪到组尾）；2.0 按实测速度快→慢、在可交换约束内排，融合算子速度估计 `v_fused = 1/Σ(1/v_i)`。〔论文 2 App. G.1〕
- **自动资源分配**：模型算子给 GPU + vLLM 量化 + VRAM 基准（`mem_required`）；I/O 算子分层并行（批处理 × 多进程 × 多线程），并行度调向 **90%** 利用率。〔论文 2 App. G〕
- **OP 融合**：`op_fusion.py` 的 `FUSION_STRATEGIES={"greedy","probe"}`；共享中间量（`INTER_LINES`/`INTER_WORDS`/`LOADED_IMAGES` 等）驱动可融合判定；`fuse_operators(ops, probe_res=..., mapper_fusion=True, mapper_fusion_vram_limit=0.9)`。〔仓库〕
- **容错/流式**：2.0 做样本级故障隔离（1.0 一下坏样本毁整个作业）；流式 JSONL 加载；按 Ray 块策略 128MB 预切分。〔论文 2 App. F.2/F.3〕

---

## 九、可扩展性与性能结果（仅核对过的数字）

### 论文 1（文本，优化收益；〔论文 1 §7.2〕）
| 指标 | 数值 | 上下文 |
|---|---|---|
| 端到端时间 / 内存 | **−50.6% / −55.1%**（平均） | vs RedPajama+Dolma，Books/arXiv/C4，np=[32,64,128] |
| 最坏时间 / 内存 | **−88.7%** / 内存仅 **22.9%** | arXiv / Books |
| OP 融合+重排 | 端到端最高 **−24.91%**，可融合段最高 **−42.04%** | 14 OP / 5 可融合 |
| Ray 分布 | **−87.4%**（StackExchange）/ **−84.6%**（arXiv） | 16 台服务器、20Gbps、NAS |
| 质量分类器 F1 | **97.47%**（GPT-3 复现）/ **98.64%**（中文）/ **61.56%**（代码，弱） | 4:1 划分 |

### 论文 2（云规模，〔论文 2 §5 / 表 1 / App. H〕）
| 指标 | 数值 | 上下文 |
|---|---|---|
| 大规模样本 | **70B 样本，7611 秒（≈2.1 h）** | 6400 核（125000× 数据集） |
| 去重 | **5TB，168.10 分钟（2.8 h）** | 1280 核，MinHash `ray_bts_minhash_deduplicator` |
| MinHash 引擎 | **3.3×** | BTS union-find + hash 聚合 vs vanilla Ray |
| 重排+融合 | 最高 **−70.22%**（13 OP）；46.09%（5 OP） | 复杂/简单配方 |
| GPU 利用率 | **≥50%** 节省（4 个图像 OP）、最高 **99%**；BLIP-2 **8669→305 s**；SDXL **100 h→~1 h** | 8×A100 |
| 批处理 | 最高 **−84%** | 默认 `batch_size=1000` |
| 去重扩展性 | 5× 数据 → **4.02–5.62×** 时间；2× 核 → 时间 **58.9–67.1%** | |
| Ray-DLC vs ECS | **−24.8%** | 56M 样本 |
| AI-CPFS vs CPFS | **1625 vs 4396 s = 2.7×** | 3× 带宽 + RDMA |
| MaxCompute | 文本 **约 1/4 时间、1/2 核**；多模态慢 **1.5×** | vs Ray |

> **不要引用的数字**：README 的 "OP fusion 2–10x" 与论文所有数据（24.91%/42.04%/70.22%）都对不上；"50 Ray nodes" 只出现在 README、论文是"6400 核"。吞吐没有 in-process records/sec 口径，只有墙钟时间 + 各实验不同定义的"样本"。〔解读〕
> MaxCompute "比 Spark SQL 快 50%" 是论文自述"内部经验对比"，无数据集/查询/方法学。〔论文 2 App. F.1〕

---

## 十、实验与评估方法

### 论文 1（数据→质量闭环是主线；〔论文 1 §7〕）
- **预训练**：精炼 RedPajama + The Pile；LLaMA-1.3B；固定训练配置、只改数据；checkpoint 50B/100B/150B token；16 个 HELM 核心任务；基线 Falcon-1.3B（RefinedWeb）、Pythia-1.4B（Pile）；系统基线 RedPajama+Dolma（**pin commit**）。
- **微调**：LLaMA-7B（英）+ LLaMA-2-7B（中）；Alpaca 超参；GPT-4 两两 win/tie；对随机采样同规模对照组。
- **数据消减**：中文最高 −90.4%、平均 −56.8% 数据量下仍取得更高 win rate。

### 论文 2（系统/规模为中心，**不做质量再验证**；〔论文 2 §5〕）
- 三档规模（small 560K–2.24M / medium 5.6M–56M / large 56M–70B 样本）、每配方 5 个代表性算子、三引擎（Standalone/Ray/MaxCompute）、三类负载（过滤密集 / 模型算子 / 语义可编辑多模态）。
- 数据源：LLaVA 预训练的 **560k 图文对**，按 ×2/×4/.../×125000 放大。
- 模型质量实验是**引用**自独立的 Sandbox 论文（ICML'25 Spotlight，arXiv 2407.11784），**非本文所做**——不要把 "2.0 提升模型质量" 当作本文结论。〔解读，重要〕

---

## 十一、开源实现（仓库走查要点）

- **仓库**：`datajuicer/data-juicer` @ `1e9720d0`（main，2026-09），Apache-2.0，≈7.0k stars，1,417 文件 / 863 个 `.py`，活跃开发。〔仓库，2026-09 快照〕
- **目录**：`data_juicer/{analysis,config,core,download,format,ops,tools,utils}`；`ops/` 按 `filter/ mapper/ deduplicator/ selector/ grouper/ aggregator/ pipeline/` 分目录；`core/{data,executor,tracer}`；`tools/{quality_classifier,hpo,mcp_*,...}`；`demos/`（含 `data_process_hpo`、`data_process_loop`、`elastic_sharding`、`partition_and_checkpoint`、`agent`、`tool_quality_classifier`、`process_on_ray`、`process_video_on_ray`）。
- **关键文件**：`ops/base_op.py`（OP 基类/Registry/`_supported_exec_modes`）、`ops/op_fusion.py`、`ops/fused_batch_executor.py`、`core/adapter.py`（Probe/`batch_size_strategy`/`insight_mining`）、`core/data/{dj_dataset,ray_dataset,dataset_builder,data_validator,load_strategy}.py`、`core/executor/{ray_executor,ray_executor_partitioned,dag_execution_strategies,factory}.py`、`config/config.py` + `config_all.yaml`。
- **扩展方式**：子类化 `Filter/Mapper` + `@OPERATORS.register_module`；外部算子经 `custom_operator_paths`；共享中间量注册到 `INTER_*` 组。〔仓库 `DeveloperGuide.md`〕

---

## 十二、优势

1. **算子抽象 + 配方即产品**：这是 DJ 最强、最可迁移的部分——YAML 可版本化、可 diff、可 CI。〔论文 1 §5〕
2. **Filter 的 stats/bool 分离**：让"证据"（统计量）与"决策"（过滤）解耦，分析器基于全量证据。〔论文 1 §3.2〕
3. **去重实现扎实**：精确 MD5 / MinHash LSH / SimHash 都有真实默认值与 C++/Cython 加速，分布式 union-find 有实测 3.3× 加速。〔论文 2 §4.1/App. F.1；仓库〕
4. **2.0 运行时自省（Probe）**：这是从"静态假设"到"数据感知"最关键的一步，融合策略默认 `probe`。〔论文 2 §4.2〕
5. **多模态覆盖面广**：图像/视频/音频 + 交织数据 + 后训练（SFT/RFT）格式，转换工具齐全。〔论文 2 §2/App. B〕
6. **诚实的三级成熟度标签**（🟢Stable/🟡Beta/🔴Alpha）：`docs/Operators.md` 给每个算子标稳定性，是最值得信任的"采购信号"。〔仓库〕
7. **生态落地证据**：阿里云 PAI 深度集成、Tongyi 模型训练数据管线、BiMix/Trinity-RFT 等下游应用。〔论文 2；README〕

---

## 十三、局限与未解决问题

〔论文自述〕
1. Ray 存在**单头节点传输瓶颈**；无 GPU 后端引擎（点名 NeMo Curator）。〔论文 2 §7〕
2. "**大多数算子只能处理英文/中文**"；多语言/隐私/安全被列为未来方向。〔论文 2 §7〕
3. 代码质量分类器 F1 只有 61.56%（论文 1 自认留给未来）。〔论文 1 §7.2.3〕

〔解读——需保留的批判〕
4. **两篇论文评估不对称**：论文 1 闭环验证了"数据→模型质量"；论文 2 43 页却**只验证系统吞吐**，"2.0 比 1.0 数据质量更好"并未被论文 2 建立。
5. **质量头号数字无方差/多种子/误差棒**（7.45%/17.5%/4.9% 都是点估计），且基于 1.3B/7B、150B token——方向有用，70B 规模不保证外推。
6. **数字偏厂商环境**：2.0 大规模结果全在阿里云（ECS/PAI-DLC/MaxCompute/CPFS），"2.7× AI-CPFS" 对比的是两个专有存储档位；"MaxCompute vs Spark 50%" 无方法学。方向性结论，不可当通用基准。
7. **论文与仓库漂移显著**：modelscope→datajuicer、算子数（50/100+/150+/200+/230）口径混乱、`dj-process` 入口点与 HEAD 树不一致——**引用任何数字都要带 commit 哈希**。
8. **记录身份与数据集版本是硬缺口**（见第十四节）：`__dj__uid` 是调用方自给整数、仅两个 `*_with_uid` 去重用到；没有内容寻址的数据集 id、清单/摘要、版本血缘。〔解读〕
9. **多模态 token schema 是把结构塞进字符串**：消费方必须解析 token 还原模态顺序；每加一种模态就扩大 token 表与解析面——它是序列化格式，不是类型化数据模型。〔解读〕
10. **HumanOP（Label Studio）、ReAct/MCP 智能体层、Auto-HPO** 都还很薄：根目录 `label_studio_localhost_connection.json` 暗示 localhost 集成；论文自己把模型驱动 agent 列为 future work。〔解读〕

---

## 十四、对企业级 LLM/多模态数据湖的启示〔解读〕

对照「record / signal / policy / recipe / version / provenance」六概念，Data-Juicer 的映射与差距：

| 概念 | Data-Juicer 现状 | 判定 |
|---|---|---|
| **Record identity** | `__dj__uid`（int，逐样本唯一），仅 `document_minhash_deduplicator_with_uid` / `ray_bts_minhash_deduplicator_with_uid` 消费，用于跨版本增量去重；无系统级 `sample_id`、无跨运行稳定身份 | **部分，需补** |
| **Signal / feature** | `stats`（Filter 必须实现 `compute_stats`）；但 `keep_stats_in_res_ds` 默认 **false**（默认即弃）；分析库齐全（measure/correlation/diversity） | **已实现；默认"一次性"是弱点** |
| **Policy** | 算子阈值即策略（`flagged_words_filter.max_ratio`、`language_id_score_filter.min_score`）；声明式 `validators:` 块、`general_field_filter`、`llm_condition_filter`（自然语言条件） | **部分**（策略即代码，无策略注册/版本/审计/策略-机制分离） |
| **Recipe** | YAML，jsonargparse，Git 可版本化，50+ 社区配方；`project_name/dataset_path/executor_type` 可移植 | **已实现（最强一环）** |
| **Dataset version** | 无内容寻址 id、无 manifest/digest、无版本血缘；`ds_cache_dir` 是内部缓存非用户版本；`meta.version` 是用户自填字段 | **未实现，需新增** |
| **Provenance / lineage** | Tracer/RayTracer 逐样本逐 OP 变更；Reference Models 绑定可回溯训练数据；`utils/job/*` 生命周期日志 | **部分**（诊断性、易失；无持久可查询图，因缺数据集节点 id 可挂边） |

**可落地的借鉴**（〔解读〕）：
1. **把 `keep_stats_in_res_ds` 默认改成真**，或把 stats 落到独立可寻址的"信号表"——这是自建数据湖时"证据与策略分离"的最小正确起点。
2. **引入系统管理的内容寻址记录 id + 数据集清单摘要**，才能把 lineage 从"日志"升级成"可查询图"；`fingerprint_utils.py`/`ckpt_utils.py` 可作部分基座。
3. **配方即声明式数据产品** 是直接可抄的治理单元——但需补"策略版本 + 违规审计"一层。
4. **别把三引擎 Facade 当免费抽象**：在自建平台里明确写出每算子的 `_supported_exec_modes` 支持矩阵，并对不同引擎的语义差异做显式告警。
5. 把 2.0 的 **Probe 自适应** 当作"规模相关规划"的范本：先测速再排 DAG、再分资源，比静态假设稳健得多。

---

## 十五、与其他两个主题的对比（本主题视角的短版）

| 维度 | **Data-Juicer** | Dolma | DataComp-LM |
|---|---|---|---|
| 定位 | 通用**算子库 + 执行引擎** | 开源**语料产物 + 可复现工具链** | 数据-模型-评估**基准环** |
| 核心抽象 | 可组合 Operator + YAML 配方 | (source,id) 文档 + 独立 attributes | 数据集配方 vs 固定训练/评估 |
| 去重 | 精确 + MinHash + SimHash（多引擎） | 精确键 + 单一 Bloom（URL/文档/段落三级） | BFF（Bloom，min-ngram 13） |
| 策略表达 | 算子阈值（代码内） | JSONPath 过滤（YAML 配置） | 固定启发式 + 可插拔模型滤波器 |
| 评估反馈 | 论文 1 有（HELM/GPT-4） | OLMo/消融（1.2B/150B） | 最完备：53 任务、416 次 logged 实验 |
| 数据集版本 | 弱（未实现系统级版本） | 强（v1.5→v1.7 从同一 attributes 重派生） | 中（uuid-keyed 参考 JSON 账本） |
| 记录身份 | 弱（`__dj__uid`，调用方自给） | 强（(source,id) 稳定且可追溯） | 中（uuid 引用、Git 跟踪） |

一句话（〔解读〕）：**Dolma 赢在"信号-策略分离 + 可复现版本"；DataComp-LM 赢在"受控评估反馈 + 实验账本"；Data-Juicer 赢在"算子可组合 + 云规模执行"。**三者恰好互补——一个成熟的企业数据平台需要"DJ 的算子配方 + Dolma 的版本/血缘 + DCLM 的评估闭环"。完整 16 维横评见 my-wiki 的 [[LLM 训练数据平台三系统对比（Data-Juicer / Dolma / DataComp-LM）]]。

---

## 十六、建议重点研读的组件与源文件（〔仓库〕）

**理解 Operator 抽象与生命周期**
- `data_juicer/ops/base_op.py` —— `OP`/`Mapper`/`Filter`/`Deduplicator`/`Selector`/`Grouper`/`Aggregator`/`Pipeline` 契约、`OPERATORS` Registry、`_supported_exec_modes`。

**理解配方与配置**
- `data_juicer/config/config.py`（jsonargparse 参数自动注册）、`data_juicer/config/config_all.yaml`（全量全局字段 + 默认值）、`demos/process_on_ray/configs/demo.yaml`（最小可运行示例）。

**理解自适应执行（2.0 灵魂）**
- `data_juicer/core/adapter.py`（`probe_small_batch`/`batch_size_strategy`/`insight_mining`）、`data_juicer/ops/op_fusion.py`（`fusion_strategy`）、`data_juicer/core/executor/partition_size_optimizer.py`、`gpu_memory_probe.py`。

**理解 Ray 集成**
- `data_juicer/core/data/ray_dataset.py`、`data_juicer/core/executor/ray_executor.py`、`data_juicer/core/executor/ray_executor_partitioned.py`、`data_juicer/utils/ray_utils.py`。

**理解去重**
- `data_juicer/ops/deduplicator/document_minhash_deduplicator.py`（256/0.7）、`document_simhash_deduplicator.py`（6/6/4）、`ray_bts_minhash_deduplicator.py`（BTS union-find）。

**理解多模态 schema**
- `data_juicer/core/data/schema.py`、`tools/fmt_conversion/`（dj ↔ LLaVA/MMC4/ms-swift 等）。

**理解数据校验/血缘**
- `data_juicer/core/data/data_validator.py`、`config_validator.py`、`data_juicer/core/tracer/tracer.py`、`ray_tracer.py`、`data_juicer/utils/job/*`。

---

## 十七、参考文献

1. Data-Juicer（arXiv/SIGMOD 2024 Companion）：https://arxiv.org/abs/2309.02033
2. Data-Juicer 2.0（arXiv/NeurIPS 2025 Spotlight）：https://arxiv.org/abs/2501.14755
3. 代码仓库：https://github.com/datajuicer/data-juicer
4. 官方文档：https://datajuicer.github.io/data-juicer/
5. Data-Juicer Sandbox（ICML'25 Spotlight，独立论文）：https://arxiv.org/abs/2407.11784

---

---

# Data-Juicer 1.0 → 2.0: A One-Stop / Cloud-Scale Data Operating System for Foundation Models

> This topic analyzes two papers as **one evolving system**: **Data-Juicer** (SIGMOD 2024 Companion) and **Data-Juicer 2.0** (NeurIPS 2025 Spotlight).
> Companion files: `deck.pptx` (English architecture-review deck, ~13 slides) and `sources.md` (authoritative sources + quantitative-claim cross-check).
>
> **Annotation legend**: (paper) = taken directly from the paper; (repo) = from `datajuicer/data-juicer` code/config (snapshot commit `1e9720d0`); (interpretation) = this author's architectural judgment, not a paper/repo claim.

---

## 1. Title and bibliographic information

### Paper 1 — Data-Juicer
- **Title**: Data-Juicer: A One-Stop Data Processing System for Large Language Models
- **Authors**: Daoyuan Chen\*, Yilun Huang\*, Zhijian Ma\*, Hesen Chen\*, Xuchen Pan†, Ce Ge†, Dawei Gao†, Yuexiang Xie, Zhaoyang Liu, Jinyang Gao, Yaliang Li‡, Bolin Ding‡, Jingren Zhou (all Alibaba Group) (paper)
- **Venue**: SIGMOD/PODS 2024 **Companion**, pp. 120–134, DOI `10.1145/3626246.3653385` (Crossref / repo BibTeX; the paper body never contains "SIGMOD")
- **arXiv**: `2309.02033` (20 pages, 10 figures, 9 tables)
- **Note**: do not call it "demo track" — Crossref only gives `proceedings-article`; the safe wording is "SIGMOD 2024 Companion".

### Paper 2 — Data-Juicer 2.0
- **Title**: Data-Juicer 2.0: Cloud-Scale Adaptive Data Processing **for and with** Foundation Models ("for **and with**")
- **Authors**: Daoyuan Chen, Yilun Huang, Xuchen Pan, Nana Jiang, Haibin Wang, Yilei Zhang, Ce Ge, Yushuo Chen, Wenhao Zhang, Zhijian Ma, Jun Huang, Wei Lin, Yaliang Li, Bolin Ding, Jingren Zhou (paper)
- **Venue**: **NeurIPS 2025 (Spotlight)** (README badge / repo BibTeX)
- **arXiv**: `2501.14755` (43 pages, 16 figures, 4 tables)

### Code
- **Repo**: https://github.com/datajuicer/data-juicer (Apache-2.0; paper 2 says `modelscope/data-juicer`; the org has since moved to `datajuicer`) (repo)
- **Docs**: https://datajuicer.github.io/data-juicer/
- **PyPI**: `py-data-juicer`; Docker: `datajuicer/data-juicer`

---

## 2. Executive summary

Data-Juicer (DJ) turns "LLM / multimodal training-data cleaning and synthesis" into **composable Operators** and **versionable YAML recipes**. v1 established a four-kind atomic operator model (Formatter / Mapper / Filter / Deduplicator; Selector also exists in code) over HuggingFace-datasets (Arrow columnar), closed the "recipe → process → analyze → train → evaluate → feedback" loop, and proved **better models from less, cleaner data**: on a LLaMA-1.3B / 150B-token pretraining run, **up to +7.45%** average across 16 HELM tasks and **up to +17.5%** GPT-4 pairwise win rate (paper 1 abstract / §7).

v2.0 is a **runtime refactor, not a re-proof of quality gains**: it shifts emphasis from "data's effect on model quality" to **cloud scale + multimodality + adaptive execution**. Three threads: ① **multimodal** (image/video/audio with a special-token-aligned text schema); ② **cloud-native maturity** (Ray Data / MaxCompute, HuggingFace / ModelScope dataset hubs); ③ **adaptive, scale-dependent planning** (a runtime Probe that measures per-operator speed to drive reordering, batch sizing, and GPU/parallelism allocation). Headline performance: **70B samples in ≈2.1 h on 6,400 cores**; **5 TB dedup in 2.8 h on 1,280 cores** (paper 2 §5.4 / Table 1).

**One-line positioning** (interpretation): Data-Juicer is a **strong processing/execution system and a weak data-governance system**. Recipe, signal (stats), policy-as-code, and per-operator lineage reporting are mature; **stable record identity and dataset versioning are the two hard gaps** — the root cause of why its provenance can only be *read as a log*, never *queried as a graph*.

---

## 3. Problem being solved

Paper 1 frames LLM data engineering as four challenges (paper 1 §1):

1. **C1 — highly heterogeneous recipes** across teams, with no standard abstraction.
2. **C2 — expensive feedback**: validating a recipe means retraining a billion-parameter model.
3. **C3 — poor usability/customizability** for model developers reusing a pipeline.
4. **C4 — massive data volume** (billions–trillions of tokens), with system-level optimization "often bypassed by existing studies".

Paper 2 raises the problem to **scale and modality**: TB-scale processing on 10k+ cores; joint cleaning of image/video/audio + text; and running one operator suite across engines (standalone / Ray / MaxCompute) without rewriting.

---

## 4. Why the problem matters

LLM quality is extremely sensitive to **data**, yet data engineering has long lagged the model side in engineering discipline. Data-Juicer's value is turning "data cleaning" from throwaway scripts into **reusable, composable, evaluable infrastructure**. Unlike Dolma (centered on a *corpus artifact + reproducibility*) and DataComp-LM (centered on a *data–model–evaluation benchmark loop*), DJ occupies the **generic operator library + execution engine** layer (see §15). For a team building an enterprise data-processing platform, DJ is the closest directly-borrowable open-source reference.

---

## 5. Core ideas

1. **Operator as the minimal composable unit**: every cleaning/synthesis/analysis step is an OP with a uniform lifecycle (compute_stats → process), registered via `Registry` and referenced by name from a recipe. (paper 1 §3; repo `base_op.py`)
2. **Recipe as declaration**: one YAML is one data-product line; the `process:` list declares operators and parameters in order; it is Git-versionable and diffable. (paper 1 §5.1)
3. **`text / meta / stats` tripartite sample**: raw content, metadata, and computed statistics (reusable by downstream operators) are explicitly separate — an early form of evidence/policy separation. (paper 1 §3.1)
4. **Analyze-process-train closed loop (Data-in-the-LLM-dev-Loop)**: analyze → refine → process → re-analyze → train with auto-eval (early-stop on regression) → compare against Reference Models. (paper 1 §4.4)
5. **2.0 runtime introspection (Probe)**: dry-run each operator on real data to measure speed/resources, then drive reordering, batch sizing, and GPU allocation — replacing v1's greedy static optimization with data-aware adaptive planning. (paper 2 §4.2/App. G)
6. **2.0 Facade dataset + token-aligned multimodal schema**: one `Data-Juicer-Dataset` facade hides engine differences; multimodal content is embedded in `text` via special tokens (`<__dj__image>`) with `<|__dj__eoc|>` chunk alignment. (paper 2 §4.1)
7. **2.0 partial policy/mechanism separation**: thresholds live in the recipe as operator arguments; `DataValidator` checks schema/fields declaratively via a `validators:` block. (paper 2 §4.1; repo `config_all.yaml`)

---

## 6. System architecture / data lifecycle

### 6.1 End-to-end lifecycle
```
raw data (local / S3 / HDFS / HuggingFace / ModelScope)
   → DatasetBuilder + DataValidator (source resolution + schema validation)
   → operator DAG (Mapper/Filter/Dedup/Selector/Grouper/Aggregator/Pipeline)
   → Export (sharded write)
   → Analyzer / Tracer / Visualizer (stats, per-sample diffs, lineage reports)
   → (optional) train + Evaluator → feedback into the recipe
```
(paper 1 §4–5; paper 2 §4.1; repo `core/`)

### 6.2 Execution-engine facade
- Standalone: HuggingFace `Dataset`; distributed: `Ray Data` (+ partitioning/checkpointing); cloud: `MaxFrame-DataFrame` (MaxCompute). (paper 2 App. E.1)
- Paper 1 also mentions an **Apache Beam / Flink** path (swap the underlying interface), conceding multi-engine support means "additional code development". (paper 1 §6/App. B.3.5)
- (interpretation) The three engines are **not** equivalent: paper 2 admits a Ray head-node transfer bottleneck; MaxCompute is ~4× faster than Ray on text (at half the cores) yet ~1.5× slower on multimodal. "Engine-agnostic" is mostly lowest-common-denominator + escape hatches, not a zero-cost abstraction.

---

## 7. Main abstractions and data model

### 7.1 Operator hierarchy (repo `data_juicer/ops/base_op.py`)

| Type | Contract | Purpose |
|---|---|---|
| `Formatter` | `load_dataset() -> Dataset` | read external formats |
| `Mapper` | `process(sample)->Dict` | per-sample transform |
| `Filter` | `compute_stats(sample)->Dict` + `process(sample)->bool` | **stats first, boolean second** — analyzer sees full-distribution stats, not just the surviving subset |
| `Deduplicator` | `compute_hash` + `process(dataset)->Dataset` | dataset-level dedup |
| `Selector` | `process(dataset)->Dataset` | rank/sample selection |
| `Grouper` / `Aggregator` | batch aggregation/grouping | v2 compositional ops |
| `Pipeline` | orchestrate sub-operators (incl. Ray vLLM) | v2/repo |

- The Filter **stats/boolean split is load-bearing**: it decouples "compute a metric" from "filter by a metric", so the analyzer sees pre-filter full distributions. (paper 1 §3.2)
- Each OP declares `_supported_exec_modes` (e.g. `Mapper/Filter/Pipeline = ("default","ray","ray_partitioned")`, but `Deduplicator = ("default",)`) — a machine-readable per-engine support matrix, and the reason for separate `ray_*_deduplicator` classes. (repo)

### 7.2 Operator scale (numbers disagree — pin a version)
- Paper 1: **over 50** text operators, **20+** recipes. (paper 1 abstract/§8)
- Paper 2: abstract "**100+**", §1 "**150+ multimodal**", §2 "**about 100 new**" — self-contradictory within one document. (paper 2)
- Repo today: **200+** (README badge); **230** documented exactly (`docs/Operators.md`: aggregator 4 / dedup 10 / filter 58 / formatter 8 / grouper 3 / mapper 138 / pipeline 3 / selector 6). (repo)
- Representative operators with implementation details (repo): `document_minhash_deduplicator` (**num_permutations=256, jaccard_threshold=0.7**), `document_simhash_deduplicator` (**window=6, blocks=6, hamming=4**), `image_text_similarity_filter` (CLIP), `video_motion_score_filter` (optical flow / RAFT), `image_captioning_mapper`, `topk_specified_field_selector`, `key_value_grouper`.

### 7.3 Dataset representation and multimodal schema
- **v1**: sample = structured row, logically `text` / `meta` / `stats`; backed by HF-datasets (Arrow). Inputs: txt/json/parquet/html/md/pdf/code. (paper 1 §3.1)
- **v2**: `DJDataset` / `NestedDataset`; multimodal data embedded in `text` via special tokens (`<__dj__image>` / `<__dj__audio>` / `<__dj__video>`) with `<|__dj__eoc|>` chunk alignment; supports simple image-text pairs and **MMC4-style interleaved** data. A sample JSON carries `text`, `query/response/history`, `images:[paths]`, `meta:{src,version}`, `stats:{...}`. (paper 2 §4.1/App. E.2)
- Bidirectional converters: `tools/fmt_conversion/{dj_to_llava,dj_to_mmc4,dj_to_alpaca,ms_swift_sharegpt_to_dj}.py`. (repo)

---

## 8. Processing and execution model

### 8.1 Recipe (config) mechanism
- `dj-process --config recipe.yaml`; Python API `NestedDataset.from_dict(...).process([...])`; `DJDataset.load(src).process(...).export(dst)`. (README / paper 2 Listing 8)
- Config parsing via **jsonargparse** (CLI / YAML / JSON / JSONnet / env / defaults); OP params auto-registered through `parser.add_class_arguments(theclass=op_cls, nested_key=op_name, ...)`, then dispatched by `sort_op_by_types_and_names()`. (repo `data_juicer/config/config.py`)
- Top-level fields (`config_all.yaml`): `project_name`, `dataset_path`, `dataset.configs[].{type: local|hf|modelscope, path, weight}`, `validators`, `export_path/shard_size`, `keep_stats_in_res_ds`, `op_fusion`, `fusion_strategy: greedy|probe` (**probe by default**), `adaptive_batch_size`, `executor_type: default|ray|ray_partitioned`, `use_dag`, `partition.mode: auto|manual`, `image_key/video_key/audio_key`. (repo)
- ⚠️ (repo) CLI entry-point drift: `pyproject.toml` points `dj-process` at `data_juicer.tools.process_data:main`, which 404s at HEAD (the real file is repo-root `tools/process_data.py`, with no remapping in `hatch_build.py`). Verify a clean `pip install py-data-juicer` before scripting against the CLI.

### 8.2 Ray integration (key implementation)
- `ray_dataset.py`: `import ray`; `from ray.data import ActorPoolStrategy, TaskPoolStrategy`; `map_batches(..., compute=TaskPoolStrategy(size=op.num_proc))`; elastic sizing via `ActorPoolStrategy(min_size, max_size)`. (repo)
- `ray_executor.py` / `ray_executor_partitioned.py` (PartitionedRayExecutor: partitioning + checkpointing + actor/task concurrency caps); `utils/ray_utils.py` has a `@ray.remote` node probe (per-node CPU/GPU/mem). (repo)
- Ray **Data + Actors + Tasks** are all used; dedup has a real remote-actor pool (BTS union-find). (paper 2 App. F.1; repo)
- `ops/pipeline/*_with_ray_vllm_pipeline.py`: turn vLLM inference into a pipeline operator. (repo)

### 8.3 Adaptive execution (2.0 core)
- **Probe**: `Adapter.probe_small_batch()` samples (default `min(1000, remaining_data_size)`) and executes each op to measure `speed`/`resource`. (paper 2 App. G; repo `core/adapter.py`)
- **Reordering**: v1 was greedy (only fused ops moved to group tail); v2 orders fast→slow within commutativity constraints; fused-op speed estimate `v_fused = 1/Σ(1/v_i)`. (paper 2 App. G.1)
- **Auto resource allocation**: model ops get GPU + vLLM quantization + VRAM benchmarking (`mem_required`); I/O ops get hierarchical parallelism (batch × multiprocess × multithread) tuned toward **90%** utilization. (paper 2 App. G)
- **OP fusion**: `op_fusion.py` `FUSION_STRATEGIES={"greedy","probe"}`; shared intermediates (`INTER_LINES`/`INTER_WORDS`/`LOADED_IMAGES`…) drive fusibility; `fuse_operators(ops, probe_res=..., mapper_fusion=True, mapper_fusion_vram_limit=0.9)`. (repo)
- **Fault tolerance / streaming**: v2 does sample-level fault isolation (v1 killed the whole job on one corrupt sample); streaming JSONL; 128 MB pre-splitting aligned to Ray's block strategy. (paper 2 App. F.2/F.3)

---

## 9. Scalability and performance (verified numbers only)

### Paper 1 (text, optimization gains; paper 1 §7.2)
| Metric | Value | Context |
|---|---|---|
| End-to-end time / memory | **−50.6% / −55.1%** (avg) | vs RedPajama+Dolma, Books/arXiv/C4, np=[32,64,128] |
| Worst-case time / memory | **−88.7%** / **22.9%** of memory | arXiv / Books |
| OP fusion+reordering | up to **−24.91%** e2e, **−42.04%** fusible | 14 OPs / 5 fusible |
| Ray distributed | **−87.4%** (StackExchange) / **−84.6%** (arXiv) | 16 servers, 20 Gbps, NAS |
| Quality classifier F1 | **97.47%** (GPT-3) / **98.64%** (ZH) / **61.56%** (code, weak) | 4:1 split |

### Paper 2 (cloud scale; paper 2 §5 / Table 1 / App. H)
| Metric | Value | Context |
|---|---|---|
| Large-scale samples | **70B samples in 7,611 s (≈2.1 h)** | 6,400 cores (125,000× dataset) |
| Dedup | **5 TB in 168.10 min (2.8 h)** | 1,280 cores, MinHash `ray_bts_minhash_deduplicator` |
| MinHash engine | **3.3×** | BTS union-find + hash aggregation vs vanilla Ray |
| Reorder+fusion | up to **−70.22%** (13 OP); 46.09% (5 OP) | complex/simple recipes |
| GPU allocation | **≥50%** saved (4 image ops), up to **99%**; BLIP-2 **8669→305 s**; SDXL **100 h→~1 h** | 8×A100 |
| Batching | up to **−84%** | default `batch_size=1000` |
| Dedup scaling | 5× data → **4.02–5.62×** time; 2× cores → **58.9–67.1%** time | |
| Ray-DLC vs ECS | **−24.8%** | 56M samples |
| AI-CPFS vs CPFS | **1625 vs 4396 s = 2.7×** | 3× bandwidth + RDMA |
| MaxCompute | text **~1/4 time, 1/2 cores**; multimodal **1.5× slower** | vs Ray |

> **Numbers NOT to cite**: README's "OP fusion 2–10×" is irreconcilable with every published figure (24.91% / 42.04% / 70.22%); "50 Ray nodes" is README-only — the paper says 6,400 cores. Throughput has no in-process records/sec figure (wall-clock only, with a redefined "sample" per experiment). (interpretation)
> "MaxCompute 50% faster than Spark SQL" is the authors' own "internal empirical comparison" with no methodology. (paper 2 App. F.1)

---

## 10. Experiments and evaluation methodology

### Paper 1 (data→quality loop is the thesis; paper 1 §7)
- **Pretraining**: refined RedPajama + The Pile; LLaMA-1.3B; fixed training config, data is the only variable; checkpoints at 50B/100B/150B tokens; 16 HELM core tasks; baselines Falcon-1.3B (RefinedWeb), Pythia-1.4B (Pile); system baselines RedPajama+Dolma (**pinned commits**).
- **Fine-tuning**: LLaMA-7B (EN) + LLaMA-2-7B (ZH); Alpaca hyperparameters; GPT-4 pairwise win/tie with equal-size random-sampling controls.
- **Data reduction**: up to −90.4% (ZH), −56.8% avg data volume while still winning.

### Paper 2 (system/scale-centric; does **not** re-validate quality; paper 2 §5)
- Three scales (small 560K–2.24M / medium 5.6M–56M / large 56M–70B samples), 5 representative ops per recipe, three engines, three workload classes (filter-intensive / model-based / semantically editable multimodal).
- Data source: LLaVA pretraining's **560k image-text pairs**, scaled ×2/×4/…/×125000.
- Model-quality experiments are **cited** from the separate Sandbox paper (ICML'25 Spotlight, arXiv 2407.11784), **not run here** — do not attribute "2.0 improves model quality" to this paper. (interpretation, important)

---

## 11. Open-source implementation (repo walkthrough)

- **Repo**: `datajuicer/data-juicer` @ `1e9720d0` (main, 2026-09), Apache-2.0, ≈7.0k stars, 1,417 files / 863 `.py`, actively developed. (repo, 2026-09 snapshot)
- **Layout**: `data_juicer/{analysis,config,core,download,format,ops,tools,utils}`; `ops/` split into `filter/ mapper/ deduplicator/ selector/ grouper/ aggregator/ pipeline/`; `core/{data,executor,tracer}`; `tools/{quality_classifier,hpo,mcp_*,...}`; `demos/` (incl. `data_process_hpo`, `data_process_loop`, `elastic_sharding`, `partition_and_checkpoint`, `agent`, `tool_quality_classifier`, `process_on_ray`, `process_video_on_ray`).
- **Key files**: `ops/base_op.py` (base classes/Registry/`_supported_exec_modes`), `ops/op_fusion.py`, `ops/fused_batch_executor.py`, `core/adapter.py` (Probe/`batch_size_strategy`/`insight_mining`), `core/data/{dj_dataset,ray_dataset,dataset_builder,data_validator,load_strategy}.py`, `core/executor/{ray_executor,ray_executor_partitioned,dag_execution_strategies,factory}.py`, `config/config.py` + `config_all.yaml`.
- **Extension**: subclass `Filter`/`Mapper` + `@OPERATORS.register_module`; external ops via `custom_operator_paths`; share intermediates by registering into `INTER_*` groups. (repo `DeveloperGuide.md`)

---

## 12. Strengths

1. **Operator abstraction + recipe-as-product**: the strongest, most portable part — YAML is versionable, diffable, CI-able. (paper 1 §5)
2. **Filter's stats/bool separation**: decouples evidence (stats) from decision (filtering); the analyzer reasons over full evidence. (paper 1 §3.2)
3. **Solid dedup**: exact MD5 / MinHash LSH / SimHash with real defaults and C++/Cython acceleration; a distributed union-find with a measured 3.3× win. (paper 2 §4.1/App. F.1; repo)
4. **2.0 runtime introspection (Probe)**: the decisive step from static assumptions to data-aware planning; `fusion_strategy: probe` is the default. (paper 2 §4.2)
5. **Broad multimodal coverage**: image/video/audio + interleaved data + post-training (SFT/RFT) formats, with converters. (paper 2 §2/App. B)
6. **Honest three-tier maturity labels** (🟢Stable/🟡Beta/🔴Alpha) in `docs/Operators.md` — the single best adoption signal. (repo)
7. **Deployment evidence**: deep Alibaba Cloud PAI integration, Tongyi training-data pipelines, BiMix / Trinity-RFT downstream users. (paper 2; README)

---

## 13. Limitations and unresolved questions

(Paper's own)
1. Ray's **single-head-node transfer bottleneck**; no GPU backend engines (NeMo Curator named). (paper 2 §7)
2. "**Most operators can only process data in English/Chinese**"; multilingualism/privacy/safety deferred. (paper 2 §7)
3. The code quality classifier reaches only F1 61.56% (left to future work). (paper 1 §7.2.3)

(Interpretation — keep these caveats)
4. **Evaluation asymmetry between the papers**: paper 1 closes the quality loop; paper 2 (43 pages) validates **throughput only**. "2.0 improves model quality over 1.0" is *not* established by paper 2.
5. **HEADLINE quality numbers lack variance/seeds/error bars** (7.45% / 17.5% / 4.9% are point estimates), on 1.3B/7B at ≤150B tokens — directionally useful, not a 70B-scale guarantee.
6. **Numbers are vendor-adjacent**: all 2.0 large-scale results run on Alibaba Cloud; "2.7× AI-CPFS" compares two proprietary storage tiers; "MaxCompute vs Spark 50%" has no methodology.
7. **Paper/repo drift is real**: `modelscope`→`datajuicer`; operator counts (50 / 100+ / 150+ / 200+ / 230) inconsistent; `dj-process` entry point mismatches HEAD. **Pin a commit hash with every number.**
8. **Record identity and dataset versioning are hard gaps** (§14): `__dj__uid` is a caller-supplied integer used by only two `*_with_uid` deduplicators; there is no content-addressed dataset id, manifest/digest, or version lineage. (interpretation)
9. **The multimodal token schema embeds structure into a string**: consumers must parse tokens to recover modality order; each new modality grows the token set and parsing surface — a serialization format, not a typed data model. (interpretation)
10. **HumanOP (Label Studio), ReAct/MCP agents, and Auto-HPO are thin**: a root-level `label_studio_localhost_connection.json` reads demo-level; the paper itself lists model-driven agents as future work. (interpretation)

---

## 14. Lessons for an enterprise LLM / multimodal data lake (interpretation)

Mapping onto the six governance concepts:

| Concept | Data-Juicer today | Verdict |
|---|---|---|
| **Record identity** | `__dj__uid` (int), consumed only by `*_with_uid` deduplicators for incremental dedup; no system `sample_id`, no cross-run stable identity | **partial — needs work** |
| **Signal / feature** | `stats` (Filters must implement `compute_stats`); but `keep_stats_in_res_ds` defaults **false**; full analysis lib (measure/correlation/diversity) | **implemented; "disposable by default" is the weakness** |
| **Policy** | op thresholds = policy (`max_ratio`, `min_score`); declarative `validators:`; `general_field_filter`; `llm_condition_filter` (natural-language condition) | **partial** (policy-as-code, no registry/versioning/audit/trail) |
| **Recipe** | YAML, jsonargparse, Git-versionable, 50+ community recipes; portable via `project_name/dataset_path/executor_type` | **implemented (strongest)** |
| **Dataset version** | no content-addressed id/manifest/digest/lineage; `ds_cache_dir` is an internal cache; `meta.version` is user-supplied | **not implemented — add it** |
| **Provenance / lineage** | Tracer/RayTracer per-sample per-OP diffs; Reference Models bind traceable data; `utils/job/*` lifecycle logs | **partial** (diagnostic/ephemeral; no queryable graph without a node id) |

Actionable lessons (interpretation):
1. **Flip `keep_stats_in_res_ds` to true**, or persist stats to a separately addressable "signal table" — the minimal correct start for evidence/policy separation in a homegrown lake.
2. **Introduce system-managed content-addressed record ids + a dataset manifest digest** to upgrade lineage from a log into a queryable graph; `fingerprint_utils.py` / `ckpt_utils.py` are partial substrates.
3. **Recipe-as-declarative-data-product is directly copyable** — but add a "policy version + violation audit" layer on top.
4. **Do not treat the three-engine facade as free**: write an explicit per-operator `_supported_exec_modes` matrix and warn loudly about cross-engine semantic differences.
5. **Treat 2.0's Probe as the template for scale-dependent planning**: measure first, then order the DAG and allocate resources — far more robust than static assumptions.

---

## 15. Comparison with the other two topics (short, from this topic's viewpoint)

| Dimension | **Data-Juicer** | Dolma | DataComp-LM |
|---|---|---|---|
| Positioning | generic **operator library + execution engine** | open **corpus artifact + reproducible toolkit** | data–model–evaluation **benchmark loop** |
| Core abstraction | composable Operator + YAML recipe | (source,id) document + detached attributes | dataset recipe vs fixed train/eval |
| Dedup | exact + MinHash + SimHash (multi-engine) | exact-key + single Bloom (URL/doc/paragraph) | BFF (Bloom, min-ngram 13) |
| Policy expression | operator thresholds (in code) | JSONPath filters (in YAML config) | fixed heuristics + pluggable model filters |
| Eval feedback | yes in paper 1 (HELM/GPT-4) | OLMo/ablations (1.2B/150B) | most complete: 53 tasks, 416 logged runs |
| Dataset versioning | weak (no system version) | strong (v1.5→v1.7 re-derived from same attributes) | medium (uuid-keyed reference JSON ledger) |
| Record identity | weak (`__dj__uid`, caller-supplied) | strong ((source,id) stable + traceable) | medium (uuid refs, Git-tracked) |

One line (interpretation): **Dolma wins signal/policy separation + reproducible versioning; DataComp-LM wins controlled evaluation feedback + experiment ledger; Data-Juicer wins operator composability + cloud-scale execution.** They are complementary — a mature enterprise platform wants "DJ's operators+recipes + Dolma's versioning/lineage + DCLM's evaluation loop". The full 16-dimension comparison lives in my-wiki's [[LLM 训练数据平台三系统对比（Data-Juicer / Dolma / DataComp-LM）]].

---

## 16. Recommended components / source files to inspect (repo)

**Operator abstraction & lifecycle**: `data_juicer/ops/base_op.py`.
**Recipe & config**: `data_juicer/config/config.py`, `data_juicer/config/config_all.yaml`, `demos/process_on_ray/configs/demo.yaml`.
**Adaptive execution (2.0's soul)**: `data_juicer/core/adapter.py`, `data_juicer/ops/op_fusion.py`, `data_juicer/core/executor/partition_size_optimizer.py`, `gpu_memory_probe.py`.
**Ray integration**: `data_juicer/core/data/ray_dataset.py`, `data_juicer/core/executor/ray_executor.py`, `ray_executor_partitioned.py`, `data_juicer/utils/ray_utils.py`.
**Dedup**: `data_juicer/ops/deduplicator/document_minhash_deduplicator.py`, `document_simhash_deduplicator.py`, `ray_bts_minhash_deduplicator.py`.
**Multimodal schema**: `data_juicer/core/data/schema.py`, `tools/fmt_conversion/`.
**Validation / lineage**: `data_juicer/core/data/data_validator.py`, `config_validator.py`, `data_juicer/core/tracer/{tracer,ray_tracer}.py`, `data_juicer/utils/job/*`.

---

## 17. References

1. Data-Juicer (arXiv / SIGMOD 2024 Companion): https://arxiv.org/abs/2309.02033
2. Data-Juicer 2.0 (arXiv / NeurIPS 2025 Spotlight): https://arxiv.org/abs/2501.14755
3. Code: https://github.com/datajuicer/data-juicer
4. Docs: https://datajuicer.github.io/data-juicer/
5. Data-Juicer Sandbox (ICML'25 Spotlight, separate paper): https://arxiv.org/abs/2407.11784