# DataComp-LM — 权威来源与量化主张核对

本文档记录**一手来源**与**每个量化主张的出处**。无法溯源的数字不写入 `README.md` / `deck.pptx`；「不确定」项不得作为结论引用。

## 一手来源

1. **论文**（NeurIPS 2024 D&B；arXiv `2406.11794`）：https://arxiv.org/abs/2406.11794 · https://proceedings.neurips.cc/paper_files/paper/2024/hash/19e4ea30dded58259665db375885e412-Abstract-Datasets_and_Benchmarks_Track.html · 全文 https://ar5iv.labs.arxiv.org/html/2406.11794
2. **代码仓库** `mlfoundations/dclm`（MIT）：https://github.com/mlfoundations/dclm（GitHub Trees API，596 项/550 blobs，`truncated:false`）
3. **项目页 / leaderboard**：https://datacomp.ai/dclm/（TSV 数据 `datacomp.ai/dclm/data/filter_*.tsv`，均 HTTP 200）
4. **数据集/权重**：https://huggingface.co/datasets/mlfoundations/dclm-baseline-1.0 · https://huggingface.co/apple/DCLM-7B · https://huggingface.co/TRI-ML/DCLM-1B

## 版本钉死

- 摘要差异：NeurIPS camera-ready "**63% / 2T / 6 pp / half compute**"；arXiv "**64% / 2.6T / 6.6 pp / 40% less compute**"。本文以 arXiv 为准并标注。
- CORE/EXTENDED 评分：2025-09 中心化基线 bug 前 = `v1`（论文数字）；仓库默认 = `v2`（略下调，issue #114/PR #115）。

## 全部量化主张出处

| # | Metric | 值 | 单位 | 基线/上下文 | 来源 |
|---|---|---|---|---|---|
| 1 | DCLM-Pool token | 240 | T GPT-NeoX | 全 CC 先于 2023（README 说 "over 300T"=冲突） | 摘要/§1–3.1/HF 卡 |
| 2 | DCLM-Pool 文档 | 200 | B | 2013–2022 | §3.1 |
| 3 | Pool gzip 大小 | 370（§3.1） vs 340（App. E） | TB | 冲突 | §3.1/App. E |
| 4 | Pool 文件数 | 5.1M gzip jsonl | 个 | 1:1 WARC→jsonl | App. E |
| 5 | 规模 token 规则 | 20 × N × multiplier | tokens | 1x ≈ Chinchilla | §3.2/README |
| 6 | 400M-1x | 412M / 8.2B / 2.0e19 F / 26 h / 469B pool | — | README 池=137B(冲突) | Table 1 |
| 7 | 1B-1x | 1.4B / 28.8B / 2.4e20 / 240 h / 1.64T | — | — | Table 1 |
| 8 | 3B-1x | 2.8B / 55.9B / 9.4e20 / 740 h / 3.18T | — | — | Table 1 |
| 9 | 7B-1x | 6.9B / 138B / 5.7e21 / 3,700 h / 7.85T | — | — | Table 1 |
| 10 | 7B-2x | 6.9B / 276B / 1.1e22 / 7,300 h / 15.7T | — | App. C "约 16T"池 | Table 1 |
| 11 | 7B 架构 | 32L/32H/4096/128；seq 2048；vocab 50432 | — | qk-LN/SwiGLU/z-loss | Table 10/App. F |
| 12 | 7B hparams | lr 2e-3, wd .05, warmup 5000, z-loss 5e-6, bs 2048 seqs, cooldown 3e-5 | — | — | Table 10/App. F |
| 13 | 总计算 | ~1.2M H100 小时（859K 精确追踪，7B=713,216） | h | — | App. R |
| 14 | 排名传递 | r = 0.838 / 0.956 / 0.982 | Pearson | 400M/1B/3B → 7B-1x，10 方法 | Fig. 3 |
| 15 | DCLM-Baseline 头号 | Core 57.1 / MMLU 63.7 / Ext 45.4 | % | 7B/2.6T（+StarCoder+ProofPile2） | Table 8 |
| 16 | vs MAP-Neo | +6.6 pp MMLU，40% 更少算力（arXiv） | pp/% | NeurIPS: +6 pp, half | 摘要/Table 8 |
| 17 | vs Llama 3 8B | 6.6× 更少算力 53-任务平均相当 | × | — | 摘要 |
| 18 | vs Llama 2 7B | +5 pp MMLU，7× 更少算力 | pp/× | 280B-token 基线模型 | §1 |
| 19 | 过滤选择跨度 | 35 → 44 | % MMLU 5-shot | 7B、280B token | §1 |
| 20 | 评估套件 | 53 任务；Core=22 | 任务 | 中心化 0=随机 1=满分 | §3.5；仓库 eval_meta_data.csv(53)/additional_aggregation.json(22) |
| 21 | 任务类别 | symbolic 15 / world 10 / lang 8 / commonsense 8 / reading 8 / safety 4 | 任务 | 无 code 类 | 仓库 eval_meta_data.csv |
| 22 | logged 实验 | 416 | 次 | assets/DCLM_model_database.csv 精确 416 行 | §1/仓库 |
| 23 | 现有数据基线 7B-1x Core | C4 34.2 / Dolma-V1 35.0 / RPJ 35.3 / RefinedWeb 36.9 | % | — | Table 2 |
| 24 | 抽取 1B-1x Core | resiliparse 24.1 / trafilatura 24.5 / WET 20.7 | % | — | Table 3 |
| 25 | 抽取吞吐 | 4.55 vs 0.56 MB/s/core（resiliparse ~8×） | MB/s | — | App. K |
| 26 | 模型滤波 1B-1x Core | fastText 30.2 最优；PageRank 26.1 最差 | % | RefinedWeb 复现 27.5；SemDedup 27.1；BGE 27.2；AskLLM 28.6 | Table 4 |
| 27 | fastText 正集 7B-1x | OH-2.5+ELI5 41.0 vs GPT-3 Approx 37.5 / Wiki 35.7 / OWT2 34.7 | Core | +3.5 pp | Table 5 |
| 28 | fastText 阈值 | 10%(41.0) > 15%(39.8) > 20%(38.7) | Core | 7B-1x | Table 5 |
| 29 | BFF vs MinHash+SA | 差 0.2 | Core pp | 7B-2x；BFF 更易 >10TB | §4.3 |
| 30 | BFF 配置/产出 | min-ngram 13, thr 0.8, 10 shards → 3.8T token；MMLU 44.3/Core 45.3 | tokens/% | min-ngram 5 → MMLU 32.5 | Table 19/App. L |
| 31 | 混源 1B-1x | C4 +2.2 / RPJ-CC +1.7 / RefinedWeb +1.4 / **DCLM-Baseline −1.2** | Core pp | 67/33 外部混入 | Table 6 |
| 32 | 去污染 | MMLU 51.8→52.7；HellaSwag 77.9→78.4 | % | 无损失 | Table 7 |
| 33 | 人类标注研究 | 16 标注员 / 499 文档 / 71% 一致；AskLLM ~82% ROC-AUC → ~28.5% Core | — | fastText ~73% ROC-AUC → >31% Core | App. N |
| 34 | 评测框架效应 | 0.43–0.44（LightEval） vs 0.56–0.62（LLM-Foundry） | MMLU | 三外部 7B 模型的分数差 | App. G Fig. 5 |
| 35 | 权重 DCLM-7B | 7B / 2.5T / ctx 2048（8k 变体 8192） | — | license apple-ascl | HF 卡 |
| 36 | 数据集大小 | 3.8T（论文） vs "4T/3B 文档"（HF 卡） | tokens | 冲突 | §2/Table 19/HF 卡 |
| 37 | DCLM-Baseline 下载 | 611,337（zstd）/26,145（parquet） | 次 | HF API | — |

## 不确定 / 禁止引用的数字（含处置）

| 疑似说法 | 判定 | 处置 |
|---|---|---|
| "60%→70%" / "60% to 68.22%" | 全文/README/项目页/leaderboard 均无；TSV 无社区提交 | **删除**；如引用需注明有日期的 leaderboard 快照 |
| "~80% 算力削减 vs MAP-OMNI" | 无 "MAP-OMNI"；实际 40% vs MAP-Neo（arXiv）/ 6.6× vs Llama3 8B | 用修正版 |
| "seasaw / SHCCS / RSH 配方" | 一手源零命中 | 用 DCLM-Baseline 配方 |
| "dedup track" | 只有 filter + mixing 两个赛道 | 描述为 filtering 内的默认环节 |
| "evaluation data on S3" | 评估数据来自 LLM-Foundry | 修正 |
| "DCLM-12B" | 无此尺度（最大 7B-2x） | 删除 |
| "FineWeb 算力削减比例" | 从未给出 | 只引精度对比 |
| CORE/EXTENDED 不带版本 | 论文=v1，仓库默认=v2 | 必须标 v1/v2 |

## 链接校验（2026-09 快照）

- [x] arxiv.org/abs/2406.11794 — 200
- [x] proceedings.neurips.cc .../hash/19e4ea30... — 200
- [x] github.com/mlfoundations/dclm — 200（API 200）
- [x] datacomp.ai/dclm — 200（leaderboard TSV filter_*.tsv 200；mixing_*.tsv 404）
- [x] huggingface.co/datasets/mlfoundations/dclm-baseline-1.0 — 200