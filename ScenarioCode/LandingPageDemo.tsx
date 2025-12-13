import React from 'react';

/**
 * LandingPageDemo - 실제 랜딩 페이지 예시
 * 
 * 시나리오:
 * 1. 완성된 랜딩 페이지 구조 확인
 * 2. 다양한 요소 편집 테스트
 * 3. 실제 웹사이트처럼 작동하는 UI
 */
export default function LandingPageDemo() {
  return (
    <div style={{
      width: "100%",
      minHeight: "1200px",
      backgroundColor: "#ffffff",
      position: "relative"
    }}>
      {/* 헤더 */}
      <header style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "20px 60px",
        backgroundColor: "#ffffff",
        borderBottom: "1px solid #e5e7eb"
      }}>
        <div style={{
          fontSize: "28px",
          fontWeight: "bold",
          color: "#1e293b"
        }}>
          <span style={{ color: "#ec4899" }}>✦</span> Designify
        </div>
        <nav style={{
          display: "flex",
          gap: "40px"
        }}>
          <a style={{ color: "#64748b", textDecoration: "none", cursor: "pointer" }}>홈</a>
          <a style={{ color: "#64748b", textDecoration: "none", cursor: "pointer" }}>기능</a>
          <a style={{ color: "#64748b", textDecoration: "none", cursor: "pointer" }}>가격</a>
          <a style={{ color: "#64748b", textDecoration: "none", cursor: "pointer" }}>문의</a>
        </nav>
        <button style={{
          backgroundColor: "#ec4899",
          color: "#ffffff",
          border: "none",
          padding: "12px 28px",
          borderRadius: "8px",
          fontWeight: "600",
          cursor: "pointer"
        }}>
          시작하기
        </button>
      </header>

      {/* 히어로 섹션 */}
      <section style={{
        display: "flex",
        alignItems: "center",
        padding: "100px 60px",
        gap: "80px"
      }}>
        <div style={{ flex: 1 }}>
          <div style={{
            display: "inline-block",
            backgroundColor: "#fdf2f8",
            color: "#ec4899",
            padding: "8px 16px",
            borderRadius: "20px",
            fontSize: "14px",
            fontWeight: "600",
            marginBottom: "24px"
          }}>
            🎉 새로운 버전 출시!
          </div>
          <h1 style={{
            fontSize: "52px",
            fontWeight: "bold",
            color: "#1e293b",
            lineHeight: 1.2,
            margin: "0 0 24px 0"
          }}>
            디자인을 코드로,<br />
            <span style={{ color: "#ec4899" }}>코드를 디자인으로</span>
          </h1>
          <p style={{
            fontSize: "18px",
            color: "#64748b",
            lineHeight: 1.7,
            margin: "0 0 32px 0"
          }}>
            디자이너와 개발자의 간극을 좁히는 혁신적인 도구. 
            실시간 양방향 동기화로 더 빠르고 정확하게 작업하세요.
          </p>
          <div style={{
            display: "flex",
            gap: "16px"
          }}>
            <button style={{
              backgroundColor: "#ec4899",
              color: "#ffffff",
              border: "none",
              padding: "16px 32px",
              borderRadius: "10px",
              fontSize: "16px",
              fontWeight: "600",
              cursor: "pointer"
            }}>
              무료 체험하기
            </button>
            <button style={{
              backgroundColor: "#ffffff",
              color: "#1e293b",
              border: "2px solid #e5e7eb",
              padding: "16px 32px",
              borderRadius: "10px",
              fontSize: "16px",
              fontWeight: "600",
              cursor: "pointer"
            }}>
              📹 데모 영상
            </button>
          </div>
        </div>
        <div style={{
          flex: 1,
          backgroundColor: "#f8fafc",
          borderRadius: "24px",
          padding: "40px",
          minHeight: "400px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}>
          <div style={{
            width: "100%",
            height: "320px",
            background: "linear-gradient(135deg, #ec4899 0%, #8b5cf6 50%, #3b82f6 100%)",
            borderRadius: "16px",
            boxShadow: "0 20px 60px rgba(236, 72, 153, 0.3)"
          }}></div>
        </div>
      </section>

      {/* 기능 섹션 */}
      <section style={{
        padding: "80px 60px",
        backgroundColor: "#f8fafc"
      }}>
        <div style={{
          textAlign: "center",
          marginBottom: "60px"
        }}>
          <h2 style={{
            fontSize: "36px",
            fontWeight: "bold",
            color: "#1e293b",
            margin: "0 0 16px 0"
          }}>
            왜 Designify인가요?
          </h2>
          <p style={{
            fontSize: "18px",
            color: "#64748b"
          }}>
            생산성을 높이는 강력한 기능들을 만나보세요
          </p>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "24px"
        }}>
          {/* 기능 1 */}
          <div style={{
            backgroundColor: "#ffffff",
            borderRadius: "16px",
            padding: "32px",
            textAlign: "center",
            boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
          }}>
            <div style={{
              width: "64px",
              height: "64px",
              backgroundColor: "#fdf2f8",
              borderRadius: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px auto",
              fontSize: "32px"
            }}>
              🎯
            </div>
            <h3 style={{ fontSize: "18px", fontWeight: "600", color: "#1e293b", margin: "0 0 8px 0" }}>
              드래그 & 드롭
            </h3>
            <p style={{ fontSize: "14px", color: "#64748b", margin: 0 }}>
              직관적인 인터페이스로 쉽게 편집
            </p>
          </div>

          {/* 기능 2 */}
          <div style={{
            backgroundColor: "#ffffff",
            borderRadius: "16px",
            padding: "32px",
            textAlign: "center",
            boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
          }}>
            <div style={{
              width: "64px",
              height: "64px",
              backgroundColor: "#ede9fe",
              borderRadius: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px auto",
              fontSize: "32px"
            }}>
              ⚡
            </div>
            <h3 style={{ fontSize: "18px", fontWeight: "600", color: "#1e293b", margin: "0 0 8px 0" }}>
              실시간 동기화
            </h3>
            <p style={{ fontSize: "14px", color: "#64748b", margin: 0 }}>
              Canvas와 Code 즉시 연동
            </p>
          </div>

          {/* 기능 3 */}
          <div style={{
            backgroundColor: "#ffffff",
            borderRadius: "16px",
            padding: "32px",
            textAlign: "center",
            boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
          }}>
            <div style={{
              width: "64px",
              height: "64px",
              backgroundColor: "#dbeafe",
              borderRadius: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px auto",
              fontSize: "32px"
            }}>
              🧩
            </div>
            <h3 style={{ fontSize: "18px", fontWeight: "600", color: "#1e293b", margin: "0 0 8px 0" }}>
              다양한 도형
            </h3>
            <p style={{ fontSize: "14px", color: "#64748b", margin: 0 }}>
              10가지 이상의 도형 지원
            </p>
          </div>

          {/* 기능 4 */}
          <div style={{
            backgroundColor: "#ffffff",
            borderRadius: "16px",
            padding: "32px",
            textAlign: "center",
            boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
          }}>
            <div style={{
              width: "64px",
              height: "64px",
              backgroundColor: "#dcfce7",
              borderRadius: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px auto",
              fontSize: "32px"
            }}>
              🎨
            </div>
            <h3 style={{ fontSize: "18px", fontWeight: "600", color: "#1e293b", margin: "0 0 8px 0" }}>
              스타일 편집
            </h3>
            <p style={{ fontSize: "14px", color: "#64748b", margin: 0 }}>
              색상, 그림자, 투명도 조절
            </p>
          </div>
        </div>
      </section>

      {/* CTA 섹션 */}
      <section style={{
        padding: "80px 60px",
        textAlign: "center",
        background: "linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)"
      }}>
        <h2 style={{
          fontSize: "36px",
          fontWeight: "bold",
          color: "#ffffff",
          margin: "0 0 16px 0"
        }}>
          지금 바로 시작하세요
        </h2>
        <p style={{
          fontSize: "18px",
          color: "rgba(255,255,255,0.9)",
          margin: "0 0 32px 0"
        }}>
          14일 무료 체험. 신용카드 필요 없음.
        </p>
        <button style={{
          backgroundColor: "#ffffff",
          color: "#ec4899",
          border: "none",
          padding: "18px 40px",
          borderRadius: "12px",
          fontSize: "18px",
          fontWeight: "bold",
          cursor: "pointer"
        }}>
          무료로 시작하기 →
        </button>
      </section>

      {/* 푸터 */}
      <footer style={{
        padding: "40px 60px",
        backgroundColor: "#1e293b",
        color: "#ffffff"
      }}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <div style={{ fontSize: "18px", fontWeight: "bold" }}>
            <span style={{ color: "#ec4899" }}>✦</span> Designify
          </div>
          <div style={{ color: "#94a3b8", fontSize: "14px" }}>
            © 2025 Designify. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}


