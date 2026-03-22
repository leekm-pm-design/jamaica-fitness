// src/app/contract/[id]/page.tsx
'use client';

import ContractView from '@/components/ContractView';

interface Props {
  params: {
    id: string;
  };
}

export default function ContractPage({ params }: Props) {
  const contractId = parseInt(params.id);

  if (isNaN(contractId)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-red-600 mb-4">유효하지 않은 계약 ID입니다</div>
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

  return <ContractView contractId={contractId} />;
}