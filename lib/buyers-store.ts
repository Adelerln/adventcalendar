import crypto from "crypto";

type BuyerRecord = {
  id: string;
  plan: string;
  full_name: string;
  phone: string;
  email: string;
  password_hash: string;
  created_at: Date;
  updated_at: Date;
};

const buyers = new Map<string, BuyerRecord>();

export function saveBuyer(data: Omit<BuyerRecord, "id" | "created_at" | "updated_at">) {
  const email = data.email.toLowerCase();
  const existing = Array.from(buyers.values()).find((buyer) => buyer.email === email);
  if (existing) {
    const error = new Error("Email déjà utilisé");
    (error as any).code = "23505";
    throw error;
  }

  const id = crypto.randomUUID();
  const now = new Date();
  const record: BuyerRecord = {
    id,
    created_at: now,
    updated_at: now,
    ...data,
    email,
  };

  buyers.set(id, record);
  return { id, plan: record.plan };
}
