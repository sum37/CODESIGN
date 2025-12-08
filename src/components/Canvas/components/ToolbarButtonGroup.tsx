import React, { useRef } from 'react';
import { ShapeMenu } from './ShapeMenu';
import './Toolbar.css';
import newtextIcon from '../../../assets/newtext.png';
import newshapeIcon from '../../../assets/newshape.png';
import newimageIcon from '../../../assets/newimage.png';

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
        <img src={newtextIcon} alt="텍스트 추가" style={{ width: '56px', height: '56px' }} />
      </button>

      {/* 도형 추가 버튼 */}
      <div style={{ position: 'relative' }} ref={menuRef}>
        <button
          onClick={onToggleShapeMenu}
          className={`canvas-toolbar-button ${pendingShapeType ? 'active' : ''}`}
          title="도형 추가"
        >
          <img src={newshapeIcon} alt="도형 추가" style={{ width: '56px', height: '56px' }} />
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
          <img src={newimageIcon} alt="이미지 추가" style={{ width: '56px', height: '56px' }} />
        </button>
      </div>
    </div>
  );
}

