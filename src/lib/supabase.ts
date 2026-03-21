import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL과 Anon Key가 환경변수에 설정되어 있지 않습니다.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * PDF 파일을 Supabase Storage에 업로드
 * @param pdfData Base64 PDF 데이터
 * @param fileName 파일명
 * @returns 업로드된 파일의 공개 URL
 */
export async function uploadPdfToStorage(
  pdfData: string,
  fileName: string
): Promise<string> {
  try {
    // Base64를 Blob으로 변환
    const base64Data = pdfData.includes(',')
      ? pdfData.split(',')[1]
      : pdfData;

    const binaryData = Buffer.from(base64Data, 'base64');
    const blob = new Blob([binaryData], { type: 'application/pdf' });

    // Supabase Storage에 업로드
    const { data, error } = await supabase.storage
      .from('contracts') // 버킷 이름
      .upload(`signed-contracts/${fileName}`, blob, {
        contentType: 'application/pdf',
        upsert: true, // 같은 이름 파일 덮어쓰기
      });

    if (error) {
      console.error('Supabase Storage 업로드 오류:', error);
      throw new Error(`Storage 업로드 실패: ${error.message}`);
    }

    // 공개 URL 가져오기
    const { data: publicUrlData } = supabase.storage
      .from('contracts')
      .getPublicUrl(`signed-contracts/${fileName}`);

    return publicUrlData.publicUrl;
  } catch (error) {
    console.error('PDF 업로드 오류:', error);
    throw error;
  }
}

/**
 * PDF 파일을 Supabase Storage에서 다운로드
 * @param filePath 파일 경로
 * @returns Blob 데이터
 */
export async function downloadPdfFromStorage(filePath: string): Promise<Blob> {
  try {
    const { data, error } = await supabase.storage
      .from('contracts')
      .download(filePath);

    if (error) {
      throw new Error(`Storage 다운로드 실패: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('PDF 다운로드 오류:', error);
    throw error;
  }
}

/**
 * PDF 파일을 Supabase Storage에서 삭제
 * @param filePath 파일 경로
 */
export async function deletePdfFromStorage(filePath: string): Promise<void> {
  try {
    const { error } = await supabase.storage
      .from('contracts')
      .remove([filePath]);

    if (error) {
      throw new Error(`Storage 삭제 실패: ${error.message}`);
    }
  } catch (error) {
    console.error('PDF 삭제 오류:', error);
    throw error;
  }
}
