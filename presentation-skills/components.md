# Components

Every slide is a `<section class="slide">` with three required data attributes:

```html
<section class="slide"
         data-deck="v1"        <!-- version group; use "v1" for single-version decks -->
         data-section="Intro"  <!-- outline group name -->
         data-title="Cover">   <!-- outline item label -->
  <!-- content -->
</section>
```

The outline sidebar, progress bar, and slide counter are **derived** from these attributes — no manual sync needed.

---

## Typography

| Element | Class / tag | Default size | Notes |
|---|---|---|---|
| Slide eyebrow | `<h3>` above `<h1>` | 22px | dim color, used for kicker text |
| Title | `<h1>` | 56px | one per slide max |
| Heading | `<h2>` | 36px | section / topic header |
| Body | `<p>` | 22px | line-height 1.55 |
| Lede | `.lede` | 28px | dim color, lead paragraph |
| List | `<ul>` / `<ol>` | 22px | padding-left: 28px |
| Code | `<pre><code>` | 16px | mono, scrollable inside slide |

---

## Layout helpers

| Class | Effect |
|---|---|
| `.cols-2` | Two equal columns with 32px gap |
| `.cols-3` | Three equal columns with 24px gap |
| `.card` | Rounded card with border, padding 24×28 |
| `.pill` | Inline rounded label, used in stacks |
| `.lede` | Larger dimmer paragraph |

Combine them — e.g. `<div class="cols-2"><div class="card">…</div><div class="card">…</div></div>`.

---

## Patterns

### Title slide

```html
<section class="slide active" data-deck="v1" data-section="Intro" data-title="Title">
  <h3>eyebrow / kicker</h3>
  <h1>Big statement</h1>
  <p class="lede">Sub-statement, dimmer color.</p>
  <div>
    <span class="pill">tag-1</span>
    <span class="pill">tag-2</span>
  </div>
</section>
```

### Bulleted list

```html
<section class="slide" data-deck="v1" data-section="Section A" data-title="Three points">
  <h2>Three points</h2>
  <ul>
    <li>First</li>
    <li>Second</li>
    <li>Third</li>
  </ul>
</section>
```

### Two-column compare

```html
<section class="slide" data-deck="v1" data-section="Section B" data-title="Compare">
  <h2>Compare</h2>
  <div class="cols-2">
    <div class="card">
      <h3>Option A</h3>
      <p>Pros and cons here.</p>
    </div>
    <div class="card">
      <h3>Option B</h3>
      <p>Pros and cons here.</p>
    </div>
  </div>
</section>
```

### Code block

```html
<section class="slide" data-deck="v1" data-section="Section C" data-title="Code">
  <h2>Code</h2>
  <pre><code>const x = 42;</code></pre>
</section>
```

For multi-line blocks the `<pre>` will scroll if needed — but it has a 100% max-height, so very long blocks will get cut. Split into multiple slides instead.

### Image / diagram

```html
<section class="slide" data-deck="v1" data-section="Section D" data-title="Diagram">
  <h2>Diagram</h2>
  <img src="diagram.png" alt="Caption here"
  style="max-width:100%; max-height:600px; object-fit:contain;">
</section>
```

Keep image alt text as a sentence — it doubles as a caption for screen readers.

### Quote / callout

```html
<section class="slide" data-deck="v1" data-section="Wrap" data-title="Quote">
  <h2>Quote</h2>
  <div class="card" style="border-left: 4px solid var(--accent);">
    <p style="font-size: 28px; font-style: italic;">"Insightful statement here."</p>
    <p class="lede">— Attribution</p>
  </div>
</section>
```

### Closing slide

```html
<section class="slide" data-deck="v1" data-section="Wrap" data-title="Thanks">
  <h1>Thanks</h1>
  <p class="lede">Questions? → your-email@example.com</p>
</section>
```

---

## Canvas limits

- Fixed **1400 × 900** stage. Slides overflow is **hidden**, not auto-shrunk.
- Recommended safe area: 90px horizontal padding × 80px vertical.
- One slide ≈ 6–8 bullets or one diagram / code block. If a slide feels dense, split it.

---

## Theming

- `data-theme="dark"` (default) and `data-theme="light"` are both fully styled via CSS variables (`--bg`, `--fg`, `--accent`, etc.).
- Use `var(--accent)` and `var(--bg-card)` rather than hard-coded colors so the theme switch keeps working.
- The ⚙ panel persists `theme` to `localStorage` under `deck-theme`.

---

## Multi-version decks (optional)

If you need the same HTML to host v1 and v2 and toggle between them, set different `data-deck` per slide:

```html
<section class="slide" data-deck="v1" ...>
<section class="slide" data-deck="v2" ...>
```

Then enable `#modeSwitcher` (currently hidden in the template). The active deck is determined by URL: `deck.html?deck=v2`. **For single-version decks leave this hidden and use `data-deck="v1"` everywhere — touching the switcher without need is the most common bug.**

---

## Editing the template itself

If you want to change default styles (font sizes, palette, transitions), edit `assets/deck-template.html`. The template is the source of truth for every deck generated with this skill — every new deck starts by copying it.