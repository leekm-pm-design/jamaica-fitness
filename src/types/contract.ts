// src/types/contract.ts

export interface ContractData {
  name: string;
  phone: string;
  membershipType: string;
  applicationSignature: string | null; // 입회신청서 서명
  termsSignature: string | null; // 회원약관 서명
  pdfData: ArrayBuffer | null;
  agreedTerms: boolean;
}

export interface Contract {
  id: number;
  contractDate: string;
  pdfUrl?: string | null;
}

export interface Customer {
  id: number;
  name: string;
  phone: string;
  membershipType: string;
  createdAt: string;
  contracts: Contract[];
}

export interface MessageState {
  type: 'success' | 'error';
  text: string;
}

export type DocumentType = 'application' | 'terms';

export type SignatureStep = 1 | 2; // 1: form, 2: signature
