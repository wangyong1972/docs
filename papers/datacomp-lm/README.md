# DataComp-LM：寻找下一代语言模型训练集（数据-模型-评估闭环）

> 主题：**DataComp-LM: In Search of the Next Generation of Training Sets for Language Models**（NeurIPS 2024 Datasets & Benchmarks）。
> 配套文件：本目录 `deck.pptx`（英文架构评审 deck，约 13 页）与 `sources.md`（权威来源 + 量化主张核对表）。
>
> **标注约定**：〔论文〕= 论文正文/图表/附录；〔仓库〕= `mlfoundations/dclm` 代码/配置（GitHub Trees API，596 项，`truncated:false`）；〔解读〕= 本文作者的架构判断。

---

## 一、标题与书目信息

- **标题**：DataComp-LM: In search of the next generation of training sets for language models（大小写按 arXiv 原文）
- **作者**：Jeffrey Li\*, Alex Fang\*, Georgios Smyrnis\*, Maor Ivgi\*, … Vaishaal Shankar（55 个署名，\* 为共同一作；机构覆盖 UW、Apple、TRI、UT Austin、TAU、Columbia、Stanford、UCLA、JSC、LAION、AI2、TUM、CMU、Hebrew University、SambaNova、Cornell、USC、Harvard、UCSB、SynthLabs、Bespokelabs.AI、Contextual AI、DatologyAI 等）〔论文〕
- **发表**：**NeurIPS 2024，Datasets and Benchmarks Track**，DOI `10.52202/079017-0455`〔NeurIPS proceedings〕
- **arXiv**：`2406.11794`（cs.LG）
- **代码**：https://github.com/mlfoundations/dclm（**MIT**）
- **项目页**：https://datacomp.ai/dclm/（含 leaderboard）

> ⚠️ **版本钉死（重要）**：NeurIPS camera-ready 摘要写 "**63%** 5-shot MMLU、**2T** token、**6 pp**、**一半算力**"；当前 arXiv/ar5iv 摘要写 "**64%**、**2.6T**、**6.6 pp**、**40% 更少算力**"。**引用时务必注明版本**——本文一律以 arXiv `2406.11794` 为准，除非另说。

---

## 二、执行摘要

DataComp-LM（DCLM）把「**数据选择**」变成一个可受控实验的**基准**：给定一个从 Common Crawl 抽取的 **DCLM-Pool（240T GPT-NeoX token、200B 文档、2013–2022 全部 CC）**，参与者提交**数据配方（recipe）**，然后用**固定的模型训练协议 + 固定的 53 任务评估套件**去打分，只允许"数据"这一个变量变化。它的目的是科学地回答："训练集 A 比 B 好，到底是因为数据好，还是因为架构/学习率/算力不同？"

**DCLM-Baseline**（作者自己跑出的最强配方）= `resiliparse HTML 抽取 → RefinedWeb 启发式过滤（含 Gopher 子集）→ BFF 去重（min-ngram 13）→ fastText(OH-2.5 + ELI5) 取 top-10%`。用它训 **7B/2.6T token** 得到 **Core 57.1 / MMLU 63.7 / Extended 45.4**，以 **40% 更少算力**超 MAP-Neo（+6.6 pp MMLU），以 **6.6× 更少算力**追平 Llama 3 8B 的 53-任务平均。

核心方法论资产是**一个可运行的"数据→模型→评估"反馈环**：`exp_data/` 里 416 条 uuid-key 实验记录（原始源→未分词→分词→模型→评估），以及"小尺度排名会传递到 7B"的实测结论（Pearson r = 0.838 / 0.956 / 0.982）。**但要注意：它是基准基础设施，不是生产数据平台**——两者的边界见第十四节。

---

## 三、要解决的问题

1. **缺少受控比较**：数据科研的最大痛点是"结果好到底归因给数据还是别的因素"；现有工作常常数据配方、架构、学习率、算力混在一起变。〔论文 §1〕
2. **闭源模型的训练集不可得**：Llama/Mistral/Gemma 的训练集不公开、文档只有"粗粒度描述"。〔论文 §1〕
3. **缺一个"模型固定、只变数据"的 LLM 预训练基准**：此前 DataComp/DataPerf 把这种设计用在视觉/图文/语音；DCLM 把它搬到 LLM 预训练。〔论文 §2〕

---

## 四、为什么重要

预训练数据是 LLM 最大的、也最不透明的成本项之一。DCLM 的可迁移贡献有三：(1) **固定协议消融**使"数据策略"成为可测量的自变量；(2) **小尺度→大尺度的排名传递被实测**（r≈0.84–0.98），让便宜的小模型迭代可信；(3) 大量**反直觉发现**（PageRank 无用、人类标注是坏代理、混入外部数据会伤害强 CC-only 集合、评测框架能抹平 10 分差距）直接改变数据工程决策。对架构师，它同时是一份"**评估器设计**"的高质量教学案例——要先固定并版本化评估，数据优化才有意义。

---

## 五、核心思想

1. **固定数据之外的一切**：模型架构、token 预算（20×N×Chinchilla 乘子）、训练超参、评估套件全部冻结；数据是唯一自由变量。〔论文 §3.4〕
2. **数据即配方**：参与者提交的是"如何从 pool 得到训练子集"的**可复现配方**（过滤/混源），不是模型。〔论文 §3.3/App. C〕
3. **评估化简为 3 个标量**：MMLU 5-shot、Core（22 任务中心化）、Extended（53 任务中心化），中心化使 0=随机、1=满分。〔论文 §3.5〕
4. **实证排名传递**：400M/1B/3B 尺度的配方排名会传递到 7B（r 0.838/0.956/0.982）——便宜迭代被证明可信。〔论文 Fig. 3〕
5. **学习型筛选是最大杠杆**：fastText（OH-2.5+ELI5）筛出 top-10% 胜过 PageRank、嵌入分类器、LLM-as-judge、SemDedup、困惑度剪枝。〔论文 Table 4–5〕
6. **冻结启发式阶段与可插拔学习阶段的分离**：DCLM-RefinedWeb（"参考语料"）= DCLM-Pool 施加除那个 fastText 分类器外的全部步骤，作为分类器的"**drop-in 替代基座**"——把"模型滤波"这一决策隔离出来。〔仓库 README〕

---

## 六、系统架构 / 数据生命周期

### 6.1 五步工作流（〔仓库 README "Workflow Overview"〕）
1. **原始源选择** → 生成 *reference JSON*（"ID 卡"，含 uuid）落 `exp_data/datasets/raw_sources/`；
2. **数据处理** → Ray 入口 `ray_processing/process.py` + YAML 管线（`baselines/baselines_configs/*.yaml`），产出未分词数据；
3. **分词 + 全局洗牌** → Rust `rust_processing/tokshuf-rs`（或 Ray `tokenize_shuffle.py`），产出 webdataset 分片 + `manifest.jsonl`；
4. **训练** → `torchrun -m training.train --scale <scale> --data-config <tokenized_json>`（**OpenLM** + FSDP）；
5. **评估** → YAML 任务集（`eval/{light,mmlu_and_lowvar,medium,heavy,...}.yaml`）+ `eval/aggregated_metrics.py`。

### 6.2 血缘账本（最值得抄的部分）
- `exp_data/` 四类对象：`datasets/{raw_sources,untokenized,tokenized}`、`models`、`evals`、`evaluations`，每个对象一个 uuid，训练消费"分词数据集 JSON"、评估消费"模型 uuid"；模型 JSON 内含指向其训练数据的指针。**血缘 = 数据，不是文档。**〔仓库〕
- 提交 = PR 增加生成的 `exp_data/evals/*.json`。〔论文 App. D〕
- 416 次实验全量可查：`assets/DCLM_model_database.csv`（逐任务/逐类分数 + 逐任务困惑度）。〔仓库〕

---

## 七、主要抽象与数据模型

| 抽象 | 定义 | 备注 |
|---|---|---|
| **DCLM-Pool** | 2013–2022 全部 CC（5.1M WARC dump），resiliparse 抽取，240T token / 200B 文档 / 370 TB gzip | 附带字段含 WARC 元数据 + `text/url/warcinfo` + 预去重 n-gram 计数 + fastText 分 |
| **竞争规模（scale）** | 400M-1x / 1B-1x / 3B-1x / 7B-1x / 7B-2x | token = 20×N×乘子；1x ≈ Chinchilla-optimal |
| **配方（recipe）** | 数据管线（过滤 + 混源 + 权重） | 必须文档化来源/权重/token 比 |
| **reference JSON** | 每数据/模型/评估对象的 uuid ID 卡 | 血缘节点 |
| **DCLM-RefinedWeb** | 启发式过滤+去重后的"参考语料" | 隔离模型滤波决策的基座 |

- **赛道只有两个：filter 与 mixing，没有 dedup track**（去重是 filtering 路径里的默认环节）。〔论文 §3.3〕
- **硬性约束**（〔论文 App. C〕）：tokenize/shuffle 必须用官方脚本；**不得改训练/评估代码**；评估数据仅限用于去污染、禁止进入训练；外部数据需自由可用、无评估数据。
- **固定管线构件**（DCLM-Baseline 配方，非强制）：resiliparse → RefinedWeb 启发式 → **BFF 去重** → fastText top-10%。〔论文 §4；仓库 `baselines/baselines_configs/`〕

---

## 八、处理与执行模型

### 8.1 参考文献/处理细节（DCLM-Baseline，〔仓库 `baselines/baselines_configs/dclm_baseline_refinedweb.yaml`〕）
- URL 黑名单（人工 + 逆向工程 strict/hard/soft 三级）、去换行、fastText 整页语言识别（keep `en` @0.65）、`page_length 50–100,000 词`、`word_length 3–10`、`symbol_ratio ≤0.1`、`bullet_start ≤0.9`、`ellipsis_end ≤0.3`、`alphabetic_word_ratio ≤0.2`、停用词 ≥2 unique、Gopher 重复规则、大小写/数字/行修饰、`word_removal_ratio_filter ≤0.05`。
- BFF 去重调用：`--fp-rate 0.01 --min-ngram-size 13 --max-ngram-size 13 --filtering-threshold 0.8 --remove-type old-both --annotate`。〔仓库 `dedup/bff/README.md`〕；BFF 与 MinHash+suffix array 在 7B-2x **只差 0.2 Core pp**，但 BFF"10TB 以上扩展更容易"〔论文 §4.3〕。
- fastText 分类器：OH-2.5 + ELI5 top-10%，uni+bigram 特征。〔论文 Table 5/14〕

### 8.2 分布式/工具链边界（〔仓库〕）
- **Ray mapper 引擎**：`baselines/core/processor.py`（工厂/装饰器 + 声明式 YAML 管线 + `_aggregate` 钩子）——是一套可复用的分布式逐文档变换框架。
- **Rust 工具**（不可并入 Ray YAML）：`dedup/bff`（Bloom 近重复，文档+段落粒度，`--annotate` 审计输出）与 `rust_processing/tokshuf-rs`（单机 tokenize+全局 shuffle → webdataset+manifest）。
- 关键工程取舍被明说：S3 拷贝到本地（"S3 访问偶尔不可靠"）、用完销毁 EC2 集群、**sharding 是通用扩展杠杆**（但有显式 token 产出代价）。〔仓库 README〕

---

## 九、可扩展性与性能结果（核对过的数字）

### 竞争规模（〔论文 Table 1；token = 20×N×乘子〕）
| Scale | 参数 | Token | FLOPs | H100 小时 | Pool |
|---|---|---|---|---|---|
| 400M-1x | 412M | 8.2B | 2.0e19 | 26 | 469B |
| 1B-1x | 1.4B | 28.8B | 2.4e20 | 240 | 1.64T |
| 3B-1x | 2.8B | 55.9B | 9.4e20 | 740 | 3.18T |
| 7B-1x | 6.9B | 138B | 5.7e21 | 3,700 | 7.85T |
| 7B-2x | 6.9B | 276B | 1.1e22 | 7,300 | 15.7T |

- 7B 架构：32 层 / 32 头 / d_model 4096 / d_head 128；seq 2048；vocab 50k（50432）；qk-LayerNorm、SwiGLU、深度缩放初始化、z-loss。〔论文 Table 10/App. F〕
- 总算力：**约 1.2M H100 小时**（其中精确追踪 859K = 411M 1.7k + 1B 140k + 3B 4.8k + 7B **713,216**）。〔论文 App. R〕
- 排名传递：Pearson r = **0.838 / 0.956 / 0.982**（400M/1B/3B → 7B-1x，10 方法）。〔论文 Fig. 3〕
- 抽取吞吐：resiliparse **4.55 MB/s/core** vs trafilatura 0.56（~8×）；两者都比 WET 产出 ≥2× 更短文档。〔论文 App. K〕

### 头号结果（〔论文 Table 8，arXiv 口径〕）
- **DCLM-Baseline 7B/2.6T = Core 57.1 / MMLU 63.7 / Extended 45.4**；数据集 = 3.8T DCLM-Baseline + StarCoder + ProofPile2（共 4.1T），训练 2.5T + 100B 长上下文。
- 对照：MAP-Neo 7B/4.5T = 50.2/57.1/40.4；Llama2 7B/2T = 49.2/45.8/34.1；Mistral-0.3（57.0/62.7/45.1）；Llama3 8B/15T（57.6/66.2/46.3）。
- 相对声明（**精确措辞**）：vs MAP-Neo **+6.6 pp MMLU、40% 更少算力**（arXiv；NeurIPS camera-ready 是 +6 pp、一半算力）；vs **Llama 3 8B "6.6× 更少算力下 53-任务平均相当"**；vs Llama 2 7B "+5 pp MMLU、7× 更少算力"。**没有任何 "~80% cut vs MAP-OMNI"；"MAP-OMNI" 不出现在文中。**〔论文〕

---

## 十、实验与评估方法

### 10.1 评估套件（〔论文 §3.5；仓库 `eval/eval_meta_data.csv` 计数 53 行〕）
- 基于 **LLM-Foundry**（不是 lm-eval-harness）；**53 个下游任务**；三指标：MMLU 5-shot、**Core**（22 任务中心化）、**Extended**（53 任务中心化）。
- 六类（无 "code" 类）：symbolic problem solving 15 / world knowledge 10 / language understanding 8 / commonsense 8 / reading comprehension 8 / safety 4。
- ⚠️ **指标版本**：2025-09 起中心化基线 bug 修复（issue #114/PR #115），论文数字是 `Core_v1/Extended_v1`，仓库默认 `v2`（略下调）。聚引用需标 v1/v2。〔仓库 README〕

### 10.2 主要实证发现（〔论文 Table 2–7, 12–15〕）
- **现有数据集基线**（7B-1x Core）：C4 34.2 / Dolma-V1 35.0 / RedPajama 35.3 / **RefinedWeb 36.9（最优）** → 采纳其启发式过滤。
- **文本抽取**（1B-1x Core）：resiliparse 24.1 / trafilatura 24.5 / WET 20.7 → 选库 ≈ +3.4 Core pp 之差。
- **模型滤波是最大杠杆**（1B-1x）：fastText OH-2.5+ELI5 **30.2** > perplexity 29.0 > top-k logits 29.2 > AskLLM 28.6 > RefinedWeb 复现 27.5 > SemDedup/BGE ≈27 > **PageRank 26.1（最差）**。
- **PageRank 完全无用**：每个分位都 ≤ 随机采样。〔论文 Table 15〕
- **去重**：BFF ≈ MinHash+suffix array（±0.2 Core pp）；`min-ngram=5` Core 尚可但 MMLU 塌到 32.5——**一个头号指标会掩盖另一项退化**。〔论文 Table 19〕
- **混源伤强 CC-only**：给 DCLM-Baseline 混入 33% 外部数据反而 **−1.2 Core pp**（C4/+RPJ/RefinedWeb 混入则略升）。〔论文 Table 6〕
- **去污染不解释增益**：去重 MMLU 51.8→52.7、HellaSwag 77.9→78.4，提升不改。〔论文 Table 7〕
- **人类标注是坏代理**：16 标注员 / 499 文档 / 71% 一致；面向人判别的 ROC-AUC ~82% 的 AskLLM 反而只给 ~28.5% Core。**参考集比算法更关键。**〔论文 App. N〕
- **评测框架能改结论**：LightEval vs LLM-Foundry 可让 DCLM 相对 FineWeb-Edu 的 10 分领先变近持平。〔论文 App. G Fig. 5〕

---

## 十一、开源实现（仓库走查要点）

- **仓库**：`mlfoundations/dclm`（MIT）；Py 3.10；`pip install -r requirements.txt` + `setup.py`；`requirements.txt` 锁 `llm-foundry==0.9.0` + OpenLM（GitHub）。
- **目录**：`baselines/{core,mappers/filters,mappers/enrichers,mappers/banlists,baselines_configs,aggregators,process_single_file,train_fasttext_classifier}`、`training/{train,hyperparameters,params,dataset_reference,model_reference}.py + configs/ + open_lm_configs/`、`eval/*`、`dedup/bff`（Rust）、`ray_processing/process.py`、`rust_processing/tokshuf-rs`、`data/competition_pools/*`、`exp_data/{datasets,evals,models}`、`tools/`、`assets/DCLM_model_database.csv`。
- **关键文件**：`baselines/baselines_configs/dclm_baseline_refinedweb.yaml`（完整启发式）、`fasttext_filter.yaml`、`baselines/core/processor.py`（Ray mapper 引擎）、`training/train.py`（OpenLM 训练入口）、`eval/aggregated_metrics.py` + `eval/additional_aggregation.json`（Core-22 定义）、`eval/eval_meta_data.csv`（53 任务）。
- **发布资产**：`mlfoundations/dclm-baseline-1.0`（zstd jsonl，611k 下载；paper 说 3.8T token，HF 卡说 "4T token / 3B 文档"——**又一内部矛盾**）、pool/reference pool 在 CC S3（`s3://commoncrawl/contrib/datacomp/...`）、checkpoints `apple/DCLM-7B`（2.5T）、`TRI-ML/DCLM-1B`、416 行实验 CSV、人类标注 `data/{agreement,majority}_data.jsonl`、去污染工具（基于 Lee et al. 2022）。

> ⚠️ **"evaluation data on S3"不成立**：评估数据来自 LLM-Foundry（`eval/download_eval_data.sh` 克隆 mosaicml/llm-foundry）；S3 只托管 pool/数据集。〔解读/仓库〕

---

## 十二、优势

1. **规模空前的受控数据消融**：240T pool、416 次 logged 实验、5 个尺度、逐任务公开发表。〔论文 §1/App. D〕
2. **固定协议 + 实测排名传递**：r = 0.838/0.956/0.982 让"小模型便宜迭代"落到纸面。〔论文 Fig. 3〕
3. **近乎完整资产发布**：代码、pool、参考语料、DCLM-Baseline（带预去重 n-gram 计数与 fastText 分列）、1B/7B/7B-8k + IT 权重、416 行 CSV、人类标注、去污染工具。〔论文/仓库〕
4. **故意留存反直觉负结果**（PageRank 失败、SemDedup-with-BGE 失败、混源伤强集、WET 抽取 −3.4 Core pp、评测框架敏感）——这对后来者比"我们赢了"更有价值。〔论文〕
5. **诚实的工程取舍**：Bloom vs MinHash 超过 10TB 的取舍、sharding ↔ token 产出的权衡、S3 可靠性成本等全部写出来。〔论文 §4.3/仓库〕

---

## 十三、局限与未解决问题

〔论文自述 §6〕
1. 只能**单维消融**，无法联合；未超过 7B；"未能充分探索 run-to-run 波动"；未探索分片去重替代与不同训练滤波器；**只用一种 tokenizer**（GPT-NeoX）。
2. "代码与数学目前不是强项"；英文中心；PII/敏感内容**有意不处理**（为保代表性）。

〔解读——需保留的批判〕
3. **评测框架敏感**：Core/Extended/MMLU 与社区 lm-eval 数不可互换；换 LightEval 能抹平 10 分领先。
4. **头号指标版本依赖**：2025-09 中心化基线 bug 前是 `v1`（即论文数字），后是 `v2`（略降）——一个"静默版本变化"改变了可复现性。
5. **内部矛盾不少**：240T vs "over 300T"、370TB vs 340TB、3.8T vs "4T/3B 文档"、400M-1x pool 469B vs 137B、arXiv vs NeurIPS 摘要。
6. **leaderboard 实质空置**：`filter_*.tsv` 只有 6 行、全部日期 06-19-2024、仅 baseline/外部数据集、无社区提交；`mixing_*.tsv` 404。**"榜首配方 beat baseline 多少"从公开工件不可答。**
7. **去污染靠自查 + 事后抽查**，不是预清洁 pool。

---

## 十四、对企业级 LLM/多模态数据湖的启示〔解读〕

### 14.1 数据-模型-评估反馈环（这是 DCLM 的立论资产）
1. **先固定并版本化评估器，再优化数据**——否则"数据变好"无法被稳定度量。DCLM 的中心化 bug 是反例、`--version v1|v2` 是解药。
2. **用小规模排名传递来降低迭代成本**——但要**实测** r，而不是假设。
3. **参考集（reference set）比算法更值钱**：fastText + OH-2.5/ELI5 的高 ROI 来自参考集，不是分类器本身。
4. **别用人类标注或链接流行度当质量代理**（ROC-AUC 82% 的 AskLLM 产出更差数据）。
5. **去重要可审计 + 记录删了什么**（`--annotate`、预去重 n-gram 计数、可配窗口）；且 `min-ngram=5` 这种"Core 尚可、MMLU 塌陷"说明**单一头号指标会掩盖回归**。
6. **血缘 = 数据**：`exp_data/` 的 uuid-key JSON 账本是最小可行的数据目录契约。

### 14.2 基准基础设施 vs 可复用生产基础设施（〔解读〕）
- **基准专用（难直接复用）**：`exp_data/` 参考 JSON 账本 + uuid 约定、leaderboard 插件（`tools/eval_expdb.py`/`eval/submit.py`/TSV）、固定 `--scale` 超参注册表、固定 53 任务 YAML + 中心化基线（编码了"这套评分口径"且**已经被证明有 bug**）、Core/Extended/MMLU 三个化简量、model-soup + cooldown + 长上下文阶段。
- **真正可复用**：Ray mapper 引擎（`baselines/core/processor.py` + 工厂/装饰器 + 声明式 YAML 管线）、Rust `dedup/bff` 与 `tokshuf-rs`、enricher 集（fastText LID/质量分）、逆向工程过滤配置 + 黑名单、reference-JSON 血缘模式、发布自动化（`push_openlm_model_to_hf.py` 等）。

---

## 十五、与其他两个主题的对比（本主题视角的短版）

| 维度 | DataComp-LM | Data-Juicer | Dolma |
|---|---|---|---|
| 定位 | 数据-模型-评估**基准环** | 通用**算子库 + 执行引擎** | 开源**语料产物 + 可复现工具链** |
| 核心抽象 | 配方 vs 固定训练/评估 | 可组合 Operator + YAML 配方 | (source,id) 文档 + 独立 attributes |
| 数据池 | CC 2013–2022，240T | 任意来源（HF/ModelScope/local） | 六来源 3.06T |
| 去重 | BFF（Bloom，min-ngram 13） | 精确 + MinHash + SimHash | 精确键 + Bloom（三级） |
| 信号 | 启发式 + fastText 分数列 | `stats` 列（默认一次性） | 独立属性文件，span 连续分数 |
| 评估反馈 | **最强**（53 任务、416 logged 实验） | 论文 1 有（HELM/GPT-4） | OLMo/消融（1.2B/150B） |
| 版本/血缘 | 中（uuid 账本，Git 跟踪） | 弱 | **强**（v1.5→v1.7 重派生） |
| 多模态 | 无（文本） | 图像/视频/音频 | 无（文本） |

一句话（〔解读〕）：**DataComp-LM 赢在"受控评估反馈 + 实验账本"**；它给我们的是"**证明一件事的协议**"，而 Dolma 给我们"**可复现的产物与版本**"，Data-Juicer 给我们"**可组合的算子与执行**"。完整 16 维横评见 my-wiki 的 [[LLM 训练数据平台三系统对比（Data-Juicer / Dolma / DataComp-LM）]]。

---

## 十六、建议重点研读的组件与源文件（〔仓库〕）

- **配方管线**：`baselines/baselines_configs/dclm_baseline_refinedweb.yaml`、`fasttext_filter.yaml`、`baselines/README.md`。
- **Ray mapper 引擎**：`baselines/core/processor.py`、`factories.py`、`factory_utils.py`、`baselines/mappers/{filters,enrichers,modifiers,splitters}/`。
- **训练**：`training/train.py`、`training/hyperparameters.py`（scale 注册表）、`training/configs/7b_2x_fast_2e-3_lr_5e-6_zloss.json`、`training/open_lm_configs/open_lm_7b_swiglutorch.json`。
- **评估**：`eval/aggregated_metrics.py`（v1/v2）、`eval/additional_aggregation.json`（Core-22）、`eval/eval_meta_data.csv`（53 任务）、`eval/openlm_ckpt.py`。
- **去重/分词**：`dedup/bff/README.md` + `dedup/bff/src/main.rs`、`rust_processing/tokshuf-rs/src/main.rs`。
- **血缘/实验账本**：`exp_data/` 结构、`tools/eval_expdb.py`、`assets/DCLM_model_database.csv`。

---

## 十七、参考文献

1. DataComp-LM（arXiv；NeurIPS 2024 D&B）：https://arxiv.org/abs/2406.11794 · https://proceedings.neurips.cc/paper_files/paper/2024/hash/19e4ea30dded58259665db375885e412-Abstract-Datasets_and_Benchmarks_Track.html
2. 代码仓库：https://github.com/mlfoundations/dclm
3. 项目页/leaderboard：https://datacomp.ai/dclm/
4. DCLM-Baseline 数据集（HF）：https://huggingface.co/datasets/mlfoundations/dclm-baseline-1.0
5. Checkpoints：https://huggingface.co/apple/DCLM-7B · https://huggingface.co/TRI-ML/DCLM-1B
---

# DataComp-LM: In Search of the Next Generation of Training Sets (bilingual summary — English)

> Annotation legend: (paper) = from the paper; (repo) = from `mlfoundations/dclm` (GitHub Trees API, 596 entries); (interpretation) = this author's judgment. Version is pinned to arXiv `2406.11794` unless noted.

## 1. Title and bibliographic information

- **Title**: DataComp-LM: In search of the next generation of training sets for language models
- **Authors**: Jeffrey Li\*, Alex Fang\*, Georgios Smyrnis\*, Maor Ivgi\*, … Vaishaal Shankar (55 bylines; \* joint first authors) (paper)
- **Venue**: **NeurIPS 2024, Datasets and Benchmarks Track**, DOI `10.52202/079017-0455`; arXiv `2406.11794`
- **Code (MIT)**: https://github.com/mlfoundations/dclm · **Project**: https://datacomp.ai/dclm/
- ⚠️ **Pin the version**: NeurIPS camera-ready abstract = "63% / 2T / 6 pp / half compute"; arXiv = "64% / 2.6T / 6.6 pp / 40% less compute".

## 2. Executive summary

DataComp-LM turns **data selection** into a controlled benchmark: given a **DCLM-Pool (240T GPT-NeoX tokens, 200B docs, all Common Crawl 2013–2022)**, participants submit **dataset recipes** scored under a **fixed OpenLM training protocol + fixed 53-task evaluation suite** — data is the only free variable. It answers: "is set A better than set B because of the data, or the architecture/lr/compute?"

**DCLM-Baseline** (the authors' own best recipe) = `resiliparse extraction → RefinedWeb heuristics (incl. Gopher subset) → BFF dedup (min-ngram 13) → fastText(OH-2.5 + ELI5) top-10%`. It trains **7B/2.6T → Core 57.1 / MMLU 63.7 / Extended 45.4**, beating MAP-Neo by **+6.6 pp MMLU at 40% less compute** and matching Llama 3 8B at **6.6× less compute**. The methodological asset is a running **data→model→evaluation loop** with a 416-run uuid-keyed ledger, plus **measured rank transfer** (r = 0.838/0.956/0.982) justifying cheap small-model iteration. It is **benchmark infrastructure, not a production data platform** (boundary in §14).

## 3. Problem being solved

1. **No controlled comparisons** — results confound dataset with architecture, learning rate, compute. (paper §1)
2. **Closed training sets** — Llama/Mistral/Gemma data is undisclosed, documented only coarsely. (paper §1)
3. **No "fix model, vary data" LLM benchmark** — DataComp/DataPerf did this for vision/vision-language/speech; DCLM ports it to LLM pretraining. (paper §2)

## 4. Why it matters

Pretraining data is the largest, least-transparent cost of an LLM. DCLM's transferable contributions: (1) fixed-protocol ablation makes "data strategy" a measurable independent variable; (2) **measured** rank transfer makes cheap small-model iteration trustworthy; (3) a trove of counter-intuitive findings (PageRank useless, human judgment is a bad proxy, mixing hurts a strong CC-only set, eval framework changes conclusions) directly changes data-engineering decisions. It is equally a masterclass in **evaluator design** — fix and version the evaluation before optimizing data.

## 5. Core ideas

1. **Freeze everything except data** — architecture (OpenLM), token budget (20×N×Chinchilla), hyperparameters, evaluation suite. (paper §3.4)
2. **Data as recipe** — submissions are reproducible pipelines (filter/mix), not models. (paper §3.3/App. C)
3. **Evaluation reduced to three scalars** — MMLU 5-shot, Core-22 centered, Extended-53 centered (0=random, 1=perfect). (paper §3.5)
4. **Empirical rank transfer** — r = 0.838/0.956/0.982 (400M/1B/3B → 7B-1x). (paper Fig. 3)
5. **Learned filtering is the leverage** — fastText (OH-2.5+ELI5) top-10% beats PageRank, embedding classifiers, LLM-judge, SemDedup, perplexity pruning. (paper Table 4–5)
6. **Frozen heuristic stage vs pluggable learned stage** — DCLM-RefinedWeb = everything-but-fastText, isolating the model-filter decision. (repo README)

## 6. System architecture / data lifecycle

Five-step workflow (repo README):
1. **Raw source selection** → reference JSON (uuid "ID card") in `exp_data/datasets/raw_sources/`;
2. **Processing** → Ray entrypoint `ray_processing/process.py` + YAML pipelines (`baselines/baselines_configs/*.yaml`) → untokenized data;
3. **Tokenize + global shuffle** → Rust `rust_processing/tokshuf-rs` (or Ray `tokenize_shuffle.py`) → webdataset + `manifest.jsonl`;
4. **Train** → `torchrun -m training.train --scale <scale> --data-config <tokenized_json>` (OpenLM + FSDP);
5. **Evaluate** → YAML task sets (`eval/{light,mmlu_and_lowvar,medium,heavy,...}.yaml`) + `eval/aggregated_metrics.py`.

**Lineage ledger**: `exp_data/` objects (datasets/{raw_sources,untokenized,tokenized}, models, evals, evaluations) each carry a uuid; a model JSON points to its training dataset. Lineage = data, not prose. Submission = a PR adding the `exp_data/evals/*.json`. All 416 runs are in `assets/DCLM_model_database.csv`. (repo / paper App. D)

## 7. Main abstractions and data model

| Abstraction | Definition | Note |
|---|---|---|
| DCLM-Pool | 2013–2022 all CC, resiliparse, 240T / 200B docs / 370 TB gzip | 5.1M WARC dumps |
| Scale | 400M-1x / 1B-1x / 3B-1x / 7B-1x / 7B-2x | token = 20×N×multiplier |
| Recipe | data pipeline (filter + mix weights) | documented + reproducible |
| Reference JSON | uuid ID card per data/model/eval object | lineage node |
| DCLM-RefinedWeb | heuristics+dedup without fastText | isolates model-filter decision |

Two tracks only: **filter** and **mixing** (no dedup track — dedup is a stage inside filtering). Hard rules: tokenize/shuffle must use official scripts; training/eval code must not change; eval data is only for decontamination; external data must be freely available. (paper §3.3/App. C)

## 8. Processing and execution model

DCLM-Baseline pipeline (repo `baselines/baselines_configs/dclm_baseline_refinedweb.yaml`): URL banlists → newline removal → fastText whole-page language ID (keep `en` @0.65) → page_length 50–100,000 words → word_length 3–10 → symbol_ratio ≤0.1 → bullet_start ≤0.9 → ellipsis_end ≤0.3 → alphabetic_word_ratio ≤0.2 → ≥2 unique stopwords → Gopher repetition → word_removal_ratio ≤0.05. BFF dedup: `--fp-rate 0.01 --min-ngram-size 13 --max-ngram-size 13 --filtering-threshold 0.8 --remove-type old-both --annotate`. fastText classifier: OH-2.5 + ELI5, top-10%, uni+bigrams.

Tooling boundary: **Ray mapper engine** (`baselines/core/processor.py` + factory/decorator + declarative YAML) is reusable distributed per-document transform; **Rust tools** (`dedup/bff`, `rust_processing/tokshuf-rs`) are NOT integrable into the Ray YAML. Honest engineering notes: S3→local copy (S3 "sometimes unreliable"), tear down EC2 clusters, sharding as the universal lever (with token-yield cost). (repo README)

## 9. Scalability and performance (verified)

Scales (Table 1): 400M-1x 412M/8.2B/26 h; 1B-1x 1.4B/28.8B/240 h; 3B-1x 2.8B/55.9B/740 h; 7B-1x 6.9B/138B/3,700 h; 7B-2x 6.9B/276B/7,300 h. 7B arch: 32L/32H/4096/128, seq 2048, vocab 50k. Total compute ~1.2M H100 hours (859K tracked: 411M 1.7k + 1B 140k + 3B 4.8k + 7B 713,216). Rank transfer r = 0.838/0.956/0.982. Extraction: resiliparse 4.55 MB/s/core vs trafilatura 0.56 (~8×). Headline DCLM-Baseline 7B/2.6T = Core 57.1 / MMLU 63.7 / Extended 45.4.

## 10. Experiments and evaluation methodology

Evaluation: **53 tasks** (LLM-Foundry, not lm-eval-harness) reduced to MMLU 5-shot + Core-22 + Extended-53 (centered). Categories: symbolic 15 / world knowledge 10 / language 8 / commonsense 8 / reading 8 / safety 4 (no code). ⚠️ metric versioning: pre-Sept-2025 = `v1` (paper); repo default `v2` (centering-bug fix, issue #114/PR #115).

Findings (Tables 2–7, 12–15): existing-data baselines (RefinedWeb 36.9 best) → adopt its heuristics; extraction choice ≈ +3.4 Core pp (resiliparse); model-based filter is the key lever (fastText 30.2 best, PageRank 26.1 worst); BFF ≈ MinHash+SA (±0.2 pp); `min-ngram=5` keeps Core but collapses MMLU to 32.5; mixing external data into a strong CC-only set hurts (−1.2 Core pp); decontamination does not explain gains; human judgment (ROC-AUC 82% AskLLM) yields worse data; eval framework (LightEval vs LLM-Foundry) changes conclusions.

## 11. Open-source implementation (repo walkthrough)

Layout: `baselines/{core,mappers/filters,mappers/enrichers,baselines_configs,...}`, `training/{train,hyperparameters}.py + configs/`, `eval/*`, `dedup/bff` (Rust), `ray_processing/process.py`, `rust_processing/tokshuf-rs`, `data/competition_pools/`, `exp_data/`, `tools/`, `assets/DCLM_model_database.csv`. Key files: `baselines/baselines_configs/dclm_baseline_refinedweb.yaml`, `fasttext_filter.yaml`, `baselines/core/processor.py`, `training/train.py`, `eval/aggregated_metrics.py` + `eval/additional_aggregation.json` (Core-22), `eval/eval_meta_data.csv` (53 tasks). Assets: `mlfoundations/dclm-baseline-1.0` (3.8T), `apple/DCLM-7B` (2.5T), `TRI-ML/DCLM-1B`, 416-row CSV, human annotations, decontamination tooling (Lee et al. 2022).

## 12. Strengths

1. Controlled data ablation at unprecedented scale (240T pool, 416 logged runs, 5 scales, per-task published results).
2. Measured rank transfer (r = 0.838/0.956/0.982) underpins cheap iteration.
3. Near-complete artifact release (code, pool, reference pool, dataset + score columns, 1B/7B/7B-8k/+IT weights, CSV, annotations, decon tooling).
4. Deliberately kept negative results (PageRank, SemDedup-with-BGE, AskLLM, WET extraction, eval-framework sensitivity).
5. Reference-set insight: the reference set (OH-2.5/ELI5), not the classifier algorithm, is the asset.
6. Experiment ledger as a minimal data-catalog contract.

## 13. Limitations and unresolved questions

Paper's own (§6): single-dimension ablations only; nothing beyond 7B; run-to-run variance under-explored; one tokenizer; weak code/math; English-centric; PII deliberately untreated. (interpretation) Eval-framework sensitivity (LightEval vs LLM-Foundry) makes numbers non-portable to lm-eval-harness; metric v1/v2 silent-version issue; internal conflicts (240T vs "over 300T", 370 vs 340 TB, 3.8T vs "4T/3B docs", arXiv vs NeurIPS abstracts); leaderboard effectively empty (baseline rows only, 06-19-2024). Do not cite "60%→70%/68.22%" (not in sources), "MAP-OMNI" (does not exist), "~80% compute cut" (actually 40% vs MAP-Neo / 6.6× vs Llama 3), or a separate "dedup track".

## 14. Lessons for an enterprise LLM / multimodal data lake

Feedback loop principles: (1) fix and version the evaluator before tuning data; (2) measure rank transfer, don't assume it; (3) the reference set is the high-ROI asset; (4) don't use human labels or link popularity as quality proxies; (5) deduplicate with audit and record what was removed — one headline metric can hide a regression; (6) lineage as data (uuid ledger). Benchmark-vs-production boundary: keep the Ray mapper engine, Rust BFF/tokshuf, enrichers, reverse-engineered filters + banlists, reference-JSON lineage, and publish automation; drop the fixed `--scale` registry, centered rubric, and leaderboard plumbing as benchmark-specific.

## 15. Comparison with the other two topics

| Dimension | DataComp-LM | Data-Juicer | Dolma |
|---|---|---|---|
| Positioning | data–model–eval benchmark | operator library + engine | corpus + reproducible toolkit |
| Abstraction | recipe vs fixed train/eval | Operator + YAML recipe | (source,id) doc + attributes |
| Pool | CC 2013–2022, 240T | any source | six sources, 3.06T |
| Dedup | BFF (Bloom, min-ngram 13) | MD5+MinHash+SimHash | exact-key Bloom (3 stages) |
| Eval feedback | **strongest** (53 tasks, 416 runs) | paper 1 (HELM/GPT-4) | OLMo ablations |
| Versioning | medium (uuid ledger) | weak | strong |

One line: **DataComp-LM wins controlled evaluation feedback + experiment ledger.** Full 16-dimension table in my-wiki's [[LLM 训练数据平台三系统对比（Data-Juicer / Dolma / DataComp-LM）]].

## 16. Recommended components / source files to inspect (repo)

`baselines/baselines_configs/dclm_baseline_refinedweb.yaml` + `fasttext_filter.yaml` · `baselines/core/processor.py` · `baselines/mappers/{filters,enrichers,modifiers,splitters}/` · `training/{train,hyperparameters}.py` · `training/configs/7b_2x_fast_2e-3_lr_5e-6_zloss.json` · `training/open_lm_configs/open_lm_7b_swiglutorch.json` · `eval/aggregated_metrics.py` + `eval/additional_aggregation.json` + `eval/eval_meta_data.csv` · `dedup/bff/README.md` + `src/main.rs` · `rust_processing/tokshuf-rs/src/main.rs` · `tools/eval_expdb.py` + `assets/DCLM_model_database.csv`.

## 17. References

1. DataComp-LM: https://arxiv.org/abs/2406.11794 · https://proceedings.neurips.cc/paper_files/paper/2024/hash/19e4ea30dded58259665db375885e412-Abstract-Datasets_and_Benchmarks_Track.html
2. Repo: https://github.com/mlfoundations/dclm
3. Project/leaderboard: https://datacomp.ai/dclm/
4. Dataset: https://huggingface.co/datasets/mlfoundations/dclm-baseline-1.0
5. Checkpoints: https://huggingface.co/apple/DCLM-7B · https://huggingface.co/TRI-ML/DCLM-1B
