# docs — Presentations & Reference

This repository hosts online presentations and reference documentation by [wangyong1972](https://github.com/wangyong1972).

Hosted live via GitHub Pages:
👉 **[https://wangyong1972.github.io/docs/](https://wangyong1972.github.io/docs/)**

---

## 📽 Presentations

### [Presentation Skills Guide](https://wangyong1972.github.io/docs/presentation-skills/)
- **Live Slide Deck:** [https://wangyong1972.github.io/docs/presentation-skills/](https://wangyong1972.github.io/docs/presentation-skills/)
- **Local Path:** `presentation-skills/deck.html`
- **Topics Covered:**
  - `generate-outline-deck` — Single-file interactive HTML presentation framework with auto-derived left outline sidebar, toolbar (laser pointer, fullscreen, PDF export), dark-mode default, and deep-link navigation.
  - `pptx` — Native Microsoft PowerPoint OpenXML presentation authoring via `pptxgenjs` and template surgery.
  - Local marketplace setup (`claude-plugins-local`) and registering in Claude Code.
  - Local preview, headless rendering QA, and publishing to GitHub Pages.

---

## 💻 Running Locally

You can open the presentation directly in any browser:

```bash
# Clone this repo
git clone https://github.com/wangyong1972/docs.git ~/projects/github/wangyong1972/docs
cd ~/projects/github/wangyong1972/docs

# Open in default browser
open presentation-skills/deck.html

# Or launch local HTTP server
python3 -m http.server 8000
# Visit http://127.0.0.1:8000/presentation-skills/
```

### Shortcuts in the Presentation
- `→` / `Space` / `PageDown`: Next slide
- `←` / `PageUp`: Previous slide
- `Home` / `End`: First / last slide
- `o`: Toggle left outline sidebar
- `l`: Toggle laser pointer dot (follows mouse)
- `f`: Fullscreen
- `p`: Browser print-to-PDF
- `s`: Settings (switch dark/light theme, typography, transitions)
- `#N` URL hash: Direct deep link to slide `N` (e.g. `deck.html#5`)
