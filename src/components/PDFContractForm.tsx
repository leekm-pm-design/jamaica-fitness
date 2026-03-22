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
  const [activeDocument, setActiveDocument] = useState<DocumentType>('terms'); // 회원약관부터 시작
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
    setActiveDocument('terms'); // 회원약관부터 시작
    setMessage(null);
  };

  // 회원약관 서명 완료 (먼저)
  const handleTermsComplete = (signatureData: string, pdfData: ArrayBuffer) => {
    console.log('회원약관 서명 완료 호출됨', {
      termsSignatureLength: signatureData.length
    });

    setFormData(prev => ({
      ...prev,
      termsSignature: signatureData,
      pdfData
    }));

    // 팝업 없이 자동으로 입회신청서 탭으로 전환
    setActiveDocument('application');
  };

  // 입회신청서 서명 완료 (나중 - 최종 제출)
  const handleApplicationComplete = async (signatureData: string, pdfData: ArrayBuffer) => {
    console.log('입회신청서 서명 완료 호출됨', {
      hasTermsSignature: !!formData.termsSignature,
      applicationSignatureLength: signatureData.length
    });

    // 회원약관 서명 확인
    if (!formData.termsSignature) {
      console.log('회원약관 서명 없음 - 에러 메시지 표시');
      setMessage({
        type: 'error',
        text: '회원약관 서명을 먼저 완료해주세요.'
      });
      return;
    }

    console.log('두 서명 모두 있음 - 제출 시작');
    setFormData(prev => ({
      ...prev,
      applicationSignature: signatureData
    }));

    // 두 서명 모두 완료 후 자동 제출
    await submitContract(signatureData, formData.termsSignature);
  };

  const submitContract = async (applicationSignature: string, termsSignature: string) => {
    setIsSubmitting(true);

    try {
      // 1단계: 데이터 준비 중
      setMessage({
        type: 'success',
        text: '📝 계약 데이터 준비 중...'
      });

      await new Promise(resolve => setTimeout(resolve, 500));

      // 2단계: 서버 전송 중
      setMessage({
        type: 'success',
        text: '📤 서버에 전송 중...'
      });

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
        // 3단계: 저장 완료
        setMessage({
          type: 'success',
          text: '💾 데이터베이스 저장 중...'
        });

        await new Promise(resolve => setTimeout(resolve, 500));

        // 4단계: 완료
        setMessage({
          type: 'success',
          text: '✅ 계약이 성공적으로 완료되었습니다!'
        });

        await new Promise(resolve => setTimeout(resolve, 1000));

        // 완료 팝업 표시
        setMessage(null);
        alert('🎉 계약이 성공적으로 완료되었습니다!\n\n고객님의 계약서가 저장되었습니다.\n감사합니다.');

        // 폼 초기화
        resetForm();
      } else {
        const error = await contractResponse.json();
        setMessage({
          type: 'error',
          text: '❌ ' + (error.error || '계약 처리 중 오류가 발생했습니다.')
        });

        // 에러 팝업도 표시
        await new Promise(resolve => setTimeout(resolve, 1000));
        alert('❌ 오류가 발생했습니다\n\n' + (error.error || '계약 처리 중 오류가 발생했습니다.') + '\n\n다시 시도해주세요.');
      }
    } catch (error) {
      console.error('계약 처리 오류:', error);
      setMessage({
        type: 'error',
        text: '❌ 네트워크 오류가 발생했습니다. 다시 시도해주세요.'
      });

      // 네트워크 에러 팝업
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('❌ 네트워크 오류\n\n인터넷 연결을 확인하고 다시 시도해주세요.');
      setMessage(null);
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
    setActiveDocument('terms'); // 회원약관부터 시작
    setMessage(null);

    // 서명 데이터 초기화
    setApplicationPageSignatures(new Map());
    setTermsPageSignatures(new Map());
    setApplicationCurrentPage(1);
    setTermsCurrentPage(1);

    console.log('폼 및 서명 데이터 완전 초기화됨');
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
                onClick={() => setActiveDocument('terms')}
                className={`py-2 px-4 text-sm font-medium border-b-2 transition-colors ${
                  activeDocument === 'terms'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                1. 회원약관 (9p) {formData.termsSignature && '✓'}
              </button>
              <button
                onClick={() => setActiveDocument('application')}
                className={`py-2 px-4 text-sm font-medium border-b-2 transition-colors ${
                  activeDocument === 'application'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                2. 입회신청서 (6p) {formData.applicationSignature && '✓'}
              </button>
            </div>
          </div>
        </div>

        {/* 진행 상황 메시지 - 최상단에 표시 */}
        {message && (
          <div className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[9999] p-6 rounded-lg text-center text-lg font-bold shadow-2xl border-4 min-w-[300px] ${
            message.type === 'success'
              ? 'bg-white text-green-700 border-green-500'
              : 'bg-white text-red-700 border-red-500'
          }`}>
            <div className="text-4xl mb-2">{message.text.split(' ')[0]}</div>
            <div className="text-base font-medium">{message.text.split(' ').slice(1).join(' ')}</div>
          </div>
        )}

        {/* 문서별 서명 패드 - 조건부 렌더링 */}
        <div className="flex-1 overflow-hidden">
          {activeDocument === 'terms' ? (
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
          ) : (
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
