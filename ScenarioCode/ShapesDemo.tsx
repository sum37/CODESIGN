import React from 'react';

/**
 * ShapesDemo - 도형 추가 및 스타일 편집 테스트
 * 
 * 시나리오:
 * 1. 툴바에서 도형 버튼 클릭
 * 2. 캔버스에서 드래그하여 도형 생성
 * 3. 배경색, 테두리, 그림자 등 스타일 편집
 * 4. Delete 키로 도형 삭제
 */
export default function ShapesDemo() {
  return (
    <div style={{
      width: "100%",
      minHeight: "800px",
      backgroundColor: "#f0fdf4",
      padding: "40px",
      position: "relative"
    }}>
      {/* 타이틀 */}
      <div style={{
        textAlign: "center",
        marginBottom: "40px"
      }}>
        <h1 style={{
          fontSize: "36px",
          color: "#166534",
          margin: "0 0 12px 0"
        }}>
          🎨 도형 편집 데모
        </h1>
        <p style={{
          fontSize: "18px",
          color: "#4ade80",
          margin: 0
        }}>
          툴바에서 도형을 선택하고 캔버스에 드래그하여 그리세요
        </p>
      </div>

      {/* 기본 도형들 */}
      <div style={{
        backgroundColor: "#ffffff",
        borderRadius: "24px",
        padding: "40px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
        marginBottom: "30px"
      }}>
        <h2 style={{
          fontSize: "20px",
          color: "#1e293b",
          marginBottom: "30px"
        }}>
          🔷 기본 도형
        </h2>

        <div style={{
          display: "flex",
          gap: "40px",
          alignItems: "center",
          flexWrap: "wrap"
        }}>
          {/* 사각형 */}
          <div style={{
            textAlign: "center"
          }}>
            <div style={{
              width: "100px",
              height: "100px",
              backgroundColor: "#f9a8d4",
              marginBottom: "12px"
            }}></div>
            <span style={{ color: "#64748b", fontSize: "14px" }}>Rectangle</span>
          </div>

          {/* 둥근 사각형 */}
          <div style={{
            textAlign: "center"
          }}>
            <div style={{
              width: "100px",
              height: "100px",
              backgroundColor: "#a78bfa",
              borderRadius: "16px",
              marginBottom: "12px"
            }}></div>
            <span style={{ color: "#64748b", fontSize: "14px" }}>Rounded</span>
          </div>

          {/* 원 */}
          <div style={{
            textAlign: "center"
          }}>
            <div style={{
              width: "100px",
              height: "100px",
              backgroundColor: "#67e8f9",
              borderRadius: "50%",
              marginBottom: "12px"
            }}></div>
            <span style={{ color: "#64748b", fontSize: "14px" }}>Circle</span>
          </div>

          {/* 타원 */}
          <div style={{
            textAlign: "center"
          }}>
            <div style={{
              width: "140px",
              height: "80px",
              backgroundColor: "#fdba74",
              borderRadius: "50%",
              marginBottom: "12px"
            }}></div>
            <span style={{ color: "#64748b", fontSize: "14px" }}>Ellipse</span>
          </div>

          {/* 평행사변형 */}
          <div style={{
            textAlign: "center"
          }}>
            <div style={{
              width: "120px",
              height: "80px",
              backgroundColor: "#86efac",
              transform: "skew(-20deg)",
              marginBottom: "12px"
            }}></div>
            <span style={{ color: "#64748b", fontSize: "14px" }}>Parallelogram</span>
          </div>
        </div>
      </div>

      {/* SVG 도형들 */}
      <div style={{
        backgroundColor: "#ffffff",
        borderRadius: "24px",
        padding: "40px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
        marginBottom: "30px"
      }}>
        <h2 style={{
          fontSize: "20px",
          color: "#1e293b",
          marginBottom: "30px"
        }}>
          ⭐ SVG 도형
        </h2>

        <div style={{
          display: "flex",
          gap: "40px",
          alignItems: "center",
          flexWrap: "wrap"
        }}>
          {/* 삼각형 */}
          <div style={{
            textAlign: "center"
          }}>
            <svg width="100" height="100" viewBox="0 0 100 100" preserveAspectRatio="none">
              <polygon points="50,0 100,100 0,100" fill="#f9a8d4" />
            </svg>
            <div style={{ marginTop: "12px" }}>
              <span style={{ color: "#64748b", fontSize: "14px" }}>Triangle</span>
            </div>
          </div>

          {/* 마름모 */}
          <div style={{
            textAlign: "center"
          }}>
            <svg width="100" height="100" viewBox="0 0 100 100" preserveAspectRatio="none">
              <polygon points="50,0 100,50 50,100 0,50" fill="#a78bfa" />
            </svg>
            <div style={{ marginTop: "12px" }}>
              <span style={{ color: "#64748b", fontSize: "14px" }}>Diamond</span>
            </div>
          </div>

          {/* 별 */}
          <div style={{
            textAlign: "center"
          }}>
            <svg width="100" height="100" viewBox="0 0 100 100" preserveAspectRatio="none">
              <polygon points="50,0 61,35 98,35 68,57 79,91 50,70 21,91 32,57 2,35 39,35" fill="#fbbf24" />
            </svg>
            <div style={{ marginTop: "12px" }}>
              <span style={{ color: "#64748b", fontSize: "14px" }}>Star</span>
            </div>
          </div>

          {/* 오각형 */}
          <div style={{
            textAlign: "center"
          }}>
            <svg width="100" height="100" viewBox="0 0 100 100" preserveAspectRatio="none">
              <polygon points="50,0 100,38 81,100 19,100 0,38" fill="#67e8f9" />
            </svg>
            <div style={{ marginTop: "12px" }}>
              <span style={{ color: "#64748b", fontSize: "14px" }}>Pentagon</span>
            </div>
          </div>

          {/* 육각형 */}
          <div style={{
            textAlign: "center"
          }}>
            <svg width="100" height="100" viewBox="0 0 100 100" preserveAspectRatio="none">
              <polygon points="50,0 93,25 93,75 50,100 7,75 7,25" fill="#86efac" />
            </svg>
            <div style={{ marginTop: "12px" }}>
              <span style={{ color: "#64748b", fontSize: "14px" }}>Hexagon</span>
            </div>
          </div>
        </div>
      </div>

      {/* 스타일 예시 */}
      <div style={{
        backgroundColor: "#ffffff",
        borderRadius: "24px",
        padding: "40px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.08)"
      }}>
        <h2 style={{
          fontSize: "20px",
          color: "#1e293b",
          marginBottom: "30px"
        }}>
          ✨ 스타일 효과
        </h2>

        <div style={{
          display: "flex",
          gap: "40px",
          alignItems: "center",
          flexWrap: "wrap"
        }}>
          {/* 테두리 */}
          <div style={{
            textAlign: "center"
          }}>
            <div style={{
              width: "100px",
              height: "100px",
              backgroundColor: "#fef3c7",
              border: "3px solid #f59e0b",
              borderRadius: "12px",
              marginBottom: "12px"
            }}></div>
            <span style={{ color: "#64748b", fontSize: "14px" }}>Border</span>
          </div>

          {/* 외부 그림자 */}
          <div style={{
            textAlign: "center"
          }}>
            <div style={{
              width: "100px",
              height: "100px",
              backgroundColor: "#dbeafe",
              borderRadius: "12px",
              boxShadow: "8px 8px 16px rgba(0,0,0,0.2)",
              marginBottom: "12px"
            }}></div>
            <span style={{ color: "#64748b", fontSize: "14px" }}>Outer Shadow</span>
          </div>

          {/* 내부 그림자 */}
          <div style={{
            textAlign: "center"
          }}>
            <div style={{
              width: "100px",
              height: "100px",
              backgroundColor: "#fce7f3",
              borderRadius: "12px",
              boxShadow: "inset 4px 4px 12px rgba(0,0,0,0.15)",
              marginBottom: "12px"
            }}></div>
            <span style={{ color: "#64748b", fontSize: "14px" }}>Inner Shadow</span>
          </div>

          {/* 투명도 */}
          <div style={{
            textAlign: "center"
          }}>
            <div style={{
              width: "100px",
              height: "100px",
              backgroundColor: "#a855f7",
              borderRadius: "12px",
              opacity: 0.5,
              marginBottom: "12px"
            }}></div>
            <span style={{ color: "#64748b", fontSize: "14px" }}>Opacity 50%</span>
          </div>

          {/* 그라데이션 */}
          <div style={{
            textAlign: "center"
          }}>
            <div style={{
              width: "100px",
              height: "100px",
              background: "linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)",
              borderRadius: "12px",
              marginBottom: "12px"
            }}></div>
            <span style={{ color: "#64748b", fontSize: "14px" }}>Gradient</span>
          </div>
        </div>
      </div>
    </div>
  );
}

