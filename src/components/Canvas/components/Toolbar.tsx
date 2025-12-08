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
  onFontWeightChange?: (fontWeight: 'normal' | 'bold') => void;
  onFontStyleChange?: (fontStyle: 'normal' | 'italic') => void;
  onTextColorChange?: (color: string) => void;
  onTextAlignChange?: (textAlign: 'left' | 'center' | 'right') => void;
}

export function Toolbar({ onAddText, onShapeSelect, onImageSelect, onFontSizeChange, onFontWeightChange, onFontStyleChange, onTextColorChange, onTextAlignChange }: ToolbarProps) {
  const toolbar = useToolbar();
  const { drawingMode, selectedElementId } = useCanvasStore();

  const handleShapeSelect = (shapeType: string) => {
    toolbar.setShowShapeMenu(false);
    console.log(`${shapeType} 그리기 모드 활성화`);
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
        onShapeColorChange={toolbar.setShapeColor}
        shapeBorderRadius={toolbar.shapeBorderRadius}
        onShapeBorderRadiusChange={toolbar.setShapeBorderRadius}
        borderRadiusInputValue={toolbar.borderRadiusInputValue}
        onBorderRadiusInputChange={toolbar.setBorderRadiusInputValue}
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
      />
    </div>
  );
}

