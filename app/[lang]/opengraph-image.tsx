import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { portfolioConfig, type Locale } from "@/portfolio.config";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

async function loadAvatar(): Promise<string | null> {
  try {
    const file = join(process.cwd(), "public", portfolioConfig.avatar.replace(/^\//, ""));
    const data = await readFile(file);
    const ext = portfolioConfig.avatar.endsWith(".png") ? "png" : "jpeg";
    return `data:image/${ext};base64,${data.toString("base64")}`;
  } catch {
    return null;
  }
}

export default async function OgImage({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await params;
  const { name, role, url } = portfolioConfig;
  const avatar = await loadAvatar();

  return new ImageResponse(
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        height: "100%",
        padding: "80px",
        backgroundColor: "#09090b",
        backgroundImage:
          "radial-gradient(circle at 85% 15%, rgba(45,212,191,0.12), transparent 45%)",
        gap: "64px",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
        <p
          style={{
            fontSize: "22px",
            letterSpacing: "4px",
            textTransform: "uppercase",
            color: "#2dd4bf",
            margin: 0,
          }}
        >
          {role[lang]}
        </p>
        <p
          style={{
            fontSize: "72px",
            fontWeight: 700,
            color: "#fafafa",
            margin: 0,
            lineHeight: 1.05,
          }}
        >
          {name}
        </p>
        <p style={{ fontSize: "24px", color: "#71717a", margin: 0, marginTop: "12px" }}>
          {url.replace("https://", "")}
        </p>
      </div>

      {avatar ? (
        <img
          src={avatar}
          width={340}
          height={340}
          style={{
            width: "340px",
            height: "340px",
            borderRadius: "28px",
            objectFit: "cover",
            border: "1px solid #27272a",
            flexShrink: 0,
          }}
        />
      ) : null}
    </div>,
    { ...size },
  );
}
