import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { siteConfig } from "@/lib/site-config";
import { ogTypeLabel } from "@/lib/seo";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const title = searchParams.get("title") ?? siteConfig.title;
  const label = ogTypeLabel(searchParams.get("type"));
  const accentColor = "#38bdf8";

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
          background: "#09090b",
          fontFamily: "system-ui, -apple-system, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Grid background */}
        <svg width="1200" height="630" style={{ position: "absolute", top: 0, left: 0 }}>
          {Array.from({ length: 26 }, (_, index) => <line key={`x-${index}`} x1={index * 48} y1="0" x2={index * 48} y2="630" stroke="#38bdf8" strokeOpacity="0.12" />)}
          {Array.from({ length: 14 }, (_, index) => <line key={`y-${index}`} x1="0" y1={index * 48} x2="1200" y2={index * 48} stroke="#38bdf8" strokeOpacity="0.12" />)}
        </svg>

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

        {/* Top: Logo + content type */}
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
                {siteConfig.name}
              </span>
              <span style={{ color: "#888888", fontSize: "11px" }}>
                {siteConfig.tagline}
              </span>
            </div>
          </div>

          {/* Content type */}
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
            {label}
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
            <span style={{ color: "#888888", fontSize: "13px" }}>{new URL(siteConfig.url).host}</span>
          </div>
          <span style={{ color: "#444444", fontSize: "12px" }}>
            ENGINEERING LAB
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
