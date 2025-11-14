import { prisma } from "@/lib/prisma";
import { getCached, setCache, cachedResponse } from "@/lib/cache";

export async function GET() {
  // Cache about page for 10 minutes
  const cacheKey = 'about:latest';
  const cached = getCached<{ about: unknown }>(cacheKey);
  if (cached) {
    return cachedResponse(cached, 600);
  }

  const about = await prisma.about.findFirst({ orderBy: { updatedAt: "desc" } });
  const result = { about };
  setCache(cacheKey, result, 600);
  return cachedResponse(result, 600);
}




