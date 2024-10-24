export interface Element {
  id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  fill?: string;
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  [key: string]: any;
}

export interface Project {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  elements: Element[];
  stageSize: {
    width: number;
    height: number;
  };
  templateName: string;
  userId: string;
  collaborators?: string[];
}
