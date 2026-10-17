import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#14223d" }}>
      <svg width="132" height="132" viewBox="0 0 32 32">
        <path d="M22.5 10.5A8.5 8.5 0 1 0 22.5 21.5" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
        <path d="m12.5 16.2 2.6 2.6 5.4-5.6" fill="none" stroke="#62d8a6" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>,
    size
  );
}
