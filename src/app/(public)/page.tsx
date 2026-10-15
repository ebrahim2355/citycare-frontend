import type { Metadata } from "next";
import { Hero } from "@/components/home/hero";
import { CityInsights, CtaBand, HowItWorks, RolesSection, ServicesPreview, StatsStrip } from "@/components/home/home-sections";
import { getCategories, getPublicStats } from "@/lib/server/public-api";

export const metadata: Metadata = {
  title: { absolute: "CityCare | Report city problems and track every fix" },
  description:
    "Report potholes, dark street lights, water leaks and missed garbage pickups in Dhaka. Get a tracking code, a deadline and a named staff member.",
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const [stats, categories] = await Promise.all([getPublicStats(), getCategories()]);

  return (
    <>
      <Hero stats={stats} />
      <StatsStrip stats={stats} />
      <HowItWorks />
      <ServicesPreview categories={categories} />
      <CityInsights stats={stats} />
      <RolesSection />
      <CtaBand />
    </>
  );
}
