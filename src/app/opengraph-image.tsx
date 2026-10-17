import { ImageResponse } from "next/og";

export const alt = "CityCare: report city problems and track every fix";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "72px",
        backgroundColor: "#0a152a",
        backgroundImage:
          "radial-gradient(circle at 85% 0%, rgba(98,216,166,0.22), transparent 45%), linear-gradient(140deg, #14223d 0%, #0a152a 75%)",
        color: "white",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "22px" }}>
        <svg width="76" height="76" viewBox="0 0 32 32">
          <rect x="0.5" y="0.5" width="31" height="31" rx="8" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.18)" />
          <path d="M22.5 10.5A8.5 8.5 0 1 0 22.5 21.5" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
          <path d="m12.5 16.2 2.6 2.6 5.4-5.6" fill="none" stroke="#62d8a6" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <div style={{ display: "flex", fontSize: "44px", fontWeight: 700 }}>
            City<span style={{ color: "#62d8a6" }}>Care</span>
          </div>
          <div style={{ fontSize: "22px", color: "#9facbe" }}>City services · Dhaka</div>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
        <div style={{ display: "flex", flexDirection: "column", fontSize: "78px", fontWeight: 700, lineHeight: 1.05 }}>
          <span>Report it. Track it.</span>
          <span style={{ color: "#62d8a6" }}>See it fixed.</span>
        </div>
        <div style={{ fontSize: "30px", color: "#c9d2df", maxWidth: "940px" }}>
          Potholes, street lights, water leaks and waste pickups, each with a deadline and a named staff member.
        </div>
      </div>
      <div style={{ display: "flex", gap: "14px", fontSize: "24px" }}>
        {["Free complaints", "Paid home services", "Live tracking"].map((label) => (
          <div
            key={label}
            style={{ padding: "10px 22px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.18)", background: "rgba(255,255,255,0.06)" }}
          >
            {label}
          </div>
        ))}
      </div>
    </div>,
    size
  );
}
