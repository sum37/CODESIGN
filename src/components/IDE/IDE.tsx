import { useState, useRef, useEffect } from 'react';
import { FileTree } from '../FileTree/FileTree.tsx';
import { Canvas } from '../Canvas/Canvas.tsx';
import { MonacoEditor } from '../MonacoEditor/MonacoEditor.tsx';
import './IDE.css';

export function IDE() {
  const [fileTreeWidth, setFileTreeWidth] = useState<number | null>(null);
  const [editorWidth, setEditorWidth] = useState<number | null>(null);
  const [isResizingLeft, setIsResizingLeft] = useState(false);
  const [isResizingRight, setIsResizingRight] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // 최소/최대 너비 설정
  const minFileTreeWidth = 150;
  const maxFileTreeWidth = 400;
  const minCanvasWidth = 300;
  const minEditorWidth = 300;

  useEffect(() => {
    // 초기 너비 설정
    if (containerRef.current && fileTreeWidth === null) {
      const initialFileTreeWidth = 250;
      setFileTreeWidth(initialFileTreeWidth);
    }
    if (containerRef.current && editorWidth === null) {
      const initialEditorWidth = 400;
      setEditorWidth(initialEditorWidth);
    }
  }, [fileTreeWidth, editorWidth]);

  // FileTree와 Canvas 사이 리사이저
  const handleLeftResizerMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizingLeft(true);
  };

  // Canvas와 Code Editor 사이 리사이저
  const handleRightResizerMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizingRight(true);
  };

  // FileTree와 Canvas 사이 리사이징
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizingLeft || !containerRef.current || fileTreeWidth === null) return;

      const mouseX = e.clientX;
      const containerLeft = containerRef.current.getBoundingClientRect().left;
      const newFileTreeWidth = mouseX - containerLeft;

      // 최소/최대 너비 제한
      const clampedFileTreeWidth = Math.max(
        minFileTreeWidth, 
        Math.min(maxFileTreeWidth, newFileTreeWidth)
      );
      
      setFileTreeWidth(clampedFileTreeWidth);
    };

    const handleMouseUp = () => {
      setIsResizingLeft(false);
    };

    if (isResizingLeft) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizingLeft, fileTreeWidth, minFileTreeWidth, maxFileTreeWidth]);

  // Canvas와 Code Editor 사이 리사이징
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizingRight || !containerRef.current || fileTreeWidth === null) return;

      const containerWidth = containerRef.current.offsetWidth;
      const mouseX = e.clientX;
      const containerLeft = containerRef.current.getBoundingClientRect().left;
      const newEditorWidth = containerWidth - (mouseX - containerLeft);

      // 최소/최대 너비 제한
      const clampedEditorWidth = Math.max(minEditorWidth, newEditorWidth);
      
      setEditorWidth(clampedEditorWidth);
    };

    const handleMouseUp = () => {
      setIsResizingRight(false);
    };

    if (isResizingRight) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizingRight, fileTreeWidth, minEditorWidth]);

  return (
    <div className="ide-container" ref={containerRef}>
      <div 
        className="ide-panel ide-panel-left"
        style={fileTreeWidth !== null ? { width: `${fileTreeWidth}px`, flex: 'none' } : undefined}
      >
        <FileTree />
      </div>
      <div 
        className="ide-resizer ide-resizer-left"
        onMouseDown={handleLeftResizerMouseDown}
      />
      <div 
        className="ide-panel ide-panel-center"
        style={{ flex: 1, minWidth: `${minCanvasWidth}px` }}
      >
        <Canvas />
      </div>
      <div 
        className="ide-resizer ide-resizer-right"
        onMouseDown={handleRightResizerMouseDown}
      />
      <div 
        className="ide-panel ide-panel-right"
        style={editorWidth !== null ? { width: `${editorWidth}px`, flex: 'none' } : { width: '400px', minWidth: `${minEditorWidth}px` }}
      >
        <MonacoEditor />
      </div>
    </div>
  );
}
