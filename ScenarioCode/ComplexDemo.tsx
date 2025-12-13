import React from 'react';

/**
 * ComplexDemo - 복잡한 컴포넌트 구조 테스트
 * 
 * 시나리오:
 * 1. 중첩된 요소 구조 확인
 * 2. 자식 요소 개별 선택 및 편집
 * 3. 부모-자식 관계 유지하면서 스타일 변경
 */
export default function ComplexDemo() {
  return (
    <div style={{
      width: "100%",
      minHeight: "900px",
      backgroundColor: "#0f172a",
      color: "#ffffff",
      padding: "40px",
      position: "relative"
    }}>
      {/* 네비게이션 바 */}
      <nav style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "60px",
        padding: "16px 24px",
        backgroundColor: "#1e293b",
        borderRadius: "16px"
      }}>
        <div style={{
          fontSize: "24px",
          fontWeight: "bold",
          color: "#f472b6"
        }}>
          CODESIGN
        </div>
        <div style={{
          display: "flex",
          gap: "32px"
        }}>
          <span style={{ color: "#94a3b8", cursor: "pointer" }}>Features</span>
          <span style={{ color: "#94a3b8", cursor: "pointer" }}>Pricing</span>
          <span style={{ color: "#94a3b8", cursor: "pointer" }}>Docs</span>
          <span style={{ color: "#94a3b8", cursor: "pointer" }}>Blog</span>
        </div>
        <button style={{
          backgroundColor: "#f472b6",
          color: "#0f172a",
          border: "none",
          padding: "12px 24px",
          borderRadius: "10px",
          fontWeight: "600",
          cursor: "pointer"
        }}>
          Get Started
        </button>
      </nav>

      {/* 히어로 섹션 */}
      <section style={{
        textAlign: "center",
        marginBottom: "80px"
      }}>
        <div style={{
          display: "inline-block",
          padding: "8px 16px",
          backgroundColor: "#1e293b",
          borderRadius: "20px",
          marginBottom: "24px"
        }}>
          <span style={{ color: "#f472b6" }}>✨</span>
          <span style={{ color: "#94a3b8", marginLeft: "8px" }}>새로운 기능 출시</span>
        </div>
        
        <h1 style={{
          fontSize: "56px",
          fontWeight: "bold",
          margin: "0 0 24px 0",
          lineHeight: 1.2
        }}>
          <span style={{ color: "#ffffff" }}>Design & Code in </span>
          <span style={{
            background: "linear-gradient(90deg, #f472b6 0%, #8b5cf6 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}>
            One Place
          </span>
        </h1>
        
        <p style={{
          fontSize: "20px",
          color: "#94a3b8",
          maxWidth: "600px",
          margin: "0 auto 40px auto",
          lineHeight: 1.6
        }}>
          UI와 코드를 양방향으로 편집하세요. 디자인이 곧 코드가 되고, 코드가 곧 디자인이 됩니다.
        </p>
        
        <div style={{
          display: "flex",
          gap: "16px",
          justifyContent: "center"
        }}>
          <button style={{
            backgroundColor: "#f472b6",
            color: "#0f172a",
            border: "none",
            padding: "16px 32px",
            borderRadius: "12px",
            fontSize: "16px",
            fontWeight: "600",
            cursor: "pointer"
          }}>
            무료로 시작하기
          </button>
          <button style={{
            backgroundColor: "transparent",
            color: "#ffffff",
            border: "2px solid #334155",
            padding: "16px 32px",
            borderRadius: "12px",
            fontSize: "16px",
            fontWeight: "600",
            cursor: "pointer"
          }}>
            데모 보기
          </button>
        </div>
      </section>

      {/* 기능 카드 */}
      <section style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "24px",
        marginBottom: "80px"
      }}>
        {/* 카드 1 */}
        <div style={{
          backgroundColor: "#1e293b",
          borderRadius: "20px",
          padding: "32px",
          border: "1px solid #334155"
        }}>
          <div style={{
            width: "56px",
            height: "56px",
            backgroundColor: "#312e81",
            borderRadius: "14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "20px"
          }}>
            <span style={{ fontSize: "28px" }}>🎨</span>
          </div>
          <h3 style={{
            fontSize: "22px",
            fontWeight: "600",
            margin: "0 0 12px 0",
            color: "#ffffff"
          }}>
            비주얼 에디터
          </h3>
          <p style={{
            fontSize: "16px",
            color: "#94a3b8",
            margin: 0,
            lineHeight: 1.6
          }}>
            직관적인 캔버스에서 요소를 드래그하고 스타일을 편집하세요. 코드가 자동으로 생성됩니다.
          </p>
        </div>

        {/* 카드 2 */}
        <div style={{
          backgroundColor: "#1e293b",
          borderRadius: "20px",
          padding: "32px",
          border: "1px solid #334155"
        }}>
          <div style={{
            width: "56px",
            height: "56px",
            backgroundColor: "#1e3a5f",
            borderRadius: "14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "20px"
          }}>
            <span style={{ fontSize: "28px" }}>⚡</span>
          </div>
          <h3 style={{
            fontSize: "22px",
            fontWeight: "600",
            margin: "0 0 12px 0",
            color: "#ffffff"
          }}>
            양방향 동기화
          </h3>
          <p style={{
            fontSize: "16px",
            color: "#94a3b8",
            margin: 0,
            lineHeight: 1.6
          }}>
            Canvas에서 변경하면 코드가, 코드를 수정하면 Canvas가 즉시 업데이트됩니다.
          </p>
        </div>

        {/* 카드 3 */}
        <div style={{
          backgroundColor: "#1e293b",
          borderRadius: "20px",
          padding: "32px",
          border: "1px solid #334155"
        }}>
          <div style={{
            width: "56px",
            height: "56px",
            backgroundColor: "#3f1d4e",
            borderRadius: "14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "20px"
          }}>
            <span style={{ fontSize: "28px" }}>🧩</span>
          </div>
          <h3 style={{
            fontSize: "22px",
            fontWeight: "600",
            margin: "0 0 12px 0",
            color: "#ffffff"
          }}>
            도형 & 텍스트
          </h3>
          <p style={{
            fontSize: "16px",
            color: "#94a3b8",
            margin: 0,
            lineHeight: 1.6
          }}>
            다양한 도형과 텍스트를 추가하고, 실시간으로 스타일을 커스터마이즈하세요.
          </p>
        </div>
      </section>

      {/* 통계 섹션 */}
      <section style={{
        display: "flex",
        justifyContent: "center",
        gap: "80px",
        padding: "40px 0",
        borderTop: "1px solid #334155",
        borderBottom: "1px solid #334155"
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            fontSize: "48px",
            fontWeight: "bold",
            color: "#f472b6"
          }}>
            10+
          </div>
          <div style={{
            fontSize: "16px",
            color: "#94a3b8"
          }}>
            도형 종류
          </div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{
            fontSize: "48px",
            fontWeight: "bold",
            color: "#8b5cf6"
          }}>
            ∞
          </div>
          <div style={{
            fontSize: "16px",
            color: "#94a3b8"
          }}>
            스타일 조합
          </div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{
            fontSize: "48px",
            fontWeight: "bold",
            color: "#67e8f9"
          }}>
            0ms
          </div>
          <div style={{
            fontSize: "16px",
            color: "#94a3b8"
          }}>
            동기화 지연
          </div>
        </div>
      </section>
    </div>
  );
}


