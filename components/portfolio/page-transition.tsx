"use client";

import { usePathname } from "next/navigation";

/**
 * Replays a fade + upward-slide animation on each client navigation by keying
 * the wrapper on the pathname (a new key remounts the node, restarting the CSS
 * animation). Honors prefers-reduced-motion via the .animate-page-in rule.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div key={pathname} className="animate-page-in">
      {children}
    </div>
  );
}
