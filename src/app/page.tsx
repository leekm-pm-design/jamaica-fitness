// src/app/page.tsx
import PDFContractForm from '@/components/PDFContractForm';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <PDFContractForm />
    </div>
  );
}