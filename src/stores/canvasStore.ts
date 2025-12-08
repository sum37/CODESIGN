import { create } from 'zustand';

interface ElementPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

// 도형 그리기 모드 상태
export type ShapeType = 'rectangle' | 'roundedRectangle' | 'parallelogram' | 'circle' | 'ellipse' | 'triangle' | 'diamond' | 'star' | 'pentagon' | 'hexagon' | null;

interface CanvasState {
  selectedElementId: string | null;
  setSelectedElementId: (id: string | null) => void;
  elementPositions: Record<string, ElementPosition>;
  updateElementPosition: (id: string, position: Partial<ElementPosition>) => void;
  
  // 도형 그리기 모드 상태
  drawingMode: ShapeType;
  setDrawingMode: (mode: ShapeType) => void;
  isDrawing: boolean;
  setIsDrawing: (drawing: boolean) => void;
  drawStartPosition: { x: number; y: number } | null;
  setDrawStartPosition: (position: { x: number; y: number } | null) => void;
  drawCurrentPosition: { x: number; y: number } | null;
  setDrawCurrentPosition: (position: { x: number; y: number } | null) => void;
}

export const useCanvasStore = create<CanvasState>((set) => ({
  selectedElementId: null,
  setSelectedElementId: (id) => set({ selectedElementId: id }),
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
}));

