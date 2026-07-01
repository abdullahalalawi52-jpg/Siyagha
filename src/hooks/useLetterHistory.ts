import { useState } from 'react';

export const useLetterHistory = () => {
  const [generatedLetter, setGeneratedLetterState] = useState<string>('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  const updateLetterContent = (newContent: string, addToHistory = true) => {
    setGeneratedLetterState(newContent);
    const currentHistItem = historyIndex >= 0 ? history.at(historyIndex) : undefined;
    if (addToHistory && newContent !== currentHistItem) {
      setHistory((prev) => {
        const sliced = prev.slice(0, historyIndex + 1);
        const newHistory = [...sliced, newContent].slice(-50);
        setHistoryIndex(newHistory.length - 1);
        return newHistory;
      });
    }
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      setHistoryIndex(prevIndex);
      setGeneratedLetterState(history.at(prevIndex) || '');
    } else if (historyIndex === 0) {
      setHistoryIndex(-1);
      setGeneratedLetterState('');
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      setHistoryIndex(nextIndex);
      setGeneratedLetterState(history.at(nextIndex) || '');
    }
  };

  return {
    generatedLetter,
    setGeneratedLetterState,
    history,
    setHistory,
    historyIndex,
    setHistoryIndex,
    updateLetterContent,
    handleUndo,
    handleRedo,
  };
};
