import { describe, it, expect, beforeEach } from 'vitest';
import { useProjectStore } from '../projectStore';

describe('projectStore', () => {
  beforeEach(() => {
    // Store 초기화
    useProjectStore.setState({
      projectRoot: null,
      selectedFile: null,
    });
  });

  describe('projectRoot', () => {
    it('should set and get project root', () => {
      const { setProjectRoot, projectRoot } = useProjectStore.getState();
      
      expect(projectRoot).toBeNull();
      
      setProjectRoot('/path/to/project');
      expect(useProjectStore.getState().projectRoot).toBe('/path/to/project');
      
      setProjectRoot(null);
      expect(useProjectStore.getState().projectRoot).toBeNull();
    });
  });

  describe('selectedFile', () => {
    it('should set and get selected file', () => {
      const { setSelectedFile, selectedFile } = useProjectStore.getState();
      
      expect(selectedFile).toBeNull();
      
      setSelectedFile('/path/to/file.tsx');
      expect(useProjectStore.getState().selectedFile).toBe('/path/to/file.tsx');
      
      setSelectedFile(null);
      expect(useProjectStore.getState().selectedFile).toBeNull();
    });
  });
});

