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
  // 추가 스타일 속성 (fontWeight, fontStyle, color 등)
  if (updates.style) {
    Object.entries(updates.style).forEach(([key, value]) => {
      styleUpdates[key] = String(value);
    });
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
  
  // 기존 style 속성에서 스타일 값들 추출 (backgroundColor, zIndex 등 보존)
  const existingStyles: Record<string, string> = {};
  
  // style={{ ... }} 내용을 중첩 괄호를 고려하여 추출
  const styleStartIdx = openingTagContent.indexOf('style={{');
  if (styleStartIdx !== -1) {
    let braceCount = 0;
    let styleContentStart = styleStartIdx + 8; // 'style={{' 길이
    let styleContentEnd = -1;
    
    for (let i = styleContentStart; i < openingTagContent.length; i++) {
      if (openingTagContent[i] === '{') {
        braceCount++;
      } else if (openingTagContent[i] === '}') {
        if (braceCount === 0) {
          styleContentEnd = i;
          break;
        }
        braceCount--;
      }
    }
    
    if (styleContentEnd !== -1) {
      const styleContent = openingTagContent.substring(styleContentStart, styleContentEnd);
      console.log('[codeModifier] 스타일 내용:', styleContent);
      
      // 각 스타일 속성 파싱 - 콤마로 분리하되 따옴표 안의 콤마는 무시
      let currentProp = '';
      let inString = false;
      let stringChar = '';
      
      for (let i = 0; i < styleContent.length; i++) {
        const char = styleContent[i];
        
        if ((char === '"' || char === "'") && (i === 0 || styleContent[i - 1] !== '\\')) {
          if (!inString) {
            inString = true;
            stringChar = char;
          } else if (char === stringChar) {
            inString = false;
          }
        }
        
        if (char === ',' && !inString) {
          // 속성 완료
          const prop = currentProp.trim();
          if (prop) {
            const colonIndex = prop.indexOf(':');
            if (colonIndex > 0) {
              const key = prop.substring(0, colonIndex).trim();
              let value = prop.substring(colonIndex + 1).trim();
              // 따옴표 제거
              if ((value.startsWith('"') && value.endsWith('"')) || 
                  (value.startsWith("'") && value.endsWith("'"))) {
                value = value.slice(1, -1);
              }
              existingStyles[key] = value;
            }
          }
          currentProp = '';
        } else {
          currentProp += char;
        }
      }
      
      // 마지막 속성 처리
      const prop = currentProp.trim();
      if (prop) {
        const colonIndex = prop.indexOf(':');
        if (colonIndex > 0) {
          const key = prop.substring(0, colonIndex).trim();
          let value = prop.substring(colonIndex + 1).trim();
          if ((value.startsWith('"') && value.endsWith('"')) || 
              (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
          }
          existingStyles[key] = value;
        }
      }
      
      console.log('[codeModifier] 기존 스타일 추출:', existingStyles);
    }
  }
  
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
  
  // 기존 스타일과 새 스타일 병합 (새 스타일이 우선)
  const mergedStyles: Record<string, string> = { ...existingStyles, ...styleUpdates };
  
  // 새 style 속성 생성 (숫자 값은 따옴표 없이, 문자열 값은 따옴표 포함)
  const newStyleString = Object.entries(mergedStyles)
    .map(([key, value]) => {
      // zIndex 같은 숫자 값은 따옴표 없이
      if (key === 'zIndex' && !isNaN(Number(value))) {
        return `${key}: ${value}`;
      }
      return `${key}: "${value}"`;
    })
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

/**
 * 새로운 도형을 코드에 삽입
 * @param code - 원본 코드
 * @param shapeType - 도형 타입
 * @param bounds - 도형의 위치와 크기
 * @param zIndex - z-index 값 (기본값: 100)
 */
export function insertShapeInCode(
  code: string,
  shapeType: string,
  bounds: { x: number; y: number; width: number; height: number },
  zIndex: number = 100
): string {
  console.log('[codeModifier] insertShapeInCode 호출:', { shapeType, bounds, zIndex });
  
  // 도형 타입에 따른 JSX 생성
  const shapeJSX = generateShapeJSX(shapeType, bounds, zIndex);
  
  if (!shapeJSX) {
    console.warn('[codeModifier] 도형 JSX 생성 실패');
    return code;
  }
  
  // return 문 찾기 - 마지막 return을 찾음 (중첩된 함수 내부의 return 방지)
  // 1. return ( 패턴
  // 2. return < 패턴
  // 3. 화살표 함수에서 직접 JSX 반환: => (
  // 4. 화살표 함수에서 직접 JSX 반환: => <
  
  let insertIndex = -1;
  let baseIndent = '    ';
  
  // 방법 1: return 문 찾기
  const returnRegex = /return\s*\(/g;
  let lastReturnMatch: RegExpExecArray | null = null;
  let match: RegExpExecArray | null;
  
  while ((match = returnRegex.exec(code)) !== null) {
    lastReturnMatch = match;
  }
  
  if (lastReturnMatch) {
    console.log('[codeModifier] return ( 찾음, 위치:', lastReturnMatch.index);
    
    const afterReturn = code.substring(lastReturnMatch.index + lastReturnMatch[0].length);
    const tagEndPos = findOpeningTagEnd(afterReturn);
    
    if (tagEndPos !== -1) {
      insertIndex = lastReturnMatch.index + lastReturnMatch[0].length + tagEndPos + 1;
      
      // 들여쓰기 계산
      const linesBefore = code.substring(0, lastReturnMatch.index).split('\n');
      const lastLine = linesBefore[linesBefore.length - 1];
      const indentMatch = lastLine.match(/^([ \t]*)/);
      baseIndent = indentMatch ? indentMatch[1] + '    ' : '      ';
    }
  }
  
  // 방법 2: return < 패턴 (괄호 없이)
  if (insertIndex === -1) {
    const returnDirectRegex = /return\s+</g;
    let lastDirectMatch: RegExpExecArray | null = null;
    
    while ((match = returnDirectRegex.exec(code)) !== null) {
      lastDirectMatch = match;
    }
    
    if (lastDirectMatch) {
      console.log('[codeModifier] return < 찾음, 위치:', lastDirectMatch.index);
      
      // < 위치부터 검색
      const startPos = lastDirectMatch.index + lastDirectMatch[0].length - 1;
      const afterReturn = code.substring(startPos);
      const tagEndPos = findOpeningTagEnd(afterReturn);
      
      if (tagEndPos !== -1) {
        insertIndex = startPos + tagEndPos + 1;
        
        // 들여쓰기 계산
        const linesBefore = code.substring(0, lastDirectMatch.index).split('\n');
        const lastLine = linesBefore[linesBefore.length - 1];
        const indentMatch = lastLine.match(/^([ \t]*)/);
        baseIndent = indentMatch ? indentMatch[1] + '    ' : '      ';
      }
    }
  }
  
  // 방법 3: 화살표 함수 패턴 => (
  if (insertIndex === -1) {
    const arrowParenRegex = /=>\s*\(/g;
    let lastArrowMatch: RegExpExecArray | null = null;
    
    while ((match = arrowParenRegex.exec(code)) !== null) {
      lastArrowMatch = match;
    }
    
    if (lastArrowMatch) {
      console.log('[codeModifier] => ( 찾음, 위치:', lastArrowMatch.index);
      
      const afterArrow = code.substring(lastArrowMatch.index + lastArrowMatch[0].length);
      const tagEndPos = findOpeningTagEnd(afterArrow);
      
      if (tagEndPos !== -1) {
        insertIndex = lastArrowMatch.index + lastArrowMatch[0].length + tagEndPos + 1;
        
        // 들여쓰기 계산
        const linesBefore = code.substring(0, lastArrowMatch.index).split('\n');
        const lastLine = linesBefore[linesBefore.length - 1];
        const indentMatch = lastLine.match(/^([ \t]*)/);
        baseIndent = indentMatch ? indentMatch[1] + '    ' : '      ';
      }
    }
  }
  
  if (insertIndex === -1) {
    console.warn('[codeModifier] JSX 삽입 위치를 찾을 수 없음');
    return code;
  }
  
  console.log('[codeModifier] 삽입 위치:', insertIndex, '들여쓰기:', JSON.stringify(baseIndent));
  
  // 도형 JSX를 루트 요소의 첫 번째 자식으로 삽입
  const indentedShapeJSX = '\n' + baseIndent + shapeJSX;
  
  const result = code.substring(0, insertIndex) + indentedShapeJSX + code.substring(insertIndex);
  
  console.log('[codeModifier] 도형 삽입 완료, 코드 길이 변화:', code.length, '->', result.length);
  
  return result;
}

/**
 * 여는 태그의 끝(>) 위치 찾기
 * Fragment (<>) 와 일반 태그 모두 처리
 */
function findOpeningTagEnd(code: string): number {
  let braceCount = 0;
  let inString = false;
  let stringChar = '';
  let angleCount = 0;
  
  for (let i = 0; i < code.length; i++) {
    const char = code[i];
    const prevChar = i > 0 ? code[i - 1] : '';
    
    // 문자열 처리
    if ((char === '"' || char === "'" || char === '`') && prevChar !== '\\') {
      if (!inString) {
        inString = true;
        stringChar = char;
      } else if (char === stringChar) {
        inString = false;
      }
      continue;
    }
    
    if (inString) continue;
    
    // 중괄호 카운트 (JSX 표현식 내부)
    if (char === '{') braceCount++;
    else if (char === '}') braceCount--;
    
    // < 카운트
    if (char === '<') angleCount++;
    
    // 여는 태그 끝 찾기 (중괄호 밖에서만)
    if (char === '>' && braceCount === 0) {
      // self-closing(/>)이 아니고, 첫 번째 태그일 때만
      if (prevChar !== '/' && angleCount === 1) {
        return i;
      }
      angleCount--;
    }
  }
  
  return -1;
}

/**
 * 도형 타입에 따른 JSX 코드 생성
 */
function generateShapeJSX(
  shapeType: string,
  bounds: { x: number; y: number; width: number; height: number },
  zIndex: number = 100
): string | null {
  const { x, y, width, height } = bounds;
  
  // 고유 ID 생성 (타임스탬프 기반)
  const shapeId = `shape-${Date.now()}`;
  
  // 기본 스타일 - non-self-closing div로 생성
  const baseStyle = `position: "absolute", left: "${x}px", top: "${y}px", width: "${width}px", height: "${height}px", zIndex: ${zIndex}`;
  
  switch (shapeType) {
    case 'rectangle':
      return `<div id="${shapeId}" style={{${baseStyle}, backgroundColor: "#f9a8d4"}}></div>`;
    
    case 'roundedRectangle':
      return `<div id="${shapeId}" style={{${baseStyle}, backgroundColor: "#f9a8d4", borderRadius: "8px"}}></div>`;
    
    case 'parallelogram':
      return `<div id="${shapeId}" style={{${baseStyle}, backgroundColor: "#f9a8d4", transform: "skew(-20deg)"}}></div>`;
    
    case 'circle':
      // 원은 가로/세로 중 작은 값으로 정사각형으로 만듦
      const circleSize = Math.min(width, height);
      return `<div id="${shapeId}" style={{position: "absolute", left: "${x}px", top: "${y}px", width: "${circleSize}px", height: "${circleSize}px", backgroundColor: "#f9a8d4", borderRadius: "50%", zIndex: ${zIndex}}}></div>`;
    
    case 'ellipse':
      return `<div id="${shapeId}" style={{${baseStyle}, backgroundColor: "#f9a8d4", borderRadius: "50%"}}></div>`;
    
    case 'triangle':
      return `<svg id="${shapeId}" style={{position: "absolute", left: "${x}px", top: "${y}px", zIndex: ${zIndex}}} width="${width}" height="${height}" viewBox="0 0 100 100" preserveAspectRatio="none">
        <polygon points="50,0 100,100 0,100" fill="#f9a8d4" />
      </svg>`;
    
    case 'diamond':
      return `<svg id="${shapeId}" style={{position: "absolute", left: "${x}px", top: "${y}px", zIndex: ${zIndex}}} width="${width}" height="${height}" viewBox="0 0 100 100" preserveAspectRatio="none">
        <polygon points="50,0 100,50 50,100 0,50" fill="#f9a8d4" />
      </svg>`;
    
    case 'star':
      return `<svg id="${shapeId}" style={{position: "absolute", left: "${x}px", top: "${y}px", zIndex: ${zIndex}}} width="${width}" height="${height}" viewBox="0 0 100 100" preserveAspectRatio="none">
        <polygon points="50,0 61,35 98,35 68,57 79,91 50,70 21,91 32,57 2,35 39,35" fill="#f9a8d4" />
      </svg>`;
    
    case 'pentagon':
      return `<svg id="${shapeId}" style={{position: "absolute", left: "${x}px", top: "${y}px", zIndex: ${zIndex}}} width="${width}" height="${height}" viewBox="0 0 100 100" preserveAspectRatio="none">
        <polygon points="50,0 100,38 81,100 19,100 0,38" fill="#f9a8d4" />
      </svg>`;
    
    case 'hexagon':
      return `<svg id="${shapeId}" style={{position: "absolute", left: "${x}px", top: "${y}px", zIndex: ${zIndex}}} width="${width}" height="${height}" viewBox="0 0 100 100" preserveAspectRatio="none">
        <polygon points="50,0 93,25 93,75 50,100 7,75 7,25" fill="#f9a8d4" />
      </svg>`;
    
    default:
      console.warn('[codeModifier] 알 수 없는 도형 타입:', shapeType);
      return null;
  }
}

/**
 * 텍스트 박스를 코드에 삽입
 * @param code - 원본 코드
 * @param bounds - 텍스트 박스의 위치와 크기
 * @param zIndex - z-index 값 (기본값: 100)
 */
export function insertTextBoxInCode(
  code: string,
  bounds: { x: number; y: number; width: number; height: number },
  zIndex: number = 100
): string {
  console.log('[codeModifier] insertTextBoxInCode 호출:', { bounds, zIndex });
  
  const { x, y } = bounds;
  const textBoxId = `textbox-${Date.now()}`;
  
  // 텍스트 박스 JSX 생성 (p 태그 사용)
  const textBoxJSX = `<p id="${textBoxId}" style={{position: "absolute", left: "${x}px", top: "${y}px", fontSize: "16px", color: "#333333", zIndex: ${zIndex}, cursor: "text", margin: 0}}>텍스트를 입력하세요</p>`;
  
  // return 문 찾기 (insertShapeInCode와 동일한 로직)
  let insertIndex = -1;
  let baseIndent = '    ';
  
  // 방법 1: return 문 찾기
  const returnRegex = /return\s*\(/g;
  let lastReturnMatch: RegExpExecArray | null = null;
  let match: RegExpExecArray | null;
  
  while ((match = returnRegex.exec(code)) !== null) {
    lastReturnMatch = match;
  }
  
  if (lastReturnMatch) {
    const afterReturn = code.substring(lastReturnMatch.index + lastReturnMatch[0].length);
    const tagEndPos = findOpeningTagEnd(afterReturn);
    
    if (tagEndPos !== -1) {
      insertIndex = lastReturnMatch.index + lastReturnMatch[0].length + tagEndPos + 1;
      
      const linesBefore = code.substring(0, lastReturnMatch.index).split('\n');
      const lastLine = linesBefore[linesBefore.length - 1];
      const indentMatch = lastLine.match(/^([ \t]*)/);
      baseIndent = indentMatch ? indentMatch[1] + '    ' : '      ';
    }
  }
  
  // 방법 2: return < 패턴
  if (insertIndex === -1) {
    const returnDirectRegex = /return\s+</g;
    let lastDirectMatch: RegExpExecArray | null = null;
    
    while ((match = returnDirectRegex.exec(code)) !== null) {
      lastDirectMatch = match;
    }
    
    if (lastDirectMatch) {
      const startPos = lastDirectMatch.index + lastDirectMatch[0].length - 1;
      const afterReturn = code.substring(startPos);
      const tagEndPos = findOpeningTagEnd(afterReturn);
      
      if (tagEndPos !== -1) {
        insertIndex = startPos + tagEndPos + 1;
        
        const linesBefore = code.substring(0, lastDirectMatch.index).split('\n');
        const lastLine = linesBefore[linesBefore.length - 1];
        const indentMatch = lastLine.match(/^([ \t]*)/);
        baseIndent = indentMatch ? indentMatch[1] + '    ' : '      ';
      }
    }
  }
  
  if (insertIndex === -1) {
    console.warn('[codeModifier] JSX 삽입 위치를 찾을 수 없음');
    return code;
  }
  
  const indentedTextBoxJSX = '\n' + baseIndent + textBoxJSX;
  const result = code.substring(0, insertIndex) + indentedTextBoxJSX + code.substring(insertIndex);
  
  console.log('[codeModifier] 텍스트 박스 삽입 완료, 코드 길이 변화:', code.length, '->', result.length);
  
  return result;
}

/**
 * 텍스트 내용을 코드에 반영
 * @param code - 원본 코드
 * @param loc - 텍스트가 포함된 요소의 AST 위치 정보
 * @param newText - 새로운 텍스트 내용
 */
export function updateTextInCode(
  code: string,
  loc: SourceLocation,
  newText: string
): string {
  console.log('[codeModifier] updateTextInCode 호출:', { loc, newText });
  
  const lines = code.split('\n');
  const targetLine = loc.start.line - 1; // 0-indexed
  const endLine = loc.end.line - 1;
  
  if (targetLine < 0 || targetLine >= lines.length) {
    console.warn('[codeModifier] 유효하지 않은 라인 번호:', loc.start.line);
    return code;
  }
  
  // 요소의 시작 문자 인덱스 계산
  let startCharIndex = 0;
  for (let i = 0; i < targetLine; i++) {
    startCharIndex += lines[i].length + 1;
  }
  startCharIndex += loc.start.column;
  
  // 요소의 끝 문자 인덱스 계산
  let endCharIndex = 0;
  for (let i = 0; i < endLine; i++) {
    endCharIndex += lines[i].length + 1;
  }
  endCharIndex += loc.end.column;
  
  // 요소 전체 내용 추출
  const elementContent = code.substring(startCharIndex, endCharIndex);
  console.log('[codeModifier] 요소 내용:', elementContent.substring(0, 100));
  
  // 여는 태그의 끝 (>) 찾기
  let openingTagEnd = -1;
  let braceCount = 0;
  let inString = false;
  let stringChar = '';
  
  for (let i = 0; i < elementContent.length; i++) {
    const char = elementContent[i];
    
    // 문자열 내부 처리
    if ((char === '"' || char === "'" || char === '`') && elementContent[i - 1] !== '\\') {
      if (!inString) {
        inString = true;
        stringChar = char;
      } else if (char === stringChar) {
        inString = false;
      }
      continue;
    }
    
    if (inString) continue;
    
    // 중괄호 카운트 (JSX 표현식 내부 처리)
    if (char === '{') braceCount++;
    else if (char === '}') braceCount--;
    
    // 여는 태그 끝 찾기
    if (char === '>' && braceCount === 0 && elementContent[i - 1] !== '=') {
      openingTagEnd = i;
      break;
    }
  }
  
  if (openingTagEnd === -1) {
    console.warn('[codeModifier] 여는 태그 끝을 찾을 수 없음');
    return code;
  }
  
  // 닫는 태그 찾기
  const closingTagMatch = elementContent.match(/<\/\w+>\s*$/);
  if (!closingTagMatch) {
    console.warn('[codeModifier] 닫는 태그를 찾을 수 없음');
    return code;
  }
  
  const closingTagStart = elementContent.lastIndexOf(closingTagMatch[0]);
  
  // 새로운 요소 내용 생성
  const openingTag = elementContent.substring(0, openingTagEnd + 1);
  const closingTag = elementContent.substring(closingTagStart);
  
  // 텍스트에 특수 문자가 있으면 이스케이프
  const escapedText = newText
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  
  const newElementContent = openingTag + escapedText + closingTag;
  
  console.log('[codeModifier] 새 요소 내용:', newElementContent.substring(0, 100));
  
  // 코드 교체
  const result = code.substring(0, startCharIndex) + newElementContent + code.substring(endCharIndex);
  
  return result;
}

/**
 * SVG 요소의 fill 색상 변경
 * @param code - 원본 코드
 * @param loc - 요소의 AST 위치 정보
 * @param newColor - 새로운 색상
 */
export function updateSvgFillColor(
  code: string,
  loc: SourceLocation,
  newColor: string
): string {
  console.log('[codeModifier] updateSvgFillColor 호출:', { loc, newColor });
  
  const lines = code.split('\n');
  const targetLine = loc.start.line - 1; // 0-indexed
  const endLine = loc.end.line - 1;
  
  if (targetLine < 0 || targetLine >= lines.length) {
    console.warn('[codeModifier] 유효하지 않은 라인 번호:', loc.start.line);
    return code;
  }
  
  // 요소의 시작/끝 문자 인덱스 계산
  let startCharIndex = 0;
  for (let i = 0; i < targetLine; i++) {
    startCharIndex += lines[i].length + 1;
  }
  startCharIndex += loc.start.column;
  
  let endCharIndex = 0;
  for (let i = 0; i < endLine; i++) {
    endCharIndex += lines[i].length + 1;
  }
  endCharIndex += loc.end.column;
  
  // SVG 요소 전체 내용 추출
  const svgContent = code.substring(startCharIndex, endCharIndex);
  console.log('[codeModifier] SVG 요소 내용:', svgContent.substring(0, 200));
  
  // fill 속성 찾아서 변경 (fill="..." 또는 fill='...')
  let updatedContent = svgContent;
  
  // fill="..." 패턴
  const fillPattern = /fill="[^"]*"/g;
  if (fillPattern.test(svgContent)) {
    updatedContent = svgContent.replace(fillPattern, `fill="${newColor}"`);
  } else {
    // fill='...' 패턴
    const fillPatternSingle = /fill='[^']*'/g;
    if (fillPatternSingle.test(svgContent)) {
      updatedContent = svgContent.replace(fillPatternSingle, `fill="${newColor}"`);
    }
  }
  
  if (updatedContent === svgContent) {
    console.warn('[codeModifier] fill 속성을 찾을 수 없음');
    return code;
  }
  
  // 코드 교체
  const result = code.substring(0, startCharIndex) + updatedContent + code.substring(endCharIndex);
  console.log('[codeModifier] SVG fill 변경 완료');
  
  return result;
}

/**
 * SVG 요소의 stroke 속성 변경
 * @param code - 원본 코드
 * @param loc - 요소의 AST 위치 정보
 * @param strokeColor - 테두리 색상
 * @param strokeWidth - 테두리 두께
 */
export function updateSvgStroke(
  code: string,
  loc: SourceLocation,
  strokeColor: string,
  strokeWidth: number
): string {
  console.log('[codeModifier] updateSvgStroke 호출:', { loc, strokeColor, strokeWidth });
  
  const lines = code.split('\n');
  const targetLine = loc.start.line - 1; // 0-indexed
  const endLine = loc.end.line - 1;
  
  if (targetLine < 0 || targetLine >= lines.length) {
    console.warn('[codeModifier] 유효하지 않은 라인 번호:', loc.start.line);
    return code;
  }
  
  // 요소의 시작/끝 문자 인덱스 계산
  let startCharIndex = 0;
  for (let i = 0; i < targetLine; i++) {
    startCharIndex += lines[i].length + 1;
  }
  startCharIndex += loc.start.column;
  
  let endCharIndex = 0;
  for (let i = 0; i < endLine; i++) {
    endCharIndex += lines[i].length + 1;
  }
  endCharIndex += loc.end.column;
  
  // SVG 요소 전체 내용 추출
  const svgContent = code.substring(startCharIndex, endCharIndex);
  console.log('[codeModifier] SVG 요소 내용:', svgContent.substring(0, 200));
  
  let updatedContent = svgContent;
  
  if (strokeWidth > 0) {
    // stroke 속성 추가/수정
    // 기존 stroke 속성 찾아서 교체
    const strokePattern = /stroke="[^"]*"/g;
    const strokeWidthPattern = /stroke-width="[^"]*"/g;
    
    if (strokePattern.test(svgContent)) {
      updatedContent = svgContent.replace(strokePattern, `stroke="${strokeColor}"`);
    } else {
      // stroke 속성이 없으면 fill 속성 뒤에 추가
      updatedContent = svgContent.replace(/(fill="[^"]*")/, `$1 stroke="${strokeColor}"`);
    }
    
    if (strokeWidthPattern.test(updatedContent)) {
      updatedContent = updatedContent.replace(strokeWidthPattern, `stroke-width="${strokeWidth}"`);
    } else {
      // stroke-width 속성이 없으면 stroke 속성 뒤에 추가
      updatedContent = updatedContent.replace(/(stroke="[^"]*")/, `$1 stroke-width="${strokeWidth}"`);
    }
  } else {
    // strokeWidth가 0이면 stroke 속성 제거
    updatedContent = svgContent
      .replace(/\s*stroke="[^"]*"/g, '')
      .replace(/\s*stroke-width="[^"]*"/g, '');
  }
  
  if (updatedContent === svgContent) {
    console.warn('[codeModifier] stroke 속성 변경 실패');
    return code;
  }
  
  // 코드 교체
  const result = code.substring(0, startCharIndex) + updatedContent + code.substring(endCharIndex);
  console.log('[codeModifier] SVG stroke 변경 완료');
  
  return result;
}

/**
 * 요소를 코드에서 삭제
 * @param code - 원본 코드
 * @param loc - 요소의 AST 위치 정보
 */
export function deleteElementFromCode(
  code: string,
  loc: SourceLocation
): string {
  console.log('[codeModifier] deleteElementFromCode 호출:', { loc });
  
  const lines = code.split('\n');
  const targetLine = loc.start.line - 1; // 0-indexed
  const endLine = loc.end.line - 1;
  
  if (targetLine < 0 || targetLine >= lines.length) {
    console.warn('[codeModifier] 유효하지 않은 라인 번호:', loc.start.line);
    return code;
  }
  
  // 요소의 시작 문자 인덱스 계산
  let startCharIndex = 0;
  for (let i = 0; i < targetLine; i++) {
    startCharIndex += lines[i].length + 1; // +1 for newline
  }
  startCharIndex += loc.start.column;
  
  // 요소의 끝 문자 인덱스 계산
  let endCharIndex = 0;
  for (let i = 0; i < endLine; i++) {
    endCharIndex += lines[i].length + 1;
  }
  endCharIndex += loc.end.column;
  
  // 요소 전체 내용 확인
  const elementContent = code.substring(startCharIndex, endCharIndex);
  console.log('[codeModifier] 삭제할 요소:', elementContent.substring(0, 100));
  
  // 요소 앞의 공백/줄바꿈도 함께 삭제 (깔끔한 코드 유지)
  let deleteStart = startCharIndex;
  while (deleteStart > 0 && (code[deleteStart - 1] === ' ' || code[deleteStart - 1] === '\t')) {
    deleteStart--;
  }
  // 줄바꿈도 삭제 (요소가 한 줄을 차지하는 경우)
  if (deleteStart > 0 && code[deleteStart - 1] === '\n') {
    deleteStart--;
  }
  
  // 요소 삭제
  const result = code.substring(0, deleteStart) + code.substring(endCharIndex);
  
  console.log('[codeModifier] 요소 삭제 완료, 코드 길이 변화:', code.length, '->', result.length);
  
  return result;
}

