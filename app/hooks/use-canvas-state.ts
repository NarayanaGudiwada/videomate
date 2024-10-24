import { useState, useCallback } from 'react';
import { AdSizes } from '@/utils/ad-sizes';

export function useCanvasState() {
  const [stageSize, setStageSize] = useState(AdSizes['300X250']);
  const [showJson, setShowJson] = useState(false);
  const [showResizeInputs, setShowResizeInputs] = useState(false);
  const [templateName, setTemplateName] = useState('Untitled Template');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [highlightedElement, setHighlightedElement] = useState(null);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [jsonContent, setJsonContent] = useState('');

  const toggleJson = useCallback(() => setShowJson(prev => !prev), []);
  const toggleResizeInputs = useCallback(() => setShowResizeInputs(prev => !prev), []);

  return {
    stageSize,
    setStageSize,
    showJson,
    showResizeInputs,
    templateName,
    setTemplateName,
    isPlaying,
    setIsPlaying,
    currentTime,
    setCurrentTime,
    highlightedElement,
    setHighlightedElement,
    showVersionHistory,
    setShowVersionHistory,
    jsonContent,
    setJsonContent,
    toggleJson,
    toggleResizeInputs
  };
}
