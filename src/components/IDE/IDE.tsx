import { useState, useRef, useEffect } from 'react';
import { FileTree } from '../FileTree/FileTree.tsx';
import { Canvas } from '../Canvas/Canvas.tsx';
import { MonacoEditor } from '../MonacoEditor/MonacoEditor.tsx';
import './IDE.css';

export function IDE() {
  const [fileTreeWidth, setFileTreeWidth] = useState<number | null>(null);
  const [canvasWidth, setCanvasWidth] = useState<number | null>(null);
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
    if (containerRef.current && fileTreeWidth === null && canvasWidth === null) {
      const containerWidth = containerRef.current.offsetWidth;
      const initialFileTreeWidth = 250;
      const availableWidth = containerWidth - initialFileTreeWidth;
      const initialCanvasWidth = availableWidth * 0.6;
      
      setFileTreeWidth(initialFileTreeWidth);
      setCanvasWidth(initialCanvasWidth);
    }
  }, [fileTreeWidth, canvasWidth]);

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
      if (!isResizingLeft || !containerRef.current || fileTreeWidth === null || canvasWidth === null) return;

      const containerWidth = containerRef.current.offsetWidth;
      const mouseX = e.clientX;
      const containerLeft = containerRef.current.getBoundingClientRect().left;
      const newFileTreeWidth = mouseX - containerLeft;

      // FileTree + Canvas의 총 너비 계산
      const totalLeftWidth = fileTreeWidth + canvasWidth;
      
      // 최소/최대 너비 제한
      const clampedFileTreeWidth = Math.max(
        minFileTreeWidth, 
        Math.min(maxFileTreeWidth, newFileTreeWidth)
      );
      
      // Canvas 너비는 총 너비에서 FileTree 너비를 뺀 값
      const newCanvasWidth = totalLeftWidth - clampedFileTreeWidth;
      
      // Canvas 최소 너비 확인
      if (newCanvasWidth >= minCanvasWidth) {
        setFileTreeWidth(clampedFileTreeWidth);
        setCanvasWidth(newCanvasWidth);
      } else {
        // Canvas가 최소 너비보다 작아지면 FileTree 너비를 제한
        const maxAllowedFileTreeWidth = totalLeftWidth - minCanvasWidth;
        setFileTreeWidth(Math.min(clampedFileTreeWidth, maxAllowedFileTreeWidth));
        setCanvasWidth(Math.max(minCanvasWidth, totalLeftWidth - Math.min(clampedFileTreeWidth, maxAllowedFileTreeWidth)));
      }
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
  }, [isResizingLeft, fileTreeWidth, canvasWidth, minFileTreeWidth, maxFileTreeWidth, minCanvasWidth]);

  // Canvas와 Code Editor 사이 리사이징
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizingRight || !containerRef.current || fileTreeWidth === null || canvasWidth === null) return;

      const containerWidth = containerRef.current.offsetWidth;
      const availableWidth = containerWidth - fileTreeWidth;
      const mouseX = e.clientX;
      const containerLeft = containerRef.current.getBoundingClientRect().left;
      const newCanvasWidth = mouseX - containerLeft - fileTreeWidth;

      // 최소/최대 너비 제한
      const maxCanvasWidth = availableWidth - minEditorWidth;
      const clampedWidth = Math.max(minCanvasWidth, Math.min(maxCanvasWidth, newCanvasWidth));
      
      setCanvasWidth(clampedWidth);
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
  }, [isResizingRight, fileTreeWidth, minCanvasWidth, minEditorWidth]);

  const editorWidth = containerRef.current && fileTreeWidth !== null && canvasWidth !== null
    ? containerRef.current.offsetWidth - fileTreeWidth - canvasWidth
    : null;

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
        style={canvasWidth !== null ? { width: `${canvasWidth}px`, flex: 'none' } : undefined}
      >
        <Canvas />
      </div>
      <div 
        className="ide-resizer ide-resizer-right"
        onMouseDown={handleRightResizerMouseDown}
      />
      <div 
        className="ide-panel ide-panel-right"
        style={editorWidth !== null ? { width: `${editorWidth}px`, flex: 'none' } : undefined}
      >
        <MonacoEditor />
      </div>
    </div>
  );
}
