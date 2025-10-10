import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const formData = await req.formData();
  const password = String(formData.get("password") || "");
  const expected = process.env.ADMIN_PASSWORD || "changeme-admin";
  if (password !== expected) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set("admin", "1", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 8, // 8 hours
  });
  return res;
}





