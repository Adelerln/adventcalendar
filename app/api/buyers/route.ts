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
        // Si un buyer existe déjà en base, on retourne directement le conflit
        const existingBuyer = await findBuyerByEmailSupabase(supabase, normalizedEmail);
        if (existingBuyer) {
          return NextResponse.json({ error: "Email déjà utilisé" }, { status: 409 });
        }

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
        // Email déjà utilisé dans auth: on tente de réutiliser le compte existant s'il n'y a pas de buyer.
        if (isSupabaseEmailConflict(error)) {
          try {
            const existingUserId = await findAuthUserIdByEmail(supabase, normalizedEmail);
            if (!existingUserId) {
              return NextResponse.json({ error: "Email déjà utilisé" }, { status: 409 });
            }

            // Si aucun buyer associé, on le crée et on met à jour le mot de passe
            const { data: buyerRow } = await supabase
              .from("buyers")
              .select("id, plan, full_name, email, payment_status")
              .eq("id", existingUserId)
              .maybeSingle();

            if (!buyerRow) {
              // Mettre à jour le mot de passe de l'utilisateur existant
              await supabase.auth.admin.updateUserById(existingUserId, { password });

              const { data, error: supabaseError } = await supabase
                .from("buyers")
                .insert({
                  id: existingUserId,
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
                throw supabaseError ?? new Error("Impossible d'enregistrer l'acheteur");
              }

              return respondWithSession({
                id: data.id,
                plan: data.plan,
                fullName: data.full_name
              });
            }

            const existingBuyerEmail = (buyerRow.email ?? "").trim();

            // Buyer existe mais sans email: on met à jour ses infos et on continue
            if (!existingBuyerEmail) {
              await supabase.auth.admin
                .updateUserById(existingUserId, { password, phone: normalizedPhone ?? undefined })
                .catch((updateError) => {
                  console.warn("Supabase auth update failed for existing user", updateError);
                });

              const { data: updatedBuyer, error: updateError } = await supabase
                .from("buyers")
                .update({
                  email: normalizedEmail,
                  phone_e164: normalizedPhone,
                  full_name: buyerRow.full_name ?? fullName,
                  plan: buyerRow.plan ?? pricing.plan
                })
                .eq("id", existingUserId)
                .select("id, plan, full_name, payment_status")
                .maybeSingle();

              if (updateError || !updatedBuyer) {
                throw updateError ?? new Error("Impossible de mettre à jour l'acheteur existant");
              }

              return respondWithSession({
                id: updatedBuyer.id,
                plan: updatedBuyer.plan ?? pricing.plan,
                fullName: updatedBuyer.full_name ?? fullName
              });
            }

            // Buyer déjà existant pour cet email avec email renseigné
            return NextResponse.json({ error: "Email déjà utilisé" }, { status: 409 });
          } catch (reuseError) {
            console.error("Supabase reuse existing auth user failed", reuseError);
            return NextResponse.json({ error: "Email déjà utilisé" }, { status: 409 });
          }
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

function isSupabaseEmailConflict(error: unknown) {
  return (
    error &&
    typeof error === "object" &&
    "status" in error &&
    (error as { status?: number }).status === 422
  );
}

async function findAuthUserIdByEmail(
  supabase: ReturnType<typeof supabaseServer>,
  email: string
): Promise<string | null> {
  const { data, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (error) {
    console.error("Lookup auth users failed", error);
    return null;
  }
  const normalized = email.toLowerCase();
  const match = data?.users?.find((u) => (u.email ?? "").toLowerCase() === normalized);
  return match?.id ?? null;
}

async function findBuyerByEmailSupabase(
  supabase: ReturnType<typeof supabaseServer>,
  email: string
) {
  const { data, error } = await supabase
    .from("buyers")
    .select("id, plan, full_name")
    .eq("email", email)
    .maybeSingle();
  if (error && error.code !== "PGRST116") {
    // PGRST116 = no rows returned, ignore
    console.error("Lookup buyers by email failed", error);
  }
  return data ?? null;
}
