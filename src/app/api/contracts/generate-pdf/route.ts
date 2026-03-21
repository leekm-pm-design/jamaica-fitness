import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument } from 'pdf-lib';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pdfData, signatureData, signaturePosition } = body;

    if (!pdfData || !signatureData) {
      return NextResponse.json(
        { error: 'PDF 데이터와 서명 데이터가 필요합니다.' },
        { status: 400 }
      );
    }

    // Base64 PDF 데이터를 ArrayBuffer로 변환
    const pdfBytes = Buffer.from(pdfData, 'base64');

    // PDF 문서 로드
    const pdfDoc = await PDFDocument.load(pdfBytes);

    // 서명 이미지 임베드 (JPEG)
    const signatureImageBytes = Buffer.from(
      signatureData.split(',')[1],
      'base64'
    );
    const signatureImage = await pdfDoc.embedJpg(signatureImageBytes);

    // 서명을 추가할 페이지 (기본: 첫 페이지)
    const pageIndex = signaturePosition?.pageIndex || 0;
    const page = pdfDoc.getPages()[pageIndex];
    const { width, height } = page.getSize();

    // 서명 위치 및 크기 계산
    const signatureWidth = signaturePosition?.width || 200;
    const signatureHeight = signaturePosition?.height || 100;
    const x = signaturePosition?.x || width - signatureWidth - 50;
    const y = signaturePosition?.y || 50;

    // 서명 이미지 추가
    page.drawImage(signatureImage, {
      x,
      y,
      width: signatureWidth,
      height: signatureHeight,
    });

    // 수정된 PDF를 Uint8Array로 저장
    const modifiedPdfBytes = await pdfDoc.save();

    // Base64로 인코딩
    const base64Pdf = Buffer.from(modifiedPdfBytes).toString('base64');

    return NextResponse.json({
      success: true,
      pdfData: base64Pdf,
    });
  } catch (error) {
    console.error('PDF 생성 오류:', error);
    return NextResponse.json(
      { error: 'PDF 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
