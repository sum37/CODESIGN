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
  
  // 툴바 상태
  const [showShapeMenu, setShowShapeMenu] = useState(false);
  const [pendingText, setPendingText] = useState(false);
  const [pendingShapeType, setPendingShapeType] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  
  // 텍스트 편집 상태
  const [showTextColorMenu, setShowTextColorMenu] = useState(false);
  const [textColor, setTextColor] = useState('#000000');
  const [fontSize, setFontSize] = useState(16);
  const [fontWeight, setFontWeight] = useState<'normal' | 'bold'>('normal');
  const [fontStyle, setFontStyle] = useState<'normal' | 'italic'>('normal');
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right'>('left');
  const textColorMenuRef = useRef<HTMLDivElement>(null);
  
  // 도형 편집 상태
  const [showShapeColorMenu, setShowShapeColorMenu] = useState(false);
  const [showEffectsMenu, setShowEffectsMenu] = useState(false);
  const [showStrokeMenu, setShowStrokeMenu] = useState(false);
  const [showBringForwardMenu, setShowBringForwardMenu] = useState(false);
  const [showSendBackwardMenu, setShowSendBackwardMenu] = useState(false);
  const [shapeColor, setShapeColor] = useState('#f9a8d4');
  const [shapeBorderRadius, setShapeBorderRadius] = useState(0);
  const [borderRadiusInputValue, setBorderRadiusInputValue] = useState('0');
  const shapeColorMenuRef = useRef<HTMLDivElement>(null);
  const effectsMenuRef = useRef<HTMLDivElement>(null);
  const strokeMenuRef = useRef<HTMLDivElement>(null);
  const bringForwardMenuRef = useRef<HTMLDivElement>(null);
  const sendBackwardMenuRef = useRef<HTMLDivElement>(null);
  const borderRadiusInputRef = useRef<HTMLInputElement>(null);
  
  // 외부 클릭 시 메뉴 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowShapeMenu(false);
      }
      if (textColorMenuRef.current && !textColorMenuRef.current.contains(event.target as Node)) {
        setShowTextColorMenu(false);
      }
      if (shapeColorMenuRef.current && !shapeColorMenuRef.current.contains(event.target as Node)) {
        setShowShapeColorMenu(false);
      }
      if (effectsMenuRef.current && !effectsMenuRef.current.contains(event.target as Node)) {
        setShowEffectsMenu(false);
      }
      if (strokeMenuRef.current && !strokeMenuRef.current.contains(event.target as Node)) {
        setShowStrokeMenu(false);
      }
      if (bringForwardMenuRef.current && !bringForwardMenuRef.current.contains(event.target as Node)) {
        setShowBringForwardMenu(false);
      }
      if (sendBackwardMenuRef.current && !sendBackwardMenuRef.current.contains(event.target as Node)) {
        setShowSendBackwardMenu(false);
      }
    };
    
    if (showShapeMenu || showTextColorMenu || showShapeColorMenu || showEffectsMenu || showStrokeMenu || showBringForwardMenu || showSendBackwardMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showShapeMenu, showTextColorMenu, showShapeColorMenu, showEffectsMenu, showStrokeMenu, showBringForwardMenu, showSendBackwardMenu]);

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
  
  // 텍스트 추가 핸들러
  const handleAddText = () => {
    setPendingText(true);
    // TODO: 텍스트 추가 로직 구현
    console.log('텍스트 추가');
    setTimeout(() => setPendingText(false), 1000);
  };
  
  // 이미지 추가 핸들러
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string;
        // TODO: 이미지 추가 로직 구현
        console.log('이미지 추가:', imageUrl);
      };
      reader.readAsDataURL(file);
    }
    // 같은 파일을 다시 선택할 수 있도록 reset
    e.target.value = '';
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
      <div className="canvas-toolbar">
        {/* 아이콘 버튼 그룹 */}
        <div className="canvas-toolbar-group">
          {/* 텍스트 추가 버튼 */}
          <button 
            onClick={handleAddText}
            className={`canvas-toolbar-button ${pendingText ? 'active' : ''}`}
            title="텍스트 추가"
          >
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 7h16M4 12h16M4 17h10" />
            </svg>
          </button>

          {/* 도형 추가 버튼 */}
          <div style={{ position: 'relative' }} ref={menuRef}>
            <button
              onClick={() => setShowShapeMenu(!showShapeMenu)}
              className={`canvas-toolbar-button ${pendingShapeType ? 'active' : ''}`}
              title="도형 추가"
            >
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <line x1="9" y1="9" x2="15" y2="15" />
                <line x1="15" y1="9" x2="9" y2="15" />
              </svg>
            </button>
            {showShapeMenu && (
              <div className="canvas-shape-menu">
                {/* Rectangles */}
                <div className="canvas-shape-menu-section">
                  Rectangles
                </div>
                <div className="canvas-shape-menu-grid">
                  <button
                    onClick={() => {
                      setPendingShapeType("rectangle");
                      setShowShapeMenu(false);
                      console.log('Rectangle 추가');
                      setTimeout(() => setPendingShapeType(null), 1000);
                    }}
                    className="canvas-shape-menu-button"
                    title="Rectangle"
                  >
                    <div className="canvas-shape-preview rounded-sm"></div>
                  </button>
                  <button
                    onClick={() => {
                      setPendingShapeType("roundedRectangle");
                      setShowShapeMenu(false);
                      console.log('Rounded Rectangle 추가');
                      setTimeout(() => setPendingShapeType(null), 1000);
                    }}
                    className="canvas-shape-menu-button"
                    title="Rounded Rectangle"
                  >
                    <div className="canvas-shape-preview rounded"></div>
                  </button>
                  <button
                    onClick={() => {
                      setPendingShapeType("parallelogram");
                      setShowShapeMenu(false);
                      console.log('Parallelogram 추가');
                      setTimeout(() => setPendingShapeType(null), 1000);
                    }}
                    className="canvas-shape-menu-button"
                    title="Parallelogram"
                  >
                    <div className="canvas-shape-preview" style={{ transform: "skew(-20deg)" }}></div>
                  </button>
                </div>
                
                {/* Circles */}
                <div className="canvas-shape-menu-section">
                  Circles
                </div>
                <div className="canvas-shape-menu-grid">
                  <button
                    onClick={() => {
                      setPendingShapeType("circle");
                      setShowShapeMenu(false);
                      console.log('Circle 추가');
                      setTimeout(() => setPendingShapeType(null), 1000);
                    }}
                    className="canvas-shape-menu-button"
                    title="Circle"
                  >
                    <div className="canvas-shape-preview rounded-full"></div>
                  </button>
                  <button
                    onClick={() => {
                      setPendingShapeType("ellipse");
                      setShowShapeMenu(false);
                      console.log('Ellipse 추가');
                      setTimeout(() => setPendingShapeType(null), 1000);
                    }}
                    className="canvas-shape-menu-button"
                    title="Ellipse"
                  >
                    <div className="canvas-shape-preview ellipse"></div>
                  </button>
                </div>
                
                {/* Polygons */}
                <div className="canvas-shape-menu-section">
                  Polygons
                </div>
                <div className="canvas-shape-menu-grid">
                  <button
                    onClick={() => {
                      setPendingShapeType("triangle");
                      setShowShapeMenu(false);
                      console.log('Triangle 추가');
                      setTimeout(() => setPendingShapeType(null), 1000);
                    }}
                    className="canvas-shape-menu-button"
                    title="Triangle"
                  >
                    <svg width="32" height="32" viewBox="0 0 32 32">
                      <polygon points="16,4 4,28 28,28" fill="#f9a8d4" />
                    </svg>
                  </button>
                  <button
                    onClick={() => {
                      setPendingShapeType("diamond");
                      setShowShapeMenu(false);
                      console.log('Diamond 추가');
                      setTimeout(() => setPendingShapeType(null), 1000);
                    }}
                    className="canvas-shape-menu-button"
                    title="Diamond"
                  >
                    <svg width="32" height="32" viewBox="0 0 32 32">
                      <polygon points="16,4 28,16 16,28 4,16" fill="#f9a8d4" />
                    </svg>
                  </button>
                  <button
                    onClick={() => {
                      setPendingShapeType("star");
                      setShowShapeMenu(false);
                      console.log('Star 추가');
                      setTimeout(() => setPendingShapeType(null), 1000);
                    }}
                    className="canvas-shape-menu-button"
                    title="Star"
                  >
                    <svg width="32" height="32" viewBox="0 0 32 32">
                      <polygon points="16,2 19.5,12.2 30,12.2 21.2,18.6 24.7,28.8 16,22.4 7.3,28.8 10.8,18.6 2,12.2 12.5,12.2" fill="#f9a8d4" />
                    </svg>
                  </button>
                </div>
                <div className="canvas-shape-menu-grid">
                  <button
                    onClick={() => {
                      setPendingShapeType("pentagon");
                      setShowShapeMenu(false);
                      console.log('Pentagon 추가');
                      setTimeout(() => setPendingShapeType(null), 1000);
                    }}
                    className="canvas-shape-menu-button"
                    title="Pentagon"
                  >
                    <svg width="32" height="32" viewBox="0 0 32 32">
                      <polygon points="16,4 28,12 24,26 8,26 4,12" fill="#f9a8d4" />
                    </svg>
                  </button>
                  <button
                    onClick={() => {
                      setPendingShapeType("hexagon");
                      setShowShapeMenu(false);
                      console.log('Hexagon 추가');
                      setTimeout(() => setPendingShapeType(null), 1000);
                    }}
                    className="canvas-shape-menu-button"
                    title="Hexagon"
                  >
                    <svg width="32" height="32" viewBox="0 0 32 32">
                      <polygon points="16,4 24,8 28,16 24,24 16,28 8,24 4,16 8,8" fill="#f9a8d4" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 이미지 추가 버튼 */}
          <div>
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleImageChange}
            />
            <button 
              onClick={() => imageInputRef.current?.click()}
              className="canvas-toolbar-button"
              title="이미지 추가"
            >
              <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* 구분선 */}
        <div style={{ height: '80px', width: '1px', background: 'rgba(244, 114, 182, 0.3)' }}></div>
        
        {/* 텍스트 편집 컨트롤 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '200px' }}>
          {/* 첫 번째 줄: Font, Size */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <select 
              style={{ 
                padding: '4px 8px', 
                background: '#000000', 
                color: '#ffffff', 
                border: '1px solid rgba(244, 114, 182, 0.2)', 
                borderRadius: '4px', 
                fontSize: '14px' 
              }}
            >
              <option style={{ background: '#000000', color: '#ffffff' }}>Nanum Gothic</option>
            </select>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <button 
                style={{ 
                  padding: '4px 8px', 
                  background: '#000000', 
                  border: '1px solid rgba(244, 114, 182, 0.2)', 
                  borderRadius: '4px', 
                  color: '#ffffff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#1f1f1f'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#000000'}
                onClick={() => setFontSize(Math.max(8, fontSize - 1))}
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
              <input 
                type="number" 
                value={fontSize}
                onChange={(e) => setFontSize(Math.max(8, Math.min(200, parseInt(e.target.value) || 16)))}
                style={{ 
                  width: '36px', 
                  padding: '4px', 
                  background: '#000000', 
                  color: '#ffffff', 
                  border: '1px solid rgba(244, 114, 182, 0.2)', 
                  borderRadius: '4px', 
                  fontSize: '14px',
                  textAlign: 'center'
                }}
                onWheel={(e) => e.currentTarget.blur()}
              />
              <button 
                style={{ 
                  padding: '4px 8px', 
                  background: '#000000', 
                  border: '1px solid rgba(244, 114, 182, 0.2)', 
                  borderRadius: '4px', 
                  color: '#ffffff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#1f1f1f'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#000000'}
                onClick={() => setFontSize(Math.min(200, fontSize + 1))}
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
          </div>
          
          {/* 두 번째 줄: Text Color, B, I */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ position: 'relative' }} ref={textColorMenuRef}>
              <button 
                onClick={() => setShowTextColorMenu(!showTextColorMenu)}
                style={{ 
                  padding: '4px 12px', 
                  background: '#000000', 
                  borderRadius: '4px', 
                  fontSize: '14px', 
                  border: '1px solid rgba(244, 114, 182, 0.2)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px',
                  color: '#ffffff',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#1f1f1f'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#000000'}
              >
                <span>Text Color</span>
                <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {showTextColorMenu && (
                <div 
                  style={{ 
                    position: 'absolute', 
                    bottom: '100%', 
                    left: 0, 
                    marginBottom: '4px', 
                    background: '#000000', 
                    border: '1px solid rgba(244, 114, 182, 0.2)', 
                    borderRadius: '4px', 
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)', 
                    zIndex: 1000, 
                    padding: '12px' 
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <input
                    type="color"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    style={{ 
                      height: '128px', 
                      width: '100%', 
                      cursor: 'pointer',
                      border: 'none',
                      outline: 'none',
                      background: 'transparent'
                    }}
                  />
                </div>
              )}
            </div>
            <button 
              onClick={() => setFontWeight(fontWeight === 'bold' ? 'normal' : 'bold')}
              style={{ 
                padding: '4px 12px', 
                background: fontWeight === 'bold' ? '#1f1f1f' : '#000000', 
                borderRadius: '4px', 
                fontSize: '14px', 
                border: '1px solid rgba(244, 114, 182, 0.2)', 
                color: '#ffffff',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#1f1f1f'}
              onMouseLeave={(e) => e.currentTarget.style.background = fontWeight === 'bold' ? '#1f1f1f' : '#000000'}
            >
              B
            </button>
            <button 
              onClick={() => setFontStyle(fontStyle === 'italic' ? 'normal' : 'italic')}
              style={{ 
                padding: '4px 12px', 
                background: fontStyle === 'italic' ? '#1f1f1f' : '#000000', 
                borderRadius: '4px', 
                fontSize: '14px', 
                border: '1px solid rgba(244, 114, 182, 0.2)', 
                color: '#ffffff',
                fontStyle: 'italic',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#1f1f1f'}
              onMouseLeave={(e) => e.currentTarget.style.background = fontStyle === 'italic' ? '#1f1f1f' : '#000000'}
            >
              I
            </button>
          </div>
          
          {/* 세 번째 줄: 텍스트 정렬 버튼 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <button
              onClick={() => setTextAlign('left')}
              style={{ 
                padding: '4px 8px', 
                background: textAlign === 'left' ? 'rgba(249, 168, 212, 0.2)' : '#000000', 
                borderRadius: '4px', 
                fontSize: '14px', 
                border: textAlign === 'left' ? '1px solid #f9a8d4' : '1px solid rgba(244, 114, 182, 0.2)',
                color: '#ffffff',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                if (textAlign !== 'left') e.currentTarget.style.background = '#1f1f1f';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = textAlign === 'left' ? 'rgba(249, 168, 212, 0.2)' : '#000000';
              }}
            >
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 3h18v2H3V3zm0 4h12v2H3V7zm0 4h18v2H3v-2zm0 4h12v2H3v-2zm0 4h18v2H3v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setTextAlign('center')}
              style={{ 
                padding: '4px 8px', 
                background: textAlign === 'center' ? 'rgba(249, 168, 212, 0.2)' : '#000000', 
                borderRadius: '4px', 
                fontSize: '14px', 
                border: textAlign === 'center' ? '1px solid #f9a8d4' : '1px solid rgba(244, 114, 182, 0.2)',
                color: '#ffffff',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                if (textAlign !== 'center') e.currentTarget.style.background = '#1f1f1f';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = textAlign === 'center' ? 'rgba(249, 168, 212, 0.2)' : '#000000';
              }}
            >
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 3h18v2H3V3zm3 4h12v2H6V7zm-3 4h18v2H3v-2zm3 4h12v2H6v-2zm-3 4h18v2H3v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setTextAlign('right')}
              style={{ 
                padding: '4px 8px', 
                background: textAlign === 'right' ? 'rgba(249, 168, 212, 0.2)' : '#000000', 
                borderRadius: '4px', 
                fontSize: '14px', 
                border: textAlign === 'right' ? '1px solid #f9a8d4' : '1px solid rgba(244, 114, 182, 0.2)',
                color: '#ffffff',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                if (textAlign !== 'right') e.currentTarget.style.background = '#1f1f1f';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = textAlign === 'right' ? 'rgba(249, 168, 212, 0.2)' : '#000000';
              }}
            >
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 3h18v2H3V3zm6 4h12v2H9V7zm-6 4h18v2H3v-2zm6 4h12v2H9v-2zm-6 4h18v2H3v-2z" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* 구분선 */}
        <div style={{ height: '80px', width: '1px', background: 'rgba(244, 114, 182, 0.3)' }}></div>
        
        {/* 도형 편집 컨트롤 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '270px' }}>
          {/* 첫 번째 줄: Fill Color, Effects, Lock */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative' }} ref={shapeColorMenuRef}>
              <button 
                onClick={() => setShowShapeColorMenu(!showShapeColorMenu)}
                style={{ 
                  padding: '4px 12px', 
                  background: '#000000', 
                  borderRadius: '4px', 
                  fontSize: '14px', 
                  border: '1px solid rgba(244, 114, 182, 0.2)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px',
                  color: '#ffffff',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#1f1f1f'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#000000'}
              >
                <span>Fill Color</span>
                <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {showShapeColorMenu && (
                <div 
                  style={{ 
                    position: 'absolute', 
                    top: '100%', 
                    left: 0, 
                    marginTop: '4px', 
                    background: '#000000', 
                    border: '1px solid rgba(244, 114, 182, 0.2)', 
                    borderRadius: '4px', 
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)', 
                    zIndex: 1000, 
                    padding: '12px' 
                  }}
                >
                  <input
                    type="color"
                    value={shapeColor}
                    onChange={(e) => setShapeColor(e.target.value)}
                    style={{ 
                      height: '128px', 
                      width: '100%', 
                      cursor: 'pointer',
                      border: 'none',
                      outline: 'none',
                      background: 'transparent'
                    }}
                  />
                </div>
              )}
            </div>
            
            <div style={{ position: 'relative' }} ref={effectsMenuRef}>
              <button 
                onClick={() => setShowEffectsMenu(!showEffectsMenu)}
                style={{ 
                  padding: '4px 12px', 
                  background: '#000000', 
                  borderRadius: '4px', 
                  fontSize: '14px', 
                  border: '1px solid rgba(244, 114, 182, 0.2)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px',
                  color: '#ffffff',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#1f1f1f'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#000000'}
              >
                <span>Effect</span>
                <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {showEffectsMenu && (
                <div 
                  style={{ 
                    position: 'absolute', 
                    top: '100%', 
                    left: 0, 
                    marginTop: '4px', 
                    background: '#000000', 
                    border: '1px solid rgba(244, 114, 182, 0.2)', 
                    borderRadius: '4px', 
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)', 
                    zIndex: 1000, 
                    minWidth: '200px' 
                  }}
                >
                  <div style={{ padding: '12px 12px 4px', fontSize: '12px', color: '#9ca3af', borderBottom: '1px solid rgba(244, 114, 182, 0.1)' }}>
                    Shadow Effects
                  </div>
                  <button
                    onClick={() => setShowEffectsMenu(false)}
                    style={{ 
                      width: '100%', 
                      padding: '8px 12px', 
                      textAlign: 'left', 
                      fontSize: '14px', 
                      color: '#ffffff',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#1f1f1f'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    None
                  </button>
                  <button
                    onClick={() => setShowEffectsMenu(false)}
                    style={{ 
                      width: '100%', 
                      padding: '8px 12px', 
                      textAlign: 'left', 
                      fontSize: '14px', 
                      color: '#ffffff',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#1f1f1f'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    Outer Shadow
                  </button>
                  <button
                    onClick={() => setShowEffectsMenu(false)}
                    style={{ 
                      width: '100%', 
                      padding: '8px 12px', 
                      textAlign: 'left', 
                      fontSize: '14px', 
                      color: '#ffffff',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#1f1f1f'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    Inner Shadow
                  </button>
                </div>
              )}
            </div>
            
            <button
              style={{ 
                width: '32px', 
                height: '32px', 
                background: '#000000', 
                borderRadius: '4px', 
                fontSize: '14px', 
                border: '1px solid rgba(244, 114, 182, 0.2)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: '#ffffff',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#1f1f1f'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#000000'}
              title="Lock"
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
              </svg>
            </button>
          </div>
          
          {/* 두 번째 줄: Stroke, Corner Radius */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ position: 'relative' }} ref={strokeMenuRef}>
              <button 
                onClick={() => setShowStrokeMenu(!showStrokeMenu)}
                style={{ 
                  padding: '4px 12px', 
                  background: '#000000', 
                  borderRadius: '4px', 
                  fontSize: '14px', 
                  border: '1px solid rgba(244, 114, 182, 0.2)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px',
                  color: '#ffffff',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#1f1f1f'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#000000'}
              >
                <span>Stroke</span>
                <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {showStrokeMenu && (
                <div 
                  style={{ 
                    position: 'absolute', 
                    top: '100%', 
                    left: 0, 
                    marginTop: '4px', 
                    background: '#000000', 
                    border: '1px solid rgba(244, 114, 182, 0.2)', 
                    borderRadius: '4px', 
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)', 
                    zIndex: 1000, 
                    minWidth: '220px',
                    padding: '12px'
                  }}
                >
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ fontSize: '12px', color: '#ffffff', display: 'block', marginBottom: '8px' }}>Stroke Color:</label>
                    <input
                      type="color"
                      defaultValue="#000000"
                      style={{ 
                        width: '100%', 
                        height: '40px', 
                        cursor: 'pointer',
                        border: 'none',
                        outline: 'none',
                        background: 'transparent'
                      }}
                    />
                  </div>
                  <div style={{ marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <label style={{ fontSize: '12px', color: '#ffffff' }}>Stroke Width:</label>
                      <span style={{ fontSize: '12px', color: '#9ca3af' }}>0px</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="20"
                      step="1"
                      defaultValue="0"
                      style={{ 
                        width: '100%', 
                        height: '8px', 
                        background: '#1f1f1f', 
                        borderRadius: '4px', 
                        outline: 'none',
                        cursor: 'pointer'
                      }}
                    />
                  </div>
                  <button
                    onClick={() => setShowStrokeMenu(false)}
                    style={{ 
                      width: '100%', 
                      padding: '4px 8px', 
                      fontSize: '12px', 
                      background: '#1f1f1f', 
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#2f2f2f'}
                    onMouseLeave={(e) => e.currentTarget.style.background = '#1f1f1f'}
                  >
                    Remove Stroke
                  </button>
                </div>
              )}
            </div>
            
            {/* Corner Radius */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '14px', color: '#ffffff' }}>Corner Radius:</span>
                <input
                  ref={borderRadiusInputRef}
                  type="text"
                  value={borderRadiusInputValue}
                  onChange={(e) => {
                    const input = e.target.value;
                    if (input === '' || /^\d+$/.test(input)) {
                      setBorderRadiusInputValue(input);
                      if (input !== '' && /^\d+$/.test(input)) {
                        setShapeBorderRadius(Number(input));
                      }
                    }
                  }}
                  onBlur={(e) => {
                    const value = e.target.value;
                    if (value === '' || isNaN(Number(value))) {
                      setBorderRadiusInputValue('0');
                      setShapeBorderRadius(0);
                    } else {
                      const finalRadius = Math.max(0, Number(value));
                      setShapeBorderRadius(finalRadius);
                      setBorderRadiusInputValue(finalRadius.toString());
                    }
                  }}
                  style={{ 
                    width: '64px', 
                    padding: '4px 8px', 
                    background: '#000000', 
                    border: '1px solid rgba(244, 114, 182, 0.2)', 
                    borderRadius: '4px', 
                    fontSize: '14px',
                    color: '#ffffff'
                  }}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={shapeBorderRadius}
                  onChange={(e) => {
                    const newRadius = Number(e.target.value);
                    setShapeBorderRadius(newRadius);
                    setBorderRadiusInputValue(newRadius.toString());
                  }}
                  style={{ 
                    flex: 1, 
                    height: '8px', 
                    background: '#1f1f1f', 
                    borderRadius: '4px', 
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                />
              </div>
            </div>
          </div>
          
          {/* 세 번째 줄: z-index 조정 버튼들 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ position: 'relative' }} ref={bringForwardMenuRef}>
              <button 
                onClick={() => setShowBringForwardMenu(!showBringForwardMenu)}
                style={{ 
                  padding: '4px 12px', 
                  background: '#000000', 
                  borderRadius: '4px', 
                  fontSize: '14px', 
                  border: '1px solid rgba(244, 114, 182, 0.2)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px',
                  color: '#ffffff',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#1f1f1f'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#000000'}
                title="Bring Forward"
              >
                <div style={{ position: 'relative', width: '20px', height: '20px' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, width: '12px', height: '12px', border: '1px solid #f9a8d4', background: 'rgba(249, 168, 212, 0.3)' }}></div>
                  <div style={{ position: 'absolute', bottom: 0, right: 0, width: '12px', height: '12px', border: '1px solid #ffffff' }}></div>
                </div>
                <span>Bring Forward</span>
                <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {showBringForwardMenu && (
                <div 
                  style={{ 
                    position: 'absolute', 
                    top: '100%', 
                    left: 0, 
                    marginTop: '4px', 
                    background: '#000000', 
                    border: '1px solid rgba(244, 114, 182, 0.2)', 
                    borderRadius: '4px', 
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)', 
                    zIndex: 1000, 
                    minWidth: '160px' 
                  }}
                >
                  <button
                    onClick={() => setShowBringForwardMenu(false)}
                    style={{ 
                      width: '100%', 
                      padding: '8px 12px', 
                      textAlign: 'left', 
                      fontSize: '14px', 
                      color: '#ffffff',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#1f1f1f'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    Bring Forward
                  </button>
                  <button
                    onClick={() => setShowBringForwardMenu(false)}
                    style={{ 
                      width: '100%', 
                      padding: '8px 12px', 
                      textAlign: 'left', 
                      fontSize: '14px', 
                      color: '#ffffff',
                      background: 'transparent',
                      border: 'none',
                      borderTop: '1px solid rgba(244, 114, 182, 0.2)',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#1f1f1f'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    Bring to Front
                  </button>
                </div>
              )}
            </div>
            
            <div style={{ position: 'relative' }} ref={sendBackwardMenuRef}>
              <button 
                onClick={() => setShowSendBackwardMenu(!showSendBackwardMenu)}
                style={{ 
                  padding: '4px 12px', 
                  background: '#000000', 
                  borderRadius: '4px', 
                  fontSize: '14px', 
                  border: '1px solid rgba(244, 114, 182, 0.2)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px',
                  color: '#ffffff',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#1f1f1f'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#000000'}
                title="Send Backward"
              >
                <div style={{ position: 'relative', width: '20px', height: '20px' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, width: '12px', height: '12px', border: '1px solid #ffffff' }}></div>
                  <div style={{ position: 'absolute', bottom: 0, right: 0, width: '12px', height: '12px', border: '1px solid #f9a8d4', background: 'rgba(249, 168, 212, 0.3)' }}></div>
                </div>
                <span>Send Backward</span>
                <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {showSendBackwardMenu && (
                <div 
                  style={{ 
                    position: 'absolute', 
                    top: '100%', 
                    left: 0, 
                    marginTop: '4px', 
                    background: '#000000', 
                    border: '1px solid rgba(244, 114, 182, 0.2)', 
                    borderRadius: '4px', 
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)', 
                    zIndex: 1000, 
                    minWidth: '160px' 
                  }}
                >
                  <button
                    onClick={() => setShowSendBackwardMenu(false)}
                    style={{ 
                      width: '100%', 
                      padding: '8px 12px', 
                      textAlign: 'left', 
                      fontSize: '14px', 
                      color: '#ffffff',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#1f1f1f'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    Send Backward
                  </button>
                  <button
                    onClick={() => setShowSendBackwardMenu(false)}
                    style={{ 
                      width: '100%', 
                      padding: '8px 12px', 
                      textAlign: 'left', 
                      fontSize: '14px', 
                      color: '#ffffff',
                      background: 'transparent',
                      border: 'none',
                      borderTop: '1px solid rgba(244, 114, 182, 0.2)',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#1f1f1f'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    Send to Back
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {/* 네 번째 줄: 그룹화 버튼들 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              style={{ 
                padding: '4px 12px', 
                background: '#000000', 
                borderRadius: '4px', 
                fontSize: '14px', 
                border: '1px solid rgba(244, 114, 182, 0.2)', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px',
                color: '#ffffff',
                cursor: 'pointer',
                opacity: 0.5
              }}
              disabled
              title="Group (Ctrl+G) - 최소 2개 이상 선택 필요"
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span>Group</span>
            </button>
            <button
              style={{ 
                padding: '4px 12px', 
                background: '#000000', 
                borderRadius: '4px', 
                fontSize: '14px', 
                border: '1px solid rgba(244, 114, 182, 0.2)', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px',
                color: '#ffffff',
                cursor: 'pointer',
                opacity: 0.5
              }}
              disabled
              title="Ungroup (Ctrl+Shift+G)"
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              <span>Ungroup</span>
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
