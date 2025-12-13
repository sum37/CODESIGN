import React from 'react';

/**
 * TextDemo - 텍스트 편집 기능 테스트
 * 
 * 시나리오:
 * 1. 텍스트 요소 더블클릭하여 인라인 편집
 * 2. 툴바에서 폰트 크기/패밀리/굵기/기울임 변경
 * 3. 텍스트 색상 및 정렬 변경
 * 4. 텍스트 박스 추가 (T 버튼)
 */
export default function TextDemo() {
  return (
    <div style={{
      width: "100%",
      minHeight: "700px",
      backgroundColor: "#fefce8",
      padding: "40px",
      position: "relative"
    }}>
      {/* 타이틀 섹션 */}
      <div style={{
        textAlign: "center",
        marginBottom: "50px"
      }}>
        <h1 style={{
          fontSize: "48px",
          fontWeight: "bold",
          color: "#1e293b",
          margin: "0 0 16px 0",
          fontFamily: "Georgia, serif"
        }}>
          텍스트 편집 데모
        </h1>
        <p style={{
          fontSize: "20px",
          color: "#64748b",
          margin: 0,
          fontFamily: "Arial, sans-serif"
        }}>
          더블클릭하여 텍스트를 직접 편집해 보세요
        </p>
      </div>

      {/* 폰트 스타일 예시 */}
      <div style={{
        backgroundColor: "#ffffff",
        borderRadius: "20px",
        padding: "40px",
        boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
        marginBottom: "30px"
      }}>
        <h2 style={{
          fontSize: "24px",
          color: "#3b82f6",
          marginBottom: "24px",
          fontFamily: "Arial, sans-serif"
        }}>
          📝 폰트 스타일 예시
        </h2>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "24px"
        }}>
          {/* Arial */}
          <div style={{
            padding: "20px",
            backgroundColor: "#f8fafc",
            borderRadius: "12px"
          }}>
            <h3 style={{
              fontSize: "18px",
              fontFamily: "Arial, sans-serif",
              margin: "0 0 8px 0",
              color: "#1e293b"
            }}>
              Arial Font
            </h3>
            <p style={{
              fontSize: "14px",
              fontFamily: "Arial, sans-serif",
              color: "#64748b",
              margin: 0
            }}>
              깔끔하고 현대적인 산세리프 폰트입니다.
            </p>
          </div>

          {/* Georgia */}
          <div style={{
            padding: "20px",
            backgroundColor: "#f8fafc",
            borderRadius: "12px"
          }}>
            <h3 style={{
              fontSize: "18px",
              fontFamily: "Georgia, serif",
              margin: "0 0 8px 0",
              color: "#1e293b"
            }}>
              Georgia Font
            </h3>
            <p style={{
              fontSize: "14px",
              fontFamily: "Georgia, serif",
              color: "#64748b",
              margin: 0
            }}>
              우아하고 클래식한 세리프 폰트입니다.
            </p>
          </div>

          {/* Courier */}
          <div style={{
            padding: "20px",
            backgroundColor: "#f8fafc",
            borderRadius: "12px"
          }}>
            <h3 style={{
              fontSize: "18px",
              fontFamily: "Courier New, monospace",
              margin: "0 0 8px 0",
              color: "#1e293b"
            }}>
              Courier Font
            </h3>
            <p style={{
              fontSize: "14px",
              fontFamily: "Courier New, monospace",
              color: "#64748b",
              margin: 0
            }}>
              코드 작성에 적합한 고정폭 폰트입니다.
            </p>
          </div>

          {/* Bold & Italic */}
          <div style={{
            padding: "20px",
            backgroundColor: "#f8fafc",
            borderRadius: "12px"
          }}>
            <h3 style={{
              fontSize: "18px",
              fontWeight: "bold",
              fontStyle: "italic",
              margin: "0 0 8px 0",
              color: "#1e293b"
            }}>
              Bold & Italic
            </h3>
            <p style={{
              fontSize: "14px",
              color: "#64748b",
              margin: 0
            }}>
              <span style={{ fontWeight: "bold" }}>굵게</span>와{" "}
              <span style={{ fontStyle: "italic" }}>기울임</span>을 조합할 수 있습니다.
            </p>
          </div>
        </div>
      </div>

      {/* 텍스트 정렬 예시 */}
      <div style={{
        backgroundColor: "#ffffff",
        borderRadius: "20px",
        padding: "40px",
        boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
        marginBottom: "30px"
      }}>
        <h2 style={{
          fontSize: "24px",
          color: "#10b981",
          marginBottom: "24px"
        }}>
          📍 텍스트 정렬
        </h2>

        <div style={{ marginBottom: "20px" }}>
          <p style={{
            textAlign: "left",
            padding: "16px",
            backgroundColor: "#ecfdf5",
            borderRadius: "8px",
            margin: 0
          }}>
            ⬅️ 왼쪽 정렬 (Left Align) - 기본 정렬 방식입니다.
          </p>
        </div>

        <div style={{ marginBottom: "20px" }}>
          <p style={{
            textAlign: "center",
            padding: "16px",
            backgroundColor: "#dbeafe",
            borderRadius: "8px",
            margin: 0
          }}>
            ⚡ 가운데 정렬 (Center Align) - 제목이나 중요 문구에 적합합니다.
          </p>
        </div>

        <div>
          <p style={{
            textAlign: "right",
            padding: "16px",
            backgroundColor: "#fef3c7",
            borderRadius: "8px",
            margin: 0
          }}>
            오른쪽 정렬 (Right Align) - 날짜나 부가 정보에 적합합니다. ➡️
          </p>
        </div>
      </div>

      {/* 색상 예시 */}
      <div style={{
        backgroundColor: "#ffffff",
        borderRadius: "20px",
        padding: "40px",
        boxShadow: "0 8px 24px rgba(0,0,0,0.08)"
      }}>
        <h2 style={{
          fontSize: "24px",
          color: "#8b5cf6",
          marginBottom: "24px"
        }}>
          🎨 텍스트 색상
        </h2>

        <div style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "16px"
        }}>
          <span style={{ color: "#ef4444", fontSize: "18px", fontWeight: "600" }}>빨간색</span>
          <span style={{ color: "#f97316", fontSize: "18px", fontWeight: "600" }}>주황색</span>
          <span style={{ color: "#eab308", fontSize: "18px", fontWeight: "600" }}>노란색</span>
          <span style={{ color: "#22c55e", fontSize: "18px", fontWeight: "600" }}>초록색</span>
          <span style={{ color: "#3b82f6", fontSize: "18px", fontWeight: "600" }}>파란색</span>
          <span style={{ color: "#8b5cf6", fontSize: "18px", fontWeight: "600" }}>보라색</span>
          <span style={{ color: "#ec4899", fontSize: "18px", fontWeight: "600" }}>핑크색</span>
        </div>
      </div>
    </div>
  );
}


