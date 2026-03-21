// src/app/admin/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { isAuthenticated } from '@/lib/auth';
import CustomerTable from '@/components/CustomerTable';
import AdminLoginModal from '@/components/AdminLoginModal';

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    try {
      const response = await fetch('/api/auth/verify', {
        method: 'GET',
      });

      if (response.ok) {
        setIsLoggedIn(true);
      } else {
        setShowLoginModal(true);
      }
    } catch (error) {
      setShowLoginModal(true);
    } finally {
      setIsCheckingAuth(false);
    }
  };

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setShowLoginModal(false);
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg text-gray-600">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminLoginModal
        isOpen={showLoginModal}
        onSuccess={handleLoginSuccess}
      />

      {isLoggedIn && (
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Jamaica Fitness 관리자
            </h1>
            <p className="text-gray-600">고객 계약 관리 시스템</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <CustomerTable />
          </div>
        </div>
      )}
    </div>
  );
}