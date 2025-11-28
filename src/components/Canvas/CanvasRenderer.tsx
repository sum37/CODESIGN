import React, { useEffect, useRef, useState } from 'react';
import { Rnd } from 'react-rnd';
import { parseComponent, ComponentNode } from '../../lib/ast/componentParser';
import { updateElementInCode } from '../../lib/ast/codeModifier';
import { parseTailwindClasses } from '../../lib/utils/tailwindParser';
import { parseImports, loadImportedComponent } from '../../lib/ast/importResolver';
import { useCanvasStore } from '../../stores/canvasStore';
import { useProjectStore } from '../../stores/projectStore';
import './CanvasRenderer.css';

interface CanvasRendererProps {
  code: string;
  onCodeChange: (updatedCode: string) => void;
}

export function CanvasRenderer({ code, onCodeChange }: CanvasRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [componentTree, setComponentTree] = useState<ComponentNode | null>(null);
  const { selectedFile } = useProjectStore();
  const { selectedElementId, setSelectedElementId, elementPositions, updateElementPosition } = useCanvasStore();

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
      }
    };
    
    parseWithImports();
  }, [code, selectedFile]);

  const handleDragStop = (elementId: string, x: number, y: number) => {
    updateElementPosition(elementId, { x, y });
    const updatedCode = updateElementInCode(code, elementId, {
      position: { x, y },
    });
    onCodeChange(updatedCode);
  };

  const handleResizeStop = (elementId: string, width: number, height: number) => {
    updateElementPosition(elementId, { width, height });
    const updatedCode = updateElementInCode(code, elementId, {
      size: { width, height },
    });
    onCodeChange(updatedCode);
  };

  const renderElement = (node: ComponentNode, depth: number = 0, isRoot: boolean = false): JSX.Element | null => {
    if (!node) return null;

    if (depth > 20) {
      return <div>깊이 제한 초과</div>;
    }

    const elementId = node.id || `element-${depth}-${Date.now()}-${Math.random()}`;
    const position = elementPositions[elementId];
    
    // Tailwind CSS 클래스 파싱
    const tailwindStyles = node.props?.className 
      ? parseTailwindClasses(node.props.className)
      : {};
    
    // 기존 스타일과 병합
    const baseStyle: React.CSSProperties = {
      ...tailwindStyles,
      ...(node.props?.style || {}),
    };

    // 루트 요소는 relative positioning, 자식은 relative (레이아웃 유지)
    const positioningStyle: React.CSSProperties = isRoot
      ? {
          position: 'relative',
          width: '100%',
        }
      : {
          position: 'relative',
        };

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
    
    const finalStyle: React.CSSProperties = {
      ...baseStyle,
      ...positioningStyle,
      ...paddingStyle,
      // border는 선택 시에만 표시
      border: isSelected ? '2px solid #007acc' : 'none',
      outline: isSelected ? 'none' : 'none',
      cursor: 'default',
      overflow: 'visible',
      boxSizing: 'border-box',
    };

    // 텍스트 노드는 간단하게 렌더링
    if (node.type === 'text') {
      // 텍스트만 렌더링 (객체는 제외)
      let textContent = node.text || 
        (typeof node.props?.children === 'string' ? node.props.children : '') ||
        '';
      
      // JSX 표현식인 경우 props에서 값을 찾기
      if (node.isExpression && node.expressionName) {
        // 부모 컴포넌트의 props에서 값을 찾기
        // 현재는 간단히 표현식 텍스트를 표시
        textContent = node.text || `{${node.expressionName}}`;
      }
      
      if (!textContent) return null;
      
      return (
        <span
          key={elementId}
          style={finalStyle}
          onClick={() => setSelectedElementId(elementId)}
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

    // Void elements (자식 요소를 가질 수 없는 요소들)
    const voidElements = ['input', 'img', 'br', 'hr', 'meta', 'link', 'area', 'base', 'col', 'embed', 'source', 'track', 'wbr'];
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
      
      return (
        <ElementTag
          key={elementId}
          style={finalStyle}
          className={node.props?.className}
          onClick={() => setSelectedElementId(elementId)}
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
          style={finalStyle}
          className={node.props?.className}
          value={node.props?.value || optionText}
          onClick={() => setSelectedElementId(elementId)}
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
            
            const rendered = renderElement(childToRender, depth + 1, false);
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
    
    return (
      <ElementTag
        key={elementId}
        style={finalStyle}
        className={node.props?.className}
        onClick={() => setSelectedElementId(elementId)}
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
      }}
    >
      {renderElement(componentTree, 0, true)}
    </div>
  );
}
