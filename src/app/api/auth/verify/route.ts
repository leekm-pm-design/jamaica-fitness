// src/app/api/auth/verify/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyPassword } from '@/lib/auth';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const COOKIE_NAME = 'jamaica_admin';
const COOKIE_MAX_AGE = 60 * 60 * 24; // 24시간

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME);

    if (token?.value === (process.env.COOKIE_SECRET || 'default_secret')) {
      return NextResponse.json({
        success: true,
        authenticated: true
      });
    }

    return NextResponse.json(
      { success: false, authenticated: false },
      { status: 401 }
    );
  } catch (error) {
    console.error('인증 확인 오류:', error);
    return NextResponse.json(
      { success: false, authenticated: false },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();

    if (!password) {
      return NextResponse.json(
        { success: false, message: '비밀번호를 입력해주세요' },
        { status: 400 }
      );
    }

    if (!verifyPassword(password)) {
      return NextResponse.json(
        { success: false, message: '비밀번호가 일치하지 않습니다' },
        { status: 401 }
      );
    }

    // 인증 성공 시 쿠키 설정
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, process.env.COOKIE_SECRET || 'default_secret', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: COOKIE_MAX_AGE,
      path: '/'
    });

    return NextResponse.json({
      success: true,
      message: '인증이 완료되었습니다'
    });
  } catch (error) {
    console.error('인증 오류:', error);
    return NextResponse.json(
      { success: false, message: '서버 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}