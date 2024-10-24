import { useState } from 'react';

export const useAnimationClipboard = () => {
  const [clipboard, setClipboard] = useState<any>(null);

  const copyAnimation = (element: TimelineElement) => {
    const animationData = {
      keyframes: element.keyframes,
      duration: element.duration,
      easing: element.easing
    };
    setClipboard(animationData);
  };

  const pasteAnimation = (targetElement: TimelineElement) => {
    if (!clipboard) return null;
    return {
      ...targetElement,
      ...clipboard
    };
  };

  return { copyAnimation, pasteAnimation, hasClipboard: !!clipboard };
};
