import '@testing-library/jest-dom';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// 각 테스트 후 cleanup
afterEach(() => {
  cleanup();
});

// Tauri API 전역 모킹
if (typeof window !== 'undefined') {
  (window as any).__TAURI__ = {
    invoke: vi.fn(),
  };
  (window as any).__TAURI_IPC__ = vi.fn((_message) => {
    return Promise.resolve({});
  });
  (window as any).__TAURI_METADATA__ = {
    __windows: [],
    __currentWindow: { label: 'main' },
  };
}
