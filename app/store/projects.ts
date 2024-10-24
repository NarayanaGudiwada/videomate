import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Project } from '@/app/types';

interface ProjectsState {
  projects: Project[];
  currentProject: Project | null;
  addProject: (project: Project) => void;
  updateProject: (projectId: string, updates: Partial<Project>) => void;
  deleteProject: (projectId: string) => void;
  setCurrentProject: (project: Project | null) => void;
  getProject: (projectId: string) => Project | undefined;
}

export const useProjectsStore = create<ProjectsState>()(
  persist(
    (set, get) => ({
      projects: [],
      currentProject: null,
      addProject: (project) =>
        set((state) => ({
          projects: [...state.projects, project]
        })),
      updateProject: (projectId, updates) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId ? { ...p, ...updates, updatedAt: new Date() } : p
          )
        })),
      deleteProject: (projectId) =>
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== projectId)
        })),
      setCurrentProject: (project) =>
        set({ currentProject: project }),
      getProject: (projectId) => {
        const { projects } = get();
        return projects.find((p) => p.id === projectId);
      }
    }),
    {
      name: 'projects-storage'
    }
  )
);
