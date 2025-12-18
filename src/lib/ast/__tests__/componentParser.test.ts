import { describe, it, expect } from 'vitest';
import { parseComponent, SourceLocation } from '../componentParser';

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

    // 추가 테스트 케이스
    it('should parse function component', () => {
      const code = `
        function App() {
          return <div className="app">Hello</div>;
        }
      `;
      const result = parseComponent(code);
      
      expect(result.type).toBe('div');
      expect(result.props?.className).toBe('app');
    });

    it('should parse arrow function component', () => {
      const code = `
        const App = () => {
          return <div>Arrow Function Component</div>;
        };
      `;
      const result = parseComponent(code);
      
      expect(result.type).toBe('div');
    });

    it('should parse arrow function with direct JSX return', () => {
      const code = `const App = () => <div>Direct Return</div>;`;
      const result = parseComponent(code);
      
      expect(result.type).toBe('div');
    });

    it('should parse JSX fragment', () => {
      const code = `
        const App = () => (
          <>
            <div>First</div>
            <div>Second</div>
          </>
        );
      `;
      const result = parseComponent(code);
      
      expect(result.type).toBe('fragment');
      expect(result.children).toBeDefined();
    });

    it('should parse self-closing element', () => {
      const code = `<img src="test.png" alt="test" />`;
      const result = parseComponent(code);
      
      expect(result.type).toBe('img');
      expect(result.props?.src).toBe('test.png');
    });

    it('should parse SVG element', () => {
      const code = `<svg width="100" height="100"><circle fill="red" /></svg>`;
      const result = parseComponent(code);
      
      expect(result.type).toBe('svg');
      expect(result.props?.width).toBe('100');
    });

    it('should parse numeric style values', () => {
      const code = `<div style={{ zIndex: 10, opacity: 0.5 }}>Test</div>`;
      const result = parseComponent(code);
      
      expect(result.props?.style?.zIndex).toBe(10);
      expect(result.props?.style?.opacity).toBe(0.5);
    });

    it('should parse boolean attributes', () => {
      const code = `<input disabled />`;
      const result = parseComponent(code);
      
      expect(result.type).toBe('input');
      expect(result.props?.disabled).toBe(true);
    });

    it('should parse data attributes', () => {
      const code = `<div data-slot="header" data-testid="test">Content</div>`;
      const result = parseComponent(code);
      
      expect(result.props?.['data-slot']).toBe('header');
      expect(result.props?.['data-testid']).toBe('test');
    });

    it('should parse JSX expression in text', () => {
      const code = `<div>{name}</div>`;
      const result = parseComponent(code);
      
      expect(result.type).toBe('div');
      expect(result.children).toBeDefined();
      expect(result.children![0].isExpression).toBe(true);
    });

    it('should parse member expression', () => {
      const code = `<div>{user.name}</div>`;
      const result = parseComponent(code);
      
      expect(result.type).toBe('div');
      expect(result.children).toBeDefined();
      expect(result.children![0].isExpression).toBe(true);
      expect(result.children![0].expressionText).toBe('user.name');
    });

    it('should parse option element with text', () => {
      const code = `<select><option value="1">Option 1</option></select>`;
      const result = parseComponent(code);
      
      expect(result.type).toBe('select');
      expect(result.children).toBeDefined();
    });

    it('should handle JSX comments', () => {
      const code = `<div>{/* This is a comment */}Content</div>`;
      const result = parseComponent(code);
      
      expect(result.type).toBe('div');
    });

    it('should parse conditional expression', () => {
      const code = `<div>{condition ? 'Yes' : 'No'}</div>`;
      const result = parseComponent(code);
      
      expect(result.type).toBe('div');
      expect(result.children).toBeDefined();
    });

    it('should parse logical AND expression', () => {
      const code = `<div>{showContent && <span>Content</span>}</div>`;
      const result = parseComponent(code);
      
      expect(result.type).toBe('div');
    });

    it('should parse spread attributes', () => {
      const code = `<div {...props}>Content</div>`;
      const result = parseComponent(code);
      
      expect(result.type).toBe('div');
      expect(result.props?._spread).toBe(true);
    });

    it('should parse variable declarations', () => {
      const code = `
        const user = { name: 'Test', age: 25 };
        const App = () => <div>{user.name}</div>;
      `;
      const result = parseComponent(code);
      
      expect(result.type).toBe('div');
    });

    it('should parse array variable', () => {
      const code = `
        const items = ['a', 'b', 'c'];
        const App = () => <ul>{items.map(i => <li key={i}>{i}</li>)}</ul>;
      `;
      const result = parseComponent(code);
      
      // 여러 컴포넌트가 발견되면 div로 감싸서 반환
      // 실제 ul은 children 내부에 있음
      expect(result.type).toBe('div');
      expect(result.children).toBeDefined();
    });

    it('should include source location', () => {
      const code = `<div id="test">Content</div>`;
      const result = parseComponent(code);
      
      expect(result.loc).toBeDefined();
      expect(result.loc?.start).toBeDefined();
      expect(result.loc?.end).toBeDefined();
    });

    it('should parse complex nested structure', () => {
      const code = `
        <div className="container">
          <header>
            <h1>Title</h1>
          </header>
          <main>
            <section>
              <p>Content</p>
            </section>
          </main>
          <footer>Footer</footer>
        </div>
      `;
      const result = parseComponent(code);
      
      expect(result.type).toBe('div');
      expect(result.children).toBeDefined();
      expect(result.children!.length).toBeGreaterThan(0);
    });

    // 추가 테스트: 다양한 JSX 패턴
    it('should parse template literal className', () => {
      const code = `
        const App = () => <div className={\`container \${active ? 'active' : ''}\`}>Test</div>;
      `;
      const result = parseComponent(code);
      
      expect(result.type).toBe('div');
      expect(result.props?.className).toBeDefined();
    });

    it('should parse motion.div as div', () => {
      const code = `<motion.div>Animated</motion.div>`;
      const result = parseComponent(code);
      
      expect(result.type).toBe('div');
    });

    it('should parse multiple style properties', () => {
      const code = `<div style={{ 
        position: 'absolute', 
        left: '10px', 
        top: '20px',
        width: '100px',
        height: '200px',
        backgroundColor: 'blue',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        opacity: 0.9,
        zIndex: 100
      }}>Test</div>`;
      const result = parseComponent(code);
      
      expect(result.props?.style?.position).toBe('absolute');
      expect(result.props?.style?.backgroundColor).toBe('blue');
      expect(result.props?.style?.zIndex).toBe(100);
    });

    it('should parse null and undefined values', () => {
      const code = `<div id={null} className={undefined}>Test</div>`;
      const result = parseComponent(code);
      
      expect(result.type).toBe('div');
    });

    it('should parse export default function component', () => {
      const code = `
        export default function Page() {
          return <main>Page Content</main>;
        }
      `;
      const result = parseComponent(code);
      
      expect(result.type).toBe('main');
    });

    it('should parse component with event handlers', () => {
      const code = `<button onClick={() => console.log('click')}>Click Me</button>`;
      const result = parseComponent(code);
      
      expect(result.type).toBe('button');
    });

    it('should parse ternary in children', () => {
      const code = `<div>{isLoading ? <span>Loading...</span> : <span>Loaded</span>}</div>`;
      const result = parseComponent(code);
      
      expect(result.type).toBe('div');
      expect(result.children).toBeDefined();
    });

    it('should parse component with ref', () => {
      const code = `<input ref={inputRef} type="text" />`;
      const result = parseComponent(code);
      
      expect(result.type).toBe('input');
      expect(result.props?.type).toBe('text');
    });

    it('should parse form elements', () => {
      const code = `
        <form onSubmit={handleSubmit}>
          <input type="text" name="username" />
          <button type="submit">Submit</button>
        </form>
      `;
      const result = parseComponent(code);
      
      expect(result.type).toBe('form');
      expect(result.children).toBeDefined();
    });

    it('should parse link element with href', () => {
      const code = `<a href="https://example.com" target="_blank">Link</a>`;
      const result = parseComponent(code);
      
      expect(result.type).toBe('a');
      expect(result.props?.href).toBe('https://example.com');
      expect(result.props?.target).toBe('_blank');
    });

    it('should parse table structure', () => {
      const code = `
        <table>
          <thead>
            <tr><th>Header</th></tr>
          </thead>
          <tbody>
            <tr><td>Cell</td></tr>
          </tbody>
        </table>
      `;
      const result = parseComponent(code);
      
      expect(result.type).toBe('table');
      expect(result.children).toBeDefined();
    });

    it('should parse video element', () => {
      const code = `<video src="video.mp4" controls autoPlay muted />`;
      const result = parseComponent(code);
      
      expect(result.type).toBe('video');
      expect(result.props?.controls).toBe(true);
      expect(result.props?.autoPlay).toBe(true);
    });

    it('should parse iframe element', () => {
      const code = `<iframe src="https://example.com" width="100%" height="400" />`;
      const result = parseComponent(code);
      
      expect(result.type).toBe('iframe');
      expect(result.props?.src).toBe('https://example.com');
    });

    it('should parse component with children prop', () => {
      const code = `
        const Card = ({ children, title }) => (
          <div>
            <h2>{title}</h2>
            <div>{children}</div>
          </div>
        );
      `;
      const result = parseComponent(code);
      
      expect(result.type).toBe('div');
    });

    it('should parse deeply nested components', () => {
      const code = `
        <div>
          <div>
            <div>
              <div>
                <div>
                  <span>Deep</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
      const result = parseComponent(code);
      
      expect(result.type).toBe('div');
      expect(result.children).toBeDefined();
    });

    it('should parse component with callback props', () => {
      const code = `
        <Modal onClose={handleClose} onConfirm={handleConfirm}>
          <p>Content</p>
        </Modal>
      `;
      const result = parseComponent(code);
      
      expect(result.type).toBe('Modal');
    });

    it('should parse empty fragment', () => {
      const code = `const App = () => <></>;`;
      const result = parseComponent(code);
      
      expect(result.type).toBe('fragment');
    });

    it('should parse list with key', () => {
      const code = `
        <ul>
          <li key="1">Item 1</li>
          <li key="2">Item 2</li>
        </ul>
      `;
      const result = parseComponent(code);
      
      expect(result.type).toBe('ul');
      expect(result.children?.length).toBeGreaterThanOrEqual(2);
    });

    it('should parse SVG with viewBox', () => {
      const code = `
        <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid">
          <polygon points="50,0 100,100 0,100" fill="blue" />
        </svg>
      `;
      const result = parseComponent(code);
      
      expect(result.type).toBe('svg');
      expect(result.props?.viewBox).toBe('0 0 100 100');
    });

    it('should parse component with aria attributes', () => {
      const code = `<button aria-label="Close" aria-hidden="false">X</button>`;
      const result = parseComponent(code);
      
      expect(result.type).toBe('button');
      expect(result.props?.['aria-label']).toBe('Close');
    });

    it('should parse component with role attribute', () => {
      const code = `<div role="dialog" aria-modal="true">Dialog Content</div>`;
      const result = parseComponent(code);
      
      expect(result.type).toBe('div');
      expect(result.props?.role).toBe('dialog');
    });

    it('should parse style with calc', () => {
      const code = `<div style={{ width: 'calc(100% - 20px)' }}>Test</div>`;
      const result = parseComponent(code);
      
      expect(result.props?.style?.width).toBe('calc(100% - 20px)');
    });

    it('should parse component with inline object prop', () => {
      const code = `<Component config={{ theme: 'dark', size: 'large' }} />`;
      const result = parseComponent(code);
      
      expect(result.type).toBe('Component');
    });

    it('should parse TypeScript generic component', () => {
      const code = `<List<Item> items={items} renderItem={(item) => <span>{item.name}</span>} />`;
      const result = parseComponent(code);
      
      expect(result.type).toBe('List');
    });

    it('should handle multiple text nodes', () => {
      const code = `<p>Hello <strong>World</strong>!</p>`;
      const result = parseComponent(code);
      
      expect(result.type).toBe('p');
      expect(result.children).toBeDefined();
    });

    it('should parse component with default export arrow function', () => {
      const code = `
        export default () => <div>Default Export</div>;
      `;
      const result = parseComponent(code);
      
      expect(result.type).toBe('div');
    });

    it('should handle whitespace in JSX', () => {
      const code = `
        <div>
          
          <span>Content</span>
          
        </div>
      `;
      const result = parseComponent(code);
      
      expect(result.type).toBe('div');
    });

    it('should parse component with number prop', () => {
      const code = `<Progress value={75} max={100} />`;
      const result = parseComponent(code);
      
      expect(result.type).toBe('Progress');
      expect(result.props?.value).toBe(75);
      expect(result.props?.max).toBe(100);
    });

    it('should parse input with various types', () => {
      const code = `
        <div>
          <input type="email" />
          <input type="password" />
          <input type="checkbox" checked />
          <input type="radio" />
        </div>
      `;
      const result = parseComponent(code);
      
      expect(result.type).toBe('div');
      expect(result.children).toBeDefined();
    });

    it('should parse textarea element', () => {
      const code = `<textarea rows={5} cols={40} placeholder="Enter text">Default content</textarea>`;
      const result = parseComponent(code);
      
      expect(result.type).toBe('textarea');
      expect(result.props?.rows).toBe(5);
    });

    it('should parse select with options', () => {
      const code = `
        <select defaultValue="b">
          <option value="a">Option A</option>
          <option value="b">Option B</option>
          <option value="c">Option C</option>
        </select>
      `;
      const result = parseComponent(code);
      
      expect(result.type).toBe('select');
      expect(result.children).toBeDefined();
    });

    it('should parse component returning null check', () => {
      const code = `
        const App = () => {
          if (!data) return null;
          return <div>Has Data</div>;
        };
      `;
      const result = parseComponent(code);
      
      // null을 반환하는 경우도 처리
      expect(result).toBeDefined();
    });

    it('should parse component with destructured props', () => {
      const code = `
        const Button = ({ variant, size, children, ...rest }) => (
          <button className={variant} {...rest}>{children}</button>
        );
      `;
      const result = parseComponent(code);
      
      expect(result.type).toBe('button');
    });

    it('should parse JSX with nullish coalescing', () => {
      const code = `<div>{name ?? 'Default'}</div>`;
      const result = parseComponent(code);
      
      expect(result.type).toBe('div');
      expect(result.children).toBeDefined();
    });

    it('should parse JSX with optional chaining', () => {
      const code = `<div>{user?.profile?.name}</div>`;
      const result = parseComponent(code);
      
      expect(result.type).toBe('div');
      expect(result.children).toBeDefined();
    });

    // branches 커버리지를 위한 추가 테스트
    it('should parse cn() function call in className', () => {
      const code = `<div className={cn("base-class", active && "active")}>Test</div>`;
      const result = parseComponent(code);
      
      expect(result.type).toBe('div');
      expect(result.props?.className).toBeDefined();
    });

    it('should parse badgeVariants() function call', () => {
      const code = `<div className={badgeVariants({ variant: "outline" })}>Badge</div>`;
      const result = parseComponent(code);
      
      expect(result.type).toBe('div');
    });

    it('should parse cn() with nested badgeVariants', () => {
      const code = `<span className={cn(badgeVariants({ variant }), className)}>Test</span>`;
      const result = parseComponent(code);
      
      expect(result.type).toBe('span');
    });

    it('should parse cn() with identifier argument', () => {
      const code = `<div className={cn(baseClass, additionalClass)}>Test</div>`;
      const result = parseComponent(code);
      
      expect(result.type).toBe('div');
    });

    it('should parse cn() with object expression', () => {
      const code = `<div className={cn("base", { active: true })}>Test</div>`;
      const result = parseComponent(code);
      
      expect(result.type).toBe('div');
    });

    it('should handle style with non-expression node', () => {
      const code = `<div style={{ margin: '10px' }}>Test</div>`;
      const result = parseComponent(code);
      
      expect(result.props?.style?.margin).toBe('10px');
    });

    it('should parse component with numeric literal in style', () => {
      const code = `<div style={{ flex: 1, order: 2 }}>Test</div>`;
      const result = parseComponent(code);
      
      expect(result.props?.style?.flex).toBe(1);
      expect(result.props?.style?.order).toBe(2);
    });

    it('should parse component with boolean literal in style', () => {
      const code = `<div data-active={true} data-disabled={false}>Test</div>`;
      const result = parseComponent(code);
      
      expect(result.props?.['data-active']).toBe(true);
      expect(result.props?.['data-disabled']).toBe(false);
    });

    it('should handle "in" operator in conditional', () => {
      const code = `<div>{"period" in item && <span>Has Period</span>}</div>`;
      const result = parseComponent(code);
      
      expect(result.type).toBe('div');
      expect(result.children).toBeDefined();
    });

    it('should handle map with block statement body', () => {
      const code = `
        const items = [{id: 1}, {id: 2}];
        const App = () => (
          <ul>
            {items.map((item) => {
              return <li key={item.id}>{item.id}</li>;
            })}
          </ul>
        );
      `;
      const result = parseComponent(code);
      
      expect(result).toBeDefined();
    });

    it('should parse component with template literal with multiple expressions', () => {
      const code = `
        const App = () => <div className={\`\${base} \${variant} \${size}\`}>Test</div>;
      `;
      const result = parseComponent(code);
      
      expect(result.type).toBe('div');
    });

    it('should parse template literal with logical OR expression', () => {
      const code = `
        const App = () => <div className={\`container \${active || 'inactive'}\`}>Test</div>;
      `;
      const result = parseComponent(code);
      
      expect(result.type).toBe('div');
    });

    it('should handle JSX member expression with motion', () => {
      const code = `<motion.section initial={{ opacity: 0 }}>Content</motion.section>`;
      const result = parseComponent(code);
      
      expect(result.type).toBe('section');
    });

    it('should handle empty return statement', () => {
      const code = `
        const App = () => {
          if (loading) return;
          return <div>Content</div>;
        };
      `;
      const result = parseComponent(code);
      
      expect(result).toBeDefined();
    });

    it('should parse component with string style value containing spaces', () => {
      const code = `<div style={{ boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>Test</div>`;
      const result = parseComponent(code);
      
      expect(result.props?.style?.boxShadow).toContain('rgba');
    });

    it('should parse className with template literal object access', () => {
      const code = `
        const App = () => <div className={\`\${colors['primary']}\`}>Test</div>;
      `;
      const result = parseComponent(code);
      
      expect(result.type).toBe('div');
    });

    it('should parse style with nested object expression', () => {
      const code = `<div style={{ transform: 'translateX(10px)' }}>Test</div>`;
      const result = parseComponent(code);
      
      expect(result.props?.style?.transform).toBe('translateX(10px)');
    });

    it('should handle function declaration returning fragment', () => {
      const code = `
        function App() {
          return (
            <>
              <div>First</div>
              <div>Second</div>
            </>
          );
        }
      `;
      const result = parseComponent(code);
      
      expect(result.type).toBe('fragment');
    });

    it('should parse component with array map returning JSX', () => {
      const code = `
        const ITEMS = [{ name: 'A' }, { name: 'B' }];
        const App = () => (
          <div>
            {ITEMS.map((item) => <span key={item.name}>{item.name}</span>)}
          </div>
        );
      `;
      const result = parseComponent(code);
      
      expect(result.type).toBe('div');
    });

    it('should parse cn() with multiple string arguments', () => {
      const code = `<div className={cn("flex", "items-center", "gap-2")}>Test</div>`;
      const result = parseComponent(code);
      
      expect(result.type).toBe('div');
      expect(result.props?.className).toContain('flex');
    });

    it('should handle variableMap with member expression', () => {
      const code = `
        const config = { theme: 'dark' };
        const App = () => <div data-theme={config.theme}>Test</div>;
      `;
      const result = parseComponent(code);
      
      expect(result.type).toBe('div');
    });

    it('should parse buttonVariants function call', () => {
      const code = `<button className={buttonVariants({ size: "lg" })}>Click</button>`;
      const result = parseComponent(code);
      
      expect(result.type).toBe('button');
    });

    it('should handle non-identifier callee in call expression', () => {
      const code = `<div className={obj.method("arg")}>Test</div>`;
      const result = parseComponent(code);
      
      expect(result.type).toBe('div');
    });

    // 추가 branches 커버리지 테스트
    it('should handle cn() with nested non-variant function call', () => {
      const code = `<div className={cn(getClass("primary"), "extra")}>Test</div>`;
      const result = parseComponent(code);
      
      expect(result.type).toBe('div');
    });

    it('should handle cn() with variable from variableMap', () => {
      const code = `
        const baseClass = "container";
        const App = () => <div className={cn(baseClass)}>Test</div>;
      `;
      const result = parseComponent(code);
      
      expect(result.type).toBe('div');
    });

    it('should handle cn() with template literal argument', () => {
      const code = `<div className={cn(\`base-\${type}\`, extra)}>Test</div>`;
      const result = parseComponent(code);
      
      expect(result.type).toBe('div');
    });

    it('should handle cn() with array expression', () => {
      const code = `<div className={cn(["class1", "class2"])}>Test</div>`;
      const result = parseComponent(code);
      
      expect(result.type).toBe('div');
    });

    it('should handle cn() with conditional expression', () => {
      const code = `<div className={cn(isActive ? "active" : "inactive")}>Test</div>`;
      const result = parseComponent(code);
      
      expect(result.type).toBe('div');
    });

    it('should handle nested cn() calls', () => {
      const code = `<div className={cn(cn("inner"), "outer")}>Test</div>`;
      const result = parseComponent(code);
      
      expect(result.type).toBe('div');
    });

    it('should handle JSX with variable reference in variableMap', () => {
      const code = `
        const theme = "dark";
        const App = () => <div data-theme={theme}>Test</div>;
      `;
      const result = parseComponent(code);
      
      expect(result.type).toBe('div');
    });

    it('should handle style with object reference from variableMap', () => {
      const code = `
        const styles = { color: "red", fontSize: "16px" };
        const App = () => <div style={styles}>Test</div>;
      `;
      const result = parseComponent(code);
      
      expect(result.type).toBe('div');
    });

    it('should handle member expression in template literal', () => {
      const code = `
        const config = { prefix: "btn" };
        const App = () => <div className={\`\${config.prefix}-primary\`}>Test</div>;
      `;
      const result = parseComponent(code);
      
      expect(result.type).toBe('div');
    });

    it('should handle logical OR in template literal with member expression', () => {
      const code = `
        const App = () => <div className={\`\${colors.primary || colors.default}\`}>Test</div>;
      `;
      const result = parseComponent(code);
      
      expect(result.type).toBe('div');
    });

    it('should handle cn() with many string arguments', () => {
      const code = `<div className={cn("a", "b", "c", "d", "e", "f")}>Test</div>`;
      const result = parseComponent(code);
      
      expect(result.type).toBe('div');
      expect(result.props?.className).toContain('a');
    });

    it('should handle clsx function like cn', () => {
      const code = `<div className={clsx("base", condition && "conditional")}>Test</div>`;
      const result = parseComponent(code);
      
      expect(result.type).toBe('div');
    });

    it('should parse component with numeric variable', () => {
      const code = `
        const count = 5;
        const App = () => <div data-count={count}>Test</div>;
      `;
      const result = parseComponent(code);
      
      expect(result.type).toBe('div');
    });

    it('should parse component with boolean variable', () => {
      const code = `
        const isEnabled = true;
        const App = () => <button disabled={isEnabled}>Test</button>;
      `;
      const result = parseComponent(code);
      
      expect(result.type).toBe('button');
    });

    it('should handle array in variableMap', () => {
      const code = `
        const items = ["a", "b", "c"];
        const App = () => <ul>{items.map(i => <li>{i}</li>)}</ul>;
      `;
      const result = parseComponent(code);
      
      expect(result).toBeDefined();
    });

    it('should handle object property access from variableMap', () => {
      const code = `
        const user = { name: "John", age: 30 };
        const App = () => <div>{user.name} - {user.age}</div>;
      `;
      const result = parseComponent(code);
      
      expect(result.type).toBe('div');
    });

    it('should handle cn() with function call that returns empty', () => {
      const code = `<div className={cn(getData())}>Test</div>`;
      const result = parseComponent(code);
      
      expect(result.type).toBe('div');
    });

    it('should handle deeply nested function calls in cn', () => {
      const code = `<div className={cn(getOuter(getInner("value")))}>Test</div>`;
      const result = parseComponent(code);
      
      expect(result.type).toBe('div');
    });

    it('should handle logical expression with function call', () => {
      const code = `<div>{show && renderContent()}</div>`;
      const result = parseComponent(code);
      
      expect(result.type).toBe('div');
    });

    it('should handle binary expression in JSX', () => {
      const code = `<div>{count + 1}</div>`;
      const result = parseComponent(code);
      
      expect(result.type).toBe('div');
    });
  });

  describe('SourceLocation', () => {
    it('should have correct interface', () => {
      const loc: SourceLocation = {
        start: { line: 1, column: 0 },
        end: { line: 1, column: 10 },
      };
      
      expect(loc.start.line).toBe(1);
      expect(loc.start.column).toBe(0);
      expect(loc.end.line).toBe(1);
      expect(loc.end.column).toBe(10);
    });
  });
});

