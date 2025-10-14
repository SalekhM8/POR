import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get("admin")?.value === "1";
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const packages = await prisma.package.findMany({ orderBy: { updatedAt: "desc" } });
  return NextResponse.json({ packages });
}

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get("admin")?.value === "1";
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const {
    title,
    slug,
    description,
    features = [],
    priceCents,
    durationMin,
    imageUrl,
    tier,
  } = body || {};
  if (!title || !slug || !description || typeof priceCents !== "number" || typeof durationMin !== "number") {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  const pkg = await prisma.package.create({
    data: {
      title,
      slug,
      description,
      features,
      priceCents,
      durationMin,
      imageUrl,
      tier,
    },
  });
  return NextResponse.json({ package: pkg });
}


