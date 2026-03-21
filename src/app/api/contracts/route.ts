// src/app/api/contracts/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { MCPClient } from '@/lib/mcp';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Test GET endpoint to check if API route works - now using MCP
export async function GET(req: NextRequest) {
  try {
    console.log('GET /api/contracts called (MCP)');

    const mcp = new MCPClient();

    // Test MCP connection by listing tables
    const tables = await mcp.listTables();
    console.log('MCP Tables:', tables);

    // Get customer count via MCP
    const customers = await mcp.getCustomers();
    const customerCount = customers?.length || 0;
    console.log('Customer count via MCP:', customerCount);

    return NextResponse.json({
      success: true,
      message: 'MCP API is working',
      customerCount,
      tables: tables?.tables || [],
      connectionType: 'MCP'
    });
  } catch (error) {
    console.error('GET /api/contracts MCP error:', error);
    return NextResponse.json(
      { error: 'MCP connection failed', details: (error as any)?.message || 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, phone, membershipType, applicationSignature, termsSignature, pdfData, agreedTerms } = await req.json();

    console.log('POST /api/contracts called (MCP):', {
      name,
      phone,
      membershipType,
      agreedTerms: !!agreedTerms,
      hasApplicationSignature: !!applicationSignature,
      hasTermsSignature: !!termsSignature,
      hasPdfData: !!pdfData
    });

    // 입력값 검증
    if (!name || !phone || !membershipType || !applicationSignature || !termsSignature) {
      return NextResponse.json(
        { error: '필수 항목을 입력해주세요' },
        { status: 400 }
      );
    }

    if (!agreedTerms) {
      return NextResponse.json(
        { error: '약관에 동의해주세요' },
        { status: 400 }
      );
    }

    const mcp = new MCPClient();

    // 전화번호 형식 정규화 (선택사항)
    const normalizedPhone = phone.replace(/[^0-9]/g, '');

    // 동일 전화번호 고객 존재 여부 확인 (MCP 사용)
    const existingCustomers = await mcp.searchCustomers(normalizedPhone);
    let customer = existingCustomers.find((c: any) => c.phone === normalizedPhone);

    if (!customer) {
      // 새 고객 생성 (MCP 사용)
      customer = await mcp.createCustomer(name, normalizedPhone, membershipType);
      console.log('새 고객 생성 (MCP):', customer);
    } else {
      // 기존 고객의 정보 업데이트 (MCP 사용)
      customer = await mcp.updateCustomer(customer.id, name, normalizedPhone, membershipType);
      console.log('기존 고객 업데이트 (MCP):', customer);
    }

    if (!customer) {
      throw new Error('고객 생성/업데이트 실패');
    }

    // PDF가 있으면 Supabase Storage에 업로드
    let pdfUrl: string | undefined;
    if (pdfData) {
      try {
        // 동적으로 supabase 라이브러리 임포트
        const { uploadPdfToStorage } = await import('@/lib/supabase');
        const fileName = `contract_${customer.id}_${Date.now()}.pdf`;
        pdfUrl = await uploadPdfToStorage(pdfData, fileName);
        console.log('PDF 업로드 완료:', pdfUrl);
      } catch (uploadError) {
        console.error('PDF 업로드 오류:', uploadError);
        // PDF 업로드 실패해도 계약은 생성 (서명 데이터는 있음)
      }
    }

    // 새 계약 생성 (MCP 사용) - 입회신청서 서명을 주 서명으로 사용
    const contract = await mcp.createContract(customer.id, applicationSignature, agreedTerms, pdfUrl);
    console.log('새 계약 생성 (MCP):', contract);
    console.log('회원약관 서명도 수신됨 (현재는 입회신청서 서명만 저장):', { termsSignatureLength: termsSignature?.length });

    if (!contract) {
      throw new Error('계약 생성 실패');
    }

    return NextResponse.json(
      {
        success: true,
        contractId: contract.id,
        customerId: customer.id,
        pdfUrl,
        connectionType: 'MCP'
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('계약 생성 오류 (MCP):', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다', details: (error as any)?.message || 'Unknown error' },
      { status: 500 }
    );
  }
}