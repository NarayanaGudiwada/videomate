import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Copy, Check, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useParams } from 'next/navigation';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose }) => {
  const params = useParams();
  const projectId = params?.projectId as string;
  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState('');
  const { toast } = useToast();

  const collaborationLink = `${window.location.origin}/designer/${projectId}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(collaborationLink);
      setCopied(true);
      toast({
        title: "Link copied!",
        description: "The collaboration link has been copied to your clipboard.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please try copying the link manually.",
        variant: "destructive",
      });
    }
  };

  const inviteByEmail = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement your email invitation logic here
    toast({
      title: "Invitation sent!",
      description: `An invitation has been sent to ${email}`,
    });
    setEmail('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Project</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          {/* Collaboration Link */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Collaboration Link</label>
            <div className="flex items-center space-x-2">
              <Input
                readOnly
                value={collaborationLink}
                className="flex-1"
              />
              <Button 
                size="icon"
                onClick={copyToClipboard}
                className="shrink-0"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Invite by Email */}
          <form onSubmit={inviteByEmail} className="space-y-2">
            <label className="text-sm font-medium">Invite by Email</label>
            <div className="flex items-center space-x-2">
              <Input
                type="email"
                placeholder="colleague@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" className="shrink-0">
                Invite
              </Button>
            </div>
          </form>

          {/* Active Collaborators */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Active Collaborators</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {/* Add your collaborator avatars/badges here */}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareModal;
