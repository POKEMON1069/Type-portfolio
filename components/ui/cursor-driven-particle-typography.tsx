"use client";

import { cn } from "@/lib/utils";
import React, { useEffect, useRef } from "react";

export interface CursorDrivenParticleTypographyProps {
  /** Additional CSS classes */
  className?: string;
  /** The text to render */
  text: string;
  /** Font size in CSS pixels */
  fontSize?: number;
  /** Font family used by the canvas text sampler */
  fontFamily?: string;
  /** Radius of each particle in CSS pixels */
  particleSize?: number;
  /** Distance between samples; a lower value creates more particles */
  particleDensity?: number;
  /** How strongly the cursor pushes particles away */
  dispersionStrength?: number;
  /** Speed at which particles return to their origin */
  returnSpeed?: number;
  /** Custom color for particles; defaults to the inherited text color */
  color?: string;
}

class Particle {
  x: number;
  y: number;
  readonly originX: number;
  readonly originY: number;
  vx: number;
  vy: number;
  readonly size: number;
  readonly color: string;
  readonly dispersion: number;
  readonly returnSpd: number;

  constructor(
    x: number,
    y: number,
    size: number,
    color: string,
    dispersion: number,
    returnSpd: number,
  ) {
    this.x = x + (Math.random() - 0.5) * 10;
    this.y = y + (Math.random() - 0.5) * 10;
    this.originX = x;
    this.originY = y;
    this.vx = (Math.random() - 0.5) * 5;
    this.vy = (Math.random() - 0.5) * 5;
    this.size = size;
    this.color = color;
    this.dispersion = dispersion;
    this.returnSpd = returnSpd;
  }

  update(mouseX: number, mouseY: number) {
    const dx = mouseX - this.x;
    const dy = mouseY - this.y;
    const distance = Math.hypot(dx, dy);
    const interactionRadius = 120;

    if (distance > 0 && distance < interactionRadius && mouseX > -999) {
      const force = (interactionRadius - distance) / interactionRadius;
      this.vx -= (dx / distance) * force * this.dispersion;
      this.vy -= (dy / distance) * force * this.dispersion;
    }

    this.vx += (this.originX - this.x) * this.returnSpd;
    this.vy += (this.originY - this.y) * this.returnSpd;
    this.vx *= 0.85;
    this.vy *= 0.85;

    const distanceFromOrigin = Math.hypot(
      this.x - this.originX,
      this.y - this.originY,
    );
    if (distanceFromOrigin < 1 && Math.random() > 0.97) {
      this.vx += (Math.random() - 0.5) * 0.16;
      this.vy += (Math.random() - 0.5) * 0.16;
    }

    this.x += this.vx;
    this.y += this.vy;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

export function CursorDrivenParticleTypography({
  className,
  text,
  fontSize = 120,
  fontFamily = "Inter, Arial, sans-serif",
  particleSize = 1.5,
  particleDensity = 6,
  dispersionStrength = 15,
  returnSpeed = 0.08,
  color,
}: CursorDrivenParticleTypographyProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    const ctx = canvas?.getContext("2d", { willReadFrequently: true });
    if (!canvas || !container || !ctx) return;

    let animationFrameId = 0;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let particles: Particle[] = [];
    let mouseX = -1000;
    let mouseY = -1000;
    let disposed = false;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const initialize = () => {
      const bounds = container.getBoundingClientRect();
      width = Math.max(1, Math.round(bounds.width));
      height = Math.max(1, Math.round(bounds.height));
      // A small cap keeps the canvas sampler affordable on very high-DPI displays.
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const textColor =
        color || window.getComputedStyle(container).color || "#000000";
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = textColor;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      let effectiveFontSize = Math.min(fontSize, width * 0.15, height * 0.76);
      ctx.font = `700 ${effectiveFontSize}px ${fontFamily}`;
      const measuredWidth = ctx.measureText(text).width;
      if (measuredWidth > width * 0.9) {
        effectiveFontSize *= (width * 0.9) / measuredWidth;
        ctx.font = `700 ${effectiveFontSize}px ${fontFamily}`;
      }
      ctx.fillText(text, width / 2, height / 2);

      const textPixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const sampleStep = Math.max(
        1,
        Math.floor(Math.max(1, particleDensity) * dpr),
      );
      const nextParticles: Particle[] = [];

      for (let y = 0; y < textPixels.height; y += sampleStep) {
        for (let x = 0; x < textPixels.width; x += sampleStep) {
          const alphaIndex = (y * textPixels.width + x) * 4 + 3;
          if (textPixels.data[alphaIndex] > 128) {
            nextParticles.push(
              new Particle(
                x / dpr,
                y / dpr,
                particleSize,
                textColor,
                dispersionStrength,
                returnSpeed,
              ),
            );
          }
        }
      }

      particles = nextParticles;
      ctx.clearRect(0, 0, width, height);
      if (reduceMotion) {
        particles.forEach((particle) => {
          particle.x = particle.originX;
          particle.y = particle.originY;
          particle.draw(ctx);
        });
      }
    };

    const animate = () => {
      animationFrameId = 0;
      if (disposed || reduceMotion) return;
      ctx.clearRect(0, 0, width, height);
      for (const particle of particles) {
        particle.update(mouseX, mouseY);
        particle.draw(ctx);
      }
      animationFrameId = window.requestAnimationFrame(animate);
    };

    const scheduleAnimation = () => {
      if (!reduceMotion && !animationFrameId) {
        animationFrameId = window.requestAnimationFrame(animate);
      }
    };

    const handlePointerMove = (event: PointerEvent) => {
      const bounds = canvas.getBoundingClientRect();
      mouseX = event.clientX - bounds.left;
      mouseY = event.clientY - bounds.top;
    };
    const resetPointer = () => {
      mouseX = -1000;
      mouseY = -1000;
    };

    initialize();
    scheduleAnimation();

    const resizeObserver = new ResizeObserver(() => {
      initialize();
      scheduleAnimation();
    });
    resizeObserver.observe(container);

    const themeObserver = new MutationObserver(() => {
      initialize();
      scheduleAnimation();
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "style"],
    });

    canvas.addEventListener("pointermove", handlePointerMove);
    canvas.addEventListener("pointerleave", resetPointer);

    let fontDisposed = false;
    void document.fonts?.ready.then(() => {
      if (!fontDisposed && !disposed) {
        initialize();
        scheduleAnimation();
      }
    });

    return () => {
      disposed = true;
      fontDisposed = true;
      resizeObserver.disconnect();
      themeObserver.disconnect();
      canvas.removeEventListener("pointermove", handlePointerMove);
      canvas.removeEventListener("pointerleave", resetPointer);
      if (animationFrameId) window.cancelAnimationFrame(animationFrameId);
    };
  }, [
    text,
    fontSize,
    fontFamily,
    particleSize,
    particleDensity,
    dispersionStrength,
    returnSpeed,
    color,
  ]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "particle-type w-full flex items-center justify-center",
        className,
      )}
      role="img"
      aria-label={text}
    >
      <canvas
        ref={canvasRef}
        className="block h-full w-full"
        aria-hidden="true"
      />
    </div>
  );
}
