import React from 'react';

/**
 * BasicDemo - 기본 레이아웃 및 이동/리사이즈 테스트
 * 
 * 시나리오:
 * 1. 캔버스에서 요소 클릭하여 선택
 * 2. Ghost Box 드래그하여 이동
 * 3. 모서리 핸들로 리사이즈
 * 4. 코드 변경 확인
 */
export default function BasicDemo() {
  return (
    <div style={{
      width: "100%",
      minHeight: "600px",
      backgroundColor: "#f8fafc",
      padding: "40px",
      fontFamily: "Arial, sans-serif",
      position: "relative"
    }}>
      {/* 헤더 영역 - 이동 테스트 */}
      <header style={{
        backgroundColor: "#3b82f6",
        color: "white",
        padding: "20px 30px",
        borderRadius: "12px",
        marginBottom: "30px"
      }}>
        <h1 style={{ margin: 0, fontSize: "28px" }}>CODESIGN IDE Demo</h1>
        <p style={{ margin: "8px 0 0 0", opacity: 0.9 }}>UI ↔ Code 양방향 편집 테스트</p>
      </header>

      {/* 카드 컨테이너 - 리사이즈 테스트 */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "24px",
        marginBottom: "30px"
      }}>
        {/* 카드 1 */}
        <div style={{
          backgroundColor: "#ffffff",
          borderRadius: "16px",
          padding: "24px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
        }}>
          <div style={{
            width: "48px",
            height: "48px",
            backgroundColor: "#dbeafe",
            borderRadius: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "16px"
          }}>
            <span style={{ fontSize: "24px" }}>📦</span>
          </div>
          <h3 style={{ margin: "0 0 8px 0", color: "#1e293b" }}>드래그 테스트</h3>
          <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>
            이 카드를 클릭하고 드래그해 보세요
          </p>
        </div>

        {/* 카드 2 */}
        <div style={{
          backgroundColor: "#ffffff",
          borderRadius: "16px",
          padding: "24px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
        }}>
          <div style={{
            width: "48px",
            height: "48px",
            backgroundColor: "#dcfce7",
            borderRadius: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "16px"
          }}>
            <span style={{ fontSize: "24px" }}>📐</span>
          </div>
          <h3 style={{ margin: "0 0 8px 0", color: "#1e293b" }}>리사이즈 테스트</h3>
          <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>
            모서리를 드래그해 크기를 조절해 보세요
          </p>
        </div>

        {/* 카드 3 */}
        <div style={{
          backgroundColor: "#ffffff",
          borderRadius: "16px",
          padding: "24px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
        }}>
          <div style={{
            width: "48px",
            height: "48px",
            backgroundColor: "#fef3c7",
            borderRadius: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "16px"
          }}>
            <span style={{ fontSize: "24px" }}>🎯</span>
          </div>
          <h3 style={{ margin: "0 0 8px 0", color: "#1e293b" }}>선택 테스트</h3>
          <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>
            클릭하면 Ghost Box가 표시됩니다
          </p>
        </div>
      </div>

      {/* 버튼 영역 */}
      <div style={{
        display: "flex",
        gap: "16px"
      }}>
        <button style={{
          backgroundColor: "#3b82f6",
          color: "white",
          border: "none",
          padding: "14px 28px",
          borderRadius: "10px",
          fontSize: "16px",
          fontWeight: "600",
          cursor: "pointer"
        }}>
          Primary Button
        </button>
        
        <button style={{
          backgroundColor: "#ffffff",
          color: "#3b82f6",
          border: "2px solid #3b82f6",
          padding: "14px 28px",
          borderRadius: "10px",
          fontSize: "16px",
          fontWeight: "600",
          cursor: "pointer"
        }}>
          Secondary Button
        </button>
        
        <button style={{
          backgroundColor: "#10b981",
          color: "white",
          border: "none",
          padding: "14px 28px",
          borderRadius: "10px",
          fontSize: "16px",
          fontWeight: "600",
          cursor: "pointer"
        }}>
          Success Button
        </button>
      </div>
    </div>
  );
}

