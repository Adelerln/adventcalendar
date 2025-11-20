import crypto from "crypto";

type ReceiverRecord = {
  id: string;
  buyer_id: string;
  full_name: string;
  email: string;
  phone_e164: string | null;
  relationship: string;
};

type ReceiverStore = Map<string, ReceiverRecord>;

const globalStore = globalThis as typeof globalThis & {
  __receiversStore?: ReceiverStore;
};

const receivers: ReceiverStore = globalStore.__receiversStore ?? new Map<string, ReceiverRecord>();

if (!globalStore.__receiversStore) {
  globalStore.__receiversStore = receivers;
}

export function saveReceiver(data: Omit<ReceiverRecord, "id">) {
  const id = crypto.randomUUID();
  const record: ReceiverRecord = { id, ...data };
  receivers.set(id, record);
  return record;
}
