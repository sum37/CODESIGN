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
      {/* 텍스트 추가 버튼 */}
      <button 
        onClick={onAddText}
        className={`canvas-toolbar-button ${pendingText ? 'active' : ''}`}
        title="텍스트 추가"
      >
        <img src={newTextIcon} alt="텍스트 추가" style={{ width: '60px', height: 'auto' }} />
      </button>

      {/* 도형 추가 버튼 */}
      <div style={{ position: 'relative' }} ref={menuRef}>
        <button
          onClick={onToggleShapeMenu}
          className={`canvas-toolbar-button ${pendingShapeType ? 'active' : ''}`}
          title="도형 추가"
        >
          <img src={newShapeIcon} alt="도형 추가" style={{ width: '70px', height: 'auto' }} />
        </button>
        <ShapeMenu
          showShapeMenu={showShapeMenu}
          onShapeSelect={onShapeSelect}
        />
      </div>

      {/* 이미지 추가 버튼 */}
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
          title="이미지 추가"
        >
          <img src={newImageIcon} alt="이미지 추가" style={{ width: '65px', height: 'auto' }} />
        </button>
      </div>
    </div>
  );
}

