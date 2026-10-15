const vercelUrl = process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL;

export const SITE = {
  name: "CityCare",
  description:
    "Report potholes, broken lights, water leaks and missed garbage pickups, request paid city services and follow every step until the job is done.",
  url: (process.env.NEXT_PUBLIC_SITE_URL || (vercelUrl ? `https://${vercelUrl}` : "http://localhost:3000")).replace(/\/$/, ""),
  apiDocsUrl: "https://citycare-backend.vercel.app/api/v1/docs",
  city: "Dhaka",
};
