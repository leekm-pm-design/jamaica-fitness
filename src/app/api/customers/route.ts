// src/app/api/customers/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { MCPClient } from '@/lib/mcp';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const search = req.nextUrl.searchParams.get('search');
    const mcp = new MCPClient();

    console.log('GET /api/customers called (MCP)');

    let customers;
    if (search) {
      // 검색어가 있으면 검색
      customers = await mcp.searchCustomers(search);
    } else {
      // 검색어가 없으면 전체 조회 (최대 100명)
      customers = await mcp.getCustomers(100);
    }

    // 각 고객의 계약 정보 조회
    const formattedCustomers = await Promise.all(
      customers.map(async (customer: any) => {
        // 고객의 계약 목록 조회
        const contracts = await mcp.executeSQL(`
          SELECT id, contract_date as "contractDate", pdf_url as "pdfUrl"
          FROM contracts
          WHERE customer_id = ${customer.id}
          ORDER BY contract_date DESC;
        `);

        return {
          id: customer.id,
          name: customer.name,
          phone: customer.phone,
          membershipType: customer.membership_type,
          createdAt: customer.created_at,
          contracts: contracts || []
        };
      })
    );

    console.log(`고객 ${formattedCustomers.length}명 조회 완료 (MCP)`);

    return NextResponse.json({
      customers: formattedCustomers
    });
  } catch (error) {
    console.error('고객 목록 조회 오류 (MCP):', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다', details: (error as any)?.message || 'Unknown error' },
      { status: 500 }
    );
  }
}