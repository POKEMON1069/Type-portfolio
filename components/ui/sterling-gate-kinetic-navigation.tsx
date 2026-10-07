"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";

if (typeof window !== "undefined") {
  gsap.registerPlugin(CustomEase);
}

export type SterlingNavigationLink = {
  label: string;
  href: string;
  /** Selects one of the animated ambient shapes (1–5). */
  shape?: number;
};

export type SterlingGateKineticNavigationProps = {
  brand?: string;
  links?: SterlingNavigationLink[];
};

const DEFAULT_LINKS: SterlingNavigationLink[] = [
  { label: "The approach", href: "#about", shape: 1 },
  { label: "Selected work", href: "#work", shape: 2 },
  { label: "Practice", href: "#practice", shape: 3 },
  { label: "Get in touch", href: "#contact", shape: 4 },
];

export function SterlingGateKineticNavigation({
  brand = "PORTFOLIO",
  links = DEFAULT_LINKS,
}: SterlingGateKineticNavigationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Add scoped hover/focus listeners for the ambient shapes behind each link.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    try {
      if (!gsap.parseEase("sterling-main")) {
        CustomEase.create("sterling-main", "0.65, 0.01, 0.05, 0.99");
      }
    } catch (error) {
      console.warn(
        "CustomEase failed to load; using a standard ease instead.",
        error,
      );
    }

    const shapesContainer = container.querySelector<HTMLElement>(
      ".ambient-background-shapes",
    );
    const items = container.querySelectorAll<HTMLElement>(
      ".menu-list-item[data-shape]",
    );
    const cleanups: Array<() => void> = [];

    items.forEach((item) => {
      const shapeIndex = item.getAttribute("data-shape");
      const shape = shapesContainer?.querySelector<SVGElement>(
        `.bg-shape-${shapeIndex}`,
      );
      if (!shape) return;
      const shapeElements =
        shape.querySelectorAll<SVGElement>(".shape-element");

      const onEnter = () => {
        shapesContainer
          ?.querySelectorAll(".bg-shape")
          .forEach((element) => element.classList.remove("active"));
        shape.classList.add("active");
        gsap.killTweensOf(shapeElements);
        gsap.fromTo(
          shapeElements,
          {
            scale: 0.5,
            autoAlpha: 0,
            rotation: -10,
            transformOrigin: "50% 50%",
          },
          {
            scale: 1,
            autoAlpha: 1,
            rotation: 0,
            duration: 0.6,
            stagger: 0.08,
            ease: "back.out(1.7)",
            overwrite: "auto",
          },
        );
      };

      const onLeave = () => {
        gsap.to(shapeElements, {
          scale: 0.8,
          autoAlpha: 0,
          duration: 0.3,
          ease: "power2.in",
          overwrite: "auto",
          onComplete: () => shape.classList.remove("active"),
        });
      };

      item.addEventListener("mouseenter", onEnter);
      item.addEventListener("mouseleave", onLeave);
      item.addEventListener("focusin", onEnter);
      item.addEventListener("focusout", onLeave);
      cleanups.push(() => {
        item.removeEventListener("mouseenter", onEnter);
        item.removeEventListener("mouseleave", onLeave);
        item.removeEventListener("focusin", onEnter);
        item.removeEventListener("focusout", onLeave);
        gsap.killTweensOf(shapeElements);
      });
    });

    return () => cleanups.forEach((cleanup) => cleanup());
  }, []);

  // Animate the full-screen menu in and out. Everything is scoped to this nav.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const navWrap = container.querySelector<HTMLElement>(
      ".nav-overlay-wrapper",
    );
    const menu = container.querySelector<HTMLElement>(".menu-content");
    const overlay = container.querySelector<HTMLElement>(".overlay");
    const backgroundPanels =
      container.querySelectorAll<HTMLElement>(".backdrop-layer");
    const menuLinks = container.querySelectorAll<HTMLElement>(".nav-link");
    const fadeTargets =
      container.querySelectorAll<HTMLElement>("[data-menu-fade]");
    const menuButton = container.querySelector<HTMLElement>(".nav-close-btn");
    const menuButtonTexts = Array.from(menuButton?.querySelectorAll("p") ?? []);
    const menuButtonIcon: Element[] = menuButton
      ? [menuButton.querySelector<SVGElement>(".menu-button-icon")].filter(
          (element): element is SVGElement => Boolean(element),
        )
      : [];
    if (!navWrap || !menu) return;

    let ease = "power2.out";
    try {
      if (!gsap.parseEase("sterling-main")) {
        CustomEase.create("sterling-main", "0.65, 0.01, 0.05, 0.99");
      }
      ease = "sterling-main";
    } catch {
      // GSAP's built-in easing is a safe fallback if CustomEase is unavailable.
    }

    const timeline = gsap.timeline({ defaults: { ease, duration: 0.7 } });

    if (isMenuOpen) {
      navWrap.setAttribute("data-nav", "open");
      gsap.set(navWrap, { display: "block" });
      gsap.set(menu, { xPercent: 0 });

      timeline
        .fromTo(
          menuButtonTexts,
          { yPercent: 0 },
          { yPercent: -100, stagger: 0.16 },
          0,
        )
        .fromTo(menuButtonIcon, { rotation: 0 }, { rotation: 315 }, 0)
        .fromTo(overlay, { autoAlpha: 0 }, { autoAlpha: 1 }, 0)
        .fromTo(
          backgroundPanels,
          { xPercent: 101 },
          { xPercent: 0, stagger: 0.12, duration: 0.575 },
          0,
        )
        .fromTo(
          menuLinks,
          { yPercent: 140, rotation: 10 },
          { yPercent: 0, rotation: 0, stagger: 0.055 },
          0.35,
        );

      if (fadeTargets.length) {
        timeline.fromTo(
          fadeTargets,
          { autoAlpha: 0, yPercent: 45 },
          { autoAlpha: 1, yPercent: 0, stagger: 0.04, clearProps: "all" },
          0.55,
        );
      }
    } else {
      navWrap.setAttribute("data-nav", "closed");
      timeline
        .to(
          menuLinks,
          { yPercent: 120, rotation: 8, stagger: 0.025, duration: 0.3 },
          0,
        )
        .to(overlay, { autoAlpha: 0, duration: 0.55 }, 0)
        .to(menu, { xPercent: 120, duration: 0.65 }, 0)
        .to(menuButtonTexts, { yPercent: 0, duration: 0.5 }, 0)
        .to(menuButtonIcon, { rotation: 0, duration: 0.5 }, 0)
        .set(navWrap, { display: "none" });
    }

    return () => {
      timeline.kill();
    };
  }, [isMenuOpen]);

  useEffect(() => {
    if (!isMenuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isMenuOpen]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsMenuOpen(false);
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  const toggleMenu = () => setIsMenuOpen((open) => !open);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <div ref={containerRef} className="sterling-gate">
      <div className="site-header-wrapper">
        <header className="header">
          <div className="container is--full">
            <nav className="nav-row" aria-label="Main navigation">
              <a
                href="#top"
                aria-label={`${brand} — home`}
                className="nav-logo-row"
                onClick={closeMenu}
              >
                <span className="nav-logo-mark" aria-hidden="true">
                  <i />
                  <i />
                  <i />
                </span>
                <span className="nav-wordmark">
                  <strong>{brand}</strong>
                  <small>DESIGN / DEVELOPMENT</small>
                </span>
              </a>
              <div className="nav-row__right">
                <button
                  type="button"
                  className="nav-toggle-label"
                  onClick={toggleMenu}
                  aria-expanded={isMenuOpen}
                  aria-controls="kinetic-navigation-menu"
                >
                  <span className="toggle-text">Curious?</span>
                  <span className="toggle-dot" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className="nav-close-btn"
                  onClick={toggleMenu}
                  aria-label={
                    isMenuOpen
                      ? "Close navigation menu"
                      : "Open navigation menu"
                  }
                  aria-expanded={isMenuOpen}
                  aria-controls="kinetic-navigation-menu"
                >
                  <span className="menu-button-text" aria-hidden="true">
                    <p className="p-large">Menu</p>
                    <p className="p-large">Close</p>
                  </span>
                  <span className="icon-wrap" aria-hidden="true">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="100%"
                      viewBox="0 0 16 16"
                      fill="none"
                      className="menu-button-icon"
                    >
                      <path
                        d="M7.33333 16L7.33333 0L8.66667 0L8.66667 16L7.33333 16Z"
                        fill="currentColor"
                      />
                      <path
                        d="M16 8.66667L0 8.66667L0 7.33333L16 7.33333L16 8.66667Z"
                        fill="currentColor"
                      />
                      <path
                        d="M6 7.33333L7.33333 7.33333L7.33333 6C7.33333 6.73637 6.73638 7.33333 6 7.33333Z"
                        fill="currentColor"
                      />
                      <path
                        d="M10 7.33333L8.66667 7.33333L8.66667 6C8.66667 6.73638 9.26362 7.33333 10 7.33333Z"
                        fill="currentColor"
                      />
                      <path
                        d="M6 8.66667L7.33333 8.66667L7.33333 10C7.33333 9.26362 6.73638 8.66667 6 8.66667Z"
                        fill="currentColor"
                      />
                      <path
                        d="M10 8.66667L8.66667 8.66667L8.66667 10C8.66667 9.26362 9.26362 8.66667 10 8.66667Z"
                        fill="currentColor"
                      />
                    </svg>
                  </span>
                </button>
              </div>
            </nav>
          </div>
        </header>
      </div>

      <section
        className="fullscreen-menu-container"
        aria-label="Expanded navigation"
      >
        <div
          id="kinetic-navigation-menu"
          data-nav="closed"
          className="nav-overlay-wrapper"
          aria-hidden={!isMenuOpen}
        >
          <div className="overlay" onClick={closeMenu} aria-hidden="true" />
          <nav className="menu-content" aria-label="Portfolio sections">
            <div className="menu-bg" aria-hidden="true">
              <div className="backdrop-layer first" />
              <div className="backdrop-layer second" />
              <div className="backdrop-layer" />
              <div className="ambient-background-shapes">
                <svg
                  className="bg-shape bg-shape-1"
                  viewBox="0 0 400 400"
                  fill="none"
                >
                  <circle
                    className="shape-element"
                    cx="80"
                    cy="120"
                    r="40"
                    fill="rgba(99,102,241,0.15)"
                  />
                  <circle
                    className="shape-element"
                    cx="300"
                    cy="80"
                    r="60"
                    fill="rgba(139,92,246,0.12)"
                  />
                  <circle
                    className="shape-element"
                    cx="200"
                    cy="300"
                    r="80"
                    fill="rgba(236,72,153,0.1)"
                  />
                  <circle
                    className="shape-element"
                    cx="350"
                    cy="280"
                    r="30"
                    fill="rgba(99,102,241,0.15)"
                  />
                </svg>
                <svg
                  className="bg-shape bg-shape-2"
                  viewBox="0 0 400 400"
                  fill="none"
                >
                  <path
                    className="shape-element"
                    d="M0 200 Q100 100, 200 200 T 400 200"
                    stroke="rgba(99,102,241,0.2)"
                    strokeWidth="60"
                  />
                  <path
                    className="shape-element"
                    d="M0 280 Q100 180, 200 280 T 400 280"
                    stroke="rgba(139,92,246,0.15)"
                    strokeWidth="40"
                  />
                </svg>
                <svg
                  className="bg-shape bg-shape-3"
                  viewBox="0 0 400 400"
                  fill="none"
                >
                  <circle
                    className="shape-element"
                    cx="50"
                    cy="50"
                    r="8"
                    fill="rgba(99,102,241,0.3)"
                  />
                  <circle
                    className="shape-element"
                    cx="150"
                    cy="50"
                    r="8"
                    fill="rgba(139,92,246,0.3)"
                  />
                  <circle
                    className="shape-element"
                    cx="250"
                    cy="50"
                    r="8"
                    fill="rgba(236,72,153,0.3)"
                  />
                  <circle
                    className="shape-element"
                    cx="350"
                    cy="50"
                    r="8"
                    fill="rgba(99,102,241,0.3)"
                  />
                  <circle
                    className="shape-element"
                    cx="100"
                    cy="150"
                    r="12"
                    fill="rgba(139,92,246,0.25)"
                  />
                  <circle
                    className="shape-element"
                    cx="200"
                    cy="150"
                    r="12"
                    fill="rgba(236,72,153,0.25)"
                  />
                  <circle
                    className="shape-element"
                    cx="300"
                    cy="150"
                    r="12"
                    fill="rgba(99,102,241,0.25)"
                  />
                  <circle
                    className="shape-element"
                    cx="50"
                    cy="250"
                    r="10"
                    fill="rgba(236,72,153,0.3)"
                  />
                  <circle
                    className="shape-element"
                    cx="150"
                    cy="250"
                    r="10"
                    fill="rgba(99,102,241,0.3)"
                  />
                  <circle
                    className="shape-element"
                    cx="250"
                    cy="250"
                    r="10"
                    fill="rgba(139,92,246,0.3)"
                  />
                  <circle
                    className="shape-element"
                    cx="350"
                    cy="250"
                    r="10"
                    fill="rgba(236,72,153,0.3)"
                  />
                  <circle
                    className="shape-element"
                    cx="100"
                    cy="350"
                    r="6"
                    fill="rgba(99,102,241,0.3)"
                  />
                  <circle
                    className="shape-element"
                    cx="200"
                    cy="350"
                    r="6"
                    fill="rgba(139,92,246,0.3)"
                  />
                  <circle
                    className="shape-element"
                    cx="300"
                    cy="350"
                    r="6"
                    fill="rgba(236,72,153,0.3)"
                  />
                </svg>
                <svg
                  className="bg-shape bg-shape-4"
                  viewBox="0 0 400 400"
                  fill="none"
                >
                  <path
                    className="shape-element"
                    d="M100 100 Q150 50, 200 100 Q250 150, 200 200 Q150 250, 100 200 Q50 150, 100 100"
                    fill="rgba(99,102,241,0.12)"
                  />
                  <path
                    className="shape-element"
                    d="M250 200 Q300 150, 350 200 Q400 250, 350 300 Q300 350, 250 300 Q200 250, 250 200"
                    fill="rgba(236,72,153,0.1)"
                  />
                </svg>
                <svg
                  className="bg-shape bg-shape-5"
                  viewBox="0 0 400 400"
                  fill="none"
                >
                  <line
                    className="shape-element"
                    x1="0"
                    y1="100"
                    x2="300"
                    y2="400"
                    stroke="rgba(99,102,241,0.15)"
                    strokeWidth="30"
                  />
                  <line
                    className="shape-element"
                    x1="100"
                    y1="0"
                    x2="400"
                    y2="300"
                    stroke="rgba(139,92,246,0.12)"
                    strokeWidth="25"
                  />
                  <line
                    className="shape-element"
                    x1="200"
                    y1="0"
                    x2="400"
                    y2="200"
                    stroke="rgba(236,72,153,0.1)"
                    strokeWidth="20"
                  />
                </svg>
              </div>
            </div>

            <div className="menu-content-wrapper">
              <div className="menu-kicker" data-menu-fade>
                <span>TAKE A LOOK AROUND</span>
                <button
                  type="button"
                  className="menu-close"
                  onClick={closeMenu}
                  aria-label="Close navigation menu"
                >
                  CLOSE <span aria-hidden="true">×</span>
                </button>
              </div>
              <ul className="menu-list">
                {links.map((link, index) => (
                  <li
                    className="menu-list-item"
                    data-shape={link.shape ?? (index % 5) + 1}
                    key={link.href}
                  >
                    <a
                      href={link.href}
                      className="nav-link"
                      onClick={closeMenu}
                      tabIndex={isMenuOpen ? 0 : -1}
                    >
                      <span className="nav-link-text">{link.label}</span>
                      <span className="nav-link-hover-bg" aria-hidden="true" />
                    </a>
                  </li>
                ))}
              </ul>
              <div className="menu-meta" data-menu-fade>
                <span>GOOD WORK, GOOD COMPANY.</span>
                <span>SCROLL / CLICK / ESC TO CLOSE</span>
              </div>
            </div>
          </nav>
        </div>
      </section>
    </div>
  );
}
