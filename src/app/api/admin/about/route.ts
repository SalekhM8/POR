import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  const about = await prisma.about.findFirst({ orderBy: { updatedAt: "desc" } });
  return NextResponse.json({ about });
}

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get("admin")?.value === "1";
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const { heading, content, heroUrl } = body || {};
  if (!heading || !content) return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  const existing = await prisma.about.findFirst();
  const saved = existing
    ? await prisma.about.update({ where: { id: existing.id }, data: { heading, content, heroUrl } })
    : await prisma.about.create({ data: { heading, content, heroUrl } });
  return NextResponse.json({ about: saved });
}



