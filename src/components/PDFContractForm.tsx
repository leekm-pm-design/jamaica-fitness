// src/components/PDFContractForm.tsx
'use client';

import { useState } from 'react';
import PDFSignaturePad from './PDFSignaturePad';
import TermsModal from './TermsModal';
import { ContractData, MessageState, DocumentType, SignatureStep } from '@/types/contract';
import { MEMBERSHIP_OPTIONS, DOCUMENT_CONFIG } from '@/constants/membership';

export default function PDFContractForm() {
  const [formData, setFormData] = useState<ContractData>({
    name: '',
    phone: '',
    membershipType: '',
    applicationSignature: null,
    termsSignature: null,
    pdfData: null,
    agreedTerms: false,
  });

  const [step, setStep] = useState<SignatureStep>(1);
  const [activeDocument, setActiveDocument] = useState<DocumentType>('application');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<MessageState | null>(null);
  const [showTermsModal, setShowTermsModal] = useState(false);

  // 각 문서별 페이지 서명 데이터
  const [applicationPageSignatures, setApplicationPageSignatures] = useState<Map<number, any>>(new Map());
  const [termsPageSignatures, setTermsPageSignatures] = useState<Map<number, any>>(new Map());

  // 각 문서별 현재 페이지
  const [applicationCurrentPage, setApplicationCurrentPage] = useState(1);
  const [termsCurrentPage, setTermsCurrentPage] = useState(1);

  const isBasicInfoValid =
    formData.name.trim() &&
    formData.phone.trim() &&
    formData.membershipType &&
    formData.agreedTerms;

  const handleInputChange = (field: keyof ContractData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleProceedToSignature = () => {
    if (!isBasicInfoValid) {
      setMessage({
        type: 'error',
        text: '모든 필수 정보를 입력해주세요.'
      });
      return;
    }
    setStep(2); // 서명 화면으로 이동
    setActiveDocument('application'); // 입회신청서부터 시작
    setMessage(null);
  };

  // 입회신청서 서명 완료
  const handleApplicationComplete = (signatureData: string, pdfData: ArrayBuffer) => {
    setFormData(prev => ({
      ...prev,
      applicationSignature: signatureData,
      pdfData
    }));
    setMessage({
      type: 'success',
      text: '입회신청서 서명이 완료되었습니다!'
    });
    // 자동으로 회원약관 탭으로 전환
    setTimeout(() => {
      setActiveDocument('terms');
      setMessage(null);
    }, 1500);
  };

  // 회원약관 서명 완료
  const handleTermsComplete = async (signatureData: string, pdfData: ArrayBuffer) => {
    console.log('회원약관 서명 완료 호출됨', {
      hasApplicationSignature: !!formData.applicationSignature,
      termsSignatureLength: signatureData.length
    });

    // 두 서명 모두 완료 확인
    if (!formData.applicationSignature) {
      console.log('입회신청서 서명 없음 - 에러 메시지 표시');
      setMessage({
        type: 'error',
        text: '입회신청서 서명을 먼저 완료해주세요.'
      });
      return;
    }

    console.log('두 서명 모두 있음 - 제출 시작');
    setFormData(prev => ({
      ...prev,
      termsSignature: signatureData
    }));

    // 두 서명 모두 완료 후 자동 제출
    await submitContract(formData.applicationSignature, signatureData);
  };

  const submitContract = async (applicationSignature: string, termsSignature: string) => {
    setIsSubmitting(true);
    setMessage(null);

    try {
      // 계약 데이터 저장 (두 개의 서명)
      const contractResponse = await fetch('/api/contracts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          membershipType: formData.membershipType,
          applicationSignature,
          termsSignature,
          agreedTerms: formData.agreedTerms
        }),
      });

      if (contractResponse.ok) {
        setMessage({
          type: 'success',
          text: '✅ 계약이 완료되었습니다!'
        });

        // 3초 후 자동 초기화
        setTimeout(() => {
          resetForm();
          setMessage(null);
        }, 3000);
      } else {
        const error = await contractResponse.json();
        setMessage({
          type: 'error',
          text: error.error || '계약 처리 중 오류가 발생했습니다.'
        });
      }
    } catch (error) {
      console.error('계약 처리 오류:', error);
      setMessage({
        type: 'error',
        text: '계약 처리 중 오류가 발생했습니다.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      membershipType: '',
      applicationSignature: null,
      termsSignature: null,
      pdfData: null,
      agreedTerms: false,
    });
    setStep(1);
  };

  const handleBackToForm = () => {
    setStep(1);
    setActiveDocument('application');
  };

  // Step 2: 서명 화면 (탭으로 두 문서 전환)
  if (step === 2) {
    return (
      <div className="fixed inset-0 bg-gray-50 flex flex-col">
        {/* 상단 탭 헤더 */}
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex gap-4">
              <button
                onClick={() => setActiveDocument('application')}
                className={`py-2 px-4 text-sm font-medium border-b-2 transition-colors ${
                  activeDocument === 'application'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                입회신청서 (6p) {formData.applicationSignature && '✓'}
              </button>
              <button
                onClick={() => setActiveDocument('terms')}
                className={`py-2 px-4 text-sm font-medium border-b-2 transition-colors ${
                  activeDocument === 'terms'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                회원약관 (9p) {formData.termsSignature && '✓'}
              </button>
            </div>
          </div>
        </div>

        {/* 성공 메시지 */}
        {message && (
          <div className={`fixed top-12 left-1/2 transform -translate-x-1/2 z-50 p-3 rounded-lg text-center text-base font-medium shadow-lg ${
            message.type === 'success'
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}>
            {message.text}
          </div>
        )}

        {/* 문서별 서명 패드 - 조건부 렌더링 */}
        <div className="flex-1 overflow-hidden">
          {activeDocument === 'application' ? (
            <PDFSignaturePad
              key="application"
              pdfUrl="/입회신청서.pdf"
              documentType="application"
              totalPages={6}
              pageSignatures={applicationPageSignatures}
              onPageSignaturesChange={setApplicationPageSignatures}
              currentPage={applicationCurrentPage}
              onCurrentPageChange={setApplicationCurrentPage}
              onSignatureComplete={handleApplicationComplete}
              onBack={handleBackToForm}
            />
          ) : (
            <PDFSignaturePad
              key="terms"
              pdfUrl="/회원약관.pdf"
              documentType="terms"
              totalPages={9}
              pageSignatures={termsPageSignatures}
              onPageSignaturesChange={setTermsPageSignatures}
              currentPage={termsCurrentPage}
              onCurrentPageChange={setTermsCurrentPage}
              onSignatureComplete={handleTermsComplete}
              onBack={handleBackToForm}
            />
          )}
        </div>
      </div>
    );
  }

  // Step 1: 정보 입력 폼

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          🏋️ Jamaica Fitness
        </h1>
        <h2 className="text-xl text-gray-600">신규 회원 계약</h2>
        <div className="mt-4 text-sm text-gray-500">
          단계 1/3: 정보 입력
        </div>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-lg text-center text-lg font-medium ${
          message.type === 'success'
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800'
        }`}>
          {message.text}
        </div>
      )}

      <form className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            이름 *
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
            placeholder="고객님의 성함을 입력하세요"
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
            전화번호 *
          </label>
          <input
            type="tel"
            id="phone"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
            placeholder="010-0000-0000"
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label htmlFor="membershipType" className="block text-sm font-medium text-gray-700 mb-2">
            회원권 종류 *
          </label>
          <select
            id="membershipType"
            value={formData.membershipType}
            onChange={(e) => handleInputChange('membershipType', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
            disabled={isSubmitting}
          >
            <option value="">회원권을 선택하세요</option>
            {MEMBERSHIP_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="flex items-center space-x-3 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={formData.agreedTerms}
                onChange={(e) => handleInputChange('agreedTerms', e.target.checked)}
                className="h-5 w-5 text-blue-600"
                disabled={isSubmitting}
              />
              <span>이용약관 및 개인정보 수집·이용에 동의합니다 *</span>
            </label>
            <button
              type="button"
              onClick={() => setShowTermsModal(true)}
              className="text-blue-600 text-sm underline hover:text-blue-800"
              disabled={isSubmitting}
            >
              약관 보기
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={handleProceedToSignature}
          disabled={!isBasicInfoValid || isSubmitting}
          className={`w-full py-4 px-6 rounded-lg text-lg font-medium transition-colors ${
            isBasicInfoValid && !isSubmitting
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          다음: 서명하기 (입회신청서 + 회원약관) →
        </button>
      </form>

      {/* 약관 모달 */}
      <TermsModal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        onAgree={() => handleInputChange('agreedTerms', true)}
      />
    </div>
  );
}
