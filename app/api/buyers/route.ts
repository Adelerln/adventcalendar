import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { saveBuyer } from "@/lib/buyers-store";
import { attachBuyerSession } from "@/lib/server-session";
import { supabaseServer } from "@/lib/supabase";

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

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (supabaseUrl && supabaseServiceRole) {
      const supabase = supabaseServer();
      const { data, error: supabaseError } = await supabase
        .from("buyers")
        .insert({
          plan,
          full_name: fullName,
          phone,
          email: email.toLowerCase(),
          password_hash: passwordHash,
        })
        .select("id, plan, full_name")
        .single();

      if (supabaseError) {
        throw supabaseError;
      }

      return respondWithSession({
        id: data.id,
        plan: data.plan,
        fullName: data.full_name,
      });
    }

    console.warn("Supabase env vars missing; falling back to in-memory buyers store.");
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
