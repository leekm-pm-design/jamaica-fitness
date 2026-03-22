import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Test API is working!',
    timestamp: new Date().toISOString(),
    vercelEnv: process.env.VERCEL_ENV || 'local',
    hasDbUrl: !!process.env.DATABASE_URL,
    hasCookieSecret: !!process.env.COOKIE_SECRET,
    hasAdminPassword: !!process.env.ADMIN_PASSWORD,
    adminPasswordLength: process.env.ADMIN_PASSWORD?.length || 0,
  });
}