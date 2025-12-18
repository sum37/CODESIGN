import { describe, it, expect, beforeEach } from 'vitest';
import { useCanvasStore } from '../canvasStore';

describe('canvasStore', () => {
  beforeEach(() => {
    // Store 초기화
    useCanvasStore.setState({
      selectedElementId: null,
      selectedElementLoc: null,
      selectedElementType: null,
      selectedElementHasBorderRadius: false,
      selectedElementBorderRadius: 0,
      selectedElementSize: { width: 0, height: 0 },
      elementPositions: {},
      drawingMode: null,
      isDrawing: false,
      drawStartPosition: null,
      drawCurrentPosition: null,
      nextZIndex: 100,
      elementLocks: {},
    });
  });

  describe('selectedElementId', () => {
    it('should set and get selected element ID', () => {
      const { setSelectedElementId, selectedElementId } = useCanvasStore.getState();
      
      expect(selectedElementId).toBeNull();
      
      setSelectedElementId('element-1');
      expect(useCanvasStore.getState().selectedElementId).toBe('element-1');
      
      setSelectedElementId(null);
      expect(useCanvasStore.getState().selectedElementId).toBeNull();
    });
  });

  describe('elementPositions', () => {
    it('should update element position', () => {
      const { updateElementPosition } = useCanvasStore.getState();
      
      updateElementPosition('element-1', { x: 100, y: 200 });
      
      const positions = useCanvasStore.getState().elementPositions;
      expect(positions['element-1']).toEqual({ x: 100, y: 200 });
    });

    it('should update partial position', () => {
      const { updateElementPosition } = useCanvasStore.getState();
      
      updateElementPosition('element-1', { x: 100, y: 200, width: 50, height: 60 });
      updateElementPosition('element-1', { x: 150 });
      
      const positions = useCanvasStore.getState().elementPositions;
      expect(positions['element-1']).toEqual({ x: 150, y: 200, width: 50, height: 60 });
    });
  });

  describe('getNextZIndex', () => {
    it('should return incrementing z-index values', () => {
      const { getNextZIndex } = useCanvasStore.getState();
      
      const z1 = getNextZIndex();
      const z2 = getNextZIndex();
      const z3 = getNextZIndex();
      
      expect(z1).toBe(100);
      expect(z2).toBe(101);
      expect(z3).toBe(102);
    });
  });

  describe('elementLocks', () => {
    it('should set and get element lock status', () => {
      const { setElementLock, isElementLocked } = useCanvasStore.getState();
      
      expect(isElementLocked('element-1')).toBe(false);
      
      setElementLock('element-1', true);
      expect(isElementLocked('element-1')).toBe(true);
      
      setElementLock('element-1', false);
      expect(isElementLocked('element-1')).toBe(false);
    });

    it('should handle multiple locked elements', () => {
      const { setElementLock, isElementLocked } = useCanvasStore.getState();
      
      setElementLock('element-1', true);
      setElementLock('element-2', true);
      setElementLock('element-3', false);
      
      expect(isElementLocked('element-1')).toBe(true);
      expect(isElementLocked('element-2')).toBe(true);
      expect(isElementLocked('element-3')).toBe(false);
    });
  });

  describe('drawingMode', () => {
    it('should set and get drawing mode', () => {
      const { setDrawingMode, drawingMode } = useCanvasStore.getState();
      
      expect(drawingMode).toBeNull();
      
      setDrawingMode('rectangle');
      expect(useCanvasStore.getState().drawingMode).toBe('rectangle');
      
      setDrawingMode(null);
      expect(useCanvasStore.getState().drawingMode).toBeNull();
    });

    it('should set various shape types', () => {
      const { setDrawingMode } = useCanvasStore.getState();
      
      setDrawingMode('circle');
      expect(useCanvasStore.getState().drawingMode).toBe('circle');
      
      setDrawingMode('triangle');
      expect(useCanvasStore.getState().drawingMode).toBe('triangle');
      
      setDrawingMode('textbox');
      expect(useCanvasStore.getState().drawingMode).toBe('textbox');
      
      setDrawingMode('ellipse');
      expect(useCanvasStore.getState().drawingMode).toBe('ellipse');
      
      setDrawingMode('star');
      expect(useCanvasStore.getState().drawingMode).toBe('star');
    });
  });

  describe('selectedElementSize', () => {
    it('should set and get selected element size', () => {
      const { setSelectedElementSize, selectedElementSize } = useCanvasStore.getState();
      
      expect(selectedElementSize).toEqual({ width: 0, height: 0 });
      
      setSelectedElementSize({ width: 200, height: 300 });
      expect(useCanvasStore.getState().selectedElementSize).toEqual({ width: 200, height: 300 });
    });
  });

  describe('selectedElementLoc', () => {
    it('should set and get selected element location', () => {
      const { setSelectedElementLoc } = useCanvasStore.getState();
      
      expect(useCanvasStore.getState().selectedElementLoc).toBeNull();
      
      const loc = {
        start: { line: 1, column: 0 },
        end: { line: 1, column: 50 },
      };
      
      setSelectedElementLoc(loc);
      expect(useCanvasStore.getState().selectedElementLoc).toEqual(loc);
      
      setSelectedElementLoc(null);
      expect(useCanvasStore.getState().selectedElementLoc).toBeNull();
    });
  });

  describe('selectedElementType', () => {
    it('should set and get selected element type', () => {
      const { setSelectedElementType } = useCanvasStore.getState();
      
      expect(useCanvasStore.getState().selectedElementType).toBeNull();
      
      setSelectedElementType('div');
      expect(useCanvasStore.getState().selectedElementType).toBe('div');
      
      setSelectedElementType('svg');
      expect(useCanvasStore.getState().selectedElementType).toBe('svg');
      
      setSelectedElementType(null);
      expect(useCanvasStore.getState().selectedElementType).toBeNull();
    });
  });

  describe('selectedElementHasBorderRadius', () => {
    it('should set and get border radius flag', () => {
      const { setSelectedElementHasBorderRadius } = useCanvasStore.getState();
      
      expect(useCanvasStore.getState().selectedElementHasBorderRadius).toBe(false);
      
      setSelectedElementHasBorderRadius(true);
      expect(useCanvasStore.getState().selectedElementHasBorderRadius).toBe(true);
      
      setSelectedElementHasBorderRadius(false);
      expect(useCanvasStore.getState().selectedElementHasBorderRadius).toBe(false);
    });
  });

  describe('selectedElementBorderRadius', () => {
    it('should set and get border radius value', () => {
      const { setSelectedElementBorderRadius } = useCanvasStore.getState();
      
      expect(useCanvasStore.getState().selectedElementBorderRadius).toBe(0);
      
      setSelectedElementBorderRadius(10);
      expect(useCanvasStore.getState().selectedElementBorderRadius).toBe(10);
      
      setSelectedElementBorderRadius(25);
      expect(useCanvasStore.getState().selectedElementBorderRadius).toBe(25);
    });
  });

  describe('isDrawing', () => {
    it('should set and get drawing state', () => {
      const { setIsDrawing } = useCanvasStore.getState();
      
      expect(useCanvasStore.getState().isDrawing).toBe(false);
      
      setIsDrawing(true);
      expect(useCanvasStore.getState().isDrawing).toBe(true);
      
      setIsDrawing(false);
      expect(useCanvasStore.getState().isDrawing).toBe(false);
    });
  });

  describe('drawStartPosition', () => {
    it('should set and get draw start position', () => {
      const { setDrawStartPosition } = useCanvasStore.getState();
      
      expect(useCanvasStore.getState().drawStartPosition).toBeNull();
      
      setDrawStartPosition({ x: 100, y: 200 });
      expect(useCanvasStore.getState().drawStartPosition).toEqual({ x: 100, y: 200 });
      
      setDrawStartPosition(null);
      expect(useCanvasStore.getState().drawStartPosition).toBeNull();
    });
  });

  describe('drawCurrentPosition', () => {
    it('should set and get draw current position', () => {
      const { setDrawCurrentPosition } = useCanvasStore.getState();
      
      expect(useCanvasStore.getState().drawCurrentPosition).toBeNull();
      
      setDrawCurrentPosition({ x: 150, y: 250 });
      expect(useCanvasStore.getState().drawCurrentPosition).toEqual({ x: 150, y: 250 });
      
      setDrawCurrentPosition(null);
      expect(useCanvasStore.getState().drawCurrentPosition).toBeNull();
    });
  });

  describe('drawing workflow', () => {
    it('should handle complete drawing workflow', () => {
      const store = useCanvasStore.getState();
      
      // 1. 그리기 모드 설정
      store.setDrawingMode('rectangle');
      expect(useCanvasStore.getState().drawingMode).toBe('rectangle');
      
      // 2. 그리기 시작
      store.setIsDrawing(true);
      store.setDrawStartPosition({ x: 0, y: 0 });
      expect(useCanvasStore.getState().isDrawing).toBe(true);
      expect(useCanvasStore.getState().drawStartPosition).toEqual({ x: 0, y: 0 });
      
      // 3. 그리기 중
      store.setDrawCurrentPosition({ x: 100, y: 100 });
      expect(useCanvasStore.getState().drawCurrentPosition).toEqual({ x: 100, y: 100 });
      
      // 4. 그리기 완료
      store.setIsDrawing(false);
      store.setDrawingMode(null);
      store.setDrawStartPosition(null);
      store.setDrawCurrentPosition(null);
      
      expect(useCanvasStore.getState().isDrawing).toBe(false);
      expect(useCanvasStore.getState().drawingMode).toBeNull();
    });
  });
});

