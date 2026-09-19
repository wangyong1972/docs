# deck-source — data-juicer

Regenerates `../deck.pptx` (editable, 16:9 PowerPoint).

```bash
npm install        # installs pptxgenjs
npm run build      # writes ../deck.pptx
```

Shared visual system: `../../_shared/deck-kit.cjs` (navy/slate base + one accent per deck, Cambria headings + Calibri body). Speaker notes carry the per-slide source citations; the full claim-by-claim verification table lives in `../sources.md`.
