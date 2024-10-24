import { useEffect, useRef } from 'react';
import { Element } from '@/app/types/designer';

const AUTO_SAVE_INTERVAL = 5000; // 5 seconds

export function useAutoSave(
  elements: Element[],
  saveFunction: () => Promise<void>
) {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const lastSavedRef = useRef<string>(JSON.stringify(elements));

  useEffect(() => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Check if content has changed
    const currentContent = JSON.stringify(elements);
    if (currentContent === lastSavedRef.current) {
      return;
    }

    // Set new timeout for auto-save
    timeoutRef.current = setTimeout(async () => {
      try {
        await saveFunction();
        lastSavedRef.current = currentContent;
        console.log('Auto-saved successfully');
      } catch (error) {
        console.error('Auto-save failed:', error);
      }
    }, AUTO_SAVE_INTERVAL);

    // Cleanup timeout on unmount or when elements change
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [elements, saveFunction]);
}
