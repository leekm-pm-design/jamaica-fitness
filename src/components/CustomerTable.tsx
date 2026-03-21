// src/components/CustomerTable.tsx
'use client';

import { useState, useEffect } from 'react';
import { Customer } from '@/types/contract';
import { formatDate, formatPhone } from '@/utils/format';

export default function CustomerTable() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    if (searchTerm.trim()) {
      const filtered = customers.filter(customer =>
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone.includes(searchTerm)
      );
      setFilteredCustomers(filtered);
    } else {
      setFilteredCustomers(customers);
    }
  }, [customers, searchTerm]);

  const fetchCustomers = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/customers');

      if (!response.ok) {
        throw new Error('고객 목록을 불러올 수 없습니다');
      }

      const data = await response.json();
      setCustomers(data.customers);
    } catch (error) {
      setError(error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewContract = (contractId: number) => {
    window.open(`/contract/${contractId}`, '_blank');
  };

  const handlePrintContract = (contractId: number) => {
    const newWindow = window.open(`/contract/${contractId}`, '_blank');
    if (newWindow) {
      newWindow.onload = () => {
        newWindow.print();
      };
    }
  };

  const handleDownloadPdf = (pdfUrl: string, customerName: string) => {
    // PDF 다운로드
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = `${customerName}_계약서.pdf`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-lg text-gray-600">로딩 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-lg text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-white">
      {/* 검색 바 */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="🔍 고객 이름 또는 전화번호 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-4 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
          />
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
            🔍
          </div>
        </div>
      </div>

      {/* 고객 테이블 */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b-2 border-gray-200">
              <th className="text-left p-4 font-medium text-gray-700">이름</th>
              <th className="text-left p-4 font-medium text-gray-700">전화번호</th>
              <th className="text-left p-4 font-medium text-gray-700">회원권</th>
              <th className="text-left p-4 font-medium text-gray-700">최근 계약일</th>
              <th className="text-center p-4 font-medium text-gray-700">관리</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-gray-500">
                  {searchTerm ? '검색 결과가 없습니다' : '등록된 고객이 없습니다'}
                </td>
              </tr>
            ) : (
              filteredCustomers.map((customer) => (
                <tr key={customer.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-4 font-medium text-gray-900">{customer.name}</td>
                  <td className="p-4 text-gray-600">{formatPhone(customer.phone)}</td>
                  <td className="p-4 text-gray-600">{customer.membershipType}</td>
                  <td className="p-4 text-gray-600">
                    {customer.contracts.length > 0
                      ? formatDate(customer.contracts[0].contractDate)
                      : '계약 없음'
                    }
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2 justify-center">
                      {customer.contracts.length > 0 && (
                        <>
                          <button
                            onClick={() => handleViewContract(customer.contracts[0].id)}
                            className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded hover:bg-blue-200 transition-colors"
                          >
                            보기
                          </button>
                          <button
                            onClick={() => handlePrintContract(customer.contracts[0].id)}
                            className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded hover:bg-green-200 transition-colors"
                          >
                            인쇄
                          </button>
                          {customer.contracts[0].pdfUrl && (
                            <button
                              onClick={() => handleDownloadPdf(customer.contracts[0].pdfUrl!, customer.name)}
                              className="px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded hover:bg-purple-200 transition-colors"
                            >
                              PDF 다운로드
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 통계 */}
      <div className="mt-6 text-sm text-gray-500 text-center">
        총 {filteredCustomers.length}명의 고객
        {searchTerm && ` (전체 ${customers.length}명 중)`}
      </div>
    </div>
  );
}