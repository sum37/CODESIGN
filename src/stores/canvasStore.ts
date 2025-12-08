import { create } from 'zustand';
import { Shape } from '../lib/shapes/shapeGenerator';

interface ElementPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface CanvasState {
  selectedElementId: string | null;
  setSelectedElementId: (id: string | null) => void;
  elementPositions: Record<string, ElementPosition>;
  updateElementPosition: (id: string, position: Partial<ElementPosition>) => void;
  // 파일별 도형 관리
  shapesByFile: Record<string, Shape[]>;
  addShapeToFile: (filePath: string, shape: Shape) => void;
  removeShapeFromFile: (filePath: string, shapeId: string) => void;
  updateShapeInFile: (filePath: string, shapeId: string, updates: Partial<Shape>) => void;
  getShapesForFile: (filePath: string) => Shape[];
  clearShapesForFile: (filePath: string) => void;
}

export const useCanvasStore = create<CanvasState>((set, get) => ({
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
  // 파일별 도형 관리
  shapesByFile: {},
  addShapeToFile: (filePath, shape) =>
    set((state) => ({
      shapesByFile: {
        ...state.shapesByFile,
        [filePath]: [...(state.shapesByFile[filePath] || []), shape],
      },
    })),
  removeShapeFromFile: (filePath, shapeId) =>
    set((state) => ({
      shapesByFile: {
        ...state.shapesByFile,
        [filePath]: (state.shapesByFile[filePath] || []).filter((s) => s.id !== shapeId),
      },
    })),
  updateShapeInFile: (filePath, shapeId, updates) =>
    set((state) => ({
      shapesByFile: {
        ...state.shapesByFile,
        [filePath]: (state.shapesByFile[filePath] || []).map((s) =>
          s.id === shapeId ? { ...s, ...updates } : s
        ),
      },
    })),
  getShapesForFile: (filePath) => {
    return get().shapesByFile[filePath] || [];
  },
  clearShapesForFile: (filePath) =>
    set((state) => {
      const newShapesByFile = { ...state.shapesByFile };
      delete newShapesByFile[filePath];
      return { shapesByFile: newShapesByFile };
    }),
}));

