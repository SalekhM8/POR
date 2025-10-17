import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const formData = await req.formData();
  const name = String(formData.get("name") || "");
  const email = String(formData.get("email") || "");
  const phone = formData.get("phone") ? String(formData.get("phone")) : null;
  const notes = formData.get("notes") ? String(formData.get("notes")) : null;
  const packageId = String(formData.get("packageId") || "");
  const startIso = formData.get("start"); // ISO string
  if (!name || !email || !packageId || !startIso) return NextResponse.json({ error: "Missing required fields" }, { status: 400 });

  const pkg = await prisma.package.findUnique({ where: { id: packageId } });
  if (!pkg) return NextResponse.json({ error: "Unknown package" }, { status: 404 });
  const start = new Date(String(startIso));
  if (isNaN(start.getTime())) return NextResponse.json({ error: "Invalid start" }, { status: 400 });
  const end = new Date(start);
  end.setUTCMinutes(end.getUTCMinutes() + pkg.durationMin);

  // Buffer after booking
  const BUFFER_MIN = 15;
  const startWithLead = new Date(start);
  const endWithBuffer = new Date(end);
  endWithBuffer.setUTCMinutes(endWithBuffer.getUTCMinutes() + BUFFER_MIN);

  // Check overlap with existing bookings
  const conflict = await prisma.booking.findFirst({
    where: {
      startTime: { lt: endWithBuffer },
      endTime: { gt: startWithLead },
    },
    select: { id: true },
  });
  if (conflict) return NextResponse.json({ error: "Slot taken" }, { status: 409 });

  const booking = await prisma.booking.create({ data: { name, email, phone: phone || undefined, notes: notes || undefined, packageId, startTime: start, endTime: end } });
  return NextResponse.json({ booking, redirect: "/booking/confirmed" });
}



