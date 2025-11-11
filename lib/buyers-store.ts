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

export function saveBuyer(data: Omit<BuyerRecord, "id" | "created_at" | "updated_at">) {
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
  };

  buyers.byId.set(id, record);
  buyers.byEmail.set(email, record);
  return { id, plan: record.plan, full_name: record.full_name };
}

export function findBuyerByEmail(email: string) {
  const normalized = email.toLowerCase();
  return buyers.byEmail.get(normalized) ?? null;
}
