import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const formData = await req.formData();
  const name = String(formData.get("name") || "");
  const email = String(formData.get("email") || "");
  const phone = formData.get("phone") ? String(formData.get("phone")) : null;
  const message = String(formData.get("message") || "");
  const treatment = formData.get("treatment") ? String(formData.get("treatment")) : null;
  const source = String(formData.get("source") || "unknown");

  if (!name || !email || !message) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  await prisma.enquiry.create({
    data: { name, email, phone: phone || undefined, message, treatment: treatment || undefined, source },
  });

  return NextResponse.json({ ok: true });
}


