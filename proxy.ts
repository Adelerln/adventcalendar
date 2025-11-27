/**
 * Global Middleware
 *
 * Corrige VULN-012: Middleware insuffisant
 * - Protège les routes /dashboard, /calendars, /gift
 * - Valide les JWT pour les sessions buyer et recipient
 * - Vérifie les expirations
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyBuyerSessionToken } from "./lib/jwt-session";
import { verifyRecipientSessionToken } from "./lib/jwt-session";

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ✅ 1. Protéger les routes dashboard/calendars/gift (buyer)
  const protectedBuyerRoutes = ["/dashboard", "/calendars", "/gift"];
  const isBuyerRoute = protectedBuyerRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isBuyerRoute) {
    const sessionCookie = req.cookies.get("buyer_session");

    if (!sessionCookie) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // ✅ Vérifier la validité du JWT
    const session = await verifyBuyerSessionToken(sessionCookie.value);

    if (!session) {
      // JWT invalide ou expiré → rediriger vers login
      const response = NextResponse.redirect(new URL("/login", req.url));
      response.cookies.set("buyer_session", "", { maxAge: 0 }); // Clear cookie
      return response;
    }
  }

  // ✅ 2. Protéger les routes recipient (/open/calendar)
  if (pathname.startsWith("/open/calendar")) {
    const recipientCookie = req.cookies.get("recipient_session");

    if (!recipientCookie) {
      return NextResponse.redirect(new URL("/open/expired", req.url));
    }

    // ✅ Vérifier la validité du JWT recipient
    const session = await verifyRecipientSessionToken(recipientCookie.value);

    if (!session) {
      // JWT invalide ou expiré → rediriger vers expired
      const response = NextResponse.redirect(new URL("/open/expired", req.url));
      response.cookies.set("recipient_session", "", { maxAge: 0 }); // Clear cookie
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/calendars/:path*",
    "/gift/:path*",
    "/open/:path*",
  ],
};
