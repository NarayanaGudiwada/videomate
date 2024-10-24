'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Topbar from '@/app/designer/_components/topbar';
import Canvas from '@/app/designer/_components/canvas';
import Sidebar from '@/app/designer/_components/sidebar';
import Timeline from '@/app/designer/_components/timeline';
import PropertiesPanel from '@/app/designer/_components/properties-panel';
import JsonEditorPanel from '@/app/designer/_components/json-editor-panel';
// import VersionHistoryModal from './_components/version-history-modal'
import { AdSizes } from '@/utils/ad-sizes';
import { ScrollArea } from '@/components/ui/scroll-area';
import ElementsPanel from '@/app/designer/_components/elements-panel';
import { Rect, Circle, Text } from 'react-konva';
import { useCollaboration } from '@/app/contexts/CollaborationContext';
import { useParams } from 'next/navigation';
const AUTO_SAVE_INTERVAL = 5000; // 5 seconds

export default function DesignerPage() {
  const { roomId } = useParams();
  const {
    joinRoom,
    connectedUsers,
    cursors,
    updateElement: collaborationUpdateElement,
    addElement: collaborationAddElement,
    deleteElement: collaborationDeleteElement,
    updateCursor
  } = useCollaboration();

  useEffect(() => {
    if (roomId) {
      joinRoom(roomId as string);
    }
  }, [roomId, joinRoom]);

  // Update cursor position
  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      updateCursor({
        x: e.clientX,
        y: e.clientY
      });
    },
    [updateCursor]
  );

  const [elements, setElements] = useState([]);
  const [selectedElement, setSelectedElement] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [stageSize, setStageSize] = useState(AdSizes['300X250']);
  const [showJson, setShowJson] = useState(false);
  const [showResizeInputs, setShowResizeInputs] = useState(false);
  const [templateName, setTemplateName] = useState('Untitled Template');
  // const [versions, setVersions] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [highlightedElement, setHighlightedElement] = useState(null);

  const stageRef = useRef(null);
  const transformerRef = useRef(null);

  const addElement = (type: string, event: React.MouseEvent | null = null) => {
    let newElement = {
      id: Date.now().toString(),
      name: `New ${type}`,
      type,
      x: 100,
      y: 100,
      width: 100,
      height: 100,
      text: type === 'text' ? 'New Text' : '',
      fill: type === 'shape' ? 'bg-blue' : 'black',
      fontSize: 20,
      fontFamily: 'Arial',
      rotation: 0,
      duration: 5,
      startTime: 0
    };

    if (type === 'image' && event) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new window.Image();
        img.onload = () => {
          const aspect = img.width / img.height;
          newElement = {
            ...newElement,
            width: 200,
            height: 200 / aspect,
            image: e.target.result
          };
          const newElements = [...elements, newElement];
          setElements(newElements);
          addToHistory(newElements);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    } else {
      const newElements = [...elements, newElement];
      setElements(newElements);
      addToHistory(newElements);
    }
  };

  const updateElement = useCallback(
    (id, newProps) => {
      const newElements = elements.map((el) => (el.id === id ? { ...el, ...newProps } : el));
      setElements(newElements);
      addToHistory(newElements);
      if (selectedElement && selectedElement.id === id) {
        setSelectedElement({ ...selectedElement, ...newProps });
      }
    },
    [elements, selectedElement]
  );

  const addToHistory = useCallback(
    (newElements) => {
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(newElements);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    },
    [history, historyIndex]
  );

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setElements(history[newIndex]);
    }
  }, [historyIndex, history]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setElements(history[newIndex]);
    }
  }, [historyIndex, history]);

  const handleImageUpload = useCallback(
    (e) => {
      // Implementation of handleImageUpload function
    },
    [elements, addToHistory]
  );

  const handleVideoUpload = useCallback(
    (e) => {
      // Implementation of handleVideoUpload function
    },
    [elements, addToHistory]
  );

  const saveTemplate = useCallback(() => {
    const template = JSON.stringify(elements);
    const blob = new Blob([template], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'template.json';
    a.click();
  }, [elements]);

  const loadTemplate = useCallback(
    (e) => {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const loadedElements = JSON.parse(event.target.result);
        setElements(loadedElements);
        addToHistory(loadedElements);
      };
      reader.readAsText(file);
    },
    [addToHistory]
  );
  const updateCanvasFromJson = (newJsonContent) => {
    try {
      const newElements = JSON.parse(newJsonContent);
      setElements(newElements);
      addToHistory(newElements);
      setJsonContent(newJsonContent);
    } catch (error) {
      console.error('Invalid JSON:', error);
    }
  };
  const duplicateElement = (id) => {
    const elementToDuplicate = elements.find((el) => el.id === id);
    if (elementToDuplicate) {
      const newElement = {
        ...elementToDuplicate,
        id: Date.now().toString(),
        name: `${elementToDuplicate.name} (Copy)`,
        x: elementToDuplicate.x + 10,
        y: elementToDuplicate.y + 10
      };
      const newElements = [...elements, newElement];
      setElements(newElements);
      addToHistory(newElements);
    }
  };
  const deleteElement = (id) => {
    const newElements = elements.filter((el) => el.id !== id);
    setElements(newElements);
    addToHistory(newElements);
    if (selectedElement && selectedElement.id === id) {
      setSelectedElement(null);
    }
  };
  const toggleJson = useCallback(() => setShowJson(!showJson), [showJson]);
  const toggleResizeInputs = useCallback(
    () => setShowResizeInputs(!showResizeInputs),
    [showResizeInputs]
  );

  // const saveVersion = useCallback(
  //   (isAutoSave = true) => {
  //     // Implementation of saveVersion function
  //   },
  //   [elements, versions]
  // );

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     saveVersion(true);
  //   }, AUTO_SAVE_INTERVAL);
  //   return () => clearInterval(interval);
  // }, [saveVersion]);

  const handleElementSelect = (element) => {
    setSelectedElement(element);
  };

  const handleDragStart = (e) => {
    const id = e.target.id();
    setElements(
      elements.map((el) => {
        return {
          ...el,
          isDragging: el.id === id
        };
      })
    );
  };

  const handleDragEnd = (e) => {
    const id = e.target.id();
    setElements(
      elements.map((el) => {
        return {
          ...el,
          isDragging: false,
          x: el.id === id ? e.target.x() : el.x,
          y: el.id === id ? e.target.y() : el.y
        };
      })
    );
    addToHistory(elements);
  };

  const handleTransformStart = () => {
    setElements(
      elements.map((el) => {
        return {
          ...el,
          isTransforming: el.id === selectedElement?.id
        };
      })
    );
  };

  const handleTransformEnd = (e) => {
    const node = e.target;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    node.scaleX(1);
    node.scaleY(1);

    setElements(
      elements.map((el) => {
        if (el.id === node.id()) {
          return {
            ...el,
            x: node.x(),
            y: node.y(),
            width: node.width() * scaleX,
            height: node.height() * scaleY,
            rotation: node.rotation(),
            isTransforming: false
          };
        }
        return el;
      })
    );
    addToHistory(elements);
  };

  const handleElementUpdate = (id, newProps) => {
    setElements(
      elements.map((el) => {
        if (el.id === id) {
          return { ...el, ...newProps };
        }
        return el;
      })
    );
    addToHistory(elements);
  };

  const checkDeselect = (e) => {
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) {
      setSelectedElement(null);
    }
  };

  // Function to handle keyframe updates
  const updateElementKeyframe = (elementId, time, properties) => {
    setElements((prevElements) =>
      prevElements.map((el) =>
        el.id === elementId
          ? {
              ...el,
              keyframes: {
                ...el.keyframes,
                [time]: { ...el.keyframes?.[time], ...properties }
              }
            }
          : el
      )
    );
    addToHistory(elements);
  };

  // Function to interpolate element properties based on current time
  const interpolateProperties = (element, time) => {
    if (!element.keyframes) return element;

    const keyframeTimes = Object.keys(element.keyframes)
      .map(Number)
      .sort((a, b) => a - b);
    const prevKeyframeTime = keyframeTimes.filter((t) => t <= time).pop() || keyframeTimes[0];
    const nextKeyframeTime =
      keyframeTimes.find((t) => t > time) || keyframeTimes[keyframeTimes.length - 1];

    if (prevKeyframeTime === nextKeyframeTime) {
      return { ...element, ...element.keyframes[prevKeyframeTime] };
    }

    const progress = (time - prevKeyframeTime) / (nextKeyframeTime - prevKeyframeTime);
    const prevProps = element.keyframes[prevKeyframeTime];
    const nextProps = element.keyframes[nextKeyframeTime];

    const interpolatedProps = {};
    for (const prop in prevProps) {
      if (typeof prevProps[prop] === 'number') {
        interpolatedProps[prop] = prevProps[prop] + (nextProps[prop] - prevProps[prop]) * progress;
      } else {
        interpolatedProps[prop] = prevProps[prop];
      }
    }

    return { ...element, ...interpolatedProps };
  };

  // Function to render elements on canvas
  const renderElements = () => {
    return elements.map((el) => {
      const interpolatedElement = interpolateProperties(el, currentTime);
      switch (el.type) {
        case 'rectangle':
          return (
            <Rect
              key={el.id}
              {...interpolatedElement}
              draggable
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onClick={() => handleElementSelect(el)}
            />
          );
        case 'circle':
          return (
            <Circle
              key={el.id}
              {...interpolatedElement}
              draggable
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onClick={() => handleElementSelect(el)}
            />
          );
        case 'text':
          return (
            <Text
              key={el.id}
              {...interpolatedElement}
              draggable
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onClick={() => handleElementSelect(el)}
            />
          );
        // Add cases for other element types (image, video, etc.)
        default:
          return null;
      }
    });
  };

  return (
    <div 
      className="flex flex-col h-screen bg-background text-foreground"
      onMouseMove={handleMouseMove}
    >
      {/* Show connected users */}
      <div className="fixed top-4 right-4 z-50">
        <div className="flex items-center space-x-2">
          {connectedUsers.map((user) => (
            <div
              key={user.id}
              className="h-8 w-8 rounded-full"
              style={{ backgroundColor: user.color }}
              title={user.name}
            />
          ))}
        </div>
      </div>

      {/* Show other users' cursors */}
      {Array.from(cursors.entries()).map(([userId, cursor]) => (
        <Cursor
          key={userId}
          x={cursor.x}
          y={cursor.y}
          color={cursor.color}
          label={connectedUsers.find((user) => user.id === userId)?.name || ''}
        />
      ))}

      <Topbar
        addElement={addElement}
        undo={undo}
        redo={redo}
        historyIndex={historyIndex}
        historyLength={history.length}
        saveTemplate={saveTemplate}
        loadTemplate={loadTemplate}
        toggleJson={toggleJson}
        toggleResizeInputs={toggleResizeInputs}
        showVersionHistory={() => setShowVersionHistory(true)}
        handleImageUpload={handleImageUpload}
        handleVideoUpload={handleVideoUpload}
        initialTemplateName={templateName}
        onTemplateNameChange={setTemplateName}
      />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <div className="flex flex-1 overflow-hidden mt-12">
          <ScrollArea className="border-r border-border h-[65%]">
            <ElementsPanel
              elements={elements}
              selectedElement={selectedElement}
              setSelectedElement={setSelectedElement}
              updateElement={updateElement}
              duplicateElement={duplicateElement}
              deleteElement={deleteElement}
            />
          </ScrollArea>
          {showJson && (
            <ScrollArea className="border-r border-border h-[65%]">
              <JsonEditorPanel
                className="p-4 w-full top-10"
                elements={elements}
                updateCanvasFromJson={updateCanvasFromJson}
                highlightedElement={highlightedElement}
                highlightElement={selectedElement}
                customJsonEditorTheme="vs-dark"
              />
            </ScrollArea>
          )}
          <Canvas
            stageSize={stageSize}
            stageRef={stageRef}
            elements={elements}
            selectedElement={selectedElement}
            setSelectedElement={setSelectedElement}
            handleDragEnd={(e, id) => {
              // Implement handleDragEnd logic
            }}
            handleTransformEnd={(e, id) => {
              // Implement handleTransformEnd logic
            }}
            transformerRef={transformerRef}
            ImageElement={() => null} // Replace with actual ImageElement component if needed
          />
          <ScrollArea className="w-1/4 border-l h-[65%] mt-1">
            <PropertiesPanel selectedElement={selectedElement} updateElement={updateElement} />
          </ScrollArea>
        </div>
        <ScrollArea>
          <Timeline
            elements={elements}
            selectedElement={selectedElement}
            currentTime={currentTime}
            isPlaying={isPlaying}
            setSelectedElement={setSelectedElement}
            setCurrentTime={setCurrentTime}
            playAnimation={() => setIsPlaying(true)}
            pauseAnimation={() => setIsPlaying(false)}
          />
        </ScrollArea>
      </div>
    </div>
  );
}
