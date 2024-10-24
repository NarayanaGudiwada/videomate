'use client';

import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { v4 as uuidv4 } from 'uuid';
import { useProjects } from '@/app/contexts/ProjectsContext';
import { format } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Search, MoreVertical } from 'lucide-react';

export default function Dashboard() {
  const router = useRouter();
  const { user } = useUser();
  const { state, addProject, deleteProject } = useProjects();
  const { projects } = state;

  const handleNewDesign = () => {
    const projectId = uuidv4();
    const newProject = {
      id: projectId,
      name: 'Untitled Project',
      createdAt: new Date(),
      updatedAt: new Date(),
      elements: [],
      stageSize: { width: 300, height: 250 },
      templateName: 'Untitled Template',
      userId: user?.id || '',
    };
    
    addProject(newProject);
    router.push(`/designer/${projectId}`);
  };

  const handleDeleteProject = (projectId: string) => {
    deleteProject(projectId);
  };

  return (
    <div className="flex h-screen bg-background">
      <main className="flex-1 p-6">
        <header className="mb-8 flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold">Your Projects</h1>
            <p className="text-sm text-muted-foreground">
              Create and manage your design projects
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
              <Input className="pl-8" placeholder="Search projects..." />
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                <SelectItem value="recent">Recent</SelectItem>
                <SelectItem value="templates">Templates</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleNewDesign}>
              <Plus className="mr-2 h-4 w-4" /> New Project
            </Button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {/* New Project Card */}
          <button
            onClick={handleNewDesign}
            className="border-2 border-dashed border-muted-foreground/20 rounded-lg p-4 h-48 flex flex-col items-center justify-center hover:border-primary/50 transition-colors"
          >
            <Plus className="h-8 w-8 mb-2" />
            <span>New Project</span>
          </button>

          {/* Project Cards */}
          {projects.map((project) => (
            <div
              key={project.id}
              className="group relative border rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="aspect-video bg-muted mb-2 rounded-md" />
              <h3 className="font-medium truncate">{project.name}</h3>
              <p className="text-sm text-muted-foreground">
                {format(new Date(project.updatedAt), 'MMM d, yyyy')}
              </p>
              <div className="mt-4 flex justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push(`/designer/${project.id}`)}
                >
                  Edit
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Rename</DropdownMenuItem>
                    <DropdownMenuItem>Duplicate</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => handleDeleteProject(project.id)}
                    >
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
