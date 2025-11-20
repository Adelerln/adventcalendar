import crypto from "crypto";
import { supabaseServer } from "@/lib/supabase";
import { DEFAULT_PLAN, type PlanKey } from "@/lib/plan-theme";

export type ProjectRecord = {
  id: string;
  user_id: string;
  plan: PlanKey;
  status: string;
  payment_status: "pending" | "paid";
  payment_amount: number;
  stripe_checkout_session_id?: string | null;
  image_file?: string | null;
  prompt?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

type CreateProjectInput = {
  userId: string;
  plan: PlanKey;
  paymentAmount: number;
  status?: string;
  paymentStatus?: "pending" | "paid";
  imageFile?: string | null;
  prompt?: string | null;
};

type UpdateProjectInput = Partial<
  Pick<
    ProjectRecord,
    "plan" | "status" | "payment_status" | "payment_amount" | "stripe_checkout_session_id" | "image_file" | "prompt"
  >
>;

const memoryStore: Map<string, ProjectRecord> = new Map();
const useSupabase = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);

export async function createProjectRecord(input: CreateProjectInput): Promise<ProjectRecord> {
  if (useSupabase) {
    const supabase = supabaseServer();
    const { data, error } = await supabase
      .from("projects")
      .insert({
        user_id: input.userId,
        plan: input.plan,
        status: input.status ?? "pending",
        payment_status: input.paymentStatus ?? "pending",
        payment_amount: input.paymentAmount,
        image_file: input.imageFile ?? null,
        prompt: input.prompt ?? null
      })
      .select("*")
      .single();
    if (error) {
      throw error;
    }
    return mapProjectRecord(data);
  }

  const now = new Date().toISOString();
  const record: ProjectRecord = {
    id: crypto.randomUUID(),
    user_id: input.userId,
    plan: input.plan,
    status: input.status ?? "pending",
    payment_status: input.paymentStatus ?? "pending",
    payment_amount: input.paymentAmount,
    image_file: input.imageFile ?? null,
    prompt: input.prompt ?? null,
    stripe_checkout_session_id: null,
    created_at: now,
    updated_at: now
  };
  memoryStore.set(record.id, record);
  return record;
}

export async function findProjectById(projectId: string): Promise<ProjectRecord | null> {
  if (useSupabase) {
    const supabase = supabaseServer();
    const { data, error } = await supabase.from("projects").select("*").eq("id", projectId).maybeSingle();
    if (error) throw error;
    return data ? mapProjectRecord(data) : null;
  }
  return memoryStore.get(projectId) ?? null;
}

export async function findLatestProjectForUser(userId: string): Promise<ProjectRecord | null> {
  if (useSupabase) {
    const supabase = supabaseServer();
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    return data ? mapProjectRecord(data) : null;
  }
  const records = Array.from(memoryStore.values())
    .filter((record) => record.user_id === userId)
    .sort((a, b) => (b.created_at ?? "").localeCompare(a.created_at ?? ""));
  return records[0] ?? null;
}

export async function updateProject(projectId: string, updates: UpdateProjectInput): Promise<ProjectRecord | null> {
  if (Object.keys(updates).length === 0) {
    return findProjectById(projectId);
  }

  if (useSupabase) {
    const supabase = supabaseServer();
    const payload = mapProjectUpdates(updates);
    if (Object.keys(payload).length === 0) {
      return findProjectById(projectId);
    }
    const { data, error } = await supabase
      .from("projects")
      .update({
        ...payload,
        updated_at: new Date().toISOString()
      })
      .eq("id", projectId)
      .select("*")
      .maybeSingle();
    if (error) throw error;
    return data ? mapProjectRecord(data) : null;
  }

  const existing = memoryStore.get(projectId);
  if (!existing) return null;
  const updated: ProjectRecord = {
    ...existing,
    ...updates,
    updated_at: new Date().toISOString()
  };
  memoryStore.set(projectId, updated);
  return updated;
}

export async function markProjectAsPaid(projectId: string, sessionId: string) {
  return updateProject(projectId, {
    payment_status: "paid",
    status: "paid",
    stripe_checkout_session_id: sessionId
  });
}

function mapProjectRecord(row: Record<string, unknown>): ProjectRecord {
  const plan = isPlanKey(typeof row.plan === "string" ? (row.plan as string) : null) ? (row.plan as PlanKey) : DEFAULT_PLAN;
  const paymentAmountValue =
    typeof row.payment_amount === "number"
      ? row.payment_amount
      : Number(row.payment_amount ?? 0);
  return {
    id: String(row.id),
    user_id: String(row.user_id),
    plan,
    status: typeof row.status === "string" ? row.status : "pending",
    payment_status: (row.payment_status === "paid" ? "paid" : "pending") as "pending" | "paid",
    payment_amount: paymentAmountValue,
    stripe_checkout_session_id: (row.stripe_checkout_session_id as string) ?? null,
    image_file: (row.image_file as string) ?? null,
    prompt: (row.prompt as string) ?? null,
    created_at: (row.created_at as string) ?? null,
    updated_at: (row.updated_at as string) ?? null
  };
}

function mapProjectUpdates(updates: UpdateProjectInput) {
  const payload: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(updates)) {
    if (typeof value === "undefined") continue;
    payload[key] = value;
  }
  return payload;
}

function isPlanKey(plan: string | null | undefined): plan is PlanKey {
  return plan === "plan_essentiel" || plan === "plan_premium";
}
