import { getDictionary, type Locale } from "@/lib/dictionaries";
import type { PortfolioData } from "@/lib/portfolio/types";

export async function MetricStrip({
  metrics,
  locale,
}: {
  metrics: PortfolioData["metrics"];
  locale: Locale;
}) {
  const dict = await getDictionary(locale);

  return (
    <dl className="border-border/70 grid grid-cols-2 overflow-hidden rounded-md border md:grid-cols-5">
      {Object.entries(metrics).map(([key, value]) => (
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
