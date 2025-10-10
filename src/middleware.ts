import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const isAdminPath = req.nextUrl.pathname.startsWith("/admin");
  const reqHeaders = new Headers(req.headers);
  if (isAdminPath) {
    reqHeaders.set("x-admin", "1");
  }
  return NextResponse.next({ request: { headers: reqHeaders } });
}

export const config = {
  matcher: ["/admin"],
};



