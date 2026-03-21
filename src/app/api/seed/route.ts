// src/app/api/seed/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// 더미 서명 데이터 (간단한 선 그림)
const DUMMY_SIGNATURE = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

export async function POST(req: NextRequest) {
  try {
    // 더미 고객들 생성
    const dummyCustomers = [
      {
        name: "홍길동",
        phone: "01012345678",
        membershipType: "3개월"
      },
      {
        name: "김철수",
        phone: "01087654321",
        membershipType: "6개월"
      },
      {
        name: "이영희",
        phone: "01055556666",
        membershipType: "12개월"
      },
      {
        name: "박민수",
        phone: "01077778888",
        membershipType: "1개월"
      },
      {
        name: "최수진",
        phone: "01099990000",
        membershipType: "3개월"
      }
    ];

    const createdContracts = [];

    for (const customerData of dummyCustomers) {
      // 고객 생성
      const customer = await prisma.customer.create({
        data: customerData
      });

      // 계약 생성
      const contract = await prisma.contract.create({
        data: {
          customerId: customer.id,
          signatureData: DUMMY_SIGNATURE,
          agreedTerms: true,
        }
      });

      createdContracts.push({
        customerId: customer.id,
        contractId: contract.id,
        customerName: customer.name
      });
    }

    return NextResponse.json({
      success: true,
      message: `${createdContracts.length}개의 더미 계약이 생성되었습니다`,
      contracts: createdContracts
    });

  } catch (error) {
    console.error('더미 데이터 생성 오류:', error);
    return NextResponse.json(
      { error: '더미 데이터 생성 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}