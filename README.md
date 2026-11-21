# Mai Quốc Việt Profile

Personal profile website for `maiviet283.github.io`, built with Astro. Every page is pre-rendered to static HTML for SEO. Two locales are served for the home page: `/` (Vietnamese) and `/en/` (English); `/about/`, `/projects/` and the `/vietdon/` archive are Vietnamese.

## Design

A sticker-book look: warm paper, thick ink strokes, hard offset shadows and flat colour blocks (blue band, sun, tomato, mint, pink). No gradients, glow or frosted glass.

- Type: Barlow Condensed (headings) + Be Vietnam Pro (body), self-hosted via Fontsource with Vietnamese subsets.
- Mark: a round cartoon portrait drawn in SVG from the avatar (`src/lib/mascot.mjs`). The same drawing feeds the `<Mascot>` component, the favicons and the social card.
- Global tokens and shared pieces live in `src/styles/global.css`; each component keeps its own scoped styles.
- Icons: line icons in `src/components/Icon.astro`; technology logos from Simple Icons (CC0) mapped in `src/lib/tech.ts`, inlined at build time.
- Light theme by default; the toggle reveals the dark theme in a circle from the button.

## Motion

All in `src/scripts/motion.ts`, gated behind `prefers-reduced-motion`:

- opening moment on the home page, once per visit (`Preloader.astro`);
- paint-stripe page transition between internal pages;
- Lenis smooth scroll, pop-in entrances, count-up numbers, parallax stickers;
- header that tucks away while reading, progress bar, back-to-top ring;
- the mascot turns its head toward the pointer.

## Icons and social card

```bash
node scripts/gen-icons.mjs
```

Regenerates `public/favicon.*`, app icons, `logo.png` and `og-image.png` from the mascot drawing.

## Local

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Deploy

GitHub Actions builds `dist` and deploys it to GitHub Pages on every push to `main`.
