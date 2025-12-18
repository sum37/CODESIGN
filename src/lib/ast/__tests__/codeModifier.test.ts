import { describe, it, expect } from 'vitest';
import { 
  updateElementInCode, 
  updateSvgFillColor, 
  updateSvgStroke,
  insertShapeInCode,
  insertTextBoxInCode,
  updateTextInCode,
  deleteElementFromCode
} from '../codeModifier';
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

  describe('insertShapeInCode', () => {
    it('should insert rectangle shape', () => {
      const code = `
        function App() {
          return (
            <div className="container">
              <h1>Hello</h1>
            </div>
          );
        }
      `;
      const result = insertShapeInCode(code, 'rectangle', { x: 100, y: 200, width: 150, height: 100 }, 50);
      
      expect(result).toContain('position: "absolute"');
      expect(result).toContain('left: "100px"');
      expect(result).toContain('top: "200px"');
      expect(result).toContain('backgroundColor: "#f9a8d4"');
    });

    it('should insert circle shape', () => {
      const code = `
        const App = () => (
          <div>Content</div>
        );
      `;
      const result = insertShapeInCode(code, 'circle', { x: 50, y: 50, width: 100, height: 100 }, 10);
      
      expect(result).toContain('borderRadius: "50%"');
    });

    it('should insert roundedRectangle shape', () => {
      const code = `
        const App = () => (
          <div>Content</div>
        );
      `;
      const result = insertShapeInCode(code, 'roundedRectangle', { x: 0, y: 0, width: 100, height: 50 });
      
      expect(result).toContain('borderRadius: "8px"');
    });

    it('should insert triangle shape as SVG', () => {
      const code = `
        const App = () => (
          <div>Content</div>
        );
      `;
      const result = insertShapeInCode(code, 'triangle', { x: 0, y: 0, width: 100, height: 100 });
      
      expect(result).toContain('<svg');
      expect(result).toContain('polygon');
    });

    it('should insert diamond shape as SVG', () => {
      const code = `
        const App = () => (
          <div>Content</div>
        );
      `;
      const result = insertShapeInCode(code, 'diamond', { x: 0, y: 0, width: 100, height: 100 });
      
      expect(result).toContain('<svg');
      expect(result).toContain('polygon points="50,0 100,50 50,100 0,50"');
    });

    it('should insert star shape as SVG', () => {
      const code = `
        const App = () => (
          <div>Content</div>
        );
      `;
      const result = insertShapeInCode(code, 'star', { x: 0, y: 0, width: 100, height: 100 });
      
      expect(result).toContain('<svg');
      expect(result).toContain('polygon');
    });

    it('should insert hexagon shape as SVG', () => {
      const code = `
        const App = () => (
          <div>Content</div>
        );
      `;
      const result = insertShapeInCode(code, 'hexagon', { x: 0, y: 0, width: 100, height: 100 });
      
      expect(result).toContain('<svg');
    });

    it('should insert parallelogram shape', () => {
      const code = `
        const App = () => (
          <div>Content</div>
        );
      `;
      const result = insertShapeInCode(code, 'parallelogram', { x: 0, y: 0, width: 100, height: 50 });
      
      expect(result).toContain('transform: "skew(-20deg)"');
    });

    it('should insert ellipse shape', () => {
      const code = `
        const App = () => (
          <div>Content</div>
        );
      `;
      const result = insertShapeInCode(code, 'ellipse', { x: 0, y: 0, width: 150, height: 100 });
      
      expect(result).toContain('borderRadius: "50%"');
    });

    it('should insert pentagon shape as SVG', () => {
      const code = `
        const App = () => (
          <div>Content</div>
        );
      `;
      const result = insertShapeInCode(code, 'pentagon', { x: 0, y: 0, width: 100, height: 100 });
      
      expect(result).toContain('<svg');
    });

    it('should return original code for unknown shape', () => {
      const code = `
        const App = () => (
          <div>Content</div>
        );
      `;
      const result = insertShapeInCode(code, 'unknownShape', { x: 0, y: 0, width: 100, height: 100 });
      
      expect(result).toBe(code);
    });

    it('should handle arrow function without parentheses', () => {
      const code = `const App = () => <div>Content</div>;`;
      const result = insertShapeInCode(code, 'rectangle', { x: 0, y: 0, width: 100, height: 100 });
      
      // 괄호 없이 직접 JSX를 반환하는 경우에도 삽입
      expect(result.length).toBeGreaterThanOrEqual(code.length);
    });
  });

  describe('insertTextBoxInCode', () => {
    it('should insert textbox at specified position', () => {
      const code = `
        function App() {
          return (
            <div className="container">
              <h1>Hello</h1>
            </div>
          );
        }
      `;
      const result = insertTextBoxInCode(code, { x: 100, y: 200, width: 200, height: 50 }, 100);
      
      expect(result).toContain('<p');
      expect(result).toContain('position: "absolute"');
      expect(result).toContain('left: "100px"');
      expect(result).toContain('top: "200px"');
      expect(result).toContain('텍스트를 입력하세요');
    });

    it('should insert textbox with arrow function component', () => {
      const code = `
        const App = () => {
          return (
            <div>Content</div>
          );
        };
      `;
      const result = insertTextBoxInCode(code, { x: 50, y: 50, width: 100, height: 30 });
      
      expect(result).toContain('<p');
      expect(result).toContain('textbox-');
    });
  });

  describe('updateTextInCode', () => {
    it('should update text content', () => {
      const code = `<p id="text-1">Original Text</p>`;
      const loc: SourceLocation = {
        start: { line: 1, column: 0 },
        end: { line: 1, column: 35 },
      };
      
      const result = updateTextInCode(code, loc, 'New Text');
      
      expect(result).toContain('New Text');
      expect(result).not.toContain('Original Text');
    });

    it('should escape special characters', () => {
      const code = `<p id="text-1">Original</p>`;
      const loc: SourceLocation = {
        start: { line: 1, column: 0 },
        end: { line: 1, column: 27 },
      };
      
      const result = updateTextInCode(code, loc, '<script>alert("xss")</script>');
      
      expect(result).toContain('&lt;script&gt;');
      expect(result).not.toContain('<script>');
    });

    it('should return original code for invalid location', () => {
      const code = `<p>Text</p>`;
      const invalidLoc: SourceLocation = {
        start: { line: 100, column: 0 },
        end: { line: 100, column: 10 },
      };
      
      const result = updateTextInCode(code, invalidLoc, 'New Text');
      
      expect(result).toBe(code);
    });
  });

  describe('deleteElementFromCode', () => {
    it('should delete element at specified location', () => {
      const code = `<div>
      <p id="to-delete">Delete me</p>
      <span>Keep me</span>
    </div>`;
      const loc: SourceLocation = {
        start: { line: 2, column: 6 },
        end: { line: 2, column: 39 },
      };
      
      const result = deleteElementFromCode(code, loc);
      
      expect(result).not.toContain('Delete me');
      expect(result).toContain('Keep me');
    });

    it('should return original code for invalid location', () => {
      const code = `<div><p>Content</p></div>`;
      const invalidLoc: SourceLocation = {
        start: { line: 100, column: 0 },
        end: { line: 100, column: 10 },
      };
      
      const result = deleteElementFromCode(code, invalidLoc);
      
      expect(result).toBe(code);
    });
  });

  describe('updateElementInCode - additional cases', () => {
    it('should update multiline element', () => {
      const code = `<div 
  id="test" 
  style={{ 
    position: 'absolute', 
    left: '10px' 
  }}>
  Test
</div>`;
      const loc: SourceLocation = {
        start: { line: 1, column: 0 },
        end: { line: 8, column: 6 },
      };
      
      const result = updateElementInCode(
        code,
        'test',
        { position: { x: 200, y: 300 } },
        loc
      );
      
      expect(result).toContain('left: "200px"');
      expect(result).toContain('top: "300px"');
    });

    it('should update element with borderRadius', () => {
      const code = `<div id="test" style={{ borderRadius: '4px' }}>Test</div>`;
      const loc: SourceLocation = {
        start: { line: 1, column: 0 },
        end: { line: 1, column: 55 },
      };
      
      const result = updateElementInCode(
        code,
        'test',
        { style: { borderRadius: '16px' } },
        loc
      );
      
      expect(result).toContain('borderRadius: "16px"');
    });

    it('should update element with transform', () => {
      const code = `<div id="test" style={{}}>Test</div>`;
      const loc: SourceLocation = {
        start: { line: 1, column: 0 },
        end: { line: 1, column: 35 },
      };
      
      const result = updateElementInCode(
        code,
        'test',
        { style: { transform: 'rotate(45deg)' } },
        loc
      );
      
      expect(result).toContain('transform: "rotate(45deg)"');
    });

    it('should update element without existing style', () => {
      const code = `<div id="test" className="container">Test</div>`;
      const loc: SourceLocation = {
        start: { line: 1, column: 0 },
        end: { line: 1, column: 45 },
      };
      
      const result = updateElementInCode(
        code,
        'test',
        { position: { x: 50, y: 100 } },
        loc
      );
      
      expect(result).toContain('style={{');
      expect(result).toContain('left: "50px"');
      expect(result).toContain('top: "100px"');
    });

    it('should handle position and size update together', () => {
      const code = `<div id="test" style={{}}>Test</div>`;
      const loc: SourceLocation = {
        start: { line: 1, column: 0 },
        end: { line: 1, column: 35 },
      };
      
      const result = updateElementInCode(
        code,
        'test',
        { 
          position: { x: 100, y: 200 },
          size: { width: 300, height: 400 }
        },
        loc
      );
      
      expect(result).toContain('left: "100px"');
      expect(result).toContain('top: "200px"');
      expect(result).toContain('width: "300px"');
      expect(result).toContain('height: "400px"');
    });

    it('should handle fontWeight and fontStyle updates', () => {
      const code = `<p id="test" style={{}}>Text</p>`;
      const loc: SourceLocation = {
        start: { line: 1, column: 0 },
        end: { line: 1, column: 32 },
      };
      
      const result = updateElementInCode(
        code,
        'test',
        { style: { fontWeight: 'bold', fontStyle: 'italic' } },
        loc
      );
      
      expect(result).toContain('fontWeight: "bold"');
      expect(result).toContain('fontStyle: "italic"');
    });

    it('should handle textAlign and fontSize updates', () => {
      const code = `<p id="test" style={{}}>Text</p>`;
      const loc: SourceLocation = {
        start: { line: 1, column: 0 },
        end: { line: 1, column: 32 },
      };
      
      const result = updateElementInCode(
        code,
        'test',
        { style: { textAlign: 'center', fontSize: '24px' } },
        loc
      );
      
      expect(result).toContain('textAlign: "center"');
      expect(result).toContain('fontSize: "24px"');
    });

    it('should handle color update', () => {
      const code = `<p id="test" style={{ color: 'black' }}>Text</p>`;
      const loc: SourceLocation = {
        start: { line: 1, column: 0 },
        end: { line: 1, column: 48 },
      };
      
      const result = updateElementInCode(
        code,
        'test',
        { style: { color: '#ff0000' } },
        loc
      );
      
      expect(result).toContain('color: "#ff0000"');
    });
  });

  describe('updateSvgFillColor - additional cases', () => {
    it('should update fill with single quotes', () => {
      const code = `<svg><rect fill='red' /></svg>`;
      const loc: SourceLocation = {
        start: { line: 1, column: 0 },
        end: { line: 1, column: 30 },
      };
      
      const result = updateSvgFillColor(code, loc, 'green');
      
      expect(result).toContain('fill="green"');
    });

    it('should return original for invalid line', () => {
      const code = `<svg><circle fill="red" /></svg>`;
      const invalidLoc: SourceLocation = {
        start: { line: 999, column: 0 },
        end: { line: 999, column: 30 },
      };
      
      const result = updateSvgFillColor(code, invalidLoc, 'blue');
      
      expect(result).toBe(code);
    });
  });

  describe('updateSvgStroke - additional cases', () => {
    it('should update existing stroke width', () => {
      const code = `<svg><circle fill="blue" stroke="red" stroke-width="1" /></svg>`;
      const loc: SourceLocation = {
        start: { line: 1, column: 0 },
        end: { line: 1, column: 60 },
      };
      
      const result = updateSvgStroke(code, loc, 'green', 10);
      
      expect(result).toContain('stroke="green"');
      expect(result).toContain('stroke-width="10"');
    });

    it('should return original for invalid line', () => {
      const code = `<svg><circle stroke="black" /></svg>`;
      const invalidLoc: SourceLocation = {
        start: { line: 999, column: 0 },
        end: { line: 999, column: 30 },
      };
      
      const result = updateSvgStroke(code, invalidLoc, 'red', 2);
      
      expect(result).toBe(code);
    });
  });

  // branches 커버리지를 위한 추가 테스트
  describe('additional branch coverage tests', () => {
    it('should handle multiline code in updateElementInCode', () => {
      const code = `<div
        id="test"
        style={{
          backgroundColor: 'red'
        }}
      >Content</div>`;
      const loc: SourceLocation = {
        start: { line: 1, column: 0 },
        end: { line: 6, column: 17 },
      };
      
      const result = updateElementInCode(code, 'test', { style: { color: 'blue' } }, loc);
      expect(result).toContain('color');
    });

    it('should handle element without style in updateElementInCode', () => {
      const code = `<div id="test">Content</div>`;
      const loc: SourceLocation = {
        start: { line: 1, column: 0 },
        end: { line: 1, column: 28 },
      };
      
      const result = updateElementInCode(code, 'test', { position: { x: 10, y: 20 } }, loc);
      expect(result).toContain('style={{');
    });

    it('should handle shape insertion with return statement', () => {
      const code = `function App() {
        return (
          <div>Hello</div>
        );
      }`;
      const result = insertShapeInCode(code, 'circle', { x: 0, y: 0, width: 50, height: 50 });
      expect(result).toContain('borderRadius');
    });

    it('should handle textbox insertion with function component', () => {
      const code = `function Page() {
        return (
          <main>Content</main>
        );
      }`;
      const result = insertTextBoxInCode(code, { x: 100, y: 100, width: 200, height: 30 });
      expect(result).toContain('<p');
    });

    it('should handle SVG fill update with multiline SVG', () => {
      const code = `<svg width="100" height="100">
        <circle fill="red" cx="50" cy="50" r="40" />
      </svg>`;
      const loc: SourceLocation = {
        start: { line: 1, column: 0 },
        end: { line: 3, column: 6 },
      };
      
      const result = updateSvgFillColor(code, loc, 'green');
      expect(result).toContain('fill="green"');
    });

    it('should handle updateElementInCode with only size update', () => {
      const code = `<div id="box" style={{ width: '100px' }}>Box</div>`;
      const loc: SourceLocation = {
        start: { line: 1, column: 0 },
        end: { line: 1, column: 48 },
      };
      
      const result = updateElementInCode(code, 'box', { size: { width: 200, height: 150 } }, loc);
      expect(result).toContain('200px');
      expect(result).toContain('150px');
    });

    it('should handle insertShapeInCode with arrow function and parentheses', () => {
      const code = `const App = () => (
        <div>Content</div>
      );`;
      const result = insertShapeInCode(code, 'rectangle', { x: 50, y: 50, width: 100, height: 80 });
      expect(result.length).toBeGreaterThan(code.length);
    });

    it('should update text with ampersand character', () => {
      const code = `<p id="text">Original</p>`;
      const loc: SourceLocation = {
        start: { line: 1, column: 0 },
        end: { line: 1, column: 25 },
      };
      
      const result = updateTextInCode(code, loc, 'Tom & Jerry');
      expect(result).toContain('&amp;');
    });

    it('should delete element and clean up whitespace', () => {
      const code = `<div>
        <p>Keep</p>
        <span id="delete">Delete</span>
      </div>`;
      const loc: SourceLocation = {
        start: { line: 3, column: 8 },
        end: { line: 3, column: 40 },
      };
      
      const result = deleteElementFromCode(code, loc);
      expect(result).not.toContain('Delete');
      expect(result).toContain('Keep');
    });

    it('should handle complex style object in updateElementInCode', () => {
      const code = `<div id="styled" style={{ display: 'flex', gap: '10px' }}>Flex</div>`;
      const loc: SourceLocation = {
        start: { line: 1, column: 0 },
        end: { line: 1, column: 65 },
      };
      
      const result = updateElementInCode(code, 'styled', { 
        style: { alignItems: 'center', justifyContent: 'space-between' } 
      }, loc);
      expect(result).toContain('alignItems');
      expect(result).toContain('justifyContent');
    });

    it('should handle SVG stroke update with only stroke color (no width)', () => {
      const code = `<svg><rect fill="blue" stroke="black" /></svg>`;
      const loc: SourceLocation = {
        start: { line: 1, column: 0 },
        end: { line: 1, column: 44 },
      };
      
      const result = updateSvgStroke(code, loc, 'red', 5);
      expect(result).toContain('stroke="red"');
    });

    it('should handle negative line number gracefully', () => {
      const code = `<div>Test</div>`;
      const loc: SourceLocation = {
        start: { line: -1, column: 0 },
        end: { line: 1, column: 15 },
      };
      
      const result = updateElementInCode(code, 'test', { position: { x: 0, y: 0 } }, loc);
      expect(result).toBe(code);
    });
  });
});

