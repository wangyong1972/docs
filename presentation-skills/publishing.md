# Publishing

The deck is a single `.html` file — there is no build step. You have a few options depending on audience.

---

## 1. Local preview (zero setup)

Just open `deck.html` in any browser:

```bash
open deck.html                          # macOS default browser
open -a "Google Chrome" deck.html       # force Chrome
```

All features work locally — outline, theme switch, fullscreen, PDF export, deep links.

For a quick HTTP server (useful when testing `?deck=v2` query strings):

```bash
python3 -m http.server 8000 --directory .
# then visit http://127.0.0.1:8000/deck.html
```

---

## 2. Export to PDF

Two routes:

**In-browser (uses the deck's own print CSS):**
1. Click 📄 in the toolbar (or press `p`).
2. In the print dialog, choose **Save as PDF**.
3. All slides become landscape pages, one per page. Outline / toolbar / progress are hidden.

**Headless Chrome (scriptable, no UI):**

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless=new --disable-gpu --no-sandbox \
  --user-data-dir=/tmp/chrome-deck-$$ \
  --print-to-pdf=deck.pdf \
  "file://$(pwd)/deck.html"
```

If the command appears to hang, the PDF may already be on disk — check before retrying. (Sandboxed environments often leave a GoogleUpdater subprocess around.)

For per-slide PNGs (useful for embedding in chat / docs):

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless=new --disable-gpu --no-sandbox \
  --user-data-dir=/tmp/chrome-deck-$$ \
  --screenshot=/tmp/deck.png \
  --window-size=1500,980 \
  "file://$(pwd)/deck.html#1"
```

Change the `#N` to screenshot a specific slide.

---

## 3. GitHub Pages (public or private repo)

Long-lived, shareable URL.

```bash
# One-time setup
git init slides && cd slides
git checkout -b gh-pages
cp /path/to/deck.html index.html
git add index.html
git commit -m "Publish deck"
git remote add origin git@github.com:<you>/<repo>.git
git push -u origin gh-pages
```

URL: `https://<you>.github.io/<repo>/`

For a private repo, the URL is the same but viewers need repo access. GitHub Pages does not support private repos on free plans; if you need auth, use option 4.

---

## 4. Company-internal Pages / static host

If your org runs an internal GitHub Pages / Pages-equivalent (e.g. Apple internal `pages.github.<corp>.com/<user>/<repo>/`), the flow is identical to option 3, just point at the internal host.

Alternative static hosts that work the same way:

- **Netlify drop**: visit https://app.netlify.com/drop, drag `deck.html`. URL is randomly generated.
- **Vercel**: `npx vercel --prod` in the directory containing `deck.html`.
- **Cloudflare Pages**: connect a git repo or use `wrangler pages deploy .`

All of these are file-hosting; no server-side rendering needed since the deck is one file.

---

## 5. Embed in an existing site

Copy `deck.html` into your site's static directory and link to it, or `<iframe src="/slides/deck.html">` from a parent page. The iframe will need enough height — at least 700px — for the toolbar + status bar to be useful.

---

## 6. Share via chat without hosting

For ephemeral sharing, paste the file as a Slack / Lark attachment. Recipients can double-click to open in their default browser. Caveat: `file://` deep links (`#5`) only work if the recipient opens the file the same way.

For QR-code sharing of a single slide, host on any of the above first, then generate the QR for that URL.

---

## What to ask the user

Before publishing, ask:

1. **Audience** — internal team, public, or just yourself?
2. **Lifespan** — single meeting / talk (ephemeral OK) vs long-lived doc (need stable URL)?
3. **Auth needs** — anyone with the link, or behind login?
4. **PDF or HTML** — if PDF is fine, just use option 2 and skip hosting.

For ephemeral internal use, **option 1 + option 2 (PDF)** is usually enough.