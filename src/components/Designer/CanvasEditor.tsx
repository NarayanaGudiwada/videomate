import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Image } from 'react-konva';
import { Check, X, ArrowLeft, Trash2 } from 'lucide-react';
import useImage from 'use-image';
import { AdSizes } from '../../utils/adSizes';
import LeftSidebar from './ElementsPanel';
import Timeline from './Timeline';
import PropertiesPanel from './PropertiesPanel';
import JsonEditorPanel from './JsonEditorPanel';
import Canvas from './Canvas';
import Toolbar from './Toolbar';
const MAX_AUTO_VERSIONS = 50;
const AUTO_SAVE_INTERVAL = 5000; // 5 seconds

const CanvasEditor = () => {
  const [elements, setElements] = useState([]);
  const [selectedElement, setSelectedElement] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [stageSize, setStageSize] = useState(AdSizes['300X250']);
  const [showJson, setShowJson] = useState(false);
  const [jsonContent, setJsonContent] = useState('');
  const [showResizeInputs, setShowResizeInputs] = useState(false);
  const [customWidth, setCustomWidth] = useState(stageSize.width);
  const [customHeight, setCustomHeight] = useState(stageSize.height);
  const [templateName, setTemplateName] = useState('Untitled Template');
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState('');
  const stageRef = useRef(null);
  const transformerRef = useRef(null);
  const jsonEditorRef = useRef(null);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const animationRef = useRef(null);
  const [clipboard, setClipboard] = useState(null);
  const [versions, setVersions] = useState([]);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const toggleJson = () => setShowJson(!showJson);
  const toggleResizeInputs = () => setShowResizeInputs(!showResizeInputs);

  useEffect(() => {
    const checkDeselect = (e) => {
      if (e.target === e.target.getStage()) {
        setSelectedElement(null);
      }
    };

    const stage = stageRef.current;
    stage.on('click tap', checkDeselect);

    return () => {
      stage.off('click tap', checkDeselect);
    };
  }, []);

  useEffect(() => {
    if (selectedElement && transformerRef.current) {
      transformerRef.current.nodes([stageRef.current.findOne(`#${selectedElement.id}`)]);
      transformerRef.current.getLayer().batchDraw();
    }
  }, [selectedElement]);

  useEffect(() => {
    // Ensure elements is properly stringified
    setJsonContent(JSON.stringify(elements, null, 2));
  }, [elements]);

  const addElement = (type, event = null) => {
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
      startTime: 0,
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
            image: e.target.result,
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

  const handleElementClick = (element) => {
    setSelectedElement(element);
  };

  const updateElement = (id, newProps) => {
    const newElements = elements.map(el => el.id === id ? { ...el, ...newProps } : el);
    setElements(newElements);
    addToHistory(newElements);
    if (selectedElement && selectedElement.id === id) {
      setSelectedElement({ ...selectedElement, ...newProps });
    }
  };

  const addToHistory = (newElements) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newElements);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setElements(history[newIndex]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setElements(history[newIndex]);
    }
  };

  const handleDragEnd = (e, id) => {
    updateElement(id, { x: e.target.x(), y: e.target.y() });
  };

  const handleTransformEnd = (e, id) => {
    const node = e.target;
    updateElement(id, {
      x: node.x(),
      y: node.y(),
      width: node.width() * node.scaleX(),
      height: node.height() * node.scaleY(),
      rotation: node.rotation(),
    });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        const aspect = img.width / img.height;
        const width = 200;
        const height = width / aspect;
        const newElement = {
          id: Date.now().toString(),
          type: 'image',
          x: 100,
          y: 100,
          width,
          height,
          image: event.target.result,
          duration: 5,
          startTime: 0,
        };
        const newElements = [...elements, newElement];
        setElements(newElements);
        addToHistory(newElements);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleVideoUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      const video = document.createElement('video');
      video.onloadedmetadata = () => {
        const newElement = {
          id: Date.now().toString(),
          type: 'video',
          x: 100,
          y: 100,
          width: 200,
          height: 200,
          video: event.target.result,
          duration: 5,
          startTime: 0,
        };
        const newElements = [...elements, newElement];
        setElements(newElements);
        addToHistory(newElements);
      };
      video.src = event.target.result;
      video.load();
    };
    reader.readAsDataURL(file);
  };

  const saveTemplate = () => {
    const template = JSON.stringify(elements);
    const blob = new Blob([template], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'template.json';
    a.click();
  };

  const loadTemplate = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      const loadedElements = JSON.parse(event.target.result);
      setElements(loadedElements);
      addToHistory(loadedElements);
    };
    reader.readAsText(file);
  };

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

  const handleJsonChange = (editor, data, value) => {
    setJsonContent(value);
    try {
      const parsedJson = JSON.parse(value);
      updateCanvasFromJson(parsedJson);
    } catch (error) {
      console.error('Invalid JSON:', error);
    }
  };

  const formatJson = (json) => {
    try {
      return JSON.stringify(JSON.parse(json), null, 2);
    } catch {
      return json;
    }
  };

  const handleResize = () => {
    setStageSize({ width: customWidth, height: customHeight });
    setShowResizeInputs(false);
  };

  const handleNameClick = () => {
    setTempName(templateName);
    setIsEditingName(true);
  };

  const handleNameChange = (e) => {
    setTempName(e.target.value);
  };

  const handleNameSave = () => {
    setTemplateName(tempName);
    setIsEditingName(false);
  };

  const handleNameCancel = () => {
    setIsEditingName(false);
  };

  const handleNameKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleNameSave();
    } else if (e.key === 'Escape') {
      handleNameCancel();
    }
  };

  const ImageElement = ({ src, ...props }) => {
    const [image] = useImage(src);
    return <Image image={image} {...props} />;
  };

  useEffect(() => {
    if (jsonEditorRef.current) {
      const editor = jsonEditorRef.current;
      const selection = window.getSelection();
      const range = document.createRange();

      if (editor.childNodes.length > 0) {
        range.setStart(editor.childNodes[0], cursorPosition);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }
  }, [jsonContent, cursorPosition]);

  const playAnimation = () => {
    setIsPlaying(true);
    animationRef.current = requestAnimationFrame(animate);
  };

  const pauseAnimation = () => {
    setIsPlaying(false);
    cancelAnimationFrame(animationRef.current);
  };

  const animate = (timestamp) => {
    setCurrentTime((prevTime) => {
      const newTime = prevTime + 1 / 60; // Assuming 60 FPS
      return newTime > 10 ? 0 : newTime; // Reset after 10 seconds
    });
    animationRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, []);

  const updateElementKeyframe = (elementId, time, properties) => {
    setElements((prevElements) =>
      prevElements.map((el) =>
        el.id === elementId
          ? {
              ...el,
              keyframes: {
                ...el.keyframes,
                [time]: { ...el.keyframes[time], ...properties },
              },
            }
          : el
      )
    );
  };

  const interpolateProperties = (element, time) => {
    const keyframes = Object.entries(element.keyframes || {}).sort(
      ([a], [b]) => parseFloat(a) - parseFloat(b)
    );

    if (keyframes.length === 0) return element;

    const [prevTime, prevProps] =
      keyframes.find(([t]) => parseFloat(t) > time) || keyframes[keyframes.length - 1];
    const [nextTime, nextProps] =
      keyframes.find(([t]) => parseFloat(t) > time) || keyframes[0];

    const progress =
      (time - parseFloat(prevTime)) / (parseFloat(nextTime) - parseFloat(prevTime));

    const interpolatedProps = {};
    for (const prop in prevProps) {
      if (typeof prevProps[prop] === 'number') {
        interpolatedProps[prop] =
          prevProps[prop] + (nextProps[prop] - prevProps[prop]) * progress;
      } else {
        interpolatedProps[prop] = prevProps[prop];
      }
    }

    return { ...element, ...interpolatedProps };
  };

  const customJsonEditorTheme = {
    background: 'white',
    background_warning: '#FFDADA',
    background_success: '#DAFFD9',
    background_error: '#FFDADA',
    text_color: '#333',
    string_color: '#C41A16',
    number_color: '#1A01CC',
    boolean_color: '#1A01CC',
    null_color: '#808080',
    key_color: '#881391',
    line_numbers: '#888',
    line_numbers_background: '#f0f0f0',
    line_numbers_border: '#ccc',
    border: '#ccc',
  };

  // Function to highlight the selected element in the JSON viewer
  const highlightSelectedElementInJson = (json) => {
    if (!selectedElement) return json;
    
    return json.replace(
      new RegExp(`("id":\\s*"${selectedElement.id}"[^}]+})`, 'g'),
      (match) => `<span style="background-color: #e6f3ff;">${match}</span>`
    );
  };

  const duplicateElement = (id) => {
    const elementToDuplicate = elements.find(el => el.id === id);
    if (elementToDuplicate) {
      const newElement = {
        ...elementToDuplicate,
        id: Date.now().toString(),
        name: `${elementToDuplicate.name} (Copy)`,
        x: elementToDuplicate.x + 10,
        y: elementToDuplicate.y + 10,
      };
      const newElements = [...elements, newElement];
      setElements(newElements);
      addToHistory(newElements);
    }
  };

  const deleteElement = (id) => {
    const newElements = elements.filter(el => el.id !== id);
    setElements(newElements);
    addToHistory(newElements);
    if (selectedElement && selectedElement.id === id) {
      setSelectedElement(null);
    }
  };

  const saveVersion = useCallback((isAutoSave = true) => {
    const isSame = JSON.stringify(elements) === JSON.stringify(versions[versions.length - 1]?.elements);
    if (isSame) return;

    const newVersion = {
      id: Date.now(),
      name: isAutoSave ? `Auto-save ${versions.length + 1}` : `Version ${versions.length + 1}`,
      description: '',
      elements: JSON.parse(JSON.stringify(elements)),
      date: new Date().toLocaleString(),
      isAutoSave,
    };

    setVersions(prevVersions => {
      const updatedVersions = [...prevVersions, newVersion];
      if (isAutoSave && updatedVersions.length > MAX_AUTO_VERSIONS) {
        // Remove the oldest auto-save version
        const oldestAutoSaveIndex = updatedVersions.findIndex(v => v.isAutoSave);
        if (oldestAutoSaveIndex !== -1) {
          updatedVersions.splice(oldestAutoSaveIndex, 1);
        }
      }
      return updatedVersions;
    });
  }, [elements, versions]);

  useEffect(() => {
    const interval = setInterval(() => {
      saveVersion(true);
    }, AUTO_SAVE_INTERVAL);
    return () => clearInterval(interval);
  }, [saveVersion]);

  const loadVersion = (version) => {
    setElements(version.elements);
    addToHistory(version.elements);
    setShowVersionHistory(false);
    setSelectedVersion(null);
  };

  const deleteVersion = (versionId) => {
    setVersions(prevVersions => prevVersions.filter(v => v.id !== versionId));
  };

  const updateVersionName = (versionId, newName) => {
    setVersions(prevVersions =>
      prevVersions.map(v => v.id === versionId ? { ...v, name: newName } : v)
    );
  };

  const updateVersionDescription = (versionId, newDescription) => {
    setVersions(prevVersions =>
      prevVersions.map(v => v.id === versionId ? { ...v, description: newDescription } : v)
    );
  };
  const jsonDiff = (obj1, obj2) => {
    const diff = {};
    for (const key in obj1) {
      if (obj1[key] !== obj2[key]) {
        diff[key] = { from: obj1[key], to: obj2[key] };
      }
    }
    return diff;
  };
  const compareVersions = (version1, version2) => {
    // Implement version comparison logic here
    // This could be a visual diff or a more detailed comparison
    // need to show the diff between the two versions like git diff for the json
    const diff = jsonDiff(version1.elements, version2.elements);

    console.log('Comparing versions:', version1.id, version2.id);
  };

  // Add this new function to sort elements by their z-index or creation order
  const sortElementsByZIndex = (elements) => {
    return [...elements].sort((a, b) => {
      if (a.zIndex !== undefined && b.zIndex !== undefined) {
        return a.zIndex - b.zIndex;
      }
      return elements.indexOf(a) - elements.indexOf(b);
    });
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="bg-gray-100 p-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <button onClick={() => {
              setShowJson(false);
              window.history.back();
            }} className="p-1 text-gray-500 hover:text-gray-700">
              <ArrowLeft size={20} />
            </button>
            {isEditingName ? (
              <>
                <input
                  type="text"
                  value={tempName}
                  onChange={handleNameChange}
                  onKeyDown={handleNameKeyDown}
                  autoFocus
                  className="text-xl font-semibold bg-transparent border-b border-gray-300 focus:outline-none focus:border-blue-500 mr-2"
                />
                <button onClick={handleNameSave} className="p-1 text-green-500 hover:text-green-700">
                  <Check size={20} />
                </button>
                <button onClick={handleNameCancel} className="p-1 text-red-500 hover:text-red-700">
                  <X size={20} />
                </button>
              </>
            ) : (
              
              <h1 
                onClick={handleNameClick} 
                className="text-xl font-semibold cursor-pointer hover:text-blue-500"
              >
                {templateName}
              </h1>
            )}
          </div>
          <Toolbar
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
          />
        </div>
        {showResizeInputs && (
          <div className="flex justify-end gap-2 mb-4">
            <input
              type="number"
              placeholder="Width"
              value={customWidth}
              onChange={(e) => setCustomWidth(Number(e.target.value))}
              className="w-24 p-2 border rounded"
            />
            <input
              type="number"
              placeholder="Height"
              value={customHeight}
              onChange={(e) => setCustomHeight(Number(e.target.value))}
              className="w-24 p-2 border rounded"
            />
            <button onClick={handleResize} className="p-2 bg-blue-500 text-white rounded">
              Resize
            </button>
          </div>
        )}
      </div>
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <LeftSidebar
          elements={elements}
          selectedElement={selectedElement}
          setSelectedElement={setSelectedElement}
          updateElement={updateElement}
          duplicateElement={duplicateElement}
          deleteElement={deleteElement}
        />
        
        {/* Main content area */}
        <div className="flex flex-1 overflow-hidden">
          {showJson && (
            <JsonEditorPanel
              elements={elements}
              updateCanvasFromJson={updateCanvasFromJson}
              highlightSelectedElementInJson={highlightSelectedElementInJson}
              customJsonEditorTheme={customJsonEditorTheme}
            />
          )}
          <Canvas
            stageSize={stageSize}
            stageRef={stageRef}
            elements={elements}
            selectedElement={selectedElement}
            setSelectedElement={setSelectedElement}
            handleDragEnd={handleDragEnd}
            handleTransformEnd={handleTransformEnd}
            transformerRef={transformerRef}
            ImageElement={ImageElement}
          />
          <PropertiesPanel
            selectedElement={selectedElement}
            updateElement={updateElement}
          />
        </div>
      </div>
      <Timeline 
        elements={elements}
        selectedElement={selectedElement}
        currentTime={currentTime}
        isPlaying={isPlaying}
        setSelectedElement={setSelectedElement}
        setCurrentTime={setCurrentTime}
        playAnimation={playAnimation}
        pauseAnimation={pauseAnimation}
      />
      {showVersionHistory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded-lg w-3/4 h-3/4 flex flex-col">
            <h2 className="text-xl font-semibold mb-4">Version History</h2>
            <div className="flex-1 overflow-auto">
              <ul>
                {versions
                  .slice()
                  .sort((a, b) => b.id - a.id)
                  .map((version) => (
                  <li key={version.id} className="mb-2 p-2 border rounded hover:bg-gray-100">
                    <div className="flex justify-between items-center">
                      <input
                        value={version.name}
                        onChange={(e) => updateVersionName(version.id, e.target.value)}
                        className="font-semibold"
                      />
                      <span>{version.date}</span>
                    </div>
                    <textarea
                      value={version.description}
                      onChange={(e) => updateVersionDescription(version.id, e.target.value)}
                      placeholder="Add a description..."
                      className="w-full mt-2"
                    />
                    <div className="mt-2 flex justify-end space-x-2">
                      <button
                        onClick={() => loadVersion(version)}
                        className="px-2 py-1 bg-blue-500 text-white rounded"
                      >
                        Load
                      </button>
                      <button
                        onClick={() => setSelectedVersion(version)}
                        className="px-2 py-1 bg-green-500 text-white rounded"
                      >
                        Compare
                      </button>
                      <button
                        onClick={() => deleteVersion(version.id)}
                        className="px-2 py-1 bg-red-500 text-white rounded"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            {selectedVersion && (
              <div className="mt-4 p-2 border rounded">
                <h3 className="font-semibold">Comparing with: {selectedVersion.name}</h3>
                <button
                  onClick={() => compareVersions(versions[versions.length - 1], selectedVersion)}
                  className="mt-2 px-2 py-1 bg-blue-500 text-white rounded"
                >
                  Show Differences
                </button>
              </div>
            )}
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => {
                  setShowVersionHistory(false);
                  setSelectedVersion(null);
                }}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CanvasEditor;