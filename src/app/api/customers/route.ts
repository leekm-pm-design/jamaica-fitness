// src/app/api/customers/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const search = req.nextUrl.searchParams.get('search');

    let whereClause = {};
    if (search) {
      whereClause = {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search } }
        ]
      };
    }

    const customers = await prisma.customer.findMany({
      where: whereClause,
      include: {
        contracts: {
          select: {
            id: true,
            contractDate: true
          },
          orderBy: {
            contractDate: 'desc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const formattedCustomers = customers.map(customer => ({
      id: customer.id,
      name: customer.name,
      phone: customer.phone,
      membershipType: customer.membershipType,
      createdAt: customer.createdAt,
      contracts: customer.contracts
    }));

    return NextResponse.json({
      customers: formattedCustomers
    });
  } catch (error) {
    console.error('고객 목록 조회 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}