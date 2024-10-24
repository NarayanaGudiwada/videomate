import React from 'react';
import { Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface CollaborationStatusProps {
  connectedUsers: number;
  isConnected: boolean;
}

const CollaborationStatus: React.FC<CollaborationStatusProps> = ({ 
  connectedUsers, 
  isConnected 
}) => {
  return (
    <Badge 
      variant={isConnected ? "default" : "destructive"}
      className="flex items-center space-x-1"
    >
      <Users className="h-3 w-3" />
      <span>{connectedUsers} online</span>
    </Badge>
  );
};

export default CollaborationStatus;
