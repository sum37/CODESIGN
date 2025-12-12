import { create } from 'zustand';

interface ElementPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

// 도형 그리기 모드 상태
export type ShapeType = 'rectangle' | 'roundedRectangle' | 'parallelogram' | 'circle' | 'ellipse' | 'triangle' | 'diamond' | 'star' | 'pentagon' | 'hexagon' | null;

// 그리기 모드 타입 (도형 또는 텍스트박스)
export type DrawingModeType = ShapeType | 'textbox';

// 선택된 요소의 AST 위치 정보
export interface SourceLocation {
  start: { line: number; column: number };
  end: { line: number; column: number };
}

interface CanvasState {
  selectedElementId: string | null;
  setSelectedElementId: (id: string | null) => void;
  selectedElementLoc: SourceLocation | null;
  setSelectedElementLoc: (loc: SourceLocation | null) => void;
  selectedElementType: string | null; // 선택된 요소의 타입 (div, svg, p 등)
  setSelectedElementType: (type: string | null) => void;
  selectedElementHasBorderRadius: boolean; // 선택된 요소가 borderRadius를 가지고 있는지
  setSelectedElementHasBorderRadius: (has: boolean) => void;
  selectedElementBorderRadius: number; // 선택된 요소의 borderRadius 값
  setSelectedElementBorderRadius: (radius: number) => void;
  selectedElementSize: { width: number; height: number }; // 선택된 요소의 크기
  setSelectedElementSize: (size: { width: number; height: number }) => void;
  elementPositions: Record<string, ElementPosition>;
  updateElementPosition: (id: string, position: Partial<ElementPosition>) => void;
  
  // 도형 그리기 모드 상태
  drawingMode: DrawingModeType;
  setDrawingMode: (mode: DrawingModeType) => void;
  isDrawing: boolean;
  setIsDrawing: (drawing: boolean) => void;
  drawStartPosition: { x: number; y: number } | null;
  setDrawStartPosition: (position: { x: number; y: number } | null) => void;
  drawCurrentPosition: { x: number; y: number } | null;
  setDrawCurrentPosition: (position: { x: number; y: number } | null) => void;
  
  // z-index 관리 (도형, 텍스트박스 통합)
  nextZIndex: number;
  getNextZIndex: () => number;
  
  // 요소별 잠금 상태 관리
  elementLocks: Record<string, boolean>;
  setElementLock: (elementId: string, locked: boolean) => void;
  isElementLocked: (elementId: string) => boolean;
}

export const useCanvasStore = create<CanvasState>((set, get) => ({
  selectedElementId: null,
  setSelectedElementId: (id) => set({ selectedElementId: id }),
  selectedElementLoc: null,
  setSelectedElementLoc: (loc) => set({ selectedElementLoc: loc }),
  selectedElementType: null,
  setSelectedElementType: (type) => set({ selectedElementType: type }),
  selectedElementHasBorderRadius: false,
  setSelectedElementHasBorderRadius: (has) => set({ selectedElementHasBorderRadius: has }),
  selectedElementBorderRadius: 0,
  setSelectedElementBorderRadius: (radius) => set({ selectedElementBorderRadius: radius }),
  selectedElementSize: { width: 0, height: 0 },
  setSelectedElementSize: (size) => set({ selectedElementSize: size }),
  elementPositions: {},
  updateElementPosition: (id, position) =>
    set((state) => ({
      elementPositions: {
        ...state.elementPositions,
        [id]: {
          ...state.elementPositions[id],
          ...position,
        },
      },
    })),
  
  // 도형 그리기 모드 상태
  drawingMode: null,
  setDrawingMode: (mode) => set({ drawingMode: mode }),
  isDrawing: false,
  setIsDrawing: (drawing) => set({ isDrawing: drawing }),
  drawStartPosition: null,
  setDrawStartPosition: (position) => set({ drawStartPosition: position }),
  drawCurrentPosition: null,
  setDrawCurrentPosition: (position) => set({ drawCurrentPosition: position }),
  
  // z-index 관리 (도형, 텍스트박스 통합) - 100부터 시작
  nextZIndex: 100,
  getNextZIndex: () => {
    let currentZIndex = 100;
    set((state) => {
      currentZIndex = state.nextZIndex;
      return { nextZIndex: state.nextZIndex + 1 };
    });
    return currentZIndex;
  },
  
  // 요소별 잠금 상태 관리
  elementLocks: {},
  setElementLock: (elementId, locked) =>
    set((state) => ({
      elementLocks: {
        ...state.elementLocks,
        [elementId]: locked,
      },
    })),
  isElementLocked: (elementId: string): boolean => {
    const state = get();
    return state.elementLocks[elementId] || false;
  },
}));

