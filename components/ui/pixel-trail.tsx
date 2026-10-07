"use client";

import { cn } from "@/lib/utils";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

export interface PixelTrailProps {
  /** Width and height of each pixel in CSS pixels. */
  pixelSize?: number;
  /** Time, in milliseconds, for a pixel to fade out. Set to zero for a crisp trail. */
  fadeDuration?: number;
  /** Delay, in milliseconds, before a pixel fades. */
  delay?: number;
  className?: string;
  pixelClassName?: string;
}

/**
 * A lightweight cursor trail built with CSS grid cells and the Web Animations
 * API. It uses a ResizeObserver and React's own grid keys, so no extra motion,
 * UUID, or dimensions-hook packages are needed.
 */
const PixelTrail: React.FC<PixelTrailProps> = ({
  pixelSize = 20,
  fadeDuration = 500,
  delay = 0,
  className,
  pixelClassName,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cellsRef = useRef<(HTMLDivElement | null)[]>([]);
  const lastCellRef = useRef(-1);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const measure = () => {
      const rect = container.getBoundingClientRect();
      setDimensions((previous) => {
        const width = Math.ceil(rect.width);
        const height = Math.ceil(rect.height);
        return previous.width === width && previous.height === height
          ? previous
          : { width, height };
      });
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const columns = useMemo(
    () => Math.ceil(dimensions.width / Math.max(1, pixelSize)),
    [dimensions.width, pixelSize],
  );
  const rows = useMemo(
    () => Math.ceil(dimensions.height / Math.max(1, pixelSize)),
    [dimensions.height, pixelSize],
  );

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (event.pointerType === "touch") return;
      const rect = event.currentTarget.getBoundingClientRect();
      const col = Math.floor((event.clientX - rect.left) / pixelSize);
      const row = Math.floor((event.clientY - rect.top) / pixelSize);
      const centerIndex = row * columns + col;

      if (
        col < 0 ||
        row < 0 ||
        col >= columns ||
        row >= rows ||
        centerIndex === lastCellRef.current
      ) {
        return;
      }
      lastCellRef.current = centerIndex;

      // A small cross of delayed neighbours makes the trail feel more like a
      // brush than a single hard square while keeping work local to the cursor.
      const offsets = [
        [0, 0],
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ] as const;

      offsets.forEach(([dx, dy], index) => {
        const nextCol = col + dx;
        const nextRow = row + dy;
        if (nextCol < 0 || nextRow < 0 || nextCol >= columns || nextRow >= rows)
          return;
        const cell = cellsRef.current[nextRow * columns + nextCol];
        if (!cell) return;

        const element = cell as HTMLDivElement & {
          __pixelAnimation?: Animation;
        };
        element.__pixelAnimation?.cancel();
        element.__pixelAnimation = element.animate(
          [{ opacity: 1 }, { opacity: 0 }],
          {
            duration: Math.max(0, fadeDuration),
            delay: Math.max(0, delay) + index * 34,
            easing: "cubic-bezier(0.22, 1, 0.36, 1)",
            fill: "both",
          },
        );
      });
    },
    [columns, rows, pixelSize, fadeDuration, delay],
  );

  const pixelCount = columns * rows;

  return (
    <div
      ref={containerRef}
      className={cn("pixel-trail", className)}
      aria-hidden="true"
    >
      <div
        className="pixel-trail__grid"
        style={{
          gridTemplateColumns: `repeat(${columns}, ${Math.max(1, pixelSize)}px)`,
          gridAutoRows: `${Math.max(1, pixelSize)}px`,
        }}
        onPointerMove={handlePointerMove}
      >
        {Array.from({ length: pixelCount }, (_, index) => (
          <div
            key={index}
            ref={(node) => {
              cellsRef.current[index] = node;
            }}
            className={cn("pixel-trail__pixel", pixelClassName)}
            style={{ width: pixelSize, height: pixelSize }}
          />
        ))}
      </div>
    </div>
  );
};

export default PixelTrail;
