// src/lib/auth.ts
import { cookies } from 'next/headers';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin1234';
const COOKIE_NAME = 'jamaica_admin';

export function verifyPassword(password: string): boolean {
  console.log('=== verifyPassword 함수 디버깅 ===');
  console.log('입력된 password:', password);
  console.log('ADMIN_PASSWORD:', ADMIN_PASSWORD);
  console.log('process.env.ADMIN_PASSWORD:', process.env.ADMIN_PASSWORD);
  console.log('비교 결과:', password === ADMIN_PASSWORD);

  // 임시: 하드코딩된 비밀번호로도 테스트
  if (password === 'admin1234') {
    console.log('✅ 하드코딩된 비밀번호 매칭 성공');
    return true;
  }

  return password === ADMIN_PASSWORD;
}

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME);
  return token?.value === process.env.COOKIE_SECRET;
}