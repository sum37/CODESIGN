import { ToolbarButtonGroup } from './ToolbarButtonGroup';
import { TextEditControls } from './TextEditControls';
import { ShapeEditControls } from './ShapeEditControls';
import { useToolbar } from '../hooks/useToolbar';
import './Toolbar.css';

interface ToolbarProps {
  onAddText: () => void;
  onShapeSelect: (shapeType: string) => void;
  onImageSelect: (file: File) => void;
}

export function Toolbar({ onAddText, onShapeSelect, onImageSelect }: ToolbarProps) {
  const toolbar = useToolbar();

  const handleShapeSelect = (shapeType: string) => {
    toolbar.setPendingShapeType(shapeType);
    toolbar.setShowShapeMenu(false);
    console.log(`${shapeType} 추가`);
    setTimeout(() => toolbar.setPendingShapeType(null), 1000);
    onShapeSelect(shapeType);
  };

  return (
    <div className="canvas-toolbar">
      <ToolbarButtonGroup
        pendingText={toolbar.pendingText}
        onAddText={onAddText}
        showShapeMenu={toolbar.showShapeMenu}
        onToggleShapeMenu={() => toolbar.setShowShapeMenu(!toolbar.showShapeMenu)}
        onShapeSelect={handleShapeSelect}
        pendingShapeType={toolbar.pendingShapeType}
        onImageSelect={onImageSelect}
        menuRef={toolbar.menuRef}
      />
      
      {/* 구분선 */}
      <div style={{ height: '80px', width: '1px', background: 'rgba(244, 114, 182, 0.3)' }}></div>
      
      {/* 텍스트 편집 컨트롤 */}
      <TextEditControls
        fontSize={toolbar.fontSize}
        onFontSizeChange={toolbar.setFontSize}
        textColor={toolbar.textColor}
        onTextColorChange={toolbar.setTextColor}
        fontWeight={toolbar.fontWeight}
        onFontWeightToggle={() => toolbar.setFontWeight(toolbar.fontWeight === 'bold' ? 'normal' : 'bold')}
        fontStyle={toolbar.fontStyle}
        onFontStyleToggle={() => toolbar.setFontStyle(toolbar.fontStyle === 'italic' ? 'normal' : 'italic')}
        textAlign={toolbar.textAlign}
        onTextAlignChange={toolbar.setTextAlign}
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

