import "server-only";
import { portfolioConfig } from "@/portfolio.config";
import { fetchGitHubProject, fallbackProjectFromConfig } from "@/lib/portfolio/github";
import { readPortfolioSnapshot } from "@/lib/portfolio/supabase";
import type { ActivityItem, PortfolioData, PortfolioProject } from "@/lib/portfolio/types";

function toActivity(project: PortfolioProject): ActivityItem[] {
  const commits = project.latestCommits.map(
    (commit): ActivityItem => ({
      id: `${project.slug}-${commit.sha}`,
      projectSlug: project.slug,
      projectName: project.name,
      title: commit.message,
      summary: commit.summary,
      date: commit.date,
      href: commit.url,
      type: "commit",
    }),
  );

  const releases = project.releases.map(
    (release): ActivityItem => ({
      id: `${project.slug}-${release.tagName}`,
      projectSlug: project.slug,
      projectName: project.name,
      title: `Released ${release.name}`,
      summary: `Published ${release.name} for ${project.name}.`,
      date: release.publishedAt,
      href: release.url,
      type: "release",
    }),
  );

  return [...commits, ...releases];
}

function buildMetrics(projects: PortfolioProject[]) {
  return {
    projects: projects.length,
    stars: projects.reduce((total, project) => total + project.stats.stars, 0),
    forks: projects.reduce((total, project) => total + project.stats.forks, 0),
    commitsIndexed: projects.reduce((total, project) => total + project.latestCommits.length, 0),
    releases: projects.reduce((total, project) => total + project.releases.length, 0),
  };
}

function assembleData(
  projects: PortfolioProject[],
  source: PortfolioData["source"],
  generatedAt = new Date().toISOString(),
): PortfolioData {
  const activity = projects
    .flatMap(toActivity)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return {
    projects,
    activity,
    metrics: buildMetrics(projects),
    generatedAt,
    source,
  };
}

async function fetchFromGitHub(): Promise<PortfolioData> {
  const projects = await Promise.all(portfolioConfig.projects.map(fetchGitHubProject));
  const fallbackProjects = portfolioConfig.projects.map(fallbackProjectFromConfig);
  const source: PortfolioData["source"] = projects.every(
    (project, index) => project.updatedAt === fallbackProjects[index]?.updatedAt,
  )
    ? "fallback"
    : projects.some((project, index) => project.updatedAt === fallbackProjects[index]?.updatedAt)
      ? "mixed"
      : "github";

  return assembleData(projects, source);
}

/**
 * Build data directly from the source of truth (live GitHub, or config
 * fallback when GitHub is disabled), bypassing the Supabase cache. The cron
 * sync job uses this so it refreshes the cache instead of re-reading it.
 */
export async function buildFreshPortfolioData(): Promise<PortfolioData> {
  if (portfolioConfig.github.enabled) {
    return fetchFromGitHub();
  }

  const projects = portfolioConfig.projects.map(fallbackProjectFromConfig);
  return assembleData(projects, "fallback");
}

/**
 * Resolve portfolio data from the cheapest fresh source available:
 * 1. Supabase snapshot (when the integration is enabled and the cache is fresh)
 * 2. Live GitHub API (when the GitHub integration is enabled)
 * 3. Config fallback data (always works, zero external calls)
 */
export async function getPortfolioData(locale?: string): Promise<PortfolioData> {
  const snapshot = await readPortfolioSnapshot(locale);
  if (snapshot) {
    // Use the stored activity feed (which includes AI-generated changelog items)
    // rather than recomputing raw commit activity from the projects.
    return {
      projects: snapshot.projects,
      activity: snapshot.activity,
      metrics: buildMetrics(snapshot.projects),
      generatedAt: snapshot.generatedAt,
      source: snapshot.source,
    };
  }

  return buildFreshPortfolioData();
}

export async function getProjectBySlug(slug: string) {
  const data = await getPortfolioData();
  return data.projects.find((project) => project.slug === slug);
}

export function getProjectSlugs() {
  return portfolioConfig.projects.map((project) => ({ slug: project.slug }));
}

export function buildAskContext(data: PortfolioData) {
  const profileLines = [
    `Name: ${portfolioConfig.name}`,
    `Role: ${portfolioConfig.role.en}`,
    `Location: ${portfolioConfig.location}`,
    `Bio: ${portfolioConfig.bio.en}`,
    `Skills: ${portfolioConfig.skills.join(", ")}`,
    `Experience: ${portfolioConfig.experience
      .map((item) => `${item.role} at ${item.company} (${item.period}): ${item.summary}`)
      .join(" | ")}`,
  ];

  const projectLines = data.projects.map(
    (project) =>
      `Project ${project.name}: ${project.description}. Stack: ${project.stack.join(", ")}. Summary: ${project.aiSummary}. Recent activity: ${project.latestCommits
        .slice(0, 3)
        .map((commit) => commit.summary)
        .join(" ")}`,
  );

  return [...profileLines, ...projectLines].join("\n");
}
