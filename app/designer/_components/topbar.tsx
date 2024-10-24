'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowLeft,
  Check,
  X,
  Type,
  Square,
  ImageIcon,
  Video,
  Undo,
  Redo,
  FileJson,
  Upload,
  Braces,
  Maximize2,
  TimerReset,
  Share2,
  UserPlus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import ShareModal from './share-modal';

interface TopbarProps {
  addElement: (type: string, event?: React.ChangeEvent<HTMLInputElement> | null) => void;
  undo: () => void;
  redo: () => void;
  historyIndex: number;
  historyLength: number;
  saveTemplate: () => void;
  loadTemplate: (event: React.ChangeEvent<HTMLInputElement>) => void;
  toggleJson: () => void;
  toggleResizeInputs: () => void;
  showVersionHistory: () => void;
  handleImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleVideoUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  initialTemplateName: string;
  onTemplateNameChange: (newName: string) => void;
  projectId: string;
}

const Topbar: React.FC<TopbarProps> = ({
  addElement,
  undo,
  redo,
  saveTemplate,
  toggleJson,
  toggleResizeInputs,
  showVersionHistory,
  handleImageUpload,
  handleVideoUpload,
  initialTemplateName,
  onTemplateNameChange,
  projectId
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(initialTemplateName);
  const nameRef = useRef<HTMLInputElement>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  useEffect(() => {
    if (isEditingName && nameRef.current) {
      nameRef.current.focus();
      nameRef.current.select();
    }
  }, [isEditingName]);

  const handleNameClick = () => {
    setIsEditingName(true);
    setTempName(initialTemplateName);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTempName(e.target.value);
  };

  const handleNameSave = () => {
    onTemplateNameChange(tempName);
    setIsEditingName(false);
  };

  const handleNameCancel = () => {
    setIsEditingName(false);
    setTempName(initialTemplateName);
  };

  const handleNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleNameSave();
    } else if (e.key === 'Escape') {
      handleNameCancel();
    }
  };

  return (
    <TooltipProvider>
      <div className="fixed top-0 left-[40px] right-0 z-10 flex items-center justify-between gap-2 p-2 bg-white text-black border-b border-border">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          {isEditingName ? (
            <div className="flex items-center">
              <input
                ref={nameRef}
                type="text"
                value={tempName}
                onChange={handleNameChange}
                onKeyDown={handleNameKeyDown}
                className="text-xl font-semibold bg-transparent border-b border-primary focus:outline-none"
              />
              <Button variant="ghost" size="icon" onClick={handleNameSave} className="ml-2">
                <Check className="h-4 w-4 text-green-500" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleNameCancel}>
                <X className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          ) : (
            <h1
              onClick={handleNameClick}
              className="text-xl font-semibold cursor-pointer transition-colors duration-200 hover:text-primary">
              {initialTemplateName}
            </h1>
          )}
        </div>

        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => addElement('text')}
                className="bg-primary hover:bg-primary/80 text-white">
                <Type className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Add Text</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => addElement('shape')}
                className="bg-primary hover:bg-primary/80 text-white">
                <Square className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Add Shape</TooltipContent>
          </Tooltip>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="bg-primary hover:bg-primary/80 text-white">
                <Upload className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>
                <label className="flex items-center cursor-pointer">
                  <ImageIcon className="mr-2 h-4 w-4" />
                  <span>Upload Image</span>
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleImageUpload}
                    accept="image/*"
                  />
                </label>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <label className="flex items-center cursor-pointer">
                  <Video className="mr-2 h-4 w-4" />
                  <span>Upload Video</span>
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleVideoUpload}
                    accept="video/*"
                  />
                </label>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={undo}
                className="bg-primary hover:bg-primary/80 text-white">
                <Undo className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Undo</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={redo}
                className="bg-primary hover:bg-primary/80 text-white">
                <Redo className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Redo</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={saveTemplate}
                className="bg-primary hover:bg-primary/80 text-white">
                <FileJson className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Save Template</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleJson}
                className="bg-primary hover:bg-primary/80 text-white">
                <Braces className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Toggle JSON</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleResizeInputs}
                className="bg-primary hover:bg-primary/80 text-white">
                <Maximize2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Toggle Resize Inputs</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={showVersionHistory}
                className="bg-primary hover:bg-primary/80 text-white">
                <TimerReset className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Show Version History</TooltipContent>
          </Tooltip>

          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              className="flex items-center space-x-2"
              onClick={() => setIsShareModalOpen(true)}
            >
              <UserPlus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <ShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          projectId={projectId}
        />
      </div>
    </TooltipProvider>
  );
};

export default Topbar;
