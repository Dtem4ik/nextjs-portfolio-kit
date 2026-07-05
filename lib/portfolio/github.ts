import "server-only";
import { portfolioConfig } from "@/portfolio.config";
import type { PortfolioCommit, PortfolioProject, PortfolioRelease } from "@/lib/portfolio/types";

type GitHubRepository = {
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  stargazers_count: number;
  forks_count: number;
  watchers_count: number;
  open_issues_count: number;
  updated_at: string;
  language: string | null;
};

type GitHubCommit = {
  sha: string;
  html_url: string;
  commit: {
    message: string;
    author: {
      date: string;
    } | null;
  };
};

type GitHubRelease = {
  tag_name: string;
  name: string | null;
  html_url: string;
  published_at: string | null;
};

type GitHubLanguageMap = Record<string, number>;

const githubHeaders = () => {
  const headers: HeadersInit = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };

  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  return headers;
};

async function githubFetch<T>(path: string): Promise<T> {
  const response = await fetch(`https://api.github.com${path}`, {
    headers: githubHeaders(),
    next: { revalidate: 60 * 30 },
  });

  if (!response.ok) {
    throw new Error(`GitHub request failed: ${response.status} ${path}`);
  }

  return response.json() as Promise<T>;
}

function humanizeCommit(message: string) {
  const firstLine = message.split("\n")[0]?.trim() || "Updated the project";
  const normalized = firstLine
    .replace(/^(feat|fix|docs|style|refactor|test|chore|perf|ci)(\(.+\))?:\s*/i, "")
    .trim();

  if (!normalized) return "Updated the project with a small maintenance change.";

  const lower = normalized.toLowerCase();
  if (lower.startsWith("fix ")) {
    return `Improved reliability by ${lower.replace(/^fix\s+/, "fixing ")}.`;
  }
  if (lower.startsWith("add ")) {
    return `Added ${lower.replace(/^add\s+/, "")} to extend the project capabilities.`;
  }
  if (lower.startsWith("improve ")) {
    return `Improved ${lower.replace(/^improve\s+/, "")} for a better developer experience.`;
  }
  if (lower.startsWith("update ")) {
    return `Updated ${lower.replace(/^update\s+/, "")} to keep the project current.`;
  }

  return `${normalized.charAt(0).toUpperCase()}${normalized.slice(1)}.`;
}

export function fallbackProjectFromConfig(project: (typeof portfolioConfig.projects)[number]) {
  const stack = project.stack ?? [];
  const commits = (project.fallbackCommits ?? []).map(
    (commit): PortfolioCommit => ({
      ...commit,
      summary: humanizeCommit(commit.message),
    }),
  );

  const releases = (project.fallbackReleases ?? []).map(
    (release): PortfolioRelease => ({
      tagName: release.tagName,
      name: release.name,
      publishedAt: release.publishedAt,
      url: release.url,
    }),
  );

  return {
    slug: project.slug,
    repo: project.repo,
    name: project.name ?? project.repo,
    description: project.description ?? "",
    stack: [...stack],
    languages: stack.slice(0, 4),
    stats: {
      stars: project.fallbackStats?.stars ?? 0,
      forks: project.fallbackStats?.forks ?? 0,
      watchers: project.fallbackStats?.watchers ?? 0,
      openIssues: project.fallbackStats?.openIssues ?? 0,
    },
    latestCommits: commits,
    releases,
    liveDemoUrl: project.liveDemoUrl,
    homepageUrl: project.homepageUrl,
    sourceUrl: `${portfolioConfig.social.github}/${project.repo}`,
    aiSummary: project.aiSummary ?? project.description ?? "",
    updatedAt: commits[0]?.date,
  } satisfies PortfolioProject;
}

export async function fetchGitHubProject(
  project: (typeof portfolioConfig.projects)[number],
): Promise<PortfolioProject> {
  const username = portfolioConfig.github.username;
  const fallback = fallbackProjectFromConfig(project);

  // When the GitHub integration is disabled, render straight from config data.
  if (!portfolioConfig.github.enabled) return fallback;

  // Fetch commits from the window the weekly digest covers (a few days of buffer).
  const sinceDays = portfolioConfig.ai.newsWeeks * 7 + 3;
  const since = new Date(Date.now() - sinceDays * 86400000).toISOString();

  try {
    const [repo, commits, releases, languages] = await Promise.all([
      githubFetch<GitHubRepository>(`/repos/${username}/${project.repo}`),
      githubFetch<GitHubCommit[]>(
        `/repos/${username}/${project.repo}/commits?since=${since}&per_page=100`,
      ),
      githubFetch<GitHubRelease[]>(`/repos/${username}/${project.repo}/releases?per_page=4`),
      githubFetch<GitHubLanguageMap>(`/repos/${username}/${project.repo}/languages`),
    ]);

    const configStack = project.stack ?? [];
    const githubLanguages = Object.keys(languages);

    return {
      slug: project.slug,
      repo: project.repo,
      name: project.name || repo.name,
      description: repo.description || project.description || "",
      // Prefer curated stack; otherwise use GitHub languages / primary language.
      stack: configStack.length
        ? configStack
        : githubLanguages.length
          ? githubLanguages.slice(0, 5)
          : [repo.language].filter((l): l is string => typeof l === "string"),
      languages: githubLanguages.length
        ? githubLanguages
        : [repo.language, ...configStack]
            .filter((language): language is string => typeof language === "string")
            .slice(0, 5),
      stats: {
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        watchers: repo.watchers_count,
        openIssues: repo.open_issues_count,
      },
      latestCommits: commits.map((commit) => ({
        sha: commit.sha,
        message: commit.commit.message.split("\n")[0] || "Project update",
        date: commit.commit.author?.date || repo.updated_at,
        url: commit.html_url,
        summary: humanizeCommit(commit.commit.message),
      })),
      releases: releases.map((release) => ({
        tagName: release.tag_name,
        name: release.name || release.tag_name,
        publishedAt: release.published_at || repo.updated_at,
        url: release.html_url,
      })),
      liveDemoUrl: project.liveDemoUrl || repo.homepage || undefined,
      homepageUrl: project.homepageUrl || repo.homepage || undefined,
      sourceUrl: repo.html_url,
      aiSummary: project.aiSummary || repo.description || fallback.aiSummary,
      updatedAt: repo.updated_at,
    };
  } catch {
    return fallback;
  }
}

export { humanizeCommit };
