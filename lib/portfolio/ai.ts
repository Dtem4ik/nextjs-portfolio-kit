import "server-only";
import { portfolioConfig } from "@/portfolio.config";
import { buildAskContext, getPortfolioData } from "@/lib/portfolio/data";
import type { ActivityItem, PortfolioProject } from "@/lib/portfolio/types";

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

/**
 * Low-level Gemini (Google AI Studio) text call. Returns the raw model text, or
 * null on any failure/missing key. Set `json` to ask the model for JSON output.
 */
/** Primary model first, then the configured fallbacks (Gemini only). */
function geminiModelChain(): string[] {
  const fallbacks = (
    "fallbackModels" in portfolioConfig.ai ? portfolioConfig.ai.fallbackModels : []
  ) as readonly string[];
  return [portfolioConfig.ai.model, ...fallbacks];
}

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

  // Try each model in the chain; move to the next on quota/404/5xx/empty.
  for (const model of geminiModelChain()) {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });

    if (!response.ok) continue;

    const payload = (await response.json().catch(() => null)) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    } | null;

    const text = payload?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (text) return text;
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

// ---------------------------------------------------------------------------
// AI changelog / news generation
//
// Turns a project's recent commits into a polished, plain-language news entry.
// Runs during the cron sync (never per page view) and the result is cached in
// Supabase, so visitors read pre-generated content and the model is called at
// most once per project per sync.
// ---------------------------------------------------------------------------

const CHANGELOG_SYSTEM =
  "You are a technical writer producing changelog/news entries for a developer's portfolio. " +
  "Given a project's recent commits, write ONE engaging, plain-language update describing what " +
  "changed and why it matters to a reader. Avoid raw commit jargon and do not just list commits. " +
  'Respond with ONLY minified JSON of the shape {"headline": string, "body": string, "tags": string[]} ' +
  "where headline is <= 70 characters, body is 2-3 sentences, and tags is 2-4 short lowercase topic tags.";

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

function parseChangelogDraft(raw: string): ChangelogDraft | null {
  try {
    // Providers occasionally wrap JSON in ```json fences; strip them.
    const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
    const parsed = JSON.parse(cleaned) as Partial<ChangelogDraft>;
    if (typeof parsed.headline !== "string" || typeof parsed.body !== "string") return null;
    return {
      headline: parsed.headline.trim(),
      body: parsed.body.trim(),
      tags: Array.isArray(parsed.tags)
        ? parsed.tags.filter((tag): tag is string => typeof tag === "string").slice(0, 4)
        : [],
    };
  } catch {
    return null;
  }
}

async function generateProjectChangelog(project: PortfolioProject): Promise<ActivityItem | null> {
  const commits = project.latestCommits.slice(0, 6);
  if (commits.length === 0) return null;

  const user = [
    `Project: ${project.name}`,
    `Description: ${project.description}`,
    `Stack: ${project.stack.join(", ")}`,
    "Recent commits:",
    ...commits.map((commit) => `- ${commit.message}`),
  ].join("\n");

  const raw = await completeJson(CHANGELOG_SYSTEM, user);
  if (!raw) return null;

  const draft = parseChangelogDraft(raw);
  if (!draft) return null;

  return {
    id: `${project.slug}-changelog-${commits[0].sha}`,
    projectSlug: project.slug,
    projectName: project.name,
    title: draft.headline,
    summary: draft.body,
    date: commits[0].date,
    href: project.sourceUrl,
    type: "changelog",
    tags: draft.tags,
  };
}

/**
 * Generate one AI news/changelog entry per project (best effort). Projects that
 * fail generation are simply skipped, so the caller keeps its raw activity.
 */
export async function generateChangelogActivity(
  projects: PortfolioProject[],
): Promise<ActivityItem[]> {
  if (!isAiConfigured()) return [];

  const items = await Promise.all(projects.map((project) => generateProjectChangelog(project)));
  return items.filter((item): item is ActivityItem => item !== null);
}
