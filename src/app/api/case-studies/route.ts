import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  const cases = await prisma.caseStudy.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ cases });
}


