export type RepositoryStats = {
  stars: number;
  forks: number;
  watchers: number;
  openIssues: number;
};

export type PortfolioCommit = {
  sha: string;
  message: string;
  date: string;
  url: string;
  summary: string;
};

export type PortfolioRelease = {
  tagName: string;
  name: string;
  publishedAt: string;
  url: string;
};

export type PortfolioProject = {
  slug: string;
  repo: string;
  name: string;
  description: string;
  stack: string[];
  languages: string[];
  stats: RepositoryStats;
  latestCommits: PortfolioCommit[];
  releases: PortfolioRelease[];
  liveDemoUrl?: string;
  homepageUrl?: string;
  sourceUrl: string;
  aiSummary: string;
  updatedAt?: string;
};

export type ActivityItem = {
  id: string;
  projectSlug: string;
  projectName: string;
  title: string;
  summary: string;
  date: string;
  href: string;
  type: "commit" | "release" | "project" | "changelog";
  /** Short topical tags, present on AI-generated changelog entries. */
  tags?: string[];
  /** BCP-47 locale of AI-generated text; null/undefined = locale-agnostic (e.g. releases). */
  locale?: string | null;
};

export type PortfolioData = {
  projects: PortfolioProject[];
  activity: ActivityItem[];
  metrics: {
    projects: number;
    stars: number;
    forks: number;
    commitsIndexed: number;
    releases: number;
  };
  generatedAt: string;
  source: "github" | "fallback" | "mixed";
};
