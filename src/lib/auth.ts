// src/lib/auth.ts
import { cookies } from 'next/headers';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin1234';
const COOKIE_NAME = 'jamaica_admin';

export function verifyPassword(password: string): boolean {
  return password === ADMIN_PASSWORD;
}

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME);
  return token?.value === process.env.COOKIE_SECRET;
}