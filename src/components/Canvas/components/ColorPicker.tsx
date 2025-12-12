import React from 'react';

// 프리셋 Color Swatches
const COLOR_SWATCHES = [
  // Row 1: Grayscale
  '#000000', '#333333', '#666666', '#999999', '#CCCCCC', '#FFFFFF',
  // Row 2: Reds
  '#FF0000', '#FF4444', '#FF6666', '#FF8888', '#FFAAAA', '#FFCCCC',
  // Row 3: Oranges
  '#FF6600', '#FF8833', '#FFAA66', '#FFCC99', '#FFDDBB', '#FFEECC',
  // Row 4: Yellows
  '#FFFF00', '#FFFF44', '#FFFF88', '#FFFFAA', '#FFFFCC', '#FFFFEE',
  // Row 5: Greens
  '#00FF00', '#44FF44', '#66FF66', '#88FF88', '#AAFFAA', '#CCFFCC',
  // Row 6: Cyans
  '#00FFFF', '#44FFFF', '#66FFFF', '#88FFFF', '#AAFFFF', '#CCFFFF',
  // Row 7: Blues
  '#0000FF', '#4444FF', '#6666FF', '#8888FF', '#AAAAFF', '#CCCCFF',
  // Row 8: Purples
  '#FF00FF', '#FF44FF', '#FF66FF', '#FF88FF', '#FFAAFF', '#FFCCFF',
  // Row 9: Pinks
  '#F472B6', '#F9A8D4', '#FBCFE8', '#FCE7F3', '#FDF2F8', '#FEFCE8',
  // Row 10: Additional colors
  '#8B5CF6', '#A78BFA', '#C4B5FD', '#10B981', '#34D399', '#6EE7B7',
];

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  onClose?: () => void;
}

export function ColorPicker({ color, onChange, onClose }: ColorPickerProps) {
  const [hexInput, setHexInput] = React.useState(color);

  React.useEffect(() => {
    setHexInput(color);
  }, [color]);

  const handleSwatchClick = (swatchColor: string) => {
    onChange(swatchColor);
    setHexInput(swatchColor);
  };

  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setHexInput(value);
    
    // 유효한 HEX 색상인지 확인
    if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
      onChange(value);
    }
  };

  const handleHexBlur = () => {
    // blur 시 유효하지 않으면 현재 색상으로 복원
    if (!/^#[0-9A-Fa-f]{6}$/.test(hexInput)) {
      setHexInput(color);
    }
  };

  return (
    <div 
      style={{ 
        padding: '12px',
        minWidth: '200px',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* 현재 색상 미리보기 + HEX 입력 */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px', 
        marginBottom: '12px' 
      }}>
        <div 
          style={{ 
            width: '32px', 
            height: '32px', 
            backgroundColor: color,
            borderRadius: '4px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            flexShrink: 0,
          }} 
        />
        <input
          type="text"
          value={hexInput}
          onChange={handleHexChange}
          onBlur={handleHexBlur}
          onKeyDown={(e) => {
            // 키보드 이벤트가 상위 컴포넌트로 전파되지 않도록 방지
            // (Backspace, Delete 등이 canvas 요소 삭제로 이어지는 것 방지)
            e.stopPropagation();
            
            // Enter 키를 누르면 유효한 색상이면 적용하고 닫기
            if (e.key === 'Enter') {
              if (/^#[0-9A-Fa-f]{6}$/.test(hexInput)) {
                onChange(hexInput);
              }
              onClose?.();
            }
          }}
          placeholder="#000000"
          style={{
            flex: 1,
            padding: '6px 8px',
            background: '#1a1a1a',
            border: '1px solid rgba(244, 114, 182, 0.2)',
            borderRadius: '4px',
            color: '#ffffff',
            fontSize: '12px',
            fontFamily: 'monospace',
          }}
        />
        {/* 브라우저 기본 color picker (더 세밀한 선택용) */}
        <label 
          style={{ 
            cursor: 'pointer',
            padding: '6px',
            background: '#1a1a1a',
            border: '1px solid rgba(244, 114, 182, 0.2)',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          title="More colors"
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#9ca3af' }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
          </svg>
          <input
            type="color"
            value={color}
            onChange={(e) => {
              onChange(e.target.value);
              setHexInput(e.target.value);
            }}
            style={{
              position: 'absolute',
              opacity: 0,
              width: 0,
              height: 0,
            }}
          />
        </label>
      </div>

      {/* Color Swatches Grid */}
      <div 
        style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(6, 1fr)', 
          gap: '4px',
        }}
      >
        {COLOR_SWATCHES.map((swatchColor, index) => (
          <button
            key={index}
            onClick={() => handleSwatchClick(swatchColor)}
            style={{
              width: '24px',
              height: '24px',
              backgroundColor: swatchColor,
              border: color.toUpperCase() === swatchColor.toUpperCase() 
                ? '2px solid #f472b6' 
                : '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '3px',
              cursor: 'pointer',
              padding: 0,
              transition: 'transform 0.1s, border-color 0.1s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
            title={swatchColor}
          />
        ))}
      </div>
    </div>
  );
}

