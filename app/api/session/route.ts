import { NextRequest, NextResponse } from "next/server";
import { compare } from "bcryptjs";
import { db } from "@/lib/db";
import { findBuyerByEmail } from "@/lib/buyers-store";
import { attachBuyerSession, clearBuyerSession, readBuyerSession } from "@/lib/server-session";
import { supabaseBrowser, supabaseServer } from "@/lib/supabase";
import { DEFAULT_PLAN, type PlanKey } from "@/lib/plan-theme";

export async function GET(req: NextRequest) {
  const session = await readBuyerSession(req);
  return NextResponse.json({ user: session ?? null });
}

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  if (!email || !password) {
    return NextResponse.json({ error: "Email et mot de passe requis." }, { status: 400 });
  }

  const normalizedEmail = email.toLowerCase();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  const supabaseConfigured =
    !!supabaseUrl && !!supabaseServiceRole && !!supabaseAnon;

  if (supabaseConfigured) {
    try {
      return await handleSupabaseSignIn(normalizedEmail, password);
    } catch (err) {
      console.error("[api/session] supabase sign-in failed", err);
      // On passe au fallback in-memory
    }
  }

  const buyer = await findBuyerForFallback(normalizedEmail);
  if (!buyer) {
    return NextResponse.json({ error: "Identifiants invalides." }, { status: 401 });
  }

  const valid = await compare(password, buyer.password_hash);
  if (!valid) {
    return NextResponse.json({ error: "Identifiants invalides." }, { status: 401 });
  }

  const payload = buyerSessionPayload(buyer);
  return await attachBuyerSession(NextResponse.json({ user: payload }, { status: 200 }), payload);
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  return clearBuyerSession(response);
}

async function handleSupabaseSignIn(email: string, password: string) {
  const authClient = supabaseBrowser();
  const { data: authData, error: authError } = await authClient.auth.signInWithPassword({ email, password });
  if (authError || !authData?.user?.id) {
    return NextResponse.json({ error: "Identifiants invalides." }, { status: 401 });
  }

  await authClient.auth.signOut().catch(() => {});

  const supabase = supabaseServer();
  const { data: buyer, error } = await supabase
    .from("buyers")
    .select("id, plan, full_name")
    .eq("id", authData.user.id)
    .maybeSingle();

  if (error || !buyer) {
    return NextResponse.json({ error: "Compte acheteur introuvable." }, { status: 404 });
  }

  const sessionPayload = {
    id: buyer.id,
    plan: isPlanKey(buyer.plan) ? buyer.plan : DEFAULT_PLAN,
    name: buyer.full_name ?? "Client"
  };

  const response = NextResponse.json({ user: sessionPayload }, { status: 200 });
  return await attachBuyerSession(response, sessionPayload);
}

async function findBuyerForFallback(email: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (db) {
    const { rows } = await db.query(
      `SELECT id, plan, full_name, password_hash FROM buyers WHERE email = $1 LIMIT 1`,
      [email]
    );
    if (rows[0]) {
      return rows[0];
    }
  }

  if (supabaseUrl && supabaseServiceRole) {
    try {
      const supabase = supabaseServer();
      const { data, error } = await supabase
        .from("buyers")
        .select("id, plan, full_name, password_hash")
        .eq("email", email)
        .single();
      if (error) {
        throw error;
      }
      if (data) {
        return {
          id: data.id,
          plan: data.plan,
          full_name: data.full_name,
          password_hash: data.password_hash
        };
      }
    } catch (supabaseError) {
      console.error("Supabase buyers lookup failed", supabaseError);
    }
  }

  return findBuyerByEmail(email);
}

function buyerSessionPayload(buyer: { id: string; plan: string; full_name: string }) {
  const plan = isPlanKey(buyer.plan) ? buyer.plan : DEFAULT_PLAN;
  return { id: buyer.id, plan, name: buyer.full_name };
}

function isPlanKey(value: string | null | undefined): value is PlanKey {
  return value === "plan_essentiel" || value === "plan_premium";
}
