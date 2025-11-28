import { FileSystemNode } from '../../lib/fileSystem/fileSystem';
import './FileTreeNode.css';

interface FileTreeNodeProps {
  node: FileSystemNode;
  level: number;
  expandedPaths: Set<string>;
  onToggleExpand: (path: string) => void;
  selectedFile: string | null;
  onFileSelect: (path: string) => void;
}

export function FileTreeNode({
  node,
  level,
  expandedPaths,
  onToggleExpand,
  selectedFile,
  onFileSelect,
}: FileTreeNodeProps) {
  const isExpanded = expandedPaths.has(node.path);
  const isSelected = selectedFile === node.path;
  const isReactFile = node.path.endsWith('.tsx') || node.path.endsWith('.jsx');

  const handleClick = () => {
    if (node.type === 'directory') {
      onToggleExpand(node.path);
    } else {
      onFileSelect(node.path);
    }
  };

  return (
    <div className="file-tree-node">
      <div
        className={`file-tree-item ${isSelected ? 'selected' : ''} ${isReactFile ? 'react-file' : ''}`}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={handleClick}
      >
        <span className="file-tree-icon">
          {node.type === 'directory' ? (isExpanded ? '📂' : '📁') : '📄'}
        </span>
        <span className="file-tree-name">{node.name}</span>
      </div>
      {node.type === 'directory' && isExpanded && node.children && (
        <div className="file-tree-children">
          {node.children.map((child) => (
            <FileTreeNode
              key={child.path}
              node={child}
              level={level + 1}
              expandedPaths={expandedPaths}
              onToggleExpand={onToggleExpand}
              selectedFile={selectedFile}
              onFileSelect={onFileSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}
