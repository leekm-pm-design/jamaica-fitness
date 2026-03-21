// src/app/api/contracts/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const contractId = parseInt(params.id);

    if (isNaN(contractId)) {
      return NextResponse.json(
        { error: '유효하지 않은 계약 ID입니다' },
        { status: 400 }
      );
    }

    const contract = await prisma.contract.findUnique({
      where: { id: contractId },
      include: {
        customer: true
      }
    });

    if (!contract) {
      return NextResponse.json(
        { error: '계약을 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: contract.id,
      signatureData: contract.signatureData,
      agreedTerms: contract.agreedTerms,
      contractDate: contract.contractDate,
      customer: {
        name: contract.customer.name,
        phone: contract.customer.phone,
        membershipType: contract.customer.membershipType
      }
    });
  } catch (error) {
    console.error('계약 조회 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}