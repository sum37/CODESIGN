import { useState, useRef, useEffect } from 'react';
import { FileTree } from '../FileTree/FileTree.tsx';
import { Canvas } from '../Canvas/Canvas.tsx';
import { MonacoEditor } from '../MonacoEditor/MonacoEditor.tsx';
import './IDE.css';

export function IDE() {
  const [canvasWidth, setCanvasWidth] = useState<number | null>(null);
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileTreeWidth = 250; // FileTree 고정 너비
  const minCanvasWidth = 300;
  const minEditorWidth = 300;

  useEffect(() => {
    // 초기 Canvas 너비 설정 (전체 너비의 60%)
    if (containerRef.current && canvasWidth === null) {
      const containerWidth = containerRef.current.offsetWidth;
      const availableWidth = containerWidth - fileTreeWidth;
      setCanvasWidth(availableWidth * 0.6);
    }
  }, [canvasWidth]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !containerRef.current) return;

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
      setIsResizing(false);
    };

    if (isResizing) {
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
  }, [isResizing, minCanvasWidth, minEditorWidth, fileTreeWidth]);

  const editorWidth = containerRef.current && canvasWidth !== null
    ? containerRef.current.offsetWidth - fileTreeWidth - canvasWidth
    : null;

  return (
    <div className="ide-container" ref={containerRef}>
      <div className="ide-panel ide-panel-left">
        <FileTree />
      </div>
      <div 
        className="ide-panel ide-panel-center"
        style={canvasWidth !== null ? { width: `${canvasWidth}px`, flex: 'none' } : undefined}
      >
        <Canvas />
      </div>
      <div 
        className="ide-resizer"
        onMouseDown={handleMouseDown}
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
