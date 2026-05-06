export type TimerMode = "focus" | "short-break" | "long-break";

export type TimerStatus = "idle" | "running" | "paused";

export interface TimerSettings {
  focusMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
}

export interface DailyFocusCount {
  date: string;
  count: number;
}

export type FocusHistory = Record<string, number>;

export type TodoStatus = "todo" | "in-progress" | "done";

export type TodoPriority = "low" | "medium" | "high";

export interface Idea {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectTodo {
  id: string;
  title: string;
  description: string;
  status: TodoStatus;
  ddl: string;
  expectedFinishTime: string;
  priority: TodoPriority;
  createdAt: string;
  updatedAt: string;
}

export interface ReferenceItem {
  id: string;
  title: string;
  url: string;
  note: string;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  ideas: Idea[];
  todos: ProjectTodo[];
  references: ReferenceItem[];
  createdAt: string;
  updatedAt: string;
}

export interface AppData {
  projects: Project[];
  timerSettings: TimerSettings;
  dailyFocusCount: DailyFocusCount;
  focusHistory: FocusHistory;
}

export type ProjectInput = Pick<Project, "name" | "description">;

export type IdeaInput = Pick<Idea, "title" | "content">;

export type TodoInput = Pick<
  ProjectTodo,
  "title" | "description" | "status" | "ddl" | "expectedFinishTime" | "priority"
>;

export type ReferenceInput = Pick<ReferenceItem, "title" | "url" | "note">;
