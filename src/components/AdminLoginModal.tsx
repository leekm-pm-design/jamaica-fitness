// src/components/AdminLoginModal.tsx
'use client';

import { useState } from 'react';

interface Props {
  isOpen: boolean;
  onSuccess: () => void;
}

export default function AdminLoginModal({ isOpen, onSuccess }: Props) {
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password.trim()) {
      setError('비밀번호를 입력해주세요');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        onSuccess();
        setPassword('');
      } else {
        setError(result.message || '인증에 실패했습니다');
      }
    } catch (error) {
      setError('네트워크 오류가 발생했습니다');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (error) setError(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-w-sm mx-4">
        <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">
          관리자 인증
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              비밀번호
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="관리자 비밀번호를 입력하세요"
              disabled={isSubmitting}
              autoFocus
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !password.trim()}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
              password.trim() && !isSubmitting
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isSubmitting ? '인증 중...' : '로그인'}
          </button>
        </form>

        <div className="mt-4 text-xs text-gray-500 text-center">
          관리자 권한이 필요한 페이지입니다
        </div>
      </div>
    </div>
  );
}