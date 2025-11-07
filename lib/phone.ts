import { parsePhoneNumberFromString } from "libphonenumber-js";

export function normalizePhone(input: string, defaultRegion: string = "FR") {
  const p = parsePhoneNumberFromString(input, defaultRegion);
  return p?.isValid() ? p.format("E.164") : input.trim();
}
