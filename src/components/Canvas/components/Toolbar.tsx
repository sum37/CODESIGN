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

export function Toolbar({ onAddText, onShapeSelect, onFontSizeChange, onFontFamilyChange, onFontWeightChange, onFontStyleChange, onTextColorChange, onTextAlignChange, onShapeColorChange, onStrokeChange, onBorderRadiusChange, onEffectsChange }: ToolbarProps) {
  const toolbar = useToolbar();
  const { drawingMode, selectedElementId, selectedElementHasBorderRadius, selectedElementBorderRadius, selectedElementSize, setElementLock, isElementLocked } = useCanvasStore();

  const maxBorderRadius = selectedElementSize.width > 0 && selectedElementSize.height > 0
    ? Math.floor(Math.min(selectedElementSize.width, selectedElementSize.height) / 2)
    : 100;

  useEffect(() => {
    if (selectedElementHasBorderRadius) {
      toolbar.setShapeBorderRadius(selectedElementBorderRadius);
      toolbar.setBorderRadiusInputValue(String(selectedElementBorderRadius));
    }
  }, [selectedElementId, selectedElementBorderRadius, selectedElementHasBorderRadius]);

  const handleShapeSelect = (shapeType: string) => {
    toolbar.setShowShapeMenu(false);
    onShapeSelect(shapeType);
  };

  const handleFontSizeChange = (size: number) => {
    toolbar.setFontSize(size);
    if (selectedElementId && onFontSizeChange) onFontSizeChange(size);
  };

  const handleFontFamilyChange = (family: string) => {
    toolbar.setFontFamily(family);
    if (selectedElementId && onFontFamilyChange) onFontFamilyChange(family);
  };

  const handleFontWeightToggle = () => {
    const newWeight = toolbar.fontWeight === 'bold' ? 'normal' : 'bold';
    toolbar.setFontWeight(newWeight);
    if (selectedElementId && onFontWeightChange) onFontWeightChange(newWeight);
  };

  const handleFontStyleToggle = () => {
    const newStyle = toolbar.fontStyle === 'italic' ? 'normal' : 'italic';
    toolbar.setFontStyle(newStyle);
    if (selectedElementId && onFontStyleChange) onFontStyleChange(newStyle);
  };

  const handleTextColorChange = (color: string) => {
    toolbar.setTextColor(color);
    if (selectedElementId && onTextColorChange) onTextColorChange(color);
  };

  const handleTextAlignChange = (align: 'left' | 'center' | 'right') => {
    toolbar.setTextAlign(align);
    if (selectedElementId && onTextAlignChange) onTextAlignChange(align);
  };

  const handleShapeColorChange = (color: string) => {
    toolbar.setShapeColor(color);
    if (selectedElementId && onShapeColorChange) onShapeColorChange(color);
  };

  const handleStrokeColorChange = (color: string) => {
    toolbar.setStrokeColor(color);
    if (selectedElementId && onStrokeChange) onStrokeChange(color, toolbar.strokeWidth);
  };

  const handleStrokeWidthChange = (width: number) => {
    toolbar.setStrokeWidth(width);
    if (selectedElementId && onStrokeChange) onStrokeChange(toolbar.strokeColor, width);
  };

  const handleBorderRadiusChange = (radius: number) => {
    toolbar.setShapeBorderRadius(radius);
    toolbar.setBorderRadiusInputValue(String(radius));
    if (selectedElementId && onBorderRadiusChange) onBorderRadiusChange(radius);
  };

  return (
    <div className="canvas-toolbar" style={{ alignItems: 'stretch', gap: '16px', padding: '8px 16px' }}>
      {/* 요소 추가 버튼들 */}
      <ToolbarButtonGroup
        pendingText={toolbar.pendingText}
        onAddText={onAddText}
        showShapeMenu={toolbar.showShapeMenu}
        onToggleShapeMenu={() => toolbar.setShowShapeMenu(!toolbar.showShapeMenu)}
        onShapeSelect={handleShapeSelect}
        pendingShapeType={drawingMode}
        menuRef={toolbar.menuRef}
      />
      
      {/* 구분선 */}
      <div style={{ width: '1px', background: 'rgba(244, 114, 182, 0.3)', alignSelf: 'stretch' }}></div>
      
      {/* 텍스트 편집 (2행) */}
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
      <div style={{ width: '1px', background: 'rgba(244, 114, 182, 0.3)', alignSelf: 'stretch' }}></div>
      
      {/* 도형 편집 (2행) */}
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
        shapeColorMenuRef={toolbar.shapeColorMenuRef}
        effectsMenuRef={toolbar.effectsMenuRef}
        strokeMenuRef={toolbar.strokeMenuRef}
        borderRadiusInputRef={toolbar.borderRadiusInputRef}
        isLocked={selectedElementId ? isElementLocked(selectedElementId) : false}
        onToggleLock={() => {
          if (selectedElementId) setElementLock(selectedElementId, !isElementLocked(selectedElementId));
        }}
        shadowType={toolbar.shadowType}
        onShadowTypeChange={(type) => {
          toolbar.setShadowType(type);
          let newOffsetX = toolbar.shadowOffsetX;
          let newOffsetY = toolbar.shadowOffsetY;
          if (type === 'inner' || type === 'outer') {
            if (newOffsetX <= 0) newOffsetX = 5;
            if (newOffsetY <= 0) newOffsetY = 5;
            toolbar.setShadowOffsetX(newOffsetX);
            toolbar.setShadowOffsetY(newOffsetY);
          }
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
          const adj = Math.max(0, offset);
          toolbar.setShadowOffsetX(adj);
          if (onEffectsChange && selectedElementId) {
            onEffectsChange(toolbar.shadowType, toolbar.shadowColor, toolbar.shadowBlur, adj, toolbar.shadowOffsetY, toolbar.opacity);
          }
        }}
        shadowOffsetY={toolbar.shadowOffsetY}
        onShadowOffsetYChange={(offset) => {
          const adj = Math.max(0, offset);
          toolbar.setShadowOffsetY(adj);
          if (onEffectsChange && selectedElementId) {
            onEffectsChange(toolbar.shadowType, toolbar.shadowColor, toolbar.shadowBlur, toolbar.shadowOffsetX, adj, toolbar.opacity);
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
