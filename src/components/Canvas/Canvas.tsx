import { useEffect, useState, useRef } from 'react';
import { useProjectStore } from '../../stores/projectStore';
import { readFile } from '../../lib/fileSystem/fileSystem';
import { CanvasRenderer } from './CanvasRenderer';
import { useCanvasSync } from '../../hooks/useCanvasSync';
import { Toolbar } from './components/Toolbar';
import { useCanvasStore, DrawingModeType } from '../../stores/canvasStore';
import { updateElementInCode } from '../../lib/ast/codeModifier';
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
  
  // 텍스트 박스 추가 핸들러 - 그리기 모드 활성화
  const handleAddText = () => {
    console.log('텍스트 박스 그리기 모드 활성화');
    setDrawingMode('textbox');
  };
  
  // 도형 그리기 모드 상태
  const { drawingMode, setDrawingMode, selectedElementId, selectedElementLoc } = useCanvasStore();
  
  // 도형 선택 핸들러 - 그리기 모드 활성화
  const handleShapeSelect = (shapeType: string) => {
    console.log('도형 선택, 그리기 모드 활성화:', shapeType);
    setDrawingMode(shapeType as DrawingModeType);
  };
  
  // 이미지 선택 핸들러
  const handleImageSelect = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const imageUrl = event.target?.result as string;
      // TODO: 이미지 추가 로직 구현
      console.log('이미지 추가:', imageUrl);
    };
    reader.readAsDataURL(file);
  };

  // fontWeight 변경 핸들러
  const handleFontWeightChange = (fontWeight: 'normal' | 'bold') => {
    console.log('[Canvas] fontWeight 변경:', fontWeight, '선택된 요소:', selectedElementId);
    
    if (!selectedElementId || !selectedElementLoc || !componentCode) {
      console.warn('[Canvas] 선택된 요소 또는 loc 정보가 없음');
      return;
    }
    
    // 코드에서 해당 요소의 fontWeight 스타일 업데이트
    const updatedCode = updateElementInCode(
      componentCode,
      selectedElementId,
      { style: { fontWeight } },
      selectedElementLoc
    );
    
    if (updatedCode !== componentCode) {
      setComponentCode(updatedCode);
      syncCanvasToCode(updatedCode);
      window.dispatchEvent(new CustomEvent('code-updated', { detail: updatedCode }));
      console.log('[Canvas] fontWeight 변경 완료');
    }
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
      
      {/* 툴바 */}
      <Toolbar
        onAddText={handleAddText}
        onShapeSelect={handleShapeSelect}
        onImageSelect={handleImageSelect}
        onFontWeightChange={handleFontWeightChange}
      />
      <div 
        className="canvas-content-wrapper"
        ref={canvasWrapperRef}
      >
        <div 
          className={`canvas-content ${drawingMode ? 'drawing-mode' : ''}`}
          ref={canvasContentRef}
          style={{
            transform: `scale(${zoomLevel})`,
            transformOrigin: 'top left',
            position: 'relative',
            cursor: drawingMode ? 'crosshair' : 'default',
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
