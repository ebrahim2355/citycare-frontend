import type { Metadata } from "next";
import { SITE } from "@/lib/site";

interface PageMetadata {
  title: string;
  description: string;
  path: string;
  absoluteTitle?: boolean;
  index?: boolean;
}

const SHARE_IMAGE = { url: "/opengraph-image", width: 1200, height: 630, alt: "CityCare: report city problems and track every fix" };

export const pageMetadata = ({ title, description, path, absoluteTitle = false, index = true }: PageMetadata): Metadata => {
  const fullTitle = absoluteTitle ? title : `${title} | ${SITE.name}`;

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    openGraph: { type: "website", siteName: SITE.name, locale: "en_US", title: fullTitle, description, url: path, images: [SHARE_IMAGE] },
    twitter: { card: "summary_large_image", title: fullTitle, description, images: [SHARE_IMAGE.url] },
    ...(index ? {} : { robots: { index: false } }),
  };
};
