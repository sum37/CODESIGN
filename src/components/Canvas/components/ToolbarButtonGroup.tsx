import React, { useRef } from 'react';
import { ShapeMenu } from './ShapeMenu';
import newTextIcon from '../../../assets/newtext.png';
import newShapeIcon from '../../../assets/newshape.png';
import newImageIcon from '../../../assets/newimage.png';
import './Toolbar.css';

interface ToolbarButtonGroupProps {
  pendingText: boolean;
  onAddText: () => void;
  showShapeMenu: boolean;
  onToggleShapeMenu: () => void;
  onShapeSelect: (shapeType: string) => void;
  pendingShapeType: string | null;
  onImageSelect: (file: File) => void;
  menuRef: React.RefObject<HTMLDivElement>;
}

export function ToolbarButtonGroup({
  pendingText,
  onAddText,
  showShapeMenu,
  onToggleShapeMenu,
  onShapeSelect,
  pendingShapeType,
  onImageSelect,
  menuRef,
}: ToolbarButtonGroupProps) {
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageSelect(file);
    }
    e.target.value = '';
  };

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

      {/* Add Image Button */}
      <div>
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={handleImageChange}
        />
        <button 
          onClick={() => imageInputRef.current?.click()}
          className="canvas-toolbar-button"
          title="Add Image"
        >
          <img src={newImageIcon} alt="Add Image" style={{ width: '65px', height: 'auto' }} />
        </button>
      </div>
    </div>
  );
}

