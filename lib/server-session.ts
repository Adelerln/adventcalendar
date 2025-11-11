import { NextRequest, NextResponse } from "next/server";

export type BuyerSession = {
  id: string;
  plan: string;
  name: string;
};

const COOKIE_NAME = "buyer_session";
const baseCookie = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/"
};

export function attachBuyerSession(response: NextResponse, session: BuyerSession) {
  response.cookies.set(COOKIE_NAME, JSON.stringify(session), {
    ...baseCookie,
    maxAge: 60 * 60 * 24 * 30
  });
  return response;
}

export function clearBuyerSession(response: NextResponse) {
  response.cookies.set(COOKIE_NAME, "", {
    ...baseCookie,
    maxAge: 0
  });
  return response;
}

export function readBuyerSession(req: NextRequest): BuyerSession | null {
  const cookie = req.cookies.get(COOKIE_NAME);
  if (!cookie?.value) return null;
  try {
    return JSON.parse(cookie.value) as BuyerSession;
  } catch {
    return null;
  }
}
