import { useCallback } from 'react';
import { useCanvasStore } from '../stores/canvasStore';
import { parseComponent } from '../lib/ast/componentParser';

/**
 * Code → Canvas 동기화 Hook
 * Monaco Editor에서 코드가 변경되면 Canvas를 업데이트
 */
export function useCodeSync() {
  const { updateElementPosition, elementPositions } = useCanvasStore();

  const syncCodeToCanvas = useCallback((code: string) => {
    try {
      const componentTree = parseComponent(code);
      
      // 파싱된 컴포넌트 트리를 기반으로 Canvas 요소 위치 업데이트
      if (componentTree) {
        // 재귀적으로 모든 요소의 위치 업데이트
        const updateElementPositions = (node: typeof componentTree, parentId?: string) => {
          const elementId = node.id || parentId || `element-${Math.random()}`;
          
          // 스타일에서 위치 정보 추출
          const style = node.props?.style;
          if (style) {
            const x = parseStyleValue(style.left) ?? elementPositions[elementId]?.x ?? 0;
            const y = parseStyleValue(style.top) ?? elementPositions[elementId]?.y ?? 0;
            const width = parseStyleValue(style.width) ?? elementPositions[elementId]?.width ?? 200;
            const height = parseStyleValue(style.height) ?? elementPositions[elementId]?.height ?? 100;
            
            updateElementPosition(elementId, { x, y, width, height });
          }
          
          // 자식 요소들도 업데이트
          if (node.children) {
            node.children.forEach((child) => {
              updateElementPositions(child, elementId);
            });
          }
        };
        
        updateElementPositions(componentTree);
      }
      
      // Canvas 컴포넌트에 코드 업데이트 알림
      window.dispatchEvent(new CustomEvent('code-updated', { detail: code }));
    } catch (error) {
      console.error('Code → Canvas 동기화 실패:', error);
    }
  }, [updateElementPosition, elementPositions]);

  return { syncCodeToCanvas };
}

function parseStyleValue(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const match = value.match(/(\d+)px/);
  return match ? parseInt(match[1], 10) : undefined;
}

