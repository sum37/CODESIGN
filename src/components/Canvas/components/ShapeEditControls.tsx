import React, { useState, useEffect } from 'react';
import { ColorPicker } from './ColorPicker';
import './Toolbar.css';

interface ShapeEditControlsProps {
  shapeColor: string;
  onShapeColorChange: (color: string) => void;
  strokeColor: string;
  onStrokeColorChange: (color: string) => void;
  strokeWidth: number;
  onStrokeWidthChange: (width: number) => void;
  shapeBorderRadius: number;
  onShapeBorderRadiusChange: (radius: number) => void;
  borderRadiusInputValue: string;
  onBorderRadiusInputChange: (value: string) => void;
  showShapeColorMenu: boolean;
  onToggleShapeColorMenu: () => void;
  showEffectsMenu: boolean;
  onToggleEffectsMenu: () => void;
  showStrokeMenu: boolean;
  onToggleStrokeMenu: () => void;
  shapeColorMenuRef: React.RefObject<HTMLDivElement>;
  effectsMenuRef: React.RefObject<HTMLDivElement>;
  strokeMenuRef: React.RefObject<HTMLDivElement>;
  borderRadiusInputRef: React.RefObject<HTMLInputElement>;
  isBorderRadiusEnabled?: boolean;
  maxBorderRadius?: number;
  isLocked: boolean;
  onToggleLock: () => void;
  shadowType: 'none' | 'outer' | 'inner';
  onShadowTypeChange: (type: 'none' | 'outer' | 'inner') => void;
  shadowColor: string;
  onShadowColorChange: (color: string) => void;
  shadowBlur: number;
  onShadowBlurChange: (blur: number) => void;
  shadowOffsetX: number;
  onShadowOffsetXChange: (offset: number) => void;
  shadowOffsetY: number;
  onShadowOffsetYChange: (offset: number) => void;
  opacity: number;
  onOpacityChange: (opacity: number) => void;
}

export function ShapeEditControls({
  shapeColor, onShapeColorChange,
  strokeColor, onStrokeColorChange,
  strokeWidth, onStrokeWidthChange,
  shapeBorderRadius, onShapeBorderRadiusChange,
  borderRadiusInputValue, onBorderRadiusInputChange,
  showShapeColorMenu, onToggleShapeColorMenu,
  showEffectsMenu, onToggleEffectsMenu,
  showStrokeMenu, onToggleStrokeMenu,
  shapeColorMenuRef, effectsMenuRef, strokeMenuRef, borderRadiusInputRef,
  isBorderRadiusEnabled = false, maxBorderRadius = 100,
  isLocked, onToggleLock,
  shadowType, onShadowTypeChange,
  shadowColor, onShadowColorChange,
  shadowBlur, onShadowBlurChange,
  shadowOffsetX, onShadowOffsetXChange,
  shadowOffsetY, onShadowOffsetYChange,
  opacity, onOpacityChange,
}: ShapeEditControlsProps) {
  const [shapeColorMenuPosition, setShapeColorMenuPosition] = useState({ top: 0, left: 0 });
  const [effectsMenuPosition, setEffectsMenuPosition] = useState({ top: 0, left: 0 });
  const [strokeMenuPosition, setStrokeMenuPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (showShapeColorMenu && shapeColorMenuRef?.current) {
      const rect = shapeColorMenuRef.current.getBoundingClientRect();
      setShapeColorMenuPosition({ top: rect.bottom + 4, left: rect.left });
    }
  }, [showShapeColorMenu]);

  useEffect(() => {
    if (showEffectsMenu && effectsMenuRef?.current) {
      const rect = effectsMenuRef.current.getBoundingClientRect();
      setEffectsMenuPosition({ top: rect.bottom + 4, left: rect.left });
    }
  }, [showEffectsMenu]);

  useEffect(() => {
    if (showStrokeMenu && strokeMenuRef?.current) {
      const rect = strokeMenuRef.current.getBoundingClientRect();
      setStrokeMenuPosition({ top: rect.bottom + 4, left: rect.left });
    }
  }, [showStrokeMenu]);

  const buttonStyle: React.CSSProperties = {
    padding: '4px 8px', background: '#000000', borderRadius: '4px', fontSize: '13px',
    border: '1px solid rgba(244, 114, 182, 0.2)',
    display: 'flex', alignItems: 'center', gap: '4px', color: '#ffffff', cursor: 'pointer',
  };

  const buttonHover = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.background = '#1f1f1f';
  };

  const buttonLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.background = '#000000';
  };

  const handleBorderRadiusInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    if (input === '' || /^\d+$/.test(input)) {
      onBorderRadiusInputChange(input);
      if (input !== '' && /^\d+$/.test(input)) onShapeBorderRadiusChange(Number(input));
    }
  };

  const handleBorderRadiusBlur = () => {
    const value = borderRadiusInputValue;
    if (value === '' || isNaN(Number(value))) {
      onBorderRadiusInputChange('0');
      onShapeBorderRadiusChange(0);
    } else {
      const finalRadius = Math.min(Math.max(0, Number(value)), maxBorderRadius);
      onShapeBorderRadiusChange(finalRadius);
      onBorderRadiusInputChange(finalRadius.toString());
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {/* 1행: Fill Color, Stroke, Effect */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* Fill Color */}
        <div style={{ position: 'relative' }} ref={shapeColorMenuRef}>
          <button onClick={onToggleShapeColorMenu} style={buttonStyle} onMouseEnter={buttonHover} onMouseLeave={buttonLeave} title="Fill Color">
            <div style={{ width: '14px', height: '14px', background: shapeColor, borderRadius: '2px', border: '1px solid rgba(255,255,255,0.3)' }}></div>
            <span>Fill</span>
            <svg width="10" height="10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {showShapeColorMenu && (
            <div style={{ position: 'fixed', top: shapeColorMenuPosition.top, left: shapeColorMenuPosition.left, background: '#000000', border: '1px solid rgba(244, 114, 182, 0.2)', borderRadius: '4px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)', zIndex: 1000 }}>
              <ColorPicker color={shapeColor} onChange={onShapeColorChange} onClose={onToggleShapeColorMenu} />
            </div>
          )}
        </div>
        
        {/* Stroke */}
        <div style={{ position: 'relative' }} ref={strokeMenuRef}>
          <button onClick={onToggleStrokeMenu} style={buttonStyle} onMouseEnter={buttonHover} onMouseLeave={buttonLeave} title="Stroke">
            <div style={{ width: '14px', height: '14px', background: 'transparent', borderRadius: '2px', border: `2px solid ${strokeColor}` }}></div>
            <span>Stroke</span>
            <svg width="10" height="10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {showStrokeMenu && (
            <div style={{ position: 'fixed', top: strokeMenuPosition.top, left: strokeMenuPosition.left, background: '#000000', border: '1px solid rgba(244, 114, 182, 0.2)', borderRadius: '4px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)', zIndex: 1000, minWidth: '200px' }}>
              <div style={{ padding: '8px 12px 0' }}>
                <label style={{ fontSize: '11px', color: '#9ca3af', display: 'block', marginBottom: '6px' }}>Stroke Color:</label>
              </div>
              <ColorPicker color={strokeColor} onChange={onStrokeColorChange} onClose={onToggleStrokeMenu} />
              <div style={{ padding: '8px 12px', borderTop: '1px solid rgba(244, 114, 182, 0.1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <label style={{ fontSize: '11px', color: '#9ca3af' }}>Width:</label>
                  <span style={{ fontSize: '11px', color: '#ffffff' }}>{strokeWidth}px</span>
                </div>
                <input type="range" min="0" max="20" step="1" value={strokeWidth} onChange={(e) => onStrokeWidthChange(Number(e.target.value))}
                  style={{ width: '100%', height: '6px', background: '#1f1f1f', borderRadius: '3px', outline: 'none', cursor: 'pointer' }} />
              </div>
              <div style={{ padding: '0 12px 8px' }}>
                <button onClick={() => { onStrokeWidthChange(0); onToggleStrokeMenu(); }}
                  style={{ width: '100%', padding: '4px', fontSize: '11px', background: '#1f1f1f', color: '#ffffff', border: 'none', borderRadius: '3px', cursor: 'pointer' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#2f2f2f'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#1f1f1f'}>
                  Remove Stroke
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Effects */}
        <div style={{ position: 'relative' }} ref={effectsMenuRef}>
          <button onClick={onToggleEffectsMenu} style={buttonStyle} onMouseEnter={buttonHover} onMouseLeave={buttonLeave} title="Effects">
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
            <span>Effect</span>
            <svg width="10" height="10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {showEffectsMenu && (
            <div style={{ position: 'fixed', top: effectsMenuPosition.top, left: effectsMenuPosition.left, background: '#000000', border: '1px solid rgba(244, 114, 182, 0.2)', borderRadius: '4px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)', zIndex: 1000, minWidth: '180px' }}>
              <div style={{ padding: '8px 12px 4px', fontSize: '11px', color: '#9ca3af', borderBottom: '1px solid rgba(244, 114, 182, 0.1)' }}>Shadow Effects</div>
              {(['none', 'outer', 'inner'] as const).map((type) => (
                <button key={type} onClick={() => onShadowTypeChange(type)}
                  style={{ width: '100%', padding: '6px 12px', textAlign: 'left', fontSize: '12px', color: shadowType === type ? '#f9a8d4' : '#ffffff', background: shadowType === type ? '#1f1f1f' : 'transparent', border: 'none', cursor: 'pointer' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#1f1f1f'}
                  onMouseLeave={(e) => e.currentTarget.style.background = shadowType === type ? '#1f1f1f' : 'transparent'}>
                  {type === 'none' ? 'None' : type === 'outer' ? 'Outer Shadow' : 'Inner Shadow'}
                </button>
              ))}
              {shadowType !== 'none' && (
                <div style={{ padding: '8px 12px', borderTop: '1px solid rgba(244, 114, 182, 0.2)' }}>
                  <div style={{ marginBottom: '8px' }}>
                    <label style={{ fontSize: '11px', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>Color:</label>
                    <ColorPicker color={shadowColor} onChange={onShadowColorChange} onClose={() => {}} />
                  </div>
                  {[
                    { label: 'Blur', value: shadowBlur, onChange: onShadowBlurChange, max: 50 },
                    { label: 'X', value: shadowOffsetX, onChange: onShadowOffsetXChange, max: 50 },
                    { label: 'Y', value: shadowOffsetY, onChange: onShadowOffsetYChange, max: 50 },
                    { label: 'Opacity', value: opacity, onChange: onOpacityChange, max: 100 },
                  ].map(({ label, value, onChange, max }) => (
                    <div key={label} style={{ marginBottom: '6px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                        <label style={{ fontSize: '10px', color: '#9ca3af' }}>{label}:</label>
                        <span style={{ fontSize: '10px', color: '#ffffff' }}>{value}{label === 'Opacity' ? '%' : 'px'}</span>
                      </div>
                      <input type="range" min="0" max={max} value={value} onChange={(e) => onChange(Number(e.target.value))}
                        style={{ width: '100%', height: '4px', background: '#1f1f1f', borderRadius: '2px', outline: 'none', cursor: 'pointer' }} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* 2행: Corner Radius, Lock */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* Corner Radius */}
        <div 
          style={{ 
            display: 'flex', alignItems: 'center', gap: '4px',
            opacity: isBorderRadiusEnabled ? 1 : 0.4,
            pointerEvents: isBorderRadiusEnabled ? 'auto' : 'none',
          }}
          title={isBorderRadiusEnabled ? 'Corner Radius' : 'Select a rounded rectangle'}
        >
          <span style={{ fontSize: '12px', color: isBorderRadiusEnabled ? '#ffffff' : '#666666', whiteSpace: 'nowrap' }}>Corner:</span>
          <input
            ref={borderRadiusInputRef}
            type="text"
            value={borderRadiusInputValue}
            onChange={handleBorderRadiusInputChange}
            onBlur={handleBorderRadiusBlur}
            onKeyDown={(e) => { e.stopPropagation(); if (e.key === 'Enter') handleBorderRadiusBlur(); }}
            disabled={!isBorderRadiusEnabled}
            style={{ 
              width: '36px', padding: '4px', 
              background: isBorderRadiusEnabled ? '#000000' : '#1a1a1a', 
              border: '1px solid rgba(244, 114, 182, 0.2)', 
              borderRadius: '4px', fontSize: '12px',
              color: isBorderRadiusEnabled ? '#ffffff' : '#666666',
              cursor: isBorderRadiusEnabled ? 'text' : 'not-allowed',
              textAlign: 'center'
            }}
          />
          <input
            type="range" min="0" max={maxBorderRadius}
            value={Math.min(shapeBorderRadius, maxBorderRadius)}
            onChange={(e) => {
              const newRadius = Math.min(Number(e.target.value), maxBorderRadius);
              onShapeBorderRadiusChange(newRadius);
              onBorderRadiusInputChange(newRadius.toString());
            }}
            disabled={!isBorderRadiusEnabled}
            style={{ width: '60px', height: '6px', background: '#1f1f1f', borderRadius: '3px', outline: 'none', cursor: isBorderRadiusEnabled ? 'pointer' : 'not-allowed' }}
          />
        </div>
        
        {/* Lock */}
        <button
          onClick={onToggleLock}
          style={{ 
            width: '28px', height: '28px', 
            background: isLocked ? '#f9a8d4' : '#000000', 
            borderRadius: '4px', 
            border: '1px solid rgba(244, 114, 182, 0.2)', 
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: isLocked ? '#000000' : '#ffffff',
            cursor: 'pointer'
          }}
          onMouseEnter={buttonHover}
          onMouseLeave={buttonLeave}
          title={isLocked ? "Unlock" : "Lock"}
        >
          {isLocked ? (
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          ) : (
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
