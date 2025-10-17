import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
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
  return NextResponse.json({ packages: ordered });
}



