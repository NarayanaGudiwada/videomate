export interface TimelineElement {
  id: string;
  type?: string;
  name?: string;
  startTime: number;
  duration: number;
  zIndex?: number;
  keyframes?: Record<string, Record<string, number | string>>;
  isTransforming?: boolean;
  isDragging?: boolean;
  [key: string]: unknown;
}

export interface TimelineProps {
  elements: TimelineElement[];
  selectedElement: TimelineElement | null;
  currentTime: number;
  isPlaying: boolean;
  onElementSelect: (element: TimelineElement | null) => void;
  onTimeUpdate: (time: number) => void;
  onPlay: () => void;
  onPause: () => void;
}
