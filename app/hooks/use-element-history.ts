import { useState, useCallback } from 'react';

export function useElementHistory() {
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const addToHistory = useCallback((newElements) => {
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(newElements);
      return newHistory;
    });
    setHistoryIndex(prev => prev + 1);
  }, [historyIndex]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(prev => prev - 1);
      return history[historyIndex - 1];
    }
    return null;
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(prev => prev + 1);
      return history[historyIndex + 1];
    }
    return null;
  }, [history, historyIndex]);

  return {
    history,
    historyIndex,
    addToHistory,
    undo,
    redo
  };
}
