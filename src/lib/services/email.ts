import "server-only";

export interface EmailService {
  send(input: { to: string; subject: string; html: string; text: string }): Promise<void>;
}

export function emailConfiguration() {
  return { configured: Boolean(process.env.EMAIL_FROM && process.env.EMAIL_API_KEY), from: process.env.EMAIL_FROM ?? null };
}
