import { useEffect, useState, useRef, useCallback } from 'react';
import { useProjectStore } from '../../stores/projectStore';
import { readFile } from '../../lib/fileSystem/fileSystem';
import { CanvasRenderer } from './CanvasRenderer';
import { useCanvasSync } from '../../hooks/useCanvasSync';
import { Toolbar } from './components/Toolbar';
import { useCanvasStore, DrawingModeType } from '../../stores/canvasStore';
import { updateElementInCode, updateSvgFillColor, updateSvgStroke } from '../../lib/ast/codeModifier';
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
      console.log('Loading component:', filePath);
      const content = await readFile(filePath);
      console.log('Component loaded successfully:', filePath);
      setComponentCode(content);
    } catch (error) {
      console.error('Failed to load component:', filePath, error);
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
  
  // Text box addition handler - activate drawing mode
  const handleAddText = () => {
    console.log('Text box drawing mode activated');
    setDrawingMode('textbox');
  };
  
  // Shape drawing mode state
  const { drawingMode, setDrawingMode, selectedElementId, selectedElementLoc } = useCanvasStore();
  
  // Shape selection handler - activate drawing mode
  const handleShapeSelect = (shapeType: string) => {
    console.log('Shape selected, drawing mode activated:', shapeType);
    setDrawingMode(shapeType as DrawingModeType);
  };
  
  // fontSize 변경 핸들러
  const handleFontSizeChange = (fontSize: number) => {
    console.log('[Canvas] fontSize changed:', fontSize, 'selected element:', selectedElementId);
    
    if (!selectedElementId || !selectedElementLoc || !componentCode) {
      console.warn('[Canvas] No selected element or loc information');
      return;
    }
    
    // Update fontSize style of the element in code
    const updatedCode = updateElementInCode(
      componentCode,
      selectedElementId,
      { style: { fontSize: `${fontSize}px` } },
      selectedElementLoc
    );
    
    if (updatedCode !== componentCode) {
      setComponentCode(updatedCode);
      syncCanvasToCode(updatedCode);
      window.dispatchEvent(new CustomEvent('code-updated', { detail: updatedCode }));
      console.log('[Canvas] fontSize change completed');
    }
  };

  // fontFamily 변경 핸들러
  const handleFontFamilyChange = (fontFamily: string) => {
    console.log('[Canvas] fontFamily changed:', fontFamily, 'selected element:', selectedElementId);
    
    if (!selectedElementId || !selectedElementLoc || !componentCode) {
      console.warn('[Canvas] No selected element or loc information');
      return;
    }
    
    // Update fontFamily style of the element in code
    const updatedCode = updateElementInCode(
      componentCode,
      selectedElementId,
      { style: { fontFamily } },
      selectedElementLoc
    );
    
    if (updatedCode !== componentCode) {
      setComponentCode(updatedCode);
      syncCanvasToCode(updatedCode);
      window.dispatchEvent(new CustomEvent('code-updated', { detail: updatedCode }));
      console.log('[Canvas] fontFamily change completed');
    }
  };

  // fontWeight 변경 핸들러
  const handleFontWeightChange = (fontWeight: 'normal' | 'bold') => {
    console.log('[Canvas] fontWeight changed:', fontWeight, 'selected element:', selectedElementId);
    
    if (!selectedElementId || !selectedElementLoc || !componentCode) {
      console.warn('[Canvas] No selected element or loc information');
      return;
    }
    
    // Update fontWeight style of the element in code
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
      console.log('[Canvas] fontWeight change completed');
    }
  };

  // fontStyle 변경 핸들러
  const handleFontStyleChange = (fontStyle: 'normal' | 'italic') => {
    console.log('[Canvas] fontStyle changed:', fontStyle, 'selected element:', selectedElementId);
    
    if (!selectedElementId || !selectedElementLoc || !componentCode) {
      console.warn('[Canvas] No selected element or loc information');
      return;
    }
    
    // Update fontStyle style of the element in code
    const updatedCode = updateElementInCode(
      componentCode,
      selectedElementId,
      { style: { fontStyle } },
      selectedElementLoc
    );
    
    if (updatedCode !== componentCode) {
      setComponentCode(updatedCode);
      syncCanvasToCode(updatedCode);
      window.dispatchEvent(new CustomEvent('code-updated', { detail: updatedCode }));
      console.log('[Canvas] fontStyle change completed');
    }
  };

  // textColor 변경 핸들러
  const handleTextColorChange = (color: string) => {
    console.log('[Canvas] textColor changed:', color, 'selected element:', selectedElementId);
    
    if (!selectedElementId || !selectedElementLoc || !componentCode) {
      console.warn('[Canvas] No selected element or loc information');
      return;
    }
    
    // Update color style of the element in code
    const updatedCode = updateElementInCode(
      componentCode,
      selectedElementId,
      { style: { color } },
      selectedElementLoc
    );
    
    if (updatedCode !== componentCode) {
      setComponentCode(updatedCode);
      syncCanvasToCode(updatedCode);
      window.dispatchEvent(new CustomEvent('code-updated', { detail: updatedCode }));
      console.log('[Canvas] textColor change completed');
    }
  };

  // textAlign 변경 핸들러
  const handleTextAlignChange = (textAlign: 'left' | 'center' | 'right') => {
    console.log('[Canvas] textAlign changed:', textAlign, 'selected element:', selectedElementId);
    
    if (!selectedElementId || !selectedElementLoc || !componentCode) {
      console.warn('[Canvas] No selected element or loc information');
      return;
    }
    
    // Update textAlign style of the element in code
    const updatedCode = updateElementInCode(
      componentCode,
      selectedElementId,
      { style: { textAlign } },
      selectedElementLoc
    );
    
    if (updatedCode !== componentCode) {
      setComponentCode(updatedCode);
      syncCanvasToCode(updatedCode);
      window.dispatchEvent(new CustomEvent('code-updated', { detail: updatedCode }));
      console.log('[Canvas] textAlign change completed');
    }
  };

  // shapeColor 변경 핸들러 (도형 배경색)
  const handleShapeColorChange = (color: string) => {
    console.log('[Canvas] shapeColor changed:', color, 'selected element:', selectedElementId);
    
    if (!selectedElementId || !selectedElementLoc || !componentCode) {
      console.warn('[Canvas] No selected element or loc information');
      return;
    }
    
    // Check if selected element is SVG (check tag at that location in code)
    const lines = componentCode.split('\n');
    const targetLine = selectedElementLoc.start.line - 1;
    const column = selectedElementLoc.start.column;
    
    let isSvgShape = false;
    if (targetLine >= 0 && targetLine < lines.length) {
      const lineContent = lines[targetLine].substring(column);
      isSvgShape = lineContent.trimStart().startsWith('<svg');
    }
    
    let updatedCode: string;
    
    if (isSvgShape) {
      // SVG shape: change fill attribute
      console.log('[Canvas] SVG shape color changed');
      updatedCode = updateSvgFillColor(componentCode, selectedElementLoc, color);
    } else {
      // div shape: change backgroundColor style
      console.log('[Canvas] div shape color changed');
      updatedCode = updateElementInCode(
        componentCode,
        selectedElementId,
        { style: { backgroundColor: color } },
        selectedElementLoc
      );
    }
    
    if (updatedCode !== componentCode) {
      setComponentCode(updatedCode);
      syncCanvasToCode(updatedCode);
      window.dispatchEvent(new CustomEvent('code-updated', { detail: updatedCode }));
      console.log('[Canvas] shapeColor change completed');
    }
  };

  // borderRadius 변경 핸들러 (둥근 사각형)
  const handleBorderRadiusChange = (radius: number) => {
    console.log('[Canvas] borderRadius changed:', { radius }, 'selected element:', selectedElementId);
    
    if (!selectedElementId || !selectedElementLoc || !componentCode) {
      console.warn('[Canvas] No selected element or loc information');
      return;
    }
    
    const updatedCode = updateElementInCode(
      componentCode,
      selectedElementId,
      { style: { borderRadius: `${radius}px` } },
      selectedElementLoc
    );
    
    if (updatedCode !== componentCode) {
      console.log('[Canvas] borderRadius change code updated');
      setComponentCode(updatedCode);
      handleCanvasChange(updatedCode);
    }
  };

  // Effects 변경 핸들러
  const handleEffectsChange = useCallback((
    shadowType: 'none' | 'outer' | 'inner',
    shadowColor: string,
    shadowBlur: number,
    shadowOffsetX: number,
    shadowOffsetY: number,
    opacity: number
  ) => {
    console.log('[Canvas] Effects changed:', { shadowType, shadowColor, shadowBlur, shadowOffsetX, shadowOffsetY, opacity });
    
    if (!selectedElementId || !selectedElementLoc || !componentCode) {
      console.warn('[Canvas] No selected element or loc information');
      return;
    }
    
    // Create shadow style
    const styleUpdates: Record<string, string> = {};
    
    if (shadowType === 'outer') {
      // Outer shadow: positive offset (bottom, right)
      const finalOffsetX = shadowOffsetX < 0 ? 0 : shadowOffsetX;
      const finalOffsetY = shadowOffsetY < 0 ? 0 : shadowOffsetY;
      styleUpdates.boxShadow = `${finalOffsetX}px ${finalOffsetY}px ${shadowBlur}px ${shadowColor}`;
    } else if (shadowType === 'inner') {
      // Inner shadow: positive offset (bottom, right)
      const finalOffsetX = shadowOffsetX < 0 ? 0 : shadowOffsetX;
      const finalOffsetY = shadowOffsetY < 0 ? 0 : shadowOffsetY;
      styleUpdates.boxShadow = `inset ${finalOffsetX}px ${finalOffsetY}px ${shadowBlur}px ${shadowColor}`;
    } else if (shadowType === 'none') {
      // Set boxShadow to 'none' only when 'none'
      styleUpdates.boxShadow = 'none';
    }
    
    // Apply opacity (convert 0-100 to 0-1)
    const opacityValue = opacity / 100;
    styleUpdates.opacity = opacityValue.toString();
    
    // Update style of the element in code
    const updatedCode = updateElementInCode(
      componentCode,
      selectedElementId,
      { 
        style: styleUpdates
      },
      selectedElementLoc
    );
    
    if (updatedCode !== componentCode) {
      setComponentCode(updatedCode);
      syncCanvasToCode(updatedCode);
      window.dispatchEvent(new CustomEvent('code-updated', { detail: updatedCode }));
      console.log('[Canvas] Effects change completed');
    }
  }, [selectedElementId, selectedElementLoc, componentCode, syncCanvasToCode]);

  // stroke 변경 핸들러 (도형 테두리)
  const handleStrokeChange = (strokeColor: string, strokeWidth: number) => {
    console.log('[Canvas] stroke changed:', { strokeColor, strokeWidth }, 'selected element:', selectedElementId);
    
    if (!selectedElementId || !selectedElementLoc || !componentCode) {
      console.warn('[Canvas] No selected element or loc information');
      return;
    }
    
    // Check if selected element is SVG (check tag at that location in code)
    const lines = componentCode.split('\n');
    const targetLine = selectedElementLoc.start.line - 1;
    const column = selectedElementLoc.start.column;
    
    let isSvgShape = false;
    if (targetLine >= 0 && targetLine < lines.length) {
      const lineContent = lines[targetLine].substring(column);
      isSvgShape = lineContent.trimStart().startsWith('<svg');
    }
    
    let updatedCode: string;
    
    if (isSvgShape) {
      // SVG shape: change stroke and stroke-width attributes
      console.log('[Canvas] SVG shape stroke changed');
      updatedCode = updateSvgStroke(componentCode, selectedElementLoc, strokeColor, strokeWidth);
    } else {
      // div shape: change border style
      console.log('[Canvas] div shape stroke changed');
      const borderStyle = strokeWidth > 0 ? `${strokeWidth}px solid ${strokeColor}` : 'none';
      updatedCode = updateElementInCode(
        componentCode,
        selectedElementId,
        { style: { border: borderStyle } },
        selectedElementLoc
      );
    }
    
    if (updatedCode !== componentCode) {
      setComponentCode(updatedCode);
      syncCanvasToCode(updatedCode);
      window.dispatchEvent(new CustomEvent('code-updated', { detail: updatedCode }));
      console.log('[Canvas] stroke change completed');
    }
  };

  return (
    <div className="canvas-container">
      <div className="canvas-header">
        <h3>Canvas Preview</h3>
        <div className="canvas-header-controls">
          <div className="canvas-zoom-controls">
            <button 
              className="canvas-zoom-button"
              onClick={() => setZoomLevel((prev) => Math.max(0.25, prev - 0.1))}
              title="Zoom Out (Ctrl/Cmd + Wheel)"
            >
              −
            </button>
            <span className="canvas-zoom-level">{Math.round(zoomLevel * 100)}%</span>
            <button 
              className="canvas-zoom-button"
              onClick={() => setZoomLevel((prev) => Math.min(3, prev + 0.1))}
              title="Zoom In (Ctrl/Cmd + Wheel)"
            >
              +
            </button>
            <button 
              className="canvas-zoom-reset"
              onClick={handleZoomReset}
              title="Reset Zoom"
            >
              Reset
            </button>
          </div>
        </div>
      </div>
      
      {/* 툴바 - 스크롤 가능한 wrapper로 감싸기 */}
      <div className="canvas-toolbar-wrapper">
        <Toolbar
          onAddText={handleAddText}
          onShapeSelect={handleShapeSelect}
          onFontSizeChange={handleFontSizeChange}
          onFontFamilyChange={handleFontFamilyChange}
          onFontWeightChange={handleFontWeightChange}
          onFontStyleChange={handleFontStyleChange}
          onTextColorChange={handleTextColorChange}
          onTextAlignChange={handleTextAlignChange}
          onShapeColorChange={handleShapeColorChange}
          onStrokeChange={handleStrokeChange}
          onBorderRadiusChange={handleBorderRadiusChange}
          onEffectsChange={handleEffectsChange}
        />
      </div>
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
              <p>Select a React component file (.tsx, .jsx) to render it here.</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
