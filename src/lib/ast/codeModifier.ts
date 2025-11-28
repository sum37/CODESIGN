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
    const ast = recast.parse(code, {
      parser: {
        parse: (source: string) =>
          parser.parse(source, {
            sourceType: 'module',
            plugins: ['jsx', 'typescript', 'decorators-legacy', 'classProperties'],
          }),
      },
    });

    traverse(ast, {
      JSXAttribute(path) {
        if (
          t.isJSXIdentifier(path.node.name) &&
          path.node.name.name === 'id' &&
          t.isStringLiteral(path.node.value) &&
          path.node.value.value === elementId
        ) {
          // 해당 요소를 찾았으므로, 부모 JSXElement를 찾아서 수정
          const jsxElement = path.findParent((p) => t.isJSXElement(p.node)) as any;
          if (jsxElement && t.isJSXElement(jsxElement.node)) {
            updateJSXElementStyle(jsxElement.node, updates);
          }
        }
      },
    });

    return recast.print(ast).code;
  } catch (error) {
    console.error('코드 수정 실패:', error);
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

