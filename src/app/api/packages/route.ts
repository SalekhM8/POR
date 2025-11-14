import { prisma } from "@/lib/prisma";
import { getCached, setCache, cachedResponse } from "@/lib/cache";

export async function GET() {
  // Cache packages for 5 minutes (they don't change often)
  const cacheKey = 'packages:all';
  const cached = getCached<{ packages: unknown[] }>(cacheKey);
  if (cached) {
    return cachedResponse(cached, 300);
  }

  const packages = await prisma.package.findMany();
  const rank: Record<string, number> = { platinum: 0, gold: 1, silver: 2, bronze: 3 };
  const ordered = packages
    .slice()
    .sort((a, b) => {
      const ra = rank[(a.tier || "").toLowerCase()] ?? 999;
      const rb = rank[(b.tier || "").toLowerCase()] ?? 999;
      if (ra !== rb) return ra - rb;
      return a.priceCents - b.priceCents; // tiebreaker
    });
  
  const result = { packages: ordered };
  setCache(cacheKey, result, 300);
  return cachedResponse(result, 300);
}



