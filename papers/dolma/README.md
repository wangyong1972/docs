# Dolma：一个三万亿 token 的开源预训练语料库（数据生命周期 + 工具链）

> 主题：**Dolma: An Open Corpus of Three Trillion Tokens for Language Model Pretraining Research**（ACL 2024 长文，最佳资源论文奖）。
> 配套文件：本目录 `deck.pptx`（英文架构评审 deck，约 13 页）与 `sources.md`（权威来源 + 量化主张核对表）。
>
> **标注约定**：〔论文〕= 论文正文/图表/附录；〔仓库〕= `allenai/dolma` 代码/配置（快照取自 GitHub Trees API，794 项，`truncated:false`）；〔解读〕= 本文作者的架构判断。

---

## 一、标题与书目信息

- **标题**：Dolma: an Open Corpus of Three Trillion Tokens for Language Model Pretraining Research
- **作者**：Luca Soldaini, Rodney Kinney, Amanpreet Singh, … Kyle Lo, et al.（35 位作者，出自 Allen Institute for AI（AI2）等；文集作 Soldaini → Lo）〔论文〕
- **发表**：**ACL 2024**，第 62 届 ACL 年会长文卷（Vol. 1: Long Papers），页 15725–15788，Anthology ID `2024.acl-long.840`，DOI `10.18653/v1/2024.acl-long.840`，**Best Resource Paper Award**〔ACL 元数据〕
- **arXiv**：`2402.00159`
- **许可**：数据 **ODC-BY 1.0**；工具链 **Apache-2.0**（`Cargo.toml` / `pyproject.toml` 均 Apache-2.0）〔仓库〕
- **主页**：`allenai.org/dolma`（⚠️ 现已被 Olmo 3 项目页接管，Dolma 专用内容最好引用 HF 数据集卡 + GitHub）〔解读/2016-09 观察〕
- **仓库**：https://github.com/allenai/dolma
- **数据**：https://huggingface.co/datasets/allenai/dolma

---

## 二、执行摘要

Dolma 是一个 **3,059B Llama token（≈3 万亿）、4,367M 文档、11.5 TB** 的英文开源预训练语料，以及把它做出来的**可复现工具链**。它的核心不是"某个巧妙的清洗算法"，而是**一条纪律**：把「**信号/属性层**」与「**语料物化层**」彻底分开——文档只存一次，属性（语言、质量、毒性、PII、去重标记）以 `{source, id, attributes}` 独立成文件、按 `[start, end, score]` 区间携带**连续分数**；"用多高的阈值、删什么"留到 `dolma mix` 阶段用 **JSONPath 过滤表达式**做。正是这个分离，让 Dolma 能从**同一份打标数据**重派生 v1.5 → v1.6 → v1.7，而不重新抓取/重标注。

去重是**精确键 + 单一 Bloom filter** 三级（URL 去重 53.2% → 文档去重 14.9% → 段落去重 18.7%），**不是 MinHash**。执行是 **Python multiprocessing + Rust rayon + S3**，无 Spark/EMR/Ray 依赖，吞吐 **122 CPU-小时/TB**。作者明确**不规定语料混合配方**，并用 1.2B/150B token 消融证明：**少量（~5%）领域内数据就足以获得良好领域拟合**——采样占比与"实际训练占比"差异巨大。Dolma 的最终目的是训 **OLMo**，形成"数据策略 ← 模型消融 ← 评测"的闭环。

---

## 三、要解决的问题

1. **开放与规模兼备**：此前良好语料（C4 175B、The Pile 387B token）要么规模小，要么像 RedPajama v2 只有 CC 且"仅轻度清洗"；闭源模型（Llama/Mistral）则不公开数据与流程。〔论文 §1〕
2. **可复现的语料生产**：把"一堆来源 → 可用预训练语料"的每一步都变成**有参数、有配置、可重放**的工序，并用消融"证伪"直觉性质量过滤。〔论文 §2–§4〕
3. **信号保留 vs 选择策略的时序问题**：如果清洗过早做"硬删除"，后续想换阈值/换策略就得重新来；Dolma 的答案是**先打标签存分数，后施加策略**。〔论文 §4.1〕

---

## 四、为什么重要

对做「企业训练数据湖」的架构师，Dolma 是**"证据与策略分离"最干净、最完整、且真正跑过 3T token 的开源样板**。它回答了三个常被忽视的问题：① 属性（信号）应该如何与文档（实体）物理分离？② 去重/过滤的"阈值"应该存在哪里、何时生效？③ 一个语料版本如何在不重撸源数据的前提下被重新派生？这三点正是把数据治理从"一团脚本"升级成"可审计工件"的关键。

---

## 五、核心思想

1. **文档与属性分离**：文档存一次；所有下游判断（语言/质量/毒性/PII/去重）写成属性文件，带 `[start,end,score]` 区间与连续分数。作者原话：不因"换了毒性分类器"而复制多份数据集，且"允许在事后用配置来构建数据集"、可以试不同置信阈值。〔仓库 `docs/data-format.md`〕
2. **先算、后判**：`dolma tag` / `dolma dedupe` 只产出**属性**；`dolma mix` 才按 JSONPath 谓词施加删除/掩码。阈值活在 YAML 配置而非代码里。〔仓库〕
3. **精确键 Bloom 去重**：800 词窗口内用 Unicode 词 n-gram（length/stride/threshold 可配）判近似重复，全程不用 MinHash；Bloom 参数 `estimated_doc_count=60,000,000,000`、`desired_false_positive_rate=1e-6`。〔仓库 `configs/dolma-v1_6/doc_dedupe/cc_en_head.yaml`〕
4. **身份稳定、可溯源**：`id` 在跨版本中保持稳定、源内唯一，用于"回溯源文档"与**维护 blocklist**（下架、评测泄漏、人工审查）。〔仓库 `docs/data-format.md`〕
5. **质量过滤刻意克制**：只用 Gopher 规则 + **一条** C4 规则，**不用模型质量分类器**（引 Rae 2021 / Almazrouei 2023 的反模型过滤论点）；质量/内容/去重过滤**重叠很小、是复合而非叠加**。〔论文 §5.2–5.3〕
6. **不规定混合配方**：把混合物当"分析对象"而非"固化产物"，采样占比 ≠ 实际训练占比（见第八节）。〔论文 App. M〕

---

## 六、系统架构 / 数据生命周期

### 6.1 生命周期（原始来源 → 最终语料）
```
原始来源（CC WARC / The Stack / Pushshift Reddit / peS2o / Gutenberg / Wiki）
   → 线性化（linearization，为每来源选文档切分）
   → 打标 dolma tag（language / gopher / c4 / jigsaw(毒性) / pii / length / random_number...）
   → 去重 dolma dedupe（Bloom：URL → 文档 → 段落；去污染复用 Bloom 机制）
   → 混合 dolma mix（JSONPath 过滤 + 上采样/下采样 → 训练/验证/测试子集）
   → 分词 dolma tokens（.npy token + .csv.gz {start,end,id,src,loc}）
   → 训练（OLMo）
```
〔论文 §4–§5；仓库 `docs/getting-started.md`〕
CLI：`dolma {dedupe, mix, tag, list, stat, tokens}`。〔仓库〕

### 6.2 文档表示与属性（关键 schema）
- 文档：`{id, text, source, added, created, metadata}`；`id/text/source` 必填；`metadata` 是"free-for-all"，用于保留源特有标识（Stack license、S2 DOI/arXiv/ACL 等）。**URL 不是顶层字段**，各源自己的 id 是：CC/C4=URL、Reddit=subreddit+thread id、S2=Corpus ID、GitHub=仓库名、Gutenberg=书名、Wiki=URL。〔仓库 `docs/data-format.md`；论文 App. N.2〕
- 属性：`{source, id, attributes: {...}}`，区间属性是 `[start, end, score]` 三元组；**属性文件必须与文档文件行数、排序完全一致**（否则 join 静默错位）。〔仓库〕
- 分词产物：`.npy`（拼接 token）+ `.csv.gz`（`start/end/id/src/loc`，loc 是 1 索引源行号）——**身份跨分词保留**；只做"路径乱序 + k/N 块内乱序"的轻量本地洗牌。〔仓库 `docs/tokenize.md`〕
- 内置 tagger 约 26 个：fastText/CLD2/CLD3 语言识别（文档/段落/段落带文档分数）、`gopher_v1`、`c4_v1/v2`、`jigsaw_{hatespeech,nsfw}_*`、`pii_{presidio,regex,regex_v2,regex_with_counts*}`、`code_*`、字符/词长、`olmo_pretokenizer_*`、`random_number_v1`（分 train/val/test）。自定义 tagger 子类化 `BaseTagger` + `@add_tagger`，经 `--tagger_modules` 载入。〔仓库 `docs/taggers.md`〕

---

## 七、主要抽象与数据模型

| 抽象 | 定义 | 备注 |
|---|---|---|
| 文档（document） | 一个 JSONL 行 = 一个文档，含 `text` | 段落 = 以 `\n` 结尾的文本段〔论文 §4.1 fn 3〕 |
| 属性（attribute） | 与文档同序、同长的独立文件 | 区间 `[start,end,score]` 支持 span 级标记 |
| 过滤器（filter） | 一次 `mix` 步骤下的 **JSONPath 谓词** | 例：`$.attributes[?(@.gopher_rules__gopher_v1__word_count[0][2] < 50)]` |
| 去重（dedupe） | Bloom filter 上的精确键命中标记 | 写入属性，**不删数据** |
| 混合（mix） | 施加过滤/替换/上采样/下采样，产出最终子集 | 上采样 = 在流列表里**重复文件路径**〔论文 §4.1〕 |
| 分词（tokens） | `.npy` + 映射表，保留 `id/src` | 身份可回溯到源行 |

「**什么是文档**」本身是被消融过的：对 Reddit，作者实测 **Atomic Content** 优于 Partial/Full Threads，但三种线性化仍全部保留在 `sources/reddit/*` 作为可运行代码。〔论文 §7.1/Fig 4〕

---

## 八、处理与执行模型

### 8.1 去重（Bloom，非 MinHash）——本主题最易被误记的点
三级（顺序有明确理由：先 URL/文档去重"大幅减少要处理的文档数"，段落去重放最后因为"删段会干扰内容分析"）〔论文 §5.4〕：
1. **URL 去重** → 去掉 **53.2%** 文档；
2. **文档去重**（精确，不删标点空格，**空文档也算重复**）→ 再去掉（URL 去重后）**14.9%**；
3. **段落去重**（精确段落）→ 去掉 **18.7%** 段落（=19.1% UTF-8 字节）。

- Bloom 参数：`estimated_doc_count: 60000000000`、`desired_false_positive_rate: 1e-06`。〔仓库配置〕
- 工具链 n-gram 参数〔仓库 `docs/deduplication.md`〕：`by_ngram.ngram_length`（Unicode UAX#29 词，**默认关闭**）、`by_ngram.threshold`（默认 **1.0**：所有 n-gram 全匹配）、`min_length/min_words`（默认 0）、`bloom_filter.size_in_bytes`（与 `estimated_doc_count`/`desired_false_positive_rate` **异或**二选一）。
- **MinHash 只出现一次且非 Dolma 实现**：来自上游 The Stack（Allal et al. 2023 的 MinHash+LSH，无参数披露）；v1.7 才新增"模糊去重"。〔论文 §6.4；HF README〕
- 上游 CCNet 还做了段落去重（SHA1、分片集 ≤20 GB，Dolma 改为固定 ≤20GB 替代原"快照 2%"）；CCNet 整体过滤掉 **84.2%**（175.1→27.7 TB）。〔论文 §5.1/N.4〕
- 去污染复用 Bloom 机制：把评测样本喂进 filter 再在 mix 命中，去掉 **0.003%**；v1.0/v1.5 对 Paloma 去污染，**v1.6 未做**。〔论文 §4.1/App. L〕

### 8.2 过滤/质量/语言/安全/PII
- **语言**：fastText 阈值 **0.5**，去除 **61.7%**（字节）；用 ICE 语料审计过（阈值 0.90 仍大都被判英文），残余 0.86% 未识别 + 0.06% 中文。〔论文 §5.1/App. G/K〕
- **质量**：Gopher All（15.23% 字符）+ C4 NoPunc（22.73% 字符），**不用模型过滤**；消融显示 **C4 NoPunc 单条胜过 C4 All 与 Gopher All**。所有阈值同时出现在 `configs/dolma-v1_5/mixing/cc-head.yaml` 的 jsonpath 排除里（论文与配置一致）。〔论文 §5.2/Fig 1〕
- **毒性**：自训两个 FastText（hate / NSFW，Jigsaw 句子级）。作者**故意采用更宽松的 τ=0.4**（删 5.5–7.3%），而 τ=0.0004 表现更好但要删 29.1–34.9%——因为过滤复合效应会威胁 token 目标量。这是全篇**最值得带走的一个决策**：规模 vs 质量的权衡被明说并写入数据卡。〔论文 §5.3〕
- **PII**：仅正则（Presidio 规模不可行）、仅 3 类高精度（email/phone/IP）；**≤5 个 span 掩码**（`|||EMAIL_ADDRESS|||` 等，占 0.02% 文档）、**≥6 个 span 整篇删除**（0.001%）；代码子集额外跑 detect-secrets；Reddit 直接整篇删。消融显示"删 PII vs 换特殊 token"影响模型性能无差异。〔论文 §5.3/App. I〕
  - ⚠️ **内部矛盾**：§N.4 写 0.05%/0.11%，与 §5.3/App. I 的 0.02%/0.001% 相差 110×。引用时用 0.02%/0.001%（两节一致且与配置 `>5` 规则吻合），把 §N.4 记为 erratum。〔解读〕
- **Reddit 安全栈**：评论 ≥500 字符、帖子 ≥400、文档 ≤40,000、评论净票 ≥3；排除 26,123 个被禁/NSFW subreddit（+ >10% NSFW 子版自动规则）；`sources/reddit/*/subreddit_blocklist.txt` 有 5 份拷贝。〔论文 §7.2；仓库〕
- **仓库有、论文没有**：AdBlock 格式的 `UrlBlocker`（`python/dolma/core/url_blocker.py` + Rust `adblock::Engine` + blocklist 下载脚本），在写作时零论文足迹。〔仓库，观察〕

### 8.3 混合构造（不规定配方）
- 作者明确"**Dolma 不规定特定来源混合**"，只分析常见策略；采样占比与实际训练占比差异极大〔论文 App. M/Table 4〕：

| 混合 | 采样目标 (Web/Code/Ref/Books) | **实际** (Web/Code/Ref/Books) |
|---|---|---|
| Naïve（每源等量） | 100/100/100/100% | **83.5 / 13.8 / 2.5 / 0.2%** |
| Reference+（PeS2o+Wiki+Wikibooks+Gutenberg **2×**） | 100/100/**200/200**% | 81.2 / 13.5 / 4.9 / 0.4% |
| Gopher-like | 17/8/**200/200**% | 68.4 / 5.4 / **24.2** / 2.0% |

- 关键发现：Reference+（4.9% 论文）与 Gopher-like（24.2% 论文）结果**几乎相同** → **少量领域内数据即足以**；"来源分布与下游能力挂钩，用户应按需采样子集"；代码占比 0/5/15% 消融显示 C4-only 模型 **bAbI 全部失败**。〔论文 App. M/Table 3–4〕
- 实测训练量：v1.7 全量 **2,308.5B**、实际训练 **1,715.1B**；v1_5-sample ≈1.9T 训出 OLMo-7B——**"3T" 与"训练了多少"是两个数，别混。**〔HF README〕

### 8.4 分布与云执行
- **Python multiprocessing + Rust rayon + S3**，**不是 Spark/EMR/Ray**（全文档/构建文件双重确认）；去重器/混合器是 Rust 经 PyO3 包裹（`deduper_entrypoint`/`mixer_entrypoint`），依赖 `pyo3 0.19`、`rayon 1.7`、`aws-sdk-s3`；路径支持本地与 S3。〔仓库 `src/lib.rs`、`python/dolma/__init__.py`〕
- 规模：工具链 **122 CPU-小时/TB**；"在 c6a.48xlarge（192 vCPU）上处理 200 TB 原始文件需 **5 天**"；`processes: 188` 是配置标准值。〔论文 §4.1；仓库配置〕

---

## 九、可扩展性与性能结果（核对过的数字）

- total **3,059B Llama token** / 4,367M 文档 / 11,519 GB / 2,318B 单词（源自 ~200 TB 原始文本，治理后 11 TB）。〔论文 Table 1〕
- 各源 token（Table 1）：CC **2,479B**（81.0%）、Code（The Stack）**411B**（13.4%）、Reddit **89B**（2.9%）、peS2o **70B**（2.3%）、Gutenberg **6.0B**、Wikipedia/Wikibooks **4.3B**。
- 版本（HF）：v1 2023-08-18（6.0 TB）、v1_5 2023-10-31（6.4 TB，≈3T，训 OLMo-1B）、v1_5-sample（2.9 TB，≈1.9T，训 OLMo-7B）、v1_6 2024-01-31（5.4 TB）、v1_7 2024-04-15（4.5 TB，OLMo-7B-v1.7）。
- 过滤概览：CCNet 滤掉 **84.2%**（175.1→27.7 TB）；语言 0.5 阈值去 **61.7%**；CCNet 段落去重约去 **70%** 段落；URL/doc/paragraph 三级 53.2%/14.9%/18.7%；Bloom 60B 文档 / 1e-6。
- 消融训练：**1.2B 参数 / 150B token**、64 AMD MI250X（→128 计算单元、16 节点）、批 1024、ctx 2048。〔论文 App. D.1〕
- OLMo-1B：**739,328 步 ≈ 3.1T token**、批 2048、256 计算单元、AdamW；8 任务平均 **60.3**（vs TinyLlama 59.4 / Pythia 54.5 / StableLM₂ 66.5），胜 4/8。〔论文 §9/Table 2/App. D.4〕

---

## 十、实验与评估方法

- **受控消融**是核心方法：固定 1.2B/150B token 训练协议，只换数据策略，看下游任务（ARC/BoolQ/HellaSwag/OpenBookQA/PIQA/SciQ/WinoGrande 等 8 个）。〔论文 §4.2〕
- **质量/内容/去重过滤重叠很小 → 复合而非叠加**；由此在 §5.3 显式做了"规模 vs 严格阈值"的权衡。〔论文 §5.3〕
- **质量过滤消融**：C4 NoPunc 单条 > C4 All / Gopher All；Gopher+C4NoPunc 组合最优。〔论文 Fig 1〕
- **语言审计**：用 ICE 语料验证 fastText 阈值；**地域方言偏差审计**：location subreddit 间差异 <5%。〔论文 App. G/Fig 7–8〕
- **代码占比 0/5/15%** 消融（C4+Stack，5 seeds）；**混合策略**四组对照。
- **"文档切分"消融**：Reddit Atomic vs Partial vs Full Threads。

---

## 十一、开源实现（仓库走查要点）

- **结构**：`python/dolma/{cli,core,taggers,warc}/`、`src/{deduper,mixer,bloom_filter,wimbd}/.rs`（Rust 核心），`configs/{c4-replication,dolma-v1_5,dolma-v1_6,dolma-v1_7,pes2o-dedup}/`，`sources/{cc_warc,starcoder,reddit/*}`，`scripts/`，`tools/`。
- **关键 Python 模块**（〔仓库〕）：
  - `python/dolma/cli/{deduper,mixer,tagger,tokenizer}.py`——四个主命令；
  - `python/dolma/core/{taggers,ft_tagger,parallel,registry,url_blocker,analyzer,binning}.py`；
  - `python/dolma/taggers/{language,gopher,c4,quality,jigsaw,pii,length,licenses,repetitions,tokenizers,url,sampling}.py`；
  - `python/dolma/warc/processor.py`——CC WARC 处理。
- **关键 Rust 模块**：`src/lib.rs`（`mod {bloom_filter, deduper, filters, io, mixer, s3_util, shard, wimbd}`）、`src/wimbd/ngrams/*`（蒸馏 WIMBD 统计）、`src/bloom_filter.rs`。
- **配置格式**：YAML/JSON（`dolma -c config.yaml <cmd>` 或 `--key value`；依赖 omegaconf/pyyaml）。过滤器是**作用于属性值的 JSONPath 谓词**，而非代码——这是 Dolma"阈值存配置"的落地形式。〔仓库配置〕
- **复现 runbook 级**：`configs/dolma-v1_5/decontamination/README.md` 含真实 CLI 序列与**实测输出**（`>>> 3681169`），据此定 Bloom 尺寸。〔仓库〕

---

## 十二、优势

1. **信号/策略分离是教科书级**：文档一次存储、属性独立承载连续分数、阈值事后用 JSONPath 施加；v1.5→v1.6→v1.7 的连续重派生是 3T-token 铁证。〔仓库/论文〕
2. **身份稳定且可回源**：`(source,id)` 复合键 + 属性行序一致约束，让 join 失败变"响亮"而非"静默"；URL/S2 Corpus ID/仓库名等外部身份保留回来，支撑下架与 PII 移除请求。〔仓库〕
3. **配置里的阈值 = 审计友好的策略治理**：改质量/毒性阈值是 YAML diff，不是改代码/重撸数据。〔仓库〕
4. **诚实的规模-质量权衡**：主动公开"采用更宽松 τ=0.4"及其代价，并承诺下一版本收紧——这是数据卡该有的样子。〔论文 §5.3〕
5. **运行手册带实测输出**：去污染 README 记录 CLI + 实测数，比任何架构图都可复现。〔仓库〕
6. **意图清晰的开源约束**：因 licensing 主动避开 Books3；ODC-BY + 数据卡 + PII 移除表单。〔论文〕

---

## 十三、局限与未解决问题

1. **仅英文，且作者直说**："Dolma 强化了'英文是 NLP 默认语言'的预期"。〔论文〕
2. **单配置消融**：所有数据策略由 **1.2B/150B** 代理模型决定，再外推到 3T 规模。〔论文〕
3. **Bloom 有假阳性**；作者对"质量/毒性"的定义本身有自知（"质量过滤本质上是……带有意识形态的选择""'毒性'没有单一普适定义"）。〔论文〕
4. **PII 率的内部矛盾**（0.02%/0.001% vs 0.05%/0.11%）；CC 快照 25 vs 24 口径不一。〔论文 erratum，解读〕
5. **[解读] 复现性在实践上是"部分"的**：Pushshift 已停止分发 dump；原始 CC 未保留；语料本身**有意比作者自己的消融偏好更少过滤**（规模 vs 安全权衡）。
6. **[解读] 形态上文本中心**：属性基于 `text` 的字符偏移，媒体没有字符偏移；精确键/Bloom 去不了重编码/重裁剪的媒体；Gopher 规则、语言 ID、PII 正则、句子级毒性分类器**都没有多模态对应物**。多模态系统在此之上要新增：感知哈希/嵌入去重、ASR 语言 ID、面部/声纹/车牌 PII、媒体解码吞吐独立核算等（见第十五节）。

---

## 十四、对企业级 LLM/多模态数据湖的启示〔解读〕

Dolma 对「record / signal / policy / recipe / version / provenance」的映射是最完整的：

| 概念 | Dolma 现状 | 判定 |
|---|---|---|
| **Record identity** | `(source, id)` 复合键，源内唯一、跨版本稳定 | **实现（最强）** |
| **Signal** | `attributes` 独立文件，`[start,end,score]` 连续分数 | **实现（典范）** |
| **Policy** | `mix` 阶段 JSONPath 过滤/替换（阈值在配置） | **实现（阈值配置化）** |
| **Recipe** | 每源 `mixing/*.yaml` + mix 配置（非"配方文件"而是声明式构建） | **部分** |
| **Dataset version** | v1/v1.5/v1.6/v1.7 + HF 数据集修订 | **实现** |
| **Provenance** | `id` 溯源 + blocklist 侧文件 + runbook | **实现** |

可落地的设计原则（〔解读〕，每条对应 Dolma 机制）：
1. **把"打标"与"构建"拆成两个幂等服务**：重版本一个数据集 = 一次 mix 重跑，而非一次重标注。
2. **用 `(source,id)` 做版本契约**，属性文件行序严格对齐，让 join 失败显式暴露。
3. **阈值永远不进代码**：进 YAML 的 JSONPath；这样阈值消融能在"已打标数据"上直接做。
4. **按"复合"而非"叠加"预算过滤**：多个过滤器重叠小，实际留存 = 各留存相乘；"保 N token"与"上策略 P"要当成一个联合可行性问题去度量。
5. **区分"全量 token"与"实际训练 token"两个数**（2,308.5B vs 1,715.1B）——混淆二者是"3T"写成假话的常见方式。
6. **把"拒绝"做成可采样的一等工件**（去重只写属性、`random_number` 切分）：能审计策略删了什么、影子语料可复现。
7. **保留可回源身份**：是下架、擦除、事故响应的前提。
8. **黑名单走旁路通道**（26,123 subreddit、AdBlock UrlBlocker），改得快、不必动语料。
9. **用"预算单位"报表**（122 CPU-h/TB）而不是架构图。
10. **运行手册带实测输出**（`>>> 3681169`）——这是全仓库最被低估的工件。

---

## 十五、与其他两个主题的对比（本主题视角的短版）

| 维度 | Dolma | Data-Juicer | DataComp-LM |
|---|---|---|---|
| 定位 | 开源**语料产物 + 可复现工具链** | 通用**算子库 + 执行引擎** | 数据-模型-评估**基准环** |
| 核心抽象 | (source,id) 文档 + 独立 attributes | 可组合 Operator + YAML 配方 | 配方 vs 固定训练/评估 |
| 去重 | 精确键 + Bloom（URL/文档/段落） | 精确 + MinHash + SimHash（多引擎） | BFF（Bloom，min-ngram 13） |
| 信号表示 | 独立属性文件，span 连续分数 | `stats` 列（默认一次性） | 启发式 + fastText 分数列 |
| 策略 | JSONPath 过滤（YAML） | 算子阈值（代码） | 固定启发式 + 可插拔模型滤波器 |
| 数据来源管理 | 67/3.06T 来源矩阵 + 21 种源 | HF/ModelScope/local | CC 池 + 外部源 |
| 多模态 | 无（文本中心） | 图像/视频/音频 | 无（文本） |
| 评估反馈 | OLMo/消融（1.2B/150B） | 论文 1 有（HELM/GPT-4） | 53 任务、416 logged 实验 |
| 版本/血缘 | **最强**（v1.5→v1.7 重派生） | 弱 | 中（uuid 账本） |

一句话（〔解读〕）：**Dolma 是"信号-策略分离 + 可复现版本"的范本**；它的局限是文本中心，而多模态所需的感知去重/媒体身份/媒体 PII 是显式缺口。完整 16 维横评见 my-wiki 的 [[LLM 训练数据平台三系统对比（Data-Juicer / Dolma / DataComp-LM）]]。

---

## 十六、建议重点研读的组件与源文件（〔仓库〕）

- **数据格式与契约**：`docs/data-format.md`、`docs/deduplication.md`、`docs/taggers.md`、`docs/tokenize.md`。
- **CLI 主命令**：`python/dolma/cli/{tagger,deduper,mixer,tokenizer}.py`。
- **tagger 实现**：`python/dolma/taggers/{language,gopher,c4,quality,jigsaw,pii,length,tokenizers,repetitions,url,sampling}.py`。
- **Rust 核心**：`src/lib.rs`、`src/deduper.rs`、`src/mixer.rs`、`src/bloom_filter.rs`、`src/wimbd/*`。
- **WARC 处理**：`python/dolma/warc/processor.py`、`python/dolma/core/parallel.py`。
- **配置样例（阈值落地处）**：`configs/dolma-v1_5/mixing/{cc-head,code,books,wiki,pes2o,reddit,stack}.yaml`、`configs/dolma-v1_6/doc_dedupe/cc_en_head.yaml`。
- **复现 runbook**：`configs/dolma-v1_5/decontamination/README.md`。
- **黑名单/URL 阻塞**：`python/dolma/core/url_blocker.py`、`sources/reddit/*/subreddit_blocklist.txt`。

---

## 十七、参考文献

1. Dolma（ACL 2024 长文）：https://aclanthology.org/2024.acl-long.840/ · https://arxiv.org/abs/2402.00159
2. 数据卡（HF）：https://huggingface.co/datasets/allenai/dolma
3. 代码仓库：https://github.com/allenai/dolma
4. 工具链 docs：https://github.com/allenai/dolma/tree/main/docs
5. OLMo 技术报告（关联）：AI2 blog / HuggingFace `allenai/OLMo-7B`
---

# Dolma: An Open Corpus of Three Trillion Tokens (bilingual summary — English)

> Annotation legend: (paper) = from the paper body/tables/appendices; (repo) = from `allenai/dolma` code/config (GitHub Trees API, 794 entries); (interpretation) = this author's architectural judgment.

## 1. Title and bibliographic information

- **Title**: Dolma: an Open Corpus of Three Trillion Tokens for Language Model Pretraining Research
- **Authors**: Luca Soldaini, Rodney Kinney, Amanpreet Singh, … Kyle Lo, et al. (35 authors, led by AI2; collection Soldaini → Lo) (paper)
- **Venue**: **ACL 2024**, Vol. 1: Long Papers, pp. 15725–15788, Anthology `2024.acl-long.840`, DOI `10.18653/v1/2024.acl-long.840`, **Best Resource Paper Award** (ACL metadata)
- **arXiv**: `2402.00159`
- **License**: data **ODC-BY 1.0**; toolkit **Apache-2.0** (repo)
- **Repo / data**: https://github.com/allenai/dolma · https://huggingface.co/datasets/allenai/dolma (`allenai.org/dolma` is now the Olmo 3 page — cite HF + GitHub)

## 2. Executive summary

Dolma is a **3,059B Llama-token (~3T), 4,367M-document, 11.5 TB** open English corpus plus the reproducible toolkit that builds it. Its centerpiece is not a clever filter but a **discipline**: split the **signal/attribute layer** from the **corpus materialization layer**. Documents are stored once; attributes (language, quality, toxicity, PII, dedup) live in detached files carrying `[start, end, score]` spans with **continuous scores**. "Which threshold to apply, what to drop" is deferred to `dolma mix` as **JSONPath predicates**. That split is why v1.5 → v1.6 → v1.7 were re-derived from the *same tagged data* rather than re-acquired/re-annotated.

Dedup is **exact-key + a single Bloom filter** in three stages (URL 53.2% → document 14.9% → paragraph 18.7%) — **not MinHash**. Execution is **Python multiprocessing + Rust rayon + S3** (no Spark/EMR/Ray), at **122 CPU-hours/TB**. The authors **decline to prescribe a mixture** and use 1.2B/150B-token ablations to show **~5% in-domain data suffices**; sampling vs realized proportions diverge hugely. Dolma's stated purpose is to train **OLMo**.

## 3. Problem being solved

1. **Scale with openness**: prior good corpora (C4 175B, The Pile 387B) were small, or CC-only and lightly curated (RedPajama v2); closed models publish no data/process. (paper §1)
2. **Reproducible corpus construction**: parameterize every stage (linearize → tag → dedup → mix → tokenize) and falsify intuition-driven quality filters with ablations. (paper §2–§4)
3. **Timing of signal vs policy**: hard-deleting early forces re-acquisition to change thresholds; Dolma tags first, stores scores, then applies policy. (paper §4.1)

## 4. Why it matters

For an enterprise training-data lake, Dolma is the **cleanest, most complete, at-3T-scale open template for evidence/policy separation**. It answers three questions most platforms get wrong: how attributes should physically separate from documents; where dedup/filter thresholds should live and when they take effect; and how a corpus version is re-derived without re-touching sources.

## 5. Core ideas

1. **Documents and attributes apart** — store docs once; keep all downstream judgments (language/quality/toxicity/PII/dedup) as attributes with `[start,end,score]` spans. Quote: don't duplicate the dataset just because a toxicity classifier changed; "building" happens afterward as configuration. (repo `docs/data-format.md`)
2. **Compute first, decide later** — `dolma tag`/`dedupe` emit attributes only; `dolma mix` applies JSONPath filters/sampling. Thresholds live in YAML, not code. (repo)
3. **Exact-key Bloom dedup** — duplicate detection over Unicode n-grams (length/stride/threshold configurable); Bloom params `60,000,000,000 docs / 1e-6 FPR`. (repo config)
4. **Stable, traceable identity** — `id` is version-stable and source-unique, used to trace the source and maintain a blocklist (takedowns, eval leakage, review). (repo)
5. **Deliberately restrained quality filtering** — Gopher rules + one C4 rule, no model-based classifier (citing Rae 2021 / Almazrouei 2023); quality/content/dedup filters overlap little → compound, not sum. (paper §5.2–5.3)
6. **No prescribed mixture** — mixture is analyzed, not frozen; sampling ≠ realized proportions. (paper App. M)

## 6. System architecture / data lifecycle

```
raw sources (CC WARC / The Stack / Pushshift Reddit / peS2o / Gutenberg / Wiki)
  → linearize (per-source document split)
  → tag (language · gopher · c4 · jigsaw toxicity · pii · length · random_number)
  → dedupe (Bloom: URL → doc → paragraph; decontamination reuses Bloom)
  → mix (JSONPath filters + up/down-sampling → train/val/test)
  → tokenize (.npy tokens + .csv.gz {start,end,id,src,loc})
  → train (OLMo)
```
CLI: `dolma {dedupe, mix, tag, list, stat, tokens}`. (paper §4–5; repo `docs/getting-started.md`)

Document format: `{id, text, source, added, created, metadata}` (`id/text/source` required; `metadata` is free-form, holding source-native ids like S2 DOI / arXiv / ACL). Per-source `id`: CC/C4 = URL, Reddit = subreddit+thread, S2 = corpus id, GitHub = repo name, Gutenberg = title, Wiki = URL. Attributes: `{source, id, attributes}` with `[start,end,score]` span triples; attribute files must match document files exactly (row count + sort order). Tokenization preserves identity via `id/src/loc`. (repo)

## 7. Main abstractions and data model

| Abstraction | Definition | Note |
|---|---|---|
| Document | one JSONL line with `text` | paragraph = text ending in `\n` (paper §4.1 fn3) |
| Attribute | detached file, same order/length | `[start,end,score]` spans |
| Filter | JSONPath predicate over attribute values | e.g. `$.attributes[?(@.gopher_rules__gopher_v1__word_count[0][2] < 50)]` |
| Dedupe | Bloom exact-key hit → attribute | writes attributes, does not delete |
| Mix | apply filter/replace/sample to produce subsets | up-sampling = repeat file paths |
| Tokens | `.npy` + mapping (id/src/loc) | identity survives tokenization |

"What is a document" was ablated for Reddit: **Atomic Content** beat Partial/Full threads, but all three linearizers ship under `sources/reddit/*`. (paper §7.1/Fig 4)

## 8. Processing and execution model

**Dedup (Bloom, not MinHash)** — order is deliberate: URL/doc first "greatly reduces documents to process"; paragraph last because "removing paragraphs risks disrupting content analysis" (paper §5.4):
1. URL dedup → 53.2% of docs
2. exact document dedup (no punctuation/whitespace removed; empty docs count) → 14.9% of url-deduped docs
3. exact paragraph dedup → 18.7% of paragraphs (=19.1% of UTF-8 chars)

Bloom: `estimated_doc_count=60_000_000_000`, `desired_false_positive_rate=1e-06`. Toolkit knobs: `by_ngram.ngram_length` (UAX#29 words, off by default), `by_ngram.threshold` (default 1.0), `bloom_filter.size_in_bytes` XOR the count/FPR pair. MinHash appears once, inherited from The Stack (no params). Upstream CCNet paragraph-dedups ~70% (SHA1, shard sets ≤20 GB). Decontamination reuses Bloom → removes 0.003% (v1.0/v1.5; v1.6 is NOT decontaminated). (paper §5.4/N.4/App. L; repo)

**Filtering** — language fastText @0.5 removes 61.7% (audited against ICE corpus); quality Gopher All 15.23% + C4 NoPunc 22.73% (no model filter); toxicity self-trained FastText (Jigsaw, sentence-level) with **τ=0.4 adopted** (cuts 5.5–7.3%) over τ=0.0004 (better but −29–35%) — scale-vs-quality stated openly; PII regex-only (email/phone/IP), ≤5 spans masked (`|||EMAIL_ADDRESS|||`), ≥6 dropped (0.02% / 0.001% of docs; repo errata §N.4 says 0.05%/0.11%); Reddit adds a safety stack (26,123 banned/NSFW subreddits). A repo-only `UrlBlocker` (AdBlock-format) has no paper footprint. (paper §5.2–5.3/7.2/App.; repo)

**Execution** — Python multiprocessing + Rust rayon + S3, **no Spark/EMR/Ray/Dask**; deduper/mixer are Rust wrapped in PyO3 (`deduper_entrypoint`/`mixer_entrypoint`); `processes: 188` standard; 122 CPU-h/TB; "200 TB raw on c6a.48xlarge (192 vCPU) ≈ 5 days". (paper §4.1; repo)

## 9. Scalability and performance (verified)

- 3,059B Llama tokens / 4,367M docs / 11,519 GB / 2,318B words (~200 TB raw → 11 TB). (Table 1)
- Sources: CC 2,479B (81.0%), The Stack 411B (13.4%), Reddit 89B (2.9%), peS2o 70B (2.3%), books 6.0B, wiki 4.3B. (Table 1)
- CCNet total: 84.2% filtered (175.1 → 27.7 TB); language 61.7%; paragraph dedup ~70%.
- Releases: v1 (6.0 TB) → v1_5 (6.4 TB) → v1_5-sample (2.9 TB) → v1_6 (5.4 TB) → v1_7 (4.5 TB). v1.7 trained-on **1,715.1B** vs full 2,308.5B. (HF README)
- Ablations: 1.2B/150B tokens, 64 MI250X (→128 units / 16 nodes), batch 1024. OLMo-1B: 739,328 steps ≈ 3.1T tokens. (App. D)
- Mixture (sampling → realized): Naïve 100/100/100/100 → 83.5/13.8/2.5/0.2; Reference+ → 81.2/13.5/4.9/0.4; Gopher-like → 68.4/5.4/24.2/2.0. (Table 4)

## 10. Experiments and evaluation methodology

Controlled 1.2B/150B-token ablations are the method (8 downstream tasks: ARC-E/C, BoolQ, HellaSwag, OpenBookQA, PIQA, SciQ, WinoGrande). Quality-filter ablation (C4 NoPunc alone > C4 All/Gopher All); language audit via ICE; dialect-bias audit (<5% across location subreddits); code-fraction ablation (0/5/15% — C4-only fails all bAbI); Reddit document-split ablation. OLMo-1B avg 60.3 vs TinyLlama 59.4 / Pythia 54.5 / StableLM₂ 66.5. (paper)

## 11. Open-source implementation (repo walkthrough)

- Layout: `python/dolma/{cli,core,taggers,warc}/`, `src/{deduper,mixer,bloom_filter,wimbd}.rs`, `configs/{dolma-v1_5,v1_6,v1_7,...}/`, `sources/{cc_warc,starcoder,reddit/*}`, `scripts/`.
- Key Python: `python/dolma/cli/{tagger,deduper,mixer,tokenizer}.py`; `core/{taggers,ft_tagger,parallel,registry,url_blocker,analyzer}.py`; `taggers/{language,gopher,c4,quality,jigsaw,pii,length,repetitions,url,sampling}.py`; `warc/processor.py`.
- Key Rust: `src/lib.rs` (`mod {bloom_filter, deduper, filters, io, mixer, s3_util, shard, wimbd}`); `src/wimbd/ngrams/*`.
- Config = YAML/JSON (`dolma -c cfg.yaml <cmd>`); filters are JSONPath over attribute values. Runbook-grade decontamination config with measured outputs (`>>> 3681169`).

## 12. Strengths

1. **Signal/policy separation** — the 3T-token proof is re-deriving v1.5→v1.6→v1.7 from one tag set.
2. **Stable (source,id)** — traceable identity; blocklists and PII-removal as side files, not corpus rewrites.
3. **Thresholds in config (JSONPath)** — policy changes are auditable diffs.
4. **Deliberately restrained, composable filters** — no model-based quality filter, with documented rationale.
5. **Runbooks with measured outputs** — decontamination README records CLI + observed Bloom sizes.
6. **Honest tradeoffs** — publishes the looser toxicity threshold and commits to a fix.

## 13. Limitations and unresolved questions

The paper's own: English-only ("reinforces English as the default"); single 1.2B/150B proxy decides 3T-scale policy; Bloom false positives; "quality"/"toxicity" are inherently ideological. (interpretation) Reproducibility is partial (Pushshift retired; raw CC not retained); the corpus is knowingly less filtered than the authors' own preferred ablation; **text-centric** — no multimodal analogue for character-offset attributes, exact-key dedup, or regex PII. A multimodal system needs perceptual-hash/embedding dedup, ASR language ID, face/voice/license-plate PII, and separate media decode throughput. Also note the paper's own PII-rate contradiction (§N.4 vs §5.3).

## 14. Lessons for an enterprise LLM / multimodal data lake

Mapping: record identity `(source,id)` = reference-grade; signal = detached attributes; policy = JSONPath; version = v1.5→v1.7 re-derivation; provenance = id + blocklists + runbooks. The playbook: (1) split tag-from-build into two idempotent services; (2) enforce a `(source,id)` version contract with byte-identical row alignment; (3) keep thresholds in config, never code; (4) budget filter compounding, not summing; (5) track full-corpus vs trained-on token counts separately; (6) make rejection a queryable artifact; (7) preserve an externally round-trippable id.

## 15. Comparison with the other two topics

| Dimension | Dolma | Data-Juicer | DataComp-LM |
|---|---|---|---|
| Positioning | corpus + reproducible toolkit | operator library + execution engine | data–model–eval benchmark |
| Abstraction | (source,id) doc + attributes | Operator + YAML recipe | recipe vs fixed train/eval |
| Dedup | exact-key Bloom (3 stages) | MD5 + MinHash + SimHash | BFF (Bloom, min-ngram 13) |
| Signal | detached span attributes | stats columns | heuristics + fastText scores |
| Policy | JSONPath (config) | op thresholds (code) | fixed + pluggable model filters |
| Eval feedback | OLMo ablations | paper 1 (HELM/GPT-4) | 53 tasks + 416 runs |
| Versioning/lineage | **strongest** | weak | medium |

One line: **Dolma wins signal/policy separation + reproducible versioning.** Full 16-dimension table in my-wiki's [[LLM 训练数据平台三系统对比（Data-Juicer / Dolma / DataComp-LM）]].

## 16. Recommended components / source files to inspect (repo)

`docs/{data-format,deduplication,taggers,tokenize}.md` · `python/dolma/cli/{tagger,deduper,mixer,tokenizer}.py` · `python/dolma/taggers/*` · `python/dolma/warc/processor.py` · `python/dolma/core/parallel.py` · `src/{lib,deduper,mixer,bloom_filter}.rs` · `configs/dolma-v1_5/mixing/{cc-head,code,books,wiki,...}.yaml` · `configs/dolma-v1_6/doc_dedupe/cc_en_head.yaml` · `configs/dolma-v1_5/decontamination/README.md` · `python/dolma/core/url_blocker.py`.

## 17. References

1. Dolma (ACL 2024 long): https://aclanthology.org/2024.acl-long.840/ · https://arxiv.org/abs/2402.00159
2. Dataset card: https://huggingface.co/datasets/allenai/dolma
3. Repo: https://github.com/allenai/dolma
4. Toolkit docs: https://github.com/allenai/dolma/tree/main/docs
5. OLMo: https://allenai.org/olmo
