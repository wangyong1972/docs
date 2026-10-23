# Source index and speaker notes

Reviewed 2026-10-23. Weekly Paper 2026-10-09. Published claims, inferences and proposed applications are distinguished on slides. No downloaded research code or GPU experiment was executed.

## 01. Multi-modal Data Spectrum



- Multi-modal Datasets are Multi-dimensional
- Madaan et al., ICLR 2026
- An audit of modality dependence across 23 VQA benchmarks

- [Paper v2](https://arxiv.org/html/2509.23499v2)
- [Code](https://github.com/divyam3897/multimodal-spectrum/tree/48c61f2a1e41c79f5882cf5857e1df800b702fef)

**中文讲解：** 通过输入扰动把总体准确率拆成单模态依赖和跨模态交互。论文重点是评测诊断。

## 02. A correct answer can use a shortcut



- Question priors can reveal answers when the image changes.
- Image content and answer options can reveal a likely label despite an unrelated question.
- Benchmark design that removes text shortcuts can accidentally strengthen image shortcuts.

- [Paper v2](https://arxiv.org/html/2509.23499v2)
- [Code](https://github.com/divyam3897/multimodal-spectrum/tree/48c61f2a1e41c79f5882cf5857e1df800b702fef)

**中文讲解：** 多模态输入不保证模型真正联合使用了两种模态。这里的 shortcut 是基于实验观察的依赖，不是每题的因果证明。

## 03. Four controlled evaluation conditions



Condition | Image | Question
--- | --- | ---
Normal | Original | Original
Image contribution | Original | Shuffled
Text contribution | Shuffled | Original
Random baseline | Shuffled | Shuffled

- [Paper v2](https://arxiv.org/html/2509.23499v2)
- [Code](https://github.com/divyam3897/multimodal-spectrum/tree/48c61f2a1e41c79f5882cf5857e1df800b702fef)

**中文讲解：** 论文使用随机替换而非直接删去模态。“Image only” 仍存在不相关文本，需明确这种实验操作。第 3 节。

## 04. Dependency strength follows performance changes



- The adapted perceptual-score method compares normal and shuffled conditions.
- Single-modality performance above the random baseline exposes exploitable information.
- High paired performance with large drops under either shuffle suggests stronger interaction dependence.

- [Paper v2](https://arxiv.org/html/2509.23499v2)
- [Code](https://github.com/divyam3897/multimodal-spectrum/tree/48c61f2a1e41c79f5882cf5857e1df800b702fef)

**中文讲解：** 这些量依赖选定模型和 metric。不能把它们当成数据集固有且唯一的信息论分解。

## 05. Study coverage and model controls



- The study spans 23 multiple-choice VQA benchmarks.
- Domains include knowledge reasoning, spatial understanding, OCR, and charts.
- Experiments compare Cambrian scales and other MLLM families.

- [Paper v2](https://arxiv.org/html/2509.23499v2)
- [Code](https://github.com/divyam3897/multimodal-spectrum/tree/48c61f2a1e41c79f5882cf5857e1df800b702fef)

**中文讲解：** 作者强调最好选择未在目标数据集训练过的 baseline，但现实 checkpoint 的污染与训练明细仍会限制解释。第 4.1 节。

## 06. Predominantly interaction-dependent cases are rare



- The paper highlights MME, POPE, COCO, and V* as the clearest interaction-dependent cases.
- Several use complementary yes/no questions for the same images.
- A single aligned modality often remains informative on the other benchmark families.

- [Paper v2](https://arxiv.org/html/2509.23499v2)
- [Code](https://github.com/divyam3897/multimodal-spectrum/tree/48c61f2a1e41c79f5882cf5857e1df800b702fef)

**中文讲解：** 这是该实验和模型下的分类，不应写成所有模型永远不能利用这些数据集的单模态偏差。第 4.2 节。

## 07. Question-only gains above random



Benchmark | Reported absolute gain
--- | ---
GQA | 26 points
ScienceQA | 17.5 points
MMMU | 11.35 points
AI2D | 34.94 points

- [Paper v2](https://arxiv.org/html/2509.23499v2)
- [Code](https://github.com/divyam3897/multimodal-spectrum/tree/48c61f2a1e41c79f5882cf5857e1df800b702fef)

**中文讲解：** 第 4.2 节描述的模型评测结果。gain 是相对 random 条件的百分点，不是相对正常多模态准确率提升。

## 08. Dataset averages conceal category differences



- Dependence varies within a benchmark as well as across benchmarks.
- Larger models can improve total accuracy while preserving shortcut use.
- A benchmark label such as spatial reasoning does not establish image–question interaction for every sample.

- [Paper v2](https://arxiv.org/html/2509.23499v2)
- [Code](https://github.com/divyam3897/multimodal-spectrum/tree/48c61f2a1e41c79f5882cf5857e1df800b702fef)

**中文讲解：** 选择评测集合时应按 category 分层看 shuffle gap，不能只按数据集名字做能力覆盖矩阵。

## 09. Multiple-choice scope limits generalization



- Answer options can leak task structure and visually associated labels.
- Shuffling produces out-of-distribution inputs and can trigger behavior beyond information loss.
- The paper calls for open-ended evaluation and meaningful abstention.

- [Paper v2](https://arxiv.org/html/2509.23499v2)
- [Code](https://github.com/divyam3897/multimodal-spectrum/tree/48c61f2a1e41c79f5882cf5857e1df800b702fef)

**中文讲解：** 论文没有证明所有开放式 caption 或 agent 任务存在同等偏差。需要重新定义输出与评分协议。

## 10. Benchmark registry implications



- Inference: register input permutations, seeds, and answer-option formatting with every evaluation run.
- Proposed application: attach a modality-dependence profile to benchmark versions.
- Proposed application: compare category profiles before replacing one evaluation set with another.

- [Paper v2](https://arxiv.org/html/2509.23499v2)
- [Code](https://github.com/divyam3897/multimodal-spectrum/tree/48c61f2a1e41c79f5882cf5857e1df800b702fef)

**中文讲解：** 这样才能区分模型进步与评测集合更换。生产 dashboard 应展示正常分数和三种对照。

## 11. Code and reproducibility surface



- The public repository includes benchmark-specific generation and scoring paths.
- Normal, Text Shuffle, Image Shuffle, and Random runs produce separate JSONL outputs.
- Dataset and model downloads remain external dependencies with their own access and license constraints.

- [Paper v2](https://arxiv.org/html/2509.23499v2)
- [Code](https://github.com/divyam3897/multimodal-spectrum/tree/48c61f2a1e41c79f5882cf5857e1df800b702fef)

**中文讲解：** 本次静态核查 README，未运行自动下载或推理。复现时需冻结 checkpoint、数据 revision 和随机种子。

## 12. A practical acceptance test



- Run all four conditions on a stratified subset with fixed seeds.
- Compare per-category confidence, abstention, and correctness under altered modalities.
- Promote a benchmark only after its dependence profile matches the capability being claimed.

- [Paper v2](https://arxiv.org/html/2509.23499v2)
- [Code](https://github.com/divyam3897/multimodal-spectrum/tree/48c61f2a1e41c79f5882cf5857e1df800b702fef)

**中文讲解：** 以上是从研究结论推导的评测流程，不能把 shuffle gap 的改善自动等同于业务任务改善。
