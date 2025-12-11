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
  showBringForwardMenu: boolean;
  onToggleBringForwardMenu: () => void;
  showSendBackwardMenu: boolean;
  onToggleSendBackwardMenu: () => void;
  shapeColorMenuRef: React.RefObject<HTMLDivElement>;
  effectsMenuRef: React.RefObject<HTMLDivElement>;
  strokeMenuRef: React.RefObject<HTMLDivElement>;
  bringForwardMenuRef: React.RefObject<HTMLDivElement>;
  sendBackwardMenuRef: React.RefObject<HTMLDivElement>;
  borderRadiusInputRef: React.RefObject<HTMLInputElement>;
  isBorderRadiusEnabled?: boolean;
  maxBorderRadius?: number;
  
  // 잠금 기능
  isLocked: boolean;
  onToggleLock: () => void;
  
  // Effects 기능
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
  shapeColor,
  onShapeColorChange,
  strokeColor,
  onStrokeColorChange,
  strokeWidth,
  onStrokeWidthChange,
  shapeBorderRadius,
  onShapeBorderRadiusChange,
  borderRadiusInputValue,
  onBorderRadiusInputChange,
  showShapeColorMenu,
  onToggleShapeColorMenu,
  showEffectsMenu,
  onToggleEffectsMenu,
  showStrokeMenu,
  onToggleStrokeMenu,
  showBringForwardMenu,
  onToggleBringForwardMenu,
  showSendBackwardMenu,
  onToggleSendBackwardMenu,
  shapeColorMenuRef,
  effectsMenuRef,
  strokeMenuRef,
  bringForwardMenuRef,
  sendBackwardMenuRef,
  borderRadiusInputRef,
  isBorderRadiusEnabled = false,
  maxBorderRadius = 100,
  isLocked,
  onToggleLock,
  shadowType,
  onShadowTypeChange,
  shadowColor,
  onShadowColorChange,
  shadowBlur,
  onShadowBlurChange,
  shadowOffsetX,
  onShadowOffsetXChange,
  shadowOffsetY,
  onShadowOffsetYChange,
  opacity,
  onOpacityChange,
}: ShapeEditControlsProps) {
  // 각 메뉴의 fixed position 계산
  const [shapeColorMenuPosition, setShapeColorMenuPosition] = useState({ top: 0, left: 0 });
  const [effectsMenuPosition, setEffectsMenuPosition] = useState({ top: 0, left: 0 });
  const [strokeMenuPosition, setStrokeMenuPosition] = useState({ top: 0, left: 0 });
  const [bringForwardMenuPosition, setBringForwardMenuPosition] = useState({ top: 0, left: 0 });
  const [sendBackwardMenuPosition, setSendBackwardMenuPosition] = useState({ top: 0, left: 0 });

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

  useEffect(() => {
    if (showBringForwardMenu && bringForwardMenuRef?.current) {
      const rect = bringForwardMenuRef.current.getBoundingClientRect();
      setBringForwardMenuPosition({ top: rect.bottom + 4, left: rect.left });
    }
  }, [showBringForwardMenu]);

  useEffect(() => {
    if (showSendBackwardMenu && sendBackwardMenuRef?.current) {
      const rect = sendBackwardMenuRef.current.getBoundingClientRect();
      setSendBackwardMenuPosition({ top: rect.bottom + 4, left: rect.left });
    }
  }, [showSendBackwardMenu]);

  const buttonStyle = {
    padding: '4px 12px',
    background: '#000000',
    borderRadius: '4px',
    fontSize: '14px',
    border: '1px solid rgba(244, 114, 182, 0.2)',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#ffffff',
    cursor: 'pointer',
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
      if (input !== '' && /^\d+$/.test(input)) {
        onShapeBorderRadiusChange(Number(input));
      }
    }
  };

  const handleBorderRadiusBlur = () => {
    const value = borderRadiusInputValue;
    if (value === '' || isNaN(Number(value))) {
      onBorderRadiusInputChange('0');
      onShapeBorderRadiusChange(0);
    } else {
      // Figma 방식: 최대값을 초과하지 않도록 제한
      const finalRadius = Math.min(Math.max(0, Number(value)), maxBorderRadius);
      onShapeBorderRadiusChange(finalRadius);
      onBorderRadiusInputChange(finalRadius.toString());
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '270px' }}>
      {/* 첫 번째 줄: Fill Color, Effects, Lock */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative' }} ref={shapeColorMenuRef}>
          <button 
            onClick={onToggleShapeColorMenu}
            style={buttonStyle}
            onMouseEnter={buttonHover}
            onMouseLeave={buttonLeave}
          >
            <span>Fill Color</span>
            <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {showShapeColorMenu && (
            <div 
              style={{ 
                position: 'fixed', 
                top: shapeColorMenuPosition.top, 
                left: shapeColorMenuPosition.left, 
                background: '#000000', 
                border: '1px solid rgba(244, 114, 182, 0.2)', 
                borderRadius: '4px', 
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)', 
                zIndex: 1000,
              }}
            >
              <ColorPicker
                color={shapeColor}
                onChange={onShapeColorChange}
                onClose={onToggleShapeColorMenu}
              />
            </div>
          )}
        </div>
        
        <div style={{ position: 'relative' }} ref={effectsMenuRef}>
          <button 
            onClick={onToggleEffectsMenu}
            style={buttonStyle}
            onMouseEnter={buttonHover}
            onMouseLeave={buttonLeave}
          >
            <span>Effect</span>
            <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {showEffectsMenu && (
            <div 
              style={{ 
                position: 'fixed', 
                top: effectsMenuPosition.top, 
                left: effectsMenuPosition.left, 
                background: '#000000', 
                border: '1px solid rgba(244, 114, 182, 0.2)', 
                borderRadius: '4px', 
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)', 
                zIndex: 1000, 
                minWidth: '200px' 
              }}
            >
              <div style={{ padding: '12px 12px 4px', fontSize: '12px', color: '#9ca3af', borderBottom: '1px solid rgba(244, 114, 182, 0.1)' }}>
                Shadow Effects
              </div>
              <button
                onClick={() => {
                  onShadowTypeChange('none');
                }}
                style={{ 
                  width: '100%', 
                  padding: '8px 12px', 
                  textAlign: 'left', 
                  fontSize: '14px', 
                  color: shadowType === 'none' ? '#f9a8d4' : '#ffffff',
                  background: shadowType === 'none' ? '#1f1f1f' : 'transparent',
                  border: 'none',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#1f1f1f'}
                onMouseLeave={(e) => e.currentTarget.style.background = shadowType === 'none' ? '#1f1f1f' : 'transparent'}
              >
                None
              </button>
              <button
                onClick={() => {
                  onShadowTypeChange('outer');
                }}
                style={{ 
                  width: '100%', 
                  padding: '8px 12px', 
                  textAlign: 'left', 
                  fontSize: '14px', 
                  color: shadowType === 'outer' ? '#f9a8d4' : '#ffffff',
                  background: shadowType === 'outer' ? '#1f1f1f' : 'transparent',
                  border: 'none',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#1f1f1f'}
                onMouseLeave={(e) => e.currentTarget.style.background = shadowType === 'outer' ? '#1f1f1f' : 'transparent'}
              >
                Outer Shadow
              </button>
              <button
                onClick={() => {
                  onShadowTypeChange('inner');
                }}
                style={{ 
                  width: '100%', 
                  padding: '8px 12px', 
                  textAlign: 'left', 
                  fontSize: '14px', 
                  color: shadowType === 'inner' ? '#f9a8d4' : '#ffffff',
                  background: shadowType === 'inner' ? '#1f1f1f' : 'transparent',
                  border: 'none',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#1f1f1f'}
                onMouseLeave={(e) => e.currentTarget.style.background = shadowType === 'inner' ? '#1f1f1f' : 'transparent'}
              >
                Inner Shadow
              </button>
              {shadowType !== 'none' && (
                <div style={{ padding: '12px', borderTop: '1px solid rgba(244, 114, 182, 0.2)' }}>
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ fontSize: '12px', color: '#9ca3af', display: 'block', marginBottom: '8px' }}>Shadow Color:</label>
                    <ColorPicker
                      color={shadowColor}
                      onChange={onShadowColorChange}
                      onClose={() => {}}
                    />
                  </div>
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <label style={{ fontSize: '12px', color: '#9ca3af' }}>Blur:</label>
                      <span style={{ fontSize: '12px', color: '#ffffff' }}>{shadowBlur}px</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="50"
                      step="1"
                      value={shadowBlur}
                      onChange={(e) => onShadowBlurChange(Number(e.target.value))}
                      style={{ 
                        width: '100%', 
                        height: '8px', 
                        background: '#1f1f1f', 
                        borderRadius: '4px', 
                        outline: 'none',
                        cursor: 'pointer'
                      }}
                    />
                  </div>
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <label style={{ fontSize: '12px', color: '#9ca3af' }}>Offset X:</label>
                      <span style={{ fontSize: '12px', color: '#ffffff' }}>{shadowOffsetX}px</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="50"
                      step="1"
                      value={shadowOffsetX}
                      onChange={(e) => onShadowOffsetXChange(Number(e.target.value))}
                      style={{ 
                        width: '100%', 
                        height: '8px', 
                        background: '#1f1f1f', 
                        borderRadius: '4px', 
                        outline: 'none',
                        cursor: 'pointer'
                      }}
                    />
                  </div>
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <label style={{ fontSize: '12px', color: '#9ca3af' }}>Offset Y:</label>
                      <span style={{ fontSize: '12px', color: '#ffffff' }}>{shadowOffsetY}px</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="50"
                      step="1"
                      value={shadowOffsetY}
                      onChange={(e) => onShadowOffsetYChange(Number(e.target.value))}
                      style={{ 
                        width: '100%', 
                        height: '8px', 
                        background: '#1f1f1f', 
                        borderRadius: '4px', 
                        outline: 'none',
                        cursor: 'pointer'
                      }}
                    />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <label style={{ fontSize: '12px', color: '#9ca3af' }}>Opacity:</label>
                      <span style={{ fontSize: '12px', color: '#ffffff' }}>{opacity}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="1"
                      value={opacity}
                      onChange={(e) => onOpacityChange(Number(e.target.value))}
                      style={{ 
                        width: '100%', 
                        height: '8px', 
                        background: '#1f1f1f', 
                        borderRadius: '4px', 
                        outline: 'none',
                        cursor: 'pointer'
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        <button
          onClick={onToggleLock}
          style={{ 
            width: '32px', 
            height: '32px', 
            background: isLocked ? '#f9a8d4' : '#000000', 
            borderRadius: '4px', 
            fontSize: '14px', 
            border: '1px solid rgba(244, 114, 182, 0.2)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: '#ffffff',
            cursor: 'pointer'
          }}
          onMouseEnter={buttonHover}
          onMouseLeave={buttonLeave}
          title={isLocked ? "Unlock" : "Lock"}
        >
          {isLocked ? (
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          ) : (
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
            </svg>
          )}
        </button>
      </div>
      
      {/* 두 번째 줄: Stroke, Corner Radius */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ position: 'relative' }} ref={strokeMenuRef}>
          <button 
            onClick={onToggleStrokeMenu}
            style={buttonStyle}
            onMouseEnter={buttonHover}
            onMouseLeave={buttonLeave}
          >
            <span>Stroke</span>
            <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {showStrokeMenu && (
            <div 
              style={{ 
                position: 'fixed', 
                top: strokeMenuPosition.top, 
                left: strokeMenuPosition.left, 
                background: '#000000', 
                border: '1px solid rgba(244, 114, 182, 0.2)', 
                borderRadius: '4px', 
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)', 
                zIndex: 1000, 
                minWidth: '220px',
              }}
            >
              {/* Stroke Color Section */}
              <div style={{ padding: '12px 12px 0' }}>
                <label style={{ fontSize: '12px', color: '#9ca3af', display: 'block', marginBottom: '8px' }}>Stroke Color:</label>
              </div>
              <ColorPicker
                color={strokeColor}
                onChange={onStrokeColorChange}
                onClose={onToggleStrokeMenu}
              />
              
              {/* Stroke Width Section */}
              <div style={{ padding: '0 12px 12px', borderTop: '1px solid rgba(244, 114, 182, 0.1)', marginTop: '8px', paddingTop: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <label style={{ fontSize: '12px', color: '#9ca3af' }}>Stroke Width:</label>
                  <span style={{ fontSize: '12px', color: '#ffffff' }}>{strokeWidth}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="20"
                  step="1"
                  value={strokeWidth}
                  onChange={(e) => onStrokeWidthChange(Number(e.target.value))}
                  style={{ 
                    width: '100%', 
                    height: '8px', 
                    background: '#1f1f1f', 
                    borderRadius: '4px', 
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                />
              </div>
              
              {/* Remove Stroke Button */}
              <div style={{ padding: '0 12px 12px' }}>
                <button
                  onClick={() => {
                    onStrokeWidthChange(0);
                    onToggleStrokeMenu();
                  }}
                  style={{ 
                    width: '100%', 
                    padding: '6px 8px', 
                    fontSize: '12px', 
                    background: '#1f1f1f', 
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#2f2f2f'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#1f1f1f'}
                >
                  Remove Stroke
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Corner Radius - 둥근 사각형 선택 시에만 활성화 */}
        <div 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            opacity: isBorderRadiusEnabled ? 1 : 0.4,
            pointerEvents: isBorderRadiusEnabled ? 'auto' : 'none',
          }}
          title={isBorderRadiusEnabled ? '' : '둥근 사각형을 선택하세요'}
        >
          <span style={{ fontSize: '14px', color: isBorderRadiusEnabled ? '#ffffff' : '#666666', whiteSpace: 'nowrap' }}>Corner Radius:</span>
          <input
            ref={borderRadiusInputRef}
            type="text"
            value={borderRadiusInputValue}
            onChange={handleBorderRadiusInputChange}
            onBlur={() => handleBorderRadiusBlur()}
            onKeyDown={(e) => {
              e.stopPropagation();
              if (e.key === 'Enter') {
                handleBorderRadiusBlur();
              }
            }}
            disabled={!isBorderRadiusEnabled}
            style={{ 
              width: '50px', 
              padding: '4px 8px', 
              background: isBorderRadiusEnabled ? '#000000' : '#1a1a1a', 
              border: '1px solid rgba(244, 114, 182, 0.2)', 
              borderRadius: '4px', 
              fontSize: '14px',
              color: isBorderRadiusEnabled ? '#ffffff' : '#666666',
              cursor: isBorderRadiusEnabled ? 'text' : 'not-allowed',
            }}
          />
          <input
            type="range"
            min="0"
            max={maxBorderRadius}
            value={Math.min(shapeBorderRadius, maxBorderRadius)}
            onChange={(e) => {
              const newRadius = Math.min(Number(e.target.value), maxBorderRadius);
              onShapeBorderRadiusChange(newRadius);
              onBorderRadiusInputChange(newRadius.toString());
            }}
            disabled={!isBorderRadiusEnabled}
            style={{ 
              width: '80px', 
              height: '8px', 
              background: '#1f1f1f', 
              borderRadius: '4px', 
              outline: 'none',
              cursor: isBorderRadiusEnabled ? 'pointer' : 'not-allowed',
            }}
          />
        </div>
      </div>
      
      {/* 세 번째 줄: z-index 조정 버튼들 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ position: 'relative' }} ref={bringForwardMenuRef}>
          <button 
            onClick={onToggleBringForwardMenu}
            style={buttonStyle}
            onMouseEnter={buttonHover}
            onMouseLeave={buttonLeave}
            title="Bring Forward"
          >
            <div style={{ position: 'relative', width: '20px', height: '20px' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, width: '12px', height: '12px', border: '1px solid #f9a8d4', background: 'rgba(249, 168, 212, 0.3)' }}></div>
              <div style={{ position: 'absolute', bottom: 0, right: 0, width: '12px', height: '12px', border: '1px solid #ffffff' }}></div>
            </div>
            <span>Bring Forward</span>
            <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {showBringForwardMenu && (
            <div 
              style={{ 
                position: 'fixed', 
                top: bringForwardMenuPosition.top, 
                left: bringForwardMenuPosition.left, 
                background: '#000000', 
                border: '1px solid rgba(244, 114, 182, 0.2)', 
                borderRadius: '4px', 
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)', 
                zIndex: 1000, 
                minWidth: '160px' 
              }}
            >
              <button
                onClick={() => onToggleBringForwardMenu()}
                style={{ 
                  width: '100%', 
                  padding: '8px 12px', 
                  textAlign: 'left', 
                  fontSize: '14px', 
                  color: '#ffffff',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#1f1f1f'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                Bring Forward
              </button>
              <button
                onClick={() => onToggleBringForwardMenu()}
                style={{ 
                  width: '100%', 
                  padding: '8px 12px', 
                  textAlign: 'left', 
                  fontSize: '14px', 
                  color: '#ffffff',
                  background: 'transparent',
                  border: 'none',
                  borderTop: '1px solid rgba(244, 114, 182, 0.2)',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#1f1f1f'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                Bring to Front
              </button>
            </div>
          )}
        </div>
        
        <div style={{ position: 'relative' }} ref={sendBackwardMenuRef}>
          <button 
            onClick={onToggleSendBackwardMenu}
            style={buttonStyle}
            onMouseEnter={buttonHover}
            onMouseLeave={buttonLeave}
            title="Send Backward"
          >
            <div style={{ position: 'relative', width: '20px', height: '20px' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, width: '12px', height: '12px', border: '1px solid #ffffff' }}></div>
              <div style={{ position: 'absolute', bottom: 0, right: 0, width: '12px', height: '12px', border: '1px solid #f9a8d4', background: 'rgba(249, 168, 212, 0.3)' }}></div>
            </div>
            <span>Send Backward</span>
            <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {showSendBackwardMenu && (
            <div 
              style={{ 
                position: 'fixed', 
                top: sendBackwardMenuPosition.top, 
                left: sendBackwardMenuPosition.left, 
                background: '#000000', 
                border: '1px solid rgba(244, 114, 182, 0.2)', 
                borderRadius: '4px', 
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)', 
                zIndex: 1000, 
                minWidth: '160px' 
              }}
            >
              <button
                onClick={() => onToggleSendBackwardMenu()}
                style={{ 
                  width: '100%', 
                  padding: '8px 12px', 
                  textAlign: 'left', 
                  fontSize: '14px', 
                  color: '#ffffff',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#1f1f1f'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                Send Backward
              </button>
              <button
                onClick={() => onToggleSendBackwardMenu()}
                style={{ 
                  width: '100%', 
                  padding: '8px 12px', 
                  textAlign: 'left', 
                  fontSize: '14px', 
                  color: '#ffffff',
                  background: 'transparent',
                  border: 'none',
                  borderTop: '1px solid rgba(244, 114, 182, 0.2)',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#1f1f1f'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                Send to Back
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* 네 번째 줄: 그룹화 버튼들 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
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
            cursor: 'pointer',
            opacity: 0.5
          }}
          disabled
          title="Group (Ctrl+G) - 최소 2개 이상 선택 필요"
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <span>Group</span>
        </button>
        <button
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
            cursor: 'pointer',
            opacity: 0.5
          }}
          disabled
          title="Ungroup (Ctrl+Shift+G)"
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
          <span>Ungroup</span>
        </button>
      </div>
    </div>
  );
}




