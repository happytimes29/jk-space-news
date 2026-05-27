import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const title = searchParams.get("title") ?? "JK Space News";
  const category = searchParams.get("category") ?? "科技";

  const CATEGORY_COLORS: Record<string, string> = {
    AI: "#0070F3",
    硬體: "#10b981",
    數位創業: "#a855f7",
    科技: "#f59e0b",
  };
  const accentColor = CATEGORY_COLORS[category] || "#0070F3";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "60px 64px",
          background: "#000000",
          fontFamily: "system-ui, -apple-system, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Grid background */}
        <div
          style={{
            position: "absolute",
            inset: "0",
            backgroundImage: `linear-gradient(rgba(0,112,243,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,112,243,0.04) 1px, transparent 1px)`,
            backgroundSize: "48px 48px",
          }}
        />

        {/* Glow orb */}
        <div
          style={{
            position: "absolute",
            bottom: "-100px",
            left: "-100px",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background: `radial-gradient(circle, ${accentColor}22 0%, transparent 70%)`,
          }}
        />

        {/* Top: Logo + Category */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "8px",
                background: "#0070F3",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "18px",
                color: "white",
                fontWeight: 900,
              }}
            >
              ⚡
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ color: "#EDEDED", fontSize: "16px", fontWeight: 700, letterSpacing: "-0.5px" }}>
                JK Space News
              </span>
              <span style={{ color: "#888888", fontSize: "11px" }}>
                AI & 科技情報站
              </span>
            </div>
          </div>

          {/* Category badge */}
          <div
            style={{
              padding: "6px 16px",
              borderRadius: "999px",
              border: `1px solid ${accentColor}66`,
              background: `${accentColor}11`,
              color: accentColor,
              fontSize: "12px",
              fontWeight: 600,
              letterSpacing: "1px",
            }}
          >
            {category.toUpperCase()}
          </div>
        </div>

        {/* Title */}
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            padding: "32px 0",
          }}
        >
          <h1
            style={{
              color: "#EDEDED",
              fontSize: title.length > 30 ? "38px" : "48px",
              fontWeight: 800,
              lineHeight: 1.25,
              letterSpacing: "-1px",
              margin: 0,
              maxWidth: "900px",
            }}
          >
            {title}
          </h1>
        </div>

        {/* Bottom: accent line + domain */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "32px",
                height: "3px",
                borderRadius: "2px",
                background: accentColor,
              }}
            />
            <span style={{ color: "#888888", fontSize: "13px" }}>jkspacenews.com</span>
          </div>
          <span style={{ color: "#444444", fontSize: "12px" }}>
            {new Date().toLocaleDateString("zh-TW", { year: "numeric", month: "long", day: "numeric" })}
          </span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
