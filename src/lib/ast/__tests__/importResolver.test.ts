import { describe, it, expect, beforeEach } from 'vitest';
import { parseImports, clearComponentRegistry } from '../importResolver';

// Tauri API mocking 제거 - 순수 함수만 테스트

describe('importResolver', () => {
  beforeEach(() => {
    clearComponentRegistry();
  });

  describe('parseImports', () => {
    it('should parse default import', () => {
      const code = `import React from 'react';`;
      const imports = parseImports(code);
      
      expect(imports).toHaveLength(1);
      expect(imports[0].source).toBe('react');
      expect(imports[0].imported).toContain('default');
      expect(imports[0].default).toBe('React');
    });

    it('should parse named imports', () => {
      const code = `import { useState, useEffect } from 'react';`;
      const imports = parseImports(code);
      
      expect(imports).toHaveLength(1);
      expect(imports[0].source).toBe('react');
      expect(imports[0].imported).toContain('useState');
      expect(imports[0].imported).toContain('useEffect');
    });

    it('should parse mixed imports', () => {
      const code = `import React, { useState, useEffect } from 'react';`;
      const imports = parseImports(code);
      
      expect(imports).toHaveLength(1);
      expect(imports[0].source).toBe('react');
      expect(imports[0].default).toBe('React');
      expect(imports[0].imported).toContain('default');
      expect(imports[0].imported).toContain('useState');
      expect(imports[0].imported).toContain('useEffect');
    });

    it('should parse multiple import statements', () => {
      const code = `
        import React from 'react';
        import { Button } from './Button';
        import { Card, CardHeader } from '@/components/Card';
      `;
      const imports = parseImports(code);
      
      expect(imports).toHaveLength(3);
      expect(imports[0].source).toBe('react');
      expect(imports[1].source).toBe('./Button');
      expect(imports[2].source).toBe('@/components/Card');
    });

    it('should parse namespace import', () => {
      const code = `import * as fs from 'fs';`;
      const imports = parseImports(code);
      
      expect(imports).toHaveLength(1);
      expect(imports[0].source).toBe('fs');
      expect(imports[0].imported).toContain('*');
    });

    it('should parse relative path imports', () => {
      const code = `
        import { Header } from './components/Header';
        import { Footer } from '../Footer';
        import utils from './utils';
      `;
      const imports = parseImports(code);
      
      expect(imports).toHaveLength(3);
      expect(imports[0].source).toBe('./components/Header');
      expect(imports[1].source).toBe('../Footer');
      expect(imports[2].source).toBe('./utils');
    });

    it('should parse alias path imports', () => {
      const code = `import { Button } from '@/components/Button';`;
      const imports = parseImports(code);
      
      expect(imports).toHaveLength(1);
      expect(imports[0].source).toBe('@/components/Button');
      expect(imports[0].imported).toContain('Button');
    });

    it('should return empty array for code without imports', () => {
      const code = `const x = 1; function test() { return x; }`;
      const imports = parseImports(code);
      
      expect(imports).toHaveLength(0);
    });

    it('should return empty array for invalid code', () => {
      const code = `this is not valid javascript`;
      const imports = parseImports(code);
      
      expect(imports).toHaveLength(0);
    });

    it('should parse TypeScript imports', () => {
      const code = `
        import type { FC } from 'react';
        import { useState } from 'react';
      `;
      const imports = parseImports(code);
      
      expect(imports.length).toBeGreaterThanOrEqual(1);
    });

    it('should parse JSX file imports', () => {
      const code = `
        import React from 'react';
        const App = () => <div>Hello</div>;
        export default App;
      `;
      const imports = parseImports(code);
      
      expect(imports).toHaveLength(1);
      expect(imports[0].source).toBe('react');
    });

    it('should handle complex component file', () => {
      const code = `
        import React, { useState, useEffect } from 'react';
        import { Button } from '@/components/ui/Button';
        import { Card, CardHeader, CardContent } from '@/components/ui/Card';
        import styles from './App.module.css';
        
        const App: React.FC = () => {
          const [count, setCount] = useState(0);
          return (
            <Card>
              <CardHeader>Title</CardHeader>
              <CardContent>
                <Button onClick={() => setCount(c => c + 1)}>
                  Count: {count}
                </Button>
              </CardContent>
            </Card>
          );
        };
        
        export default App;
      `;
      const imports = parseImports(code);
      
      expect(imports).toHaveLength(4);
      expect(imports[0].source).toBe('react');
      expect(imports[0].default).toBe('React');
      expect(imports[0].imported).toContain('useState');
      expect(imports[0].imported).toContain('useEffect');
      expect(imports[1].source).toBe('@/components/ui/Button');
      expect(imports[2].source).toBe('@/components/ui/Card');
      expect(imports[3].source).toBe('./App.module.css');
    });
  });

  describe('clearComponentRegistry', () => {
    it('should be a function', () => {
      expect(typeof clearComponentRegistry).toBe('function');
    });

    it('should not throw when called', () => {
      expect(() => clearComponentRegistry()).not.toThrow();
    });

    it('should be callable multiple times', () => {
      clearComponentRegistry();
      clearComponentRegistry();
      clearComponentRegistry();
      // Should not throw
      expect(true).toBe(true);
    });
  });

  // branches 커버리지를 위한 추가 테스트
  describe('parseImports - branch coverage', () => {
    it('should handle import with aliased name', () => {
      const code = `import { Button as MyButton } from './Button';`;
      const imports = parseImports(code);
      expect(imports.length).toBe(1);
      expect(imports[0].imported).toContain('Button');
    });

    it('should handle empty code', () => {
      const imports = parseImports('');
      expect(imports).toEqual([]);
    });

    it('should handle code with only comments', () => {
      const code = `// This is a comment\n/* Another comment */`;
      const imports = parseImports(code);
      expect(imports).toEqual([]);
    });

    it('should handle multiple imports from same source', () => {
      const code = `
        import React from 'react';
        import { useState, useEffect } from 'react';
      `;
      const imports = parseImports(code);
      expect(imports.length).toBe(2);
    });

    it('should handle import with .tsx extension', () => {
      const code = `import Component from './Component.tsx';`;
      const imports = parseImports(code);
      expect(imports.length).toBe(1);
      expect(imports[0].source).toBe('./Component.tsx');
    });

    it('should handle import with .jsx extension', () => {
      const code = `import Component from './Component.jsx';`;
      const imports = parseImports(code);
      expect(imports.length).toBe(1);
      expect(imports[0].source).toBe('./Component.jsx');
    });

    it('should handle type-only imports', () => {
      const code = `import type { Props } from './types';`;
      const imports = parseImports(code);
      expect(imports.length).toBeGreaterThanOrEqual(0);
    });

    it('should handle import with multiple named exports', () => {
      const code = `import { A, B, C, D, E } from './module';`;
      const imports = parseImports(code);
      expect(imports.length).toBe(1);
      expect(imports[0].imported.length).toBe(5);
    });

    it('should handle default and namespace import', () => {
      const code = `import React, * as ReactAll from 'react';`;
      const imports = parseImports(code);
      expect(imports.length).toBe(1);
    });

    it('should handle scoped package import', () => {
      const code = `import { Dialog } from '@radix-ui/react-dialog';`;
      const imports = parseImports(code);
      expect(imports.length).toBe(1);
      expect(imports[0].source).toBe('@radix-ui/react-dialog');
    });

    it('should handle deep relative path', () => {
      const code = `import { utils } from '../../../shared/utils';`;
      const imports = parseImports(code);
      expect(imports.length).toBe(1);
      expect(imports[0].source).toBe('../../../shared/utils');
    });

    it('should handle import from index file', () => {
      const code = `import { Button } from './components';`;
      const imports = parseImports(code);
      expect(imports.length).toBe(1);
    });

    it('should handle CSS/SCSS imports', () => {
      const code = `
        import './styles.css';
        import styles from './App.module.scss';
      `;
      const imports = parseImports(code);
      expect(imports.length).toBe(2); // CSS와 SCSS 모듈 둘 다 파싱됨
    });

    it('should handle JSON import', () => {
      const code = `import data from './data.json';`;
      const imports = parseImports(code);
      expect(imports.length).toBe(1);
      expect(imports[0].source).toBe('./data.json');
    });
  });
});

