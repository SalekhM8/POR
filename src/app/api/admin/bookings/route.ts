import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { PrismaClient, BookingStatus } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get("admin")?.value === "1";
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const bookings = await prisma.booking.findMany({ include: { package: true }, orderBy: { createdAt: "desc" } });
  return NextResponse.json({ bookings });
}

export async function PATCH(req: Request) {
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get("admin")?.value === "1";
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const { id, status } = body || {};
  if (!id || !status || !["pending","confirmed","cancelled"].includes(status)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const updated = await prisma.booking.update({ where: { id }, data: { status: status as BookingStatus } });
  return NextResponse.json({ booking: updated });
}


