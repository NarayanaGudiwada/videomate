import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface Collaborator {
  id: string;
  name: string;
  image?: string;
  color: string;
  isActive: boolean;
}

interface CollaboratorsListProps {
  collaborators: Collaborator[];
}

const CollaboratorsList: React.FC<CollaboratorsListProps> = ({ collaborators }) => {
  return (
    <div className="flex -space-x-2">
      {collaborators.map((collaborator) => (
        <Tooltip key={collaborator.id}>
          <TooltipTrigger>
            <div className="relative">
              <Avatar className="h-8 w-8 border-2 border-background">
                <AvatarImage src={collaborator.image} />
                <AvatarFallback 
                  style={{ backgroundColor: collaborator.color }}
                  className="text-white"
                >
                  {collaborator.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {collaborator.isActive && (
                <span 
                  className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-white"
                />
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{collaborator.name}</p>
            <p className="text-xs text-muted-foreground">
              {collaborator.isActive ? 'Active now' : 'Offline'}
            </p>
          </TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
};

export default CollaboratorsList;
