# Data-Juicer — 权威来源与量化主张核对

本文档记录本主题用到的**一手来源**与**每个量化主张的出处**。规则：无法溯源到一手来源的数字一律不写入 `README.md` 与 `deck.pptx`；标记为「不确定」的数字不得作为结论引用。

## 一手来源

1. **Data-Juicer 论文**（arXiv `2309.02033`；SIGMOD 2024 Companion，pp. 120–134，DOI `10.1145/3626246.3653385`）
   - 摘要：https://arxiv.org/abs/2309.02033
   - 全文：https://ar5iv.labs.arxiv.org/html/2309.02033
2. **Data-Juicer 2.0 论文**（arXiv `2501.14755`；NeurIPS 2025 Spotlight）
   - 摘要：https://arxiv.org/abs/2501.14755
   - 全文：https://ar5iv.labs.arxiv.org/html/2501.14755
3. **代码仓库** `datajuicer/data-juicer`（Apache-2.0）：https://github.com/datajuicer/data-juicer
   - 快照：commit `1e9720d01610ece3cb0d3e3026c0bf88fbbf42c8`（main HEAD，2026-09-15；GitHub Trees API `truncated:false`，1,417 文件）
4. **官方文档**：https://datajuicer.github.io/data-juicer/
5. **Data-Juicer Sandbox**（独立论文，ICML'25 Spotlight）：https://arxiv.org/abs/2407.11784
6. 仓库 README / `docs/Operators.md` / `config_all.yaml` / `base_op.py` / `adapter.py` / `ray_dataset.py` 等关键源文件（均经 raw.githubusercontent.com 读取）

## 全部量化主张出处（metric · 值 · 单位 · 基线 · 上下文 · 来源）

| # | Metric | 值 | 单位 | 基线/上下文 | 来源 |
|---|---|---|---|---|---|
| 1 | 算子数（1.0） | over 50 | 个 | 文本算子 | paper1 摘要/§1/§8 |
| 2 | 算子数（2.0 摘要） | 100+ | 个 | 2.0 能力层 | paper2 摘要 |
| 3 | 算子数（2.0 §1） | 150+ | 个 | 多模态 | paper2 §1 |
| 4 | 新增算子（2.0 §2） | about 100 | 个 | vs 1.0 | paper2 §2 |
| 5 | 算子数（仓库） | 200+ / 230 文档 / 222 模块 | 个 | README / docs/Operators.md / 模块计数 | 仓库 |
| 6 | 预训练质量 | +7.45% | % | LLaMA-1.3B，16 HELM 任务平均分最大提升 | paper1 摘要 |
| 7 | 微调 win rate | up to +17.5% / avg +10.3% | % | GPT-4 两两（英） | paper1 §1/§7.1.2 |
| 8 | 数据消减 | up to −90.4%（中）/ −56.8% avg | % | 更少数据量下仍更高 win rate | paper1 §7.1.2 |
| 9 | HELM 16 任务平均分 | 34.21 (DJ 150B) vs 33.97 / 33.96 | 分 | Falcon-1.3B(350B) / Pythia-1.4B(300B) | paper1 Table 2 |
| 10 | IFT 精炼 | 36.76 (150B+4.7B) vs 35.04 (150B+15B) | 分 | reference model | paper1 Table 2 |
| 11 | 端到端时间/内存 | −50.6% / −55.1% | % | vs RedPajama+Dolma，Books/arXiv/C4，np=32/64/128 | paper1 §7.2.1 |
| 12 | 最坏时间/内存 | −88.7% / 22.9% | %/ratio | arXiv / Books | paper1 §7.2.1 |
| 13 | OP 融合+重排 | up to −24.91% e2e / −42.04% 可融合 | % | 14 OP / 5 可融合 | paper1 §7.2.2 |
| 14 | Ray 分布 | −87.4% / −84.6% | % | StackExchange / arXiv，16 服务器 20Gbps NAS | paper1 §7.2.4 |
| 15 | 质量分类器 F1 | 97.47% / 98.64% / 61.56% | % | GPT-3 复现 / 中文 / 代码（4:1） | paper1 §7.2.3/App. B T5 |
| 16 | 缓存/检查点空间 | (1+M+F+I(F>0)+D)×S / 峰值 3×S | ×S | — | paper1 App. A.2 |
| 17 | 70B 样本吞吐 | 7,611 s（≈2.1 h） | 秒 | 6,400 核；125,000× 数据集 | paper2 §5.4 |
| 18 | 去重 5TB | 168.10 min（2.8 h） | 分 | 1,280 核，MinHash ray_bts_minhash | paper2 Table 1 |
| 19 | 去重扩展 | 5× 数据 → 4.02–5.62× 时间；2× 核 → 58.9–67.1% 时间 | ratio | — | paper2 §5.4 |
| 20 | MinHash 引擎 | 3.3× | × | BTS union-find vs vanilla Ray | paper2 §4.1/App. F.1 |
| 21 | OP 重排+融合 | up to −70.22%（13 OP）/ 46.09%（5 OP） | % | 复杂/简单配方 | paper2 §5.5/App. H.2.1 |
| 22 | GPU 分配 | ≥50% 节省（4 图像 OP），最高 99%；BLIP-2 8668.87→305.44 s；SDXL 100h→~1h | %/s | 8×A100 | paper2 §5.5/App. H.2.2 |
| 23 | 批处理 | up to −84% | % | batch_size 默认 1000 | paper2 §5.5/App. H.2.3 |
| 24 | Ray-DLC vs ECS | −24.8% | % | 56M 样本 | paper2 §5.3 |
| 25 | AI-CPFS vs CPFS | 1625 vs 4396 s = 2.7× | ratio | 3× 带宽 + RDMA | paper2 §5.4 |
| 26 | MaxCompute | 文本 ~1/4 时间、1/2 核；多模态慢 1.5× | ratio | vs Ray | paper2 §5.4 |
| 27 | MinHash 内存 | RSS 768 → 272 MiB | MiB | v1.5.5 | README L120 |
| 28 | BTS union_threshold | 256 | — | ray_bts_minhash 缺省 | 仓库 |
| 29 | MinHash 缺省 | num_permutations=256, jaccard_threshold=0.7 | — | document_minhash_deduplicator | 仓库 |
| 30 | SimHash 缺省 | window=6, blocks=6, hamming=4 | — | document_simhash_deduplicator | 仓库 |
| 31 | Probe 采样 | min(1000, remaining_data_size) | 样本 | probe_small_batch 默认 | paper2 App. G |
| 32 | 自动并行目标 | 90% | % | 利用率 | paper2 App. G |
| 33 | Ray 预切分 | 128 MB | MB | 与 Ray block 策略对齐 | paper2 App. F.3 |
| 34 | 仓库规模 | 7,070 stars / 426 forks / 61 issues / 1,417 文件 / 863 .py | — | 2026-09 快照 | GitHub API |
| 35 | 许可 | Apache-2.0 | — | LICINSE | GitHub API/仓库 |

## 不确定 / 禁止引用的数字（含处置）

| 疑似说法 | 判定 | 处置 |
|---|---|---|
| "OP fusion 2–10× speedup"（README） | 与论文 24.91%/42.04%/70.22% 全部冲突 | **不引用** |
| "70B 样本 50 Ray nodes"（README） | 节点数仅 README；论文是 6,400 核 | 引 "≈2.1 h @ 6,400 核（paper2 §5.4）"，去掉节点数 |
| "records/sec / samples/min 吞吐" | 两篇论文均为墙钟，样本定义随实验变化 | **不合成派生值** |
| "MaxCompute 比 Spark SQL 快 50%" | 论文自述"内部经验对比"，无方法学 | 只作"作者声称、未基准" |
| "Data-Juicer 提升 InternLM" | 两篇论文全文零命中 | **删除** |
| "SIGMOD 2024 demo track" | Crossref 仅 `proceedings-article` | 写 "SIGMOD 2024 Companion" |
| `dj-process` CLI 入口 `data_juicer.tools.process_data` | HEAD 404，真文件在仓库根 `tools/process_data.py` | 脚本化前需装 package 验证 |
| 论文 2 算子数（100+ / 150+ / ~100 new） | 同文档自相矛盾 | 引摘要 "100+" 并脚注 §1 变体 |
| 2.0 组合算子数（5 含 HumanOP vs 4） | §4.2 vs App. E.3.1 不一致 | 列出全部名称并注差异 |

## 链接校验（2026-09 快照）

- [x] arxiv.org/abs/2309.02033 — 200
- [x] arxiv.org/abs/2501.14755 — 200
- [x] github.com/datajuicer/data-juicer — 200（API 200）
- [x] datajuicer.github.io/data-juicer — 200
- [x] arxiv.org/abs/2407.11784 — 200