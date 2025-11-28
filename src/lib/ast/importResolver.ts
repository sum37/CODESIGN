import { readFile } from '../fileSystem/fileSystem';
import { path } from '@tauri-apps/api';
import { parseComponent, ComponentNode } from './componentParser';
import * as parser from '@babel/parser';
import traverse from '@babel/traverse';
import * as t from '@babel/types';

/**
 * 컴포넌트 레지스트리: import된 컴포넌트를 캐시
 */
const componentRegistry = new Map<string, ComponentNode>();

/**
 * import 경로를 실제 파일 경로로 변환
 */
export async function resolveImportPath(
  importPath: string,
  currentFile: string
): Promise<string | null> {
  try {
    // 절대 경로인 경우 (예: @/components/Button)
    if (importPath.startsWith('@/')) {
      // 프로젝트 루트에서 찾기
      const projectRoot = currentFile.split('/src/')[0] + '/src/';
      const relativePath = importPath.replace('@/', '');
      let resolvedPath = await path.join(projectRoot, relativePath);
      
      // .tsx 또는 .ts 확장자 추가
      if (!resolvedPath.endsWith('.tsx') && !resolvedPath.endsWith('.ts') && !resolvedPath.endsWith('.jsx') && !resolvedPath.endsWith('.js')) {
        // 먼저 .tsx 시도, 없으면 .ts
        resolvedPath = resolvedPath + '.tsx';
      }
      return resolvedPath;
    }
    
    // 상대 경로인 경우 (예: ./Button, ../components/Button, ./components/Profile)
    if (importPath.startsWith('./') || importPath.startsWith('../')) {
      const currentDir = await path.dirname(currentFile);
      let resolvedPath = await path.join(currentDir, importPath);
      
      // .tsx 또는 .ts 확장자 추가
      if (!resolvedPath.endsWith('.tsx') && !resolvedPath.endsWith('.ts') && !resolvedPath.endsWith('.jsx') && !resolvedPath.endsWith('.js')) {
        // 먼저 .tsx 시도
        resolvedPath = resolvedPath + '.tsx';
      }
      return resolvedPath;
    }
    
    // node_modules에서 찾기 (일단 null 반환)
    return null;
  } catch (error) {
    console.error('Import 경로 해석 실패:', importPath, error);
    return null;
  }
}

/**
 * import된 컴포넌트를 로드하고 파싱
 */
export async function loadImportedComponent(
  importPath: string,
  componentName: string,
  currentFile: string
): Promise<ComponentNode | null> {
  const cacheKey = `${importPath}:${componentName}`;
  
  // 캐시 확인
  if (componentRegistry.has(cacheKey)) {
    return componentRegistry.get(cacheKey)!;
  }
  
  try {
    const resolvedPath = await resolveImportPath(importPath, currentFile);
    if (!resolvedPath) {
      console.warn(`Import 경로를 해석할 수 없습니다: ${importPath}`);
      return null;
    }
    
    // 파일 읽기
    const code = await readFile(resolvedPath);
    
    // 컴포넌트 파싱 (빈 importedComponents로 시작)
    const parsed = parseComponent(code, {
      currentFile: resolvedPath,
      importedComponents: new Map(),
    });
    
    // 캐시에 저장
    componentRegistry.set(cacheKey, parsed);
    
    return parsed;
  } catch (error) {
    console.error(`컴포넌트 로드 실패: ${importPath}:${componentName}`, error);
    return null;
  }
}

/**
 * 파일의 모든 import 문을 파싱하여 컴포넌트 정보 추출
 */
export interface ImportInfo {
  source: string;
  imported: string[];
  default?: string; // Default export의 로컬 이름 (예: "Profile")
}

export function parseImports(code: string): ImportInfo[] {
  try {
    const ast = parser.parse(code, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript', 'decorators-legacy', 'classProperties'],
    });
    
    const imports: ImportInfo[] = [];
    
    traverse(ast, {
      ImportDeclaration(path) {
        const source = path.node.source.value;
        const imported: string[] = [];
        let hasDefault = false;
        
        let defaultName: string | undefined = undefined;
        
        path.node.specifiers.forEach((spec) => {
          if (t.isImportDefaultSpecifier(spec)) {
            // Default export의 로컬 이름 저장
            defaultName = spec.local.name;
            imported.push('default');
          } else if (t.isImportSpecifier(spec)) {
            const importedName = t.isIdentifier(spec.imported) 
              ? spec.imported.name 
              : String(spec.imported);
            imported.push(importedName);
          } else if (t.isImportNamespaceSpecifier(spec)) {
            imported.push('*');
          }
        });
        
        imports.push({
          source,
          imported,
          default: defaultName,
        });
      },
    });
    
    return imports;
  } catch (error) {
    console.error('Import 파싱 실패:', error);
    return [];
  }
}

/**
 * 컴포넌트 레지스트리 초기화
 */
export function clearComponentRegistry() {
  componentRegistry.clear();
}

