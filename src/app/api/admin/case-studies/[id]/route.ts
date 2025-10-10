import { NextResponse, NextRequest } from "next/server";
import { cookies } from "next/headers";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get("admin")?.value === "1";
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const { id } = await ctx.params;
  const { title, slug, summary, content, coverUrl, tags } = body || {};
  const updated = await prisma.caseStudy.update({ where: { id }, data: { title, slug, summary, content, coverUrl, tags } });
  return NextResponse.json({ caseStudy: updated });
}

export async function DELETE(_: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get("admin")?.value === "1";
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  await prisma.caseStudy.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}


