import React, { useState, useEffect } from 'react';
import { ColorPicker } from './ColorPicker';
import './Toolbar.css';

interface TextEditControlsProps {
  fontSize: number;
  onFontSizeChange: (size: number) => void;
  fontFamily: string;
  onFontFamilyChange: (family: string) => void;
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
  fontFamily,
  onFontFamilyChange,
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
  const [fontSizeInput, setFontSizeInput] = useState(String(fontSize));
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  
  useEffect(() => {
    setFontSizeInput(String(fontSize));
  }, [fontSize]);

  useEffect(() => {
    if (showTextColorMenu && textColorMenuRef?.current) {
      const rect = textColorMenuRef.current.getBoundingClientRect();
      setMenuPosition({ top: rect.bottom + 4, left: rect.left });
    }
  }, [showTextColorMenu, textColorMenuRef]);

  const applyFontSize = () => {
    const newSize = Math.max(8, Math.min(200, parseInt(fontSizeInput) || 16));
    setFontSizeInput(String(newSize));
    onFontSizeChange(newSize);
  };

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {/* 1행: Font Family, Font Size */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <select 
          value={fontFamily}
          onChange={(e) => onFontFamilyChange(e.target.value)}
          style={{ 
            padding: '4px 8px', 
            background: '#000000', 
            color: '#ffffff', 
            border: '1px solid rgba(244, 114, 182, 0.2)', 
            borderRadius: '4px', 
            fontSize: '13px',
            cursor: 'pointer',
            minWidth: '110px'
          }}
        >
          <option value="Nanum Gothic">Nanum Gothic</option>
          <option value="Arial">Arial</option>
          <option value="Helvetica">Helvetica</option>
          <option value="Times New Roman">Times New Roman</option>
          <option value="Georgia">Georgia</option>
          <option value="Verdana">Verdana</option>
          <option value="Courier New">Courier New</option>
          <option value="sans-serif">Sans-serif</option>
          <option value="serif">Serif</option>
          <option value="monospace">Monospace</option>
        </select>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
          <button 
            style={{ ...buttonStyle, padding: '4px 6px' }}
            onMouseEnter={buttonHover}
            onMouseLeave={(e) => buttonLeave(e)}
            onClick={() => onFontSizeChange(Math.max(8, fontSize - 1))}
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>
          <input 
            type="text" 
            value={fontSizeInput}
            onChange={(e) => setFontSizeInput(e.target.value.replace(/[^0-9]/g, ''))}
            onKeyDown={(e) => { if (e.key === 'Enter') { applyFontSize(); e.currentTarget.blur(); } }}
            onBlur={applyFontSize}
            onClick={(e) => { e.stopPropagation(); e.currentTarget.select(); }}
            style={{ 
              width: '32px', padding: '4px', 
              background: '#000000', color: '#ffffff', 
              border: '1px solid rgba(244, 114, 182, 0.2)', 
              borderRadius: '4px', fontSize: '13px', textAlign: 'center'
            }}
            onWheel={(e) => e.currentTarget.blur()}
          />
          <button 
            style={{ ...buttonStyle, padding: '4px 6px' }}
            onMouseEnter={buttonHover}
            onMouseLeave={(e) => buttonLeave(e)}
            onClick={() => onFontSizeChange(Math.min(200, fontSize + 1))}
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* 2행: Text Color, Bold, Italic, Align */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* Text Color */}
        <div style={{ position: 'relative' }} ref={textColorMenuRef}>
          <button 
            onClick={onToggleTextColorMenu}
            style={{ 
              padding: '4px 8px', background: '#000000', borderRadius: '4px', fontSize: '13px', 
              border: '1px solid rgba(244, 114, 182, 0.2)', 
              display: 'flex', alignItems: 'center', gap: '4px', color: '#ffffff', cursor: 'pointer'
            }}
            onMouseEnter={buttonHover}
            onMouseLeave={(e) => buttonLeave(e)}
          >
            <div style={{ width: '14px', height: '14px', background: textColor, borderRadius: '2px', border: '1px solid rgba(255,255,255,0.3)' }}></div>
            <span>Color</span>
            <svg width="10" height="10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {showTextColorMenu && (
            <div style={{ position: 'fixed', top: menuPosition.top, left: menuPosition.left, background: '#000000', border: '1px solid rgba(244, 114, 182, 0.2)', borderRadius: '4px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)', zIndex: 1000 }}>
              <ColorPicker
                color={textColor}
                onChange={(newColor) => {
                  const selection = window.getSelection();
                  const activeElement = document.activeElement as HTMLElement;
                  if (selection && !selection.isCollapsed && activeElement?.isContentEditable) {
                    document.execCommand('foreColor', false, newColor);
                  }
                  onTextColorChange(newColor);
                }}
                onClose={onToggleTextColorMenu}
              />
            </div>
          )}
        </div>
        
        {/* Bold & Italic */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
          <button 
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              const selection = window.getSelection();
              const activeElement = document.activeElement as HTMLElement;
              if (selection && !selection.isCollapsed && activeElement?.isContentEditable) {
                document.execCommand('bold', false);
              }
              onFontWeightToggle();
            }}
            style={{ 
              padding: '4px 10px', 
              background: fontWeight === 'bold' ? '#1f1f1f' : '#000000', 
              borderRadius: '4px', fontSize: '13px', 
              border: '1px solid rgba(244, 114, 182, 0.2)', 
              color: '#ffffff', fontWeight: 'bold', cursor: 'pointer'
            }}
            onMouseEnter={buttonHover}
            onMouseLeave={(e) => buttonLeave(e, fontWeight === 'bold')}
          >
            B
          </button>
          <button 
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              const selection = window.getSelection();
              const activeElement = document.activeElement as HTMLElement;
              if (selection && !selection.isCollapsed && activeElement?.isContentEditable) {
                document.execCommand('italic', false);
              }
              onFontStyleToggle();
            }}
            style={{ 
              padding: '4px 10px', 
              background: fontStyle === 'italic' ? '#1f1f1f' : '#000000', 
              borderRadius: '4px', fontSize: '13px', 
              border: '1px solid rgba(244, 114, 182, 0.2)', 
              color: '#ffffff', fontStyle: 'italic', cursor: 'pointer'
            }}
            onMouseEnter={buttonHover}
            onMouseLeave={(e) => buttonLeave(e, fontStyle === 'italic')}
          >
            I
          </button>
        </div>
        
        {/* Text Align */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
          {(['left', 'center', 'right'] as const).map((align) => (
            <button
              key={align}
              onClick={() => onTextAlignChange(align)}
              style={{ 
                padding: '4px 6px', 
                background: textAlign === align ? 'rgba(249, 168, 212, 0.2)' : '#000000', 
                borderRadius: '4px', 
                border: textAlign === align ? '1px solid #f9a8d4' : '1px solid rgba(244, 114, 182, 0.2)',
                color: '#ffffff', cursor: 'pointer'
              }}
              onMouseEnter={(e) => { if (textAlign !== align) e.currentTarget.style.background = '#1f1f1f'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = textAlign === align ? 'rgba(249, 168, 212, 0.2)' : '#000000'; }}
            >
              <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
                {align === 'left' && <path d="M3 3h18v2H3V3zm0 4h12v2H3V7zm0 4h18v2H3v-2zm0 4h12v2H3v-2zm0 4h18v2H3v-2z" />}
                {align === 'center' && <path d="M3 3h18v2H3V3zm3 4h12v2H6V7zm-3 4h18v2H3v-2zm3 4h12v2H6v-2zm-3 4h18v2H3v-2z" />}
                {align === 'right' && <path d="M3 3h18v2H3V3zm6 4h12v2H9V7zm-6 4h18v2H3v-2zm6 4h12v2H9v-2zm-6 4h18v2H3v-2z" />}
              </svg>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
