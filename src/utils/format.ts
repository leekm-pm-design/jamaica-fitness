// src/utils/format.ts

/**
 * 날짜를 "MM월 DD일" 형식으로 포맷팅
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR', {
    month: '2-digit',
    day: '2-digit'
  });
}

/**
 * 전화번호를 "010-1234-5678" 형식으로 포맷팅
 */
export function formatPhone(phone: string): string {
  // 숫자만 추출
  const cleaned = phone.replace(/\D/g, '');

  // 11자리 전화번호
  if (cleaned.length === 11) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7)}`;
  }

  // 10자리 전화번호
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }

  // 그 외는 원본 반환
  return phone;
}
