import type { Metadata } from "next";
import { Hero } from "@/components/home/hero";
import { CityInsights, CityNumbers, CtaBand, HowItWorks, RolesSection, ServicesPreview } from "@/components/home/home-sections";
import { pageMetadata } from "@/lib/metadata";
import { getCategories, getPublicStats } from "@/lib/server/public-api";

export const metadata: Metadata = pageMetadata({
  title: "CityCare | Report city problems and track every fix",
  description:
    "Report potholes, dark street lights, water leaks and missed garbage pickups in Dhaka. Get a tracking code, a deadline and a named staff member.",
  path: "/",
  absoluteTitle: true,
});

export default async function HomePage() {
  const [stats, categories] = await Promise.all([getPublicStats(), getCategories()]);

  return (
    <>
      <Hero stats={stats} />
      <CityNumbers stats={stats} />
      <HowItWorks />
      <ServicesPreview categories={categories} stats={stats} />
      <CityInsights stats={stats} />
      <RolesSection />
      <CtaBand />
    </>
  );
}
