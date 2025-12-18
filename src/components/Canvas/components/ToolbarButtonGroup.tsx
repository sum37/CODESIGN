import React from 'react';
import { ShapeMenu } from './ShapeMenu';
import newTextIcon from '../../../assets/newtext.png';
import newShapeIcon from '../../../assets/newshape.png';
import './Toolbar.css';

interface ToolbarButtonGroupProps {
  pendingText: boolean;
  onAddText: () => void;
  showShapeMenu: boolean;
  onToggleShapeMenu: () => void;
  onShapeSelect: (shapeType: string) => void;
  pendingShapeType: string | null;
  menuRef: React.RefObject<HTMLDivElement>;
}

export function ToolbarButtonGroup({
  pendingText,
  onAddText,
  showShapeMenu,
  onToggleShapeMenu,
  onShapeSelect,
  pendingShapeType,
  menuRef,
}: ToolbarButtonGroupProps) {
  return (
    <div className="canvas-toolbar-group">
      {/* Add Text Button */}
      <button 
        onClick={onAddText}
        className={`canvas-toolbar-button ${pendingText ? 'active' : ''}`}
        title="Add Text"
      >
        <img src={newTextIcon} alt="Add Text" style={{ width: '60px', height: 'auto' }} />
      </button>

      {/* Add Shape Button */}
      <div style={{ position: 'relative' }} ref={menuRef}>
        <button
          onClick={onToggleShapeMenu}
          className={`canvas-toolbar-button ${pendingShapeType ? 'active' : ''}`}
          title="Add Shape"
        >
          <img src={newShapeIcon} alt="Add Shape" style={{ width: '70px', height: 'auto' }} />
        </button>
        <ShapeMenu
          showShapeMenu={showShapeMenu}
          onShapeSelect={onShapeSelect}
          buttonRef={menuRef}
        />
      </div>
    </div>
  );
}
