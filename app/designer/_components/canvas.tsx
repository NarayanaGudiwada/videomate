import React from 'react';
import { Stage, Layer, Text, Rect, Transformer } from 'react-konva';
import { cn } from "@/lib/utils";

interface CanvasProps {
  stageSize: { width: number; height: number };
  stageRef: React.RefObject<any>;
  elements: any[];
  selectedElement: any;
  setSelectedElement: (element: any) => void;
  handleDragEnd: (e: any, id: string) => void;
  handleTransformEnd: (e: any, id: string) => void;
  transformerRef: React.RefObject<any>;
  ImageElement: React.ComponentType<any>;
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
  ImageElement,
}) => (
  <div className={cn(
    "flex-1 bg-muted/50 p-8 overflow-auto",
    "flex items-center justify-center"
  )}>
    <div className={cn(
      "bg-background",
      "shadow-lg overflow-hidden",
    )}>
      <Stage
        width={stageSize.width}
        height={stageSize.height}
        ref={stageRef}
        onMouseDown={e => {
          if (e.target === e.target.getStage()) {
            setSelectedElement(null);
          }
        }}
      >
        <Layer>
          {elements.map((el) => {
            const ElementComponent = el.type === 'text' ? Text : el.type === 'image' ? ImageElement : Rect;
            return (
              <ElementComponent
                key={el.id}
                {...el}
                draggable
                onClick={() => setSelectedElement(el)}
                onDragEnd={(e) => handleDragEnd(e, el.id)}
                onTransformEnd={(e) => handleTransformEnd(e, el.id)}
                stroke={selectedElement && selectedElement.id === el.id ? 'hsl(var(--primary))' : undefined}
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

export default Canvas;