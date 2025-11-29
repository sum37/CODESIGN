import { useEffect, useState, useRef } from 'react';
import { useProjectStore } from '../../stores/projectStore';
import { readFile } from '../../lib/fileSystem/fileSystem';
import { CanvasRenderer } from './CanvasRenderer';
import { useCanvasSync } from '../../hooks/useCanvasSync';
import './Canvas.css';

export function Canvas() {
  const { selectedFile } = useProjectStore();
  const [componentCode, setComponentCode] = useState<string>('');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const canvasContentRef = useRef<HTMLDivElement>(null);
  const canvasWrapperRef = useRef<HTMLDivElement>(null);
  const { syncCanvasToCode } = useCanvasSync();

  useEffect(() => {
    if (selectedFile && (selectedFile.endsWith('.tsx') || selectedFile.endsWith('.jsx'))) {
      loadComponent(selectedFile);
    } else {
      setComponentCode('');
    }
  }, [selectedFile]);

  // 코드 저장 이벤트 구독 (Ctrl+S로 저장 시)
  useEffect(() => {
    const handleCodeSaved = (event: CustomEvent<string>) => {
      if (selectedFile && (selectedFile.endsWith('.tsx') || selectedFile.endsWith('.jsx'))) {
        setComponentCode(event.detail);
      }
    };

    window.addEventListener('code-saved' as any, handleCodeSaved as EventListener);
    return () => {
      window.removeEventListener('code-saved' as any, handleCodeSaved as EventListener);
    };
  }, [selectedFile]);

  const loadComponent = async (filePath: string) => {
    try {
      console.log('컴포넌트 로드 시도:', filePath);
      const content = await readFile(filePath);
      console.log('컴포넌트 로드 성공:', filePath);
      setComponentCode(content);
    } catch (error) {
      console.error('컴포넌트 로드 실패:', filePath, error);
      setComponentCode('');
    }
  };

  const handleCanvasChange = (updatedCode: string) => {
    setComponentCode(updatedCode);
    syncCanvasToCode(updatedCode);
  };

  // 줌 인/아웃 처리
  useEffect(() => {
    const canvasWrapper = canvasWrapperRef.current;
    if (!canvasWrapper) return;

    const handleWheel = (e: WheelEvent) => {
      // Ctrl/Cmd + 휠로 줌
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        setZoomLevel((prev) => {
          const newZoom = Math.max(0.25, Math.min(3, prev + delta));
          return Math.round(newZoom * 100) / 100; // 소수점 2자리로 반올림
        });
      }
    };

    // 터치 제스처 처리 (핀치 줌)
    let initialDistance = 0;
    let initialZoom = 1;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        initialDistance = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY
        );
        initialZoom = zoomLevel;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const currentDistance = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY
        );
        
        const scale = currentDistance / initialDistance;
        const newZoom = Math.max(0.25, Math.min(3, initialZoom * scale));
        setZoomLevel(Math.round(newZoom * 100) / 100);
      }
    };

    canvasWrapper.addEventListener('wheel', handleWheel, { passive: false });
    canvasWrapper.addEventListener('touchstart', handleTouchStart);
    canvasWrapper.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      canvasWrapper.removeEventListener('wheel', handleWheel);
      canvasWrapper.removeEventListener('touchstart', handleTouchStart);
      canvasWrapper.removeEventListener('touchmove', handleTouchMove);
    };
  }, [zoomLevel]);

  // 줌 리셋 함수
  const handleZoomReset = () => {
    setZoomLevel(1);
  };

  return (
    <div className="canvas-container">
      <div className="canvas-header">
        <h3>Canvas Preview</h3>
        <div className="canvas-header-controls">
          {selectedFile && (
            <span className="canvas-file-name">{selectedFile.split('/').pop()}</span>
          )}
          <div className="canvas-zoom-controls">
            <button 
              className="canvas-zoom-button"
              onClick={() => setZoomLevel((prev) => Math.max(0.25, prev - 0.1))}
              title="줌 아웃 (Ctrl/Cmd + 휠)"
            >
              −
            </button>
            <span className="canvas-zoom-level">{Math.round(zoomLevel * 100)}%</span>
            <button 
              className="canvas-zoom-button"
              onClick={() => setZoomLevel((prev) => Math.min(3, prev + 0.1))}
              title="줌 인 (Ctrl/Cmd + 휠)"
            >
              +
            </button>
            <button 
              className="canvas-zoom-reset"
              onClick={handleZoomReset}
              title="줌 리셋"
            >
              Reset
            </button>
          </div>
        </div>
      </div>
      <div 
        className="canvas-content-wrapper"
        ref={canvasWrapperRef}
      >
        <div 
          className="canvas-content"
          ref={canvasContentRef}
          style={{
            transform: `scale(${zoomLevel})`,
            transformOrigin: 'top left',
            position: 'relative',
          }}
        >
          {componentCode ? (
            <CanvasRenderer 
              code={componentCode} 
              onCodeChange={handleCanvasChange}
              zoomLevel={zoomLevel}
            />
          ) : (
            <div className="canvas-empty">
              <p>React 컴포넌트 파일(.tsx, .jsx)을 선택하면 여기에 렌더링됩니다.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
