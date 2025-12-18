import { describe, it, expect } from 'vitest';
import { shouldIgnore } from '../fileSystem';

// Mock 없이 순수 함수만 테스트
// shouldIgnore는 IGNORED_PATTERNS 배열의 패턴이 name에 포함되어 있으면 true 반환

describe('fileSystem', () => {
  describe('shouldIgnore', () => {
    // 기본 ignore 패턴 테스트
    it('should ignore node_modules', () => {
      expect(shouldIgnore('node_modules')).toBe(true);
    });

    it('should ignore paths containing node_modules', () => {
      expect(shouldIgnore('some-node_modules-folder')).toBe(true);
      expect(shouldIgnore('path/node_modules/package')).toBe(true);
    });

    it('should ignore .git', () => {
      expect(shouldIgnore('.git')).toBe(true);
      expect(shouldIgnore('.github')).toBe(true); // .git 포함
      expect(shouldIgnore('.gitignore')).toBe(true); // .git 포함
    });

    it('should ignore .DS_Store', () => {
      expect(shouldIgnore('.DS_Store')).toBe(true);
    });

    it('should ignore dist folder', () => {
      expect(shouldIgnore('dist')).toBe(true);
      expect(shouldIgnore('distribution')).toBe(true); // dist 포함
    });

    it('should ignore build folder', () => {
      expect(shouldIgnore('build')).toBe(true);
      expect(shouldIgnore('my-build-tool')).toBe(true); // build 포함
    });

    it('should ignore .next folder', () => {
      expect(shouldIgnore('.next')).toBe(true);
    });

    it('should ignore .vite folder', () => {
      expect(shouldIgnore('.vite')).toBe(true);
    });

    it('should ignore src-tauri', () => {
      expect(shouldIgnore('src-tauri')).toBe(true);
    });

    // 무시하지 않아야 하는 파일/폴더 테스트
    it('should not ignore src folder', () => {
      expect(shouldIgnore('src')).toBe(false);
    });

    it('should not ignore components folder', () => {
      expect(shouldIgnore('components')).toBe(false);
    });

    it('should not ignore regular TypeScript files', () => {
      expect(shouldIgnore('App.tsx')).toBe(false);
      expect(shouldIgnore('index.ts')).toBe(false);
      expect(shouldIgnore('Button.tsx')).toBe(false);
    });

    it('should not ignore lib folder', () => {
      expect(shouldIgnore('lib')).toBe(false);
    });

    it('should not ignore utils folder', () => {
      expect(shouldIgnore('utils')).toBe(false);
    });

    it('should not ignore hooks folder', () => {
      expect(shouldIgnore('hooks')).toBe(false);
    });

    it('should not ignore stores folder', () => {
      expect(shouldIgnore('stores')).toBe(false);
    });

    it('should not ignore test files', () => {
      expect(shouldIgnore('Button.test.tsx')).toBe(false);
      expect(shouldIgnore('utils.spec.ts')).toBe(false);
    });

    it('should not ignore assets folder', () => {
      expect(shouldIgnore('assets')).toBe(false);
      expect(shouldIgnore('public')).toBe(false);
      expect(shouldIgnore('static')).toBe(false);
    });

    it('should not ignore config files', () => {
      expect(shouldIgnore('vite.config.ts')).toBe(false);
      expect(shouldIgnore('tailwind.config.js')).toBe(false);
      expect(shouldIgnore('tsconfig.json')).toBe(false);
    });

    it('should not ignore package.json', () => {
      expect(shouldIgnore('package.json')).toBe(false);
    });

    it('should not ignore style files', () => {
      expect(shouldIgnore('styles.css')).toBe(false);
      expect(shouldIgnore('theme.scss')).toBe(false);
    });

    it('should not ignore markdown files', () => {
      expect(shouldIgnore('README.md')).toBe(false);
      expect(shouldIgnore('CHANGELOG.md')).toBe(false);
    });

    // Edge cases
    it('should handle empty string', () => {
      expect(shouldIgnore('')).toBe(false);
    });

    it('should handle single characters', () => {
      expect(shouldIgnore('a')).toBe(false);
      expect(shouldIgnore('.')).toBe(false);
    });

    it('should not ignore JavaScript files', () => {
      expect(shouldIgnore('index.js')).toBe(false);
      expect(shouldIgnore('config.mjs')).toBe(false);
    });

    it('should not ignore JSX files', () => {
      expect(shouldIgnore('Header.jsx')).toBe(false);
    });

    it('should not ignore type definition files', () => {
      expect(shouldIgnore('types.d.ts')).toBe(false);
    });
  });
});
