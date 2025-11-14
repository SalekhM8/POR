import { NextResponse, NextRequest } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { clearCache } from "@/lib/cache";

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get("admin")?.value === "1";
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const { id } = await ctx.params;
  const { title, slug, description, features, priceCents, durationMin, imageUrl, tier, category } = body || {};
  const updated = await prisma.package.update({
    where: { id },
    data: { title, slug, description, features, priceCents, durationMin, imageUrl, ...(tier ? { tier } : {}), ...(category ? { category } : {}) },
  });
  clearCache('packages'); // Invalidate packages cache
  return NextResponse.json({ package: updated });
}

export async function DELETE(_: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get("admin")?.value === "1";
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  await prisma.package.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}


