
import { useEffect } from 'react';

interface KeyboardShortcuts {
  onAddFrota?: () => void;
  onToggleSearch?: () => void;
  onExportReport?: () => void;
  onToggleDarkMode?: () => void;
}

export const useKeyboardShortcuts = (shortcuts: KeyboardShortcuts) => {
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Ignora se está digitando em um input
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case 'n':
            event.preventDefault();
            shortcuts.onAddFrota?.();
            break;
          case 'f':
            event.preventDefault();
            shortcuts.onToggleSearch?.();
            break;
          case 'e':
            event.preventDefault();
            shortcuts.onExportReport?.();
            break;
          case 'd':
            event.preventDefault();
            shortcuts.onToggleDarkMode?.();
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [shortcuts]);
};
