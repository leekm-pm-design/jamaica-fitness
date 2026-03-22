'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import SignaturePad from 'signature_pad';
import { DocumentType } from '@/types/contract';

interface PDFSignaturePadProps {
  pdfUrl: string;
  documentType: DocumentType;
  totalPages: number;
  pageSignatures: Map<number, any>;
  onPageSignaturesChange: (signatures: Map<number, any>) => void;
  currentPage: number;
  onCurrentPageChange: (page: number) => void;
  onSignatureComplete: (signatureData: string, pdfData: ArrayBuffer) => void;
  onClear?: () => void;
  onBack?: () => void;
}

export default function PDFSignaturePad({
  pdfUrl,
  documentType,
  totalPages,
  pageSignatures,
  onPageSignaturesChange,
  currentPage,
  onCurrentPageChange,
  onSignatureComplete,
  onClear,
  onBack
}: PDFSignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [signaturePad, setSignaturePad] = useState<SignaturePad | null>(null);
  const [pdfArrayBuffer, setPdfArrayBuffer] = useState<ArrayBuffer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState<HTMLImageElement | null>(null);

  // 문서 타입에 따른 이미지 파일명 prefix
  const imagePrefix = documentType === 'application' ? '입회신청서' : '회원약관';

  // PDF를 ArrayBuffer로 로드
  useEffect(() => {
    fetch(pdfUrl)
      .then(res => res.arrayBuffer())
      .then(buffer => {
        setPdfArrayBuffer(buffer);
        setIsLoading(false);
      })
      .catch(err => {
        console.error('PDF 로드 실패:', err);
        setIsLoading(false);
      });
  }, [pdfUrl]);

  // 현재 페이지의 배경 이미지 로드
  useEffect(() => {
    const img = new Image();
    img.src = `/img/${imagePrefix}_페이지_${currentPage}.jpg`;
    img.onload = () => {
      console.log(`[${documentType}] 페이지 ${currentPage} 이미지 로드 완료`);
      setBackgroundImage(img);
    };
    img.onerror = (err) => {
      console.error(`[${documentType}] 페이지 ${currentPage} 이미지 로드 실패:`, err);
    };
  }, [currentPage, imagePrefix, documentType]);

  // 고정된 표준 해상도 (모든 페이지 동일)
  const STANDARD_WIDTH = 1200;

  // 서명 패드 초기화 - 배경 이미지 로드 후 실행
  useEffect(() => {
    if (isLoading || !canvasRef.current || !containerRef.current || !backgroundImage) {
      console.log('Canvas 초기화 대기 중...', {
        isLoading,
        hasCanvas: !!canvasRef.current,
        hasContainer: !!containerRef.current,
        hasBackground: !!backgroundImage
      });
      return;
    }

    // DOM이 완전히 렌더링될 때까지 약간 대기
    const timer = setTimeout(() => {
      const canvas = canvasRef.current;
      const container = containerRef.current;

      if (!canvas || !container || !backgroundImage) {
        console.log('Canvas, Container 또는 배경 이미지가 없습니다');
        return;
      }

      console.log(`SignaturePad 초기화 시작 (페이지 ${currentPage})`);

      // 표준 높이 계산
      const standardHeight = Math.round((STANDARD_WIDTH / backgroundImage.width) * backgroundImage.height);

      // 캔버스를 표준 크기로 설정 (모든 페이지 동일)
      const resizeCanvas = () => {
        canvas.width = STANDARD_WIDTH;
        canvas.height = standardHeight;

        // CSS로 화면에 맞춰 표시
        const rect = container.getBoundingClientRect();
        canvas.style.width = `${rect.width}px`;
        canvas.style.height = `${rect.height}px`;

        // 배경 이미지 그리기
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(backgroundImage, 0, 0, STANDARD_WIDTH, standardHeight);
        }

        console.log('Canvas 크기:', {
          canvasWidth: STANDARD_WIDTH,
          canvasHeight: standardHeight,
          displayWidth: rect.width,
          displayHeight: rect.height,
          imageWidth: backgroundImage.width,
          imageHeight: backgroundImage.height
        });
      };

      resizeCanvas();

      const pad = new SignaturePad(canvas, {
        backgroundColor: 'rgba(0, 0, 0, 0)', // 투명 배경
        penColor: 'rgb(0, 0, 0)', // 검은색 서명
        minWidth: 2,
        maxWidth: 4,
      });

      console.log('SignaturePad 생성 완료:', pad);
      setSignaturePad(pad);

      // 윈도우 리사이즈 핸들러
      const handleResize = () => {
        const data = pad.toData();
        resizeCanvas();
        pad.clear();
        // 배경 이미지를 다시 그린 후 서명 복원
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(backgroundImage, 0, 0, STANDARD_WIDTH, standardHeight);
        }
        pad.fromData(data);
      };

      window.addEventListener('resize', handleResize);

      // Cleanup
      return () => {
        window.removeEventListener('resize', handleResize);
        try {
          pad.clear();
          pad.off();
        } catch (e) {
          console.error('SignaturePad cleanup error:', e);
        }
      };
    }, 100); // 100ms 대기

    return () => clearTimeout(timer);
  }, [isLoading, backgroundImage, currentPage]);

  const handleClear = () => {
    if (!signaturePad) return;

    signaturePad.clear();

    // 현재 페이지의 저장된 서명도 삭제
    const newMap = new Map(pageSignatures);
    newMap.delete(currentPage);
    onPageSignaturesChange(newMap);
    console.log(`[${documentType}] 페이지 ${currentPage}의 서명 삭제됨`);
    onClear?.();
  };

  const handleComplete = async () => {
    console.log(`[${documentType}] 서명 완료 버튼 클릭`);
    setIsSaving(true);

    // 현재 페이지에 서명이 있는지 확인
    const currentPageHasSignature = signaturePad && !signaturePad.isEmpty();

    console.log(`[${documentType}] 서명 상태:`, {
      currentPageHasSignature,
      pageSignaturesSize: pageSignatures.size,
      currentPage,
      hasSignaturePad: !!signaturePad
    });

    // 전체 페이지 중 하나라도 서명이 있는지 확인 (현재 페이지 포함)
    const hasAnySignature = pageSignatures.size > 0 || currentPageHasSignature;

    if (!hasAnySignature) {
      console.log(`[${documentType}] 서명 없음 - 경고 표시`);
      alert('최소 1개 페이지에 서명을 입력해주세요.');
      setIsSaving(false);
      return;
    }

    console.log(`[${documentType}] 서명 확인 완료, 처리 시작`);

    // 현재 페이지의 서명 먼저 저장
    let allSignatures = new Map(pageSignatures);
    if (currentPageHasSignature) {
      const signatureData = signaturePad.toData();
      allSignatures.set(currentPage, signatureData);
      onPageSignaturesChange(allSignatures);
      console.log(`[${documentType}] 현재 페이지(${currentPage}) 서명 저장됨`);
    }

    if (!pdfArrayBuffer) {
      alert('PDF를 로딩 중입니다. 잠시 후 다시 시도해주세요.');
      setIsSaving(false);
      return;
    }

    console.log(`[${documentType}] 전체 ${totalPages}페이지 중 ${allSignatures.size}개 페이지에 서명됨`);

    // 모든 페이지의 이미지 로드
    const pageImages: HTMLImageElement[] = [];
    for (let page = 1; page <= totalPages; page++) {
      const img = new Image();
      img.src = `/img/${imagePrefix}_페이지_${page}.jpg`;

      try {
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject(new Error(`페이지 ${page} 이미지 로드 실패`));
        });
        pageImages.push(img);
      } catch (err) {
        alert(`페이지 ${page}의 배경 이미지를 로드할 수 없습니다.`);
        setIsSaving(false);
        return;
      }
    }

    console.log(`[${documentType}] 전체 ${pageImages.length}개 페이지 이미지 로드 완료`);

    // 각 페이지를 표준 해상도로 정규화하여 저장
    const pageDataMap: { [key: number]: string } = {};

    for (let page = 1; page <= totalPages; page++) {
      const img = pageImages[page - 1];

      // 모든 페이지를 동일한 표준 너비로 정규화 (높이는 비율 유지)
      const standardHeight = Math.round((STANDARD_WIDTH / img.width) * img.height);

      // 페이지별 캔버스 생성 (표준 크기)
      const pageCanvas = document.createElement('canvas');
      pageCanvas.width = STANDARD_WIDTH;
      pageCanvas.height = standardHeight;

      const ctx = pageCanvas.getContext('2d');
      if (!ctx) {
        alert('Canvas 처리 중 오류가 발생했습니다.');
        setIsSaving(false);
        return;
      }

      // 1. 배경 이미지 그리기 (표준 크기로 축소)
      ctx.drawImage(img, 0, 0, STANDARD_WIDTH, standardHeight);

      // 2. 해당 페이지에 서명이 있으면 위에 그리기
      const pageSignature = allSignatures.get(page);
      if (pageSignature && pageSignature.length > 0) {
        console.log(`[${documentType}] 페이지 ${page}의 서명 추가 (표준: ${STANDARD_WIDTH}x${standardHeight})`);

        // 서명은 이미 표준 크기(1200px) 기준으로 저장되어 있음 - 스케일링 불필요!
        // 임시 캔버스에 서명 그리기 (표준 크기)
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = STANDARD_WIDTH;
        tempCanvas.height = standardHeight;
        const tempPad = new SignaturePad(tempCanvas);

        try {
          // 서명 데이터를 그대로 사용 (이미 1200px 기준)
          tempPad.fromData(pageSignature);
          // 서명을 배경 위에 그림
          ctx.drawImage(tempCanvas, 0, 0);
          console.log(`[${documentType}] 페이지 ${page} 서명 렌더링 완료 (포인트 수: ${pageSignature.length})`);
        } catch (e) {
          console.error(`[${documentType}] 페이지 ${page} 서명 렌더링 실패:`, e);
        }
      }

      // 3. 각 페이지를 JPEG로 변환 (품질 0.3 - 표준 해상도이므로 품질 조금 올림)
      const pageData = pageCanvas.toDataURL('image/jpeg', 0.3);
      pageDataMap[page] = pageData;
      console.log(`[${documentType}] 페이지 ${page} 저장 완료: ${STANDARD_WIDTH}x${standardHeight} (${Math.round(pageData.length / 1024)}KB)`);
    }

    console.log(`[${documentType}] 전체 ${totalPages}페이지 개별 저장 완료`);

    // 4. JSON으로 변환하여 저장
    const signatureData = JSON.stringify(pageDataMap);
    const dataSizeKB = Math.round(signatureData.length / 1024);
    const dataSizeMB = (signatureData.length / (1024 * 1024)).toFixed(2);

    console.log(`[${documentType}] 서명 완료 (배경+서명 합성):`, {
      totalSignedPages: pageSignatures.size,
      signatureDataSize: `${dataSizeKB}KB (${dataSizeMB}MB)`,
      totalPages: Object.keys(pageDataMap).length
    });

    if (signatureData.length > 4 * 1024 * 1024) {
      console.error(`⚠️ 데이터가 너무 큽니다! (${dataSizeMB}MB) - 4.5MB 제한 초과 가능`);
      alert(`경고: 데이터 크기가 ${dataSizeMB}MB입니다. 저장에 실패할 수 있습니다.`);
    }

    onSignatureComplete(signatureData, pdfArrayBuffer);
    setIsSaving(false);
  };

  // 페이지 변경 시 서명 불러오기
  useEffect(() => {
    if (!signaturePad || !currentPage || !backgroundImage || !canvasRef.current) return;

    console.log(`[${documentType}] 페이지 ${currentPage}로 전환 - 서명 로드 시도`);

    // 약간의 지연을 두어 state 업데이트가 완료되도록 함
    const timer = setTimeout(() => {
      const canvas = canvasRef.current;
      if (!canvas || !backgroundImage) return;

      // 표준 높이 계산
      const standardHeight = Math.round((STANDARD_WIDTH / backgroundImage.width) * backgroundImage.height);

      // 배경 이미지를 먼저 그림
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(backgroundImage, 0, 0, STANDARD_WIDTH, standardHeight);
      }

      // 저장된 서명이 있으면 복원
      const savedSignature = pageSignatures.get(currentPage);
      if (savedSignature && savedSignature.length > 0) {
        console.log(`[${documentType}] 페이지 ${currentPage}의 저장된 서명 불러옴 (${savedSignature.length}개 스트로크)`);
        signaturePad.clear();
        signaturePad.fromData(savedSignature);
      } else {
        console.log(`[${documentType}] 페이지 ${currentPage}는 서명 없음 - 캔버스 초기화`);
        signaturePad.clear();
      }
    }, 50);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, signaturePad, documentType, backgroundImage]);
  // pageSignatures는 의도적으로 제외하여 무한 루프 방지


  const handlePageChange = (newPage: number) => {
    console.log(`[${documentType}] 페이지 변경 요청:`, { currentPage, newPage, totalPages });
    if (newPage >= 1 && newPage <= totalPages) {
      // 현재 페이지의 서명을 먼저 저장 (비어있지 않으면)
      const newMap = new Map(pageSignatures);

      if (signaturePad && !signaturePad.isEmpty()) {
        const signatureData = signaturePad.toData();
        newMap.set(currentPage, signatureData);
        console.log(`[${documentType}] 페이지 ${currentPage}의 서명 저장됨 (${signatureData.length}개 포인트)`);
      } else {
        console.log(`[${documentType}] 페이지 ${currentPage}는 비어있음 - 저장 안 함`);
      }

      // state 업데이트
      onPageSignaturesChange(newMap);

      // 페이지 변경
      onCurrentPageChange(newPage);
      console.log(`[${documentType}] 페이지 변경됨:`, newPage);
    } else {
      console.log(`[${documentType}] 페이지 범위 초과:`, newPage);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-6xl mx-auto">
        <div className="flex items-center justify-center h-screen">
          <p className="text-gray-500 text-lg">📄 PDF 로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-gray-900 flex flex-col">
      {/* 이미지 뷰어 + 서명 오버레이 - 전체화면 */}
      <div
        ref={containerRef}
        className="flex-1 relative bg-gray-100 overflow-hidden flex items-center justify-center"
      >
        {/* 서명 캔버스 (배경 이미지 포함) */}
        <canvas
          ref={canvasRef}
          className="cursor-crosshair"
          style={{
            touchAction: 'none',
            pointerEvents: 'auto',
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain'
          }}
        />
      </div>

      {/* 하단 컨트롤 바 */}
      <div className="bg-white border-t-2 border-blue-400 p-2">
        {/* 컨트롤 버튼 */}
        <div className="flex gap-2 w-full">
          <button
            onClick={() => onBack ? onBack() : window.history.back()}
            className="flex-1 py-2 bg-gray-600 text-white text-xs sm:text-sm font-medium rounded hover:bg-gray-700 transition-colors whitespace-nowrap"
          >
            ← 뒤로가기
          </button>

          {/* 페이지 네비게이션 */}
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="flex-1 py-2 bg-blue-500 text-white text-xs sm:text-sm font-medium rounded hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed whitespace-nowrap"
          >
            ◀ 이전
          </button>

          <div className="flex-1 py-2 bg-gray-100 text-gray-800 text-xs sm:text-sm font-bold rounded flex items-center justify-center whitespace-nowrap">
            {currentPage} / {totalPages}
          </div>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="flex-1 py-2 bg-blue-500 text-white text-xs sm:text-sm font-medium rounded hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed whitespace-nowrap"
          >
            다음 ▶
          </button>

          <button
            onClick={handleClear}
            className="flex-1 py-2 bg-red-500 text-white text-xs sm:text-sm font-medium rounded hover:bg-red-600 transition-colors whitespace-nowrap"
          >
            서명취소
          </button>

          <button
            onClick={handleComplete}
            disabled={isSaving}
            className={`flex-1 py-2 ${isSaving ? 'bg-blue-400 cursor-not-allowed animate-pulse' : 'bg-green-600 hover:bg-green-700'} text-white text-xs sm:text-sm font-medium rounded transition-colors whitespace-nowrap`}
          >
            {isSaving ? '⏳ 처리 중...' : '✓ 서명완료'}
          </button>
        </div>
      </div>
    </div>
  );
}
