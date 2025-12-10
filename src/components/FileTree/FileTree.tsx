import { useState, useEffect } from 'react';
import { useProjectStore } from '../../stores/projectStore';
import { FileSystemNode, readDirectory } from '../../lib/fileSystem/fileSystem';
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
      console.error('파일 트리 로드 실패:', error);
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

  if (!fileTree) {
    return (
      <div className="file-tree-container">
        <div className="file-tree-loading">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="file-tree-container">
      <div className="file-tree-header">
        <h3>File Explorer</h3>
      </div>
      <div className="file-tree-content">
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
