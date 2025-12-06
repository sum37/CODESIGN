import { readTextFile, writeTextFile, readDir } from '@tauri-apps/api/fs';
import { path } from '@tauri-apps/api';

export interface FileSystemNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: FileSystemNode[];
}

const IGNORED_PATTERNS = [
  'node_modules',
  '.git',
  '.DS_Store',
  'dist',
  'build',
  '.next',
  '.vite',
  'src-tauri',
];

function shouldIgnore(name: string): boolean {
  return IGNORED_PATTERNS.some((pattern) => name.includes(pattern));
}

export async function readDirectory(dirPath: string): Promise<FileSystemNode> {
  try {
    const entries = await readDir(dirPath);
    const name = await path.basename(dirPath);
    
    const node: FileSystemNode = {
      name,
      path: dirPath,
      type: 'directory',
      children: [],
    };

    for (const entry of entries) {
      // entry.name이 undefined일 수 있으므로 체크
      if (!entry.name || shouldIgnore(entry.name)) {
        continue;
      }

      // Tauri 1.5에서는 children 속성으로 디렉토리 여부를 판단
      // children이 있으면 디렉토리, 없으면 파일
      const isDirectory = 'children' in entry && entry.children !== undefined;
      
      if (isDirectory) {
        // 디렉토리인 경우 재귀적으로 읽기
        try {
          const childNode = await readDirectory(entry.path);
          node.children!.push(childNode);
        } catch (error) {
          console.warn(`디렉토리 읽기 실패: ${entry.path}`, error);
        }
      } else {
        // 파일인 경우
        node.children!.push({
          name: entry.name!,
          path: entry.path,
          type: 'file',
        });
      }
    }

    // 정렬: 디렉토리 먼저, 그 다음 파일
    node.children!.sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === 'directory' ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });

    return node;
  } catch (error) {
    console.error(`디렉토리 읽기 실패: ${dirPath}`, error);
    throw error;
  }
}

export async function readFile(filePath: string): Promise<string> {
  try {
    const content = await readTextFile(filePath);
    return content;
  } catch (error) {
    console.error(`파일 읽기 실패: ${filePath}`, error);
    // 에러 상세 정보 로깅
    if (error instanceof Error) {
      console.error('에러 메시지:', error.message);
      console.error('에러 스택:', error.stack);
    }
    throw error;
  }
}

export async function writeFile(filePath: string, content: string): Promise<void> {
  try {
    await writeTextFile(filePath, content);
  } catch (error) {
    console.error(`파일 쓰기 실패: ${filePath}`, error);
    throw error;
  }
}

