export interface Element {
  id: string;
  name: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  fill: string;
  fontSize: number;
  fontFamily: string;
  rotation: number;
  startTime: number;
  duration: number;
}

export interface DesignerState {
  elements: Element[];
  selectedElement: Element | null;
  currentTime: number;
  isPlaying: boolean;
}
