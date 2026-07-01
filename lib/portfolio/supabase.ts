import "server-only";
import { portfolioConfig } from "@/portfolio.config";
import type {
  ActivityItem,
  PortfolioCommit,
  PortfolioData,
  PortfolioProject,
  PortfolioRelease,
} from "@/lib/portfolio/types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

/** True only when the Supabase integration is enabled and its keys are present. */
export function isSupabaseConfigured() {
  return Boolean(portfolioConfig.integrations.supabase.enabled && supabaseUrl && serviceRoleKey);
}

function supabaseHeaders(extra: HeadersInit = {}): HeadersInit {
  return {
    apikey: serviceRoleKey as string,
    Authorization: `Bearer ${serviceRoleKey}`,
    ...extra,
  };
}

async function insertRows(table: string, rows: unknown[]) {
  if (!isSupabaseConfigured()) return false;
  // Nothing to write (e.g. a repo with no releases) is a success, not a failure.
  if (rows.length === 0) return true;

  const response = await fetch(`${supabaseUrl}/rest/v1/${table}`, {
    method: "POST",
    headers: supabaseHeaders({
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates",
    }),
    body: JSON.stringify(rows),
  });

  return response.ok;
}

async function readRows<T>(table: string, query: string): Promise<T[]> {
  if (!isSupabaseConfigured()) return [];

  const response = await fetch(`${supabaseUrl}/rest/v1/${table}?${query}`, {
    headers: supabaseHeaders({ Accept: "application/json" }),
    // Read at request time; the cron job is what refreshes the underlying data.
    cache: "no-store",
  });

  if (!response.ok) return [];
  return (await response.json().catch(() => [])) as T[];
}

export async function persistPortfolioSnapshot(data: PortfolioData) {
  const projects = data.projects.map((project) => ({
    slug: project.slug,
    repo: project.repo,
    name: project.name,
    description: project.description,
    stack: project.stack,
    languages: project.languages,
    stars: project.stats.stars,
    forks: project.stats.forks,
    watchers: project.stats.watchers,
    open_issues: project.stats.openIssues,
    live_demo_url: project.liveDemoUrl,
    source_url: project.sourceUrl,
    ai_summary: project.aiSummary,
    updated_at: project.updatedAt,
  }));

  const commits = data.projects.flatMap((project) =>
    project.latestCommits.map((commit) => ({
      sha: commit.sha,
      project_slug: project.slug,
      message: commit.message,
      summary: commit.summary,
      committed_at: commit.date,
      url: commit.url,
    })),
  );

  const releases = data.projects.flatMap((project) =>
    project.releases.map((release) => ({
      tag_name: release.tagName,
      project_slug: project.slug,
      name: release.name,
      published_at: release.publishedAt,
      url: release.url,
    })),
  );

  const activityItems = data.activity.map((item) => ({
    id: item.id,
    project_slug: item.projectSlug,
    title: item.title,
    summary: item.summary,
    happened_at: item.date,
    href: item.href,
    type: item.type,
    tags: item.tags ?? [],
  }));

  const results = await Promise.all([
    insertRows("projects", projects),
    insertRows("commits", commits),
    insertRows("releases", releases),
    insertRows("activity_items", activityItems),
    // Single-row marker recording when this snapshot was produced (drives staleness checks on read).
    insertRows("sync_state", [
      { id: "singleton", generated_at: data.generatedAt, source: data.source },
    ]),
  ]);

  return results.every(Boolean);
}

type ProjectRow = {
  slug: string;
  repo: string;
  name: string;
  description: string | null;
  stack: string[] | null;
  languages: string[] | null;
  stars: number;
  forks: number;
  watchers: number;
  open_issues: number;
  live_demo_url: string | null;
  source_url: string;
  ai_summary: string | null;
  updated_at: string | null;
};

type CommitRow = {
  sha: string;
  project_slug: string;
  message: string;
  summary: string | null;
  committed_at: string;
  url: string;
};

type ReleaseRow = {
  tag_name: string;
  project_slug: string;
  name: string;
  published_at: string;
  url: string;
};

type SyncStateRow = { generated_at: string; source: PortfolioData["source"] };

type ActivityRow = {
  id: string;
  project_slug: string | null;
  title: string;
  summary: string;
  happened_at: string;
  href: string;
  type: ActivityItem["type"];
  tags: string[] | null;
};

/**
 * Read a previously synced snapshot back out of Supabase and reassemble the
 * projects and the (possibly AI-generated) activity feed. Returns null when
 * Supabase is disabled, empty, or the snapshot is older than
 * `integrations.supabase.maxAgeMinutes` (so callers fall back to a live fetch).
 */
export async function readPortfolioSnapshot(): Promise<{
  projects: PortfolioProject[];
  activity: ActivityItem[];
  generatedAt: string;
  source: PortfolioData["source"];
} | null> {
  if (!isSupabaseConfigured()) return null;

  const [state] = await readRows<SyncStateRow>("sync_state", "select=generated_at,source&limit=1");
  if (!state?.generated_at) return null;

  const ageMinutes = (Date.now() - new Date(state.generated_at).getTime()) / 60000;
  if (ageMinutes > portfolioConfig.integrations.supabase.maxAgeMinutes) return null;

  const [projectRows, commitRows, releaseRows, activityRows] = await Promise.all([
    readRows<ProjectRow>("projects", "select=*"),
    readRows<CommitRow>("commits", "select=*&order=committed_at.desc"),
    readRows<ReleaseRow>("releases", "select=*&order=published_at.desc"),
    readRows<ActivityRow>("activity_items", "select=*&order=happened_at.desc"),
  ]);

  if (projectRows.length === 0) return null;

  const projectNameBySlug = new Map(projectRows.map((row) => [row.slug, row.name]));

  const activity: ActivityItem[] = activityRows.map((row) => ({
    id: row.id,
    projectSlug: row.project_slug ?? "",
    projectName: (row.project_slug && projectNameBySlug.get(row.project_slug)) || "",
    title: row.title,
    summary: row.summary,
    date: row.happened_at,
    href: row.href,
    type: row.type,
    tags: row.tags ?? [],
  }));

  const projects = projectRows.map((row): PortfolioProject => {
    const latestCommits: PortfolioCommit[] = commitRows
      .filter((commit) => commit.project_slug === row.slug)
      .map((commit) => ({
        sha: commit.sha,
        message: commit.message,
        date: commit.committed_at,
        url: commit.url,
        summary: commit.summary ?? commit.message,
      }));

    const releases: PortfolioRelease[] = releaseRows
      .filter((release) => release.project_slug === row.slug)
      .map((release) => ({
        tagName: release.tag_name,
        name: release.name,
        publishedAt: release.published_at,
        url: release.url,
      }));

    return {
      slug: row.slug,
      repo: row.repo,
      name: row.name,
      description: row.description ?? "",
      stack: row.stack ?? [],
      languages: row.languages ?? [],
      stats: {
        stars: row.stars,
        forks: row.forks,
        watchers: row.watchers,
        openIssues: row.open_issues,
      },
      latestCommits,
      releases,
      liveDemoUrl: row.live_demo_url ?? undefined,
      homepageUrl: row.live_demo_url ?? undefined,
      sourceUrl: row.source_url,
      aiSummary: row.ai_summary ?? "",
      updatedAt: row.updated_at ?? undefined,
    };
  });

  return { projects, activity, generatedAt: state.generated_at, source: state.source };
}
