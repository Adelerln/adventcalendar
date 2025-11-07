import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname.startsWith("/open/calendar")) {
    // @ts-ignore
    const cookie = req.cookies.get?.("recipient_session");
    if (!cookie) {
      const url = req.nextUrl.clone();
      url.pathname = "/open/expired";
      return NextResponse.redirect(url);
    }
  }
  return NextResponse.next();
}
