export type ShapeType = 
  | "rectangle" 
  | "roundedRectangle" 
  | "parallelogram"
  | "circle" 
  | "ellipse"
  | "triangle"
  | "diamond"
  | "star"
  | "hexagon"
  | "pentagon";

export interface Shape {
  id: string;
  type: ShapeType;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  zIndex: number;
  borderRadius?: number;
  opacity?: number;
  strokeWidth?: number;
  strokeColor?: string;
  shadowType?: "none" | "inner" | "outer";
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  shadowBlur?: number;
  shadowColor?: string;
  glowEnabled?: boolean;
  glowColor?: string;
  glowBlur?: number;
}

function isClipPathShape(type: ShapeType): boolean {
  return ["diamond", "star", "hexagon", "pentagon"].includes(type);
}

/**
 * 도형을 React JSX 코드로 변환
 */
export function getShapeReactCode(shape: Shape): string {
  if (shape.type === "triangle") {
    let svgStyle = `      position: 'absolute',\n      left: ${shape.x},\n      top: ${shape.y},\n      width: ${shape.width},\n      height: ${shape.height},\n      zIndex: ${shape.zIndex},`;
    
    if (shape.opacity !== undefined) {
      svgStyle += `\n      opacity: ${shape.opacity},`;
    }
    
    const filters: string[] = [];
    
    if (shape.shadowType && shape.shadowType !== "none" && shape.shadowType === "outer") {
      const offsetX = shape.shadowOffsetX ?? 4;
      const offsetY = shape.shadowOffsetY ?? 4;
      const blur = shape.shadowBlur ?? 8;
      const color = shape.shadowColor ?? "rgba(0, 0, 0, 0.3)";
      filters.push(`drop-shadow(${offsetX}px ${offsetY}px ${blur}px ${color})`);
    }
    
    if (shape.glowEnabled) {
      const glowColor = shape.glowColor ?? shape.color;
      const glowBlur = shape.glowBlur ?? 20;
      filters.push(`drop-shadow(0 0 ${glowBlur}px ${glowColor})`);
    }
    
    if (filters.length > 0) {
      svgStyle += `\n      filter: '${filters.join(" ")}',`;
    }
    
    let polygonProps = "";
    if (shape.strokeWidth !== undefined && shape.strokeWidth > 0) {
      polygonProps = `\n      stroke='${shape.strokeColor ?? "#000000"}'\n      strokeWidth={${shape.strokeWidth}}`;
    }
    
    return `  <svg\n    id="${shape.id}"\n    style={{\n${svgStyle}\n    }}\n  >\n    <polygon\n      points={\`${shape.width / 2},0 0,${shape.height} ${shape.width},${shape.height}\`}\n      fill='${shape.color}'${polygonProps}\n    />\n  </svg>`;
  }
  
  let style = `      position: 'absolute',\n      left: ${shape.x},\n      top: ${shape.y},\n      width: ${shape.width},\n      height: ${shape.height},\n      zIndex: ${shape.zIndex},`;
  
  style += `\n      backgroundColor: '${shape.color}',`;
  
  if (shape.opacity !== undefined) {
    style += `\n      opacity: ${shape.opacity},`;
  }
  
  if (shape.type === "roundedRectangle" && shape.borderRadius !== undefined) {
    style += `\n      borderRadius: ${shape.borderRadius},`;
  } else {
    switch (shape.type) {
      case "roundedRectangle":
        style += "\n      borderRadius: '10px',";
        break;
      case "circle":
      case "ellipse":
        style += "\n      borderRadius: '50%',";
        break;
      case "parallelogram":
        style += "\n      transform: 'skew(-20deg)',";
        break;
      case "diamond":
        style += "\n      clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',";
        break;
      case "star":
        style += "\n      clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',";
        break;
      case "hexagon":
        style += "\n      clipPath: 'polygon(30% 0%, 70% 0%, 100% 50%, 70% 100%, 30% 100%, 0% 50%)',";
        break;
      case "pentagon":
        style += "\n      clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)',";
        break;
    }
  }
  
  const useClipPath = isClipPathShape(shape.type);
  const shadows: string[] = [];
  const filters: string[] = [];
  
  if (shape.shadowType && shape.shadowType !== "none") {
    const offsetX = shape.shadowOffsetX ?? 4;
    const offsetY = shape.shadowOffsetY ?? 4;
    const blur = shape.shadowBlur ?? 8;
    const color = shape.shadowColor ?? "rgba(0, 0, 0, 0.3)";
    
    if (useClipPath) {
      if (shape.shadowType === "outer") {
        filters.push(`drop-shadow(${offsetX}px ${offsetY}px ${blur}px ${color})`);
      }
    } else {
      if (shape.shadowType === "inner") {
        shadows.push(`inset ${offsetX}px ${offsetY}px ${blur}px ${color}`);
      } else {
        shadows.push(`${offsetX}px ${offsetY}px ${blur}px ${color}`);
      }
    }
  }

  if (shape.glowEnabled) {
    const glowColor = shape.glowColor ?? shape.color;
    const glowBlur = shape.glowBlur ?? 20;
    
    if (useClipPath) {
      filters.push(`drop-shadow(0 0 ${glowBlur}px ${glowColor})`);
    } else {
      shadows.push(`0 0 ${glowBlur}px ${glowColor}`);
    }
  }

  if (shadows.length > 0) {
    style += `\n      boxShadow: '${shadows.join(", ")}',`;
  }
  if (filters.length > 0) {
    style += `\n      filter: '${filters.join(" ")}',`;
  }
  
  if (shape.strokeWidth !== undefined && shape.strokeWidth > 0) {
    style += `\n      border: '${shape.strokeWidth}px solid ${shape.strokeColor ?? "#000000"}',`;
  }
  
  return `  <div\n    id="${shape.id}"\n    style={{\n${style}\n    }}\n  />`;
}

/**
 * 기본 도형 생성
 */
export function createDefaultShape(
  type: ShapeType,
  x: number = 100,
  y: number = 100,
  width: number = 100,
  height: number = 100
): Shape {
  const id = `shape-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  return {
    id,
    type,
    x,
    y,
    width,
    height,
    color: "#e08fb3", // 핑크색
    zIndex: 1000, // 높은 z-index로 앞에 표시
    borderRadius: type === "roundedRectangle" ? 10 : undefined,
  };
}

