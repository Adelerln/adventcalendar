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
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseServiceRole && supabaseAnon) {
    return handleSupabaseSignIn(normalizedEmail, password);
  }

  const buyer = await findBuyerForFallback(normalizedEmail);
  if (!buyer) {
    return NextResponse.json({ error: "Identifiants invalides." }, { status: 401 });
  }

  const valid = await compare(password, buyer.password_hash);
  if (!valid) {
    return NextResponse.json({ error: "Identifiants invalides." }, { status: 401 });
  }

  return attachBuyerSession(NextResponse.json({ user: buyerSessionPayload(buyer) }, { status: 200 }), buyerSessionPayload(buyer));
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
    plan: (isPlanKey(buyer.plan) ? buyer.plan : DEFAULT_PLAN) as PlanKey,
    name: buyer.full_name ?? "Client"
  };

  const response = NextResponse.json({ user: sessionPayload }, { status: 200 });
  return attachBuyerSession(response, sessionPayload);
}

async function findBuyerForFallback(email: string) {
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

function buyerSessionPayload(buyer: { id: string; plan: string; full_name: string }) {
  const plan = isPlanKey(buyer.plan) ? buyer.plan : DEFAULT_PLAN;
  return { id: buyer.id, plan, name: buyer.full_name };
}

function isPlanKey(value: string | null | undefined): value is PlanKey {
  return value === "plan_essentiel" || value === "plan_premium";
}
