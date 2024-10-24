import { useState, useCallback, useRef, useEffect } from 'react';
import { TimelineElement } from '@/app/types/timeline';

export function useTimeline() {
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedElement, setSelectedElement] = useState<TimelineElement | null>(null);
  const animationFrameRef = useRef<number>();

  const playAnimation = useCallback(() => {
    setIsPlaying(true);
  }, []);

  const pauseAnimation = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const handleTimeUpdate = useCallback((time: number) => {
    setCurrentTime(Math.max(0, Math.min(time, 12))); // Limit to 12 seconds
  }, []);

  const handleElementSelect = useCallback((element: TimelineElement | null) => {
    setSelectedElement(element);
  }, []);

  useEffect(() => {
    if (isPlaying) {
      let lastTime = performance.now();
      
      const animate = (currentTime: number) => {
        const deltaTime = (currentTime - lastTime) / 1000;
        lastTime = currentTime;
        
        setCurrentTime((prevTime) => {
          const newTime = prevTime + deltaTime;
          return newTime >= 12 ? 0 : newTime; // Loop back to 0 after 12 seconds
        });
        
        animationFrameRef.current = requestAnimationFrame(animate);
      };
      
      animationFrameRef.current = requestAnimationFrame(animate);
    }
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying]);

  return {
    currentTime,
    isPlaying,
    selectedElement,
    playAnimation,
    pauseAnimation,
    handleTimeUpdate,
    handleElementSelect
  };
}
