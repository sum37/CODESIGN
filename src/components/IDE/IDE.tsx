import { FileTree } from '../FileTree/FileTree.tsx';
import { Canvas } from '../Canvas/Canvas.tsx';
import { MonacoEditor } from '../MonacoEditor/MonacoEditor.tsx';
import './IDE.css';

export function IDE() {
  return (
    <div className="ide-container">
      <div className="ide-panel ide-panel-left">
        <FileTree />
      </div>
      <div className="ide-panel ide-panel-center">
        <Canvas />
      </div>
      <div className="ide-panel ide-panel-right">
        <MonacoEditor />
      </div>
    </div>
  );
}
