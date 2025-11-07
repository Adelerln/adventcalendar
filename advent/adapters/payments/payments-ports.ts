export interface PaymentsPort {
  simulateCheckout(calendarId: string): Promise<{ ok: true }>;
}
