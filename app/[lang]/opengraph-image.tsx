import { ImageResponse } from "next/og";
import { portfolioConfig, type Locale } from "@/portfolio.config";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await params;
  const { name, title, url } = portfolioConfig;

  return new ImageResponse(
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "flex-start",
        width: "100%",
        height: "100%",
        padding: "80px",
        backgroundColor: "#09090b",
        gap: "16px",
      }}
    >
      <p
        style={{
          fontSize: "56px",
          fontWeight: 700,
          color: "#fafafa",
          margin: 0,
          lineHeight: 1.1,
        }}
      >
        {name}
      </p>
      <p
        style={{
          fontSize: "28px",
          color: "#a1a1aa",
          margin: 0,
        }}
      >
        {title[lang]}
      </p>
      <p
        style={{
          fontSize: "20px",
          color: "#52525b",
          margin: 0,
          marginTop: "8px",
        }}
      >
        {url.replace("https://", "")}
      </p>
    </div>,
    { ...size },
  );
}
