import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get("admin")?.value === "1";
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const cases = await prisma.caseStudy.findMany({ orderBy: { updatedAt: "desc" } });
  return NextResponse.json({ cases });
}

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get("admin")?.value === "1";
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const { title, slug, summary, content, coverUrl, tags = [] } = body || {};
  if (!title || !slug || !summary || !content) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  const cs = await prisma.caseStudy.create({
    data: { title, slug, summary, content, coverUrl, tags },
  });
  return NextResponse.json({ caseStudy: cs });
}


