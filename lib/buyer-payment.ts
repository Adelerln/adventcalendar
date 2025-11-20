import { supabaseServer } from "@/lib/supabase";
import { DEFAULT_PLAN, type PlanKey } from "@/lib/plan-theme";
import { findBuyerById, updateBuyerPayment } from "@/lib/buyers-store";

export type BuyerPaymentInfo = {
  id: string;
  plan: PlanKey;
  full_name: string;
  payment_status: "pending" | "paid";
  payment_amount: number;
  stripe_checkout_session_id: string | null;
  stripe_payment_intent_id: string | null;
};

const hasSupabase = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);

const PAYMENT_FIELDS =
  "id, plan, full_name, payment_status, payment_amount, stripe_checkout_session_id, stripe_payment_intent_id";

export async function getBuyerPaymentInfo(buyerId: string): Promise<BuyerPaymentInfo | null> {
  if (hasSupabase) {
    const supabase = supabaseServer();
    const { data, error } = await supabase.from("buyers").select(PAYMENT_FIELDS).eq("id", buyerId).maybeSingle();
    if (error) throw error;
    return data ? mapSupabaseBuyer(data) : null;
  }

  const buyer = findBuyerById(buyerId);
  return buyer ? mapStoreBuyer(buyer) : null;
}

export async function markBuyerPaymentPending(params: {
  buyerId: string;
  plan: PlanKey;
  amountEuros: number;
  stripeSessionId: string;
}) {
  if (hasSupabase) {
    const supabase = supabaseServer();
    const { data, error } = await supabase
      .from("buyers")
      .update({
        plan: params.plan,
        payment_status: "pending",
        payment_amount: params.amountEuros,
        stripe_checkout_session_id: params.stripeSessionId,
        stripe_payment_intent_id: null
      })
      .eq("id", params.buyerId)
      .select(PAYMENT_FIELDS)
      .maybeSingle();
    if (error) throw error;
    return data ? mapSupabaseBuyer(data) : null;
  }

  const updated = updateBuyerPayment(params.buyerId, {
    plan: params.plan,
    payment_status: "pending",
    payment_amount: params.amountEuros,
    stripe_checkout_session_id: params.stripeSessionId,
    stripe_payment_intent_id: null
  });
  return updated ? mapStoreBuyer(updated) : null;
}

export async function markBuyerPaymentAsPaid(params: {
  buyerId: string;
  stripeSessionId: string;
  paymentIntentId?: string | null;
}) {
  if (hasSupabase) {
    const supabase = supabaseServer();
    const { data, error } = await supabase
      .from("buyers")
      .update({
        payment_status: "paid",
        stripe_checkout_session_id: params.stripeSessionId,
        stripe_payment_intent_id: params.paymentIntentId ?? null
      })
      .eq("id", params.buyerId)
      .select(PAYMENT_FIELDS)
      .maybeSingle();
    if (error) throw error;
    return data ? mapSupabaseBuyer(data) : null;
  }

  const updated = updateBuyerPayment(params.buyerId, {
    payment_status: "paid",
    stripe_checkout_session_id: params.stripeSessionId,
    stripe_payment_intent_id: params.paymentIntentId ?? null
  });
  return updated ? mapStoreBuyer(updated) : null;
}

type SupabaseBuyerRow = {
  id: string;
  plan?: string | null;
  full_name?: string | null;
  payment_status?: string | null;
  payment_amount?: number | string | null;
  stripe_checkout_session_id?: string | null;
  stripe_payment_intent_id?: string | null;
};

function mapSupabaseBuyer(row: SupabaseBuyerRow): BuyerPaymentInfo {
  const plan = isPlanKey(row.plan) ? row.plan : DEFAULT_PLAN;
  return {
    id: row.id,
    plan,
    full_name: row.full_name ?? "Client",
    payment_status: row.payment_status === "paid" ? "paid" : "pending",
    payment_amount: typeof row.payment_amount === "number" ? row.payment_amount : Number(row.payment_amount ?? 0),
    stripe_checkout_session_id: row.stripe_checkout_session_id ?? null,
    stripe_payment_intent_id: row.stripe_payment_intent_id ?? null
  };
}

type StoreBuyer = ReturnType<typeof findBuyerById>;

function mapStoreBuyer(buyer: NonNullable<StoreBuyer>): BuyerPaymentInfo {
  const plan = isPlanKey(buyer.plan) ? buyer.plan : DEFAULT_PLAN;
  return {
    id: buyer.id,
    plan,
    full_name: buyer.full_name,
    payment_status: buyer.payment_status,
    payment_amount: buyer.payment_amount,
    stripe_checkout_session_id: buyer.stripe_checkout_session_id,
    stripe_payment_intent_id: buyer.stripe_payment_intent_id
  };
}

function isPlanKey(value: string | null | undefined): value is PlanKey {
  return value === "plan_essentiel" || value === "plan_premium";
}
