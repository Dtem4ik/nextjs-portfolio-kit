import "server-only";
import { streamText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { portfolioConfig } from "@/portfolio.config";
import { buildAskContext, getPortfolioData } from "@/lib/portfolio/data";
import type { ActivityItem, PortfolioCommit, PortfolioProject } from "@/lib/portfolio/types";

type AskResult = {
  answer: string;
  mode: "ai" | "fallback";
};

/** True when the AI integration is enabled and a key for the active provider exists. */
export function isAiConfigured() {
  if (!portfolioConfig.ai.enabled) return false;
  const provider: string = portfolioConfig.ai.provider;
  if (provider === "gemini") return Boolean(process.env.GEMINI_API_KEY);
  if (provider === "openai") return Boolean(process.env.OPENAI_API_KEY);
  if (provider === "anthropic") return Boolean(process.env.ANTHROPIC_API_KEY);
  return false;
}

function fallbackAnswer(question: string, context: string): AskResult {
  const normalized = question.toLowerCase();
  const lines = context.split("\n");

  if (normalized.includes("skill") || normalized.includes("stack")) {
    const skillLine = lines.find((line) => line.startsWith("Skills:"));
    return {
      mode: "fallback",
      answer: skillLine
        ? `${portfolioConfig.name}'s configured skill set is ${skillLine.replace("Skills: ", "")}.`
        : "The configured portfolio does not list skills yet.",
    };
  }

  if (normalized.includes("project") || normalized.includes("repo")) {
    const projects = portfolioConfig.projects.map((project) => project.name).join(", ");
    return {
      mode: "fallback",
      answer: projects
        ? `${portfolioConfig.name}'s featured projects are ${projects}. Open a project page for repository stats, commits, releases, and the configured summary.`
        : "No featured projects are configured yet.",
    };
  }

  return {
    mode: "fallback",
    answer: `${portfolioConfig.name} is a ${portfolioConfig.role.en} based in ${portfolioConfig.location}. This fallback answer only uses portfolio.config.ts because no AI API key is configured.`,
  };
}

const SYSTEM_PROMPT =
  "You answer questions about a developer portfolio. Use only the provided portfolio context. If the answer is not in context, say that the indexed portfolio data does not include it.";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Primary model first, then the configured fallbacks (Gemini only). */
function geminiModelChain(): string[] {
  const fallbacks = (
    "fallbackModels" in portfolioConfig.ai ? portfolioConfig.ai.fallbackModels : []
  ) as readonly string[];
  return [portfolioConfig.ai.model, ...fallbacks];
}

/**
 * Low-level Gemini (Google AI Studio) text call. Returns the raw model text, or
 * null on failure/missing key. On HTTP 429 it backs off and retries the SAME
 * model (respecting Retry-After) rather than cascading to fallback models that
 * usually have a much smaller daily quota. Other errors move to the next model.
 */
async function callGemini(
  systemPrompt: string,
  userContent: string,
  options: { json?: boolean } = {},
): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const body = JSON.stringify({
    systemInstruction: { parts: [{ text: systemPrompt }] },
    contents: [{ role: "user", parts: [{ text: userContent }] }],
    generationConfig: {
      temperature: portfolioConfig.ai.temperature,
      responseMimeType: options.json ? "application/json" : "text/plain",
    },
  });

  for (const model of geminiModelChain()) {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    for (let attempt = 0; attempt < 3; attempt++) {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      });

      if (response.ok) {
        const payload = (await response.json().catch(() => null)) as {
          candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
        } | null;
        const text = payload?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (text) return text;
        break; // ok but empty → try the next model
      }

      if (response.status === 429 && attempt < 2) {
        const retryAfter = Number(response.headers.get("retry-after")) || 2 ** (attempt + 1);
        await sleep(retryAfter * 1000);
        continue; // retry the same model
      }
      if (response.status === 429) return null; // persistently rate limited → skip (retried next sync)
      break; // 404 / 5xx → try the next model
    }
  }

  return null;
}

async function askGemini(question: string, context: string): Promise<AskResult> {
  const answer = await callGemini(
    SYSTEM_PROMPT,
    `Portfolio context:\n${context}\n\nQuestion: ${question}`,
  );
  return answer ? { mode: "ai", answer } : fallbackAnswer(question, context);
}

async function askAnthropic(question: string, context: string): Promise<AskResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return fallbackAnswer(question, context);

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: portfolioConfig.ai.model,
      max_tokens: 1024,
      temperature: portfolioConfig.ai.temperature,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Portfolio context:\n${context}\n\nQuestion: ${question}`,
        },
      ],
    }),
  });

  if (!response.ok) return fallbackAnswer(question, context);

  const payload = (await response.json()) as {
    content?: Array<{ text?: string }>;
  };

  const answer = payload.content?.[0]?.text?.trim();
  return answer ? { mode: "ai", answer } : fallbackAnswer(question, context);
}

async function askOpenAI(question: string, context: string): Promise<AskResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return fallbackAnswer(question, context);

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: portfolioConfig.ai.model,
      temperature: portfolioConfig.ai.temperature,
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: `Portfolio context:\n${context}\n\nQuestion: ${question}`,
        },
      ],
    }),
  });

  if (!response.ok) return fallbackAnswer(question, context);

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const answer = payload.choices?.[0]?.message?.content?.trim();
  return answer ? { mode: "ai", answer } : fallbackAnswer(question, context);
}

export async function askPortfolio(question: string): Promise<AskResult> {
  const cleanQuestion = question.trim().slice(0, 1000);
  const data = await getPortfolioData();
  const context = buildAskContext(data);

  if (!portfolioConfig.ai.enabled || !cleanQuestion) {
    return fallbackAnswer(cleanQuestion, context);
  }

  const provider: string = portfolioConfig.ai.provider;

  if (provider === "gemini") {
    return askGemini(cleanQuestion, context);
  }

  if (provider === "openai") {
    return askOpenAI(cleanQuestion, context);
  }

  if (provider === "anthropic") {
    return askAnthropic(cleanQuestion, context);
  }

  return fallbackAnswer(cleanQuestion, context);
}

/**
 * Streaming Ask response for the API route. Gemini streams token-by-token via
 * the Vercel AI SDK; other providers (or a missing key) return a plain-text
 * body so the client can read both the same way. Answer is Markdown.
 */
export async function createAskResponse(question: string): Promise<Response> {
  const cleanQuestion = question.trim().slice(0, 1000);
  const data = await getPortfolioData();
  const context = buildAskContext(data);
  const textHeaders = { "Content-Type": "text/plain; charset=utf-8" };

  if (!isAiConfigured() || !cleanQuestion) {
    return new Response(fallbackAnswer(cleanQuestion, context).answer, { headers: textHeaders });
  }

  if (portfolioConfig.ai.provider === "gemini") {
    const google = createGoogleGenerativeAI({ apiKey: process.env.GEMINI_API_KEY });
    const result = streamText({
      model: google(portfolioConfig.ai.model),
      system: SYSTEM_PROMPT,
      temperature: portfolioConfig.ai.temperature,
      prompt: `Portfolio context:\n${context}\n\nQuestion: ${cleanQuestion}`,
    });
    return result.toTextStreamResponse();
  }

  // openai / anthropic — non-streamed, via the existing REST path.
  const result = await askPortfolio(cleanQuestion);
  return new Response(result.answer, { headers: textHeaders });
}

// ---------------------------------------------------------------------------
// AI changelog / news generation
//
// Turns a project's recent commits into a polished, plain-language news entry.
// Runs during the cron sync (never per page view) and the result is cached in
// Supabase, so visitors read pre-generated content and the model is called at
// most once per project per sync.
// ---------------------------------------------------------------------------

const LANGUAGE_NAMES: Record<string, string> = {
  en: "English",
  ru: "Russian",
};

function digestSystemPrompt(language: string, maxEntries: number) {
  return (
    "You are a technical writer producing daily changelog news for a developer's portfolio. " +
    "You are given the commits a project received on ONE day. Group them into news entries by theme. " +
    `Decide how many entries the day deserves: return ONE entry for a normal day of work; return up to ` +
    `${maxEntries} entries ONLY when the day clearly contains DISTINCT features or areas of work; return an ` +
    "EMPTY array [] if the day has only trivial changes (formatting, dependency bumps, config, CI, merges). " +
    "Group related commits together, avoid repetition and raw commit jargon, and explain what shipped and why " +
    `it matters. Write in ${language}. ` +
    'Respond with ONLY minified JSON: an ARRAY of {"headline": string, "body": string, "tags": string[]} ' +
    "objects, where headline is <= 70 characters, body is 2-4 sentences, and tags is 2-4 short lowercase tags."
  );
}

/** Day key (UTC), e.g. "20260706", used to group commits into daily digests. */
function dayKey(dateStr: string): string {
  const d = new Date(dateStr);
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${d.getUTCFullYear()}${month}${day}`;
}

type ChangelogDraft = { headline: string; body: string; tags: string[] };

/** Dispatch a JSON-returning completion to the configured provider. */
async function completeJson(system: string, user: string): Promise<string | null> {
  const provider: string = portfolioConfig.ai.provider;

  if (provider === "gemini") {
    return callGemini(system, user, { json: true });
  }

  if (provider === "openai") {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return null;
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: portfolioConfig.ai.model,
        temperature: portfolioConfig.ai.temperature,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
    });
    if (!response.ok) return null;
    const payload = (await response.json().catch(() => null)) as {
      choices?: Array<{ message?: { content?: string } }>;
    } | null;
    return payload?.choices?.[0]?.message?.content?.trim() ?? null;
  }

  if (provider === "anthropic") {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return null;
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: portfolioConfig.ai.model,
        max_tokens: 1024,
        temperature: portfolioConfig.ai.temperature,
        system,
        messages: [{ role: "user", content: user }],
      }),
    });
    if (!response.ok) return null;
    const payload = (await response.json().catch(() => null)) as {
      content?: Array<{ text?: string }>;
    } | null;
    return payload?.content?.[0]?.text?.trim() ?? null;
  }

  return null;
}

function parseChangelogDrafts(raw: string): ChangelogDraft[] {
  try {
    // Providers occasionally wrap JSON in ```json fences; strip them.
    const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
    const parsed = JSON.parse(cleaned) as unknown;
    // Accept an array, a { entries: [...] } wrapper, or a single object.
    const list = Array.isArray(parsed)
      ? parsed
      : parsed &&
          typeof parsed === "object" &&
          Array.isArray((parsed as { entries?: unknown }).entries)
        ? (parsed as { entries: unknown[] }).entries
        : [parsed];

    return list
      .filter(
        (entry): entry is Partial<ChangelogDraft> =>
          Boolean(entry) &&
          typeof (entry as ChangelogDraft).headline === "string" &&
          typeof (entry as ChangelogDraft).body === "string",
      )
      .map((entry) => ({
        headline: String(entry.headline).trim(),
        body: String(entry.body).trim(),
        tags: Array.isArray(entry.tags)
          ? entry.tags.filter((tag): tag is string => typeof tag === "string").slice(0, 4)
          : [],
      }));
  } catch {
    return [];
  }
}

/** Today's day key — the still-open bucket, always refreshed. */
export function currentDayKey(): string {
  return dayKey(new Date().toISOString());
}

/** Whether any digest for this project/day/locale already exists (parsed from ids). */
function dayLocaleKey(slug: string, key: string, locale: string) {
  return `${slug}::${key}::${locale}`;
}

function existingDayLocales(existingIds: Set<string>): Set<string> {
  const set = new Set<string>();
  for (const id of existingIds) {
    const [slug, rest] = id.split("-changelog-");
    if (!rest) continue;
    const segs = rest.split("-"); // [dayKey, index, locale]
    if (segs.length < 3) continue;
    set.add(dayLocaleKey(slug, segs[0], segs[segs.length - 1]));
  }
  return set;
}

async function generateDayDigests(
  project: PortfolioProject,
  key: string,
  commits: PortfolioCommit[],
  locale: string,
): Promise<ActivityItem[]> {
  const language = LANGUAGE_NAMES[locale] ?? "English";
  const user = [
    `Project: ${project.name}`,
    `Description: ${project.description}`,
    `Stack: ${project.stack.join(", ")}`,
    `Commits this day (${commits.length}, newest first):`,
    ...commits.map((commit) => `- ${commit.message}`),
  ].join("\n");

  const raw = await completeJson(
    digestSystemPrompt(language, portfolioConfig.ai.newsMaxPerDay),
    user,
  );
  if (!raw) return [];

  const drafts = parseChangelogDrafts(raw).slice(0, portfolioConfig.ai.newsMaxPerDay);
  const latestMs = new Date(commits[0].date).getTime();

  return drafts.map((draft, index) => ({
    id: `${project.slug}-changelog-${key}-${index}-${locale}`,
    projectSlug: project.slug,
    projectName: project.name,
    title: draft.headline,
    summary: draft.body,
    // Offset by index so multiple entries in one day keep a stable order.
    date: new Date(latestMs - index * 1000).toISOString(),
    href: commits[0].url,
    type: "changelog",
    tags: draft.tags,
    locale,
  }));
}

/** Run async tasks with a small concurrency cap to respect provider rate limits. */
async function mapPool<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = [];
  let cursor = 0;
  async function worker() {
    while (cursor < items.length) {
      const index = cursor++;
      results[index] = await fn(items[index]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

/**
 * Generate daily-digest news, per project / day / locale. The model decides how
 * many entries each day deserves (1 for a normal day, up to `newsMaxPerDay` for
 * distinct features, 0 for trivial days). Past days already generated are skipped
 * (idempotent); the still-open current day is refreshed. The number of model
 * calls is capped per run so a large backfill spreads over several syncs and
 * stays within API rate limits.
 */
export async function generateChangelogActivity(
  projects: PortfolioProject[],
  existingIds: Set<string> = new Set(),
): Promise<ActivityItem[]> {
  if (!isAiConfigured()) return [];

  const { newsDays, maxNewsPerSync } = portfolioConfig.ai;
  const today = currentDayKey();
  const done = existingDayLocales(existingIds);

  type Job = {
    project: PortfolioProject;
    key: string;
    commits: PortfolioCommit[];
    locale: string;
    ts: number;
  };
  const jobs: Job[] = [];

  for (const project of projects) {
    // Group this project's non-merge commits by day (latestCommits is newest-first).
    const byDay = new Map<string, PortfolioCommit[]>();
    for (const commit of project.latestCommits) {
      if (commit.message.startsWith("Merge ")) continue;
      const key = dayKey(commit.date);
      const existing = byDay.get(key);
      if (existing) existing.push(commit);
      else byDay.set(key, [commit]);
    }

    const days = [...byDay.keys()].sort().reverse().slice(0, newsDays);
    for (const locale of portfolioConfig.locale.supported) {
      for (const key of days) {
        const commits = byDay.get(key)!;
        // Regenerate the still-open current day; skip already-generated past days.
        if (done.has(dayLocaleKey(project.slug, key, locale)) && key !== today) {
          continue;
        }
        jobs.push({ project, key, commits, locale, ts: new Date(commits[0].date).getTime() });
      }
    }
  }

  // Newest days first, capped per run (skip-existing lets the rest fill in later).
  jobs.sort((a, b) => b.ts - a.ts);
  const batch = jobs.slice(0, maxNewsPerSync);

  const results = await mapPool(batch, 2, (job) =>
    generateDayDigests(job.project, job.key, job.commits, job.locale),
  );
  return results.flat();
}
