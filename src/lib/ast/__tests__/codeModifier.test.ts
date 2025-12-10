import { describe, it, expect } from 'vitest';
import { updateElementInCode, updateSvgFillColor, updateSvgStroke } from '../codeModifier';
import { SourceLocation } from '../componentParser';

describe('codeModifier', () => {
  describe('updateElementInCode', () => {
    it('should update element position', () => {
      const code = `<div id="test" style={{ position: 'absolute', left: '10px', top: '20px' }}>Test</div>`;
      const loc: SourceLocation = {
        start: { line: 1, column: 0 },
        end: { line: 1, column: 80 },
      };
      
      const result = updateElementInCode(
        code,
        'test',
        { position: { x: 100, y: 200 } },
        loc
      );
      
      expect(result).toContain('left: "100px"');
      expect(result).toContain('top: "200px"');
    });

    it('should update element size', () => {
      const code = `<div id="test" style={{ width: '50px', height: '60px' }}>Test</div>`;
      const loc: SourceLocation = {
        start: { line: 1, column: 0 },
        end: { line: 1, column: 70 },
      };
      
      const result = updateElementInCode(
        code,
        'test',
        { size: { width: 200, height: 300 } },
        loc
      );
      
      expect(result).toContain('width: "200px"');
      expect(result).toContain('height: "300px"');
    });

    it('should update element style', () => {
      const code = `<div id="test" style={{ backgroundColor: 'red' }}>Test</div>`;
      const loc: SourceLocation = {
        start: { line: 1, column: 0 },
        end: { line: 1, column: 60 },
      };
      
      const result = updateElementInCode(
        code,
        'test',
        { style: { backgroundColor: 'blue', color: 'white' } },
        loc
      );
      
      expect(result).toContain('backgroundColor: "blue"');
      expect(result).toContain('color: "white"');
    });

    it('should preserve existing styles when updating', () => {
      const code = `<div id="test" style={{ backgroundColor: 'red', zIndex: 10 }}>Test</div>`;
      const loc: SourceLocation = {
        start: { line: 1, column: 0 },
        end: { line: 1, column: 75 },
      };
      
      const result = updateElementInCode(
        code,
        'test',
        { style: { color: 'white' } },
        loc
      );
      
      expect(result).toContain('backgroundColor: "red"');
      expect(result).toContain('zIndex: 10');
      expect(result).toContain('color: "white"');
    });

    it('should handle boxShadow updates', () => {
      const code = `<div id="test" style={{}}>Test</div>`;
      const loc: SourceLocation = {
        start: { line: 1, column: 0 },
        end: { line: 1, column: 30 },
      };
      
      const result = updateElementInCode(
        code,
        'test',
        { style: { boxShadow: '5px 5px 10px rgba(0,0,0,0.3)' } },
        loc
      );
      
      expect(result).toContain('boxShadow: "5px 5px 10px rgba(0,0,0,0.3)"');
    });

    it('should handle opacity updates', () => {
      const code = `<div id="test" style={{}}>Test</div>`;
      const loc: SourceLocation = {
        start: { line: 1, column: 0 },
        end: { line: 1, column: 30 },
      };
      
      const result = updateElementInCode(
        code,
        'test',
        { style: { opacity: '0.5' } },
        loc
      );
      
      expect(result).toContain('opacity: "0.5"');
    });

    it('should return original code if location is invalid', () => {
      const code = `<div>Test</div>`;
      const invalidLoc: SourceLocation = {
        start: { line: 100, column: 0 },
        end: { line: 100, column: 20 },
      };
      
      const result = updateElementInCode(
        code,
        'test',
        { position: { x: 100, y: 200 } },
        invalidLoc
      );
      
      expect(result).toBe(code);
    });
  });

  describe('updateSvgFillColor', () => {
    it('should update SVG fill color', () => {
      const code = `<svg><circle fill="red" /></svg>`;
      const loc: SourceLocation = {
        start: { line: 1, column: 0 },
        end: { line: 1, column: 35 },
      };
      
      const result = updateSvgFillColor(code, loc, 'blue');
      
      expect(result).toContain('fill="blue"');
      expect(result).not.toContain('fill="red"');
    });

    it('should return original code if fill attribute is not present', () => {
      // 함수는 fill 속성이 없으면 원본 코드를 반환합니다
      const code = `<svg><circle /></svg>`;
      const loc: SourceLocation = {
        start: { line: 1, column: 0 },
        end: { line: 1, column: 25 },
      };
      
      const result = updateSvgFillColor(code, loc, 'green');
      
      // fill 속성이 없으면 원본 코드 반환
      expect(result).toBe(code);
    });
  });

  describe('updateSvgStroke', () => {
    it('should update SVG stroke', () => {
      const code = `<svg><circle stroke="black" stroke-width="2" /></svg>`;
      const loc: SourceLocation = {
        start: { line: 1, column: 0 },
        end: { line: 1, column: 50 },
      };
      
      const result = updateSvgStroke(code, loc, 'blue', 5);
      
      expect(result).toContain('stroke="blue"');
      expect(result).toContain('stroke-width="5"');
    });

    it('should add stroke attributes when fill is present', () => {
      // fill 속성이 있으면 stroke를 추가할 수 있습니다
      const code = `<svg><circle fill="red" /></svg>`;
      const loc: SourceLocation = {
        start: { line: 1, column: 0 },
        end: { line: 1, column: 35 },
      };
      
      const result = updateSvgStroke(code, loc, 'blue', 3);
      
      expect(result).toContain('stroke="blue"');
      expect(result).toContain('stroke-width="3"');
    });

    it('should return original code when stroke cannot be added', () => {
      // fill 속성이 없고 stroke도 없으면 원본 코드 반환
      const code = `<svg><circle /></svg>`;
      const loc: SourceLocation = {
        start: { line: 1, column: 0 },
        end: { line: 1, column: 25 },
      };
      
      const result = updateSvgStroke(code, loc, 'red', 3);
      
      // fill이 없으면 stroke를 추가할 수 없으므로 원본 코드 반환
      expect(result).toBe(code);
    });

    it('should remove stroke when strokeWidth is 0', () => {
      const code = `<svg><circle stroke="black" stroke-width="2" /></svg>`;
      const loc: SourceLocation = {
        start: { line: 1, column: 0 },
        end: { line: 1, column: 50 },
      };
      
      const result = updateSvgStroke(code, loc, 'black', 0);
      
      expect(result).not.toContain('stroke="black"');
      expect(result).not.toContain('stroke-width');
    });
  });
});

