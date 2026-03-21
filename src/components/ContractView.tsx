// src/components/ContractView.tsx
'use client';

import { useState, useEffect } from 'react';

interface ContractData {
  id: number;
  signatureData: string;
  agreedTerms: boolean;
  contractDate: string;
  customer: {
    name: string;
    phone: string;
    membershipType: string;
  };
}

interface Props {
  contractId: number;
}

export default function ContractView({ contractId }: Props) {
  const [contract, setContract] = useState<ContractData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContract = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/contracts/${contractId}`);

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('계약을 찾을 수 없습니다');
          }
          throw new Error('계약 정보를 불러올 수 없습니다');
        }

        const data = await response.json();
        setContract(data);
      } catch (error) {
        setError(error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다');
      } finally {
        setIsLoading(false);
      }
    };

    fetchContract();
  }, [contractId]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatPhone = (phone: string) => {
    if (phone.length === 11) {
      return `${phone.slice(0, 3)}-${phone.slice(3, 7)}-${phone.slice(7)}`;
    }
    return phone;
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-600">로딩 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-red-600 mb-4">{error}</div>
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            돌아가기
          </button>
        </div>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-600">계약 정보가 없습니다</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* 인쇄 버튼 - 인쇄시 숨김 */}
      <div className="no-print p-4 border-b bg-gray-50">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <h1 className="text-lg font-medium text-gray-800">계약서 보기</h1>
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            인쇄
          </button>
        </div>
      </div>

      {/* 계약서 내용 */}
      <div className="max-w-4xl mx-auto p-8">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            JAMAICA FITNESS
          </h1>
          <h2 className="text-xl text-gray-600 mb-4">
            회원 가입 계약서
          </h2>
          <div className="text-sm text-gray-500">
            계약일: {formatDate(contract.contractDate)}
          </div>
        </div>

        <hr className="border-gray-300 mb-8" />

        {/* 고객 정보 */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">고객 정보</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">성명:</span>
              <span className="ml-2 text-gray-900">{contract.customer.name}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">연락처:</span>
              <span className="ml-2 text-gray-900">{formatPhone(contract.customer.phone)}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">회원권:</span>
              <span className="ml-2 text-gray-900">{contract.customer.membershipType}</span>
            </div>
          </div>
        </div>

        {/* 이용약관 */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">이용약관</h3>
          <div className="bg-gray-50 p-6 rounded-lg text-sm leading-relaxed">
            <h4 className="font-medium mb-3">제1조 (목적)</h4>
            <p className="mb-4">
              본 약관은 Jamaica Fitness(이하 &quot;회사&quot;라 한다)가 제공하는 피트니스 서비스
              이용과 관련하여 회사와 이용고객(이하 &quot;회원&quot;이라 한다) 간의 권리, 의무 및
              책임사항을 규정함을 목적으로 합니다.
            </p>

            <h4 className="font-medium mb-3">제2조 (시설 이용)</h4>
            <p className="mb-4">
              회원은 운영시간 내에 회사가 제공하는 운동시설 및 부대시설을 이용할 수 있습니다.
              시설 이용 시 안전수칙을 준수하여야 하며, 시설 손상 시 배상 책임이 있습니다.
            </p>

            <h4 className="font-medium mb-3">제3조 (회원권 기간 및 환불)</h4>
            <p className="mb-4">
              회원권 기간은 등록일로부터 해당 기간만큼 유효합니다.
              환불은 소비자보호법에 따라 진행되며, 사용기간에 따른 차감 후 환불됩니다.
            </p>

            <h4 className="font-medium mb-3">제4조 (개인정보 처리)</h4>
            <p>
              회사는 회원의 개인정보를 관련 법령에 따라 안전하게 처리하며,
              서비스 제공 목적 외에는 사용하지 않습니다.
            </p>
          </div>
        </div>

        {/* 개인정보 수집·이용 동의 */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">개인정보 수집·이용 동의</h3>
          <div className="bg-gray-50 p-6 rounded-lg text-sm leading-relaxed">
            <h4 className="font-medium mb-3">수집 목적</h4>
            <p className="mb-4">회원 관리, 서비스 제공, 계약 이행</p>

            <h4 className="font-medium mb-3">수집 항목</h4>
            <p className="mb-4">성명, 전화번호, 서명 정보</p>

            <h4 className="font-medium mb-3">보유 기간</h4>
            <p>회원탈퇴 또는 계약 종료 후 3년간 보관</p>
          </div>
        </div>

        {/* 서명란 */}
        <div className="print-signature">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">동의 및 서명</h3>
          <p className="text-sm text-gray-700 mb-4">
            위 약관 및 개인정보 수집·이용에 동의하며 서명합니다.
          </p>

          <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
            <div className="mb-2 text-sm font-medium text-gray-700">고객 서명:</div>
            <div className="bg-white border border-gray-200 rounded p-4 min-h-[150px] flex items-center justify-center">
              {contract.signatureData ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={contract.signatureData}
                  alt="고객 서명"
                  className="max-h-[120px] max-w-full object-contain"
                />
              ) : (
                <div className="text-gray-400 text-sm">서명 없음</div>
              )}
            </div>
          </div>
        </div>

        {/* 하단 정보 */}
        <div className="mt-12 pt-8 border-t border-gray-300 text-center text-sm text-gray-600">
          <div className="mb-2">Jamaica Fitness</div>
          <div>본 계약서는 전자서명법에 의해 법적 효력을 갖습니다.</div>
        </div>
      </div>
    </div>
  );
}