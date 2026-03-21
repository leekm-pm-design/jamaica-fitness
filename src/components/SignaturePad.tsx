// src/components/SignaturePad.tsx
'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import SignaturePadLib from 'signature_pad';

interface Props {
  onSignatureChange: (data: string | null) => void;
}

export default function SignaturePad({ onSignatureChange }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const padRef = useRef<SignaturePadLib | null>(null);
  const [isEmpty, setIsEmpty] = useState(true);
  const [signatureData, setSignatureData] = useState<string | null>(null);

  const initializeCanvas = useCallback(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const ratio = Math.max(window.devicePixelRatio || 1, 1);

    canvas.width = rect.width * ratio;
    canvas.height = rect.height * ratio;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(ratio, ratio);
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';

    if (padRef.current) {
      padRef.current.clear();
    }

    padRef.current = new SignaturePadLib(canvas, {
      backgroundColor: 'rgb(255, 255, 255)',
      penColor: 'rgb(0, 0, 0)',
      minWidth: 1,
      maxWidth: 3,
    });

    // 기존 서명 데이터가 있으면 복원
    if (signatureData) {
      padRef.current.fromDataURL(signatureData);
      setIsEmpty(false);
    }

    padRef.current.addEventListener('endStroke', () => {
      const data = padRef.current!.toDataURL('image/png');
      setSignatureData(data);
      setIsEmpty(false);
      onSignatureChange(data);
    });
  }, [signatureData, onSignatureChange]);

  useEffect(() => {
    initializeCanvas();

    // 리사이즈 이벤트 핸들러 - 서명 데이터 보존
    const handleResize = () => {
      if (canvasRef.current && padRef.current) {
        // 현재 서명 데이터 저장
        if (!padRef.current.isEmpty()) {
          const currentData = padRef.current.toDataURL('image/png');
          setSignatureData(currentData);
        }
        // 캔버스 재초기화
        setTimeout(() => {
          initializeCanvas();
        }, 100);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (padRef.current) {
        padRef.current.off();
      }
    };
  }, [signatureData, onSignatureChange, initializeCanvas]);

  const handleClear = () => {
    if (padRef.current) {
      padRef.current.clear();
    }
    setSignatureData(null);
    setIsEmpty(true);
    onSignatureChange(null);
  };

  return (
    <div className="w-full">
      <div className="border-2 border-gray-300 rounded-lg bg-white">
        <canvas
          ref={canvasRef}
          className="w-full h-[200px] touch-none cursor-crosshair"
        />
      </div>
      <div className="flex gap-2 mt-4">
        <button
          onClick={handleClear}
          className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          type="button"
        >
          지우기
        </button>
        {!isEmpty && (
          <span className="px-4 py-2 text-sm text-green-600 bg-green-50 rounded-lg">
            서명이 입력되었습니다
          </span>
        )}
      </div>
    </div>
  );
}