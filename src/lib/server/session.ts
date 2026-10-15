import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { isApiError } from "@/lib/api/errors";
import { ROLE_HOME } from "@/lib/roles";
import { serverFetcher } from "@/lib/server/fetcher";
import { ACCESS_COOKIE, verifyAccessToken } from "@/lib/server/tokens";
import type { Role, User } from "@/types";

export const getSession = cache(async () => {
  const store = await cookies();

  return verifyAccessToken(store.get(ACCESS_COOKIE)?.value);
});

export const getCurrentUser = cache(async (): Promise<User | null> => {
  const session = await getSession();

  if (!session) {
    return null;
  }

  try {
    return await serverFetcher.get<User>("/users/me");
  } catch (error) {
    if (isApiError(error) && (error.status === 401 || error.status === 403)) {
      return null;
    }

    throw error;
  }
});

export const requireUser = async (roles?: Role[]) => {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (roles && !roles.includes(user.role)) {
    redirect(ROLE_HOME[user.role]);
  }

  return user;
};
