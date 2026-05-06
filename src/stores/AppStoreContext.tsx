import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { todayKey } from "../lib/date";
import { createDemoProject } from "../lib/demoData";
import { loadAppData, saveAppData } from "../lib/storage";
import type {
  AppData,
  IdeaInput,
  Project,
  ProjectInput,
  ReferenceInput,
  TimerSettings,
  TodoStatus,
  TodoInput,
} from "../types";

interface AppStoreValue {
  data: AppData;
  projects: Project[];
  createProject: (input: ProjectInput) => string;
  updateProject: (projectId: string, input: ProjectInput) => void;
  deleteProject: (projectId: string) => void;
  addIdea: (projectId: string, input: IdeaInput) => void;
  updateIdea: (projectId: string, ideaId: string, input: IdeaInput) => void;
  deleteIdea: (projectId: string, ideaId: string) => void;
  addTodo: (projectId: string, input: TodoInput) => void;
  updateTodo: (projectId: string, todoId: string, input: TodoInput) => void;
  deleteTodo: (projectId: string, todoId: string) => void;
  cycleTodoStatus: (projectId: string, todoId: string) => void;
  addReference: (projectId: string, input: ReferenceInput) => void;
  updateReference: (projectId: string, referenceId: string, input: ReferenceInput) => void;
  deleteReference: (projectId: string, referenceId: string) => void;
  updateTimerSettings: (settings: TimerSettings) => void;
  incrementFocusSession: () => void;
  addDemoProject: () => void;
}

const AppStoreContext = createContext<AppStoreValue | null>(null);

function createId(): string {
  return crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function touchProject(project: Project): Project {
  return {
    ...project,
    updatedAt: new Date().toISOString(),
  };
}

function updateProjectById(
  data: AppData,
  projectId: string,
  updater: (project: Project) => Project,
): AppData {
  return {
    ...data,
    projects: data.projects.map((project) =>
      project.id === projectId ? touchProject(updater(project)) : project,
    ),
  };
}

function nextTodoStatus(status: TodoStatus): TodoStatus {
  if (status === "todo") return "in-progress";
  if (status === "in-progress") return "done";
  return "todo";
}

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(() => loadAppData());

  useEffect(() => {
    saveAppData(data);
  }, [data]);

  const createProject = useCallback((input: ProjectInput) => {
    const now = new Date().toISOString();
    const project: Project = {
      id: createId(),
      name: input.name.trim(),
      description: input.description.trim(),
      ideas: [],
      todos: [],
      references: [],
      createdAt: now,
      updatedAt: now,
    };

    setData((current) => ({
      ...current,
      projects: [project, ...current.projects],
    }));

    return project.id;
  }, []);

  const updateProject = useCallback((projectId: string, input: ProjectInput) => {
    setData((current) =>
      updateProjectById(current, projectId, (project) => ({
        ...project,
        name: input.name.trim(),
        description: input.description.trim(),
      })),
    );
  }, []);

  const deleteProject = useCallback((projectId: string) => {
    setData((current) => ({
      ...current,
      projects: current.projects.filter((project) => project.id !== projectId),
    }));
  }, []);

  const addIdea = useCallback((projectId: string, input: IdeaInput) => {
    const now = new Date().toISOString();
    setData((current) =>
      updateProjectById(current, projectId, (project) => ({
        ...project,
        ideas: [
          {
            id: createId(),
            title: input.title.trim(),
            content: input.content.trim(),
            createdAt: now,
            updatedAt: now,
          },
          ...project.ideas,
        ],
      })),
    );
  }, []);

  const updateIdea = useCallback((projectId: string, ideaId: string, input: IdeaInput) => {
    setData((current) =>
      updateProjectById(current, projectId, (project) => ({
        ...project,
        ideas: project.ideas.map((idea) =>
          idea.id === ideaId
            ? {
                ...idea,
                title: input.title.trim(),
                content: input.content.trim(),
                updatedAt: new Date().toISOString(),
              }
            : idea,
        ),
      })),
    );
  }, []);

  const deleteIdea = useCallback((projectId: string, ideaId: string) => {
    setData((current) =>
      updateProjectById(current, projectId, (project) => ({
        ...project,
        ideas: project.ideas.filter((idea) => idea.id !== ideaId),
      })),
    );
  }, []);

  const addTodo = useCallback((projectId: string, input: TodoInput) => {
    const now = new Date().toISOString();
    setData((current) =>
      updateProjectById(current, projectId, (project) => ({
        ...project,
        todos: [
          {
            id: createId(),
            title: input.title.trim(),
            description: input.description.trim(),
            status: input.status,
            ddl: input.ddl,
            expectedFinishTime: input.expectedFinishTime,
            priority: input.priority,
            createdAt: now,
            updatedAt: now,
          },
          ...project.todos,
        ],
      })),
    );
  }, []);

  const updateTodo = useCallback((projectId: string, todoId: string, input: TodoInput) => {
    setData((current) =>
      updateProjectById(current, projectId, (project) => ({
        ...project,
        todos: project.todos.map((todo) =>
          todo.id === todoId
            ? {
                ...todo,
                title: input.title.trim(),
                description: input.description.trim(),
                status: input.status,
                ddl: input.ddl,
                expectedFinishTime: input.expectedFinishTime,
                priority: input.priority,
                updatedAt: new Date().toISOString(),
              }
            : todo,
        ),
      })),
    );
  }, []);

  const deleteTodo = useCallback((projectId: string, todoId: string) => {
    setData((current) =>
      updateProjectById(current, projectId, (project) => ({
        ...project,
        todos: project.todos.filter((todo) => todo.id !== todoId),
      })),
    );
  }, []);

  const cycleTodoStatus = useCallback((projectId: string, todoId: string) => {
    setData((current) =>
      updateProjectById(current, projectId, (project) => ({
        ...project,
        todos: project.todos.map((todo) =>
          todo.id === todoId
            ? {
                ...todo,
                status: nextTodoStatus(todo.status),
                updatedAt: new Date().toISOString(),
              }
            : todo,
        ),
      })),
    );
  }, []);

  const addReference = useCallback((projectId: string, input: ReferenceInput) => {
    const now = new Date().toISOString();
    setData((current) =>
      updateProjectById(current, projectId, (project) => ({
        ...project,
        references: [
          {
            id: createId(),
            title: input.title.trim(),
            url: input.url.trim(),
            note: input.note.trim(),
            createdAt: now,
          },
          ...project.references,
        ],
      })),
    );
  }, []);

  const updateReference = useCallback(
    (projectId: string, referenceId: string, input: ReferenceInput) => {
      setData((current) =>
        updateProjectById(current, projectId, (project) => ({
          ...project,
          references: project.references.map((reference) =>
            reference.id === referenceId
              ? {
                  ...reference,
                  title: input.title.trim(),
                  url: input.url.trim(),
                  note: input.note.trim(),
                }
              : reference,
          ),
        })),
      );
    },
    [],
  );

  const deleteReference = useCallback((projectId: string, referenceId: string) => {
    setData((current) =>
      updateProjectById(current, projectId, (project) => ({
        ...project,
        references: project.references.filter((reference) => reference.id !== referenceId),
      })),
    );
  }, []);

  const updateTimerSettings = useCallback((settings: TimerSettings) => {
    setData((current) => ({
      ...current,
      timerSettings: {
        focusMinutes: Math.max(1, settings.focusMinutes),
        shortBreakMinutes: Math.max(1, settings.shortBreakMinutes),
        longBreakMinutes: Math.max(1, settings.longBreakMinutes),
      },
    }));
  }, []);

  const incrementFocusSession = useCallback(() => {
    setData((current) => {
      const today = todayKey();
      const currentCount = Math.max(
        current.focusHistory[today] ?? 0,
        current.dailyFocusCount.date === today ? current.dailyFocusCount.count : 0,
      );
      const nextCount = currentCount + 1;

      return {
        ...current,
        dailyFocusCount: {
          date: today,
          count: nextCount,
        },
        focusHistory: {
          ...current.focusHistory,
          [today]: nextCount,
        },
      };
    });
  }, []);

  const addDemoProject = useCallback(() => {
    setData((current) => ({
      ...current,
      projects: [createDemoProject(), ...current.projects],
    }));
  }, []);

  const value = useMemo<AppStoreValue>(
    () => ({
      data,
      projects: data.projects,
      createProject,
      updateProject,
      deleteProject,
      addIdea,
      updateIdea,
      deleteIdea,
      addTodo,
      updateTodo,
      deleteTodo,
      cycleTodoStatus,
      addReference,
      updateReference,
      deleteReference,
      updateTimerSettings,
      incrementFocusSession,
      addDemoProject,
    }),
    [
      addDemoProject,
      addIdea,
      addReference,
      addTodo,
      createProject,
      data,
      deleteIdea,
      deleteProject,
      deleteReference,
      deleteTodo,
      incrementFocusSession,
      cycleTodoStatus,
      updateIdea,
      updateProject,
      updateReference,
      updateTimerSettings,
      updateTodo,
    ],
  );

  return <AppStoreContext.Provider value={value}>{children}</AppStoreContext.Provider>;
}

export function useAppStore(): AppStoreValue {
  const value = useContext(AppStoreContext);
  if (!value) {
    throw new Error("useAppStore must be used inside AppStoreProvider");
  }
  return value;
}
