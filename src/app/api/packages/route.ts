import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  const packages = await prisma.package.findMany({ orderBy: { priceCents: "asc" } });
  return NextResponse.json({ packages });
}


