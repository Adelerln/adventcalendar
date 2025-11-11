import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { db } from "@/lib/db";
import { saveBuyer } from "@/lib/buyers-store";
import { attachBuyerSession } from "@/lib/server-session";

type PostgresError = {
  code?: string;
};

export async function POST(req: Request) {
  const { plan, fullName, phone, email, password } = await req.json();

  if (!plan || !fullName || !phone || !email || !password) {
    return NextResponse.json({ error: "Champs manquants" }, { status: 400 });
  }

  try {
    const passwordHash = await hash(password, 12);

    if (db) {
      const { rows } = await db.query(
        `INSERT INTO buyers (plan, full_name, phone, email, password_hash)
         VALUES ($1,$2,$3,$4,$5)
         RETURNING id, plan, full_name`,
        [plan, fullName, phone, email.toLowerCase(), passwordHash]
      );
      const buyer = rows[0];
      return respondWithSession({
        id: buyer.id,
        plan: buyer.plan,
        fullName: buyer.full_name
      });
    }

    const fallbackBuyer = saveBuyer({
      plan,
      full_name: fullName,
      phone,
      email,
      password_hash: passwordHash,
    });

    return respondWithSession({
      id: fallbackBuyer.id,
      plan: fallbackBuyer.plan,
      fullName
    });
  } catch (error: unknown) {
    if (isPgUniqueViolation(error)) {
      return NextResponse.json({ error: "Email déjà utilisé" }, { status: 409 });
    }
    console.error("Error creating buyer", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

function isPgUniqueViolation(error: unknown): error is PostgresError {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof (error as Record<string, unknown>).code === "string" &&
    (error as PostgresError).code === "23505"
  );
}

function respondWithSession(data: { id: string; plan: string; fullName: string }) {
  const session = {
    id: data.id,
    plan: data.plan,
    name: data.fullName
  };
  const response = NextResponse.json({ buyer: session }, { status: 201 });
  return attachBuyerSession(response, session);
}
