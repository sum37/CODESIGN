# CODESIGN IDE

UI ↔ Code 양방향 수정 IDE (React + TypeScript + Tauri)

## 프로젝트 구조

```
EE309_ver5/
├── src/                          # React 프론트엔드
│   ├── components/               # React 컴포넌트
│   │   ├── SelectFolder/        # 폴더 선택 화면
│   │   ├── IDE/                 # 메인 IDE 레이아웃
│   │   ├── FileTree/            # 파일 트리 컴포넌트
│   │   ├── Canvas/               # Canvas 미리보기 컴포넌트
│   │   └── MonacoEditor/         # Monaco 에디터 컴포넌트
│   ├── lib/                      # 유틸리티 및 라이브러리
│   │   ├── ast/                  # AST 파싱 및 코드 수정
│   │   │   ├── componentParser.ts    # JSX → AST 파싱
│   │   │   └── codeModifier.ts       # AST → 코드 수정
│   │   └── fileSystem/           # 파일 시스템 유틸
│   │       └── fileSystem.ts     # Tauri FS API 래퍼
│   ├── hooks/                    # React Hooks
│   │   ├── useCodeSync.ts        # Code → Canvas 동기화
│   │   └── useCanvasSync.ts      # Canvas → Code 동기화
│   ├── stores/                   # 상태 관리 (Zustand)
│   │   ├── projectStore.ts       # 프로젝트 상태
│   │   └── canvasStore.ts        # Canvas 상태
│   ├── styles/                   # 전역 스타일
│   ├── App.tsx                   # 메인 App 컴포넌트
│   └── main.tsx                  # 진입점
├── src-tauri/                    # Tauri 백엔드
│   ├── src/
│   │   └── main.rs               # Rust 메인 파일
│   ├── Cargo.toml                # Rust 의존성
│   ├── build.rs                  # 빌드 스크립트
│   └── tauri.conf.json           # Tauri 설정
├── package.json                  # Node.js 의존성
├── tsconfig.json                 # TypeScript 설정
├── vite.config.ts                # Vite 설정
└── README.md                     # 이 파일
```

## 주요 기능

### 1. Select Folder 화면
- 앱 실행 시 프로젝트 폴더 선택
- Tauri dialog API 사용

### 2. 3-Panel IDE 레이아웃
- **Left Panel**: 파일 트리 (폴더/파일 탐색)
- **Center Panel**: Canvas (UI 미리보기 및 드래그/드롭 편집)
- **Right Panel**: Monaco Editor (코드 편집)

### 3. 파일 트리
- 재귀적 디렉토리 읽기
- 폴더 확장/축소
- 파일 선택 시 Monaco Editor에 로드
- React 컴포넌트 파일(.tsx, .jsx) 선택 시 Canvas에 렌더링

### 4. Canvas (UI 미리보기)
- 선택된 React 컴포넌트 렌더링
- react-rnd를 사용한 드래그/드롭/리사이즈
- 요소 선택 및 속성 편집
- 실시간 UI 업데이트

### 5. Monaco Editor
- TypeScript/JavaScript syntax highlighting
- 파일 선택 시 자동 로드
- 코드 변경 시 자동 저장
- 코드 변경 → Canvas 자동 리렌더링

### 6. 양방향 동기화
- **Code → Canvas**: 코드 수정 시 Canvas UI 즉시 업데이트
- **Canvas → Code**: Canvas에서 드래그/리사이즈 시 코드 자동 업데이트
- AST 파싱을 통한 정확한 코드 수정

## 기술 스택

- **Frontend**: React 18 + TypeScript
- **Desktop**: Tauri 1.5
- **Build Tool**: Vite
- **Editor**: Monaco Editor
- **Drag/Resize**: react-rnd
- **AST Parsing**: @babel/parser, @babel/traverse, recast
- **State Management**: Zustand

## 설치 및 실행

### 1. 의존성 설치

```bash
npm install
```

### 2. 개발 모드 실행

```bash
npm run tauri:dev
```

### 3. 프로덕션 빌드

```bash
npm run tauri:build
```

## 테스트

### 테스트 실행

```bash
# 모든 테스트 실행
npm test

# UI 모드로 테스트 실행
npm run test:ui

# 커버리지 포함 테스트 실행
npm run test:coverage
```

### 테스트 커버리지

테스트 커버리지는 60% 이상을 목표로 합니다. 메인 로직(UI가 아닌 핵심 비즈니스 로직)에 대한 테스트를 포함합니다:

- **AST 파싱 및 코드 수정 로직** (`src/lib/ast/`)
- **파일 시스템 유틸리티** (`src/lib/fileSystem/`)
- **상태 관리 로직** (`src/stores/`)

테스트는 `src/lib/`, `src/stores/` 디렉토리의 `__tests__` 폴더에 위치합니다.

## 개발 가이드

### AST 동기화 엔진

`src/lib/ast/` 디렉토리에 AST 파싱 및 코드 수정 로직이 있습니다.

- `componentParser.ts`: JSX 코드를 AST로 파싱하여 컴포넌트 트리 생성
- `codeModifier.ts`: Canvas 변경사항을 AST로 변환하여 코드 수정

### 상태 관리

- `projectStore.ts`: 프로젝트 루트, 선택된 파일 등 전역 상태
- `canvasStore.ts`: Canvas 요소 위치, 선택된 요소 등 Canvas 상태

### 동기화 Hooks

- `useCodeSync.ts`: Monaco Editor 코드 변경 → Canvas 업데이트
- `useCanvasSync.ts`: Canvas 요소 변경 → 코드 업데이트

## 향후 개선 사항

- [ ] 더 정교한 AST 수정 로직
- [ ] 컴포넌트 속성 편집 패널
- [ ] 다중 컴포넌트 지원
- [ ] 히스토리/되돌리기 기능
- [ ] 파일 추가/삭제/이름변경 기능
- [ ] 테마 지원
- [ ] 플러그인 시스템

## 라이선스

MIT

# CODESIGN
