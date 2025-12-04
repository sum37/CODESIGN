import React, { useRef } from 'react';
import { ShapeMenu } from './ShapeMenu';
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
        <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 7h16M4 12h16M4 17h10" />
        </svg>
      </button>

      {/* 도형 추가 버튼 */}
      <div style={{ position: 'relative' }} ref={menuRef}>
        <button
          onClick={onToggleShapeMenu}
          className={`canvas-toolbar-button ${pendingShapeType ? 'active' : ''}`}
          title="도형 추가"
        >
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <line x1="9" y1="9" x2="15" y2="15" />
            <line x1="15" y1="9" x2="9" y2="15" />
          </svg>
        </button>
        <ShapeMenu
          showShapeMenu={showShapeMenu}
          onShapeSelect={onShapeSelect}
          pendingShapeType={pendingShapeType}
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
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
        </button>
      </div>
    </div>
  );
}

