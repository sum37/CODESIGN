import { useEffect, useState, useRef, useCallback } from 'react';
import { useProjectStore } from '../../stores/projectStore';
import { useCanvasStore } from '../../stores/canvasStore';
import { readFile, writeFile } from '../../lib/fileSystem/fileSystem';
import { CanvasRenderer } from './CanvasRenderer';
import { useCanvasSync } from '../../hooks/useCanvasSync';
import { Toolbar } from './components/Toolbar';
import { createDefaultShape, Shape } from '../../lib/shapes/shapeGenerator';
import { addShapeToCode, removeElementFromCode } from '../../lib/ast/codeModifier';
import './Canvas.css';

export function Canvas() {
  const { selectedFile } = useProjectStore();
  const { addShapeToFile, clearShapesForFile, getShapesForFile, selectedElementId, setSelectedElementId, removeShapeFromFile } = useCanvasStore();
  const [componentCode, setComponentCode] = useState<string>('');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const canvasContentRef = useRef<HTMLDivElement>(null);
  const canvasWrapperRef = useRef<HTMLDivElement>(null);
  const { syncCanvasToCode } = useCanvasSync();
  const [pendingShapeType, setPendingShapeType] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState({ x: 0, y: 0 });
  const [drawPreview, setDrawPreview] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const canvasOverlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedFile && (selectedFile.endsWith('.tsx') || selectedFile.endsWith('.jsx'))) {
      loadComponent(selectedFile);
    } else {
      setComponentCode('');
    }
    // 파일 변경 시 pending 상태 초기화
    setPendingShapeType(null);
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

  // Delete 키 이벤트 처리 (도형 삭제)
  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      // Delete 또는 Backspace 키이고, 입력 필드에 포커스가 없는 경우에만 처리
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedElementId) {
        const target = e.target as HTMLElement;
        // 입력 필드(input, textarea, contenteditable)에 포커스가 있으면 무시
        if (
          target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable
        ) {
          return;
        }

        // 도형인지 확인 (id가 'shape-'로 시작)
        if (selectedElementId.startsWith('shape-')) {
          e.preventDefault();
          e.stopPropagation();

          console.log('도형 삭제 시도:', selectedElementId);

          if (!selectedFile || (!selectedFile.endsWith('.tsx') && !selectedFile.endsWith('.jsx'))) {
            console.warn('React 파일이 선택되지 않았습니다.');
            return;
          }

          try {
            // 스토어에서 도형 제거
            removeShapeFromFile(selectedFile, selectedElementId);
            console.log('스토어에서 도형 제거 완료');

            // 코드에서 요소 제거
            const currentCode = await readFile(selectedFile);
            console.log('현재 코드 읽기 완료, 길이:', currentCode.length);

            const updatedCode = removeElementFromCode(currentCode, selectedElementId);
            console.log('코드 업데이트 완료, 새 길이:', updatedCode.length);

            if (updatedCode === currentCode) {
              console.warn('코드가 업데이트되지 않았습니다!');
            }

            await writeFile(selectedFile, updatedCode);
            console.log('파일 저장 완료:', selectedFile);

            setComponentCode(updatedCode);

            // 선택 해제
            setSelectedElementId(null);

            window.dispatchEvent(new CustomEvent('code-updated', { detail: updatedCode }));
            window.dispatchEvent(new CustomEvent('code-saved', { detail: updatedCode }));

            console.log('도형 삭제 완료:', selectedElementId);
          } catch (error) {
            console.error('도형 삭제 실패:', error);
            alert(`도형 삭제 실패: ${error instanceof Error ? error.message : String(error)}`);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedElementId, selectedFile, removeShapeFromFile, setSelectedElementId, setComponentCode]);

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

  // 드래그 완료 처리 함수 (공통 로직)
  const finishDrawing = useCallback(async (endX: number, endY: number) => {
    console.log('=== finishDrawing 호출 ===', { 
      hasRef: !!canvasContentRef.current, 
      isDrawing, 
      pendingShapeType, 
      selectedFile,
      endX,
      endY 
    });
    
    if (!canvasContentRef.current || !isDrawing || !pendingShapeType || !selectedFile) {
      console.warn('finishDrawing 조건 불만족:', { 
        hasRef: !!canvasContentRef.current, 
        isDrawing, 
        pendingShapeType, 
        selectedFile 
      });
      return;
    }

    const x = Math.min(drawStart.x, endX);
    const y = Math.min(drawStart.y, endY);
    const width = Math.abs(endX - drawStart.x);
    const height = Math.abs(endY - drawStart.y);
    
    console.log('드래그 완료:', { x, y, width, height, selectedFile, isDrawing, pendingShapeType });
    
    // 즉시 상태 초기화 (중복 실행 방지)
    setIsDrawing(false);
    setDrawPreview(null);
    const shapeTypeToCreate = pendingShapeType;
    setPendingShapeType(null);
    
    // 최소 크기 체크
    if (width >= 10 && height >= 10) {
      try {
        const finalWidth = Math.max(20, width);
        const finalHeight = Math.max(20, height);
        
        console.log('도형 생성 시작:', { shapeType: shapeTypeToCreate, x, y, finalWidth, finalHeight });
        
        // 도형 생성
        const newShape = createDefaultShape(
          shapeTypeToCreate as any,
          Math.max(0, x),
          Math.max(0, y),
          finalWidth,
          finalHeight
        );

        console.log('생성된 도형:', newShape);

        // 스토어에 도형 추가
        addShapeToFile(selectedFile, newShape);
        console.log('스토어에 도형 추가 완료');

        // 코드에 도형 추가 (AST 직접 생성 방식)
        console.log('파일 읽기 시작:', selectedFile);
        const currentCode = await readFile(selectedFile);
        console.log('현재 코드 읽기 완료, 길이:', currentCode.length);
        console.log('코드 처음 200자:', currentCode.substring(0, 200));
        
        console.log('addShapeToCode 호출 시작');
        const updatedCode = addShapeToCode(currentCode, newShape);
        console.log('addShapeToCode 호출 완료');
        console.log('코드 업데이트 완료, 새 길이:', updatedCode.length);
        
        if (updatedCode === currentCode) {
          console.warn('코드가 업데이트되지 않았습니다!');
        }
        
        // 파일에 자동 저장
        await writeFile(selectedFile, updatedCode);
        console.log('파일 저장 완료:', selectedFile);
        
        // 코드 상태 업데이트
        setComponentCode(updatedCode);
        
        // Monaco Editor에 변경사항 알림 (자동저장)
        window.dispatchEvent(new CustomEvent('code-updated', { detail: updatedCode }));
        window.dispatchEvent(new CustomEvent('code-saved', { detail: updatedCode }));
        
        console.log('도형 추가 및 자동저장 완료:', shapeTypeToCreate);
      } catch (error) {
        console.error('도형 추가 실패:', error);
        alert(`도형 추가 실패: ${error instanceof Error ? error.message : String(error)}`);
      }
    } else {
      console.log('최소 크기 미달:', { width, height });
    }
  }, [isDrawing, pendingShapeType, drawStart, selectedFile, addShapeToFile, setComponentCode]);

  // 전역 마우스 이벤트 리스너 (드래그 중일 때)
  useEffect(() => {
    if (!isDrawing || !pendingShapeType) return;

    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!canvasContentRef.current || !isDrawing) return;
      
      const rect = canvasContentRef.current.getBoundingClientRect();
      const currentX = (e.clientX - rect.left) / zoomLevel;
      const currentY = (e.clientY - rect.top) / zoomLevel;
      
      const x = Math.min(drawStart.x, currentX);
      const y = Math.min(drawStart.y, currentY);
      const width = Math.abs(currentX - drawStart.x);
      const height = Math.abs(currentY - drawStart.y);
      
      setDrawPreview({ x, y, width, height });
    };

    const handleGlobalMouseUp = async (e: MouseEvent) => {
      if (!canvasContentRef.current || !isDrawing || !pendingShapeType) {
        return;
      }

      const rect = canvasContentRef.current.getBoundingClientRect();
      const endX = (e.clientX - rect.left) / zoomLevel;
      const endY = (e.clientY - rect.top) / zoomLevel;
      
      await finishDrawing(endX, endY);
    };

    document.addEventListener('mousemove', handleGlobalMouseMove, { passive: false });
    document.addEventListener('mouseup', handleGlobalMouseUp, { passive: false });

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDrawing, pendingShapeType, drawStart, zoomLevel, finishDrawing]);
  
  // 텍스트 추가 핸들러
  const handleAddText = () => {
    // TODO: 텍스트 추가 로직 구현
    console.log('텍스트 추가');
  };
  
  // 도형 선택 핸들러 - 도형 타입만 설정하고 실제 생성은 드래그로 수행
  const handleShapeSelect = (shapeType: string) => {
    if (!selectedFile || (!selectedFile.endsWith('.tsx') && !selectedFile.endsWith('.jsx'))) {
      console.warn('React 파일이 선택되지 않았습니다.');
      return;
    }
    setPendingShapeType(shapeType);
    setIsDrawing(false);
    setDrawPreview(null);
  };

  // 캔버스 마우스 다운 핸들러
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!pendingShapeType || !canvasContentRef.current) {
      console.log('도형 추가 모드가 아닙니다:', { pendingShapeType, hasRef: !!canvasContentRef.current });
      return;
    }
    
    const rect = canvasContentRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoomLevel;
    const y = (e.clientY - rect.top) / zoomLevel;
    
    console.log('드래그 시작:', { x, y, shapeType: pendingShapeType });
    
    setIsDrawing(true);
    setDrawStart({ x, y });
    setDrawPreview({ x, y, width: 0, height: 0 });
  };

  // 캔버스 마우스 무브 핸들러
  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing || !pendingShapeType || !canvasContentRef.current) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const rect = canvasContentRef.current.getBoundingClientRect();
    const currentX = (e.clientX - rect.left) / zoomLevel;
    const currentY = (e.clientY - rect.top) / zoomLevel;
    
    const x = Math.min(drawStart.x, currentX);
    const y = Math.min(drawStart.y, currentY);
    const width = Math.abs(currentX - drawStart.x);
    const height = Math.abs(currentY - drawStart.y);
    
    setDrawPreview({ x, y, width, height });
  };

  // 캔버스 마우스 업 핸들러
  const handleCanvasMouseUp = useCallback(async (e: React.MouseEvent) => {
    if (!isDrawing || !pendingShapeType || !canvasContentRef.current) {
      return;
    }

    e.preventDefault();
    e.stopPropagation();

    const rect = canvasContentRef.current.getBoundingClientRect();
    const endX = (e.clientX - rect.left) / zoomLevel;
    const endY = (e.clientY - rect.top) / zoomLevel;
    
    await finishDrawing(endX, endY);
  }, [isDrawing, pendingShapeType, zoomLevel, finishDrawing]);
  
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
      />
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
            <>
              <CanvasRenderer 
                code={componentCode} 
                onCodeChange={handleCanvasChange}
                zoomLevel={zoomLevel}
              />
              {/* 도형 드래그 오버레이 */}
              <div
                ref={canvasOverlayRef}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  pointerEvents: pendingShapeType ? 'auto' : 'none',
                  cursor: pendingShapeType ? 'crosshair' : 'default',
                  zIndex: 2000,
                }}
                onMouseDown={handleCanvasMouseDown}
                onMouseMove={handleCanvasMouseMove}
                onMouseUp={handleCanvasMouseUp}
                onMouseLeave={(e) => {
                  if (isDrawing) {
                    handleCanvasMouseUp(e);
                  }
                }}
              >
                {/* 드래그 미리보기 */}
                {drawPreview && pendingShapeType && (
                  <div
                    style={{
                      position: 'absolute',
                      left: `${drawPreview.x}px`,
                      top: `${drawPreview.y}px`,
                      width: `${drawPreview.width}px`,
                      height: `${drawPreview.height}px`,
                      border: '2px dashed #9ca3af',
                      backgroundColor: 'rgba(156, 163, 175, 0.1)',
                      pointerEvents: 'none',
                    }}
                  />
                )}
              </div>
            </>
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
