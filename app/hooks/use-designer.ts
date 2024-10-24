import { useState, useCallback } from 'react';
import { Element } from '@/app/types/designer';
import { useProjects } from '@/app/contexts/ProjectsContext';

export function useDesigner(projectId: string) {
  const { updateProject } = useProjects();
  const [elements, setElements] = useState<Element[]>([]);
  const [selectedElement, setSelectedElement] = useState<Element | null>(null);

  const handleElementSelect = useCallback((element: Element | null) => {
    setSelectedElement(element);
  }, []);

  const handleElementUpdate = useCallback((updatedElement: Element) => {
    setElements(prev => 
      prev.map(el => el.id === updatedElement.id ? updatedElement : el)
    );
  }, []);

  const handleElementAdd = useCallback((newElement: Element) => {
    setElements(prev => [...prev, newElement]);
  }, []);

  const handleElementDelete = useCallback((elementId: string) => {
    setElements(prev => prev.filter(el => el.id !== elementId));
  }, []);

  const handleSave = useCallback(async () => {
    if (!projectId) return;
    
    try {
      await updateProject(projectId, {
        elements,
        lastModified: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to save project:', error);
      throw error;
    }
  }, [projectId, elements, updateProject]);

  const handleExport = useCallback(async () => {
    // Implement export logic
    console.log('Exporting project...');
  }, []);

  const handleTemplateNameChange = useCallback((newName: string) => {
    // Implement template name change logic
    console.log('Changing template name to:', newName);
  }, []);

  return {
    elements,
    setElements,
    selectedElement,
    setSelectedElement,
    handleElementSelect,
    handleElementUpdate,
    handleElementAdd,
    handleElementDelete,
    handleSave,
    handleExport,
    handleTemplateNameChange
  };
}
