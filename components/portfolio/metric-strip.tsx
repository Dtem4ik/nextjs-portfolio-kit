import { getDictionary, type Locale } from "@/lib/dictionaries";
import type { PortfolioData } from "@/lib/portfolio/types";

// Static map so Tailwind keeps these column classes in the build.
const colsClass: Record<number, string> = {
  1: "md:grid-cols-1",
  2: "md:grid-cols-2",
  3: "md:grid-cols-3",
  4: "md:grid-cols-4",
  5: "md:grid-cols-5",
};

export async function MetricStrip({
  metrics,
  locale,
}: {
  metrics: PortfolioData["metrics"];
  locale: Locale;
}) {
  const dict = await getDictionary(locale);

  // Hide zero-value metrics (e.g. 0 stars / 0 forks) — they undersell the profile.
  const entries = Object.entries(metrics).filter(([, value]) => value > 0);
  if (entries.length === 0) return null;

  return (
    <dl
      className={`border-border/70 grid grid-cols-2 overflow-hidden rounded-md border ${colsClass[entries.length] ?? "md:grid-cols-5"}`}
    >
      {entries.map(([key, value]) => (
        <div
          key={key}
          className="border-border/70 border-b p-4 md:border-r md:border-b-0 last:md:border-r-0"
        >
          <dt className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
            {dict.metrics[key as keyof typeof dict.metrics]}
          </dt>
          <dd className="mt-2 font-mono text-2xl font-semibold tabular-nums">{value}</dd>
        </div>
      ))}
    </dl>
  );
}
