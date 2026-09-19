# Dolma — 权威来源与量化主张核对

本文档记录**一手来源**与**每个量化主张的出处**。无法溯源的数字不写入 `README.md` / `deck.pptx`；「不确定」项不得作为结论引用。

## 一手来源

1. **论文**（ACL 2024 长文，Best Resource Paper）：https://aclanthology.org/2024.acl-long.840/ · https://arxiv.org/abs/2402.00159 · 全文 https://ar5iv.labs.arxiv.org/html/2402.00159
2. **数据卡**（HF）：https://huggingface.co/datasets/allenai/dolma（含版本表与 loader `dolma.py`，`_BASE_URL=https://olmo-data.org`）
3. **代码仓库** `allenai/dolma`：https://github.com/allenai/dolma（GitHub Trees API，794 项，`truncated:false`；`docs/*`、`configs/*`、`src/*`、`python/dolma/*` 均经读取）
4. **项目页**：https://allenai.org/dolma（⚠️ 现已被 Olmo 3 页面接管——引 HF 卡 + GitHub 即可）

## 全部量化主张出处

| # | Metric | 值 | 单位 | 基线/上下文 | 来源 |
|---|---|---|---|---|---|
| 1 | 总 token | 3,059 | B Llama token | "three trillion" | Table 1 |
| 2 | 总文档 / 大小 / 单词 | 4,367M / 11,519 GB / 2,318B | docs/GB/words | ~200 TB 原始 → 11 TB | Table 1 |
| 3 | CC | 2,479B (81.0%) | tokens/% | 25 快照 2020-05→2023-06 | Table 1, §5 |
| 4 | The Stack（代码） | 411B (13.4%) | tokens/% | The Stack dedup | Table 1 |
| 5 | Reddit / peS2o / 书 / 百科 | 89 / 70 / 6.0 / 4.3 | B tokens | — | Table 1 |
| 6 | 版本 v1 / v1_5 / v1_5-sample / v1_6 / v1_7 | 6.0 / 6.4 / 2.9 / 5.4 / 4.5 | TB | 2023-08-18 → 2024-04-15 | HF README |
| 7 | 实际训练 token（v1.7） | 1,715.1B（全量 2,308.5B） | tokens | OLMo-7B-v1.7 | HF README |
| 8 | CCNet 总过滤 | 84.2%（175.1→27.7 TB） | % | CC 路径 | §5.1/N.4 |
| 9 | 语言过滤（fastText 0.5） | 61.7% | % 字节 | 全源 | §5.1/N.4 |
| 10 | CCNet 段落去重 | ~70% 段落 | % | SHA1，分片集 ≤20 GB | §5.1/N.4 |
| 11 | URL 去重 | 53.2% | % 文档 | 第 1 级 | §5.4 |
| 12 | 文档去重 | 14.9% | % （URL 去重后） | 第 2 级 | §5.4 |
| 13 | 段落去重 | 18.7%（=19.1% UTF-8 字节） | % | 第 3 级 | §5.4/N.4 |
| 14 | Bloom 参数 | 60,000,000,000 文档 / 1e-6 FPR | — | doc_dedupe cc_en_head | 仓库 config |
| 15 | n-gram threshold 默认 | 1.0 | — | 全匹配 | docs/deduplication.md |
| 16 | 质量 Gopher All / C4 NoPunc | 15.23% / 22.73% | % 字符 | 无模型质量过滤 | §5.2 |
| 17 | 毒性 τ=0.4（采用） | 5.5–7.3%；更严 τ=0.0004 删 29.1–34.9% | % | 规模 vs 质量权衡 | §5.3 |
| 18 | PII | ≤5 span 掩码 0.02%；≥6 span 删 0.001% | % 文档 | email/phone/IP 三正则 | §5.3/App. I（§N.4 为 erratum 0.05%/0.11%） |
| 19 | Reddit 块名单 | 26,123 subreddit + >10% NSFW 自动 | 个 | sources/reddit/*/subreddit_blocklist.txt | §7.2/仓库 |
| 20 | 去污染删除 | 0.003%（v1.0/v1.5，v1.6 未做） | % | 对 Paloma | App. L |
| 21 | 工具吞吐 | 122 CPU-小时/TB；200 TB 于 c6a.48xlarge(192 vCPU) 5 天 | h/TB | processes:188 | §4.1 |
| 22 | 消融模型 | 1.2B / 150B token，64 MI250X→128 单元/16 节点，batch 1024 | — | 决定数据策略 | §4.2/App. D.1 |
| 23 | OLMo-1B 步数 | 739,328 步 ≈ 3.1T token，batch 2048，256 单元 | — | AdamW | App. D.4 |
| 24 | OLMo-1B 平均分 | 60.3 vs 59.4 / 54.5 / 66.5 | 分（8 任务） | TinyLlama/Pythia/StableLM₂；胜 4/8 | Table 2 |
| 25 | 混合物（Naïve 采样 vs 实际） | 100/100/100/100% → 83.5/13.8/2.5/0.2% | % | Web/Code/Ref/Books | Table 4 |
| 26 | 领域内饱和 | Reference+ 4.9% vs Gopher-like 24.2% 论文 → 几乎同分 | % | — | App. M |
| 27 | 残余语言 | 0.86% 未识别 / 0.06% 中文 | % | — | App. K |
| 28 | 方言偏差 | <5% | % | location subreddit 间 | App. G/Fig 8 |
| 29 | 去污染 Bloom 尺寸 | 3,681,169 / 2,336,120 / 2,020,471 文档；段 ≥13 uniseg 词 | docs | 1e-5 | 仓库 config |

## 不确定 / 禁止引用的数字（含处置）

| 疑似说法 | 判定 | 处置 |
|---|---|---|
| PII 0.05%/0.11%（§N.4） | 与 §5.3/App. I（0.02%/0.001%）矛盾（110×） | 引 0.02%/0.001%，标 §N.4 为 erratum |
| CC 快照数 | §5=25、§N.4=24 | 引 25，注 24 |
| Reddit 文档数 | 378M(§7.1) vs 377M(Table1)/377.4M(HF) | 引 377.4M |
| The Stack 的 MinHash/LSH 参数 | 论文未给（沿用上游） | 不写具体参数 |
| Table 1 ≡ v1.6 | 未明说（=v1.6 行一致） | 解读，标注 |
| 训练/held-out 切分比例 | 论文未给显式比例（~1M token/子集 eval + 0.3% sample 阈值） | 分开报告，不混 |
| allenai.org/dolma | 现指向 Olmo 3 主页 | 引 HF 卡 + GitHub |

## 链接校验（2026-09 快照）

- [x] aclanthology.org/2024.acl-long.840 — 200
- [x] arxiv.org/abs/2402.00159 — 200
- [x] github.com/allenai/dolma — 200（API 200）
- [x] huggingface.co/datasets/allenai/dolma — 200