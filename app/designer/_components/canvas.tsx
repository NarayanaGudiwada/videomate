import React, { RefObject } from 'react';
import { Stage, Layer, Text, Rect, Transformer, KonvaEventObject } from 'react-konva';
import { cn } from '@/lib/utils';
import Konva from 'konva';

// Define a more specific type for elements
interface BaseElement {
  id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  [key: string]: string | number; // For other properties that might vary based on element type
}

interface CanvasProps {
  stageSize: { width: number; height: number };
  stageRef: RefObject<Konva.Stage>;
  elements: BaseElement[];
  selectedElement: BaseElement | null;
  setSelectedElement: (element: BaseElement | null) => void;
  handleDragEnd: (e: KonvaEventObject<DragEvent>, id: string) => void;
  handleTransformEnd: (e: KonvaEventObject<Event>, id: string) => void;
  transformerRef: RefObject<Transformer>;
  imageElement: React.ComponentType<{ element: BaseElement }>;
  onElementsChange: (elements: BaseElement[]) => void;
}

const Canvas: React.FC<CanvasProps> = ({
  stageSize,
  stageRef,
  elements,
  selectedElement,
  setSelectedElement,
  handleDragEnd,
  handleTransformEnd,
  transformerRef,
  imageElement: ImageElement,
  onElementsChange
}) => {
  const handleElementChange = (elementId: string, changes: Partial<BaseElement>) => {
    const newElements = elements.map(el =>
      el.id === elementId ? { ...el, ...changes } : el
    );
    onElementsChange(newElements);
  };

  return (
    <div className={cn('flex-1 bg-muted/50 p-8 overflow-auto', 'flex items-center justify-center')}>
      <div className={cn('bg-background', 'shadow-lg overflow-hidden')}>
        <Stage
          width={stageSize.width}
          height={stageSize.height}
          ref={stageRef}
          onMouseDown={(e: KonvaEventObject<MouseEvent>) => {
            if (e.target === e.target.getStage()) {
              setSelectedElement(null);
            }
          }}>
          <Layer>
            {elements.map((el) => {
              const ElementComponent =
                el.type === 'text' ? Text : el.type === 'image' ? ImageElement : Rect;
              return (
                <ElementComponent
                  key={el.id}
                  {...el}
                  draggable
                  onClick={() => setSelectedElement(el)}
                  onDragEnd={(e: KonvaEventObject<DragEvent>) => handleDragEnd(e, el.id)}
                  onTransformEnd={(e: KonvaEventObject<Event>) => handleTransformEnd(e, el.id)}
                  stroke={
                    selectedElement && selectedElement.id === el.id
                      ? 'hsl(var(--primary))'
                      : undefined
                  }
                  strokeWidth={selectedElement && selectedElement.id === el.id ? 2 : undefined}
                />
              );
            })}
            {selectedElement && (
              <Transformer
                ref={transformerRef}
                boundBoxFunc={(oldBox, newBox) => {
                  if (newBox.width < 5 || newBox.height < 5) {
                    return oldBox;
                  }
                  return newBox;
                }}
              />
            )}
          </Layer>
        </Stage>
      </div>
    </div>
  );
};

export default Canvas;
