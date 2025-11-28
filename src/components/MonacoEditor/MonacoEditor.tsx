import { useEffect, useState } from 'react';
import Editor from '@monaco-editor/react';
import { useProjectStore } from '../../stores/projectStore';
import { readFile, writeFile } from '../../lib/fileSystem/fileSystem';
import { useCodeSync } from '../../hooks/useCodeSync';
import './MonacoEditor.css';

export function MonacoEditor() {
  const { selectedFile } = useProjectStore();
  const [code, setCode] = useState<string>('');
  const [language, setLanguage] = useState<string>('typescript');
  const { syncCodeToCanvas } = useCodeSync();

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
    }
  }, [selectedFile]);

  const loadFile = async (filePath: string) => {
    try {
      console.log('파일 로드 시도:', filePath);
      const content = await readFile(filePath);
      console.log('파일 로드 성공:', filePath, '길이:', content.length);
      setCode(content);
    } catch (error) {
      console.error('파일 로드 실패:', error);
      setCode(`// 파일을 읽을 수 없습니다: ${filePath}\n// 에러: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const handleEditorChange = async (value: string | undefined) => {
    if (value === undefined) return;
    
    setCode(value);
    
    // 파일 저장
    if (selectedFile) {
      try {
        await writeFile(selectedFile, value);
      } catch (error) {
        console.error('파일 저장 실패:', error);
      }
    }

    // Canvas에 동기화
    if (selectedFile && (selectedFile.endsWith('.tsx') || selectedFile.endsWith('.jsx'))) {
      syncCodeToCanvas(value);
    }
  };

  return (
    <div className="monaco-editor-container">
      <div className="monaco-editor-header">
        <span className="monaco-editor-title">
          {selectedFile ? selectedFile.split('/').pop() : '파일을 선택하세요'}
        </span>
      </div>
      <div className="monaco-editor-content">
        <Editor
          height="100%"
          language={language}
          value={code}
          onChange={handleEditorChange}
          theme="vs-dark"
          options={{
            minimap: { enabled: true },
            fontSize: 14,
            wordWrap: 'on',
            automaticLayout: true,
            tabSize: 2,
            formatOnPaste: true,
            formatOnType: true,
          }}
        />
      </div>
    </div>
  );
}
