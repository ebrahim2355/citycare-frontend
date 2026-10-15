import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { readEnvelope } from "@/lib/api/http";
import { callBackend } from "@/lib/server/backend";
import type { Category, Department, PublicStats } from "@/types";

export const CATALOG_TAG = "catalog";
export const PUBLIC_STATS_TAG = "public-stats";

const loadPublic = async <T>(path: string): Promise<T | null> => {
  try {
    const result = await callBackend<T>(path);

    return readEnvelope<T>(result.status, result.body).data;
  } catch {
    return null;
  }
};

export const getPublicStats = async () => {
  "use cache";
  cacheLife("minutes");
  cacheTag(PUBLIC_STATS_TAG);

  return loadPublic<PublicStats>("/stats/public");
};

export const getDepartments = async () => {
  "use cache";
  cacheLife("hours");
  cacheTag(CATALOG_TAG);

  return loadPublic<Department[]>("/departments");
};

export const getCategories = async () => {
  "use cache";
  cacheLife("hours");
  cacheTag(CATALOG_TAG);

  return loadPublic<Category[]>("/categories");
};
