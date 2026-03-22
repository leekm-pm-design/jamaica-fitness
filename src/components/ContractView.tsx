// src/components/ContractView.tsx
'use client';

import { useState, useEffect } from 'react';
import { DOCUMENT_CONFIG } from '@/constants/membership';

interface ContractData {
  id: number;
  signatureData: string;
  termsSignatureData?: string;
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

type DocumentType = 'application' | 'terms';

export default function ContractView({ contractId }: Props) {
  const [contract, setContract] = useState<ContractData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeDocument, setActiveDocument] = useState<DocumentType>('application');
  const [currentPage, setCurrentPage] = useState(1);

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

  // 문서 변경 시 페이지 리셋
  useEffect(() => {
    setCurrentPage(1);
  }, [activeDocument]);

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

  const handlePageChange = (newPage: number) => {
    const totalPages = DOCUMENT_CONFIG[activeDocument].totalPages;
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
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

  const imagePrefix = activeDocument === 'application' ? '입회신청서' : '회원약관';
  const totalPages = DOCUMENT_CONFIG[activeDocument].totalPages;

  // 전체 페이지 렌더링 (프린트용)
  const renderAllPages = (docType: DocumentType) => {
    const prefix = docType === 'application' ? '입회신청서' : '회원약관';
    const pages = DOCUMENT_CONFIG[docType].totalPages;

    // 서명 데이터 확인 (JSON 형태의 페이지별 데이터)
    const signedDataString = docType === 'application' ? contract.signatureData : contract.termsSignatureData;

    if (signedDataString) {
      try {
        // JSON 파싱하여 페이지별 이미지 추출
        const pageDataMap = JSON.parse(signedDataString);
        const pageElements = [];

        for (let page = 1; page <= pages; page++) {
          const pageImageData = pageDataMap[page];
          if (pageImageData) {
            pageElements.push(
              <div key={`${docType}-${page}`} className="print-page">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={pageImageData}
                  alt={`${prefix} ${page}페이지 (서명됨)`}
                  className="w-full h-auto"
                />
              </div>
            );
          } else {
            // 서명이 없는 페이지는 원본 이미지 사용
            pageElements.push(
              <div key={`${docType}-${page}`} className="print-page">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/img/${prefix}_페이지_${page}.jpg`}
                  alt={`${prefix} ${page}페이지`}
                  className="w-full h-auto"
                />
              </div>
            );
          }
        }

        return pageElements;
      } catch (e) {
        console.error('서명 데이터 파싱 오류:', e);
      }
    }

    // 서명이 없으면 원본 이미지만 사용
    const pageElements = [];
    for (let page = 1; page <= pages; page++) {
      pageElements.push(
        <div key={`${docType}-${page}`} className="print-page">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/img/${prefix}_페이지_${page}.jpg`}
            alt={`${prefix} ${page}페이지`}
            className="w-full h-auto"
          />
        </div>
      );
    }

    return pageElements;
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* 상단 헤더 - 인쇄 시 숨김 */}
      <div className="no-print bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex justify-between items-center mb-3">
            <div>
              <h1 className="text-xl font-bold text-gray-800">계약서 보기</h1>
              <div className="text-sm text-gray-600 mt-1">
                {contract.customer.name} · {formatPhone(contract.customer.phone)} · {contract.customer.membershipType}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                계약일: {formatDate(contract.contractDate)}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => window.history.back()}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
              >
                돌아가기
              </button>
              <button
                onClick={handlePrint}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                전체 인쇄
              </button>
            </div>
          </div>

          {/* 탭 네비게이션 */}
          <div className="flex gap-4">
            <button
              onClick={() => setActiveDocument('application')}
              className={`py-2 px-4 text-sm font-medium border-b-2 transition-colors ${
                activeDocument === 'application'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              입회신청서 (6페이지) {contract.signatureData && '✓'}
            </button>
            <button
              onClick={() => setActiveDocument('terms')}
              className={`py-2 px-4 text-sm font-medium border-b-2 transition-colors ${
                activeDocument === 'terms'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              회원약관 (9페이지) {contract.termsSignatureData && '✓'}
            </button>
          </div>
        </div>
      </div>

      {/* 화면 뷰어 - 한 페이지씩 보기 (인쇄 시 숨김) */}
      <div className="no-print flex-1 bg-gray-200 flex items-center justify-center p-4">
        <div className="max-w-4xl w-full bg-white shadow-lg rounded-lg overflow-hidden">
          {/* 페이지 이미지 */}
          <div className="relative bg-white max-h-[70vh] overflow-y-auto">
            {/* 서명 데이터가 있으면 JSON에서 현재 페이지 이미지 표시 */}
            {(() => {
              const signedDataString = activeDocument === 'application'
                ? contract.signatureData
                : contract.termsSignatureData;

              if (signedDataString) {
                try {
                  const pageDataMap = JSON.parse(signedDataString);
                  const currentPageImage = pageDataMap[currentPage];

                  if (currentPageImage) {
                    return (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={currentPageImage}
                          alt={`${DOCUMENT_CONFIG[activeDocument].title} ${currentPage}페이지 (서명됨)`}
                          className="w-full h-auto"
                        />
                        <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded shadow-lg">
                          ✓ 서명완료
                        </div>
                      </>
                    );
                  }
                } catch (e) {
                  console.error('서명 데이터 파싱 오류:', e);
                }
              }

              // 서명이 없거나 파싱 실패 시 원본 이미지 표시
              return (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/img/${imagePrefix}_페이지_${currentPage}.jpg`}
                    alt={`${DOCUMENT_CONFIG[activeDocument].title} ${currentPage}페이지`}
                    className="w-full h-auto"
                  />
                </>
              );
            })()}
          </div>

          {/* 페이지 네비게이션 - 항상 표시 */}
          <div className="bg-gray-50 border-t p-3">
            <div className="flex items-center justify-between gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                ◀ 이전
              </button>

              <div className="text-center">
                <div className="text-sm font-medium text-gray-700">
                  {currentPage} / {totalPages}
                </div>
                <div className="text-xs text-gray-500">
                  {DOCUMENT_CONFIG[activeDocument].title}
                </div>
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                다음 ▶
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 프린트용 - 모든 페이지 출력 */}
      <div className="print-only">
        <div className="print-section">
          {renderAllPages('application')}
        </div>
        <div className="print-section page-break">
          {renderAllPages('terms')}
        </div>
      </div>

      {/* 인쇄용 CSS */}
      <style jsx global>{`
        /* 화면에서는 프린트용 숨김 */
        .print-only {
          display: none;
        }

        @media print {
          /* 인쇄 시 화면 뷰어 숨기고 프린트용만 표시 */
          .no-print {
            display: none !important;
          }

          .print-only {
            display: block !important;
          }

          /* 페이지 설정 */
          @page {
            margin: 10mm;
            size: A4;
          }

          body {
            margin: 0;
            padding: 0;
            background: white !important;
          }

          /* 섹션 간 페이지 나누기 */
          .page-break {
            page-break-before: always;
          }

          /* 각 페이지가 새 페이지에서 시작 */
          .print-page {
            page-break-after: always;
            page-break-inside: avoid;
          }

          .print-page:last-child {
            page-break-after: auto;
          }

          /* 긴 이미지 (전체 페이지 합친 것) - 자동 페이지 분할 */
          .print-long-image {
            page-break-inside: auto;
          }

          .print-long-image img {
            display: block;
            width: 100% !important;
            max-width: 100% !important;
            height: auto !important;
            margin: 0 auto;
            page-break-inside: auto;
          }

          /* 이미지 최적화 */
          .print-page img {
            display: block;
            width: 100% !important;
            max-width: 100% !important;
            height: auto !important;
            margin: 0 auto;
          }
        }
      `}</style>
    </div>
  );
}