import { useState, useRef, useEffect } from 'react';
import { useCanvasStore } from '../../../stores/canvasStore';

export interface ToolbarState {
  // 도형 메뉴
  showShapeMenu: boolean;
  setShowShapeMenu: (show: boolean) => void;
  pendingShapeType: string | null;
  setPendingShapeType: (type: string | null) => void;
  menuRef: React.RefObject<HTMLDivElement>;
  
  // 텍스트
  pendingText: boolean;
  setPendingText: (pending: boolean) => void;
  imageInputRef: React.RefObject<HTMLInputElement>;
  
  // 텍스트 편집
  showTextColorMenu: boolean;
  setShowTextColorMenu: (show: boolean) => void;
  textColor: string;
  setTextColor: (color: string) => void;
  fontSize: number;
  setFontSize: (size: number) => void;
  fontFamily: string;
  setFontFamily: (family: string) => void;
  fontWeight: 'normal' | 'bold';
  setFontWeight: (weight: 'normal' | 'bold') => void;
  fontStyle: 'normal' | 'italic';
  setFontStyle: (style: 'normal' | 'italic') => void;
  textAlign: 'left' | 'center' | 'right';
  setTextAlign: (align: 'left' | 'center' | 'right') => void;
  textColorMenuRef: React.RefObject<HTMLDivElement>;
  
  // 도형 편집
  showShapeColorMenu: boolean;
  setShowShapeColorMenu: (show: boolean) => void;
  showEffectsMenu: boolean;
  setShowEffectsMenu: (show: boolean) => void;
  showStrokeMenu: boolean;
  setShowStrokeMenu: (show: boolean) => void;
  showBringForwardMenu: boolean;
  setShowBringForwardMenu: (show: boolean) => void;
  showSendBackwardMenu: boolean;
  setShowSendBackwardMenu: (show: boolean) => void;
  shapeColor: string;
  setShapeColor: (color: string) => void;
  strokeColor: string;
  setStrokeColor: (color: string) => void;
  strokeWidth: number;
  setStrokeWidth: (width: number) => void;
  shapeBorderRadius: number;
  setShapeBorderRadius: (radius: number) => void;
  borderRadiusInputValue: string;
  setBorderRadiusInputValue: (value: string) => void;
  shapeColorMenuRef: React.RefObject<HTMLDivElement>;
  effectsMenuRef: React.RefObject<HTMLDivElement>;
  strokeMenuRef: React.RefObject<HTMLDivElement>;
  bringForwardMenuRef: React.RefObject<HTMLDivElement>;
  sendBackwardMenuRef: React.RefObject<HTMLDivElement>;
  borderRadiusInputRef: React.RefObject<HTMLInputElement>;
  
  // Effects 관련
  shadowType: 'none' | 'outer' | 'inner';
  setShadowType: (type: 'none' | 'outer' | 'inner') => void;
  shadowColor: string;
  setShadowColor: (color: string) => void;
  shadowBlur: number;
  setShadowBlur: (blur: number) => void;
  shadowOffsetX: number;
  setShadowOffsetX: (offset: number) => void;
  shadowOffsetY: number;
  setShadowOffsetY: (offset: number) => void;
  opacity: number;
  setOpacity: (opacity: number) => void;
}

export function useToolbar(): ToolbarState {
  // 도형 메뉴
  const [showShapeMenu, setShowShapeMenu] = useState(false);
  const [pendingShapeType, setPendingShapeType] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  
  // 텍스트
  const [pendingText, setPendingText] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  
  // 텍스트 편집
  const [showTextColorMenu, setShowTextColorMenu] = useState(false);
  const [textColor, setTextColor] = useState('#000000');
  const [fontSize, setFontSize] = useState(16);
  const [fontFamily, setFontFamily] = useState('Nanum Gothic');
  const [fontWeight, setFontWeight] = useState<'normal' | 'bold'>('normal');
  const [fontStyle, setFontStyle] = useState<'normal' | 'italic'>('normal');
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right'>('left');
  const textColorMenuRef = useRef<HTMLDivElement>(null);
  
  // 도형 편집
  const [showShapeColorMenu, setShowShapeColorMenu] = useState(false);
  const [showEffectsMenu, setShowEffectsMenu] = useState(false);
  const [showStrokeMenu, setShowStrokeMenu] = useState(false);
  const [showBringForwardMenu, setShowBringForwardMenu] = useState(false);
  const [showSendBackwardMenu, setShowSendBackwardMenu] = useState(false);
  const [shapeColor, setShapeColor] = useState('#f9a8d4');
  const [strokeColor, setStrokeColor] = useState('#000000');
  const [strokeWidth, setStrokeWidth] = useState(1);
  const [shapeBorderRadius, setShapeBorderRadius] = useState(0);
  const [borderRadiusInputValue, setBorderRadiusInputValue] = useState('0');
  const shapeColorMenuRef = useRef<HTMLDivElement>(null);
  const effectsMenuRef = useRef<HTMLDivElement>(null);
  const strokeMenuRef = useRef<HTMLDivElement>(null);
  const bringForwardMenuRef = useRef<HTMLDivElement>(null);
  const sendBackwardMenuRef = useRef<HTMLDivElement>(null);
  const borderRadiusInputRef = useRef<HTMLInputElement>(null);
  
  // Effects 관련
  const [shadowType, setShadowType] = useState<'none' | 'outer' | 'inner'>('none');
  const [shadowColor, setShadowColor] = useState('#000000');
  const [shadowBlur, setShadowBlur] = useState(10);
  const [shadowOffsetX, setShadowOffsetX] = useState(5); // 기본값: 오른쪽 방향
  const [shadowOffsetY, setShadowOffsetY] = useState(5); // 기본값: 아래쪽 방향
  const [opacity, setOpacity] = useState(100);
  
  
  // 외부 클릭 시 메뉴 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowShapeMenu(false);
      }
      if (textColorMenuRef.current && !textColorMenuRef.current.contains(event.target as Node)) {
        setShowTextColorMenu(false);
      }
      if (shapeColorMenuRef.current && !shapeColorMenuRef.current.contains(event.target as Node)) {
        setShowShapeColorMenu(false);
      }
      if (effectsMenuRef.current && !effectsMenuRef.current.contains(event.target as Node)) {
        setShowEffectsMenu(false);
      }
      if (strokeMenuRef.current && !strokeMenuRef.current.contains(event.target as Node)) {
        setShowStrokeMenu(false);
      }
      if (bringForwardMenuRef.current && !bringForwardMenuRef.current.contains(event.target as Node)) {
        setShowBringForwardMenu(false);
      }
      if (sendBackwardMenuRef.current && !sendBackwardMenuRef.current.contains(event.target as Node)) {
        setShowSendBackwardMenu(false);
      }
    };
    
    if (showShapeMenu || showTextColorMenu || showShapeColorMenu || showEffectsMenu || showStrokeMenu || showBringForwardMenu || showSendBackwardMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showShapeMenu, showTextColorMenu, showShapeColorMenu, showEffectsMenu, showStrokeMenu, showBringForwardMenu, showSendBackwardMenu]);
  
  return {
    // 도형 메뉴
    showShapeMenu,
    setShowShapeMenu,
    pendingShapeType,
    setPendingShapeType,
    menuRef,
    
    // 텍스트
    pendingText,
    setPendingText,
    imageInputRef,
    
    // 텍스트 편집
    showTextColorMenu,
    setShowTextColorMenu,
    textColor,
    setTextColor,
    fontSize,
    setFontSize,
    fontFamily,
    setFontFamily,
    fontWeight,
    setFontWeight,
    fontStyle,
    setFontStyle,
    textAlign,
    setTextAlign,
    textColorMenuRef,
    
    // 도형 편집
    showShapeColorMenu,
    setShowShapeColorMenu,
    showEffectsMenu,
    setShowEffectsMenu,
    showStrokeMenu,
    setShowStrokeMenu,
    showBringForwardMenu,
    setShowBringForwardMenu,
    showSendBackwardMenu,
    setShowSendBackwardMenu,
    shapeColor,
    setShapeColor,
    strokeColor,
    setStrokeColor,
    strokeWidth,
    setStrokeWidth,
    shapeBorderRadius,
    setShapeBorderRadius,
    borderRadiusInputValue,
    setBorderRadiusInputValue,
    shapeColorMenuRef,
    effectsMenuRef,
    strokeMenuRef,
    bringForwardMenuRef,
    sendBackwardMenuRef,
    borderRadiusInputRef,
    
    // Effects 관련
    shadowType,
    setShadowType,
    shadowColor,
    setShadowColor,
    shadowBlur,
    setShadowBlur,
    shadowOffsetX,
    setShadowOffsetX,
    shadowOffsetY,
    setShadowOffsetY,
    opacity,
    setOpacity,
  };
}


