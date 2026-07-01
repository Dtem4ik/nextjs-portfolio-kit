import type { PortfolioData } from "@/lib/portfolio/types";

const metricLabels = {
  projects: "Projects",
  stars: "Stars",
  forks: "Forks",
  commitsIndexed: "Commits indexed",
  releases: "Releases",
} as const;

export function MetricStrip({ metrics }: { metrics: PortfolioData["metrics"] }) {
  return (
    <dl className="border-border/70 grid grid-cols-2 overflow-hidden rounded-md border md:grid-cols-5">
      {Object.entries(metrics).map(([key, value]) => (
        <div
          key={key}
          className="border-border/70 border-b p-4 md:border-r md:border-b-0 last:md:border-r-0"
        >
          <dt className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
            {metricLabels[key as keyof typeof metricLabels]}
          </dt>
          <dd className="mt-2 font-mono text-2xl font-semibold tabular-nums">{value}</dd>
        </div>
      ))}
    </dl>
  );
}
