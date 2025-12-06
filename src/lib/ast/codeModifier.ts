import * as parser from '@babel/parser';
import * as recast from 'recast';
import * as t from '@babel/types';
import traverse from '@babel/traverse';
import { SourceLocation } from './componentParser';

/**
 * Canvas에서 변경된 요소의 위치/크기/스타일을 코드에 반영
 * @param code - 원본 코드
 * @param elementId - 요소 ID (현재는 미사용, 위치 기반으로 찾음)
 * @param updates - 업데이트할 속성들
 * @param loc - 요소의 AST 위치 정보 (선택적)
 */
export function updateElementInCode(
  code: string,
  elementId: string,
  updates: {
    position?: { x: number; y: number };
    size?: { width: number; height: number };
    style?: Record<string, any>;
  },
  loc?: SourceLocation
): string {
  console.log('[codeModifier] updateElementInCode 호출:', { elementId, updates, loc });
  
  // 위치 정보가 있으면 문자열 기반으로 수정 (AST 파싱 에러 방지)
  if (loc) {
    const result = updateCodeByLocation(code, loc, updates);
    if (result !== code) {
      console.log('[codeModifier] 문자열 기반 수정 성공');
      return result;
    }
  }
  
  // AST 기반 수정 시도 (fallback)
  try {
    const ast = recast.parse(code, {
      parser: {
        parse: (source: string) =>
          parser.parse(source, {
            sourceType: 'module',
            plugins: ['jsx', 'typescript', 'decorators-legacy', 'classProperties'],
            errorRecovery: true,
          }),
      },
    });

    let found = false;

    traverse(ast, {
      JSXElement(path) {
        if (found) return;
        
        const nodeLoc = path.node.loc;
        const tagName = t.isJSXIdentifier(path.node.openingElement.name) 
          ? path.node.openingElement.name.name 
          : 'unknown';
        
        // 위치 정보가 있으면 위치로 매칭
        if (loc && nodeLoc) {
          if (
            nodeLoc.start.line === loc.start.line &&
            nodeLoc.start.column === loc.start.column
          ) {
            console.log('[codeModifier] AST 기반 수정 - 요소 찾음:', tagName);
            updateJSXElementStyle(path.node, updates);
            found = true;
            return;
          }
        }
        
        // 위치 정보가 없으면 id 속성으로 매칭 (fallback)
        const idAttr = path.node.openingElement.attributes.find(
          (attr) => 
            t.isJSXAttribute(attr) && 
            t.isJSXIdentifier(attr.name) && 
            attr.name.name === 'id' &&
            t.isStringLiteral(attr.value) &&
            attr.value.value === elementId
        );
        
        if (idAttr) {
          console.log('[codeModifier] id로 요소 찾음! 스타일 업데이트 중...');
          updateJSXElementStyle(path.node, updates);
          found = true;
        }
      },
    });

    if (!found) {
      console.warn('[codeModifier] 요소를 찾지 못함. loc:', loc);
    }

    return recast.print(ast).code;
  } catch (error) {
    console.error('AST 파싱 실패, 원본 코드 반환:', error);
    return code;
  }
}

/**
 * 문자열 기반으로 코드 수정 (AST 파싱 에러 방지용)
 * 정확한 문자 위치(loc)를 사용해서 해당 요소만 수정
 */
function updateCodeByLocation(
  code: string,
  loc: SourceLocation,
  updates: {
    position?: { x: number; y: number };
    size?: { width: number; height: number };
    style?: Record<string, any>;
  }
): string {
  const lines = code.split('\n');
  const targetLine = loc.start.line - 1; // 0-indexed
  const endLine = loc.end.line - 1;
  
  if (targetLine < 0 || targetLine >= lines.length) {
    console.warn('[codeModifier] 유효하지 않은 라인 번호:', loc.start.line);
    return code;
  }
  
  const line = lines[targetLine];
  const column = loc.start.column;
  
  // 해당 위치에서 시작하는 JSX 태그 찾기
  const tagMatch = line.substring(column).match(/^<(\w+)/);
  if (!tagMatch) {
    console.warn('[codeModifier] JSX 태그를 찾을 수 없음:', line.substring(column, column + 20));
    return code;
  }
  
  const tagName = tagMatch[1];
  console.log('[codeModifier] 문자열 기반 수정 - 태그 발견:', tagName);
  
  // style 속성 생성
  const styleUpdates: Record<string, string> = {};
  if (updates.position) {
    styleUpdates.position = 'absolute';
    styleUpdates.left = `${Math.round(updates.position.x)}px`;
    styleUpdates.top = `${Math.round(updates.position.y)}px`;
  }
  if (updates.size) {
    styleUpdates.width = `${Math.round(updates.size.width)}px`;
    styleUpdates.height = `${Math.round(updates.size.height)}px`;
  }
  
  // 코드에서 정확한 문자 인덱스 계산
  let startCharIndex = 0;
  for (let i = 0; i < targetLine; i++) {
    startCharIndex += lines[i].length + 1; // +1 for newline
  }
  startCharIndex += column;
  
  // 태그의 여는 부분 끝 찾기 (> 위치)
  let openingTagEndLine = targetLine;
  let openingTagEndCol = -1;
  
  for (let i = targetLine; i <= Math.min(endLine, lines.length - 1); i++) {
    const currentLine = lines[i];
    const searchStart = i === targetLine ? column : 0;
    
    for (let j = searchStart; j < currentLine.length; j++) {
      if (currentLine[j] === '>' && j > 0 && currentLine[j - 1] !== '=') {
        openingTagEndLine = i;
        openingTagEndCol = j;
        break;
      }
    }
    if (openingTagEndCol !== -1) break;
  }
  
  if (openingTagEndCol === -1) {
    console.warn('[codeModifier] 태그 끝을 찾을 수 없음');
    return code;
  }
  
  // 끝 문자 인덱스 계산
  let endCharIndex = 0;
  for (let i = 0; i < openingTagEndLine; i++) {
    endCharIndex += lines[i].length + 1;
  }
  endCharIndex += openingTagEndCol + 1; // +1 to include '>'
  
  // 여는 태그 전체 내용 추출 (정확한 인덱스 사용)
  const openingTagContent = code.substring(startCharIndex, endCharIndex);
  
  console.log('[codeModifier] 여는 태그 내용:', openingTagContent.substring(0, 100) + '...');
  console.log('[codeModifier] 위치 인덱스:', { startCharIndex, endCharIndex });
  
  // 모든 style={{...}} 패턴 제거 (중첩된 중괄호 처리)
  let cleanedTag = openingTagContent;
  
  while (cleanedTag.includes('style={{')) {
    const styleStart = cleanedTag.indexOf('style={{');
    let braceCount = 0;
    let styleEnd = -1;
    
    // style={{ 이후부터 시작 (style={{ 는 8글자)
    for (let i = styleStart + 8; i < cleanedTag.length; i++) {
      if (cleanedTag[i] === '{') {
        braceCount++;
      } else if (cleanedTag[i] === '}') {
        if (braceCount === 0) {
          // }} 패턴 확인
          if (i + 1 < cleanedTag.length && cleanedTag[i + 1] === '}') {
            styleEnd = i + 2;
            break;
          }
        } else {
          braceCount--;
        }
      }
    }
    
    if (styleEnd > styleStart) {
      // style 속성과 그 앞의 공백도 제거
      let removeStart = styleStart;
      while (removeStart > 0 && cleanedTag[removeStart - 1] === ' ') {
        removeStart--;
      }
      cleanedTag = cleanedTag.substring(0, removeStart) + cleanedTag.substring(styleEnd);
    } else {
      // 파싱 실패 시 무한 루프 방지
      console.warn('[codeModifier] style 속성 파싱 실패');
      break;
    }
  }
  
  // 새 style 속성 생성
  const newStyleString = Object.entries(styleUpdates)
    .map(([key, value]) => `${key}: "${value}"`)
    .join(', ');
  
  // 태그명 뒤에 새 style 삽입
  const tagNameEndPos = cleanedTag.indexOf(tagName) + tagName.length;
  const newOpeningTag = cleanedTag.substring(0, tagNameEndPos) + 
                        ` style={{${newStyleString}}}` + 
                        cleanedTag.substring(tagNameEndPos);
  
  console.log('[codeModifier] 새 태그:', newOpeningTag.substring(0, 100) + '...');
  
  // 정확한 위치에서 교체 (code.replace 대신 substring 사용)
  const result = code.substring(0, startCharIndex) + newOpeningTag + code.substring(endCharIndex);
  
  return result;
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

