import { ImageResponse } from "next/og";
import { portfolioConfig } from "@/portfolio.config";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

const initials = portfolioConfig.name
  .split(" ")
  .map((part) => part[0])
  .join("")
  .slice(0, 2)
  .toUpperCase();

export default function Icon() {
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
        fontSize: 15,
        fontWeight: 700,
        fontFamily: "monospace",
        letterSpacing: -1,
      }}
    >
      {initials}
    </div>,
    { ...size },
  );
}
