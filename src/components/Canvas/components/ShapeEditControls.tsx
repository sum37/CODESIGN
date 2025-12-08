import React from 'react';
import './Toolbar.css';

interface ShapeEditControlsProps {
  shapeColor: string;
  onShapeColorChange: (color: string) => void;
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
}

export function ShapeEditControls({
  shapeColor,
  onShapeColorChange,
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
}: ShapeEditControlsProps) {
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

  const handleBorderRadiusBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || isNaN(Number(value))) {
      onBorderRadiusInputChange('0');
      onShapeBorderRadiusChange(0);
    } else {
      const finalRadius = Math.max(0, Number(value));
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
                position: 'absolute', 
                top: '100%', 
                left: 0, 
                marginTop: '4px', 
                background: '#000000', 
                border: '1px solid rgba(244, 114, 182, 0.2)', 
                borderRadius: '4px', 
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)', 
                zIndex: 1000, 
                padding: '12px' 
              }}
            >
              <input
                type="color"
                value={shapeColor}
                onChange={(e) => onShapeColorChange(e.target.value)}
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
                position: 'absolute', 
                top: '100%', 
                left: 0, 
                marginTop: '4px', 
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
                onClick={() => onToggleEffectsMenu()}
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
                None
              </button>
              <button
                onClick={() => onToggleEffectsMenu()}
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
                Outer Shadow
              </button>
              <button
                onClick={() => onToggleEffectsMenu()}
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
                Inner Shadow
              </button>
            </div>
          )}
        </div>
        
        <button
          style={{ 
            width: '32px', 
            height: '32px', 
            background: '#000000', 
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
          title="Lock"
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
          </svg>
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
                position: 'absolute', 
                top: '100%', 
                left: 0, 
                marginTop: '4px', 
                background: '#000000', 
                border: '1px solid rgba(244, 114, 182, 0.2)', 
                borderRadius: '4px', 
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)', 
                zIndex: 1000, 
                minWidth: '220px',
                padding: '12px'
              }}
            >
              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '12px', color: '#ffffff', display: 'block', marginBottom: '8px' }}>Stroke Color:</label>
                <input
                  type="color"
                  defaultValue="#000000"
                  style={{ 
                    width: '100%', 
                    height: '40px', 
                    cursor: 'pointer',
                    border: 'none',
                    outline: 'none',
                    background: 'transparent'
                  }}
                />
              </div>
              <div style={{ marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <label style={{ fontSize: '12px', color: '#ffffff' }}>Stroke Width:</label>
                  <span style={{ fontSize: '12px', color: '#9ca3af' }}>0px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="20"
                  step="1"
                  defaultValue="0"
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
              <button
                onClick={() => onToggleStrokeMenu()}
                style={{ 
                  width: '100%', 
                  padding: '4px 8px', 
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
          )}
        </div>
        
        {/* Corner Radius */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '14px', color: '#ffffff' }}>Corner Radius:</span>
            <input
              ref={borderRadiusInputRef}
              type="text"
              value={borderRadiusInputValue}
              onChange={handleBorderRadiusInputChange}
              onBlur={handleBorderRadiusBlur}
              style={{ 
                width: '64px', 
                padding: '4px 8px', 
                background: '#000000', 
                border: '1px solid rgba(244, 114, 182, 0.2)', 
                borderRadius: '4px', 
                fontSize: '14px',
                color: '#ffffff'
              }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="range"
              min="0"
              max="100"
              value={shapeBorderRadius}
              onChange={(e) => {
                const newRadius = Number(e.target.value);
                onShapeBorderRadiusChange(newRadius);
                onBorderRadiusInputChange(newRadius.toString());
              }}
              style={{ 
                flex: 1, 
                height: '8px', 
                background: '#1f1f1f', 
                borderRadius: '4px', 
                outline: 'none',
                cursor: 'pointer'
              }}
            />
          </div>
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
                position: 'absolute', 
                top: '100%', 
                left: 0, 
                marginTop: '4px', 
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
                position: 'absolute', 
                top: '100%', 
                left: 0, 
                marginTop: '4px', 
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


