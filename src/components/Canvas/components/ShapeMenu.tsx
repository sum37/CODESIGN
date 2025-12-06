import './Toolbar.css';

interface ShapeMenuProps {
  showShapeMenu: boolean;
  onShapeSelect: (shapeType: string) => void;
}

export function ShapeMenu({ showShapeMenu, onShapeSelect }: ShapeMenuProps) {
  if (!showShapeMenu) return null;

  const handleShapeClick = (shapeType: string) => {
    onShapeSelect(shapeType);
  };

  return (
    <div className="canvas-shape-menu">
      {/* Rectangles */}
      <div className="canvas-shape-menu-section">
        Rectangles
      </div>
      <div className="canvas-shape-menu-grid">
        <button
          onClick={() => handleShapeClick("rectangle")}
          className="canvas-shape-menu-button"
          title="Rectangle"
        >
          <div className="canvas-shape-preview rounded-sm"></div>
        </button>
        <button
          onClick={() => handleShapeClick("roundedRectangle")}
          className="canvas-shape-menu-button"
          title="Rounded Rectangle"
        >
          <div className="canvas-shape-preview rounded"></div>
        </button>
        <button
          onClick={() => handleShapeClick("parallelogram")}
          className="canvas-shape-menu-button"
          title="Parallelogram"
        >
          <div className="canvas-shape-preview" style={{ transform: "skew(-20deg)" }}></div>
        </button>
      </div>
      
      {/* Circles */}
      <div className="canvas-shape-menu-section">
        Circles
      </div>
      <div className="canvas-shape-menu-grid">
        <button
          onClick={() => handleShapeClick("circle")}
          className="canvas-shape-menu-button"
          title="Circle"
        >
          <div className="canvas-shape-preview rounded-full"></div>
        </button>
        <button
          onClick={() => handleShapeClick("ellipse")}
          className="canvas-shape-menu-button"
          title="Ellipse"
        >
          <div className="canvas-shape-preview ellipse"></div>
        </button>
      </div>
      
      {/* Polygons */}
      <div className="canvas-shape-menu-section">
        Polygons
      </div>
      <div className="canvas-shape-menu-grid">
        <button
          onClick={() => handleShapeClick("triangle")}
          className="canvas-shape-menu-button"
          title="Triangle"
        >
          <svg width="32" height="32" viewBox="0 0 32 32">
            <polygon points="16,4 4,28 28,28" fill="#f9a8d4" />
          </svg>
        </button>
        <button
          onClick={() => handleShapeClick("diamond")}
          className="canvas-shape-menu-button"
          title="Diamond"
        >
          <svg width="32" height="32" viewBox="0 0 32 32">
            <polygon points="16,4 28,16 16,28 4,16" fill="#f9a8d4" />
          </svg>
        </button>
        <button
          onClick={() => handleShapeClick("star")}
          className="canvas-shape-menu-button"
          title="Star"
        >
          <svg width="32" height="32" viewBox="0 0 32 32">
            <polygon points="16,2 19.5,12.2 30,12.2 21.2,18.6 24.7,28.8 16,22.4 7.3,28.8 10.8,18.6 2,12.2 12.5,12.2" fill="#f9a8d4" />
          </svg>
        </button>
      </div>
      <div className="canvas-shape-menu-grid">
        <button
          onClick={() => handleShapeClick("pentagon")}
          className="canvas-shape-menu-button"
          title="Pentagon"
        >
          <svg width="32" height="32" viewBox="0 0 32 32">
            <polygon points="16,4 28,12 24,26 8,26 4,12" fill="#f9a8d4" />
          </svg>
        </button>
        <button
          onClick={() => handleShapeClick("hexagon")}
          className="canvas-shape-menu-button"
          title="Hexagon"
        >
          <svg width="32" height="32" viewBox="0 0 32 32">
            <polygon points="16,4 24,8 28,16 24,24 16,28 8,24 4,16 8,8" fill="#f9a8d4" />
          </svg>
        </button>
      </div>
    </div>
  );
}

