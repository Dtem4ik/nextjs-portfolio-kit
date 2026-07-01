import { NextResponse } from "next/server";
import { generateChangelogActivity } from "@/lib/portfolio/ai";
import { buildFreshPortfolioData } from "@/lib/portfolio/data";
import { isSupabaseConfigured, persistPortfolioSnapshot } from "@/lib/portfolio/supabase";

export async function GET(request: Request) {
  // The snapshot cache is optional; there is nothing to sync without Supabase.
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { ok: false, reason: "Supabase integration is disabled." },
      { status: 200 },
    );
  }

  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await buildFreshPortfolioData();

  // Generate AI news/changelog entries from the fresh commits. When any are
  // produced, the public feed becomes those polished entries plus releases
  // (raw per-commit noise is dropped); otherwise the raw activity is kept.
  const changelog = await generateChangelogActivity(data.projects);
  if (changelog.length > 0) {
    const releases = data.activity.filter((item) => item.type === "release");
    data.activity = [...changelog, ...releases].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
  }

  const persisted = await persistPortfolioSnapshot(data);

  return NextResponse.json({
    ok: true,
    persisted,
    source: data.source,
    projects: data.projects.length,
    changelogItems: changelog.length,
    activityItems: data.activity.length,
    generatedAt: data.generatedAt,
  });
}
