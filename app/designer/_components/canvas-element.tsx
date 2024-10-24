import React, { useEffect, useRef } from 'react';
import { Rect, Circle, Text, Transformer, Group, Image } from 'react-konva';
import { KonvaEventObject } from 'konva/lib/Node';

interface BaseElement {
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

interface CanvasElementProps {
  element: BaseElement;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (newAttrs: Partial<BaseElement>) => void;
}

const CanvasElement: React.FC<CanvasElementProps> = ({
  element,
  isSelected,
  onSelect,
  onChange
}) => {
  const shapeRef = useRef<any>(null);
  const transformerRef = useRef<any>(null);

  useEffect(() => {
    if (isSelected && transformerRef.current && shapeRef.current) {
      transformerRef.current.nodes([shapeRef.current]);
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  const handleDragEnd = (e: KonvaEventObject<DragEvent>) => {
    onChange({
      x: e.target.x(),
      y: e.target.y()
    });
  };

  const handleTransformEnd = () => {
    if (!shapeRef.current) return;

    const node = shapeRef.current;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    // Reset scale to 1 to avoid accumulating transforms
    node.scaleX(1);
    node.scaleY(1);

    onChange({
      x: node.x(),
      y: node.y(),
      width: Math.max(5, node.width() * scaleX),
      height: Math.max(5, node.height() * scaleY),
      rotation: node.rotation()
    });
  };

  const commonProps = {
    ref: shapeRef,
    draggable: true,
    onClick: onSelect,
    onTap: onSelect,
    onDragEnd: handleDragEnd,
    onTransformEnd: handleTransformEnd,
    ...element
  };

  const renderShape = () => {
    switch (element.type) {
      case 'rectangle':
        return <Rect {...commonProps} />;
      case 'circle':
        return <Circle {...commonProps} />;
      case 'text':
        return <Text {...commonProps} />;
      case 'image':
        return <Image {...commonProps} />;
      default:
        return <Rect {...commonProps} />;
    }
  };

  return (
    <>
      {renderShape()}
      {isSelected && (
        <Transformer
          ref={transformerRef}
          boundBoxFunc={(oldBox, newBox) => {
            // Limit resize
            const minSize = 5;
            const maxSize = Math.max(stageSize.width, stageSize.height);
            
            if (
              newBox.width < minSize ||
              newBox.height < minSize ||
              newBox.width > maxSize ||
              newBox.height > maxSize
            ) {
              return oldBox;
            }
            return newBox;
          }}
          rotateEnabled={true}
          enabledAnchors={[
            'top-left',
            'top-center',
            'top-right',
            'middle-right',
            'middle-left',
            'bottom-left',
            'bottom-center',
            'bottom-right'
          ]}
        />
      )}
    </>
  );
};

export default CanvasElement;
