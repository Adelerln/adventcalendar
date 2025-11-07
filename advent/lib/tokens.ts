import crypto from "crypto";
export function genToken(len = 32) {
  return crypto.randomBytes(len).toString("base64url");
}
export function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest();
}
