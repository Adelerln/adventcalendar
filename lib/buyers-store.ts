import crypto from "crypto";

type BuyerPaymentStatus = "pending" | "paid" | "paid_with_code";

type BuyerRecord = {
  id: string;
  plan: string;
  full_name: string;
  phone: string;
  email: string;
  password_hash: string;
  payment_status: BuyerPaymentStatus;
  payment_amount: number;
  stripe_payment_intent_id: string | null;
  stripe_checkout_session_id: string | null;
  created_at: Date;
  updated_at: Date;
};

type SaveBuyerInput = {
  plan: string;
  full_name: string;
  phone: string;
  email: string;
  password_hash: string;
  payment_status?: BuyerPaymentStatus;
  payment_amount?: number;
  stripe_payment_intent_id?: string | null;
  stripe_checkout_session_id?: string | null;
};

type BuyersStore = {
  byId: Map<string, BuyerRecord>;
  byEmail: Map<string, BuyerRecord>;
};

const globalStore = globalThis as typeof globalThis & {
  __buyersStore?: BuyersStore;
};

const buyers: BuyersStore = globalStore.__buyersStore ?? {
  byId: new Map<string, BuyerRecord>(),
  byEmail: new Map<string, BuyerRecord>()
};

if (!globalStore.__buyersStore) {
  globalStore.__buyersStore = buyers;
}

class UniqueEmailError extends Error {
  code = "23505";
  constructor() {
    super("Email déjà utilisé");
    this.name = "UniqueEmailError";
  }
}

export function saveBuyer(data: SaveBuyerInput) {
  const email = data.email.toLowerCase();
  const existing = buyers.byEmail.get(email);
  if (existing) {
    throw new UniqueEmailError();
  }

  const id = crypto.randomUUID();
  const now = new Date();
  const record: BuyerRecord = {
    id,
    created_at: now,
    updated_at: now,
    ...data,
    email,
    payment_status: data.payment_status ?? "pending",
    payment_amount: data.payment_amount ?? 0,
    stripe_checkout_session_id: data.stripe_checkout_session_id ?? null,
    stripe_payment_intent_id: data.stripe_payment_intent_id ?? null
  };

  buyers.byId.set(id, record);
  buyers.byEmail.set(email, record);
  return { id, plan: record.plan, full_name: record.full_name };
}

export function findBuyerByEmail(email: string) {
  const normalized = email.toLowerCase();
  return buyers.byEmail.get(normalized) ?? null;
}

export function findBuyerById(id: string) {
  return buyers.byId.get(id) ?? null;
}

export function updateBuyerPayment(id: string, updates: Partial<BuyerRecord>) {
  const existing = buyers.byId.get(id);
  if (!existing) return null;
  const updated: BuyerRecord = {
    ...existing,
    ...updates,
    updated_at: new Date()
  };
  buyers.byId.set(id, updated);
  buyers.byEmail.set(updated.email, updated);
  return updated;
}
