import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { EmptyState } from "../components/EmptyState";
import { Modal } from "../components/Modal";
import { ProjectCard } from "../components/ProjectCard";
import { ProjectForm } from "../components/ProjectForm";
import { formatDateOnly, formatDateTime, isTodoOverdue } from "../lib/date";
import { useAppStore } from "../stores/AppStoreContext";
import type { Project, ProjectInput, ProjectTodo, TodoPriority } from "../types";

interface DashboardTodoItem {
  projectId: string;
  projectName: string;
  todo: ProjectTodo;
}

const priorityClasses: Record<TodoPriority, string> = {
  low: "bg-slate-100 text-slate-700",
  medium: "bg-sky-50 text-sky-800",
  high: "bg-rose-50 text-rose-800",
};

const statusButtonClasses: Record<"todo" | "in-progress", string> = {
  todo: "border-sky-200 bg-sky-50 text-sky-800 hover:border-sky-300 hover:bg-sky-100",
  "in-progress":
    "border-emerald-200 bg-emerald-50 text-emerald-800 hover:border-emerald-300 hover:bg-emerald-100",
};

function priorityRank(priority: TodoPriority): number {
  if (priority === "high") return 3;
  if (priority === "medium") return 2;
  return 1;
}

function compareDashboardTodos(a: DashboardTodoItem, b: DashboardTodoItem): number {
  const overdueDiff = Number(isTodoOverdue(b.todo)) - Number(isTodoOverdue(a.todo));
  if (overdueDiff !== 0) return overdueDiff;

  const priorityDiff = priorityRank(b.todo.priority) - priorityRank(a.todo.priority);
  if (priorityDiff !== 0) return priorityDiff;

  const aDdl = a.todo.ddl || "9999-12-31";
  const bDdl = b.todo.ddl || "9999-12-31";
  const ddlDiff = aDdl.localeCompare(bDdl);
  if (ddlDiff !== 0) return ddlDiff;

  return a.todo.title.localeCompare(b.todo.title);
}

function collectDashboardTodos(
  projects: Project[],
  status: ProjectTodo["status"],
): DashboardTodoItem[] {
  return projects
    .flatMap((project) =>
      project.todos
        .filter((todo) => todo.status === status)
        .map((todo) => ({
          projectId: project.id,
          projectName: project.name,
          todo,
        })),
    )
    .sort(compareDashboardTodos);
}

export function DashboardPage() {
  const navigate = useNavigate();
  const { projects, createProject, addDemoProject, cycleTodoStatus } = useAppStore();
  const [isProjectModalOpen, setProjectModalOpen] = useState(false);
  const inProgressTodos = useMemo(
    () => collectDashboardTodos(projects, "in-progress"),
    [projects],
  );
  const todoTodos = useMemo(
    () => collectDashboardTodos(projects, "todo"),
    [projects],
  );

  function handleCreateProject(input: ProjectInput) {
    const projectId = createProject(input);
    setProjectModalOpen(false);
    navigate(`/projects/${projectId}`);
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)]">
      <div className="space-y-4">
        <TaskLane
          title="In Progress"
          eyebrow="Active Work"
          countLabel={`${inProgressTodos.length} active`}
          emptyText="还没有 in-progress todo。点击 Todo 里的状态按钮即可开始推进。"
          items={inProgressTodos}
          onCycleStatus={cycleTodoStatus}
        />
        <TaskLane
          title="Todo"
          eyebrow="Waiting"
          countLabel={`${todoTodos.length} waiting`}
          emptyText="还没有待开始 todo。进入项目详情页新增任务后会显示在这里。"
          items={todoTodos}
          onCycleStatus={cycleTodoStatus}
        />
      </div>

      <section
        id="projects"
        className="rounded-xl border border-slate-200 bg-white shadow-sm"
      >
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              Projects
            </p>
            <h2 className="mt-1 text-lg font-bold text-slate-950">所有项目</h2>
          </div>
          <button
            className="btn btn-primary px-3 py-2 text-xs"
            type="button"
            onClick={() => setProjectModalOpen(true)}
          >
            创建项目
          </button>
        </div>

        {projects.length === 0 ? (
          <div className="p-4">
            <EmptyState
              title="还没有项目"
              description="创建第一个项目后，你可以在详情页记录 ideas、todo list 和 references。也可以先加载一份 demo 数据检查交互。"
              actionLabel="创建第一个项目"
              onAction={() => setProjectModalOpen(true)}
              secondaryLabel="加载 demo 项目"
              onSecondaryAction={addDemoProject}
            />
          </div>
        ) : (
          <div className="grid max-h-[calc(100vh-18rem)] gap-3 overflow-y-auto p-3 md:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </section>

      {isProjectModalOpen && (
        <Modal title="创建项目" onClose={() => setProjectModalOpen(false)}>
          <ProjectForm
            onSubmit={handleCreateProject}
            onCancel={() => setProjectModalOpen(false)}
          />
        </Modal>
      )}
    </div>
  );
}

function TaskLane({
  title,
  eyebrow,
  countLabel,
  emptyText,
  items,
  onCycleStatus,
}: {
  title: string;
  eyebrow: string;
  countLabel: string;
  emptyText: string;
  items: DashboardTodoItem[];
  onCycleStatus: (projectId: string, todoId: string) => void;
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-teal-700">
            {eyebrow}
          </p>
          <h2 className="mt-1 text-lg font-bold text-slate-950">{title}</h2>
        </div>
        <p className="text-xs font-bold text-slate-500">{countLabel}</p>
      </div>

      {items.length === 0 ? (
        <div className="m-3 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm text-slate-600">
          {emptyText}
        </div>
      ) : (
        <div className="grid max-h-[28vh] gap-2 overflow-y-auto p-3">
          {items.map((item) => (
            <DashboardTodoCard
              key={`${item.projectId}-${item.todo.id}`}
              item={item}
              onCycleStatus={onCycleStatus}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function DashboardTodoCard({
  item,
  onCycleStatus,
}: {
  item: DashboardTodoItem;
  onCycleStatus: (projectId: string, todoId: string) => void;
}) {
  const overdue = isTodoOverdue(item.todo);
  const nextStatus = item.todo.status === "todo" ? "in-progress" : "done";

  return (
    <article
      className={`grid gap-3 rounded-lg border p-3 shadow-sm transition ${
        overdue ? "border-rose-300 bg-rose-50" : "border-slate-200 bg-white"
      }`}
    >
      <div className="grid gap-3 sm:grid-cols-[112px_minmax(0,1fr)_auto] sm:items-center">
        <button
          className={`rounded-full border px-3 py-2 text-xs font-bold transition ${
            statusButtonClasses[item.todo.status as "todo" | "in-progress"]
          }`}
          type="button"
          onClick={() => onCycleStatus(item.projectId, item.todo.id)}
          aria-label={`Move ${item.todo.title} to ${nextStatus}`}
          title={`Next: ${nextStatus}`}
        >
          {item.todo.status}
        </button>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="min-w-0 truncate text-sm font-bold text-slate-950">
              {item.todo.title}
            </h3>
            <span
              className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${priorityClasses[item.todo.priority]}`}
            >
              {item.todo.priority}
            </span>
            {overdue && (
              <span className="rounded-full bg-rose-600 px-2 py-0.5 text-[11px] font-bold text-white">
                DDL 已过期
              </span>
            )}
          </div>
          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs font-semibold text-slate-500">
            <span className="text-teal-700">{item.projectName}</span>
            <span>DDL: {formatDateOnly(item.todo.ddl)}</span>
            <span>Expected: {formatDateTime(item.todo.expectedFinishTime)}</span>
          </div>
          {item.todo.description && (
            <p className="mt-1 line-clamp-1 text-xs leading-5 text-slate-600">
              {item.todo.description}
            </p>
          )}
        </div>

        <Link
          className="text-xs font-bold text-teal-700 transition hover:text-teal-900"
          to={`/projects/${item.projectId}`}
        >
          查看项目
        </Link>
      </div>
    </article>
  );
}
