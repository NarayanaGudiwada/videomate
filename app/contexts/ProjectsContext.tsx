'use client';

import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';

interface Element {
  id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  [key: string]: any;
}

interface Project {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  elements: Element[];
  stageSize: {
    width: number;
    height: number;
  };
  templateName: string;
  userId: string;
  collaborators?: string[];
}

interface ProjectsState {
  projects: Project[];
  currentProject: Project | null;
  isLoading: boolean;
  error: string | null;
}

type ProjectsAction =
  | { type: 'SET_PROJECTS'; payload: Project[] }
  | { type: 'ADD_PROJECT'; payload: Project }
  | { type: 'UPDATE_PROJECT'; payload: { id: string; updates: Partial<Project> } }
  | { type: 'DELETE_PROJECT'; payload: string }
  | { type: 'SET_CURRENT_PROJECT'; payload: Project | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

const ProjectsContext = createContext<{
  state: ProjectsState;
  addProject: (project: Project) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  setCurrentProject: (project: Project | null) => void;
  getProject: (id: string) => Project | undefined;
} | null>(null);

const initialState: ProjectsState = {
  projects: [],
  currentProject: null,
  isLoading: false,
  error: null
};

function projectsReducer(state: ProjectsState, action: ProjectsAction): ProjectsState {
  switch (action.type) {
    case 'SET_PROJECTS':
      return { ...state, projects: action.payload };
    case 'ADD_PROJECT':
      return { ...state, projects: [...state.projects, action.payload] };
    case 'UPDATE_PROJECT':
      return {
        ...state,
        projects: state.projects.map((project) =>
          project.id === action.payload.id
            ? { ...project, ...action.payload.updates, updatedAt: new Date() }
            : project
        )
      };
    case 'DELETE_PROJECT':
      return {
        ...state,
        projects: state.projects.filter((project) => project.id !== action.payload)
      };
    case 'SET_CURRENT_PROJECT':
      return { ...state, currentProject: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    default:
      return state;
  }
}

export function ProjectsProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(projectsReducer, initialState);
  const { user } = useUser();

  const addProject = useCallback((project: Project) => {
    dispatch({ type: 'ADD_PROJECT', payload: project });
  }, []);

  const updateProject = useCallback((id: string, updates: Partial<Project>) => {
    dispatch({ type: 'UPDATE_PROJECT', payload: { id, updates } });
  }, []);

  const deleteProject = useCallback((id: string) => {
    dispatch({ type: 'DELETE_PROJECT', payload: id });
  }, []);

  const setCurrentProject = useCallback((project: Project | null) => {
    dispatch({ type: 'SET_CURRENT_PROJECT', payload: project });
  }, []);

  const getProject = useCallback(
    (id: string) => {
      return state.projects.find((project) => project.id === id);
    },
    [state.projects]
  );

  const value = {
    state,
    addProject,
    updateProject,
    deleteProject,
    setCurrentProject,
    getProject
  };

  return <ProjectsContext.Provider value={value}>{children}</ProjectsContext.Provider>;
}

export function useProjects() {
  const context = useContext(ProjectsContext);
  if (!context) {
    throw new Error('useProjects must be used within a ProjectsProvider');
  }
  return context;
}
