import React from 'react';
import './Toolbar.css';

interface TextEditControlsProps {
  fontSize: number;
  onFontSizeChange: (size: number) => void;
  textColor: string;
  onTextColorChange: (color: string) => void;
  fontWeight: 'normal' | 'bold';
  onFontWeightToggle: () => void;
  fontStyle: 'normal' | 'italic';
  onFontStyleToggle: () => void;
  textAlign: 'left' | 'center' | 'right';
  onTextAlignChange: (align: 'left' | 'center' | 'right') => void;
  showTextColorMenu: boolean;
  onToggleTextColorMenu: () => void;
  textColorMenuRef: React.RefObject<HTMLDivElement>;
}

export function TextEditControls({
  fontSize,
  onFontSizeChange,
  textColor,
  onTextColorChange,
  fontWeight,
  onFontWeightToggle,
  fontStyle,
  onFontStyleToggle,
  textAlign,
  onTextAlignChange,
  showTextColorMenu,
  onToggleTextColorMenu,
  textColorMenuRef,
}: TextEditControlsProps) {
  const buttonStyle = {
    padding: '4px 8px',
    background: '#000000',
    border: '1px solid rgba(244, 114, 182, 0.2)',
    borderRadius: '4px',
    color: '#ffffff',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const buttonHover = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.background = '#1f1f1f';
  };

  const buttonLeave = (e: React.MouseEvent<HTMLButtonElement>, isActive: boolean = false) => {
    e.currentTarget.style.background = isActive ? '#1f1f1f' : '#000000';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '200px' }}>
      {/* 첫 번째 줄: Font, Size */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <select 
          style={{ 
            padding: '4px 8px', 
            background: '#000000', 
            color: '#ffffff', 
            border: '1px solid rgba(244, 114, 182, 0.2)', 
            borderRadius: '4px', 
            fontSize: '14px' 
          }}
        >
          <option style={{ background: '#000000', color: '#ffffff' }}>Nanum Gothic</option>
        </select>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <button 
            style={buttonStyle}
            onMouseEnter={buttonHover}
            onMouseLeave={(e) => buttonLeave(e)}
            onClick={() => onFontSizeChange(Math.max(8, fontSize - 1))}
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>
          <input 
            type="number" 
            value={fontSize}
            onChange={(e) => onFontSizeChange(Math.max(8, Math.min(200, parseInt(e.target.value) || 16)))}
            style={{ 
              width: '36px', 
              padding: '4px', 
              background: '#000000', 
              color: '#ffffff', 
              border: '1px solid rgba(244, 114, 182, 0.2)', 
              borderRadius: '4px', 
              fontSize: '14px',
              textAlign: 'center'
            }}
            onWheel={(e) => e.currentTarget.blur()}
          />
          <button 
            style={buttonStyle}
            onMouseEnter={buttonHover}
            onMouseLeave={(e) => buttonLeave(e)}
            onClick={() => onFontSizeChange(Math.min(200, fontSize + 1))}
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* 두 번째 줄: Text Color, B, I */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ position: 'relative' }} ref={textColorMenuRef}>
          <button 
            onClick={onToggleTextColorMenu}
            style={{ 
              padding: '4px 12px', 
              background: '#000000', 
              borderRadius: '4px', 
              fontSize: '14px', 
              border: '1px solid rgba(244, 114, 182, 0.2)', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              color: '#ffffff',
              cursor: 'pointer'
            }}
            onMouseEnter={buttonHover}
            onMouseLeave={(e) => buttonLeave(e)}
          >
            <span>Text Color</span>
            <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {showTextColorMenu && (
            <div 
              style={{ 
                position: 'absolute', 
                bottom: '100%', 
                left: 0, 
                marginBottom: '4px', 
                background: '#000000', 
                border: '1px solid rgba(244, 114, 182, 0.2)', 
                borderRadius: '4px', 
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)', 
                zIndex: 1000, 
                padding: '12px' 
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <input
                type="color"
                value={textColor}
                onChange={(e) => onTextColorChange(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                style={{ 
                  height: '128px', 
                  width: '100%', 
                  cursor: 'pointer',
                  border: 'none',
                  outline: 'none',
                  background: 'transparent'
                }}
              />
            </div>
          )}
        </div>
        <button 
          onMouseDown={(e) => {
            // 편집 모드에서 포커스가 빠지지 않도록 방지
            e.preventDefault();
          }}
          onClick={() => {
            // 편집 모드인지 확인 (텍스트가 선택되어 있고, contentEditable 요소 내부인지)
            const selection = window.getSelection();
            const activeElement = document.activeElement as HTMLElement;
            
            if (selection && !selection.isCollapsed && activeElement?.isContentEditable) {
              // 편집 모드: 선택된 텍스트에 bold 적용
              document.execCommand('bold', false);
              console.log('[TextEditControls] execCommand bold 실행');
            } else {
              // 선택 모드: 전체 요소의 fontWeight 변경
              onFontWeightToggle();
            }
          }}
          style={{ 
            padding: '4px 12px', 
            background: fontWeight === 'bold' ? '#1f1f1f' : '#000000', 
            borderRadius: '4px', 
            fontSize: '14px', 
            border: '1px solid rgba(244, 114, 182, 0.2)', 
            color: '#ffffff',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
          onMouseEnter={buttonHover}
          onMouseLeave={(e) => buttonLeave(e, fontWeight === 'bold')}
        >
          B
        </button>
        <button 
          onMouseDown={(e) => {
            // 편집 모드에서 포커스가 빠지지 않도록 방지
            e.preventDefault();
          }}
          onClick={() => {
            // 편집 모드인지 확인 (텍스트가 선택되어 있고, contentEditable 요소 내부인지)
            const selection = window.getSelection();
            const activeElement = document.activeElement as HTMLElement;
            
            if (selection && !selection.isCollapsed && activeElement?.isContentEditable) {
              // 편집 모드: 선택된 텍스트에 italic 적용
              document.execCommand('italic', false);
              console.log('[TextEditControls] execCommand italic 실행');
            } else {
              // 선택 모드: 전체 요소의 fontStyle 변경
              onFontStyleToggle();
            }
          }}
          style={{ 
            padding: '4px 12px', 
            background: fontStyle === 'italic' ? '#1f1f1f' : '#000000', 
            borderRadius: '4px', 
            fontSize: '14px', 
            border: '1px solid rgba(244, 114, 182, 0.2)', 
            color: '#ffffff',
            fontStyle: 'italic',
            cursor: 'pointer'
          }}
          onMouseEnter={buttonHover}
          onMouseLeave={(e) => buttonLeave(e, fontStyle === 'italic')}
        >
          I
        </button>
      </div>
      
      {/* 세 번째 줄: 텍스트 정렬 버튼 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <button
          onClick={() => onTextAlignChange('left')}
          style={{ 
            padding: '4px 8px', 
            background: textAlign === 'left' ? 'rgba(249, 168, 212, 0.2)' : '#000000', 
            borderRadius: '4px', 
            fontSize: '14px', 
            border: textAlign === 'left' ? '1px solid #f9a8d4' : '1px solid rgba(244, 114, 182, 0.2)',
            color: '#ffffff',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            if (textAlign !== 'left') e.currentTarget.style.background = '#1f1f1f';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = textAlign === 'left' ? 'rgba(249, 168, 212, 0.2)' : '#000000';
          }}
        >
          <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
            <path d="M3 3h18v2H3V3zm0 4h12v2H3V7zm0 4h18v2H3v-2zm0 4h12v2H3v-2zm0 4h18v2H3v-2z" />
          </svg>
        </button>
        <button
          onClick={() => onTextAlignChange('center')}
          style={{ 
            padding: '4px 8px', 
            background: textAlign === 'center' ? 'rgba(249, 168, 212, 0.2)' : '#000000', 
            borderRadius: '4px', 
            fontSize: '14px', 
            border: textAlign === 'center' ? '1px solid #f9a8d4' : '1px solid rgba(244, 114, 182, 0.2)',
            color: '#ffffff',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            if (textAlign !== 'center') e.currentTarget.style.background = '#1f1f1f';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = textAlign === 'center' ? 'rgba(249, 168, 212, 0.2)' : '#000000';
          }}
        >
          <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
            <path d="M3 3h18v2H3V3zm3 4h12v2H6V7zm-3 4h18v2H3v-2zm3 4h12v2H6v-2zm-3 4h18v2H3v-2z" />
          </svg>
        </button>
        <button
          onClick={() => onTextAlignChange('right')}
          style={{ 
            padding: '4px 8px', 
            background: textAlign === 'right' ? 'rgba(249, 168, 212, 0.2)' : '#000000', 
            borderRadius: '4px', 
            fontSize: '14px', 
            border: textAlign === 'right' ? '1px solid #f9a8d4' : '1px solid rgba(244, 114, 182, 0.2)',
            color: '#ffffff',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            if (textAlign !== 'right') e.currentTarget.style.background = '#1f1f1f';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = textAlign === 'right' ? 'rgba(249, 168, 212, 0.2)' : '#000000';
          }}
        >
          <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
            <path d="M3 3h18v2H3V3zm6 4h12v2H9V7zm-6 4h18v2H3v-2zm6 4h12v2H9v-2zm-6 4h18v2H3v-2z" />
          </svg>
        </button>
      </div>
    </div>
  );
}


