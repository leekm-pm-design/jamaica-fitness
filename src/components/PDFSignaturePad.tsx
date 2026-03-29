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
  isActive?: boolean; // 활성 탭 여부
  onBackgroundReady?: () => void; // 배경 이미지 준비 완료 콜백
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
  onBack,
  isActive = true,
  onBackgroundReady
}: PDFSignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const backgroundCanvasRef = useRef<HTMLCanvasElement>(null); // 배경 전용 캔버스
  const containerRef = useRef<HTMLDivElement>(null);
  const [signaturePad, setSignaturePad] = useState<SignaturePad | null>(null);
  const [pdfArrayBuffer, setPdfArrayBuffer] = useState<ArrayBuffer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState<HTMLImageElement | null>(null);

  // 문서 타입에 따른 이미지 파일명 prefix
  const imagePrefix = documentType === 'application' ? '입회신청서' : '회원약관';

  // PDF를 ArrayBuffer로 로드 (이미지만 사용하므로 즉시 완료 처리)
  useEffect(() => {
    // PDF는 사용하지 않고 이미지만 사용
    setIsLoading(false);
    console.log(`[${documentType}] 초기화 시작 (이미지 모드)`);
  }, [documentType]);

  // 현재 페이지의 배경 이미지 로드
  useEffect(() => {
    console.log(`[${documentType}] 이미지 로드 시도: /img/${imagePrefix}_페이지_${currentPage}.jpg`);

    let mounted = true;
    let retryCount = 0;
    const maxRetries = 3;

    const loadImage = () => {
      const img = new Image();
      // 모바일에서 crossOrigin 이슈 방지 - 같은 도메인이므로 제거
      // img.crossOrigin = 'anonymous';

      const imagePath = `/img/${imagePrefix}_페이지_${currentPage}.jpg`;

      img.onload = () => {
        if (!mounted) return;

        console.log(`[${documentType}] 페이지 ${currentPage} 이미지 로드 완료`, {
          width: img.width,
          height: img.height,
          src: img.src,
          complete: img.complete,
          naturalWidth: img.naturalWidth
        });
        setBackgroundImage(img);
      };

      img.onerror = (err) => {
        if (!mounted) return;

        console.error(`[${documentType}] 페이지 ${currentPage} 이미지 로드 실패 (시도 ${retryCount + 1}/${maxRetries}):`, {
          src: imagePath,
          error: err
        });

        // 재시도
        if (retryCount < maxRetries) {
          retryCount++;
          console.log(`[${documentType}] 이미지 로드 재시도 중... (${retryCount}/${maxRetries})`);
          setTimeout(() => {
            if (mounted) loadImage();
          }, 500 * retryCount); // 점진적 지연
        } else {
          console.error(`[${documentType}] 이미지 로드 최종 실패`);
          alert(`페이지 ${currentPage}의 이미지를 불러올 수 없습니다. 네트워크를 확인해주세요.`);
        }
      };

      // src 설정 (캐시 방지를 위해 타임스탬프 추가하지 않음 - 같은 이미지 재사용)
      img.src = imagePath;
    };

    loadImage();

    return () => {
      mounted = false;
    };
  }, [currentPage, imagePrefix, documentType]);

  // 고정된 표준 해상도 (모든 페이지 완전히 동일, A4 비율)
  const STANDARD_WIDTH = 1200;
  const STANDARD_HEIGHT = 1697; // A4 비율 (210:297 = 1:1.414)

  // 배경 캔버스에 이미지 그리기 - isActive가 true가 될 때도 다시 그림
  useEffect(() => {
    const bgCanvas = backgroundCanvasRef.current;

    if (!bgCanvas || !backgroundImage) {
      console.log(`[${documentType}] 배경 캔버스 대기 중:`, {
        hasCanvas: !!bgCanvas,
        hasImage: !!backgroundImage,
        isActive,
        imageComplete: backgroundImage?.complete,
        imageSrc: backgroundImage?.src
      });
      return;
    }

    const drawBackground = () => {
      console.log(`[${documentType}] 배경 그리기 시도 (페이지 ${currentPage})`);

      const ctx = bgCanvas.getContext('2d', { willReadFrequently: false });
      if (!ctx) {
        console.error(`[${documentType}] Canvas context를 가져올 수 없음`);
        return;
      }

      // 배경 캔버스 크기 설정 (내부 해상도) - 한 번만 설정
      if (bgCanvas.width !== STANDARD_WIDTH || bgCanvas.height !== STANDARD_HEIGHT) {
        bgCanvas.width = STANDARD_WIDTH;
        bgCanvas.height = STANDARD_HEIGHT;
      }

      // 배경색으로 먼저 채우기
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, STANDARD_WIDTH, STANDARD_HEIGHT);

      // 배경 이미지 그리기
      try {
        ctx.drawImage(backgroundImage, 0, 0, STANDARD_WIDTH, STANDARD_HEIGHT);
        console.log(`[${documentType}] ✅ 배경 이미지 그려짐 (페이지 ${currentPage}):`, {
          canvasWidth: bgCanvas.width,
          canvasHeight: bgCanvas.height,
          imageWidth: backgroundImage.width,
          imageHeight: backgroundImage.height,
          imageComplete: backgroundImage.complete,
          isActive
        });

        // 배경 그리기 완료 콜백 호출
        if (onBackgroundReady) {
          onBackgroundReady();
        }
      } catch (err) {
        console.error(`[${documentType}] ❌ 이미지 그리기 실패:`, err);
      }
    };

    // 이미지가 완전히 로드되었으면 즉시 그리기
    if (backgroundImage.complete && backgroundImage.naturalWidth > 0) {
      // requestAnimationFrame을 사용하여 렌더링 보장
      requestAnimationFrame(() => {
        drawBackground();
      });
    } else {
      // 아직 로드 중이면 로드 완료 대기
      console.log(`[${documentType}] 이미지 로드 대기 중...`);
      backgroundImage.onload = () => {
        requestAnimationFrame(drawBackground);
      };
      return () => {
        backgroundImage.onload = null;
      };
    }
  }, [backgroundImage, currentPage, documentType, isActive, onBackgroundReady]); // isActive 추가

  // 서명 패드 초기화
  useEffect(() => {
    if (isLoading || !canvasRef.current || !containerRef.current || !backgroundImage) {
      console.log('Canvas 초기화 대기 중...', {
        isLoading,
        hasCanvas: !!canvasRef.current,
        hasContainer: !!containerRef.current,
        hasBackgroundImage: !!backgroundImage
      });
      return;
    }

    // SignaturePad가 이미 존재하면 정리
    if (signaturePad) {
      console.log(`[${documentType}] 기존 SignaturePad 정리`);
      try {
        signaturePad.clear();
        signaturePad.off();
      } catch (e) {
        console.error('SignaturePad cleanup error:', e);
      }
    }

    // 배경이 그려질 때까지 대기한 후 SignaturePad 초기화
    const timer = setTimeout(() => {
      const canvas = canvasRef.current;
      const bgCanvas = backgroundCanvasRef.current;
      const container = containerRef.current;

      if (!canvas || !bgCanvas || !container) {
        console.log('Canvas 또는 Container가 없습니다');
        return;
      }

      console.log(`[${documentType}] SignaturePad 초기화 시작 (페이지 ${currentPage})`);

      // 배경 캔버스의 실제 표시 크기 가져오기
      const bgRect = bgCanvas.getBoundingClientRect();

      // 서명 캔버스의 내부 해상도를 고정 크기로 설정
      canvas.width = STANDARD_WIDTH;
      canvas.height = STANDARD_HEIGHT;

      console.log('서명 Canvas 크기:', {
        internalWidth: STANDARD_WIDTH,
        internalHeight: STANDARD_HEIGHT,
        bgCssWidth: bgRect.width,
        bgCssHeight: bgRect.height,
        scaleX: STANDARD_WIDTH / bgRect.width,
        scaleY: STANDARD_HEIGHT / bgRect.height
      });

      const pad = new SignaturePad(canvas, {
        backgroundColor: 'rgba(0, 0, 0, 0)', // 투명 배경
        penColor: 'rgb(0, 0, 0)', // 검은색 서명
        minWidth: 2,
        maxWidth: 4,
        throttle: 16, // 60fps로 제한
        velocityFilterWeight: 0.7
      });

      // 리사이즈 이벤트 핸들러 추가
      const handleResize = () => {
        if (!canvas || !bgCanvas || !pad) return;

        const newBgRect = bgCanvas.getBoundingClientRect();

        console.log(`[${documentType}] 리사이즈 감지:`, {
          oldWidth: bgRect.width,
          newWidth: newBgRect.width
        });

        // 서명 데이터 임시 저장
        const data = pad.toData();

        // 캔버스 내부 해상도 재설정 (필요시)
        if (canvas.width !== STANDARD_WIDTH || canvas.height !== STANDARD_HEIGHT) {
          canvas.width = STANDARD_WIDTH;
          canvas.height = STANDARD_HEIGHT;
        }

        // 서명 복원
        pad.clear();
        pad.fromData(data);
      };

      window.addEventListener('resize', handleResize);

      console.log(`[${documentType}] SignaturePad 생성 완료`);
      setSignaturePad(pad);

      // Cleanup 함수에서 리사이즈 리스너 제거
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }, 200); // 배경이 그려질 시간 확보

    return () => clearTimeout(timer);
  }, [isLoading, currentPage, backgroundImage, documentType]);

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

      // 페이지별 캔버스 생성 (모든 페이지 완전히 동일한 고정 크기)
      const pageCanvas = document.createElement('canvas');
      pageCanvas.width = STANDARD_WIDTH;
      pageCanvas.height = STANDARD_HEIGHT;

      const ctx = pageCanvas.getContext('2d');
      if (!ctx) {
        alert('Canvas 처리 중 오류가 발생했습니다.');
        setIsSaving(false);
        return;
      }

      // 1. 배경 이미지 그리기 (고정 크기에 맞춤)
      ctx.drawImage(img, 0, 0, STANDARD_WIDTH, STANDARD_HEIGHT);

      // 2. 해당 페이지에 서명이 있으면 위에 그리기
      const pageSignature = allSignatures.get(page);
      if (pageSignature && pageSignature.length > 0) {
        console.log(`[${documentType}] 페이지 ${page}의 서명 추가 (고정 크기: ${STANDARD_WIDTH}x${STANDARD_HEIGHT})`);

        // 서명은 이미 고정 표준 크기(1200x1697) 기준으로 저장되어 있음 - 스케일링 불필요!
        // 임시 캔버스에 서명 그리기 (고정 크기)
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = STANDARD_WIDTH;
        tempCanvas.height = STANDARD_HEIGHT;
        const tempPad = new SignaturePad(tempCanvas);

        try {
          // 서명 데이터를 그대로 사용 (이미 1200x1697 기준)
          tempPad.fromData(pageSignature);
          // 서명을 배경 위에 그림
          ctx.drawImage(tempCanvas, 0, 0);
          console.log(`[${documentType}] 페이지 ${page} 서명 렌더링 완료 (스트로크 수: ${pageSignature.length})`);
        } catch (e) {
          console.error(`[${documentType}] 페이지 ${page} 서명 렌더링 실패:`, e);
        }
      }

      // 3. 각 페이지를 JPEG로 변환 (품질 0.35 - 고정 해상도)
      const pageData = pageCanvas.toDataURL('image/jpeg', 0.35);
      pageDataMap[page] = pageData;
      console.log(`[${documentType}] 페이지 ${page} 저장 완료: ${STANDARD_WIDTH}x${STANDARD_HEIGHT} (${Math.round(pageData.length / 1024)}KB)`);
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

    // PDF 대신 빈 ArrayBuffer 전달 (사용하지 않음)
    const emptyBuffer = new ArrayBuffer(0);
    onSignatureComplete(signatureData, emptyBuffer);
    setIsSaving(false);
  };

  // 페이지 변경 시 서명 불러오기
  useEffect(() => {
    if (!signaturePad || !currentPage) return;

    console.log(`[${documentType}] 페이지 ${currentPage}로 전환 - 서명 로드 시도`);

    // 약간의 지연을 두어 state 업데이트가 완료되도록 함
    const timer = setTimeout(() => {
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
  }, [currentPage, signaturePad, documentType]);
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

      // 스크롤을 맨 위로 이동
      if (containerRef.current) {
        containerRef.current.scrollTop = 0;
        console.log(`[${documentType}] 스크롤을 맨 위로 이동`);
      }
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
        className="flex-1 bg-gray-100"
        style={{
          overflow: 'auto',
          WebkitOverflowScrolling: 'touch',
          position: 'relative'
        }}
      >
        {/* 캔버스 래퍼 - 두 캔버스를 정확히 같은 위치에 배치 */}
        <div style={{
          position: 'relative',
          display: 'inline-block',
          width: '100%',
          height: 'auto',
          minHeight: '100%'
        }}>
          {/* 배경 캔버스 (PDF 이미지) */}
          <canvas
            ref={backgroundCanvasRef}
            style={{
              display: 'block',
              width: '100%',
              height: 'auto',
              pointerEvents: 'none',
              imageRendering: 'auto'
            }}
          />
          {/* 서명 캔버스 (투명, 서명만) - 배경 위에 정확히 겹침 */}
          <canvas
            ref={canvasRef}
            className="cursor-crosshair"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              touchAction: 'none',
              pointerEvents: 'auto'
            }}
          />
        </div>
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
