import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { parseComponent, ComponentNode } from '../../lib/ast/componentParser';
import { updateElementInCode, updateTextInCode, insertShapeInCode, insertTextBoxInCode, deleteElementFromCode } from '../../lib/ast/codeModifier';
import { parseTailwindClasses } from '../../lib/utils/tailwindParser';
import { parseImports, loadImportedComponent } from '../../lib/ast/importResolver';
import { useCanvasStore, DrawingModeType } from '../../stores/canvasStore';
import { useProjectStore } from '../../stores/projectStore';
import './CanvasRenderer.css';

interface CanvasRendererProps {
  code: string;
  onCodeChange: (updatedCode: string) => void;
  zoomLevel?: number;
}

export function CanvasRenderer({ code, onCodeChange, zoomLevel = 1 }: CanvasRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const reactRootRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const drawingOverlayRef = useRef<HTMLDivElement>(null);
  const [componentTree, setComponentTree] = useState<ComponentNode | null>(null);
  const elementIdMapRef = useRef<Map<ComponentNode, string>>(new Map());
  const { selectedFile } = useProjectStore();
  const { 
    selectedElementId, 
    setSelectedElementId, 
    updateElementPosition,
    drawingMode,
    setDrawingMode,
    isDrawing,
    setIsDrawing,
    drawStartPosition,
    setDrawStartPosition,
    drawCurrentPosition,
    setDrawCurrentPosition,
  } = useCanvasStore();
  const [editingElementId, setEditingElementId] = useState<string | null>(null);
  const editingRef = useRef<HTMLElement | null>(null);
  
  // 컨텍스트 메뉴 상태
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    elementId: string | null;
  }>({ visible: false, x: 0, y: 0, elementId: null });
  
  // 텍스트 편집 완료 핸들러
  const handleTextEditComplete = useCallback((
    elementId: string,
    newText: string,
    loc: { start: { line: number; column: number }; end: { line: number; column: number } } | undefined
  ) => {
    console.log('[CanvasRenderer] 텍스트 편집 완료:', { elementId, newText, loc });
    
    if (!loc) {
      console.warn('[CanvasRenderer] loc 정보가 없어서 코드 업데이트 불가');
      return;
    }
    
    const updatedCode = updateTextInCode(code, loc, newText);
    
    if (updatedCode !== code) {
      onCodeChange(updatedCode);
      window.dispatchEvent(new CustomEvent('code-updated', { detail: updatedCode }));
    }
    
    setEditingElementId(null);
    editingRef.current = null;
  }, [code, onCodeChange]);

  // 더블클릭으로 텍스트 편집 시작
  const handleTextDoubleClick = useCallback((
    e: React.MouseEvent,
    elementId: string,
    element: HTMLElement
  ) => {
    e.stopPropagation();
    e.preventDefault();
    
    console.log('[CanvasRenderer] 텍스트 더블클릭:', elementId);
    
    setEditingElementId(elementId);
    editingRef.current = element;
    
    // contentEditable 설정
    element.contentEditable = 'true';
    element.focus();
    
    // 전체 텍스트 선택
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(element);
    selection?.removeAllRanges();
    selection?.addRange(range);
    
    // 스타일 변경 (편집 중임을 표시)
    element.style.outline = '2px solid #4CAF50';
    element.style.outlineOffset = '2px';
    element.style.backgroundColor = 'rgba(76, 175, 80, 0.1)';
    element.style.cursor = 'text';
  }, []);

  // 도형 그리기 - 마우스 다운 핸들러
  const handleDrawingMouseDown = useCallback((e: React.MouseEvent) => {
    if (!drawingMode) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const root = reactRootRef.current;
    if (!root) return;
    
    const rootRect = root.getBoundingClientRect();
    const x = (e.clientX - rootRect.left) / zoomLevel;
    const y = (e.clientY - rootRect.top) / zoomLevel;
    
    console.log('[CanvasRenderer] 도형 그리기 시작:', { x, y, drawingMode });
    
    setIsDrawing(true);
    setDrawStartPosition({ x, y });
    setDrawCurrentPosition({ x, y });
  }, [drawingMode, zoomLevel, setIsDrawing, setDrawStartPosition, setDrawCurrentPosition]);

  // 도형 그리기 - 마우스 무브 핸들러
  const handleDrawingMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDrawing || !drawingMode) return;
    
    const root = reactRootRef.current;
    if (!root) return;
    
    const rootRect = root.getBoundingClientRect();
    const x = (e.clientX - rootRect.left) / zoomLevel;
    const y = (e.clientY - rootRect.top) / zoomLevel;
    
    setDrawCurrentPosition({ x, y });
  }, [isDrawing, drawingMode, zoomLevel, setDrawCurrentPosition]);

  // 도형 그리기 - 마우스 업 핸들러
  // useRef로 최신 code 값 참조 (stale closure 방지)
  const codeRef = useRef(code);
  codeRef.current = code;
  
  const handleDrawingMouseUp = useCallback((e: React.MouseEvent) => {
    if (!isDrawing || !drawingMode || !drawStartPosition) {
      setIsDrawing(false);
      return;
    }
    
    e.preventDefault();
    e.stopPropagation();
    
    // 텍스트 박스는 클릭으로 생성 (드래그 불필요)
    const isTextbox = drawingMode === 'textbox';
    
    let x: number;
    let y: number;
    let width: number;
    let height: number;
    
    if (isTextbox) {
      // 텍스트 박스: 클릭 위치에 기본 크기로 생성
      x = drawStartPosition.x;
      y = drawStartPosition.y;
      width = 200;
      height = 32;
    } else {
      // 도형: 드래그로 크기 지정
      if (!drawCurrentPosition) {
        setIsDrawing(false);
        return;
      }
      x = Math.min(drawStartPosition.x, drawCurrentPosition.x);
      y = Math.min(drawStartPosition.y, drawCurrentPosition.y);
      width = Math.abs(drawCurrentPosition.x - drawStartPosition.x);
      height = Math.abs(drawCurrentPosition.y - drawStartPosition.y);
      
      // 도형 최소 크기 체크
      if (width < 10 || height < 10) {
        console.log('[CanvasRenderer] 도형이 너무 작음, 무시');
        setIsDrawing(false);
        setDrawStartPosition(null);
        setDrawCurrentPosition(null);
        return;
      }
    }
    
    // App 루트 요소의 오프셋 계산 (도형은 App 루트 내부에 삽입됨)
    const root = reactRootRef.current;
    if (root) {
      const rootRect = root.getBoundingClientRect();
      // 첫 번째 자식 요소 (App 루트)의 오프셋 찾기
      const appRoot = root.firstElementChild as HTMLElement;
      if (appRoot) {
        const appRootRect = appRoot.getBoundingClientRect();
        const appRootLeft = (appRootRect.left - rootRect.left) / zoomLevel;
        const appRootTop = (appRootRect.top - rootRect.top) / zoomLevel;
        
        // App 루트 기준 좌표로 변환
        x = x - appRootLeft;
        y = y - appRootTop;
        
        console.log('[CanvasRenderer] App 루트 오프셋:', { appRootLeft, appRootTop });
      }
    }
    
    console.log('[CanvasRenderer] 요소 생성:', { 
      type: drawingMode, 
      x, y, width, height 
    });
    
    // 최신 code 값 사용
    const currentCode = codeRef.current;
    
    // 코드에 새 요소 삽입 (텍스트 박스 또는 도형)
    let updatedCode: string;
    if (drawingMode === 'textbox') {
      updatedCode = insertTextBoxInCode(currentCode, {
        x: Math.round(x),
        y: Math.round(y),
        width: Math.round(width),
        height: Math.round(height),
      });
    } else {
      updatedCode = insertShapeInCode(currentCode, drawingMode, {
        x: Math.round(x),
        y: Math.round(y),
        width: Math.round(width),
        height: Math.round(height),
      });
    }
    
    console.log('[CanvasRenderer] 코드 변경 여부:', updatedCode !== currentCode);
    console.log('[CanvasRenderer] 원본 코드 길이:', currentCode.length, '변경 후:', updatedCode.length);
    
    if (updatedCode !== currentCode) {
      console.log('[CanvasRenderer] 코드 업데이트 실행');
      onCodeChange(updatedCode);
      window.dispatchEvent(new CustomEvent('code-updated', { detail: updatedCode }));
    } else {
      console.warn('[CanvasRenderer] 코드가 변경되지 않음');
      console.log('[CanvasRenderer] 현재 코드 첫 200자:', currentCode.substring(0, 200));
    }
    
    // 그리기 모드 종료
    setIsDrawing(false);
    setDrawStartPosition(null);
    setDrawCurrentPosition(null);
    setDrawingMode(null);
  }, [
    isDrawing, 
    drawingMode, 
    drawStartPosition, 
    drawCurrentPosition,
    onCodeChange, 
    setIsDrawing, 
    setDrawStartPosition, 
    setDrawCurrentPosition, 
    setDrawingMode
  ]);

  // 선택된 요소 삭제 핸들러
  const handleDeleteSelectedElement = useCallback(() => {
    console.log('[CanvasRenderer] handleDeleteSelectedElement 호출, selectedElementId:', selectedElementId);
    
    if (!selectedElementId) {
      console.warn('[CanvasRenderer] 선택된 요소 없음');
      return;
    }
    
    const root = reactRootRef.current;
    if (!root) {
      console.warn('[CanvasRenderer] reactRootRef.current가 없음');
      return;
    }
    
    let element = root.querySelector(`[data-element-id="${selectedElementId}"]`) as HTMLElement;
    if (!element) {
      console.warn('[CanvasRenderer] 삭제할 요소를 찾을 수 없음:', selectedElementId);
      return;
    }
    
    console.log('[CanvasRenderer] 찾은 요소:', element.tagName, element.getAttribute('data-element-id'));
    
    let locData = element.getAttribute('data-loc');
    
    // loc 정보가 없으면 부모 요소에서 찾기
    if (!locData) {
      console.log('[CanvasRenderer] loc 정보 없음, 부모 요소 탐색 시작');
      const parentWithLoc = element.closest('[data-loc]') as HTMLElement;
      if (parentWithLoc && parentWithLoc !== root) {
        element = parentWithLoc;
        locData = parentWithLoc.getAttribute('data-loc');
        console.log('[CanvasRenderer] 부모 요소에서 loc 찾음:', parentWithLoc.getAttribute('data-element-id'));
      }
    }
    
    if (!locData) {
      console.warn('[CanvasRenderer] loc 정보가 없어서 삭제 불가');
      console.log('[CanvasRenderer] 요소의 모든 속성:', Array.from(element.attributes).map(a => `${a.name}=${a.value}`));
      return;
    }
    
    try {
      const loc = JSON.parse(locData);
      console.log('[CanvasRenderer] 요소 삭제 시작:', { 
        elementId: element.getAttribute('data-element-id'), 
        loc 
      });
      
      const updatedCode = deleteElementFromCode(code, loc);
      
      console.log('[CanvasRenderer] 삭제 결과:', {
        codeChanged: updatedCode !== code,
        oldLength: code.length,
        newLength: updatedCode.length
      });
      
      if (updatedCode !== code) {
        // Ghost box 제거
        const overlay = overlayRef.current;
        if (overlay) {
          const ghostBox = overlay.querySelector('.ghost-box');
          if (ghostBox) {
            ghostBox.remove();
          }
        }
        
        onCodeChange(updatedCode);
        window.dispatchEvent(new CustomEvent('code-updated', { detail: updatedCode }));
        setSelectedElementId(null);
        setContextMenu({ visible: false, x: 0, y: 0, elementId: null });
        console.log('[CanvasRenderer] 요소 삭제 완료');
      } else {
        console.warn('[CanvasRenderer] 코드가 변경되지 않음');
      }
    } catch (error) {
      console.error('[CanvasRenderer] 삭제 중 오류:', error);
    }
  }, [selectedElementId, code, onCodeChange, setSelectedElementId]);

  // 컨텍스트 메뉴 닫기
  const handleCloseContextMenu = useCallback(() => {
    setContextMenu({ visible: false, x: 0, y: 0, elementId: null });
  }, []);

  // ESC 키로 그리기 모드 취소 및 Delete 키로 요소 삭제
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // ESC 키: 그리기 모드 취소 또는 컨텍스트 메뉴 닫기
      if (e.key === 'Escape') {
        if (contextMenu.visible) {
          handleCloseContextMenu();
        } else if (drawingMode) {
          console.log('[CanvasRenderer] ESC 키로 그리기 모드 취소');
          setIsDrawing(false);
          setDrawStartPosition(null);
          setDrawCurrentPosition(null);
          setDrawingMode(null);
        }
      }
      
      // Delete 또는 Backspace 키: 선택된 요소 삭제
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedElementId && !editingElementId) {
        e.preventDefault();
        console.log('[CanvasRenderer] Delete 키로 요소 삭제');
        handleDeleteSelectedElement();
      }
    };
    
    // 컨텍스트 메뉴 외부 클릭 시 닫기 (mousedown 사용 - click보다 먼저 발생)
    const handleMouseDown = (e: MouseEvent) => {
      if (contextMenu.visible) {
        // 컨텍스트 메뉴 내부 클릭인지 확인
        const contextMenuEl = document.querySelector('.context-menu');
        if (contextMenuEl && contextMenuEl.contains(e.target as Node)) {
          // 컨텍스트 메뉴 내부 클릭이면 무시
          return;
        }
        handleCloseContextMenu();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('mousedown', handleMouseDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousedown', handleMouseDown);
    };
  }, [drawingMode, setIsDrawing, setDrawStartPosition, setDrawCurrentPosition, setDrawingMode, selectedElementId, editingElementId, handleDeleteSelectedElement, contextMenu.visible, handleCloseContextMenu]);

  // 도형 프리뷰 렌더링
  const renderDrawingPreview = useCallback(() => {
    if (!isDrawing || !drawingMode || !drawStartPosition || !drawCurrentPosition) {
      return null;
    }
    
    const x = Math.min(drawStartPosition.x, drawCurrentPosition.x);
    const y = Math.min(drawStartPosition.y, drawCurrentPosition.y);
    const width = Math.abs(drawCurrentPosition.x - drawStartPosition.x);
    const height = Math.abs(drawCurrentPosition.y - drawStartPosition.y);
    
    // 도형 타입에 따른 스타일 결정
    const getShapeStyle = (): React.CSSProperties => {
      const baseStyle: React.CSSProperties = {
        position: 'absolute',
        left: x,
        top: y,
        width,
        height,
        backgroundColor: 'rgba(249, 168, 212, 0.5)', // 반투명 핑크
        border: '2px dashed #f472b6',
        pointerEvents: 'none',
        boxSizing: 'border-box',
      };
      
      switch (drawingMode) {
        case 'circle':
          return { ...baseStyle, borderRadius: '50%' };
        case 'ellipse':
          return { ...baseStyle, borderRadius: '50%' };
        case 'roundedRectangle':
          return { ...baseStyle, borderRadius: '8px' };
        case 'parallelogram':
          return { ...baseStyle, transform: 'skew(-20deg)' };
        default:
          return baseStyle;
      }
    };
    
    // 텍스트 박스는 클릭으로 즉시 생성되므로 프리뷰 불필요
    if (drawingMode === 'textbox') {
      return null;
    }
    
    // 삼각형, 다이아몬드, 별, 오각형, 육각형은 SVG로 렌더링
    if (['triangle', 'diamond', 'star', 'pentagon', 'hexagon'].includes(drawingMode as string)) {
      return (
        <svg
          style={{
            position: 'absolute',
            left: x,
            top: y,
            width,
            height,
            pointerEvents: 'none',
          }}
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          {drawingMode === 'triangle' && (
            <polygon 
              points="50,0 100,100 0,100" 
              fill="rgba(249, 168, 212, 0.5)" 
              stroke="#f472b6" 
              strokeWidth="2" 
              strokeDasharray="5,5"
            />
          )}
          {drawingMode === 'diamond' && (
            <polygon 
              points="50,0 100,50 50,100 0,50" 
              fill="rgba(249, 168, 212, 0.5)" 
              stroke="#f472b6" 
              strokeWidth="2" 
              strokeDasharray="5,5"
            />
          )}
          {drawingMode === 'star' && (
            <polygon 
              points="50,0 61,35 98,35 68,57 79,91 50,70 21,91 32,57 2,35 39,35" 
              fill="rgba(249, 168, 212, 0.5)" 
              stroke="#f472b6" 
              strokeWidth="2" 
              strokeDasharray="5,5"
            />
          )}
          {drawingMode === 'pentagon' && (
            <polygon 
              points="50,0 100,38 81,100 19,100 0,38" 
              fill="rgba(249, 168, 212, 0.5)" 
              stroke="#f472b6" 
              strokeWidth="2" 
              strokeDasharray="5,5"
            />
          )}
          {drawingMode === 'hexagon' && (
            <polygon 
              points="50,0 93,25 93,75 50,100 7,75 7,25" 
              fill="rgba(249, 168, 212, 0.5)" 
              stroke="#f472b6" 
              strokeWidth="2" 
              strokeDasharray="5,5"
            />
          )}
        </svg>
      );
    }
    
    return <div style={getShapeStyle()} />;
  }, [isDrawing, drawingMode, drawStartPosition, drawCurrentPosition]);

  // 컴포넌트 트리 경로 기반 일관된 ID 생성
  const generateElementId = (node: ComponentNode, depth: number, path: number[] = []): string => {
    // 이미 생성된 ID가 있으면 재사용
    if (elementIdMapRef.current.has(node)) {
      return elementIdMapRef.current.get(node)!;
    }
    
    // node.id가 있으면 사용
    if (node.id) {
      elementIdMapRef.current.set(node, node.id);
      return node.id;
    }
    
    // 경로 기반 ID 생성 (일관성 유지)
    const pathString = path.length > 0 ? path.join('-') : 'root';
    const typePrefix = node.type.substring(0, 3).toLowerCase();
    const newId = `el-${typePrefix}-${depth}-${pathString}`;
    elementIdMapRef.current.set(node, newId);
    return newId;
  };

  useEffect(() => {
    const parseWithImports = async () => {
      try {
        console.log('컴포넌트 파싱 시도, 코드 길이:', code.length);
        
        // Import 문 파싱
        const imports = parseImports(code);
        const importedComponents = new Map<string, ComponentNode>();
        
        // Import된 컴포넌트 로드
        if (selectedFile && imports.length > 0) {
          for (const importInfo of imports) {
            // Default export 처리
            if (importInfo.default) {
              // Default export의 로컬 이름 사용 (예: import Profile from ... -> Profile)
              const defaultName = importInfo.default;
              
              try {
                const component = await loadImportedComponent(
                  importInfo.source,
                  'default',
                  selectedFile
                );
                if (component) {
                  // Default export는 로컬 이름으로 저장
                  importedComponents.set(defaultName, component);
                  console.log(`컴포넌트 로드 성공 (default): ${defaultName} from ${importInfo.source}`);
                }
              } catch (error) {
                console.warn(`컴포넌트 로드 실패 (default): ${defaultName} from ${importInfo.source}`, error);
              }
            }
            
            // Named exports 처리
            for (const importedName of importInfo.imported) {
              // default는 이미 처리했으므로 건너뛰기
              if (importedName === 'default' || importedName === '*') {
                continue;
              }
              
              try {
                const component = await loadImportedComponent(
                  importInfo.source,
                  importedName,
                  selectedFile
                );
                if (component) {
                  importedComponents.set(importedName, component);
                  console.log(`컴포넌트 로드 성공: ${importedName} from ${importInfo.source}`);
                }
              } catch (error) {
                console.warn(`컴포넌트 로드 실패: ${importedName} from ${importInfo.source}`, error);
              }
            }
          }
        }
        
        // 컴포넌트 파싱 (importedComponents 포함)
        const parsed = parseComponent(code, {
          currentFile: selectedFile || undefined,
          importedComponents,
        });
        
        console.log('파싱 결과:', parsed);
        
        // 파싱된 트리에서 문제가 있는 부분 확인
        const checkForObjectIssues = (node: ComponentNode, path: string = 'root') => {
          if (node.props) {
            Object.entries(node.props).forEach(([key, value]) => {
              if (typeof value === 'object' && value !== null && !Array.isArray(value) && key !== 'style') {
                console.warn(`[object Object] 발견: ${path}.props.${key}`, value);
              }
            });
          }
          if (node.children) {
            node.children.forEach((child, idx) => {
              if (child && typeof child === 'object' && 'type' in child) {
                checkForObjectIssues(child, `${path}.children[${idx}]`);
              } else {
                console.warn(`유효하지 않은 자식: ${path}.children[${idx}]`, child);
              }
            });
          }
        };
        checkForObjectIssues(parsed);
        
        setComponentTree(parsed);
        // ID 맵 초기화
        elementIdMapRef.current.clear();
      } catch (error) {
        console.error('컴포넌트 파싱 실패:', error);
        setComponentTree({
          type: 'div',
          props: {},
          children: [
            {
              type: 'text',
              text: '파싱 오류가 발생했습니다. 콘솔을 확인하세요.',
            },
          ],
        });
        elementIdMapRef.current.clear();
      }
    };
    
    parseWithImports();
  }, [code, selectedFile]);

  // 선택된 요소에 ghost box 생성
  useEffect(() => {
    if (!selectedElementId || !reactRootRef.current || !overlayRef.current) {
      if (overlayRef.current) {
        overlayRef.current.innerHTML = '';
      }
      return;
    }

    // 편집 모드일 때는 ghost box 숨기기 (리사이즈 핸들러와 충돌 방지)
    if (editingElementId) {
      if (overlayRef.current) {
        overlayRef.current.innerHTML = '';
      }
      return;
    }

    const root = reactRootRef.current;
    console.log('Ghost box 생성 시도, selectedElementId:', selectedElementId);
    const element = root.querySelector(`[data-element-id="${selectedElementId}"]`) as HTMLElement;

    if (!element) {
      console.warn('요소를 찾을 수 없습니다:', selectedElementId);
      // 모든 data-element-id 요소 확인
      const allElements = root.querySelectorAll('[data-element-id]');
      console.log('사용 가능한 요소들:', Array.from(allElements).map(el => el.getAttribute('data-element-id')));
      return;
    }

    console.log('요소 찾음, Ghost box 생성:', element);

    // 약간의 지연을 두어 DOM이 완전히 렌더링된 후 실행
    const timer = setTimeout(() => {
      createGhostBoxForElement(element, selectedElementId);
    }, 50);

    return () => clearTimeout(timer);
  }, [selectedElementId, componentTree, editingElementId]);

  // 외부 클릭 시 선택 해제
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!selectedElementId) return;

      const target = e.target as HTMLElement;
      const root = reactRootRef.current;
      const overlay = overlayRef.current;
      
      if (!root || !overlay) return;

      // 클릭된 요소가 ghost box나 그 자식인지 확인
      const ghostBox = overlay.querySelector('.ghost-box');
      if (ghostBox && (ghostBox === target || ghostBox.contains(target))) {
        return; // ghost box를 클릭한 경우는 무시
      }

      // 클릭된 요소가 실제 요소인지 확인
      const clickedElement = target.closest('[data-element-id]');
      if (clickedElement && clickedElement.getAttribute('data-element-id') === selectedElementId) {
        return; // 선택된 요소를 클릭한 경우는 무시
      }

      // 외부를 클릭한 경우 선택 해제
      setSelectedElementId(null);
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [selectedElementId, setSelectedElementId]);

  // 루트 컨테이너 기준 절대 좌표 계산 (zoom 고려)
  const getAbsolutePosition = (el: HTMLElement): { left: number; top: number } => {
    const root = reactRootRef.current;
    if (!root) return { left: 0, top: 0 };

    // position: absolute인 요소는 이미 style.left/top이 설정되어 있을 수 있음
    const computedStyle = window.getComputedStyle(el);
    const position = computedStyle.position;
    
    // position: absolute이고 style.left/top이 명시적으로 설정된 경우
    if (position === 'absolute') {
      const styleLeft = el.style.left;
      const styleTop = el.style.top;
      
      if (styleLeft && styleTop && styleLeft !== 'auto' && styleTop !== 'auto') {
        // px 단위로 파싱
        let left = parseFloat(styleLeft) || 0;
        let top = parseFloat(styleTop) || 0;
        
        // offsetParent가 root이거나 null인 경우 바로 반환
        if (el.offsetParent === root || el.offsetParent === null) {
          return { left, top };
        }
        
        // offsetParent가 root의 자식인 경우, offsetParent의 위치를 더해야 함
        // getBoundingClientRect()를 사용하여 더 정확한 위치 계산
        const elementRect = el.getBoundingClientRect();
        const rootRect = root.getBoundingClientRect();
        
        // 루트 컨테이너 기준 상대 위치 계산 (zoom 고려)
        const relativeLeft = (elementRect.left - rootRect.left) / zoomLevel;
        const relativeTop = (elementRect.top - rootRect.top) / zoomLevel;
        
        return { left: relativeLeft, top: relativeTop };
      }
    }

    // 일반적인 경우: getBoundingClientRect()를 사용하여 더 정확한 위치 계산
    // transform: scale()이 적용된 경우도 정확하게 처리
    const elementRect = el.getBoundingClientRect();
    const rootRect = root.getBoundingClientRect();
    
    // 루트 컨테이너 기준 상대 위치 계산 (zoom 고려)
    const left = (elementRect.left - rootRect.left) / zoomLevel;
    const top = (elementRect.top - rootRect.top) / zoomLevel;

    return { left, top };
  };

  // 텍스트 편집 가능한 태그인지 확인
  const textEditableTags = ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span', 'button', 'a', 'label', 'li'];
  
  // Ghost Box에서 텍스트 편집 시작
  const startTextEditFromGhostBox = useCallback((elementId: string) => {
    const root = reactRootRef.current;
    if (!root) return;
    
    const actualElement = root.querySelector(`[data-element-id="${elementId}"]`) as HTMLElement;
    if (!actualElement) return;
    
    const tagName = actualElement.tagName.toLowerCase();
    
    // 텍스트 편집 가능한 태그인지 확인
    if (!textEditableTags.includes(tagName)) {
      console.log('[CanvasRenderer] 텍스트 편집 불가능한 태그:', tagName);
      return;
    }
    
    // loc 정보 가져오기 (자신 또는 부모 요소에서)
    let locData = actualElement.getAttribute('data-loc');
    let locElement = actualElement;
    
    // 텍스트 노드인 경우 (span으로 렌더링됨) 부모 요소의 loc 사용
    if (!locData || tagName === 'span') {
      const parent = actualElement.parentElement;
      if (parent) {
        const parentLoc = parent.getAttribute('data-loc');
        if (parentLoc) {
          locData = parentLoc;
          locElement = parent;
        }
      }
    }
    
    console.log('[CanvasRenderer] Ghost Box에서 텍스트 편집 시작:', elementId, 'loc:', locData);
    
    // ghost box 숨기기
    const overlay = overlayRef.current;
    if (overlay) {
      overlay.style.display = 'none';
    }
    
    setEditingElementId(elementId);
    editingRef.current = actualElement;
    
    // contentEditable 설정
    actualElement.contentEditable = 'true';
    actualElement.focus();
    
    // 전체 텍스트 선택
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(actualElement);
    selection?.removeAllRanges();
    selection?.addRange(range);
    
    // 스타일 변경 (편집 중임을 표시)
    actualElement.style.outline = '2px solid #4CAF50';
    actualElement.style.outlineOffset = '2px';
    actualElement.style.backgroundColor = 'rgba(76, 175, 80, 0.1)';
    actualElement.style.cursor = 'text';
    
    // blur 이벤트 핸들러 추가
    const handleBlur = () => {
      const loc = locData ? JSON.parse(locData) : undefined;
      // locElement (부모)의 전체 텍스트 내용을 가져옴
      const newText = locElement === actualElement 
        ? actualElement.textContent || ''
        : actualElement.textContent || '';
      
      console.log('[CanvasRenderer] 텍스트 편집 blur:', { newText, loc });
      
      actualElement.contentEditable = 'false';
      actualElement.style.outline = '';
      actualElement.style.outlineOffset = '';
      actualElement.style.backgroundColor = '';
      actualElement.style.cursor = 'pointer';
      
      // ghost box 다시 표시
      if (overlay) {
        overlay.style.display = '';
      }
      
      if (loc) {
        // 부모 요소의 loc을 사용하여 텍스트 업데이트
        handleTextEditComplete(elementId, newText, loc);
      } else {
        console.warn('[CanvasRenderer] loc 정보가 없어서 코드 업데이트 불가');
      }
      
      actualElement.removeEventListener('blur', handleBlur);
      actualElement.removeEventListener('keydown', handleKeyDown);
      
      // ghost box 재생성
      setTimeout(() => {
        if (selectedElementId === elementId) {
          createGhostBoxForElement(actualElement, elementId);
        }
      }, 50);
    };
    
    // keydown 이벤트 핸들러
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        actualElement.blur();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        actualElement.blur();
        setEditingElementId(null);
      }
    };
    
    actualElement.addEventListener('blur', handleBlur);
    actualElement.addEventListener('keydown', handleKeyDown);
  }, [handleTextEditComplete, selectedElementId]);

  // Ghost Box 생성
  const createGhostBoxForElement = (el: HTMLElement, elementId: string) => {
    const root = reactRootRef.current;
    const overlay = overlayRef.current;
    if (!root || !overlay) return;

    overlay.innerHTML = '';

    // zoom이 적용된 rect를 zoom으로 나누어 실제 크기 계산
    const rect = el.getBoundingClientRect();
    const actualWidth = rect.width / zoomLevel;
    const actualHeight = rect.height / zoomLevel;
    
    // 요소의 절대 위치 계산
    const { left, top } = getAbsolutePosition(el);
    
    const box = document.createElement('div');
    box.className = 'ghost-box';
    box.setAttribute('data-element-id', elementId);
    box.style.position = 'absolute';
    box.style.left = left + 'px';
    box.style.top = top + 'px';
    box.style.width = actualWidth + 'px';
    box.style.height = actualHeight + 'px';
    box.style.border = '2px dashed #007acc';
    box.style.boxSizing = 'border-box';
    box.style.pointerEvents = 'auto';
    box.style.cursor = 'move';
    box.style.backgroundColor = 'rgba(0, 122, 204, 0.05)';
    box.style.zIndex = '1000';
    box.style.margin = '0';
    box.style.padding = '0';

    // 리사이즈 핸들 추가
    const handles = ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'];
    handles.forEach((dir) => {
      const handle = document.createElement('div');
      handle.className = `resize-handle resize-handle-${dir}`;
      handle.setAttribute('data-direction', dir);
      box.appendChild(handle);
    });
    
    // 더블클릭으로 텍스트 편집 시작
    box.addEventListener('dblclick', (e) => {
      e.stopPropagation();
      e.preventDefault();
      startTextEditFromGhostBox(elementId);
    });
    
    // 우클릭으로 컨텍스트 메뉴 표시
    box.addEventListener('contextmenu', (e) => {
      e.stopPropagation();
      e.preventDefault();
      
      // 화면(viewport) 기준 좌표 사용 - fixed 포지션으로 표시
      setContextMenu({
        visible: true,
        x: e.clientX,
        y: e.clientY,
        elementId: elementId,
      });
    });

    overlay.appendChild(box);
    attachDragHandlers(box, elementId);
    attachResizeHandlers(box, elementId);
  };

  // 드래그 핸들러
  const attachDragHandlers = (box: HTMLDivElement, elementId: string) => {
    let dragging = false;
    let startX = 0;
    let startY = 0;
    let startLeft = 0;
    let startTop = 0;
    let actualElement: HTMLElement | null = null;
    let placeholder: HTMLElement | null = null;
    let originalHeight = 0;
    let originalWidth = 0;
    let originalMarginTop = 0;
    let originalMarginBottom = 0;

    box.addEventListener('mousedown', (e) => {
      // 리사이즈 핸들을 클릭한 경우는 드래그하지 않음
      if ((e.target as HTMLElement).classList.contains('resize-handle')) {
        return;
      }
      
      // 우클릭인 경우 드래그하지 않음
      if (e.button !== 0) {
        return;
      }
      
      // 컨텍스트 메뉴가 열려있으면 드래그하지 않음
      const contextMenuEl = document.querySelector('.context-menu');
      if (contextMenuEl) {
        return;
      }

      dragging = true;
      // 마우스 좌표는 zoom이 적용된 화면 좌표이므로, 실제 좌표로 변환
      startX = e.clientX;
      startY = e.clientY;
      startLeft = parseFloat(box.style.left) || 0;
      startTop = parseFloat(box.style.top) || 0;

      const root = reactRootRef.current;
      if (root) {
        actualElement = root.querySelector(`[data-element-id="${elementId}"]`) as HTMLElement;
        
        if (actualElement && actualElement.parentElement) {
          // 기존 placeholder 확인 (이미 드래그/리사이즈된 요소)
          const existingPlaceholder = actualElement.parentElement.querySelector(`[data-placeholder-for="${elementId}"]`) as HTMLElement;
          
          // 원래 크기와 마진 저장 (레이아웃 유지용)
          const rect = actualElement.getBoundingClientRect();
          const computedStyle = window.getComputedStyle(actualElement);
          
          originalWidth = rect.width / zoomLevel;
          originalHeight = rect.height / zoomLevel;
          originalMarginTop = (parseFloat(computedStyle.marginTop) || 0) / zoomLevel;
          originalMarginBottom = (parseFloat(computedStyle.marginBottom) || 0) / zoomLevel;
          
          // 아직 absolute가 아닌 경우에만 placeholder 생성 및 absolute로 변경
          if (!existingPlaceholder && computedStyle.position !== 'absolute') {
            // 현재 요소의 절대 위치 계산
            const rootRect = root.getBoundingClientRect();
            const currentLeft = (rect.left - rootRect.left) / zoomLevel;
            const currentTop = (rect.top - rootRect.top) / zoomLevel;
            
            // 부모 기준 좌표 계산
            const parentElement = actualElement.parentElement;
            let elementLeft = currentLeft;
            let elementTop = currentTop;
            
            if (parentElement && parentElement !== root) {
              const parentRect = parentElement.getBoundingClientRect();
              const parentLeft = (parentRect.left - rootRect.left) / zoomLevel;
              const parentTop = (parentRect.top - rootRect.top) / zoomLevel;
              elementLeft = currentLeft - parentLeft;
              elementTop = currentTop - parentTop;
            }
            
            // 1. 먼저 요소를 absolute로 변경
            actualElement.style.position = 'absolute';
            actualElement.style.left = elementLeft + 'px';
            actualElement.style.top = elementTop + 'px';
            actualElement.style.width = originalWidth + 'px';
            actualElement.style.height = originalHeight + 'px';
            actualElement.style.margin = '0';
            
            // 2. 그 다음 placeholder 생성
            placeholder = document.createElement('div');
            placeholder.style.width = originalWidth + 'px';
            placeholder.style.height = (originalHeight + originalMarginTop + originalMarginBottom) + 'px';
            placeholder.style.marginTop = '0';
            placeholder.style.marginBottom = '0';
            placeholder.style.visibility = 'hidden';
            placeholder.style.pointerEvents = 'none';
            placeholder.style.boxSizing = 'border-box';
            placeholder.setAttribute('data-placeholder-for', elementId);
            actualElement.parentElement?.insertBefore(placeholder, actualElement);
          }
          
          // 드래그 중에는 실제 요소를 투명하게 만들기
          actualElement.style.opacity = '0.3';
        }
      }

      e.stopPropagation();
      e.preventDefault();

      box.style.cursor = 'grabbing';
      box.style.backgroundColor = 'rgba(0, 122, 204, 0.1)';

      const onMouseMove = (e: MouseEvent) => {
        if (!dragging) return;

        // 마우스 이동 거리를 zoom으로 나누어 실제 좌표 계산
        const dx = ((e as MouseEvent).clientX - startX) / zoomLevel;
        const dy = ((e as MouseEvent).clientY - startY) / zoomLevel;

        const newLeft = startLeft + dx;
        const newTop = startTop + dy;

        // Ghost box만 이동 (실제 요소는 레이아웃 유지)
        box.style.left = newLeft + 'px';
        box.style.top = newTop + 'px';
      };

      const onMouseUp = () => {
        if (!dragging) return;

        dragging = false;
        box.style.cursor = 'move';
        box.style.backgroundColor = 'rgba(0, 122, 204, 0.05)';

        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);

        const finalLeft = parseFloat(box.style.left) || 0;
        const finalTop = parseFloat(box.style.top) || 0;

        // 드래그가 끝나면 실제 요소의 위치를 업데이트
        if (actualElement && actualElement.parentElement) {
          // 실제 요소의 위치 및 크기 설정 (이미 absolute임)
          // finalLeft와 finalTop은 루트 컨테이너 기준 좌표이므로,
          // 실제 요소의 부모가 루트가 아닌 경우 부모 기준 좌표로 변환해야 함
          const parentElement = actualElement.parentElement;
          const root = reactRootRef.current;
          
          let elementLeft = finalLeft;
          let elementTop = finalTop;
          
          // 부모 요소가 루트 컨테이너가 아닌 경우, 부모 기준 좌표로 변환
          if (parentElement && root && parentElement !== root) {
            // 부모 요소의 루트 기준 위치 계산
            const parentRect = parentElement.getBoundingClientRect();
            const rootRect = root.getBoundingClientRect();
            
            // 부모의 루트 기준 위치 (zoom 고려)
            const parentLeft = (parentRect.left - rootRect.left) / zoomLevel;
            const parentTop = (parentRect.top - rootRect.top) / zoomLevel;
            
            // 부모 기준 좌표로 변환
            elementLeft = finalLeft - parentLeft;
            elementTop = finalTop - parentTop;
          }
          
          // 위치만 업데이트 (이미 absolute임, placeholder도 이미 존재함)
          actualElement.style.left = elementLeft + 'px';
          actualElement.style.top = elementTop + 'px';
          actualElement.style.opacity = '1'; // 불투명도 복원
        }

        // 부모 기준 좌표 계산 (코드에는 부모 기준 좌표로 저장해야 함)
        let codeLeft = finalLeft;
        let codeTop = finalTop;
        
        if (actualElement && actualElement.parentElement) {
          const parentElement = actualElement.parentElement;
          const root = reactRootRef.current;
          
          if (parentElement && root && parentElement !== root) {
            const parentRect = parentElement.getBoundingClientRect();
            const rootRect = root.getBoundingClientRect();
            const parentLeft = (parentRect.left - rootRect.left) / zoomLevel;
            const parentTop = (parentRect.top - rootRect.top) / zoomLevel;
            codeLeft = finalLeft - parentLeft;
            codeTop = finalTop - parentTop;
          }
        }
        
        // 코드 업데이트 (부모 기준 좌표 사용)
        updateElementPosition(elementId, { x: codeLeft, y: codeTop });
        
        // 요소의 AST 위치 정보 가져오기
        const locData = actualElement?.getAttribute('data-loc');
        console.log('[CanvasRenderer] 드래그 완료. elementId:', elementId, 'locData:', locData);
        const loc = locData ? JSON.parse(locData) : undefined;
        console.log('[CanvasRenderer] 파싱된 loc:', loc, 'codeLeft:', codeLeft, 'codeTop:', codeTop);
        
        const updatedCode = updateElementInCode(code, elementId, {
          position: { x: codeLeft, y: codeTop },
          size: { width: originalWidth, height: originalHeight },
        }, loc);
        
        // 코드가 변경되었는지 확인
        const codeChanged = updatedCode !== code;
        console.log('[CanvasRenderer] 코드 변경됨:', codeChanged);
        
        onCodeChange(updatedCode);
        
        // Canvas → Code 동기화 이벤트 발생 (Monaco Editor 업데이트)
        window.dispatchEvent(new CustomEvent('code-updated', { detail: updatedCode }));
        
        // 드롭 후 ghost box를 실제 요소 위치와 정확히 일치하도록 재생성
        // 약간의 지연을 두어 DOM 업데이트가 완료된 후 실행
        setTimeout(() => {
          if (actualElement && selectedElementId === elementId) {
            // ghost box를 완전히 다시 생성하여 위치와 크기를 정확히 맞춤
            createGhostBoxForElement(actualElement, elementId);
          }
        }, 50);
      };

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    });
  };

  // 리사이즈 핸들러
  const attachResizeHandlers = (box: HTMLDivElement, elementId: string) => {
    const handles = box.querySelectorAll('.resize-handle');
    let resizing = false;
    let startX = 0;
    let startY = 0;
    let startLeft = 0;
    let startTop = 0;
    let startWidth = 0;
    let startHeight = 0;
    let direction = '';
    let actualElement: HTMLElement | null = null;
    let placeholder: HTMLElement | null = null;
    let originalWidth = 0;
    let originalHeight = 0;
    let originalMarginTop = 0;
    let originalMarginBottom = 0;

    handles.forEach((handle) => {
      handle.addEventListener('mousedown', (e) => {
        const mouseEvent = e as MouseEvent;
        
        // 우클릭인 경우 리사이즈하지 않음
        if (mouseEvent.button !== 0) {
          return;
        }
        
        // 컨텍스트 메뉴가 열려있으면 리사이즈하지 않음
        const contextMenuEl = document.querySelector('.context-menu');
        if (contextMenuEl) {
          return;
        }
        
        resizing = true;
        startX = mouseEvent.clientX;
        startY = mouseEvent.clientY;
        startLeft = parseFloat(box.style.left) || 0;
        startTop = parseFloat(box.style.top) || 0;
        startWidth = parseFloat(box.style.width) || 0;
        startHeight = parseFloat(box.style.height) || 0;
        direction = (handle as HTMLElement).getAttribute('data-direction') || '';

        e.stopPropagation();
        e.preventDefault();

        const root = reactRootRef.current;
        actualElement = root?.querySelector(`[data-element-id="${elementId}"]`) as HTMLElement;
        
        // 리사이즈 시작 시 placeholder 생성 및 요소를 absolute로 변경 (레이아웃 유지용)
        if (actualElement && actualElement.parentElement) {
          // 기존 placeholder 확인 (이미 드래그/리사이즈된 요소)
          const existingPlaceholder = actualElement.parentElement.querySelector(`[data-placeholder-for="${elementId}"]`) as HTMLElement;
          
          // 원래 크기와 마진 저장
          const rect = actualElement.getBoundingClientRect();
          const computedStyle = window.getComputedStyle(actualElement);
          
          originalWidth = rect.width / zoomLevel;
          originalHeight = rect.height / zoomLevel;
          originalMarginTop = (parseFloat(computedStyle.marginTop) || 0) / zoomLevel;
          originalMarginBottom = (parseFloat(computedStyle.marginBottom) || 0) / zoomLevel;
          
          // 현재 요소의 절대 위치 계산 (absolute로 변환하기 전에)
          const rootRect = root?.getBoundingClientRect();
          if (!rootRect) return;
          const currentLeft = (rect.left - rootRect.left) / zoomLevel;
          const currentTop = (rect.top - rootRect.top) / zoomLevel;
          
          // 아직 placeholder가 없고, 아직 absolute가 아닌 경우에만 placeholder 생성
          if (!existingPlaceholder && computedStyle.position !== 'absolute') {
            // 부모 기준 좌표 계산
            const parentElement = actualElement.parentElement;
            let elementLeft = currentLeft;
            let elementTop = currentTop;
            
            if (parentElement && parentElement !== root) {
              const parentRect = parentElement.getBoundingClientRect();
              const parentLeft = (parentRect.left - rootRect.left) / zoomLevel;
              const parentTop = (parentRect.top - rootRect.top) / zoomLevel;
              elementLeft = currentLeft - parentLeft;
              elementTop = currentTop - parentTop;
            }
            
            // 1. 먼저 요소를 absolute로 변경 (현재 위치 유지)
            actualElement.style.position = 'absolute';
            actualElement.style.left = elementLeft + 'px';
            actualElement.style.top = elementTop + 'px';
            actualElement.style.width = originalWidth + 'px';
            actualElement.style.height = originalHeight + 'px';
            actualElement.style.margin = '0';
            
            // 2. 그 다음 placeholder 생성 (요소가 빠져나간 자리를 채움)
            placeholder = document.createElement('div');
            placeholder.style.width = originalWidth + 'px';
            placeholder.style.height = (originalHeight + originalMarginTop + originalMarginBottom) + 'px';
            placeholder.style.marginTop = '0';
            placeholder.style.marginBottom = '0';
            placeholder.style.visibility = 'hidden';
            placeholder.style.pointerEvents = 'none';
            placeholder.style.boxSizing = 'border-box';
            placeholder.setAttribute('data-placeholder-for', elementId);
            
            // 요소 바로 앞에 삽입 (요소는 이미 absolute이므로 레이아웃에 영향 없음)
            actualElement.parentElement?.insertBefore(placeholder, actualElement);
          }
        }

        const onMouseMove = (e: MouseEvent) => {
          if (!resizing) return;

          // 마우스 이동 거리를 zoom으로 나누어 실제 좌표 계산
          const dx = (e.clientX - startX) / zoomLevel;
          const dy = (e.clientY - startY) / zoomLevel;

          let newLeft = startLeft;
          let newTop = startTop;
          let newWidth = startWidth;
          let newHeight = startHeight;

          // 방향에 따라 크기 조정
          if (direction.includes('e')) {
            newWidth = startWidth + dx;
          }
          if (direction.includes('w')) {
            newWidth = startWidth - dx;
            newLeft = startLeft + dx;
          }
          if (direction.includes('s')) {
            newHeight = startHeight + dy;
          }
          if (direction.includes('n')) {
            newHeight = startHeight - dy;
            newTop = startTop + dy;
          }

          // 최소 크기 제한
          if (newWidth < 20) newWidth = 20;
          if (newHeight < 20) newHeight = 20;

          box.style.left = newLeft + 'px';
          box.style.top = newTop + 'px';
          box.style.width = newWidth + 'px';
          box.style.height = newHeight + 'px';

          if (actualElement) {
            // newLeft와 newTop은 루트 컨테이너 기준 좌표이므로,
            // 실제 요소의 부모가 루트가 아닌 경우 부모 기준 좌표로 변환해야 함
            const parentElement = actualElement.parentElement;
            const root = reactRootRef.current;
            
            let elementLeft = newLeft;
            let elementTop = newTop;
            
            // 부모 요소가 루트 컨테이너가 아닌 경우, 부모 기준 좌표로 변환
            if (parentElement && root && parentElement !== root) {
              // 부모 요소의 루트 기준 위치 계산
              const parentRect = parentElement.getBoundingClientRect();
              const rootRect = root.getBoundingClientRect();
              
              // 부모의 루트 기준 위치 (zoom 고려)
              const parentLeft = (parentRect.left - rootRect.left) / zoomLevel;
              const parentTop = (parentRect.top - rootRect.top) / zoomLevel;
              
              // 부모 기준 좌표로 변환
              elementLeft = newLeft - parentLeft;
              elementTop = newTop - parentTop;
            }
            
            actualElement.style.position = 'absolute';
            actualElement.style.left = elementLeft + 'px';
            actualElement.style.top = elementTop + 'px';
            actualElement.style.width = newWidth + 'px';
            actualElement.style.height = newHeight + 'px';
            actualElement.style.margin = '0';
          }
        };

        const onMouseUp = () => {
          if (!resizing) return;

          resizing = false;

          document.removeEventListener('mousemove', onMouseMove);
          document.removeEventListener('mouseup', onMouseUp);

          const finalLeft = parseFloat(box.style.left) || 0;
          const finalTop = parseFloat(box.style.top) || 0;
          const finalWidth = parseFloat(box.style.width) || 0;
          const finalHeight = parseFloat(box.style.height) || 0;

          // 부모 기준 좌표 계산 (코드에는 부모 기준 좌표로 저장해야 함)
          let codeLeft = finalLeft;
          let codeTop = finalTop;
          
          // 실제 요소의 위치를 최종 확인 및 업데이트 (placeholder는 이미 mousedown에서 생성됨)
          if (actualElement && actualElement.parentElement) {
            const parentElement = actualElement.parentElement;
            const root = reactRootRef.current;
            
            let elementLeft = finalLeft;
            let elementTop = finalTop;
            
            // 부모 요소가 루트 컨테이너가 아닌 경우, 부모 기준 좌표로 변환
            if (parentElement && root && parentElement !== root) {
              const parentRect = parentElement.getBoundingClientRect();
              const rootRect = root.getBoundingClientRect();
              
              const parentLeft = (parentRect.left - rootRect.left) / zoomLevel;
              const parentTop = (parentRect.top - rootRect.top) / zoomLevel;
              
              elementLeft = finalLeft - parentLeft;
              elementTop = finalTop - parentTop;
              
              // 코드에도 부모 기준 좌표 사용
              codeLeft = elementLeft;
              codeTop = elementTop;
            }
            
            // 최종 위치 및 크기 설정
            actualElement.style.position = 'absolute';
            actualElement.style.left = elementLeft + 'px';
            actualElement.style.top = elementTop + 'px';
            actualElement.style.width = finalWidth + 'px';
            actualElement.style.height = finalHeight + 'px';
            actualElement.style.margin = '0';
          }

          // 코드 업데이트 (부모 기준 좌표 사용)
          updateElementPosition(elementId, {
            x: codeLeft,
            y: codeTop,
            width: finalWidth,
            height: finalHeight,
          });
          
          // 요소의 AST 위치 정보 가져오기
          const locData = actualElement?.getAttribute('data-loc');
          const loc = locData ? JSON.parse(locData) : undefined;
          
          const updatedCode = updateElementInCode(code, elementId, {
            position: { x: codeLeft, y: codeTop },
            size: { width: finalWidth, height: finalHeight },
          }, loc);
          onCodeChange(updatedCode);
          
          // Canvas → Code 동기화 이벤트 발생 (Monaco Editor 업데이트)
          window.dispatchEvent(new CustomEvent('code-updated', { detail: updatedCode }));
          
          // 리사이즈 후 ghost box를 실제 요소 위치와 정확히 일치하도록 재생성
          setTimeout(() => {
            if (actualElement && selectedElementId === elementId) {
              createGhostBoxForElement(actualElement, elementId);
            }
          }, 50);
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
      });
    });
  };

  const renderElement = (node: ComponentNode, depth: number = 0, isRoot: boolean = false, path: number[] = []): JSX.Element | null => {
    if (!node) return null;

    if (depth > 20) {
      return <div>깊이 제한 초과</div>;
    }

    // 편집 가능한 요소 목록 (svg 추가하여 도형도 편집 가능)
    const editableTags = ['div', 'section', 'header', 'footer', 'main', 'nav', 'aside', 'article', 'button', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span', 'svg'];

    // 일관된 ID 생성
    const elementId = generateElementId(node, depth, path);
    
    // data-element-id 속성 추가 (ghost box 매핑용)
    const dataElementId = elementId;
    
    // AST 위치 정보 (코드 수정 시 사용)
    const dataLoc = node.loc ? JSON.stringify(node.loc) : undefined;
    
    // Tailwind CSS 클래스 파싱
    const tailwindStyles = node.props?.className 
      ? parseTailwindClasses(node.props.className)
      : {};
    
    // 기존 스타일과 병합
    const baseStyle: React.CSSProperties = {
      ...tailwindStyles,
      ...(node.props?.style || {}),
    };

    // position이 이미 명시적으로 설정된 경우 덮어쓰지 않음
    // 루트 요소도 기존 position이 있으면 유지
    const hasExplicitPosition = baseStyle.position !== undefined;
    const positioningStyle: React.CSSProperties = hasExplicitPosition
      ? {} // 명시적 position이 있으면 덮어쓰지 않음
      : isRoot
        ? {
            position: 'relative',
            width: '100%',
          }
        : {
            position: 'relative',
          };
    
    // 도형 요소 감지: shape- ID로 시작하거나, position: absolute인 div with backgroundColor
    const hasShapeId = typeof node.props?.id === 'string' && node.props.id.startsWith('shape-');
    const isAbsoluteDiv = node.type === 'div' && baseStyle.position === 'absolute' && baseStyle.backgroundColor;
    const isShapeElement = hasShapeId || isAbsoluteDiv;
    
    // 디버그: div 요소이고 style이 있는 경우 로깅
    if (node.type === 'div' && node.props?.style) {
      console.log('[CanvasRenderer] DIV 요소:', {
        id: node.props?.id,
        hasShapeId,
        isAbsoluteDiv,
        isShapeElement,
        'baseStyle.position': baseStyle.position,
        'baseStyle.backgroundColor': baseStyle.backgroundColor,
        'node.props.style': node.props.style,
      });
    }
    
    if (isShapeElement) {
      console.log('[CanvasRenderer] 🎨 도형으로 인식됨:', {
        id: node.props?.id,
        type: node.type,
        baseStyle,
        hasExplicitPosition,
        children: node.children?.length || 0,
      });
    }

    const isSelected = selectedElementId === elementId;
    
    // padding 처리: 개별 방향이 전체 padding보다 우선
    const paddingStyle: React.CSSProperties = {};
    if (baseStyle.paddingTop || baseStyle.paddingBottom || baseStyle.paddingLeft || baseStyle.paddingRight) {
      // 개별 방향 padding이 있으면 그것만 사용
      if (baseStyle.paddingTop) paddingStyle.paddingTop = baseStyle.paddingTop;
      if (baseStyle.paddingBottom) paddingStyle.paddingBottom = baseStyle.paddingBottom;
      if (baseStyle.paddingLeft) paddingStyle.paddingLeft = baseStyle.paddingLeft;
      if (baseStyle.paddingRight) paddingStyle.paddingRight = baseStyle.paddingRight;
    } else if (baseStyle.padding) {
      // 전체 padding만 있으면 그것 사용
      paddingStyle.padding = baseStyle.padding;
    }
    
    // 도형 요소인 경우 원본 스타일 그대로 사용 (다른 스타일로 덮어쓰지 않음)
    const finalStyle: React.CSSProperties = isShapeElement
      ? {
          ...baseStyle,
          // 도형은 outline만 추가
          outline: isSelected ? '2px solid #007acc' : 'none',
          outlineOffset: '-2px',
          cursor: 'pointer',
        }
      : {
          ...baseStyle,
          ...positioningStyle,
          ...paddingStyle,
          // outline은 레이아웃에 영향을 주지 않음 (border 대신 사용)
          outline: isSelected ? '2px solid #007acc' : 'none',
          outlineOffset: '-2px', // 요소 안쪽으로 outline 표시
          // 편집 가능한 요소는 클릭 가능하도록 커서 변경
          cursor: 'pointer',
          overflow: 'visible',
          boxSizing: 'border-box',
        };

    // 텍스트 노드는 간단하게 렌더링
    if (node.type === 'text') {
      // 텍스트만 렌더링 (객체는 제외)
      let textContent = node.text || 
        (typeof node.props?.children === 'string' ? node.props.children : '') ||
        '';
      
      // JSX 표현식인 경우 편집 불가
      const isExpression = node.isExpression && node.expressionName;
      if (isExpression) {
        textContent = node.text || `{${node.expressionName}}`;
      }
      
      if (!textContent) return null;
      
      const isEditing = editingElementId === elementId;
      
      return (
        <span
          key={elementId}
          data-element-id={dataElementId}
          data-loc={dataLoc}
          style={{
            ...finalStyle,
            cursor: isEditing ? 'text' : 'pointer',
            minWidth: '20px',
            display: 'inline-block',
          }}
          onClick={(e) => {
            e.stopPropagation();
            if (!isEditing) {
              // 텍스트 노드에 loc 정보가 없으면 부모 요소 선택
              if (!dataLoc) {
                const parentEl = (e.currentTarget as HTMLElement).closest('[data-loc]');
                if (parentEl) {
                  const parentId = parentEl.getAttribute('data-element-id');
                  if (parentId) {
                    console.log('[CanvasRenderer] 텍스트 노드 클릭 → 부모 요소 선택:', parentId);
                    setSelectedElementId(parentId);
                    return;
                  }
                }
              }
              setSelectedElementId(elementId);
            }
          }}
          onDoubleClick={(e) => {
            if (isExpression) return; // 표현식은 편집 불가
            handleTextDoubleClick(e, elementId, e.currentTarget);
          }}
          onBlur={(e) => {
            if (isEditing && node.loc) {
              const newText = e.currentTarget.textContent || '';
              e.currentTarget.contentEditable = 'false';
              e.currentTarget.style.outline = isSelected ? '2px solid #007acc' : 'none';
              e.currentTarget.style.outlineOffset = '-2px';
              e.currentTarget.style.backgroundColor = '';
              e.currentTarget.style.cursor = 'pointer';
              handleTextEditComplete(elementId, newText, node.loc);
            }
          }}
          onKeyDown={(e) => {
            if (isEditing) {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                e.currentTarget.blur();
              } else if (e.key === 'Escape') {
                e.preventDefault();
                // 원래 텍스트로 복원
                e.currentTarget.textContent = textContent;
                e.currentTarget.blur();
                setEditingElementId(null);
              }
            }
          }}
          suppressContentEditableWarning={true}
        >
          {textContent}
        </span>
      );
    }

    // Fragment는 children만 렌더링 (스타일 없이)
    if (node.type === 'fragment') {
      return (
        <React.Fragment key={elementId}>
          {node.children?.map((child, idx) => (
            <React.Fragment key={idx}>{renderElement(child, depth + 1, false)}</React.Fragment>
          ))}
        </React.Fragment>
      );
    }

    // Void elements (자식 요소를 가질 수 없는 요소들, SVG 관련 요소 포함)
    const voidElements = ['input', 'img', 'br', 'hr', 'meta', 'link', 'area', 'base', 'col', 'embed', 'source', 'track', 'wbr', 'polygon', 'circle', 'rect', 'line', 'path', 'ellipse', 'polyline'];
    const isVoidElement = voidElements.includes(node.type);
    
    // 특수 요소들 (특별한 처리가 필요한 요소들)
    const specialElements = ['option', 'textarea', 'select'];
    const isSpecialElement = specialElements.includes(node.type);
    
    // 컴포넌트 이름 처리: 대문자로 시작하면 React 컴포넌트로 인식
    // motion.div 같은 경우는 이미 getJSXElementName에서 div로 변환됨
    const isReactComponent = /^[A-Z]/.test(node.type);
    
    // React 컴포넌트인 경우 div로 대체하여 렌더링 (외부 라이브러리 컴포넌트는 실제로 로드할 수 없으므로)
    const ElementTag = (isReactComponent ? 'div' : node.type) as keyof JSX.IntrinsicElements;
    
    // Void element는 자식 요소를 렌더링하지 않음
    if (isVoidElement) {
      // props에서 객체가 아닌 값만 전달
      const cleanProps: Record<string, any> = {};
      if (node.props) {
        Object.entries(node.props).forEach(([key, value]) => {
          // 객체가 아닌 값만 전달 (placeholder, type, value 등)
          if (typeof value !== 'object' || value === null || Array.isArray(value)) {
            cleanProps[key] = value;
          } else if (key === 'style' && typeof value === 'object') {
            // style은 이미 finalStyle에 포함됨
          }
        });
      }
      
      // 편집 가능한 요소인지 확인
      const isEditable = editableTags.includes(node.type.toLowerCase());
      
      return (
        <ElementTag
          key={elementId}
          data-element-id={dataElementId}
          data-loc={dataLoc}
          style={finalStyle}
          className={node.props?.className}
          onClick={(e) => {
            e.stopPropagation();
            console.log('Void 요소 클릭:', elementId, '타입:', node.type, '편집 가능:', isEditable);
            if (isEditable) {
              setSelectedElementId(elementId);
            }
          }}
          {...cleanProps}
        />
      );
    }
    
    // Option 요소는 자식 요소를 텍스트로만 렌더링
    if (isSpecialElement && node.type === 'option') {
      const optionText = node.children 
        ? node.children
            .map((child) => {
              if (child.type === 'text') return child.text || '';
              return '';
            })
            .join('')
        : '';
      
      return (
        <ElementTag
          key={elementId}
          data-element-id={dataElementId}
          data-loc={dataLoc}
          style={finalStyle}
          className={node.props?.className}
          value={node.props?.value || optionText}
          onClick={(e) => {
            e.stopPropagation();
            const isEditable = editableTags.includes(node.type.toLowerCase());
            console.log('Option 요소 클릭:', elementId, '타입:', node.type, '편집 가능:', isEditable);
            if (isEditable) {
              setSelectedElementId(elementId);
            }
          }}
        >
          {optionText}
        </ElementTag>
      );
    }
    
    // props에서 객체가 아닌 값만 전달
    const cleanProps: Record<string, any> = {};
    if (node.props) {
      Object.entries(node.props).forEach(([key, value]) => {
        // className과 style은 이미 처리됨
        if (key === 'className' || key === 'style' || key === '_spread') return;
        
        // shadcn/ui의 특수 prop 필터링
        if (key === 'asChild') return; // asChild는 DOM 요소에 전달하지 않음
        
        // 객체가 아닌 값만 전달 (문자열, 숫자, 불린, null만)
        if (value === null || value === undefined) {
          // null/undefined는 전달하지 않음
        } else if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
          cleanProps[key] = value;
        } else if (Array.isArray(value)) {
          // 배열은 전달하지 않음 (일반적으로 props로 사용되지 않음)
        } else if (typeof value === 'object') {
          // 객체는 전달하지 않음 (style 등은 이미 처리됨)
        }
      });
    }
    
    // Space 처리: space-y-* 또는 space-x-* 클래스 확인
    const spaceY = (tailwindStyles as any).__spaceY__;
    const spaceX = (tailwindStyles as any).__spaceX__;
    
    // 자식 요소도 Rnd 없이 렌더링 (드래그는 나중에 필요시 추가)
    const renderChildren = () => {
      if (!node.children || node.children.length === 0) {
        // 빈 요소 표시 (개발 모드에서만, void element가 아닌 경우만)
        if (!isVoidElement && node.type !== 'text' && node.type !== 'img') {
          return (
            <span style={{ 
              color: '#999', 
              fontSize: '11px',
              fontStyle: 'italic',
              opacity: 0.5
            }}>
              {node.props?.['data-slot'] ? `[${node.props['data-slot']}]` : ''}
            </span>
          );
        }
        return null;
      }

      return node.children
        .filter((child) => {
          // null이나 undefined 필터링
          if (!child) return false;
          // 객체가 아닌 경우 필터링
          if (typeof child !== 'object') return false;
          // ComponentNode 타입인지 확인
          if (!('type' in child)) {
            console.warn('유효하지 않은 자식 요소:', child);
            return false;
          }
          // option 내부의 span 등은 텍스트로 변환
          if (node.type === 'option' && child.type !== 'text') {
            return false;
          }
          return true;
        })
        .map((child, idx) => {
          try {
            // ComponentNode 타입 확인
            if (!('type' in child) || typeof child.type !== 'string') {
              console.warn('유효하지 않은 ComponentNode:', child);
              return null;
            }
            
            // space-y-* 또는 space-x-* 처리: 첫 번째 자식은 제외하고 마진 적용
            let childToRender = child as ComponentNode;
            if (idx > 0 && (spaceY || spaceX)) {
              // 첫 번째 자식이 아니면 마진 적용을 위해 새로운 객체 생성
              childToRender = {
                ...child,
                props: {
                  ...child.props,
                  style: {
                    ...(child.props?.style || {}),
                    ...(spaceY ? { marginTop: spaceY } : {}),
                    ...(spaceX ? { marginLeft: spaceX } : {}),
                  },
                },
              } as ComponentNode;
            }
            
            const rendered = renderElement(childToRender, depth + 1, false, [...path, idx]);
            // null이나 유효하지 않은 요소는 렌더링하지 않음
            if (!rendered) return null;
            return (
              <React.Fragment key={idx}>{rendered}</React.Fragment>
            );
          } catch (error) {
            console.warn('자식 요소 렌더링 실패:', child, error);
            return null;
          }
        })
        .filter(Boolean);
    };
    
    // 편집 가능한 요소인지 확인 (header, section 등)
    const isEditable = editableTags.includes(node.type.toLowerCase());
    
    // 텍스트 편집 가능한 요소인지 확인 (순수 텍스트만 포함하는 경우)
    const textEditableTags = ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span', 'button', 'a', 'label', 'li'];
    const isTextEditable = textEditableTags.includes(node.type.toLowerCase());
    
    // 자식이 순수 텍스트인지 확인
    const hasOnlyTextChildren = node.children?.every(child => 
      child.type === 'text' && !child.isExpression
    ) ?? false;
    
    const canEditText = isTextEditable && hasOnlyTextChildren && node.children && node.children.length > 0;
    const isEditing = editingElementId === elementId;
    
    // 도형 요소인 경우 최종 스타일 로깅
    if (isShapeElement) {
      console.log('[CanvasRenderer] 🎨 도형 최종 렌더링:', {
        id: node.props?.id,
        elementId,
        finalStyle,
        isEditable,
        ElementTag,
      });
    }
    
    return (
      <ElementTag
        key={elementId}
        data-element-id={dataElementId}
        data-loc={dataLoc}
        style={{
          ...finalStyle,
          cursor: isEditing ? 'text' : 'pointer',
        }}
        className={node.props?.className}
        onClick={(e) => {
          e.stopPropagation();
          if (!isEditing && isEditable) {
            setSelectedElementId(elementId);
          }
        }}
        onDoubleClick={(e) => {
          if (canEditText && node.loc) {
            e.stopPropagation();
            handleTextDoubleClick(e, elementId, e.currentTarget as HTMLElement);
          }
        }}
        onBlur={(e) => {
          if (isEditing && node.loc) {
            const target = e.currentTarget as HTMLElement;
            const newText = target.textContent || '';
            target.contentEditable = 'false';
            target.style.outline = isSelected ? '2px solid #007acc' : 'none';
            target.style.outlineOffset = '-2px';
            target.style.backgroundColor = '';
            target.style.cursor = 'pointer';
            handleTextEditComplete(elementId, newText, node.loc);
          }
        }}
        onKeyDown={(e) => {
          if (isEditing) {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              (e.currentTarget as HTMLElement).blur();
            } else if (e.key === 'Escape') {
              e.preventDefault();
              // 원래 텍스트로 복원
              const originalText = node.children
                ?.filter(child => child.type === 'text')
                .map(child => child.text || '')
                .join('') || '';
              e.currentTarget.textContent = originalText;
              (e.currentTarget as HTMLElement).blur();
              setEditingElementId(null);
            }
          }
        }}
        suppressContentEditableWarning={true}
        {...cleanProps}
      >
        {renderChildren()}
      </ElementTag>
    );
  };

  if (!componentTree) {
    return (
      <div className="canvas-renderer-error">
        <p>컴포넌트를 렌더링할 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef} 
      className="canvas-renderer-container"
      style={{
        width: '1440px',
        minWidth: '1440px',
        maxWidth: '1440px',
        flexShrink: 0,
        position: 'relative',
        cursor: drawingMode ? 'crosshair' : 'default',
      }}
      onMouseDown={drawingMode ? handleDrawingMouseDown : undefined}
      onMouseMove={drawingMode ? handleDrawingMouseMove : undefined}
      onMouseUp={drawingMode ? handleDrawingMouseUp : undefined}
      onMouseLeave={isDrawing ? handleDrawingMouseUp : undefined}
    >
      {/* React 렌더링 영역 */}
      <div 
        ref={reactRootRef}
        id="react-root"
        style={{
          position: 'relative',
          width: '100%',
          minHeight: '100%',
          pointerEvents: drawingMode ? 'none' : 'auto',
        }}
      >
        {renderElement(componentTree, 0, true, [])}
      </div>
      
      {/* 편집용 Overlay (Ghost Box) */}
      <div
        ref={overlayRef}
        id="edit-overlay"
        className="edit-overlay"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 1000,
        }}
      />
      
      {/* 도형 그리기 프리뷰 */}
      <div
        ref={drawingOverlayRef}
        className="drawing-overlay"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 1001,
        }}
      >
        {renderDrawingPreview()}
      </div>
      
      {/* 그리기 모드 안내 메시지 */}
      {drawingMode && !isDrawing && (
        <div className="drawing-mode-hint">
          <span>{drawingMode === 'textbox' ? '📝' : '🎨'} {getShapeDisplayName(drawingMode)} 모드</span>
          <span className="hint-text">
            {drawingMode === 'textbox' 
              ? '캔버스에서 클릭하여 텍스트를 추가하세요' 
              : '캔버스에서 드래그하여 도형을 그리세요'}
          </span>
          <button 
            className="cancel-drawing-btn"
            onClick={() => setDrawingMode(null)}
          >
            취소 (ESC)
          </button>
        </div>
      )}
      
      {/* 컨텍스트 메뉴 - Portal을 사용하여 body에 직접 렌더링 */}
      {contextMenu.visible && createPortal(
        <div
          className="context-menu"
          style={{
            position: 'fixed',
            left: contextMenu.x,
            top: contextMenu.y,
            zIndex: 99999,
          }}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="context-menu-item context-menu-item-delete"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              console.log('[CanvasRenderer] 컨텍스트 메뉴 삭제 버튼 클릭');
              handleDeleteSelectedElement();
              handleCloseContextMenu();
            }}
          >
            <span className="context-menu-icon">🗑️</span>
            <span>삭제</span>
            <span className="context-menu-shortcut">Delete</span>
          </button>
        </div>,
        document.body
      )}
    </div>
  );
}

// 도형/텍스트박스 이름 한글 변환
function getShapeDisplayName(drawingMode: DrawingModeType): string {
  const names: Record<string, string> = {
    rectangle: '사각형',
    roundedRectangle: '둥근 사각형',
    parallelogram: '평행사변형',
    circle: '원',
    ellipse: '타원',
    triangle: '삼각형',
    diamond: '다이아몬드',
    star: '별',
    pentagon: '오각형',
    hexagon: '육각형',
    textbox: '텍스트 박스',
  };
  return names[drawingMode || ''] || '요소';
}
