import * as parser from '@babel/parser';
import * as recast from 'recast';
import * as t from '@babel/types';
import traverse from '@babel/traverse';

/**
 * Canvas에서 변경된 요소의 위치/크기/스타일을 코드에 반영
 */
export function updateElementInCode(
  code: string,
  elementId: string,
  updates: {
    position?: { x: number; y: number };
    size?: { width: number; height: number };
    style?: Record<string, any>;
  }
): string {
  try {
    if (!code || code.trim().length === 0) {
      console.warn('빈 코드입니다. 업데이트할 수 없습니다.');
      return code;
    }

    console.log('updateElementInCode: 코드 파싱 시작, 코드 길이:', code.length, 'elementId:', elementId);
    
    let ast;
    try {
      // recast.parse 대신 parser.parse를 직접 사용하여 파싱 오류 방지
      ast = parser.parse(code, {
        sourceType: 'module',
        plugins: ['jsx', 'typescript', 'decorators-legacy', 'classProperties'],
      });
      console.log('updateElementInCode: 코드 파싱 성공');
    } catch (parseError: any) {
      console.error('updateElementInCode: 코드 파싱 실패:', parseError);
      if (parseError.loc) {
        const lines = code.split('\n');
        const errorLine = lines[parseError.loc.line - 1];
        console.error(`에러 위치: Line ${parseError.loc.line}, Column ${parseError.loc.column || 'unknown'}`);
        console.error(`에러 라인 내용: ${errorLine?.substring(0, 200)}`);
      } else if (parseError.index !== undefined && parseError.lineNumber !== undefined) {
        const lines = code.split('\n');
        const errorLine = lines[parseError.lineNumber - 1];
        console.error(`에러 위치: Line ${parseError.lineNumber}, Column ${parseError.column || 'unknown'}`);
        console.error(`에러 라인 내용: ${errorLine?.substring(0, 200)}`);
      }
      // 파싱 실패 시 원본 코드 반환
      return code;
    }

    let elementFound = false;
    traverse(ast, {
      JSXAttribute(path) {
        if (
          t.isJSXIdentifier(path.node.name) &&
          path.node.name.name === 'id' &&
          t.isStringLiteral(path.node.value) &&
          path.node.value.value === elementId
        ) {
          elementFound = true;
          console.log('updateElementInCode: 요소 찾음, 스타일 업데이트 시작');
          // 해당 요소를 찾았으므로, 부모 JSXElement를 찾아서 수정
          const jsxElement = path.findParent((p) => t.isJSXElement(p.node)) as any;
          if (jsxElement && t.isJSXElement(jsxElement.node)) {
            updateJSXElementStyle(jsxElement.node, updates);
            console.log('updateElementInCode: 스타일 업데이트 완료');
          } else {
            console.warn('updateElementInCode: JSXElement를 찾을 수 없습니다.');
          }
        }
      },
    });

    if (!elementFound) {
      console.warn(`updateElementInCode: elementId '${elementId}'를 가진 요소를 찾을 수 없습니다.`);
      return code;
    }

    const result = recast.print(ast).code;
    console.log('updateElementInCode: 코드 생성 완료');
    return result;
  } catch (error) {
    console.error('updateElementInCode: 코드 수정 실패:', error);
    if (error instanceof Error) {
      console.error('에러 메시지:', error.message);
      console.error('에러 스택:', error.stack);
    }
    // 에러 발생 시 원본 코드 반환
    return code;
  }
}

function updateJSXElementStyle(
  element: t.JSXElement,
  updates: {
    position?: { x: number; y: number };
    size?: { width: number; height: number };
    style?: Record<string, any>;
  }
) {
  const openingElement = element.openingElement;
  let styleAttr = openingElement.attributes.find(
    (attr) => t.isJSXAttribute(attr) && t.isJSXIdentifier(attr.name) && attr.name.name === 'style'
  ) as t.JSXAttribute | undefined;

  const styleUpdates: Record<string, any> = { ...updates.style };

  if (updates.position) {
    styleUpdates.position = 'absolute';
    styleUpdates.left = `${updates.position.x}px`;
    styleUpdates.top = `${updates.position.y}px`;
  }

  if (updates.size) {
    styleUpdates.width = `${updates.size.width}px`;
    styleUpdates.height = `${updates.size.height}px`;
  }

  if (styleAttr && t.isJSXExpressionContainer(styleAttr.value)) {
    // 기존 style 객체 업데이트
    if (t.isObjectExpression(styleAttr.value.expression)) {
      updateObjectExpression(styleAttr.value.expression, styleUpdates);
    }
  } else {
    // 새로운 style 속성 추가
    const styleObject = t.objectExpression(
      Object.entries(styleUpdates).map(([key, value]) =>
        t.objectProperty(
          t.identifier(key),
          typeof value === 'string' ? t.stringLiteral(value) : t.stringLiteral(String(value))
        )
      )
    );
    const newStyleAttr = t.jsxAttribute(
      t.jsxIdentifier('style'),
      t.jsxExpressionContainer(styleObject)
    );
    openingElement.attributes.push(newStyleAttr);
  }
}

function updateObjectExpression(node: t.ObjectExpression, updates: Record<string, any>) {
  const existingProps = new Map<string, t.ObjectProperty>();

  node.properties.forEach((prop) => {
    if (t.isObjectProperty(prop) && t.isIdentifier(prop.key)) {
      existingProps.set(prop.key.name, prop);
    }
  });

  // 업데이트 적용
  Object.entries(updates).forEach(([key, value]) => {
    if (existingProps.has(key)) {
      const prop = existingProps.get(key)!;
      prop.value = typeof value === 'string' ? t.stringLiteral(value) : t.stringLiteral(String(value));
    } else {
      node.properties.push(
        t.objectProperty(
          t.identifier(key),
          typeof value === 'string' ? t.stringLiteral(value) : t.stringLiteral(String(value))
        )
      );
    }
  });
}

/**
 * Shape 객체를 직접 AST로 변환
 */
export function createShapeElementAST(shape: any): t.JSXElement {
  // style 객체 생성
  const styleProperties: t.ObjectProperty[] = [
    t.objectProperty(t.identifier('position'), t.stringLiteral('absolute')),
    t.objectProperty(t.identifier('left'), t.stringLiteral(`${shape.x}px`)),
    t.objectProperty(t.identifier('top'), t.stringLiteral(`${shape.y}px`)),
    t.objectProperty(t.identifier('width'), t.stringLiteral(`${shape.width}px`)),
    t.objectProperty(t.identifier('height'), t.stringLiteral(`${shape.height}px`)),
    t.objectProperty(t.identifier('zIndex'), t.numericLiteral(shape.zIndex || 1000)),
    t.objectProperty(t.identifier('backgroundColor'), t.stringLiteral(shape.color || '#e08fb3')),
    t.objectProperty(t.identifier('pointerEvents'), t.stringLiteral('none')), // 클릭 이벤트 방지 (오버레이가 처리)
  ];

  // borderRadius 추가
  if (shape.type === 'roundedRectangle' && shape.borderRadius !== undefined) {
    styleProperties.push(t.objectProperty(t.identifier('borderRadius'), t.stringLiteral(`${shape.borderRadius}px`)));
  } else if (shape.type === 'circle' || shape.type === 'ellipse') {
    styleProperties.push(t.objectProperty(t.identifier('borderRadius'), t.stringLiteral('50%')));
  } else if (shape.type === 'roundedRectangle') {
    styleProperties.push(t.objectProperty(t.identifier('borderRadius'), t.stringLiteral('10px')));
  } else if (shape.type === 'parallelogram') {
    styleProperties.push(t.objectProperty(t.identifier('transform'), t.stringLiteral('skew(-20deg)')));
  } else if (shape.type === 'diamond') {
    styleProperties.push(t.objectProperty(t.identifier('clipPath'), t.stringLiteral('polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)')));
  } else if (shape.type === 'star') {
    styleProperties.push(t.objectProperty(t.identifier('clipPath'), t.stringLiteral('polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)')));
  } else if (shape.type === 'hexagon') {
    styleProperties.push(t.objectProperty(t.identifier('clipPath'), t.stringLiteral('polygon(30% 0%, 70% 0%, 100% 50%, 70% 100%, 30% 100%, 0% 50%)')));
  } else if (shape.type === 'pentagon') {
    styleProperties.push(t.objectProperty(t.identifier('clipPath'), t.stringLiteral('polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)')));
  }

  // opacity 추가
  if (shape.opacity !== undefined) {
    styleProperties.push(t.objectProperty(t.identifier('opacity'), t.numericLiteral(shape.opacity)));
  }

  // stroke 추가
  if (shape.strokeWidth !== undefined && shape.strokeWidth > 0) {
    styleProperties.push(t.objectProperty(
      t.identifier('border'),
      t.stringLiteral(`${shape.strokeWidth}px solid ${shape.strokeColor ?? '#000000'}`)
    ));
  }

  const styleObject = t.objectExpression(styleProperties);

  // JSX 속성 생성
  const attributes: t.JSXAttribute[] = [
    t.jsxAttribute(
      t.jsxIdentifier('id'),
      t.stringLiteral(shape.id)
    ),
    t.jsxAttribute(
      t.jsxIdentifier('style'),
      t.jsxExpressionContainer(styleObject)
    ),
  ];

  // triangle의 경우 SVG로 생성
  if (shape.type === 'triangle') {
    const svgStyleProperties: t.ObjectProperty[] = [
      t.objectProperty(t.identifier('position'), t.stringLiteral('absolute')),
      t.objectProperty(t.identifier('left'), t.stringLiteral(`${shape.x}px`)),
      t.objectProperty(t.identifier('top'), t.stringLiteral(`${shape.y}px`)),
      t.objectProperty(t.identifier('width'), t.stringLiteral(`${shape.width}px`)),
      t.objectProperty(t.identifier('height'), t.stringLiteral(`${shape.height}px`)),
      t.objectProperty(t.identifier('zIndex'), t.numericLiteral(shape.zIndex || 1000)),
      t.objectProperty(t.identifier('pointerEvents'), t.stringLiteral('none')), // 클릭 이벤트 방지
    ];

    if (shape.opacity !== undefined) {
      svgStyleProperties.push(t.objectProperty(t.identifier('opacity'), t.numericLiteral(shape.opacity)));
    }

    const svgStyle = t.jsxAttribute(
      t.jsxIdentifier('style'),
      t.jsxExpressionContainer(t.objectExpression(svgStyleProperties))
    );

    const polygonAttributes: t.JSXAttribute[] = [
      t.jsxAttribute(
        t.jsxIdentifier('points'),
        t.jsxExpressionContainer(t.templateLiteral(
          [
            t.templateElement({ raw: `${shape.width / 2},0 0,${shape.height} ${shape.width},${shape.height}`, cooked: `${shape.width / 2},0 0,${shape.height} ${shape.width},${shape.height}` }, true)
          ],
          []
        ))
      ),
      t.jsxAttribute(
        t.jsxIdentifier('fill'),
        t.stringLiteral(shape.color)
      ),
    ];

    if (shape.strokeWidth !== undefined && shape.strokeWidth > 0) {
      polygonAttributes.push(
        t.jsxAttribute(t.jsxIdentifier('stroke'), t.stringLiteral(shape.strokeColor ?? '#000000')),
        t.jsxAttribute(t.jsxIdentifier('strokeWidth'), t.jsxExpressionContainer(t.numericLiteral(shape.strokeWidth)))
      );
    }

    return t.jsxElement(
      t.jsxOpeningElement(t.jsxIdentifier('svg'), [t.jsxAttribute(t.jsxIdentifier('id'), t.stringLiteral(shape.id)), svgStyle]),
      t.jsxClosingElement(t.jsxIdentifier('svg')),
      [
        t.jsxElement(
          t.jsxOpeningElement(t.jsxIdentifier('polygon'), polygonAttributes),
          t.jsxClosingElement(t.jsxIdentifier('polygon')),
          []
        ),
      ]
    );
  }

  // 일반 div 요소 생성
  return t.jsxElement(
    t.jsxOpeningElement(t.jsxIdentifier('div'), attributes),
    t.jsxClosingElement(t.jsxIdentifier('div')),
    []
  );
}

/**
 * 기존 React 컴포넌트 코드에 Shape 객체를 추가 (AST 직접 생성 방식)
 */
export function addShapeToCode(code: string, shape: any): string {
  console.log('=== addShapeToCode 시작 ===');
  console.log('shape:', shape);
  console.log('code 길이:', code?.length || 0);
  
  try {
    if (!code || code.trim().length === 0) {
      console.error('빈 코드입니다.');
      return code;
    }

    console.log('코드 파싱 시작, 코드 길이:', code.length);
    let ast;
    try {
      // recast.parse 대신 parser.parse를 직접 사용하여 파싱 오류 방지
      ast = parser.parse(code, {
        sourceType: 'module',
        plugins: ['jsx', 'typescript', 'decorators-legacy', 'classProperties'],
      });
      console.log('코드 파싱 성공');
    } catch (parseError: any) {
      console.error('코드 파싱 실패:', parseError);
      if (parseError.loc) {
        const lines = code.split('\n');
        const errorLine = lines[parseError.loc.line - 1];
        console.error(`에러 위치: Line ${parseError.loc.line}, Column ${parseError.loc.column || 'unknown'}`);
        console.error(`에러 라인 내용: ${errorLine?.substring(0, 200)}`);
      }
      return code;
    }

    // Shape 객체로부터 AST 직접 생성
    const newElement = createShapeElementAST(shape);
    console.log('Shape AST 생성 완료');

    let added = false;
    let jsxFound = false;
    
    // JSX를 추가할 헬퍼 함수
    const addToJSX = (jsxNode: t.JSXElement | t.JSXFragment, parentPath: any) => {
      if (added) return false;
      
      if (t.isJSXElement(jsxNode)) {
        if (
          t.isJSXIdentifier(jsxNode.openingElement.name) &&
          jsxNode.openingElement.name.name === 'Fragment'
        ) {
          jsxNode.children.push(t.jsxText('\n'));
          jsxNode.children.push(newElement);
          jsxNode.children.push(t.jsxText('\n'));
          added = true;
          console.log('Fragment JSXElement에 요소 추가 완료');
          return true;
        } else {
          const fragment = t.jsxElement(
            t.jsxOpeningElement(t.jsxIdentifier('Fragment'), []),
            t.jsxClosingElement(t.jsxIdentifier('Fragment')),
            [
              t.jsxText('\n'),
              jsxNode,
              t.jsxText('\n'),
              newElement,
              t.jsxText('\n'),
            ]
          );
          // 부모 경로를 통해 노드 교체
          if (parentPath) {
            if (parentPath.node) {
              // path.node를 직접 수정
              if (parentPath.isCallExpression && parentPath.node.arguments) {
                // CallExpression의 arguments[0]인 경우
                const argIndex = parentPath.node.arguments.indexOf(jsxNode);
                if (argIndex >= 0) {
                  parentPath.node.arguments[argIndex] = fragment;
                }
              } else if (parentPath.isExpressionStatement) {
                // ExpressionStatement의 expression인 경우
                parentPath.node.expression = fragment;
              } else if (parentPath.isArrowFunctionExpression) {
                // ArrowFunctionExpression의 body인 경우
                parentPath.node.body = fragment;
              } else {
                // 일반적인 경우: path.node를 직접 교체
                Object.assign(parentPath.node, fragment);
              }
            }
          }
          added = true;
          console.log('단일 요소를 Fragment로 감싸서 추가 완료');
          return true;
        }
      } else if (t.isJSXFragment(jsxNode)) {
        jsxNode.children.push(t.jsxText('\n'));
        jsxNode.children.push(newElement);
        jsxNode.children.push(t.jsxText('\n'));
        added = true;
        console.log('Fragment에 요소 추가 완료');
        return true;
      }
      return false;
    };
    
    traverse(ast, {
      // 일반 함수의 return 문
      ReturnStatement(path) {
        jsxFound = true;
        if (added) return;
        
        const returnArg = path.node.argument;
        
        if (!returnArg) {
          console.warn('return 문에 argument가 없습니다.');
          return;
        }
        
        console.log('새 요소 찾음, return 문에 추가 시도, returnArg 타입:', returnArg.type);
        
        if (t.isJSXElement(returnArg) || t.isJSXFragment(returnArg)) {
          addToJSX(returnArg, null);
        } else {
          console.warn('지원하지 않는 return 타입:', returnArg.type);
        }
      },
      
      // 화살표 함수에서 직접 JSX 반환하는 경우: () => <div>...</div>
      ArrowFunctionExpression(path) {
        if (added) return;
        
        const body = path.node.body;
        
        if (t.isJSXElement(body)) {
          jsxFound = true;
          console.log('화살표 함수에서 직접 JSXElement 발견');
          if (
            t.isJSXIdentifier(body.openingElement.name) &&
            body.openingElement.name.name === 'Fragment'
          ) {
            body.children.push(t.jsxText('\n'));
            body.children.push(newElement);
            body.children.push(t.jsxText('\n'));
            added = true;
            console.log('화살표 함수 Fragment에 요소 추가 완료');
          } else {
            const fragment = t.jsxElement(
              t.jsxOpeningElement(t.jsxIdentifier('Fragment'), []),
              t.jsxClosingElement(t.jsxIdentifier('Fragment')),
              [
                t.jsxText('\n'),
                body,
                t.jsxText('\n'),
                newElement,
                t.jsxText('\n'),
              ]
            );
            path.node.body = fragment;
            added = true;
            console.log('화살표 함수 body를 Fragment로 감싸서 추가 완료');
          }
        } else if (t.isJSXFragment(body)) {
          jsxFound = true;
          console.log('화살표 함수에서 직접 JSXFragment 발견');
          body.children.push(t.jsxText('\n'));
          body.children.push(newElement);
          body.children.push(t.jsxText('\n'));
          added = true;
          console.log('화살표 함수 Fragment에 요소 추가 완료');
        } else if (t.isBlockStatement(body)) {
          // 화살표 함수의 블록 안에 return 문이 있는 경우는 ReturnStatement 핸들러가 처리
          jsxFound = true;
        }
      },
      
      // createRoot().render(<JSX>) 같은 패턴 처리
      CallExpression(path) {
        if (added) return;
        
        const callee = path.node.callee;
        
        // .render() 호출 찾기
        if (t.isMemberExpression(callee) && 
            t.isIdentifier(callee.property) && 
            callee.property.name === 'render') {
          
          const args = path.node.arguments;
          if (args.length > 0) {
            const firstArg = args[0];
            
            if (t.isJSXElement(firstArg) || t.isJSXFragment(firstArg)) {
              jsxFound = true;
              console.log('createRoot().render() 패턴에서 JSX 발견');
              // CallExpression의 arguments[0]를 직접 수정
              if (t.isJSXElement(firstArg)) {
                if (
                  t.isJSXIdentifier(firstArg.openingElement.name) &&
                  firstArg.openingElement.name.name === 'Fragment'
                ) {
                  firstArg.children.push(t.jsxText('\n'));
                  firstArg.children.push(newElement);
                  firstArg.children.push(t.jsxText('\n'));
                  added = true;
                  console.log('render() Fragment에 요소 추가 완료');
                } else {
                  const fragment = t.jsxElement(
                    t.jsxOpeningElement(t.jsxIdentifier('Fragment'), []),
                    t.jsxClosingElement(t.jsxIdentifier('Fragment')),
                    [
                      t.jsxText('\n'),
                      firstArg,
                      t.jsxText('\n'),
                      newElement,
                      t.jsxText('\n'),
                    ]
                  );
                  path.node.arguments[0] = fragment;
                  added = true;
                  console.log('render() 인자를 Fragment로 감싸서 추가 완료');
                }
              } else if (t.isJSXFragment(firstArg)) {
                firstArg.children.push(t.jsxText('\n'));
                firstArg.children.push(newElement);
                firstArg.children.push(t.jsxText('\n'));
                added = true;
                console.log('render() Fragment에 요소 추가 완료');
              }
            }
          }
        }
      },
      
      // 최상위 레벨 JSX 표현식 (ExpressionStatement)
      ExpressionStatement(path) {
        if (added) return;
        
        const expr = path.node.expression;
        
        // JSX 표현식인 경우 (예: <App />)
        if (t.isJSXElement(expr) || t.isJSXFragment(expr)) {
          jsxFound = true;
          console.log('최상위 레벨 JSX 표현식 발견');
          if (t.isJSXElement(expr)) {
            if (
              t.isJSXIdentifier(expr.openingElement.name) &&
              expr.openingElement.name.name === 'Fragment'
            ) {
              expr.children.push(t.jsxText('\n'));
              expr.children.push(newElement);
              expr.children.push(t.jsxText('\n'));
              added = true;
              console.log('최상위 Fragment에 요소 추가 완료');
            } else {
              const fragment = t.jsxElement(
                t.jsxOpeningElement(t.jsxIdentifier('Fragment'), []),
                t.jsxClosingElement(t.jsxIdentifier('Fragment')),
                [
                  t.jsxText('\n'),
                  expr,
                  t.jsxText('\n'),
                  newElement,
                  t.jsxText('\n'),
                ]
              );
              path.node.expression = fragment;
              added = true;
              console.log('최상위 표현식을 Fragment로 감싸서 추가 완료');
            }
          } else if (t.isJSXFragment(expr)) {
            expr.children.push(t.jsxText('\n'));
            expr.children.push(newElement);
            expr.children.push(t.jsxText('\n'));
            added = true;
            console.log('최상위 Fragment에 요소 추가 완료');
          }
        }
      },
    });
    
    if (!jsxFound) {
      console.error('JSX를 찾을 수 없습니다. 컴포넌트 함수가 없거나 JSX가 없습니다.');
      console.error('코드 처음 500자:', code.substring(0, 500));
      return code;
    }
    
    if (!added) {
      console.error('요소를 추가하지 못했습니다. return 문을 찾았지만 추가할 수 없었습니다.');
      return code;
    }
    
    console.log('요소 추가 성공, Fragment import 확인 중');

    // Fragment import 추가 (필요한 경우)
    if (added) {
      let hasReactImport = false;
      let hasFragmentImport = false;
      
      traverse(ast, {
        ImportDeclaration(path) {
          if (t.isStringLiteral(path.node.source) && path.node.source.value === 'react') {
            hasReactImport = true;
            path.node.specifiers.forEach((spec) => {
              if (t.isImportSpecifier(spec) && t.isIdentifier(spec.imported) && spec.imported.name === 'Fragment') {
                hasFragmentImport = true;
              }
            });
            
            if (!hasFragmentImport) {
              path.node.specifiers.push(
                t.importSpecifier(t.identifier('Fragment'), t.identifier('Fragment'))
              );
            }
          }
        },
      });

      if (!hasReactImport) {
        const program = ast.program;
        program.body.unshift(
          t.importDeclaration(
            [
              t.importDefaultSpecifier(t.identifier('React')),
              t.importSpecifier(t.identifier('Fragment'), t.identifier('Fragment')),
            ],
            t.stringLiteral('react')
          )
        );
      }
    }

    const result = recast.print(ast).code;
    console.log('코드 생성 완료, 새 코드 길이:', result.length);
    return result;
  } catch (error) {
    console.error('요소 추가 실패:', error);
    if (error instanceof Error) {
      console.error('에러 메시지:', error.message);
      console.error('에러 스택:', error.stack);
    }
    return code;
  }
}

/**
 * 기존 React 컴포넌트 코드에 새로운 JSX 요소를 추가 (문자열 방식 - 하위 호환성)
 */
export function addElementToCode(code: string, jsxElementString: string): string {
  try {
    if (!code || code.trim().length === 0) {
      console.error('빈 코드입니다.');
      return code;
    }

    console.log('코드 파싱 시작, 코드 길이:', code.length);
    let ast;
    try {
      ast = recast.parse(code, {
        parser: {
          parse: (source: string) =>
            parser.parse(source, {
              sourceType: 'module',
              plugins: ['jsx', 'typescript', 'decorators-legacy', 'classProperties'],
            }),
        },
      });
      console.log('코드 파싱 성공');
    } catch (parseError) {
      console.error('코드 파싱 실패:', parseError);
      return code;
    }

    // JSX 요소 문자열을 파싱 - 더 안전한 방법 사용
    console.log('JSX 요소 문자열:', jsxElementString);
    
    // JSX 요소를 별도 파일처럼 파싱 (더 안전함)
    // 들여쓰기 제거하되 줄바꿈은 유지하여 파싱 오류 방지
    const cleanedJsx = jsxElementString
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .join('\n');
    
    // JSX를 React 컴포넌트로 감싸서 파싱
    const componentWrapper = `import React from 'react';\n\nfunction Temp() {\n  return (\n    ${cleanedJsx}\n  );\n}`;
    
    console.log('래핑된 JSX 문자열 (처음 200자):', componentWrapper.substring(0, 200));
    let elementAst;
    try {
      elementAst = recast.parse(componentWrapper, {
        parser: {
          parse: (source: string) =>
            parser.parse(source, {
              sourceType: 'module',
              plugins: ['jsx', 'typescript', 'decorators-legacy', 'classProperties'],
            }),
        },
      });
      console.log('JSX 요소 파싱 성공');
    } catch (parseError) {
      console.error('JSX 요소 파싱 실패:', parseError);
      console.error('파싱 시도한 문자열 (처음 500자):', componentWrapper.substring(0, 500));
      
      // 대안: Fragment로 감싸서 파싱 시도
      try {
        console.log('대안 파싱 방법 시도 (Fragment)');
        const fragmentWrapper = `import React from 'react';\n\nfunction Temp() {\n  return (\n    <>\n      ${cleanedJsx}\n    </>\n  );\n}`;
        elementAst = recast.parse(fragmentWrapper, {
          parser: {
            parse: (source: string) =>
              parser.parse(source, {
                sourceType: 'module',
                plugins: ['jsx', 'typescript', 'decorators-legacy', 'classProperties'],
              }),
          },
        });
        console.log('대안 파싱 성공 (Fragment)');
      } catch (altError) {
        console.error('대안 파싱도 실패:', altError);
        return code;
      }
    }

    let added = false;
    let returnStatementFound = false;
    
    traverse(ast, {
      ReturnStatement(path) {
        returnStatementFound = true;
        if (added) return;
        
        const returnArg = path.node.argument;
        
        if (!returnArg) {
          console.warn('return 문에 argument가 없습니다.');
          return;
        }
        
        let newElement: t.JSXElement | null = null;
        
        if (elementAst.program.body.length > 0) {
          const firstStatement = elementAst.program.body[0];
          
          if (t.isFunctionDeclaration(firstStatement) && firstStatement.body) {
            const returnStmt = firstStatement.body.body.find(stmt => t.isReturnStatement(stmt));
            if (t.isReturnStatement(returnStmt) && returnStmt.argument) {
              if (t.isJSXElement(returnStmt.argument)) {
                newElement = returnStmt.argument;
              } else if (t.isJSXFragment(returnStmt.argument) && returnStmt.argument.children.length > 0) {
                const firstChild = returnStmt.argument.children[0];
                if (t.isJSXElement(firstChild)) {
                  newElement = firstChild;
                }
              }
            }
          } else if (t.isExpressionStatement(firstStatement) && t.isJSXElement(firstStatement.expression)) {
            newElement = firstStatement.expression;
          }
        }
        
        if (!newElement) {
          try {
            console.log('직접 JSX 파싱 시도 (대안 방법)');
            // 정리된 JSX 문자열 사용
            const cleanedJsx = jsxElementString
              .split('\n')
              .map(line => line.trim())
              .filter(line => line.length > 0)
              .join(' ');
            
            // JSX 요소를 Fragment로 감싸서 파싱
            const fragmentWrapper = `<>${cleanedJsx}</>`;
            const directJsxAst = recast.parse(`function Temp() { return ${fragmentWrapper}; }`, {
              parser: {
                parse: (source: string) =>
                  parser.parse(source, {
                    sourceType: 'module',
                    plugins: ['jsx', 'typescript', 'decorators-legacy', 'classProperties'],
                  }),
              },
            });
            
            traverse(directJsxAst, {
              ReturnStatement(path) {
                if (t.isJSXFragment(path.node.argument)) {
                  const fragment = path.node.argument;
                  // Fragment의 첫 번째 자식 요소 찾기
                  for (const child of fragment.children) {
                    if (t.isJSXElement(child)) {
                      newElement = child;
                      console.log('직접 파싱으로 요소 찾음 (Fragment)');
                      break;
                    }
                  }
                } else if (t.isJSXElement(path.node.argument)) {
                  newElement = path.node.argument;
                  console.log('직접 파싱으로 요소 찾음 (JSXElement)');
                }
              },
            });
          } catch (e) {
            console.error('직접 JSX 파싱 실패:', e);
            console.error('파싱 시도한 문자열:', jsxElementString);
          }
        }
        
        if (!newElement) {
          console.warn('새 요소를 찾을 수 없습니다.');
          return;
        }
        
        console.log('새 요소 찾음, return 문에 추가 시도');
        
        if (t.isJSXElement(returnArg)) {
          if (
            t.isJSXIdentifier(returnArg.openingElement.name) &&
            returnArg.openingElement.name.name === 'Fragment'
          ) {
            returnArg.children.push(t.jsxText('\n'));
            returnArg.children.push(newElement);
            returnArg.children.push(t.jsxText('\n'));
            added = true;
          } else {
            const fragment = t.jsxElement(
              t.jsxOpeningElement(t.jsxIdentifier('Fragment'), []),
              t.jsxClosingElement(t.jsxIdentifier('Fragment')),
              [
                t.jsxText('\n'),
                returnArg,
                t.jsxText('\n'),
                newElement,
                t.jsxText('\n'),
              ]
            );
            path.node.argument = fragment;
            added = true;
          }
        } else if (t.isJSXFragment(returnArg)) {
          returnArg.children.push(t.jsxText('\n'));
          returnArg.children.push(newElement);
          returnArg.children.push(t.jsxText('\n'));
          added = true;
          console.log('Fragment에 요소 추가 완료');
        } else {
          console.warn('지원하지 않는 return 타입:', returnArg.type);
        }
      },
    });
    
    if (!returnStatementFound) {
      console.error('return 문을 찾을 수 없습니다. 컴포넌트 함수가 없거나 return 문이 없습니다.');
      return code;
    }
    
    if (!added) {
      console.error('요소를 추가하지 못했습니다. return 문을 찾았지만 추가할 수 없었습니다.');
      return code;
    }
    
    console.log('요소 추가 성공, Fragment import 확인 중');

    // Fragment import 추가 (필요한 경우)
    if (added) {
      let hasReactImport = false;
      let hasFragmentImport = false;
      
      traverse(ast, {
        ImportDeclaration(path) {
          if (t.isStringLiteral(path.node.source) && path.node.source.value === 'react') {
            hasReactImport = true;
            path.node.specifiers.forEach((spec) => {
              if (t.isImportSpecifier(spec) && t.isIdentifier(spec.imported) && spec.imported.name === 'Fragment') {
                hasFragmentImport = true;
              }
            });
            
            if (!hasFragmentImport) {
              path.node.specifiers.push(
                t.importSpecifier(t.identifier('Fragment'), t.identifier('Fragment'))
              );
            }
          }
        },
      });

      if (!hasReactImport) {
        const program = ast.program;
        program.body.unshift(
          t.importDeclaration(
            [
              t.importDefaultSpecifier(t.identifier('React')),
              t.importSpecifier(t.identifier('Fragment'), t.identifier('Fragment')),
            ],
            t.stringLiteral('react')
          )
        );
      }
    }

    const result = recast.print(ast).code;
    console.log('코드 생성 완료, 새 코드 길이:', result.length);
    return result;
  } catch (error) {
    console.error('요소 추가 실패:', error);
    if (error instanceof Error) {
      console.error('에러 메시지:', error.message);
      console.error('에러 스택:', error.stack);
    }
    return code;
  }
}

/**
 * 코드에서 특정 elementId를 가진 JSX 요소를 제거
 */
export function removeElementFromCode(code: string, elementId: string): string {
  console.log('=== removeElementFromCode 시작 ===');
  console.log('elementId:', elementId);
  console.log('code 길이:', code?.length || 0);

  try {
    if (!code || code.trim().length === 0) {
      console.error('빈 코드입니다.');
      return code;
    }

    console.log('코드 파싱 시작, 코드 길이:', code.length);
    let ast;
    try {
      ast = parser.parse(code, {
        sourceType: 'module',
        plugins: ['jsx', 'typescript', 'decorators-legacy', 'classProperties'],
      });
      console.log('코드 파싱 성공');
    } catch (parseError: any) {
      console.error('코드 파싱 실패:', parseError);
      if (parseError.loc) {
        const lines = code.split('\n');
        const errorLine = lines[parseError.loc.line - 1];
        console.error(`에러 위치: Line ${parseError.loc.line}, Column ${parseError.loc.column || 'unknown'}`);
        console.error(`에러 라인 내용: ${errorLine?.substring(0, 200)}`);
      }
      return code;
    }

    let removed = false;

    // JSX 요소에서 id 속성을 찾아서 제거하는 헬퍼 함수
    const findAndRemoveElement = (node: t.Node): boolean => {
      if (t.isJSXElement(node)) {
        // id 속성 찾기
        const idAttr = node.openingElement.attributes.find(
          (attr) =>
            t.isJSXAttribute(attr) &&
            t.isJSXIdentifier(attr.name) &&
            attr.name.name === 'id' &&
            t.isStringLiteral(attr.value) &&
            attr.value.value === elementId
        );

        if (idAttr) {
          console.log('요소 찾음, 제거 시도:', elementId);
          return true; // 제거 대상 발견
        }
      }
      return false;
    };

    // JSX 요소를 제거하는 함수
    const removeFromJSX = (jsxNode: t.JSXElement | t.JSXFragment, parentPath: any): boolean => {
      if (t.isJSXElement(jsxNode)) {
        // 현재 요소가 제거 대상인지 확인
        if (findAndRemoveElement(jsxNode)) {
          // 부모에서 제거
          if (parentPath && parentPath.isArray) {
            // children 배열에서 제거
            const index = parentPath.node.indexOf(jsxNode);
            if (index >= 0) {
              parentPath.node.splice(index, 1);
              removed = true;
              console.log('JSXElement children에서 제거 완료');
              return true;
            }
          }
          return true;
        }

        // children에서 재귀적으로 찾기
        if (jsxNode.children && Array.isArray(jsxNode.children)) {
          for (let i = jsxNode.children.length - 1; i >= 0; i--) {
            const child = jsxNode.children[i];
            if (t.isJSXElement(child) && findAndRemoveElement(child)) {
              jsxNode.children.splice(i, 1);
              removed = true;
              console.log('JSXElement children에서 제거 완료 (재귀)');
              return true;
            } else if (t.isJSXElement(child) || t.isJSXFragment(child)) {
              if (removeFromJSX(child, { node: jsxNode.children, isArray: true })) {
                return true;
              }
            }
          }
        }
      } else if (t.isJSXFragment(jsxNode)) {
        // Fragment의 children에서 찾기
        if (jsxNode.children && Array.isArray(jsxNode.children)) {
          for (let i = jsxNode.children.length - 1; i >= 0; i--) {
            const child = jsxNode.children[i];
            if (t.isJSXElement(child) && findAndRemoveElement(child)) {
              jsxNode.children.splice(i, 1);
              removed = true;
              console.log('JSXFragment children에서 제거 완료');
              return true;
            } else if (t.isJSXElement(child) || t.isJSXFragment(child)) {
              if (removeFromJSX(child, { node: jsxNode.children, isArray: true })) {
                return true;
              }
            }
          }
        }
      }
      return false;
    };

    traverse(ast, {
      ReturnStatement(path) {
        if (removed) return;
        const returnArg = path.node.argument;
        if (!returnArg) return;

        if (t.isJSXElement(returnArg) || t.isJSXFragment(returnArg)) {
          if (removeFromJSX(returnArg, path)) {
            return;
          }
        }
      },

      ArrowFunctionExpression(path) {
        if (removed) return;
        const body = path.node.body;

        if (t.isJSXElement(body) || t.isJSXFragment(body)) {
          if (removeFromJSX(body, path)) {
            return;
          }
        } else if (t.isBlockStatement(body)) {
          // 블록 내부의 return 문 처리
          const returnStmt = body.body.find((stmt) => t.isReturnStatement(stmt));
          if (t.isReturnStatement(returnStmt) && returnStmt.argument) {
            if (t.isJSXElement(returnStmt.argument) || t.isJSXFragment(returnStmt.argument)) {
              if (removeFromJSX(returnStmt.argument, returnStmt)) {
                return;
              }
            }
          }
        }
      },

      CallExpression(path) {
        if (removed) return;
        const callee = path.node.callee;

        if (
          t.isMemberExpression(callee) &&
          t.isIdentifier(callee.property) &&
          callee.property.name === 'render'
        ) {
          const args = path.node.arguments;
          if (args.length > 0) {
            const firstArg = args[0];
            if (t.isJSXElement(firstArg) || t.isJSXFragment(firstArg)) {
              if (removeFromJSX(firstArg, path.get('arguments')[0])) {
                return;
              }
            }
          }
        }
      },

      ExpressionStatement(path) {
        if (removed) return;
        const expr = path.node.expression;
        if (t.isJSXElement(expr) || t.isJSXFragment(expr)) {
          if (removeFromJSX(expr, path)) {
            return;
          }
        }
      },
    });

    if (!removed) {
      console.warn('요소를 찾지 못했습니다:', elementId);
      return code;
    }

    const result = recast.print(ast).code;
    console.log('코드 생성 완료, 새 코드 길이:', result.length);
    return result;
  } catch (error) {
    console.error('요소 제거 실패:', error);
    if (error instanceof Error) {
      console.error('에러 메시지:', error.message);
      console.error('에러 스택:', error.stack);
    }
    return code;
  }
}


