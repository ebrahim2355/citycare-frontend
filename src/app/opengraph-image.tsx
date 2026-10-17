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
        background: "linear-gradient(135deg, #0f766e 0%, #115e59 55%, #134e4a 100%)",
        color: "white",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
        <svg width="72" height="72" viewBox="0 0 32 32">
          <rect width="32" height="32" rx="8" fill="#ffffff" />
          <path
            d="M16 6.5c-4.4 0-8 3.4-8 7.7 0 5.6 6.6 11 7.3 11.6a1.1 1.1 0 0 0 1.4 0c.7-.6 7.3-6 7.3-11.6 0-4.3-3.6-7.7-8-7.7Z"
            fill="#0f766e"
          />
          <path d="m12.6 14.3 2.3 2.3 4.6-4.6" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <div style={{ fontSize: "44px", fontWeight: 700 }}>CityCare</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div style={{ fontSize: "76px", fontWeight: 800, lineHeight: 1.05 }}>Report it. Track it. See it fixed.</div>
        <div style={{ fontSize: "32px", opacity: 0.85 }}>
          Potholes, street lights, water leaks and waste pickups in Dhaka, with a deadline and a named staff member.
        </div>
      </div>
      <div style={{ display: "flex", gap: "16px", fontSize: "26px" }}>
        {["Free complaints", "Paid home services", "Live tracking"].map((label) => (
          <div key={label} style={{ padding: "10px 22px", borderRadius: "999px", background: "rgba(255,255,255,0.14)" }}>
            {label}
          </div>
        ))}
      </div>
    </div>,
    size
  );
}
