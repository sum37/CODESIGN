import { useState, useEffect } from 'react';
import { useProjectStore } from '../../stores/projectStore';
import { FileSystemNode, readDirectory, writeFile } from '../../lib/fileSystem/fileSystem';
import { path } from '@tauri-apps/api';
import { FileTreeNode } from './FileTreeNode';
import './FileTree.css';

export function FileTree() {
  const { projectRoot, selectedFile, setSelectedFile } = useProjectStore();
  const [fileTree, setFileTree] = useState<FileSystemNode | null>(null);
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (projectRoot) {
      loadFileTree(projectRoot);
    }
  }, [projectRoot]);

  const loadFileTree = async (root: string) => {
    try {
      const tree = await readDirectory(root);
      setFileTree(tree);
    } catch (error) {
      console.error('Failed to load file tree:', error);
    }
  };

  const toggleExpand = (path: string) => {
    const newExpanded = new Set(expandedPaths);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedPaths(newExpanded);
  };

  const handleCreateNewFile = async () => {
    if (!projectRoot) return;

    try {
      // 새 파일 이름 생성 (중복 방지)
      let fileName = 'NewComponent.tsx';
      let filePath = await path.join(projectRoot, fileName);
      let counter = 1;

      // 파일이 이미 존재하면 번호를 증가시켜서 고유한 이름 생성
      while (await fileExists(filePath)) {
        fileName = `NewComponent${counter}.tsx`;
        filePath = await path.join(projectRoot, fileName);
        counter++;
      }

      // 컴포넌트 이름 생성 (파일명에서 확장자 제거하고 PascalCase로 변환)
      const componentName = fileName.replace('.tsx', '').replace(/[^a-zA-Z0-9]/g, '');

      // 빈 React 컴포넌트 템플릿 생성
      const emptyComponent = `import React from 'react';

export function ${componentName}() {
  return (
    <div>
      {/* Your component content here */}
    </div>
  );
}
`;

      // 파일 생성
      await writeFile(filePath, emptyComponent);

      // 파일 트리 새로고침
      await loadFileTree(projectRoot);

      // 새로 생성된 파일 선택
      setSelectedFile(filePath);
    } catch (error) {
      console.error('Failed to create new file:', error);
    }
  };

  const fileExists = async (filePath: string): Promise<boolean> => {
    try {
      // 파일이 존재하는지 확인하기 위해 읽기 시도
      const { readTextFile } = await import('@tauri-apps/api/fs');
      await readTextFile(filePath);
      return true;
    } catch {
      return false;
    }
  };

  if (!fileTree) {
    return (
      <div className="file-tree-container">
        <div className="file-tree-loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="file-tree-container">
      <div className="file-tree-header">
        <h3>File Explorer</h3>
      </div>
      <div className="file-tree-content">
        <button 
          className="file-tree-new-file-button"
          onClick={handleCreateNewFile}
          title="Create New TSX File"
        >
          + New File
        </button>
        <FileTreeNode
          node={fileTree}
          level={0}
          expandedPaths={expandedPaths}
          onToggleExpand={toggleExpand}
          selectedFile={selectedFile}
          onFileSelect={setSelectedFile}
        />
      </div>
    </div>
  );
}
