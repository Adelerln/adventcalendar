import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { saveBuyer } from "@/lib/buyers-store";
import { attachBuyerSession } from "@/lib/server-session";
import { supabaseServer } from "@/lib/supabase";
import { getPlanPricing } from "@/lib/plan-pricing";

export const runtime = "nodejs";

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
    const normalizedEmail = email.toLowerCase();
    const normalizedPhone = phone.trim() || null;
    const pricing = getPlanPricing(plan);

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (supabaseUrl && supabaseServiceRole) {
      const supabase = supabaseServer();
      let createdUserId: string | null = null;

      try {
        const { data: userResp, error: userError } = await supabase.auth.admin.createUser({
          email: normalizedEmail,
          password,
          email_confirm: true,
          phone: normalizedPhone ?? undefined,
          user_metadata: {
            full_name: fullName
          }
        });

        if (userError || !userResp?.user?.id) {
          throw userError ?? new Error("Impossible de créer l'utilisateur Supabase");
        }

        createdUserId = userResp.user.id;

        const { data, error: supabaseError } = await supabase
          .from("buyers")
          .insert({
            id: createdUserId,
            plan: pricing.plan,
            full_name: fullName,
            phone_e164: normalizedPhone,
            email: normalizedEmail,
            payment_status: "pending",
            payment_amount: pricing.amountCents / 100,
            stripe_payment_intent_id: null,
            stripe_checkout_session_id: null
          })
          .select("id, plan, full_name, payment_status, payment_amount")
          .single();

        if (supabaseError || !data) {
          if (createdUserId) {
            await supabase.auth.admin.deleteUser(createdUserId).catch(() => {});
          }
          throw supabaseError ?? new Error("Impossible d'enregistrer l'acheteur");
        }

        return respondWithSession({
          id: data.id,
          plan: data.plan,
          fullName: data.full_name
        });
      } catch (error) {
        if (
          error &&
          typeof error === "object" &&
          "status" in error &&
          (error as { status?: number }).status === 422
        ) {
          return NextResponse.json({ error: "Email déjà utilisé" }, { status: 409 });
        }
        console.error("Supabase buyers insert failed, falling back to in-memory store", error);
      }
    }

    console.warn("Supabase env vars missing; falling back to in-memory buyers store.");
    const fallbackBuyer = saveBuyer({
      plan: pricing.plan,
      full_name: fullName,
      phone: normalizedPhone ?? "",
      email: normalizedEmail,
      password_hash: passwordHash,
      payment_status: "pending",
      payment_amount: pricing.amountCents / 100,
      stripe_checkout_session_id: null,
      stripe_payment_intent_id: null
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
    const message = error instanceof Error ? error.message : "Erreur serveur";
    console.error("Error creating buyer", error);
    return NextResponse.json({ error: message }, { status: 500 });
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
