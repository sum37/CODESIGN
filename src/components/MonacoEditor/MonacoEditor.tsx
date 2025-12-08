import { useEffect, useState, useRef, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import { useProjectStore } from '../../stores/projectStore';
import { readFile, writeFile } from '../../lib/fileSystem/fileSystem';
import { useCodeSync } from '../../hooks/useCodeSync';
import './MonacoEditor.css';

export function MonacoEditor() {
  const { selectedFile } = useProjectStore();
  const [code, setCode] = useState<string>('');
  const [savedCode, setSavedCode] = useState<string>(''); // 저장된 코드
  const [language, setLanguage] = useState<string>('typescript');
  const { syncCodeToCanvas } = useCodeSync();
  const editorRef = useRef<any>(null);

  useEffect(() => {
    if (selectedFile) {
      loadFile(selectedFile);
      // 파일 확장자에 따라 언어 설정
      if (selectedFile.endsWith('.tsx') || selectedFile.endsWith('.jsx')) {
        setLanguage('typescript');
      } else if (selectedFile.endsWith('.ts')) {
        setLanguage('typescript');
      } else if (selectedFile.endsWith('.js')) {
        setLanguage('javascript');
      } else if (selectedFile.endsWith('.css')) {
        setLanguage('css');
      } else {
        setLanguage('plaintext');
      }
    } else {
      setCode('');
      setSavedCode('');
    }
  }, [selectedFile]);

  // Canvas에서 코드가 변경되면 에디터도 업데이트 (양방향 동기화)
  useEffect(() => {
    const handleCodeUpdated = (event: CustomEvent<string>) => {
      if (selectedFile && (selectedFile.endsWith('.tsx') || selectedFile.endsWith('.jsx'))) {
        const updatedCode = event.detail;
        setCode(updatedCode);
        setSavedCode(updatedCode); // 파일에 이미 저장되었으므로 saved 상태로 설정
        console.log('Canvas에서 코드 업데이트됨');
      }
    };

    window.addEventListener('code-updated' as any, handleCodeUpdated as EventListener);
    return () => {
      window.removeEventListener('code-updated' as any, handleCodeUpdated as EventListener);
    };
  }, [selectedFile]);

  const loadFile = async (filePath: string) => {
    try {
      console.log('파일 로드 시도:', filePath);
      const content = await readFile(filePath);
      console.log('파일 로드 성공:', filePath, '길이:', content.length);
      setCode(content);
      setSavedCode(content); // 로드한 내용을 저장된 코드로 설정
    } catch (error) {
      console.error('파일 로드 실패:', error);
      setCode(`// 파일을 읽을 수 없습니다: ${filePath}\n// 에러: ${error instanceof Error ? error.message : String(error)}`);
      setSavedCode('');
    }
  };

  const handleEditorChange = (value: string | undefined) => {
    if (value === undefined) return;
    setCode(value);
    // 저장하지 않고 코드만 업데이트
  };

  const handleSave = useCallback(async () => {
    if (!selectedFile) return;

    try {
      await writeFile(selectedFile, code);
      setSavedCode(code); // 저장된 코드 업데이트
      
      // Canvas에 동기화 (저장 시에만)
      if (selectedFile.endsWith('.tsx') || selectedFile.endsWith('.jsx')) {
        syncCodeToCanvas(code);
        // Canvas에 재렌더링 이벤트 발생
        window.dispatchEvent(new CustomEvent('code-saved', { detail: code }));
      }
    } catch (error) {
      console.error('파일 저장 실패:', error);
    }
  }, [code, selectedFile, syncCodeToCanvas]);

  // Ctrl+S 키보드 단축키 처리
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleSave]);

  // 저장되지 않은 상태 확인
  const isUnsaved = code !== savedCode && code !== '';


  return (
    <div className="monaco-editor-container">
      <div className="monaco-editor-header">
        <span className="monaco-editor-title">
          {selectedFile ? (
            <>
              {selectedFile.split('/').pop()}
              {isUnsaved && <span className="monaco-editor-unsaved-indicator">●</span>}
            </>
          ) : (
            '파일을 선택하세요'
          )}
        </span>
      </div>
      <div className="monaco-editor-content">
        <Editor
          height="100%"
          language={language}
          value={code}
          onChange={handleEditorChange}
          theme="custom-dark"
          options={{
            minimap: { enabled: true },
            fontSize: 14,
            wordWrap: 'off', // 가로 스크롤 활성화
            automaticLayout: true,
            tabSize: 2,
            formatOnPaste: true,
            formatOnType: true,
            // 스크롤바 설정
            scrollbar: {
              horizontal: 'visible',
              vertical: 'visible',
              horizontalScrollbarSize: 12,
              verticalScrollbarSize: 12,
            },
            scrollBeyondLastLine: false,
            // 에러 표시 비활성화
            quickSuggestions: false,
            suggestOnTriggerCharacters: false,
            acceptSuggestionOnEnter: 'off',
            tabCompletion: 'off',
            wordBasedSuggestions: 'off',
            // 디버그 및 에러 표시 비활성화
            renderValidationDecorations: 'off',
          }}
          beforeMount={(monaco) => {
            // TypeScript/JavaScript 검증 비활성화
            monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
              noSemanticValidation: true,
              noSyntaxValidation: true,
              noSuggestionDiagnostics: true,
            });
            monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
              noSemanticValidation: true,
              noSyntaxValidation: true,
              noSuggestionDiagnostics: true,
            });
            
            // 테마 커스터마이징 - 더 진한 색상
            monaco.editor.defineTheme('custom-dark', {
              base: 'vs-dark',
              inherit: true,
              rules: [
                { token: '', foreground: 'ffffff', fontStyle: 'normal' }, // 기본 텍스트를 흰색으로
                { token: 'comment', foreground: '6a9955', fontStyle: 'italic' },
                { token: 'keyword', foreground: '569cd6', fontStyle: 'bold' },
                { token: 'string', foreground: 'ce9178' },
                { token: 'number', foreground: 'b5cea8' },
                { token: 'type', foreground: '4ec9b0', fontStyle: 'bold' },
                { token: 'class', foreground: '4ec9b0', fontStyle: 'bold' },
                { token: 'function', foreground: 'dcdcaa' },
                { token: 'variable', foreground: '9cdcfe' },
                { token: 'operator', foreground: 'd4d4d4' },
              ],
              colors: {
                'editor.foreground': '#ffffff', // 기본 텍스트 색상
                'editor.background': '#1e1e1e',
                'editor.lineHighlightBackground': '#2a2d2e',
                'editor.selectionBackground': '#264f78',
                'editorCursor.foreground': '#aeafad',
                'editorWhitespace.foreground': '#3b3a32',
              }
            });
          }}
          onMount={(editor) => {
            editorRef.current = editor;
          }}
        />
      </div>
    </div>
  );
}
