import * as parser from '@babel/parser';
import traverse from '@babel/traverse';
import * as t from '@babel/types';
import * as recast from 'recast';
import { parseImports } from './importResolver';

export interface ComponentNode {
  id?: string;
  type: string;
  props?: Record<string, any>;
  children?: ComponentNode[];
  text?: string;
  isImported?: boolean;
  importPath?: string;
  isExpression?: boolean; // JSX 표현식인지 여부
  expressionName?: string; // 표현식 변수 이름 (예: "name")
  expressionText?: string; // 표현식 전체 텍스트
}

export interface ParseComponentOptions {
  currentFile?: string;
  importedComponents?: Map<string, ComponentNode>;
}

export function parseComponent(code: string, options: ParseComponentOptions = {}): ComponentNode {
  try {
    const ast = parser.parse(code, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript', 'decorators-legacy', 'classProperties'],
    });

    // Import 문 파싱
    const imports = parseImports(code);
    const importedComponents = options.importedComponents || new Map<string, ComponentNode>();
    
    // Import된 컴포넌트를 비동기로 로드 (나중에 처리)
    console.log('Import된 컴포넌트:', imports);

    // 변수 선언 추출 (const user = {...}, const contacts = {...} 등)
    const variableMap = new Map<string, any>();
    traverse(ast, {
      VariableDeclarator(path) {
        if (t.isIdentifier(path.node.id)) {
          const varName = path.node.id.name;
          if (path.node.init) {
            if (t.isObjectExpression(path.node.init)) {
              // 객체 리터럴 파싱
              variableMap.set(varName, parseObjectExpression(path.node.init));
            } else if (t.isStringLiteral(path.node.init)) {
              variableMap.set(varName, path.node.init.value);
            } else if (t.isNumericLiteral(path.node.init)) {
              variableMap.set(varName, path.node.init.value);
            } else if (t.isBooleanLiteral(path.node.init)) {
              variableMap.set(varName, path.node.init.value);
            }
          }
        }
      },
    });

    let rootNode: ComponentNode | null = null;
    const allComponents: ComponentNode[] = [];

    // 함수 컴포넌트의 return 문에서 JSX 찾기
    traverse(ast, {
      // 함수 선언 (export default function Component() { return <div>... })
      FunctionDeclaration(path) {
        const returnNode = findReturnJSX(path.node.body, importedComponents, variableMap);
        if (returnNode) {
          allComponents.push(returnNode);
          // 첫 번째 컴포넌트를 rootNode로 설정
          if (!rootNode) {
            rootNode = returnNode;
          }
        }
      },
      // 화살표 함수 (const Component = () => <div>...)
      ArrowFunctionExpression(path) {
        let componentNode: ComponentNode | null = null;
        if (t.isJSXElement(path.node.body)) {
          componentNode = parseJSXElement(path.node.body, importedComponents, variableMap);
        } else if (t.isJSXFragment(path.node.body)) {
          componentNode = {
            type: 'fragment',
            children: path.node.body.children.map((child) => parseJSXChild(child, importedComponents, undefined, variableMap)).filter(Boolean) as ComponentNode[],
          };
        } else if (t.isBlockStatement(path.node.body)) {
          componentNode = findReturnJSX(path.node.body, importedComponents, variableMap);
        }
        
        if (componentNode) {
          allComponents.push(componentNode);
          if (!rootNode) {
            rootNode = componentNode;
          }
        }
      },
      // 직접 JSX 요소 (fallback)
      JSXElement(path) {
        if (!rootNode) {
          rootNode = parseJSXElement(path.node, importedComponents, variableMap);
        }
      },
      JSXFragment(path) {
        if (!rootNode) {
          rootNode = {
            type: 'fragment',
            children: path.node.children.map((child) => parseJSXChild(child, importedComponents, undefined, variableMap)).filter(Boolean) as ComponentNode[],
          };
        }
      },
    });

    // 여러 컴포넌트가 있는 경우, 모두 포함하는 컨테이너로 감싸기
    if (allComponents.length > 1) {
      console.log(`여러 컴포넌트 발견: ${allComponents.length}개`);
      return {
        type: 'div',
        props: { className: 'multi-component-container' },
        children: allComponents.map((comp, idx) => ({
          ...comp,
          id: comp.id || `component-${idx}`,
        })),
      };
    }

    if (!rootNode) {
      console.warn('컴포넌트를 파싱할 수 없습니다. 기본 div를 반환합니다.');
      // 기본 div 컨테이너 반환
      return {
        type: 'div',
        props: {},
        children: [],
      };
    }

    return rootNode;
  } catch (error) {
    console.error('컴포넌트 파싱 오류:', error);
    // 에러 발생 시에도 기본 구조 반환
    return {
      type: 'div',
      props: {},
      children: [
        {
          type: 'text',
          text: '파싱 오류: 컴포넌트를 렌더링할 수 없습니다.',
        },
      ],
    };
  }
}

// return 문에서 JSX 찾기
function findReturnJSX(body: t.BlockStatement | null | undefined, importedComponents?: Map<string, ComponentNode>, variableMap?: Map<string, any>): ComponentNode | null {
  if (!body || !t.isBlockStatement(body)) return null;

  for (const statement of body.body) {
    if (t.isReturnStatement(statement) && statement.argument) {
      if (t.isJSXElement(statement.argument)) {
        return parseJSXElement(statement.argument, importedComponents, variableMap);
      } else if (t.isJSXFragment(statement.argument)) {
        return {
          type: 'fragment',
          children: statement.argument.children.map((child) => parseJSXChild(child, importedComponents, undefined, variableMap)).filter(Boolean) as ComponentNode[],
        };
      }
    }
  }
  return null;
}

function parseJSXElement(node: t.JSXElement, importedComponents?: Map<string, ComponentNode>, variableMap?: Map<string, any>): ComponentNode {
  const openingElement = node.openingElement;
  const name = getJSXElementName(openingElement.name);
  
  // Import된 컴포넌트인지 확인
  const isImportedComponent = importedComponents?.has(name);
  const importedComponent = isImportedComponent ? importedComponents!.get(name) : null;
  
  const props: Record<string, any> = {};
  const style: Record<string, any> = {};

  // 속성 파싱
  openingElement.attributes.forEach((attr) => {
    if (t.isJSXAttribute(attr)) {
      const key = attr.name.name as string;
      const value = parseJSXAttributeValue(attr.value, variableMap);
      
      if (key === 'style' && typeof value === 'object') {
        Object.assign(style, value);
      } else if (key === 'id') {
        props.id = value;
      } else if (key === 'data-slot') {
        // data-slot 같은 속성도 저장
        props[key] = value;
      } else if (key === 'className') {
        // className도 저장 (나중에 표시용)
        props.className = value;
      } else {
        props[key] = value;
      }
    } else if (t.isJSXSpreadAttribute(attr)) {
      // {...props} 스프레드 연산자 처리
      // 실제 값은 파싱할 수 없으므로 표시만
      props['_spread'] = true;
    }
  });

  if (Object.keys(style).length > 0) {
    props.style = style;
  }

  // children 파싱 (부모 타입 전달)
  const children: ComponentNode[] = node.children
    .map((child) => parseJSXChild(child, importedComponents, name, variableMap))
    .filter(Boolean) as ComponentNode[];

  // children이 없고 self-closing 태그인 경우, 기본 표시용 children 추가
  if (children.length === 0 && node.closingElement === null) {
    // self-closing 태그이지만 표시를 위해 빈 텍스트 추가하지 않음
  }

  // Import된 컴포넌트인 경우, 해당 컴포넌트의 구조를 사용
  if (isImportedComponent && importedComponent) {
    // Import된 컴포넌트를 복사하고 props와 children을 병합
    // children은 현재 요소의 children을 우선 사용 (props로 전달된 children)
    const mergedChildren = children.length > 0 
      ? children 
      : (importedComponent.children || []);
    
    // props 병합 (현재 props가 우선) 및 정리
    const mergedProps: Record<string, any> = {};
    
    // Import된 컴포넌트의 props 정리
    if (importedComponent.props) {
      Object.entries(importedComponent.props).forEach(([key, value]) => {
        if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
          mergedProps[key] = value;
        }
      });
    }
    
    // 현재 props 추가 (우선순위 높음)
    Object.entries(props).forEach(([key, value]) => {
      if (key === 'style') {
        // style은 이미 처리됨
      } else if (typeof value === 'string' && value.startsWith('__VAR__')) {
        // 변수 참조는 제외 (런타임 값이므로 파싱 불가)
        // 하지만 객체 props는 파싱된 객체를 사용
      } else if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        mergedProps[key] = value;
      } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        // 객체 props도 저장 (예: info={user})
        mergedProps[key] = value;
      }
    });
    
    // Import된 컴포넌트의 children에서 props 참조를 실제 값으로 대체 (재귀적으로)
    const replaceExpressionsInNode = (node: ComponentNode, props: Record<string, any>): ComponentNode => {
      // 텍스트 노드이고 표현식인 경우
      if (node.type === 'text' && node.isExpression) {
        let propValue: any = undefined;
        
        // 단순 변수 참조 (예: {name})
        if (node.expressionName) {
          propValue = props[node.expressionName];
        }
        // 멤버 표현식 (예: {info.name})
        else if (node.expressionText) {
          // expressionText를 파싱하여 객체 속성 접근
          const parts = node.expressionText.split('.');
          if (parts.length === 2) {
            const [objName, propName] = parts;
            const obj = props[objName];
            if (obj && typeof obj === 'object' && propName in obj) {
              propValue = obj[propName];
            }
          } else if (parts.length === 3) {
            // 중첩된 속성 (예: info.contact1)
            const [objName, ...rest] = parts;
            const obj = props[objName];
            if (obj && typeof obj === 'object') {
              let current = obj;
              for (const part of rest) {
                if (current && typeof current === 'object' && part in current) {
                  current = current[part];
                } else {
                  current = undefined;
                  break;
                }
              }
              propValue = current;
            }
          }
        }
        
        if (propValue !== undefined) {
          return {
            ...node,
            text: String(propValue),
            isExpression: false,
          };
        }
      }
      
      // children이 있는 경우 재귀적으로 처리
      if (node.children && node.children.length > 0) {
        return {
          ...node,
          children: node.children.map((child) => replaceExpressionsInNode(child, props)),
        };
      }
      
      return node;
    };
    
    const processedChildren = mergedChildren.map((child) => replaceExpressionsInNode(child, mergedProps));
    
    return {
      ...importedComponent,
      id: mergedProps.id as string | undefined,
      type: importedComponent.type, // Import된 컴포넌트의 타입 사용
      props: Object.keys(mergedProps).length > 0 ? mergedProps : undefined,
      children: processedChildren.length > 0 ? processedChildren : undefined,
      isImported: true,
    };
  }

  // props에서 객체 값 제거 (문자열, 숫자, 불린만 유지)
  const cleanProps: Record<string, any> = {};
  Object.entries(props).forEach(([key, value]) => {
    if (key === 'style') {
      // style은 이미 처리됨
    } else if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      cleanProps[key] = value;
    } else if (value === null || value === undefined) {
      // null/undefined는 제외
    }
    // 객체는 제외 (className은 문자열이므로 포함됨)
  });

  return {
    id: cleanProps.id as string | undefined,
    type: name,
    props: Object.keys(cleanProps).length > 0 ? cleanProps : undefined,
    children: children.length > 0 ? children : undefined,
    isImported: isImportedComponent,
  };
}

function parseJSXChild(node: t.Node, importedComponents?: Map<string, ComponentNode>, parentType?: string, variableMap?: Map<string, any>): ComponentNode | null {
  // option 태그 내부의 요소들은 모두 텍스트로 변환
  if (parentType === 'option') {
    if (t.isJSXText(node)) {
      const text = node.value.trim();
      if (text) {
        return {
          type: 'text',
          text,
        };
      }
    } else if (t.isJSXElement(node)) {
      // option 내부의 요소는 텍스트로 변환
      const textContent = extractTextFromJSX(node);
      if (textContent) {
        return {
          type: 'text',
          text: textContent,
        };
      }
    } else if (t.isJSXExpressionContainer(node)) {
      // JSX 주석 처리: {/* ... */}는 JSXEmptyExpression으로 파싱됨
      if (t.isJSXEmptyExpression(node.expression)) {
        // 주석은 무시
        return null;
      }
      return {
        type: 'text',
        text: String(node.expression),
      };
    }
    return null;
  }
  
  if (t.isJSXElement(node)) {
    return parseJSXElement(node, importedComponents, variableMap);
  } else if (t.isJSXExpressionContainer(node)) {
    // JSX 주석 처리: {/* ... */}는 JSXEmptyExpression으로 파싱됨
    if (t.isJSXEmptyExpression(node.expression)) {
      // 주석은 무시
      return null;
    }
    
    if (t.isJSXElement(node.expression)) {
      return parseJSXElement(node.expression, importedComponents, variableMap);
    } else if (t.isIdentifier(node.expression)) {
      // 변수 참조 (예: {name}, {age})는 props를 참조할 수 있으므로 특별한 마커 사용
      return {
        type: 'text',
        text: `{${node.expression.name}}`,
        isExpression: true,
        expressionName: node.expression.name,
      };
    } else if (t.isMemberExpression(node.expression)) {
      // 멤버 표현식 (예: {user.name})도 처리
      const exprText = recast.print(node.expression).code;
      return {
        type: 'text',
        text: `{${exprText}}`,
        isExpression: true,
        expressionText: exprText,
      };
    }
    // 다른 표현식은 텍스트로 처리
    const exprText = recast.print(node.expression).code;
    return {
      type: 'text',
      text: `{${exprText}}`,
    };
  } else if (t.isJSXText(node)) {
    const text = node.value.trim();
    if (text) {
      return {
        type: 'text',
        text,
      };
    }
  }
  return null;
}

// JSX 요소에서 텍스트만 추출
function extractTextFromJSX(node: t.JSXElement): string {
  let text = '';
  for (const child of node.children) {
    if (t.isJSXText(child)) {
      text += child.value;
    } else if (t.isJSXElement(child)) {
      text += extractTextFromJSX(child);
    } else if (t.isJSXExpressionContainer(child)) {
      text += String(child.expression);
    }
  }
  return text.trim();
}

function getJSXElementName(name: t.JSXElement['openingElement']['name']): string {
  if (t.isJSXIdentifier(name)) {
    return name.name;
  } else if (t.isJSXMemberExpression(name)) {
    return `${getJSXElementName(name.object)}.${name.property.name}`;
  }
  return 'unknown';
}

function parseJSXAttributeValue(value: t.JSXAttribute['value'] | null, variableMap?: Map<string, any>): any {
  if (!value) return true;
  
  if (t.isStringLiteral(value)) {
    return value.value;
  } else if (t.isJSXExpressionContainer(value)) {
    const expr = value.expression;
    
    if (t.isStringLiteral(expr)) {
      return expr.value;
    } else if (t.isNumericLiteral(expr)) {
      return expr.value;
    } else if (t.isBooleanLiteral(expr)) {
      return expr.value;
    } else if (t.isObjectExpression(expr)) {
      // 객체 표현식 파싱 (예: {name: "수민", age: 14})
      return parseObjectExpression(expr);
    } else if (t.isIdentifier(expr)) {
      // 변수 참조: variableMap에서 값을 찾기
      if (variableMap && variableMap.has(expr.name)) {
        return variableMap.get(expr.name);
      }
      // 없으면 마커 사용
      return `__VAR__${expr.name}`;
    } else if (t.isMemberExpression(expr)) {
      // 멤버 표현식 (예: user.name) 처리
      if (variableMap && t.isIdentifier(expr.object)) {
        const objName = expr.object.name;
        const propName = t.isIdentifier(expr.property) ? expr.property.name : null;
        if (variableMap.has(objName) && propName) {
          const obj = variableMap.get(objName);
          if (obj && typeof obj === 'object' && propName in obj) {
            return obj[propName];
          }
        }
      }
      // 없으면 마커 사용
      return `__VAR__${recast.print(expr).code}`;
    } else if (t.isTemplateLiteral(expr)) {
      // 템플릿 리터럴은 문자열로 변환 시도
      return String(expr);
    } else {
      // 기타 표현식은 마커 사용
      return `__VAR__${recast.print(expr).code}`;
    }
  }
  return null;
}

function parseObjectExpression(node: t.ObjectExpression): Record<string, any> {
  const obj: Record<string, any> = {};
  
  node.properties.forEach((prop) => {
    if (t.isObjectProperty(prop)) {
      const key = t.isIdentifier(prop.key) ? prop.key.name : String(prop.key);
      const value = parseExpressionValue(prop.value);
      obj[key] = value;
    }
  });
  
  return obj;
}

function parseExpressionValue(node: t.Node): any {
  if (!t.isExpression(node)) {
    return null;
  }
  if (t.isStringLiteral(node)) {
    return node.value;
  } else if (t.isNumericLiteral(node)) {
    return node.value;
  } else if (t.isBooleanLiteral(node)) {
    return node.value;
  } else if (t.isObjectExpression(node)) {
    return parseObjectExpression(node);
  }
  return null;
}

