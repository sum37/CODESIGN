import { useState } from 'react';
import { open } from '@tauri-apps/api/dialog';
import logoImage from '../../assets/logo.png';
import './SelectFolder.css';

interface SelectFolderProps {
  onFolderSelected: (path: string) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export function SelectFolder({ onFolderSelected, isLoading, setIsLoading }: SelectFolderProps) {
  const [error, setError] = useState<string | null>(null);

  const handleSelectFolder = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const selected = await open({
        directory: true,
        multiple: false,
        title: 'Select Project Folder',
      });

      if (selected && typeof selected === 'string') {
        onFolderSelected(selected);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while selecting folder.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="select-folder-container">
      <div className="select-folder-content">
        <img src={logoImage} alt="CODESIGN" className="select-folder-logo" />
        <p className="select-folder-subtitle">UI ↔ Code Bidirectional Editing IDE</p>
        
        <button
          className="select-folder-button"
          onClick={handleSelectFolder}
          disabled={isLoading}
        >
          {isLoading ? 'Loading...' : 'Select Project Folder'}
        </button>

        {error && <div className="select-folder-error">{error}</div>}
      </div>
    </div>
  );
}
