import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, Type, Square, Edit2, Copy, Trash2 } from 'lucide-react';

// Updated LeftSidebar component
const LeftSidebar = ({ elements, selectedElement, setSelectedElement, updateElement, copyElement, pasteElement, deleteElement }) => {
    const [editingName, setEditingName] = useState(null);
    const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, elementId: null });
  
    const handleNameChange = (id, newName) => {
      updateElement(id, { name: newName });
      setEditingName(null);
    };
  
    const handleContextMenu = (e, elementId) => {
      e.preventDefault();
      setContextMenu({ visible: true, x: e.clientX, y: e.clientY, elementId });
    };
  
    const handleContextMenuAction = (action) => {
      switch (action) {
        case 'copy':
          copyElement(contextMenu.elementId);
          break;
        case 'paste':
          pasteElement();
          break;
        case 'rename':
          setEditingName(contextMenu.elementId);
          break;
        case 'delete':
          deleteElement(contextMenu.elementId);
          break;
      }
      setContextMenu({ visible: false, x: 0, y: 0, elementId: null });
    };
  
    useEffect(() => {
      const handleClickOutside = () => setContextMenu({ visible: false, x: 0, y: 0, elementId: null });
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }, []);
  
    return (
      <div className="w-64 bg-white border-r border-gray-200 p-4 overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4">Elements</h2>
        <div className="space-y-2">
          {elements.map((el) => (
            <div
              key={el.id}
              className={`flex items-center justify-between p-2 rounded cursor-pointer ${
                selectedElement && selectedElement.id === el.id ? 'bg-blue-100' : 'hover:bg-gray-100'
              }`}
              onClick={() => setSelectedElement(el)}
              onContextMenu={(e) => handleContextMenu(e, el.id)}
            >
              {el.type === 'text' && <Type size={20} className="mr-2" />}
              {el.type === 'shape' && <Square size={20} className="mr-2" />}
              {el.type === 'image' && <ImageIcon size={20} className="mr-2" />}
              {editingName === el.id ? (
                <input
                  type="text"
                  value={el.name}
                  onChange={(e) => updateElement(el.id, { name: e.target.value })}
                  onBlur={() => setEditingName(null)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleNameChange(el.id, e.target.value);
                    }
                  }}
                  autoFocus
                  className="flex-1 px-1 border rounded"
                />
              ) : (
                <span className="flex-1">{el.name || el.type}</span>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingName(el.id);
                }}
                className="p-1 text-gray-500 hover:text-blue-500"
              >
                <Edit2 size={16} />
              </button>
            </div>
          ))}
        </div>
        {contextMenu.visible && (
          <div
            className="absolute bg-white border border-gray-200 shadow-md rounded-md py-2"
            style={{ top: contextMenu.y, left: contextMenu.x }}
          >
            <button className="w-full text-left px-4 py-2 hover:bg-gray-100" onClick={() => handleContextMenuAction('copy')}>
              <Copy size={16} className="inline mr-2" /> Copy
            </button>
            <button className="w-full text-left px-4 py-2 hover:bg-gray-100" onClick={() => handleContextMenuAction('paste')}>
              <Copy size={16} className="inline mr-2" /> Paste
            </button>
            <button className="w-full text-left px-4 py-2 hover:bg-gray-100" onClick={() => handleContextMenuAction('rename')}>
              <Edit2 size={16} className="inline mr-2" /> Rename
            </button>
            <button className="w-full text-left px-4 py-2 hover:bg-gray-100" onClick={() => handleContextMenuAction('delete')}>
              <Trash2 size={16} className="inline mr-2" /> Delete
            </button>
          </div>
        )}
      </div>
    );
  };

export default LeftSidebar;