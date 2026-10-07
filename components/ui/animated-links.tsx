"use client";

import Link from "next/link";
import React from "react";

import { cn } from "@/lib/utils";

type LinkProps = {
  children: React.ReactNode;
  href: string;
  className?: string;
};

const arrow = (
  <svg
    className="ml-[0.3em] mt-[0em] size-[0.55em] translate-y-1 opacity-0 transition-all duration-300 [motion-reduce:transition-none] group-hover:translate-y-0 group-hover:opacity-100"
    fill="none"
    viewBox="0 0 10 10"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M1.004 9.166 9.337.833m0 0v8.333m0-8.333H1.004"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/** Internal Next.js link with the first animated underline treatment. */
export const Link000 = ({ children, href, className }: LinkProps) => (
  <Link
    href={href}
    className={cn(
      "group relative flex items-center before:pointer-events-none before:absolute before:bottom-0 before:left-0 before:h-[0.05em] before:w-full before:bg-current before:content-[''] before:origin-right before:scale-x-0 before:transition-transform before:duration-300 before:ease-[cubic-bezier(0.4,0,0.2,1)] hover:before:origin-left hover:before:scale-x-100 motion-reduce:before:transition-none",
      className,
    )}
  >
    {children}
  </Link>
);

function AnchorLink({
  children,
  href,
  className,
  variant,
}: LinkProps & { variant: 1 | 2 | 3 | 4 | 5 }) {
  const external = /^https?:\/\//.test(href);
  const shared =
    "group relative flex items-center motion-reduce:before:transition-none";
  const variants: Record<1 | 2 | 3 | 4 | 5, string> = {
    1: "before:pointer-events-none before:absolute before:left-0 before:top-[1.5em] before:h-[0.05em] before:w-full before:bg-current before:content-[''] before:origin-right before:scale-x-0 before:transition-transform before:duration-300 before:ease-[cubic-bezier(0.4,0,0.2,1)] hover:before:origin-left hover:before:scale-x-100",
    2: "before:pointer-events-none before:absolute before:left-0 before:top-[1.5em] before:h-[0.05em] before:w-full before:bg-current before:content-[''] before:origin-right before:scale-x-0 before:transition-transform before:duration-300 before:ease-[cubic-bezier(0.4,0,0.2,1)] before:origin-left hover:before:origin-right hover:before:scale-x-100",
    3: "before:pointer-events-none before:absolute before:left-0 before:top-[1.5em] before:h-[0.05em] before:w-full before:bg-current before:content-[''] before:origin-right before:scale-x-0 before:transition-transform before:duration-300 before:ease-[cubic-bezier(0.4,0,0.2,1)] before:origin-center hover:before:scale-x-100",
    4: "before:pointer-events-none before:absolute before:left-0 before:bottom-0 before:z-[1] before:h-0 before:w-full before:origin-center before:scale-x-100 before:bg-white before:content-[''] before:mix-blend-difference before:transition-all before:duration-300 before:ease-[cubic-bezier(0.4,0,0.2,1)] hover:before:h-[1.4em]",
    5: "before:pointer-events-none before:absolute before:left-0 before:top-0 before:z-[1] before:h-full before:w-full before:origin-left before:scale-x-0 before:bg-white before:content-[''] before:mix-blend-difference before:transition-all before:duration-300 before:ease-[cubic-bezier(0.4,0,0.2,1)] hover:before:scale-x-100",
  };

  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
      className={cn(shared, variants[variant], className)}
    >
      {children}
      {arrow}
    </a>
  );
}

export const Link001 = (props: LinkProps) => (
  <AnchorLink {...props} variant={1} />
);
export const Link002 = (props: LinkProps) => (
  <AnchorLink {...props} variant={2} />
);
export const Link003 = (props: LinkProps) => (
  <AnchorLink {...props} variant={3} />
);
export const Link004 = (props: LinkProps) => (
  <AnchorLink {...props} variant={4} />
);
export const Link005 = (props: LinkProps) => (
  <AnchorLink {...props} variant={5} />
);

/** Stand-alone version of the original five-link interaction demo. */
export function Skiper40() {
  return (
    <section className="flex h-full w-full flex-col items-center justify-center gap-5 overflow-y-auto snap-y snap-mandatory">
      <Link001 href="mailto:hello@example.com">hello@example.com</Link001>
      <Link002 href="mailto:hello@example.com">hello@example.com</Link002>
      <Link003 href="mailto:hello@example.com">hello@example.com</Link003>
      <Link004 href="mailto:hello@example.com">hello@example.com</Link004>
      <Link005 href="mailto:hello@example.com">hello@example.com</Link005>
    </section>
  );
}
