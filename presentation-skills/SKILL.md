---
name: generate-outline-deck
description: Use this skill whenever the user asks to "make a presentation", "generate a deck", "做个演示", "生成 presentation", or wants a slide deck with an outline sidebar. Produces a single-file HTML deck (no build step, no framework dependency) with a derived outline navigation, icon toolbar (outline / laser pointer / fullscreen / PDF export / theme settings), dark-mode default, and `#<n>` deep links. Do NOT use for plain Markdown slides — use a slide-by-`---` splitter instead.
version: 0.1.0
---

# generate-outline-deck

Generate a single-file HTML presentation deck with a derived outline navigation, icon toolbar, and dark-mode default.

## What this produces

A single self-contained `.html` file with:

1. **Derived outline sidebar** — left-edge navigation grouped by `<section data-section>`, current slide highlighted, click-to-jump. The outline is **derived** from the DOM, not hand-maintained: add/remove/reorder `<section class="slide" data-deck data-section data-title>` and the outline, progress bar, and page counter update automatically.
2. **Icon toolbar** — ☰ outline / ● laser pointer (red dot follows cursor) / ⛶ fullscreen / 📄 PDF export modal / ⚙ settings panel (light↔dark theme, font SF Pro/Helvetica/Avenir/Georgia/Menlo, transition fade/slide-left/zoom/none).
3. **Dark background by default** — `<html data-theme="dark">`, near-black main, light text, dark cards. Settings panel lets users switch to light; both themes are fully usable.
4. **Deep links** — `deck.html#5` (1-based, aligned with outline numbering) for screenshot verification and per-slide sharing.
5. **PDF export** — browser print dialog with print-optimized CSS (one slide per page, hidden toolbar/outline).

## When to use vs siblings

- **`generate-outline-deck` (this skill)** — outline-driven deck. Use when the user wants to *jump around* (technical walkthrough, doc, multi-section report). My default for "做个演示/做个 deck/生成 presentation".
- **Plain Markdown slides** (`---` separators) — for short, linear talks where a build step is overkill.
- **`.pptx` output** — when the user explicitly needs PowerPoint format (e.g. for sharing with non-technical audiences). Use the `pptx` skill instead.

## 7-step workflow

1. **Ask for the source** — never fabricate. The skill refuses to proceed without one of: Quip doc / GitHub PR / Slack thread / whiteboard photo / existing deck / a pasted outline. If the user already pasted the content in chat, treat the chat as the source.
2. **Read the source** with the read tool (or `read_image` for images). Skim once, list the major sections, then re-read for details you will actually put on slides. Do not paste source verbatim — paraphrase for slide density.
3. **Verify facts** that the user is likely to be challenged on: numbers, dates, code identifiers, URLs. If a fact cannot be verified, flag it on the slide (e.g. footnote "TBD — needs verification") rather than presenting it as ground truth.
4. **Build the deck**:
   - `cp assets/deck-template.html <outdir>/deck.html`
   - Replace `<title>`, the `<header>` placeholder, and the demo `<section class="slide">` blocks.
   - Group slides into sections by setting `data-section="<group name>"` on every slide. Outline groups collapse/expand automatically.
   - Set `data-title` per slide — that string appears in the outline.
   - Drop in content using the components in `references/components.md`. Stay within the 1400×900 canvas; longer content gets clipped, not auto-shrunk.
5. **Render-verify** with headless Chrome (see pitfalls below) + `read_image`. The skill NEVER declares "done" based on the build alone — every slide must be visually checked. Pay extra attention to dense slides (lots of bullets/code) and the first/last slide.
6. **Ask where to publish** — local preview only, GitHub Pages (public or private), company-internal Pages, or just leave the file on disk. See `references/publishing.md` for the matching commands.
7. **Report** — give the user the absolute path, the slide count, the section count, and any verification gaps (e.g. "slide 7 has a `[TBD]` placeholder for the launch date — need to confirm with PM").

## Pitfalls

- **Fixed 1400×900 canvas, not auto-fit.** Content overflow is hidden, not shrunk. Dense slides MUST be screenshotted and read back; do not trust "it compiled".
- **Headless Chrome on a sandboxed machine** — first run often times out because the GoogleUpdater subprocess lingers. The screenshot may already be on disk before the timeout fires; check `/tmp/...png` before retrying. Always pass `--no-sandbox --disable-dev-shm-usage --user-data-dir=/tmp/<unique>` to avoid `Failed to create headless user data directory container`.
- **`#modeSwitcher` / `data-deck` are for multi-version decks.** Default single-version deck: leave `#modeSwitcher` hidden, set every `data-deck` to the same value (e.g. `v1`). Touching the switcher code without need is the most common bug.
- **Light/dark theme.** Switch via ⚙ panel; both themes are CSS-complete. After adding custom slide colors, check both — hard-coded colors break the theme switch.
- **Print CSS.** `@media print` is in the template. If you heavily customize per-slide background colors, re-test PDF export.

## Files

```
skills/generate-outline-deck/
├── SKILL.md                      # this file
├── assets/
│   └── deck-template.html        # single-file template; CSS+JS complete; edit here to change defaults
└── references/
    ├── components.md             # per-slide-type markup + attribute reference
    └── publishing.md             # local preview / GitHub Pages / static-host commands
```

## Related

- `pptx` skill — when PowerPoint format is required
- Plain Markdown-with-`---` slides — when an outline sidebar is overkill