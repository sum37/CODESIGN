import { useEffect } from 'react';
import { ToolbarButtonGroup } from './ToolbarButtonGroup';
import { TextEditControls } from './TextEditControls';
import { ShapeEditControls } from './ShapeEditControls';
import { useToolbar } from '../hooks/useToolbar';
import { useCanvasStore } from '../../../stores/canvasStore';
import './Toolbar.css';

interface ToolbarProps {
  onAddText: () => void;
  onShapeSelect: (shapeType: string) => void;
  onImageSelect: (file: File) => void;
  onFontSizeChange?: (fontSize: number) => void;
  onFontFamilyChange?: (fontFamily: string) => void;
  onFontWeightChange?: (fontWeight: 'normal' | 'bold') => void;
  onFontStyleChange?: (fontStyle: 'normal' | 'italic') => void;
  onTextColorChange?: (color: string) => void;
  onTextAlignChange?: (textAlign: 'left' | 'center' | 'right') => void;
  onShapeColorChange?: (color: string) => void;
  onStrokeChange?: (strokeColor: string, strokeWidth: number) => void;
  onBorderRadiusChange?: (radius: number) => void;
  onEffectsChange?: (shadowType: 'none' | 'outer' | 'inner', shadowColor: string, shadowBlur: number, shadowOffsetX: number, shadowOffsetY: number, opacity: number) => void;
}

export function Toolbar({ onAddText, onShapeSelect, onImageSelect, onFontSizeChange, onFontFamilyChange, onFontWeightChange, onFontStyleChange, onTextColorChange, onTextAlignChange, onShapeColorChange, onStrokeChange, onBorderRadiusChange, onEffectsChange }: ToolbarProps) {
  const toolbar = useToolbar();
  const { drawingMode, selectedElementId, selectedElementHasBorderRadius, selectedElementBorderRadius, selectedElementSize, setElementLock, isElementLocked } = useCanvasStore();

  // Figma 방식: 최대 radius = 짧은 변의 절반
  const maxBorderRadius = selectedElementSize.width > 0 && selectedElementSize.height > 0
    ? Math.floor(Math.min(selectedElementSize.width, selectedElementSize.height) / 2)
    : 100; // 기본값

  // 선택된 요소의 borderRadius 값으로 toolbar 상태 업데이트
  useEffect(() => {
    if (selectedElementHasBorderRadius) {
      toolbar.setShapeBorderRadius(selectedElementBorderRadius);
      toolbar.setBorderRadiusInputValue(String(selectedElementBorderRadius));
    }
  }, [selectedElementId, selectedElementBorderRadius, selectedElementHasBorderRadius]);

  const handleShapeSelect = (shapeType: string) => {
    toolbar.setShowShapeMenu(false);
    console.log(`${shapeType} drawing mode activated`);
    onShapeSelect(shapeType);
  };

  // fontSize 변경 핸들러 - 선택된 요소가 있으면 코드 업데이트
  const handleFontSizeChange = (size: number) => {
    toolbar.setFontSize(size);
    
    // 선택된 요소가 있으면 실제 코드에 반영
    if (selectedElementId && onFontSizeChange) {
      onFontSizeChange(size);
    }
  };

  // fontFamily 변경 핸들러 - 선택된 요소가 있으면 코드 업데이트
  const handleFontFamilyChange = (family: string) => {
    toolbar.setFontFamily(family);
    
    // 선택된 요소가 있으면 실제 코드에 반영
    if (selectedElementId && onFontFamilyChange) {
      onFontFamilyChange(family);
    }
  };

  // fontWeight 토글 핸들러 - 선택된 요소가 있으면 코드 업데이트
  const handleFontWeightToggle = () => {
    const newWeight = toolbar.fontWeight === 'bold' ? 'normal' : 'bold';
    toolbar.setFontWeight(newWeight);
    
    // 선택된 요소가 있으면 실제 코드에 반영
    if (selectedElementId && onFontWeightChange) {
      onFontWeightChange(newWeight);
    }
  };

  // fontStyle 토글 핸들러 - 선택된 요소가 있으면 코드 업데이트
  const handleFontStyleToggle = () => {
    const newStyle = toolbar.fontStyle === 'italic' ? 'normal' : 'italic';
    toolbar.setFontStyle(newStyle);
    
    // 선택된 요소가 있으면 실제 코드에 반영
    if (selectedElementId && onFontStyleChange) {
      onFontStyleChange(newStyle);
    }
  };

  // textColor 변경 핸들러 - 선택된 요소가 있으면 코드 업데이트
  const handleTextColorChange = (color: string) => {
    toolbar.setTextColor(color);
    
    // 선택된 요소가 있으면 실제 코드에 반영
    if (selectedElementId && onTextColorChange) {
      onTextColorChange(color);
    }
  };

  // textAlign 변경 핸들러 - 선택된 요소가 있으면 코드 업데이트
  const handleTextAlignChange = (align: 'left' | 'center' | 'right') => {
    toolbar.setTextAlign(align);
    
    // 선택된 요소가 있으면 실제 코드에 반영
    if (selectedElementId && onTextAlignChange) {
      onTextAlignChange(align);
    }
  };

  // shapeColor 변경 핸들러 - 선택된 요소가 있으면 코드 업데이트
  const handleShapeColorChange = (color: string) => {
    toolbar.setShapeColor(color);
    
    // 선택된 요소가 있으면 실제 코드에 반영
    if (selectedElementId && onShapeColorChange) {
      onShapeColorChange(color);
    }
  };

  // strokeColor 변경 핸들러 - 선택된 요소가 있으면 코드 업데이트
  const handleStrokeColorChange = (color: string) => {
    toolbar.setStrokeColor(color);
    
    // 선택된 요소가 있으면 실제 코드에 반영
    if (selectedElementId && onStrokeChange) {
      onStrokeChange(color, toolbar.strokeWidth);
    }
  };

  // strokeWidth 변경 핸들러 - 선택된 요소가 있으면 코드 업데이트
  const handleStrokeWidthChange = (width: number) => {
    toolbar.setStrokeWidth(width);
    
    // 선택된 요소가 있으면 실제 코드에 반영
    if (selectedElementId && onStrokeChange) {
      onStrokeChange(toolbar.strokeColor, width);
    }
  };

  // borderRadius 변경 핸들러 - 선택된 요소가 있으면 코드 업데이트
  const handleBorderRadiusChange = (radius: number) => {
    toolbar.setShapeBorderRadius(radius);
    toolbar.setBorderRadiusInputValue(String(radius));
    
    // 선택된 요소가 있으면 실제 코드에 반영
    if (selectedElementId && onBorderRadiusChange) {
      onBorderRadiusChange(radius);
    }
  };

  return (
    <div className="canvas-toolbar">
      <ToolbarButtonGroup
        pendingText={toolbar.pendingText}
        onAddText={onAddText}
        showShapeMenu={toolbar.showShapeMenu}
        onToggleShapeMenu={() => toolbar.setShowShapeMenu(!toolbar.showShapeMenu)}
        onShapeSelect={handleShapeSelect}
        pendingShapeType={drawingMode}
        onImageSelect={onImageSelect}
        menuRef={toolbar.menuRef}
      />
      
      {/* 구분선 */}
      <div style={{ height: '80px', width: '1px', background: 'rgba(244, 114, 182, 0.3)' }}></div>
      
      {/* 텍스트 편집 컨트롤 */}
      <TextEditControls
        fontSize={toolbar.fontSize}
        onFontSizeChange={handleFontSizeChange}
        fontFamily={toolbar.fontFamily}
        onFontFamilyChange={handleFontFamilyChange}
        textColor={toolbar.textColor}
        onTextColorChange={handleTextColorChange}
        fontWeight={toolbar.fontWeight}
        onFontWeightToggle={handleFontWeightToggle}
        fontStyle={toolbar.fontStyle}
        onFontStyleToggle={handleFontStyleToggle}
        textAlign={toolbar.textAlign}
        onTextAlignChange={handleTextAlignChange}
        showTextColorMenu={toolbar.showTextColorMenu}
        onToggleTextColorMenu={() => toolbar.setShowTextColorMenu(!toolbar.showTextColorMenu)}
        textColorMenuRef={toolbar.textColorMenuRef}
      />
      
      {/* 구분선 */}
      <div style={{ height: '80px', width: '1px', background: 'rgba(244, 114, 182, 0.3)' }}></div>
      
      {/* 도형 편집 컨트롤 */}
      <ShapeEditControls
        shapeColor={toolbar.shapeColor}
        onShapeColorChange={handleShapeColorChange}
        strokeColor={toolbar.strokeColor}
        onStrokeColorChange={handleStrokeColorChange}
        strokeWidth={toolbar.strokeWidth}
        onStrokeWidthChange={handleStrokeWidthChange}
        shapeBorderRadius={toolbar.shapeBorderRadius}
        onShapeBorderRadiusChange={handleBorderRadiusChange}
        borderRadiusInputValue={toolbar.borderRadiusInputValue}
        onBorderRadiusInputChange={toolbar.setBorderRadiusInputValue}
        isBorderRadiusEnabled={selectedElementHasBorderRadius}
        maxBorderRadius={maxBorderRadius}
        showShapeColorMenu={toolbar.showShapeColorMenu}
        onToggleShapeColorMenu={() => toolbar.setShowShapeColorMenu(!toolbar.showShapeColorMenu)}
        showEffectsMenu={toolbar.showEffectsMenu}
        onToggleEffectsMenu={() => toolbar.setShowEffectsMenu(!toolbar.showEffectsMenu)}
        showStrokeMenu={toolbar.showStrokeMenu}
        onToggleStrokeMenu={() => toolbar.setShowStrokeMenu(!toolbar.showStrokeMenu)}
        showBringForwardMenu={toolbar.showBringForwardMenu}
        onToggleBringForwardMenu={() => toolbar.setShowBringForwardMenu(!toolbar.showBringForwardMenu)}
        showSendBackwardMenu={toolbar.showSendBackwardMenu}
        onToggleSendBackwardMenu={() => toolbar.setShowSendBackwardMenu(!toolbar.showSendBackwardMenu)}
        shapeColorMenuRef={toolbar.shapeColorMenuRef}
        effectsMenuRef={toolbar.effectsMenuRef}
        strokeMenuRef={toolbar.strokeMenuRef}
        bringForwardMenuRef={toolbar.bringForwardMenuRef}
        sendBackwardMenuRef={toolbar.sendBackwardMenuRef}
        borderRadiusInputRef={toolbar.borderRadiusInputRef}
        isLocked={selectedElementId ? isElementLocked(selectedElementId) : false}
        onToggleLock={() => {
          if (selectedElementId) {
            setElementLock(selectedElementId, !isElementLocked(selectedElementId));
          }
        }}
        shadowType={toolbar.shadowType}
        onShadowTypeChange={(type) => {
          toolbar.setShadowType(type);
          let newOffsetX = toolbar.shadowOffsetX;
          let newOffsetY = toolbar.shadowOffsetY;
          
          // Inner shadow로 변경 시 offset을 양수로 설정 (아래쪽, 오른쪽)
          if (type === 'inner') {
            // 음수면 양수로 변환, 이미 양수면 유지
            if (newOffsetX < 0) {
              newOffsetX = Math.abs(newOffsetX);
            } else if (newOffsetX === 0) {
              newOffsetX = 5; // 기본값
            }
            if (newOffsetY < 0) {
              newOffsetY = Math.abs(newOffsetY);
            } else if (newOffsetY === 0) {
              newOffsetY = 5; // 기본값
            }
            toolbar.setShadowOffsetX(newOffsetX);
            toolbar.setShadowOffsetY(newOffsetY);
          } else if (type === 'outer') {
            // Outer shadow로 변경 시 offset을 양수로 설정 (아래쪽, 오른쪽)
            if (newOffsetX < 0) {
              newOffsetX = Math.abs(newOffsetX);
            } else if (newOffsetX === 0) {
              newOffsetX = 5; // 기본값
            }
            if (newOffsetY < 0) {
              newOffsetY = Math.abs(newOffsetY);
            } else if (newOffsetY === 0) {
              newOffsetY = 5; // 기본값
            }
            toolbar.setShadowOffsetX(newOffsetX);
            toolbar.setShadowOffsetY(newOffsetY);
          }
          
          // 변환된 offset 값으로 onEffectsChange 호출
          if (onEffectsChange && selectedElementId) {
            onEffectsChange(type, toolbar.shadowColor, toolbar.shadowBlur, newOffsetX, newOffsetY, toolbar.opacity);
          }
        }}
        shadowColor={toolbar.shadowColor}
        onShadowColorChange={(color) => {
          toolbar.setShadowColor(color);
          if (onEffectsChange && selectedElementId) {
            onEffectsChange(toolbar.shadowType, color, toolbar.shadowBlur, toolbar.shadowOffsetX, toolbar.shadowOffsetY, toolbar.opacity);
          }
        }}
        shadowBlur={toolbar.shadowBlur}
        onShadowBlurChange={(blur) => {
          toolbar.setShadowBlur(blur);
          if (onEffectsChange && selectedElementId) {
            onEffectsChange(toolbar.shadowType, toolbar.shadowColor, blur, toolbar.shadowOffsetX, toolbar.shadowOffsetY, toolbar.opacity);
          }
        }}
        shadowOffsetX={toolbar.shadowOffsetX}
        onShadowOffsetXChange={(offset) => {
          // shadowType에 맞게 값 제한 및 변환
          let adjustedOffset = offset;
          if (toolbar.shadowType === 'outer' || toolbar.shadowType === 'inner') {
            // Outer shadow와 Inner shadow 모두 양수만 허용 (오른쪽)
            if (offset < 0) {
              adjustedOffset = 0;
            }
          }
          toolbar.setShadowOffsetX(adjustedOffset);
          if (onEffectsChange && selectedElementId) {
            onEffectsChange(toolbar.shadowType, toolbar.shadowColor, toolbar.shadowBlur, adjustedOffset, toolbar.shadowOffsetY, toolbar.opacity);
          }
        }}
        shadowOffsetY={toolbar.shadowOffsetY}
        onShadowOffsetYChange={(offset) => {
          // shadowType에 맞게 값 제한 및 변환
          let adjustedOffset = offset;
          if (toolbar.shadowType === 'outer' || toolbar.shadowType === 'inner') {
            // Outer shadow와 Inner shadow 모두 양수만 허용 (아래쪽)
            if (offset < 0) {
              adjustedOffset = 0;
            }
          }
          toolbar.setShadowOffsetY(adjustedOffset);
          if (onEffectsChange && selectedElementId) {
            onEffectsChange(toolbar.shadowType, toolbar.shadowColor, toolbar.shadowBlur, toolbar.shadowOffsetX, adjustedOffset, toolbar.opacity);
          }
        }}
        opacity={toolbar.opacity}
        onOpacityChange={(opacity) => {
          toolbar.setOpacity(opacity);
          if (onEffectsChange && selectedElementId) {
            onEffectsChange(toolbar.shadowType, toolbar.shadowColor, toolbar.shadowBlur, toolbar.shadowOffsetX, toolbar.shadowOffsetY, opacity);
          }
        }}
      />
    </div>
  );
}

