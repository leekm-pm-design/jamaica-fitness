// src/constants/membership.ts

export const MEMBERSHIP_OPTIONS = [
  { value: '1개월', label: '1개월 (80,000원)' },
  { value: '3개월', label: '3개월 (210,000원)' },
  { value: '6개월', label: '6개월 (390,000원)' },
  { value: '12개월', label: '12개월 (720,000원)' }
] as const;

export const DOCUMENT_CONFIG = {
  application: {
    title: '입회신청서',
    totalPages: 6,
    pdfUrl: '/입회신청서.pdf'
  },
  terms: {
    title: '회원약관',
    totalPages: 9,
    pdfUrl: '/회원약관.pdf'
  }
} as const;
