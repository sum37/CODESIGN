import React from 'react';

/**
 * DashboardDemo - 대시보드 UI 예시
 * 
 * 시나리오:
 * 1. 복잡한 대시보드 레이아웃 확인
 * 2. 다양한 카드와 차트 UI
 * 3. 실제 어드민 패널처럼 작동하는 UI
 */
export default function DashboardDemo() {
  return (
    <div style={{
      width: "100%",
      minHeight: "1000px",
      backgroundColor: "#f1f5f9",
      display: "flex",
      position: "relative"
    }}>
      {/* 사이드바 */}
      <aside style={{
        width: "260px",
        backgroundColor: "#1e293b",
        padding: "24px",
        minHeight: "100%"
      }}>
        <div style={{
          fontSize: "22px",
          fontWeight: "bold",
          color: "#ffffff",
          marginBottom: "40px",
          display: "flex",
          alignItems: "center",
          gap: "12px"
        }}>
          <span style={{
            width: "36px",
            height: "36px",
            backgroundColor: "#3b82f6",
            borderRadius: "10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            📊
          </span>
          Dashboard
        </div>

        {/* 메뉴 아이템들 */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{
            padding: "12px 16px",
            backgroundColor: "#334155",
            borderRadius: "10px",
            color: "#ffffff",
            cursor: "pointer"
          }}>
            🏠 홈
          </div>
          <div style={{
            padding: "12px 16px",
            color: "#94a3b8",
            cursor: "pointer"
          }}>
            📈 분석
          </div>
          <div style={{
            padding: "12px 16px",
            color: "#94a3b8",
            cursor: "pointer"
          }}>
            👥 사용자
          </div>
          <div style={{
            padding: "12px 16px",
            color: "#94a3b8",
            cursor: "pointer"
          }}>
            📦 프로젝트
          </div>
          <div style={{
            padding: "12px 16px",
            color: "#94a3b8",
            cursor: "pointer"
          }}>
            ⚙️ 설정
          </div>
        </div>
      </aside>

      {/* 메인 컨텐츠 */}
      <main style={{
        flex: 1,
        padding: "32px"
      }}>
        {/* 상단 바 */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "32px"
        }}>
          <div>
            <h1 style={{
              fontSize: "28px",
              fontWeight: "bold",
              color: "#1e293b",
              margin: "0 0 4px 0"
            }}>
              대시보드
            </h1>
            <p style={{
              fontSize: "14px",
              color: "#64748b",
              margin: 0
            }}>
              오늘의 현황을 확인하세요
            </p>
          </div>
          <div style={{
            display: "flex",
            gap: "12px",
            alignItems: "center"
          }}>
            <div style={{
              width: "40px",
              height: "40px",
              backgroundColor: "#ffffff",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
            }}>
              🔔
            </div>
            <div style={{
              width: "40px",
              height: "40px",
              backgroundColor: "#3b82f6",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              fontWeight: "bold",
              cursor: "pointer"
            }}>
              K
            </div>
          </div>
        </div>

        {/* 통계 카드들 */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "20px",
          marginBottom: "32px"
        }}>
          {/* 카드 1 */}
          <div style={{
            backgroundColor: "#ffffff",
            borderRadius: "16px",
            padding: "24px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)"
          }}>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px"
            }}>
              <span style={{ color: "#64748b", fontSize: "14px" }}>총 방문자</span>
              <span style={{
                width: "32px",
                height: "32px",
                backgroundColor: "#dbeafe",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                👥
              </span>
            </div>
            <div style={{
              fontSize: "28px",
              fontWeight: "bold",
              color: "#1e293b"
            }}>
              45,231
            </div>
            <div style={{
              fontSize: "13px",
              color: "#22c55e",
              marginTop: "4px"
            }}>
              ↑ 12.5% 증가
            </div>
          </div>

          {/* 카드 2 */}
          <div style={{
            backgroundColor: "#ffffff",
            borderRadius: "16px",
            padding: "24px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)"
          }}>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px"
            }}>
              <span style={{ color: "#64748b", fontSize: "14px" }}>매출</span>
              <span style={{
                width: "32px",
                height: "32px",
                backgroundColor: "#dcfce7",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                💰
              </span>
            </div>
            <div style={{
              fontSize: "28px",
              fontWeight: "bold",
              color: "#1e293b"
            }}>
              ₩12.4M
            </div>
            <div style={{
              fontSize: "13px",
              color: "#22c55e",
              marginTop: "4px"
            }}>
              ↑ 8.2% 증가
            </div>
          </div>

          {/* 카드 3 */}
          <div style={{
            backgroundColor: "#ffffff",
            borderRadius: "16px",
            padding: "24px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)"
          }}>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px"
            }}>
              <span style={{ color: "#64748b", fontSize: "14px" }}>신규 주문</span>
              <span style={{
                width: "32px",
                height: "32px",
                backgroundColor: "#fef3c7",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                📦
              </span>
            </div>
            <div style={{
              fontSize: "28px",
              fontWeight: "bold",
              color: "#1e293b"
            }}>
              1,456
            </div>
            <div style={{
              fontSize: "13px",
              color: "#ef4444",
              marginTop: "4px"
            }}>
              ↓ 3.1% 감소
            </div>
          </div>

          {/* 카드 4 */}
          <div style={{
            backgroundColor: "#ffffff",
            borderRadius: "16px",
            padding: "24px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)"
          }}>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px"
            }}>
              <span style={{ color: "#64748b", fontSize: "14px" }}>전환율</span>
              <span style={{
                width: "32px",
                height: "32px",
                backgroundColor: "#fce7f3",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                📊
              </span>
            </div>
            <div style={{
              fontSize: "28px",
              fontWeight: "bold",
              color: "#1e293b"
            }}>
              3.2%
            </div>
            <div style={{
              fontSize: "13px",
              color: "#22c55e",
              marginTop: "4px"
            }}>
              ↑ 0.5% 증가
            </div>
          </div>
        </div>

        {/* 차트 영역 */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: "20px",
          marginBottom: "32px"
        }}>
          {/* 메인 차트 */}
          <div style={{
            backgroundColor: "#ffffff",
            borderRadius: "16px",
            padding: "24px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)"
          }}>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "24px"
            }}>
              <h3 style={{ margin: 0, color: "#1e293b", fontSize: "18px" }}>
                월간 매출 추이
              </h3>
              <select style={{
                padding: "8px 16px",
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
                fontSize: "14px"
              }}>
                <option>2024년</option>
                <option>2023년</option>
              </select>
            </div>
            {/* 차트 시각화 (바 차트) */}
            <div style={{
              display: "flex",
              alignItems: "flex-end",
              gap: "16px",
              height: "200px"
            }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
                <div style={{ width: "100%", height: "120px", backgroundColor: "#dbeafe", borderRadius: "8px 8px 0 0" }}></div>
                <span style={{ fontSize: "12px", color: "#64748b", marginTop: "8px" }}>1월</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
                <div style={{ width: "100%", height: "160px", backgroundColor: "#dbeafe", borderRadius: "8px 8px 0 0" }}></div>
                <span style={{ fontSize: "12px", color: "#64748b", marginTop: "8px" }}>2월</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
                <div style={{ width: "100%", height: "140px", backgroundColor: "#dbeafe", borderRadius: "8px 8px 0 0" }}></div>
                <span style={{ fontSize: "12px", color: "#64748b", marginTop: "8px" }}>3월</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
                <div style={{ width: "100%", height: "180px", backgroundColor: "#3b82f6", borderRadius: "8px 8px 0 0" }}></div>
                <span style={{ fontSize: "12px", color: "#64748b", marginTop: "8px" }}>4월</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
                <div style={{ width: "100%", height: "160px", backgroundColor: "#dbeafe", borderRadius: "8px 8px 0 0" }}></div>
                <span style={{ fontSize: "12px", color: "#64748b", marginTop: "8px" }}>5월</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
                <div style={{ width: "100%", height: "200px", backgroundColor: "#dbeafe", borderRadius: "8px 8px 0 0" }}></div>
                <span style={{ fontSize: "12px", color: "#64748b", marginTop: "8px" }}>6월</span>
              </div>
            </div>
          </div>

          {/* 파이 차트 영역 */}
          <div style={{
            backgroundColor: "#ffffff",
            borderRadius: "16px",
            padding: "24px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)"
          }}>
            <h3 style={{ margin: "0 0 24px 0", color: "#1e293b", fontSize: "18px" }}>
              카테고리별 비율
            </h3>
            <div style={{
              display: "flex",
              justifyContent: "center",
              marginBottom: "24px"
            }}>
              <div style={{
                width: "160px",
                height: "160px",
                borderRadius: "50%",
                background: "conic-gradient(#3b82f6 0deg 130deg, #22c55e 130deg 220deg, #f59e0b 220deg 300deg, #ec4899 300deg 360deg)",
                position: "relative"
              }}>
                <div style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: "80px",
                  height: "80px",
                  backgroundColor: "#ffffff",
                  borderRadius: "50%"
                }}></div>
              </div>
            </div>
            <div style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ width: "12px", height: "12px", backgroundColor: "#3b82f6", borderRadius: "3px" }}></div>
                <span style={{ fontSize: "14px", color: "#64748b" }}>전자기기 36%</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ width: "12px", height: "12px", backgroundColor: "#22c55e", borderRadius: "3px" }}></div>
                <span style={{ fontSize: "14px", color: "#64748b" }}>의류 25%</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ width: "12px", height: "12px", backgroundColor: "#f59e0b", borderRadius: "3px" }}></div>
                <span style={{ fontSize: "14px", color: "#64748b" }}>식품 22%</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ width: "12px", height: "12px", backgroundColor: "#ec4899", borderRadius: "3px" }}></div>
                <span style={{ fontSize: "14px", color: "#64748b" }}>기타 17%</span>
              </div>
            </div>
          </div>
        </div>

        {/* 최근 활동 */}
        <div style={{
          backgroundColor: "#ffffff",
          borderRadius: "16px",
          padding: "24px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)"
        }}>
          <h3 style={{ margin: "0 0 20px 0", color: "#1e293b", fontSize: "18px" }}>
            최근 활동
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "12px",
              backgroundColor: "#f8fafc",
              borderRadius: "10px"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{
                  width: "40px",
                  height: "40px",
                  backgroundColor: "#dbeafe",
                  borderRadius: "10px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}>
                  📦
                </div>
                <div>
                  <div style={{ fontWeight: "600", color: "#1e293b" }}>새 주문 #12345</div>
                  <div style={{ fontSize: "13px", color: "#64748b" }}>김철수님이 주문</div>
                </div>
              </div>
              <span style={{ fontSize: "14px", color: "#64748b" }}>5분 전</span>
            </div>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "12px",
              backgroundColor: "#f8fafc",
              borderRadius: "10px"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{
                  width: "40px",
                  height: "40px",
                  backgroundColor: "#dcfce7",
                  borderRadius: "10px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}>
                  💰
                </div>
                <div>
                  <div style={{ fontWeight: "600", color: "#1e293b" }}>결제 완료</div>
                  <div style={{ fontSize: "13px", color: "#64748b" }}>₩150,000 입금</div>
                </div>
              </div>
              <span style={{ fontSize: "14px", color: "#64748b" }}>12분 전</span>
            </div>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "12px",
              backgroundColor: "#f8fafc",
              borderRadius: "10px"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{
                  width: "40px",
                  height: "40px",
                  backgroundColor: "#fef3c7",
                  borderRadius: "10px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}>
                  👤
                </div>
                <div>
                  <div style={{ fontWeight: "600", color: "#1e293b" }}>신규 회원 가입</div>
                  <div style={{ fontSize: "13px", color: "#64748b" }}>이영희님</div>
                </div>
              </div>
              <span style={{ fontSize: "14px", color: "#64748b" }}>1시간 전</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

