# Motion & Form — a type-led portfolio

A Next.js (App Router) portfolio that showcases four interactive UI components. Everything
was scaffolded from scratch in this repo with **Tailwind CSS v4**, **TypeScript**, and the
**shadcn/ui project structure**, then the components were adapted to fit the page.

## Stack

| Piece        | Version | Notes                                                    |
| ------------ | ------- | -------------------------------------------------------- |
| Next.js      | 16      | App Router, Turbopack, `app/` directory                   |
| React        | 19      | `next/font`-free, system + web-safe font stacks           |
| TypeScript   | 5.9     | `strict` mode, `@/*` path alias                           |
| Tailwind CSS | 4       | CSS-first config via `@import "tailwindcss"` + `@theme`   |
| GSAP         | 3.15    | `CustomEase` for the fullscreen navigation                |
| lucide-react | latest  | All interface icons                                       |

Extra runtime helpers: `clsx` + `tailwind-merge` (`cn()` in `lib/utils.ts`) and
`tw-animate-css` (shadcn's animation utilities).

## Project structure

```
app/
  globals.css   # Tailwind import, @theme tokens, the shadcn :root variables, page styles
  layout.tsx
  page.tsx      # the portfolio page that composes all four components
components/
  ui/           # ← the default shadcn component folder
    animated-links.tsx
    cursor-driven-particle-typography.tsx
    pixel-trail.tsx + pixel-trail.css
    polaroid-line-carousel.tsx
    sterling-gate-kinetic-navigation.tsx + .css
lib/
  utils.ts      # cn()
components.json # shadcn CLI config (aliases: @/components, @/components/ui, @/lib/utils)
```

`components.json` already points the CLI at `@/components/ui` and `app/globals.css`, so
`npx shadcn@latest add <component>` drops new primitives into `components/ui/` next to
these. The `components/ui` folder is the shadcn contract: the CLI, the docs, and every
copy-pasted snippet assume it, so keeping it avoids rewrites when you add or update
components.

## Getting started

```bash
npm install     # installs every dependency listed in package.json
npm run dev     # http://localhost:3000 (bound to 0.0.0.0 for the sandbox preview)
npm run build   # production build
npm run typecheck
```

If you are starting from an empty folder instead of this checkout:

```bash
npx create-next-app@latest my-app --ts --tailwind --app --eslint --src-dir=false
cd my-app
npx shadcn@latest init       # writes components.json, lib/utils.ts and the CSS variables
npx shadcn@latest add button # smoke-test that the CLI writes to components/ui
npm install gsap             # the only extra runtime dependency these components need
```

## The components

### 1. `sterling-gate-kinetic-navigation.tsx`

A full-screen kinetic menu: three colour panels sweep in, the nav links rise into place
with a stagger, and each link reveals an animated abstract shape behind the overlay.
Built with GSAP (`CustomEase`) plus a scoped stylesheet.

**Props:** `brand?: string`, `links?: { label: string; href: string; shape?: number }[]`.

Key adaptations from the source snippet:

- All selectors are scoped to the component's own root (`containerRef`), so nothing leaks
  into the rest of the page and two navs can coexist.
- An inline SVG wordmark replaces the empty `<a class="nav-logo-row">`.
- The overlay starts with `display: none` on the server and is animated open on demand —
  which removes the "flash of menu on first paint" the original had.
- `Esc`, the overlay, the close button, and picking a link all close the menu; body scroll
  is locked while it is open.

### 2. `polaroid-line-carousel.tsx`

Instant photos pegged to a sagging string. Drag the line (or use the arrow buttons) and the
prints slide along it, swinging on their pegs; the print nearest the middle is the active
one. The physics is hand-rolled spring/swing integration written straight to the DOM each
frame, so no animation library is required.

**Props:** `slides`, `height`, `cardWidth`, `sag`, `swing`, `autoplay`, `string`,
`background`, `ink`, `onChange`, `className`, `style`, `ariaLabel`.

Key adaptations:

- The CSS lives in a `String.raw` template constant instead of a broken string literal, so
  the component is self-contained and correct on first render.
- Added `wrap`/`clamp` helpers, a `ResizeObserver`-based measurement (no SSR warnings),
  `IntersectionObserver` pausing, keyboard (`←`/`→`) support, visible focus styles, and an
  `aria-live` announcement of the current print.
- Slides without an `image` are painted locally into a `<canvas>` (layered ridges, sun,
  haze, grain). If a remote image fails to load, the print falls back to one of those
  painted landscapes instead of an empty square — so the carousel works fully offline.

### 3. `cursor-driven-particle-typography.tsx`

Text that is rasterised on a canvas and redrawn as thousands of particles which scatter
away from the cursor and spring back into place.

**Props:** `text`, `fontSize`, `fontFamily`, `particleSize`, `particleDensity`,
`dispersionStrength`, `returnSpeed`, `color`, `className`.

Key adaptations:

- The canvas is measured from its container (`ResizeObserver`) instead of relying on a
  Tailwind `min-h-[400px]` and a one-shot 100 ms timer, which caused layout jumps.
- Font size is clamped to the container and shrunk if the string is wider than the canvas,
  so long words no longer run off the edge.
- Device pixel ratio is applied (capped at 2) and the font re-measure runs after
  `document.fonts.ready`, so the particle field is crisp and matches the loaded font.
- `prefers-reduced-motion` renders a static particle version of the text.

### 4. `pixel-trail.tsx`

A cursor trail that recolours a grid of pixels as the pointer moves.

**Props:** `pixelSize`, `fadeDuration`, `delay`, `className`, `pixelClassName`.

Key adaptations (dependency-free rewrite of the Framer/Motion original):

- No `motion`, `uuid`, or `use-dimensions` packages: the grid is a CSS grid sized by a
  `ResizeObserver` and each cell is animated with the Web Animations API.
- Cell count is derived from the measured container, so it never renders a huge blank grid
  on the server.
- The trail paints a small cross of delayed neighbours around the cursor, which reads more
  like a brush than a single square.
- `pointer-events` are scoped: the layer captures moves underneath the page content
  (`pointer-events: none` on wrappers, `auto` on the layer) and ignores touch input.

### 5. `animated-links.tsx`

Five animated link treatments (`Link000`–`Link005`) plus a `Skiper40` stand-alone demo.
Ported from the Next.js-`Link`-based source to framework-agnostic `<a>`/`<Link>` usage,
with the repeated arrow SVG extracted into a single constant.

## Image assets

The carousel uses six known-good Unsplash photo IDs (`images.unsplash.com/photo-…`). To use
your own work, replace the `image` fields on `selectedSlides` in `app/page.tsx` and drop the
`unsplash()` helper.

## Accessibility & performance notes

- Every interactive element is a real `<button>`/`<a>` with an accessible name; the
  fullscreen menu exposes `aria-expanded`/`aria-controls` and locks body scroll.
- The hero canvas is decorative (`role="img"` with a label) and the carousel announces
  changes politely.
- All animation respects `prefers-reduced-motion`.
- Only the hero and the carousel animate per frame, and both pause when scrolled out of
  view or when the tab is hidden.

## Credits

- Polaroid line carousel and cursor-driven particle typography are adapted from the
  snippets supplied with the brief.
- Animated links are adapted from Skiper UI's "Skiper 40 Animated Link"
  (author: [@gurvinder-singh02](https://x.com/Gur__vi)) — attribution required for the free
  version.
- Pixel trail is adapted from Fancy Components' `pixel-trail`.
