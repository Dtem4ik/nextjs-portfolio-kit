import { NextResponse } from "next/server";
import { askPortfolio } from "@/lib/portfolio/ai";
import { portfolioConfig } from "@/portfolio.config";

// Basic in-memory rate limit. This is per-server-instance (not shared across
// regions), but it meaningfully caps abuse of a public, cost-bearing LLM
// endpoint. For hard guarantees, put a real limiter (Upstash, Vercel KV) here.
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 8;
const hits = new Map<string, number[]>();

function isRateLimited(key: string) {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((ts) => now - ts < WINDOW_MS);
  recent.push(now);
  hits.set(key, recent);
  return recent.length > MAX_REQUESTS;
}

export async function POST(request: Request) {
  // The Ask feature is opt-in; when it is off the endpoint does not exist.
  if (!portfolioConfig.features.ask) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  if (isRateLimited(ip)) {
    return NextResponse.json({ error: "Too many requests. Try again shortly." }, { status: 429 });
  }

  const body = (await request.json().catch(() => null)) as { question?: string } | null;
  const question = body?.question?.trim();

  if (!question) {
    return NextResponse.json({ error: "Question is required." }, { status: 400 });
  }

  const result = await askPortfolio(question);
  return NextResponse.json(result);
}
