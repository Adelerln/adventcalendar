import crypto from "crypto";
import { GiftDraft } from "./types";

export type StoredGift = GiftDraft & { id: string };
export type DraftRecord = Partial<GiftDraft> & { id: string };

const drafts = new Map<string, DraftRecord>();
const gifts = new Map<string, StoredGift>();
const shareTokens = new Map<string, { token: string; shareUrl: string }>();

export function saveDraft(draft: Partial<GiftDraft>) {
  const id = draft.id ?? crypto.randomUUID();
  drafts.set(id, { ...draft, id });
  return id;
}

export function getDraft(id: string) {
  return drafts.get(id) ?? null;
}

export function saveGift(draft: GiftDraft, giftId?: string) {
  const id = giftId ?? draft.id ?? crypto.randomUUID();
  const stored: StoredGift = { ...draft, id };
  gifts.set(id, stored);
  return stored;
}

export function getGift(id: string) {
  return gifts.get(id) ?? null;
}

export function setShareToken(giftId: string, shareUrl: string, token: string) {
  shareTokens.set(giftId, { shareUrl, token });
}

export function getShareToken(giftId: string) {
  return shareTokens.get(giftId) ?? null;
}
