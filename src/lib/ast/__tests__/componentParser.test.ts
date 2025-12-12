import { describe, it, expect } from 'vitest';
import { parseComponent } from '../componentParser';

describe('componentParser', () => {
  describe('parseComponent', () => {
    it('should parse simple JSX element', () => {
      const code = `<div>Hello World</div>`;
      const result = parseComponent(code);
      
      expect(result.type).toBe('div');
      expect(result.children).toBeDefined();
      expect(result.children![0].text).toBe('Hello World');
    });

    it('should parse JSX element with props', () => {
      const code = `<div id="test" className="container">Content</div>`;
      const result = parseComponent(code);
      
      expect(result.type).toBe('div');
      expect(result.props).toBeDefined();
      expect(result.props!.id).toBe('test');
      expect(result.props!.className).toBe('container');
    });

    it('should parse nested JSX elements', () => {
      const code = `
        <div>
          <h1>Title</h1>
          <p>Paragraph</p>
        </div>
      `;
      const result = parseComponent(code);
      
      expect(result.type).toBe('div');
      expect(result.children).toBeDefined();
      expect(result.children!.length).toBeGreaterThan(0);
    });

    it('should parse JSX element with style prop', () => {
      const code = `<div style={{ backgroundColor: 'red', width: '100px' }}>Test</div>`;
      const result = parseComponent(code);
      
      expect(result.type).toBe('div');
      expect(result.props).toBeDefined();
      expect(result.props!.style).toBeDefined();
    });

    it('should parse JSX element with inline styles', () => {
      const code = `<div style={{ position: 'absolute', left: '10px', top: '20px' }}>Test</div>`;
      const result = parseComponent(code);
      
      expect(result.type).toBe('div');
      expect(result.props).toBeDefined();
      expect(result.props!.style).toBeDefined();
    });

    it('should handle empty JSX element', () => {
      const code = `<div></div>`;
      const result = parseComponent(code);
      
      expect(result.type).toBe('div');
    });

    it('should parse JSX element with id attribute', () => {
      const code = `<div id="element-1">Content</div>`;
      const result = parseComponent(code);
      
      expect(result.id).toBe('element-1');
      expect(result.type).toBe('div');
    });

    it('should parse JSX with text content', () => {
      const code = `<p>This is a paragraph with text content</p>`;
      const result = parseComponent(code);
      
      expect(result.type).toBe('p');
      expect(result.children).toBeDefined();
      expect(result.children![0].text).toContain('paragraph');
    });

    it('should handle invalid JSX gracefully', () => {
      const code = `invalid jsx code`;
      
      expect(() => {
        parseComponent(code);
      }).not.toThrow();
    });

    it('should parse component with multiple children', () => {
      const code = `
        <div>
          <span>Child 1</span>
          <span>Child 2</span>
          <span>Child 3</span>
        </div>
      `;
      const result = parseComponent(code);
      
      expect(result.type).toBe('div');
      expect(result.children).toBeDefined();
      expect(result.children!.length).toBeGreaterThanOrEqual(3);
    });
  });
});

