import { NextResponse } from "next/server";
import { generateChangelogActivity, isAiConfigured } from "@/lib/portfolio/ai";
import { buildFreshPortfolioData } from "@/lib/portfolio/data";
import {
  isSupabaseConfigured,
  persistPortfolioSnapshot,
  readExistingChangelogIds,
} from "@/lib/portfolio/supabase";

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

  let newChangelogItems = 0;
  if (isAiConfigured()) {
    // Only generate news for commits we haven't turned into entries yet, then
    // make the public feed those AI entries plus releases (raw commit noise is
    // dropped). Previously stored entries stay in the DB and still show on read.
    const existingIds = await readExistingChangelogIds();
    const changelog = await generateChangelogActivity(data.projects, existingIds);
    newChangelogItems = changelog.length;
    const releases = data.activity.filter((item) => item.type === "release");
    data.activity = [...changelog, ...releases];
  }

  const persisted = await persistPortfolioSnapshot(data);

  return NextResponse.json({
    ok: true,
    persisted,
    source: data.source,
    projects: data.projects.length,
    newChangelogItems,
    activityItems: data.activity.length,
    generatedAt: data.generatedAt,
  });
}
