import type { AppData, Project } from "../types";

function createId(): string {
  return crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function isoOffset(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

function dateOffset(days: number): string {
  return isoOffset(days).slice(0, 10);
}

export function createDemoProject(): Project {
  const now = new Date().toISOString();

  return {
    id: createId(),
    name: "CIFAR10 RF-MIA 复现实验",
    description: "整理实验想法、待办和参考资料，用番茄钟推进每日复现进度。",
    createdAt: now,
    updatedAt: now,
    ideas: [
      {
        id: createId(),
        title: "拆分 smoke 与 full run",
        content: "先用小步 smoke 验证脚本和数据路径，再启动长任务。",
        createdAt: now,
        updatedAt: now,
      },
    ],
    todos: [
      {
        id: createId(),
        title: "检查训练配置",
        description: "确认 batch size、checkpoint 路径和输出目录。",
        status: "in-progress",
        ddl: dateOffset(1),
        expectedFinishTime: isoOffset(1).slice(0, 16),
        priority: "high",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: createId(),
        title: "整理参考论文",
        description: "把核心 baseline 和实现差异记录到 references。",
        status: "todo",
        ddl: dateOffset(3),
        expectedFinishTime: "",
        priority: "medium",
        createdAt: now,
        updatedAt: now,
      },
    ],
    references: [
      {
        id: createId(),
        title: "React 本地状态持久化说明",
        url: "https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage",
        note: "第一版用 localStorage，未来可迁移到 IndexedDB。",
        createdAt: now,
      },
    ],
  };
}

export function withDemoData(data: AppData): AppData {
  return {
    ...data,
    projects: [createDemoProject(), ...data.projects],
  };
}
