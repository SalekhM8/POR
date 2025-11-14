import { prisma } from "@/lib/prisma";
import { getCached, setCache, cachedResponse } from "@/lib/cache";

export async function GET() {
  // Cache case studies for 5 minutes
  const cacheKey = 'cases:all';
  const cached = getCached<{ cases: unknown[] }>(cacheKey);
  if (cached) {
    return cachedResponse(cached, 300);
  }

  const cases = await prisma.caseStudy.findMany({ orderBy: { createdAt: "desc" } });
  const result = { cases };
  setCache(cacheKey, result, 300);
  return cachedResponse(result, 300);
}




