import { describe, it, expect } from 'vitest';
import { parseTailwindClasses } from '../tailwindParser';

describe('tailwindParser', () => {
  describe('parseTailwindClasses', () => {
    // 빈 입력 처리
    it('should return empty object for empty string', () => {
      expect(parseTailwindClasses('')).toEqual({});
    });

    it('should return empty object for undefined/null', () => {
      expect(parseTailwindClasses(undefined as any)).toEqual({});
      expect(parseTailwindClasses(null as any)).toEqual({});
    });

    // 배경색
    describe('background colors', () => {
      it('should parse bg-blue-500', () => {
        const result = parseTailwindClasses('bg-blue-500');
        expect(result.backgroundColor).toBe('#3b82f6');
      });

      it('should parse bg-red-600', () => {
        const result = parseTailwindClasses('bg-red-600');
        expect(result.backgroundColor).toBe('#dc2626');
      });

      it('should parse bg-gray-100', () => {
        const result = parseTailwindClasses('bg-gray-100');
        expect(result.backgroundColor).toBe('#f3f4f6');
      });

      it('should parse bg-white', () => {
        const result = parseTailwindClasses('bg-white');
        expect(result.backgroundColor).toBe('#ffffff');
      });
    });

    // 텍스트 색상
    describe('text colors', () => {
      it('should parse text-white', () => {
        const result = parseTailwindClasses('text-white');
        expect(result.color).toBe('#ffffff');
      });

      it('should parse text-black', () => {
        const result = parseTailwindClasses('text-black');
        expect(result.color).toBe('#000000');
      });

      it('should parse text-blue-500', () => {
        const result = parseTailwindClasses('text-blue-500');
        expect(result.color).toBe('#3b82f6');
      });
    });

    // 패딩
    describe('padding', () => {
      it('should parse p-4', () => {
        const result = parseTailwindClasses('p-4');
        expect(result.padding).toBe('1rem');
      });

      it('should parse p-0', () => {
        const result = parseTailwindClasses('p-0');
        expect(result.padding).toBe('0');
      });

      it('should parse px-4', () => {
        const result = parseTailwindClasses('px-4');
        expect(result.paddingLeft).toBe('1rem');
        expect(result.paddingRight).toBe('1rem');
      });

      it('should parse py-2', () => {
        const result = parseTailwindClasses('py-2');
        expect(result.paddingTop).toBe('0.5rem');
        expect(result.paddingBottom).toBe('0.5rem');
      });

      it('should parse pt-4 pb-2 pl-3 pr-5', () => {
        const result = parseTailwindClasses('pt-4 pb-2 pl-3 pr-5');
        expect(result.paddingTop).toBe('1rem');
        expect(result.paddingBottom).toBe('0.5rem');
        expect(result.paddingLeft).toBe('0.75rem');
        expect(result.paddingRight).toBe('1.25rem');
      });
    });

    // 마진
    describe('margin', () => {
      it('should parse m-4', () => {
        const result = parseTailwindClasses('m-4');
        expect(result.margin).toBe('1rem');
      });

      it('should parse mx-auto', () => {
        const result = parseTailwindClasses('mx-auto');
        expect(result.marginLeft).toBe('auto');
        expect(result.marginRight).toBe('auto');
      });

      it('should parse my-4', () => {
        const result = parseTailwindClasses('my-4');
        expect(result.marginTop).toBe('1rem');
        expect(result.marginBottom).toBe('1rem');
      });

      it('should parse mt-2 mb-4 ml-1 mr-3', () => {
        const result = parseTailwindClasses('mt-2 mb-4 ml-1 mr-3');
        expect(result.marginTop).toBe('0.5rem');
        expect(result.marginBottom).toBe('1rem');
        expect(result.marginLeft).toBe('0.25rem');
        expect(result.marginRight).toBe('0.75rem');
      });
    });

    // 너비와 높이
    describe('width and height', () => {
      it('should parse w-full', () => {
        const result = parseTailwindClasses('w-full');
        expect(result.width).toBe('100%');
      });

      it('should parse h-screen', () => {
        const result = parseTailwindClasses('h-screen');
        expect(result.height).toBe('100vh');
      });

      it('should parse w-64', () => {
        const result = parseTailwindClasses('w-64');
        expect(result.width).toBe('16rem');
      });

      it('should parse h-full', () => {
        const result = parseTailwindClasses('h-full');
        expect(result.height).toBe('100%');
      });

      it('should parse min-h-screen', () => {
        const result = parseTailwindClasses('min-h-screen');
        expect(result.minHeight).toBe('100vh');
      });
    });

    // 텍스트 정렬
    describe('text alignment', () => {
      it('should parse text-center', () => {
        const result = parseTailwindClasses('text-center');
        expect(result.textAlign).toBe('center');
      });

      it('should parse text-left', () => {
        const result = parseTailwindClasses('text-left');
        expect(result.textAlign).toBe('left');
      });

      it('should parse text-right', () => {
        const result = parseTailwindClasses('text-right');
        expect(result.textAlign).toBe('right');
      });
    });

    // 폰트 크기
    describe('font size', () => {
      it('should parse text-xs', () => {
        const result = parseTailwindClasses('text-xs');
        expect(result.fontSize).toBe('0.75rem');
      });

      it('should parse text-lg', () => {
        const result = parseTailwindClasses('text-lg');
        expect(result.fontSize).toBe('1.125rem');
      });

      it('should parse text-4xl', () => {
        const result = parseTailwindClasses('text-4xl');
        expect(result.fontSize).toBe('2.25rem');
      });
    });

    // 폰트 굵기
    describe('font weight', () => {
      it('should parse font-bold', () => {
        const result = parseTailwindClasses('font-bold');
        expect(result.fontWeight).toBe('bold');
      });

      it('should parse font-semibold', () => {
        const result = parseTailwindClasses('font-semibold');
        expect(result.fontWeight).toBe('600');
      });

      it('should parse font-medium', () => {
        const result = parseTailwindClasses('font-medium');
        expect(result.fontWeight).toBe('500');
      });
    });

    // 그림자
    describe('shadows', () => {
      it('should parse shadow', () => {
        const result = parseTailwindClasses('shadow');
        expect(result.boxShadow).toBe('0 1px 3px 0 rgba(0, 0, 0, 0.1)');
      });

      it('should parse shadow-lg', () => {
        const result = parseTailwindClasses('shadow-lg');
        expect(result.boxShadow).toBe('0 10px 15px -3px rgba(0, 0, 0, 0.1)');
      });
    });

    // 둥근 모서리
    describe('border radius', () => {
      it('should parse rounded', () => {
        const result = parseTailwindClasses('rounded');
        expect(result.borderRadius).toBe('0.25rem');
      });

      it('should parse rounded-lg', () => {
        const result = parseTailwindClasses('rounded-lg');
        expect(result.borderRadius).toBe('0.5rem');
      });

      it('should parse rounded-full', () => {
        const result = parseTailwindClasses('rounded-full');
        expect(result.borderRadius).toBe('9999px');
      });
    });

    // Flexbox
    describe('flexbox', () => {
      it('should parse flex', () => {
        const result = parseTailwindClasses('flex');
        expect(result.display).toBe('flex');
      });

      it('should parse flex-col', () => {
        const result = parseTailwindClasses('flex flex-col');
        expect(result.display).toBe('flex');
        expect(result.flexDirection).toBe('column');
      });

      it('should parse items-center', () => {
        const result = parseTailwindClasses('items-center');
        expect(result.alignItems).toBe('center');
      });

      it('should parse justify-between', () => {
        const result = parseTailwindClasses('justify-between');
        expect(result.justifyContent).toBe('space-between');
      });

      it('should parse complex flex layout', () => {
        const result = parseTailwindClasses('flex flex-col items-center justify-center');
        expect(result.display).toBe('flex');
        expect(result.flexDirection).toBe('column');
        expect(result.alignItems).toBe('center');
        expect(result.justifyContent).toBe('center');
      });
    });

    // Grid
    describe('grid', () => {
      it('should parse grid', () => {
        const result = parseTailwindClasses('grid');
        expect(result.display).toBe('grid');
      });

      it('should parse grid-cols-3', () => {
        const result = parseTailwindClasses('grid grid-cols-3');
        expect(result.display).toBe('grid');
        expect(result.gridTemplateColumns).toBe('repeat(3, minmax(0, 1fr))');
      });

      it('should parse gap-4', () => {
        const result = parseTailwindClasses('gap-4');
        expect(result.gap).toBe('1rem');
      });
    });

    // 위치
    describe('position', () => {
      it('should parse relative', () => {
        const result = parseTailwindClasses('relative');
        expect(result.position).toBe('relative');
      });

      it('should parse absolute', () => {
        const result = parseTailwindClasses('absolute');
        expect(result.position).toBe('absolute');
      });

      it('should parse fixed', () => {
        const result = parseTailwindClasses('fixed');
        expect(result.position).toBe('fixed');
      });
    });

    // Border
    describe('border', () => {
      it('should parse border', () => {
        const result = parseTailwindClasses('border');
        expect(result.borderWidth).toBe('1px');
      });

      it('should parse border-2', () => {
        const result = parseTailwindClasses('border-2');
        expect(result.borderWidth).toBe('2px');
      });

      it('should parse border-gray-300', () => {
        const result = parseTailwindClasses('border-gray-300');
        expect(result.borderColor).toBe('#d1d5db');
      });
    });

    // 그라데이션
    describe('gradients', () => {
      it('should parse simple gradient', () => {
        const result = parseTailwindClasses('bg-gradient-to-r from-blue-500 to-purple-500');
        expect(result.backgroundImage).toContain('linear-gradient');
        expect(result.backgroundImage).toContain('#3b82f6');
        expect(result.backgroundImage).toContain('#a855f7');
      });

      it('should parse gradient with via', () => {
        const result = parseTailwindClasses('bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500');
        expect(result.backgroundImage).toContain('linear-gradient');
        expect(result.backgroundImage).toContain('#3b82f6');
        expect(result.backgroundImage).toContain('#a855f7');
        expect(result.backgroundImage).toContain('#ec4899');
      });

      it('should parse gradient-to-b direction', () => {
        const result = parseTailwindClasses('bg-gradient-to-b from-red-500 to-yellow-500');
        expect(result.backgroundImage).toContain('to bottom');
      });
    });

    // Container
    describe('container', () => {
      it('should parse container', () => {
        const result = parseTailwindClasses('container');
        expect(result.maxWidth).toBe('1280px');
        expect(result.marginLeft).toBe('auto');
        expect(result.marginRight).toBe('auto');
      });
    });

    // Overflow
    describe('overflow', () => {
      it('should parse overflow-hidden', () => {
        const result = parseTailwindClasses('overflow-hidden');
        expect(result.overflow).toBe('hidden');
      });

      it('should parse overflow-x-auto', () => {
        const result = parseTailwindClasses('overflow-x-auto');
        expect(result.overflowX).toBe('auto');
      });
    });

    // 복합 클래스
    describe('combined classes', () => {
      it('should parse multiple classes', () => {
        const result = parseTailwindClasses('bg-blue-500 text-white p-4 rounded-lg shadow-md');
        expect(result.backgroundColor).toBe('#3b82f6');
        expect(result.color).toBe('#ffffff');
        expect(result.padding).toBe('1rem');
        expect(result.borderRadius).toBe('0.5rem');
        expect(result.boxShadow).toBe('0 4px 6px -1px rgba(0, 0, 0, 0.1)');
      });

      it('should parse button-like classes', () => {
        const result = parseTailwindClasses('px-4 py-2 bg-blue-600 text-white font-semibold rounded');
        expect(result.paddingLeft).toBe('1rem');
        expect(result.paddingRight).toBe('1rem');
        expect(result.paddingTop).toBe('0.5rem');
        expect(result.paddingBottom).toBe('0.5rem');
        expect(result.backgroundColor).toBe('#2563eb');
        expect(result.color).toBe('#ffffff');
        expect(result.fontWeight).toBe('600');
        expect(result.borderRadius).toBe('0.25rem');
      });

      it('should parse card-like classes', () => {
        const result = parseTailwindClasses('bg-white rounded-xl shadow-lg p-6');
        expect(result.backgroundColor).toBe('#ffffff');
        expect(result.borderRadius).toBe('0.75rem');
        expect(result.boxShadow).toBe('0 10px 15px -3px rgba(0, 0, 0, 0.1)');
        expect(result.padding).toBe('1.5rem');
      });
    });

    // Space
    describe('space utilities', () => {
      it('should parse space-y-4', () => {
        const result = parseTailwindClasses('space-y-4');
        expect((result as any).__spaceY__).toBe('1rem');
      });

      it('should parse space-x-2', () => {
        const result = parseTailwindClasses('space-x-2');
        expect((result as any).__spaceX__).toBe('0.5rem');
      });
    });

    // List
    describe('list styles', () => {
      it('should parse list-disc', () => {
        const result = parseTailwindClasses('list-disc');
        expect(result.listStyleType).toBe('disc');
      });

      it('should parse list-inside', () => {
        const result = parseTailwindClasses('list-inside');
        expect(result.listStylePosition).toBe('inside');
      });
    });

    // 추가 branch 커버리지
    describe('additional branch coverage', () => {
      it('should parse min-h with numeric value', () => {
        const result = parseTailwindClasses('min-h-20');
        expect(result.minHeight).toBe('5rem');
      });

      it('should parse size with decimal', () => {
        const result = parseTailwindClasses('p-0.5');
        expect(result.padding).toBe('0.125rem');
      });

      it('should handle non-mapped size', () => {
        const result = parseTailwindClasses('p-999');
        expect(result.padding).toBe('249.75rem');
      });

      it('should handle auto margin value', () => {
        const result = parseTailwindClasses('ml-auto');
        expect(result.marginLeft).toBe('auto');
      });

      it('should handle w-auto', () => {
        const result = parseTailwindClasses('w-auto');
        expect(result.width).toBe('auto');
      });

      it('should parse multiple overflow classes', () => {
        const result = parseTailwindClasses('overflow-hidden overflow-x-auto');
        expect(result.overflow).toBe('hidden');
        expect(result.overflowX).toBe('auto');
      });

      it('should parse space-y-0 as 0', () => {
        const result = parseTailwindClasses('space-y-0');
        expect((result as any).__spaceY__).toBe('0');
      });

      it('should parse space-x with valid value', () => {
        const result = parseTailwindClasses('space-x-4');
        expect((result as any).__spaceX__).toBe('1rem');
      });

      it('should handle unknown color', () => {
        const result = parseTailwindClasses('bg-unknowncolor-500');
        expect(result.backgroundColor).toBeUndefined();
      });

      it('should parse p-1 correctly', () => {
        const result = parseTailwindClasses('p-1');
        expect(result.padding).toBe('0.25rem');
      });

      it('should parse p-1.5 correctly', () => {
        const result = parseTailwindClasses('p-1.5');
        expect(result.padding).toBe('0.375rem');
      });

      it('should parse p-2.5 correctly', () => {
        const result = parseTailwindClasses('p-2.5');
        expect(result.padding).toBe('0.625rem');
      });

      it('should parse p-3.5 correctly', () => {
        const result = parseTailwindClasses('p-3.5');
        expect(result.padding).toBe('0.875rem');
      });

      it('should parse large size p-72', () => {
        const result = parseTailwindClasses('p-72');
        expect(result.padding).toBe('18rem');
      });

      it('should parse large size p-80', () => {
        const result = parseTailwindClasses('p-80');
        expect(result.padding).toBe('20rem');
      });

      it('should parse large size p-96', () => {
        const result = parseTailwindClasses('p-96');
        expect(result.padding).toBe('24rem');
      });

      it('should handle container paddingLeft/Right', () => {
        const result = parseTailwindClasses('container');
        expect(result.paddingLeft).toBe('1rem');
        expect(result.paddingRight).toBe('1rem');
      });

      it('should parse float value correctly', () => {
        const result = parseTailwindClasses('m-15');
        expect(result.margin).toBe('3.75rem');
      });
    });
  });
});

