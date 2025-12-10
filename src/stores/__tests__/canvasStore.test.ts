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
  });

  describe('selectedElementSize', () => {
    it('should set and get selected element size', () => {
      const { setSelectedElementSize, selectedElementSize } = useCanvasStore.getState();
      
      expect(selectedElementSize).toEqual({ width: 0, height: 0 });
      
      setSelectedElementSize({ width: 200, height: 300 });
      expect(useCanvasStore.getState().selectedElementSize).toEqual({ width: 200, height: 300 });
    });
  });
});

