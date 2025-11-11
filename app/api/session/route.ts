import { NextRequest, NextResponse } from "next/server";
import { compare } from "bcryptjs";
import { db } from "@/lib/db";
import { findBuyerByEmail } from "@/lib/buyers-store";
import { attachBuyerSession, clearBuyerSession, readBuyerSession } from "@/lib/server-session";

export async function GET(req: NextRequest) {
  const session = readBuyerSession(req);
  return NextResponse.json({ user: session ?? null });
}

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  if (!email || !password) {
    return NextResponse.json({ error: "Email et mot de passe requis." }, { status: 400 });
  }

  const buyer = await findBuyerForAuth(email.toLowerCase());
  if (!buyer) {
    return NextResponse.json({ error: "Identifiants invalides." }, { status: 401 });
  }

  const valid = await compare(password, buyer.password_hash);
  if (!valid) {
    return NextResponse.json({ error: "Identifiants invalides." }, { status: 401 });
  }

  const session = { id: buyer.id, plan: buyer.plan, name: buyer.full_name };
  const response = NextResponse.json({ user: session }, { status: 200 });
  return attachBuyerSession(response, session);
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  return clearBuyerSession(response);
}

async function findBuyerForAuth(email: string) {
  if (db) {
    const { rows } = await db.query(
      `SELECT id, plan, full_name, password_hash FROM buyers WHERE email = $1 LIMIT 1`,
      [email]
    );
    if (rows[0]) {
      return rows[0];
    }
  }
  return findBuyerByEmail(email);
}
