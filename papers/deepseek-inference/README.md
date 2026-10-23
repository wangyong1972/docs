# DeepSeek DeepInfer: source-level systems review

A 30-slide technical walkthrough for experienced AI and data infrastructure engineering managers. English slide content with visible Chinese explanatory notes, following this repository's outline-deck format.

- [Interactive deck](deck.html), with keyboard navigation, outline, theme switch and browser PDF export
- [PDF deck](deck.pdf)
- [Per-slide source index and Chinese notes](sources.md)
- [Official repository inventory snapshot](inventory.json)
- [Editable slide content](deck-source/slides.json) and [rebuild script](deck-source/build.py)

## Evidence and scope

DeepInfer reviewed at [`9bd9cf243fc53ef9afbf8f04d391d989117d6ab9`](https://github.com/deepseek-ai/DeepInfer/commit/9bd9cf243fc53ef9afbf8f04d391d989117d6ab9), dated October 21, 2026. Companion code snapshots: deepseek-harness `687f282e8625c6b8d11ff58211a90524be2e4317`, deepseek-recipe `935817c66f5d6e64838f419692545f06787e485f`.

Most slides read actual inference implementation: entry points, C++ scheduling, asynchronous retirement and GPU metadata correction, local block/state allocation, KV formats, bounded replay, DP/CP/EP, MoE communication and expert balancing, attention/TopK, graph capture, confidence verification, a TileLang kernel, output constraints, and integration boundaries.

The release provides offline inference. Its local GPU cache code differs from the external KV cache system, disaggregated service orchestration, and replica routing explicitly excluded by the release. Deployment Q&A descriptions appear as documentation claims, not evidence that their complete service code is available. Benchmarks retain the published SM100 hardware and scale-up-domain qualifications. No GPU jobs or untrusted project code were executed.

“Search” remains ambiguous. The verified harness code supplies web API adapters and local ripgrep tools, while DeepSelect supplies model-internal TopK. Agent filesystem tooling differs from 3FS distributed storage. The inventory covers related official repositories, with creation timestamps distinguished from release dates. Context-only libraries have not received a complete source audit.

## Rebuild

From this repository root, with Python 3 standard library only:

```sh
python3 papers/deepseek-inference/deck-source/build.py
```

Open `deck.html` directly. Arrow keys navigate, `o` toggles the outline, `p` opens browser print. The PDF uses the same HTML and a 1400 × 900 px print page. Print all pages with background graphics enabled, without browser headers/footers, at the CSS page size. No build dependencies or remote resources are required to view the deck.

HTML is the editable presentation deliverable. A PPTX was not generated because this repository's established technical-deck format is standalone HTML with PDF export. Code excerpts are shortened for teaching and marked as abridged or explanatory examples where appropriate. Original DeepInfer code carries Apache-2.0 licensing and provenance in its linked source files.
