// src/components/ContractForm.tsx
'use client';

import { useState } from 'react';
import SignaturePad from './SignaturePad';
import TermsModal from './TermsModal';

interface ContractData {
  name: string;
  phone: string;
  membershipType: string;
  signatureData: string | null;
  agreedTerms: boolean;
}

const MEMBERSHIP_OPTIONS = [
  { value: '1개월', label: '1개월 (80,000원)' },
  { value: '3개월', label: '3개월 (210,000원)' },
  { value: '6개월', label: '6개월 (390,000원)' },
  { value: '12개월', label: '12개월 (720,000원)' }
];

export default function ContractForm() {
  const [formData, setFormData] = useState<ContractData>({
    name: '',
    phone: '',
    membershipType: '',
    signatureData: null,
    agreedTerms: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [showTermsModal, setShowTermsModal] = useState(false);

  const isFormValid =
    formData.name.trim() &&
    formData.phone.trim() &&
    formData.membershipType &&
    formData.signatureData &&
    formData.agreedTerms;

  const handleInputChange = (field: keyof ContractData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSignatureChange = (signatureData: string | null) => {
    setFormData(prev => ({
      ...prev,
      signatureData
    }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      membershipType: '',
      signatureData: null,
      agreedTerms: false,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid) return;

    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch('/api/contracts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const result = await response.json();
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
        const error = await response.json();
        setMessage({
          type: 'error',
          text: error.error || '계약 처리 중 오류가 발생했습니다.'
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: '네트워크 오류가 발생했습니다.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          🏋️ Jamaica Fitness
        </h1>
        <h2 className="text-xl text-gray-600">신규 회원 계약</h2>
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

      <form onSubmit={handleSubmit} className="space-y-6">
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            서명 *
          </label>
          <SignaturePad onSignatureChange={handleSignatureChange} />
        </div>

        <button
          type="submit"
          disabled={!isFormValid || isSubmitting}
          className={`w-full py-4 px-6 rounded-lg text-lg font-medium transition-colors ${
            isFormValid && !isSubmitting
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isSubmitting ? '처리 중...' : '서명 완료'}
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