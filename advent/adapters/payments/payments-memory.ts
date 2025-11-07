import type { PaymentsPort } from "./payments-ports";
export const payments: PaymentsPort = {
  async simulateCheckout(_calendarId: string) {
    return { ok: true };
  }
};
