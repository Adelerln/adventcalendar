export interface MessagingPort {
  sendMagicLink(to: { phoneE164?: string | null; email?: string | null }, url: string): Promise<void>;
}
