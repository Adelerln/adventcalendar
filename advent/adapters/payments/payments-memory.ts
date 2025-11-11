import type { PaymentsPort } from "./payments-ports";
export const payments: PaymentsPort = {
  async simulateCheckout(calendarId: string) {
    void calendarId;
    return { ok: true };
  }
};
