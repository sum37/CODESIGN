import { useState, useEffect } from 'react';
import { SelectFolder } from './components/SelectFolder/SelectFolder.tsx';
import { IDE } from './components/IDE/IDE.tsx';
import { useProjectStore } from './stores/projectStore';

function App() {
  const { projectRoot, setProjectRoot } = useProjectStore();
  const [isLoading, setIsLoading] = useState(false);

  // 프로젝트 루트가 설정되면 IDE 화면으로 전환
  if (projectRoot) {
    return <IDE />;
  }

  return <SelectFolder onFolderSelected={setProjectRoot} isLoading={isLoading} setIsLoading={setIsLoading} />;
}

export default App;

