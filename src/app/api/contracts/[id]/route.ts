// src/app/api/contracts/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { MCPClient } from '@/lib/mcp';

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

    console.log(`GET /api/contracts/${contractId} called (MCP)`);

    const mcp = new MCPClient();
    const contract = await mcp.getContractById(contractId);

    if (!contract) {
      return NextResponse.json(
        { error: '계약을 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    console.log('계약 조회 성공 (MCP):', {
      id: contract.id,
      hasSignature: !!contract.signature_data,
      hasTermsSignature: !!contract.terms_signature_data,
      customerName: contract.name
    });

    return NextResponse.json({
      id: contract.id,
      signatureData: contract.signature_data,
      termsSignatureData: contract.terms_signature_data,
      agreedTerms: contract.agreed_terms,
      contractDate: contract.contract_date,
      customer: {
        name: contract.name,
        phone: contract.phone,
        membershipType: contract.membership_type
      }
    });
  } catch (error) {
    console.error('계약 조회 오류 (MCP):', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다', details: (error as any)?.message || 'Unknown error' },
      { status: 500 }
    );
  }
}