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
  if (!name || !email || !packageId) return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  const booking = await prisma.booking.create({ data: { name, email, phone: phone || undefined, notes: notes || undefined, packageId } });
  return NextResponse.json({ booking });
}


