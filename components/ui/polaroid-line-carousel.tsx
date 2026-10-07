"use client";

import * as React from "react";

/*
 * Polaroid Line Carousel — instant photos pegged to a sagging string. Drag the
 * line (or use the arrows) and the prints slide along it, swinging on their
 * pegs with the speed you give them and settling back with a little
 * overshoot; even at rest they sway in a light breeze. The one in the middle
 * is the one you're looking at.
 *
 * Drag, click a print, use ←/→, or let autoplay advance the slides. Slides
 * without an `image` are painted locally, so the carousel also works offline.
 */

export type LandPalette = "dawn" | "alpine" | "dusk" | "mist";

export type Slide = {
  image?: string;
  title?: string;
  caption?: string;
  alt?: string;
  /** Palette and seed of the painted landscape used when `image` is empty. */
  palette?: LandPalette;
  seed?: number;
};

export type PolaroidLineCarouselProps = {
  slides?: Slide[];
  /** Any CSS length. Default 100svh. */
  height?: number | string;
  /** Width of a print in px (it shrinks on narrow screens). */
  cardWidth?: number;
  /** How far the string sags in the middle, px. */
  sag?: number;
  /** How much the prints swing; 0 holds them still. */
  swing?: number;
  /** ms per print; 0 turns autoplay off. It waits while someone is interacting. */
  autoplay?: number;
  /** Colour of the string and pegs. */
  string?: string;
  background?: string;
  ink?: string;
  onChange?: (index: number) => void;
  className?: string;
  style?: React.CSSProperties;
  ariaLabel?: string;
};

// #region logic
export function wrap(i: number, n: number): number {
  return n ? ((i % n) + n) % n : 0;
}

export function clamp(v: number, a: number, b: number): number {
  return Math.min(b, Math.max(a, v));
}

/** Height of a string sagging by `sag` between (0, y0) and (w, y0), at x. */
export function stringY(x: number, w: number, y0: number, sag: number): number {
  if (!w) return y0;
  const t = clamp(x / w, 0, 1);
  return y0 + 4 * sag * t * (1 - t);
}

/** One step of a critically damped spring toward target. */
export function springStep(
  x: number,
  v: number,
  target: number,
  dt: number,
  k = 70,
): [number, number] {
  const c = 2 * Math.sqrt(k);
  const nv = v + (k * (target - x) - c * v) * dt;
  return [x + nv * dt, nv];
}

/** One step of a print's swing. */
export function swingStep(
  a: number,
  w: number,
  lineVel: number,
  dt: number,
  gain: number,
): [number, number] {
  const nw = w + (-38 * a - 4.2 * w + lineVel * 0.0034 * gain) * dt;
  return [clamp(a + nw * dt, -0.6, 0.6), nw];
}

/** Index of the print nearest the centre for a line offset. */
export function nearestAt(off: number, spacing: number, n: number): number {
  return clamp(Math.round(off / spacing), 0, Math.max(0, n - 1));
}

export function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}
// #endregion logic

/* ------------------------------------------------------- painted images */

const PALETTES: Record<
  LandPalette,
  {
    top: string;
    bottom: string;
    sun: string;
    far: string;
    near: string;
    mist: string;
  }
> = {
  dawn: {
    top: "#e7b7a5",
    bottom: "#f8e8d6",
    sun: "#fff4df",
    far: "#d2b2bb",
    near: "#3a2a3b",
    mist: "255,240,232",
  },
  alpine: {
    top: "#7ea5c8",
    bottom: "#e3ecf2",
    sun: "#ffffff",
    far: "#a9bfd0",
    near: "#1c3044",
    mist: "236,244,250",
  },
  dusk: {
    top: "#2a2450",
    bottom: "#ef8d60",
    sun: "#ffd9a6",
    far: "#93607c",
    near: "#18121f",
    mist: "255,196,160",
  },
  mist: {
    top: "#c4d0cb",
    bottom: "#eef1ec",
    sun: "#ffffff",
    far: "#aebcb5",
    near: "#2c3a33",
    mist: "246,248,245",
  },
};

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hexRgb(hex: string): [number, number, number] {
  const value = parseInt(hex.replace("#", ""), 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

function mixRgb(a: string, b: string, amount: number): string {
  const A = hexRgb(a);
  const B = hexRgb(b);
  return `rgb(${A.map((value, index) => Math.round(value + (B[index] - value) * amount)).join(",")})`;
}

// A layered-ridge landscape: sky, a low sun, five ridges fading into haze,
// distant tree line, and film grain. Each image is painted once after mount.
function paintLandscape(
  seed: number,
  palette: LandPalette,
  width = 1600,
  height = 1000,
): string {
  if (typeof document === "undefined") return "";
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  const colors = PALETTES[palette] ?? PALETTES.dawn;
  const random = mulberry32(seed * 104729 + 7);
  const sky = ctx.createLinearGradient(0, 0, 0, height * 0.72);
  sky.addColorStop(0, colors.top);
  sky.addColorStop(1, colors.bottom);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, width, height);

  const sunX = width * (0.22 + random() * 0.56);
  const sunY = height * (0.26 + random() * 0.16);
  const halo = ctx.createRadialGradient(
    sunX,
    sunY,
    0,
    sunX,
    sunY,
    width * 0.45,
  );
  halo.addColorStop(0, `rgba(${hexRgb(colors.sun).join(",")},.85)`);
  halo.addColorStop(0.08, `rgba(${hexRgb(colors.sun).join(",")},.55)`);
  halo.addColorStop(1, `rgba(${hexRgb(colors.sun).join(",")},0)`);
  ctx.fillStyle = halo;
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = colors.sun;
  ctx.beginPath();
  ctx.arc(sunX, sunY, height * 0.045, 0, Math.PI * 2);
  ctx.fill();

  const layers = 5;
  for (let layer = 0; layer < layers; layer++) {
    const depth = layer / (layers - 1);
    const base = height * (0.42 + depth * 0.4);
    const amplitude = height * (0.07 + depth * 0.1);
    const phases = [random(), random(), random(), random()].map(
      (value) => value * Math.PI * 2,
    );
    const frequencies = [
      1.3 + random(),
      3.1 + random() * 2,
      7 + random() * 4,
      17 + random() * 8,
    ];
    const ridge = (x: number) => {
      const u = x / width;
      return (
        base -
        amplitude *
          (0.55 * Math.sin(u * frequencies[0] + phases[0]) +
            0.28 * Math.sin(u * frequencies[1] + phases[1]) +
            0.12 * Math.abs(Math.sin(u * frequencies[2] + phases[2])) +
            0.05 * Math.sin(u * frequencies[3] + phases[3]))
      );
    };

    const mist = ctx.createLinearGradient(
      0,
      base - amplitude * 1.4,
      0,
      base + amplitude * 0.4,
    );
    mist.addColorStop(0, `rgba(${colors.mist},0)`);
    mist.addColorStop(
      1,
      `rgba(${colors.mist},${(0.55 - depth * 0.35).toFixed(2)})`,
    );
    ctx.fillStyle = mist;
    ctx.fillRect(0, base - amplitude * 1.4, width, amplitude * 1.8);

    const body = ctx.createLinearGradient(0, base - amplitude, 0, height);
    body.addColorStop(0, mixRgb(colors.far, colors.near, Math.pow(depth, 1.3)));
    body.addColorStop(
      1,
      mixRgb(colors.far, colors.near, Math.min(1, Math.pow(depth, 1.3) + 0.18)),
    );
    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.moveTo(0, height);
    for (let x = 0; x <= width; x += 6) ctx.lineTo(x, ridge(x));
    ctx.lineTo(width, height);
    ctx.closePath();
    ctx.fill();

    if (layer >= layers - 2) {
      ctx.fillStyle = mixRgb(
        colors.far,
        colors.near,
        Math.min(1, Math.pow(depth, 1.3) + 0.08),
      );
      for (let x = 0; x < width; x += 7 + random() * 9) {
        if (random() < 0.35) continue;
        const y = ridge(x) + 2;
        const treeHeight = height * (0.025 + random() * 0.035) * (0.6 + depth);
        const treeWidth = treeHeight * 0.32;
        ctx.beginPath();
        ctx.moveTo(x, y - treeHeight);
        ctx.lineTo(x + treeWidth, y);
        ctx.lineTo(x - treeWidth, y);
        ctx.closePath();
        ctx.fill();
      }
    }
  }

  const vignette = ctx.createRadialGradient(
    width / 2,
    height * 0.45,
    height * 0.3,
    width / 2,
    height / 2,
    width * 0.78,
  );
  vignette.addColorStop(0, "rgba(0,0,0,0)");
  vignette.addColorStop(1, "rgba(0,0,0,.32)");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, width, height);

  const grain = ctx.getImageData(0, 0, width, height);
  for (let index = 0; index < grain.data.length; index += 4) {
    const value = (random() - 0.5) * 14;
    grain.data[index] += value;
    grain.data[index + 1] += value;
    grain.data[index + 2] += value;
  }
  ctx.putImageData(grain, 0, 0);
  return canvas.toDataURL("image/jpeg", 0.88);
}

const DEFAULT_SLIDES: Slide[] = [
  {
    title: "First Light",
    caption: "Haze lifting off the eastern ridges.",
    palette: "dawn",
    seed: 3,
  },
  {
    title: "High Pass",
    caption: "Cold air, clear to the far range.",
    palette: "alpine",
    seed: 8,
  },
  {
    title: "Ember Hour",
    caption: "The last of the sun on the valley floor.",
    palette: "dusk",
    seed: 14,
  },
  {
    title: "Still Valley",
    caption: "Morning mist that never quite lifts.",
    palette: "mist",
    seed: 21,
  },
  {
    title: "Rose Ridge",
    caption: "Five ridges, one long exhale.",
    palette: "dawn",
    seed: 34,
  },
  {
    title: "Blue Hour",
    caption: "Pines going dark against the snow.",
    palette: "alpine",
    seed: 55,
  },
];

function useSlideImages(slides: Slide[]): string[] {
  const key = slides
    .map(
      (slide) => slide.image || `${slide.palette || "dawn"}:${slide.seed ?? 1}`,
    )
    .join("|");
  const [painted, setPainted] = React.useState(() => slides.map(() => ""));

  React.useEffect(() => {
    setPainted(
      slides.map((slide, index) =>
        slide.image
          ? ""
          : paintLandscape(slide.seed ?? index + 1, slide.palette || "dawn"),
      ),
    );
    // The stable key represents all inputs used to paint the images.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return slides.map((slide, index) => slide.image || painted[index] || "");
}

const PL_CSS = String.raw`
.pl-root{position:relative;width:100%;overflow:hidden;background:var(--pl-bg);color:var(--pl-ink);user-select:none;-webkit-user-select:none;touch-action:pan-y;outline:none;cursor:grab}
.pl-root[data-drag='1']{cursor:grabbing}
.pl-root:focus-visible{box-shadow:inset 0 0 0 2px var(--pl-ink)}
.pl-string{position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none;overflow:visible;display:block}
.pl-card{position:absolute;left:0;top:0;width:var(--pl-cw);transform-origin:50% 0;will-change:transform;cursor:inherit}
.pl-print{margin-top:10px;background:#fbfaf7;padding:10px 10px 0;box-shadow:0 1px 2px rgba(0,0,0,.12),0 18px 30px -16px rgba(0,0,0,.4);transition:transform .5s cubic-bezier(.2,.7,.2,1),filter .5s ease}
.pl-card[data-on='0'] .pl-print{transform:scale(.9);filter:saturate(.7) brightness(.96)}
.pl-shot{position:relative;aspect-ratio:1;overflow:hidden;background:#d9d5cc}
.pl-shot img{position:absolute;inset:0;width:100%;height:100%;max-width:none;object-fit:cover;display:block;pointer-events:none}
.pl-note{height:46px;display:flex;align-items:center;justify-content:center;padding:0 6px;font:italic 400 15px/1.1 ui-serif,Georgia,'Times New Roman',serif;color:#3b3833;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.pl-peg{position:absolute;left:50%;top:0;width:10px;height:26px;margin-left:-5px;border-radius:2px;background:linear-gradient(90deg,#c9a67a,#e3c9a1 45%,#b8915f);box-shadow:0 2px 3px rgba(0,0,0,.25)}
.pl-peg::after{content:'';position:absolute;left:4px;top:8px;width:2px;height:7px;background:rgba(80,60,30,.45);border-radius:1px}
.pl-bar{position:absolute;left:clamp(16px,4vw,56px);right:clamp(16px,4vw,56px);bottom:clamp(20px,4vh,40px);display:flex;align-items:center;gap:clamp(12px,2vw,24px);cursor:default}
.pl-cap{flex:1;min-width:0;overflow:hidden;padding-bottom:.15em}
.pl-cap>*{display:block;animation:pl-in .55s cubic-bezier(.2,.8,.2,1) both}
.pl-title{font:500 clamp(18px,2.2vw,26px)/1.15 ui-serif,Georgia,'Times New Roman',serif;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.pl-sub{margin-top:4px;font:400 13px/1.4 ui-sans-serif,system-ui,sans-serif;color:var(--pl-muted)}
.pl-count{font:500 12px/1 ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.14em;color:var(--pl-muted);white-space:nowrap}
.pl-count b{color:var(--pl-ink);font-weight:500}
.pl-btn{appearance:none;flex:none;width:40px;height:40px;border-radius:50%;border:1px solid var(--pl-line);background:transparent;color:inherit;display:grid;place-items:center;cursor:pointer;transition:background .2s ease,color .2s ease}
.pl-btn:hover{background:var(--pl-ink);color:var(--pl-bg)}
.pl-btn:focus-visible{outline:2px solid var(--pl-ink);outline-offset:2px}
.pl-sr{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
@keyframes pl-in{from{transform:translateY(100%);opacity:0}to{transform:none;opacity:1}}
@media(max-width:600px){.pl-bar{left:16px;right:16px;gap:8px}.pl-sub{display:none}.pl-btn{width:36px;height:36px}.pl-count{font-size:10px}.pl-root{touch-action:pan-y}}
@media (prefers-reduced-motion:reduce){.pl-cap>*{animation:none}.pl-print{transition:none}}
`;

export default function PolaroidLineCarousel({
  slides = DEFAULT_SLIDES,
  height = "100svh",
  cardWidth = 300,
  sag = 46,
  swing = 1,
  autoplay = 4500,
  string = "#8a7f72",
  background = "var(--color-background, #efece6)",
  ink = "var(--color-foreground, #161513)",
  onChange,
  className,
  style,
  ariaLabel = "Image carousel",
}: PolaroidLineCarouselProps) {
  const count = slides.length;
  const sources = useSlideImages(slides);
  const [paintedFallbacks, setPaintedFallbacks] = React.useState<
    Record<number, string>
  >({});
  const [active, setActive] = React.useState(0);
  const [dragging, setDragging] = React.useState(false);
  const [size, setSize] = React.useState({ w: 1200, h: 800, cw: cardWidth });
  const rootRef = React.useRef<HTMLDivElement>(null);
  const pathRef = React.useRef<SVGPathElement>(null);
  const cards = React.useRef<(HTMLDivElement | null)[]>([]);
  const sim = React.useRef({
    off: 0,
    vel: 0,
    target: 0,
    a: [] as number[],
    w: [] as number[],
  });
  const drag = React.useRef<null | {
    x: number;
    off: number;
    lx: number;
    lt: number;
    v: number;
    moved: boolean;
  }>(null);
  const lastTouch = React.useRef(0);
  const activeRef = React.useRef(0);
  const opts = React.useRef({ sag, swing });
  opts.current = { sag, swing };

  const spacing = size.cw * 1.08;
  const goTo = React.useCallback(
    (index: number) => {
      if (!count) return;
      sim.current.target = clamp(index, 0, count - 1) * spacing;
    },
    [count, spacing],
  );

  React.useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const measure = () => {
      const rect = root.getBoundingClientRect();
      const next = {
        w: rect.width,
        h: rect.height,
        cw: Math.round(
          Math.max(
            150,
            Math.min(cardWidth, rect.width * 0.42, rect.height * 0.42),
          ),
        ),
      };
      setSize((previous) =>
        previous.w === next.w &&
        previous.h === next.h &&
        previous.cw === next.cw
          ? previous
          : next,
      );
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(root);
    return () => observer.disconnect();
  }, [cardWidth]);

  // Keep the spring centered on the active print when card spacing changes.
  React.useEffect(() => {
    const safeActive = Math.min(activeRef.current, Math.max(0, count - 1));
    activeRef.current = safeActive;
    sim.current.target = safeActive * spacing;
    sim.current.off = safeActive * spacing;
  }, [spacing, count]);

  React.useEffect(() => {
    onChange?.(active);
  }, [active, onChange]);

  // The simulation writes transforms directly to the cards for a smooth drag.
  React.useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    let visible = true;
    let raf = 0;
    let previousTime = performance.now();
    const simulation = sim.current;

    const frame = (now: number) => {
      raf = 0;
      if (!visible) return;
      const dt = Math.min(0.033, (now - previousTime) / 1000);
      previousTime = now;
      const { w, h, cw } = size;
      const y0 = Math.max(40, h * 0.2);
      const currentDrag = drag.current;
      let lineVelocity: number;

      if (currentDrag?.moved) {
        lineVelocity = currentDrag.v * 1000;
      } else {
        const before = simulation.off;
        [simulation.off, simulation.vel] = springStep(
          simulation.off,
          simulation.vel,
          simulation.target,
          dt,
        );
        lineVelocity = -(simulation.off - before) / Math.max(dt, 1e-3);
      }

      const options = opts.current;
      const gain = reduceMotion ? 0 : options.swing;
      const nearest = nearestAt(simulation.off, spacing, count);

      for (let index = 0; index < count; index++) {
        const card = cards.current[index];
        if (!card) continue;
        const x = w / 2 + index * spacing - simulation.off;
        if (x < -cw * 1.5 || x > w + cw * 1.5) {
          card.style.visibility = "hidden";
          continue;
        }

        card.style.visibility = "visible";
        let angle = simulation.a[index] || 0;
        let angularVelocity = simulation.w[index] || 0;
        [angle, angularVelocity] = swingStep(
          angle,
          angularVelocity,
          lineVelocity,
          dt,
          gain,
        );
        if (gain) angle += Math.sin(now / 1300 + index * 1.7) * 0.0009 * gain;
        simulation.a[index] = angle;
        simulation.w[index] = angularVelocity;

        const y = stringY(x, w, y0, options.sag) - 6;
        card.style.transform = `translate(${(x - cw / 2).toFixed(1)}px,${y.toFixed(1)}px) rotate(${angle.toFixed(4)}rad)`;
        card.style.zIndex = String(
          index === nearest ? count + 1 : count - Math.abs(index - nearest),
        );
      }

      pathRef.current?.setAttribute(
        "d",
        `M0 ${y0} Q${w / 2} ${y0 + 2 * options.sag} ${w} ${y0}`,
      );
      if (nearest !== activeRef.current) {
        activeRef.current = nearest;
        setActive(nearest);
      }
      raf = window.requestAnimationFrame(frame);
    };

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !raf) {
        previousTime = performance.now();
        raf = window.requestAnimationFrame(frame);
      }
    });

    observer.observe(root);
    raf = window.requestAnimationFrame(frame);
    return () => {
      window.cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, [size, spacing, count]);

  // Autoplay pauses briefly after any user input and while the tab is hidden.
  React.useEffect(() => {
    if (!autoplay || count < 2) return;
    const timer = window.setInterval(() => {
      if (
        document.hidden ||
        drag.current ||
        performance.now() - lastTouch.current < autoplay
      )
        return;
      goTo(activeRef.current >= count - 1 ? 0 : activeRef.current + 1);
    }, autoplay);
    return () => window.clearInterval(timer);
  }, [autoplay, count, goTo]);

  const onDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 || (event.target as HTMLElement).closest(".pl-bar"))
      return;
    lastTouch.current = performance.now();
    drag.current = {
      x: event.clientX,
      off: sim.current.off,
      lx: event.clientX,
      lt: event.timeStamp,
      v: 0,
      moved: false,
    };
  };

  const onMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const currentDrag = drag.current;
    if (!currentDrag) return;
    const dx = event.clientX - currentDrag.x;

    if (!currentDrag.moved && Math.abs(dx) > 5) {
      currentDrag.moved = true;
      setDragging(true);
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    if (!currentDrag.moved) return;

    const dt = Math.max(1, event.timeStamp - currentDrag.lt);
    currentDrag.v =
      0.7 * ((event.clientX - currentDrag.lx) / dt) + 0.3 * currentDrag.v;
    currentDrag.lx = event.clientX;
    currentDrag.lt = event.timeStamp;

    const maxOffset = Math.max(0, (count - 1) * spacing);
    let offset = currentDrag.off - dx;
    if (offset < 0) offset *= 0.35;
    if (offset > maxOffset) offset = maxOffset + (offset - maxOffset) * 0.35;
    sim.current.off = offset;
  };

  const onUp = (event: React.PointerEvent<HTMLDivElement>) => {
    const currentDrag = drag.current;
    drag.current = null;
    lastTouch.current = performance.now();
    if (!currentDrag) return;

    if (currentDrag.moved) {
      setDragging(false);
      sim.current.vel = -currentDrag.v * 1000;
      goTo(nearestAt(sim.current.off - currentDrag.v * 180, spacing, count));
      return;
    }

    const card = (event.target as HTMLElement).closest("[data-i]");
    if (card) goTo(Number(card.getAttribute("data-i")));
  };

  const step = (direction: number) => {
    lastTouch.current = performance.now();
    goTo(clamp(activeRef.current + direction, 0, count - 1));
  };

  const onKey = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowRight") step(1);
    else if (event.key === "ArrowLeft") step(-1);
    else return;
    event.preventDefault();
  };

  // If a remote photo cannot load (offline, blocked host, bad URL) the print
  // falls back to a locally painted landscape rather than an empty square.
  const handleImageError = (index: number, slide: Slide) => {
    setPaintedFallbacks((previous) =>
      previous[index]
        ? previous
        : {
            ...previous,
            [index]: paintLandscape(
              slide.seed ?? index + 1,
              slide.palette || "dawn",
            ),
          },
    );
  };

  const currentSlide = slides[active] || {};

  return (
    <div
      ref={rootRef}
      className={["pl-root", className].filter(Boolean).join(" ")}
      style={{
        height,
        ["--pl-bg" as string]: background,
        ["--pl-ink" as string]: ink,
        ["--pl-muted" as string]:
          "color-mix(in srgb, var(--pl-ink) 55%, transparent)",
        ["--pl-line" as string]:
          "color-mix(in srgb, var(--pl-ink) 18%, transparent)",
        ["--pl-cw" as string]: `${size.cw}px`,
        ...style,
      }}
      data-drag={dragging ? "1" : "0"}
      role="region"
      aria-roledescription="carousel"
      aria-label={ariaLabel}
      tabIndex={0}
      onKeyDown={onKey}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
    >
      <style>{PL_CSS}</style>
      <svg className="pl-string" aria-hidden="true">
        <path
          ref={pathRef}
          fill="none"
          stroke={string}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
      {slides.map((slide, index) => {
        const image = paintedFallbacks[index] || sources[index];
        return (
          <div
            key={`${slide.title || "slide"}-${index}`}
            className="pl-card"
            data-i={index}
            data-on={index === active ? "1" : "0"}
            ref={(element) => {
              cards.current[index] = element;
            }}
            aria-hidden={index === active ? undefined : true}
          >
            <div className="pl-print">
              <div className="pl-shot">
                {image ? (
                  <img
                    src={image}
                    alt={slide.alt || slide.title || ""}
                    draggable={false}
                    onError={() => handleImageError(index, slide)}
                  />
                ) : null}
              </div>
              <div className="pl-note">{slide.title || ""}</div>
            </div>
            <div className="pl-peg" />
          </div>
        );
      })}
      <div className="pl-bar">
        <div className="pl-cap" key={active} aria-hidden="true">
          {currentSlide.title ? (
            <span className="pl-title">{currentSlide.title}</span>
          ) : null}
          {currentSlide.caption ? (
            <span className="pl-sub">{currentSlide.caption}</span>
          ) : null}
        </div>
        <span className="pl-count" aria-hidden="true">
          <b>{pad2(active + 1)}</b> / {pad2(count)}
        </span>
        <button
          type="button"
          className="pl-btn"
          aria-label="Previous slide"
          onClick={() => step(-1)}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
          >
            <path d="M10 3 5 8l5 5" stroke="currentColor" strokeWidth="1.4" />
          </svg>
        </button>
        <button
          type="button"
          className="pl-btn"
          aria-label="Next slide"
          onClick={() => step(1)}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
          >
            <path d="m6 3 5 5-5 5" stroke="currentColor" strokeWidth="1.4" />
          </svg>
        </button>
      </div>
      <div className="pl-sr" aria-live="polite">
        {`Print ${active + 1} of ${count}${currentSlide.title ? `: ${currentSlide.title}` : ""}`}
      </div>
    </div>
  );
}
