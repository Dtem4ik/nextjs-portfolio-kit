import { ImageResponse } from "next/og";
import { portfolioConfig } from "@/portfolio.config";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

const initials = portfolioConfig.name
  .split(" ")
  .map((part) => part[0])
  .join("")
  .slice(0, 2)
  .toUpperCase();

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#09090b",
        color: "#fafafa",
        fontSize: 88,
        fontWeight: 700,
        fontFamily: "monospace",
        letterSpacing: -4,
      }}
    >
      {initials}
    </div>,
    { ...size },
  );
}
