import { useMemo, useState, type ReactNode } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { EmptyState } from "../components/EmptyState";
import { IdeaForm } from "../components/IdeaForm";
import { Modal } from "../components/Modal";
import { ProjectForm } from "../components/ProjectForm";
import { ReferenceForm } from "../components/ReferenceForm";
import { TodoForm } from "../components/TodoForm";
import { formatDateOnly, formatDateTime, isTodoOverdue } from "../lib/date";
import { useAppStore } from "../stores/AppStoreContext";
import type { Idea, ProjectTodo, ReferenceItem, TodoStatus } from "../types";

type ActiveStatusFilter = "all" | Exclude<TodoStatus, "done">;
type SortMode = "ddl-asc" | "ddl-desc" | "updated-desc";

const priorityClasses = {
  low: "bg-slate-100 text-slate-700",
  medium: "bg-sky-50 text-sky-800",
  high: "bg-rose-50 text-rose-800",
};

const statusClasses = {
  todo: "bg-slate-100 text-slate-700",
  "in-progress": "bg-amber-50 text-amber-800",
  done: "bg-emerald-50 text-emerald-800",
};

export function ProjectDetailPage() {
  const navigate = useNavigate();
  const { projectId = "" } = useParams();
  const {
    projects,
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
  } = useAppStore();

  const project = projects.find((item) => item.id === projectId);
  const [isEditingProject, setEditingProject] = useState(false);
  const [isAddingIdea, setAddingIdea] = useState(false);
  const [editingIdea, setEditingIdea] = useState<Idea | null>(null);
  const [isAddingTodo, setAddingTodo] = useState(false);
  const [editingTodo, setEditingTodo] = useState<ProjectTodo | null>(null);
  const [statusFilter, setStatusFilter] = useState<ActiveStatusFilter>("all");
  const [sortMode, setSortMode] = useState<SortMode>("ddl-asc");
  const [isDoneArchiveOpen, setDoneArchiveOpen] = useState(false);
  const [isAddingReference, setAddingReference] = useState(false);
  const [editingReference, setEditingReference] = useState<ReferenceItem | null>(null);

  function sortTodos(todos: ProjectTodo[]) {
    return [...todos].sort((a, b) => {
      if (sortMode === "updated-desc") {
        return b.updatedAt.localeCompare(a.updatedAt);
      }

      const aDdl = a.ddl || "9999-12-31";
      const bDdl = b.ddl || "9999-12-31";
      return sortMode === "ddl-asc" ? aDdl.localeCompare(bDdl) : bDdl.localeCompare(aDdl);
    });
  }

  const visibleActiveTodos = useMemo(() => {
    if (!project) return [];

    const activeTodos = project.todos.filter((todo) => todo.status !== "done");
    const filtered =
      statusFilter === "all"
        ? activeTodos
        : activeTodos.filter((todo) => todo.status === statusFilter);

    return sortTodos(filtered);
  }, [project, sortMode, statusFilter]);

  const doneTodos = useMemo(() => {
    if (!project) return [];
    return [...project.todos]
      .filter((todo) => todo.status === "done")
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }, [project]);

  if (!project) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h2 className="text-2xl font-bold text-slate-950">Project not found</h2>
        <p className="mt-2 text-sm text-slate-600">这个项目可能已经被删除。</p>
        <Link className="btn btn-primary mt-5" to="/">
          返回 Dashboard
        </Link>
      </div>
    );
  }

  const doneCount = project.todos.filter((todo) => todo.status === "done").length;
  const openCount = project.todos.length - doneCount;

  function handleDeleteProject() {
    if (!project) return;
    const confirmed = window.confirm(`删除项目 "${project.name}"？这个操作不能撤销。`);
    if (!confirmed) return;
    deleteProject(project.id);
    navigate("/");
  }

  function confirmDelete(label: string, name: string, onConfirm: () => void) {
    const confirmed = window.confirm(`删除${label} "${name}"？这个操作不能撤销。`);
    if (confirmed) {
      onConfirm();
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <Link className="text-sm font-semibold text-teal-700 hover:text-teal-900" to="/">
          返回 Dashboard
        </Link>
        <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <h2 className="break-words text-3xl font-bold text-slate-950">{project.name}</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              {project.description || "No description yet."}
            </p>
            <p className="mt-3 text-xs font-semibold text-slate-500">
              Created {formatDateTime(project.createdAt)} · Updated {formatDateTime(project.updatedAt)}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button className="btn btn-secondary" type="button" onClick={() => setEditingProject(true)}>
              编辑项目
            </button>
            <button className="btn btn-danger" type="button" onClick={handleDeleteProject}>
              删除项目
            </button>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-4">
          <Metric label="Todos" value={project.todos.length} />
          <Metric label="Done" value={doneCount} />
          <Metric label="Open" value={openCount} />
          <Metric label="References" value={project.references.length} />
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(360px,0.75fr)]">
        <div className="space-y-6">
          <Panel
            title="Todo List"
            actionLabel="新增 todo"
            onAction={() => {
              setAddingTodo(true);
              setEditingTodo(null);
            }}
          >
            <div className="mb-4 grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="form-label">按状态筛选</span>
                <select
                  className="form-input mt-1"
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value as ActiveStatusFilter)}
                >
                  <option value="all">all</option>
                  <option value="todo">todo</option>
                  <option value="in-progress">in-progress</option>
                </select>
              </label>
              <label className="block">
                <span className="form-label">按 DDL 排序</span>
                <select
                  className="form-input mt-1"
                  value={sortMode}
                  onChange={(event) => setSortMode(event.target.value as SortMode)}
                >
                  <option value="ddl-asc">DDL earliest first</option>
                  <option value="ddl-desc">DDL latest first</option>
                  <option value="updated-desc">Recently updated</option>
                </select>
              </label>
            </div>

            {isAddingTodo && (
              <div className="mb-4">
                <TodoForm
                  onSubmit={(input) => {
                    addTodo(project.id, input);
                    setAddingTodo(false);
                  }}
                  onCancel={() => setAddingTodo(false)}
                />
              </div>
            )}

            {editingTodo && (
              <div className="mb-4">
                <TodoForm
                  todo={editingTodo}
                  onSubmit={(input) => {
                    updateTodo(project.id, editingTodo.id, input);
                    setEditingTodo(null);
                  }}
                  onCancel={() => setEditingTodo(null)}
                />
              </div>
            )}

            {visibleActiveTodos.length === 0 ? (
              <EmptyState
                title="没有匹配的 todo"
                description="新增一个 todo，或把 Done Archive 里的任务点回 todo。"
                actionLabel="新增 todo"
                onAction={() => setAddingTodo(true)}
              />
            ) : (
              <div className="space-y-3">
                {visibleActiveTodos.map((todo) => (
                  <TodoItem
                    key={todo.id}
                    todo={todo}
                    onCycleStatus={() => cycleTodoStatus(project.id, todo.id)}
                    onEdit={() => {
                      setEditingTodo(todo);
                      setAddingTodo(false);
                    }}
                    onDelete={() =>
                      confirmDelete("todo", todo.title, () => deleteTodo(project.id, todo.id))
                    }
                  />
                ))}
              </div>
            )}

            {doneTodos.length > 0 && (
              <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50">
                <button
                  className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left"
                  type="button"
                  onClick={() => setDoneArchiveOpen((current) => !current)}
                >
                  <span>
                    <span className="font-bold text-slate-950">Done Archive</span>
                    <span className="ml-2 text-sm font-semibold text-slate-500">
                      {doneTodos.length} completed
                    </span>
                  </span>
                  <span className="text-sm font-bold text-teal-700">
                    {isDoneArchiveOpen ? "收起" : "展开"}
                  </span>
                </button>

                {isDoneArchiveOpen && (
                  <div className="space-y-3 border-t border-slate-200 p-4">
                    {doneTodos.map((todo) => (
                      <TodoItem
                        key={todo.id}
                        todo={todo}
                        onCycleStatus={() => cycleTodoStatus(project.id, todo.id)}
                        onEdit={() => {
                          setEditingTodo(todo);
                          setAddingTodo(false);
                        }}
                        onDelete={() =>
                          confirmDelete("todo", todo.title, () => deleteTodo(project.id, todo.id))
                        }
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel
            title="Ideas"
            actionLabel="新增 idea"
            onAction={() => {
              setAddingIdea(true);
              setEditingIdea(null);
            }}
          >
            {isAddingIdea && (
              <div className="mb-4">
                <IdeaForm
                  onSubmit={(input) => {
                    addIdea(project.id, input);
                    setAddingIdea(false);
                  }}
                  onCancel={() => setAddingIdea(false)}
                />
              </div>
            )}
            {editingIdea && (
              <div className="mb-4">
                <IdeaForm
                  idea={editingIdea}
                  onSubmit={(input) => {
                    updateIdea(project.id, editingIdea.id, input);
                    setEditingIdea(null);
                  }}
                  onCancel={() => setEditingIdea(null)}
                />
              </div>
            )}
            {project.ideas.length === 0 ? (
              <EmptyState
                title="还没有 idea"
                description="记录研究假设、实验变体、论文结构或任何临时想法。"
                actionLabel="新增 idea"
                onAction={() => setAddingIdea(true)}
              />
            ) : (
              <div className="space-y-3">
                {project.ideas.map((idea) => (
                  <IdeaItem
                    key={idea.id}
                    idea={idea}
                    onEdit={() => {
                      setEditingIdea(idea);
                      setAddingIdea(false);
                    }}
                    onDelete={() =>
                      confirmDelete("idea", idea.title, () => deleteIdea(project.id, idea.id))
                    }
                  />
                ))}
              </div>
            )}
          </Panel>

          <Panel
            title="References"
            actionLabel="新增 reference"
            onAction={() => {
              setAddingReference(true);
              setEditingReference(null);
            }}
          >
            {isAddingReference && (
              <div className="mb-4">
                <ReferenceForm
                  onSubmit={(input) => {
                    addReference(project.id, input);
                    setAddingReference(false);
                  }}
                  onCancel={() => setAddingReference(false)}
                />
              </div>
            )}
            {editingReference && (
              <div className="mb-4">
                <ReferenceForm
                  reference={editingReference}
                  onSubmit={(input) => {
                    updateReference(project.id, editingReference.id, input);
                    setEditingReference(null);
                  }}
                  onCancel={() => setEditingReference(null)}
                />
              </div>
            )}
            {project.references.length === 0 ? (
              <EmptyState
                title="还没有 reference"
                description="保存论文、网页、文档或本地笔记索引，URL 会显示为可点击链接。"
                actionLabel="新增 reference"
                onAction={() => setAddingReference(true)}
              />
            ) : (
              <div className="space-y-3">
                {project.references.map((reference) => (
                  <ReferenceCard
                    key={reference.id}
                    reference={reference}
                    onEdit={() => {
                      setEditingReference(reference);
                      setAddingReference(false);
                    }}
                    onDelete={() =>
                      confirmDelete("reference", reference.title, () =>
                        deleteReference(project.id, reference.id),
                      )
                    }
                  />
                ))}
              </div>
            )}
          </Panel>
        </div>
      </section>

      {isEditingProject && (
        <Modal title="编辑项目" onClose={() => setEditingProject(false)}>
          <ProjectForm
            project={project}
            onSubmit={(input) => {
              updateProject(project.id, input);
              setEditingProject(false);
            }}
            onCancel={() => setEditingProject(false)}
          />
        </Modal>
      )}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
      <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-slate-950">{value}</p>
    </div>
  );
}

function Panel({
  title,
  actionLabel,
  onAction,
  children,
}: {
  title: string;
  actionLabel: string;
  onAction: () => void;
  children: ReactNode;
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h3 className="text-xl font-bold text-slate-950">{title}</h3>
        <button className="btn btn-secondary" type="button" onClick={onAction}>
          {actionLabel}
        </button>
      </div>
      {children}
    </section>
  );
}

function TodoItem({
  todo,
  onCycleStatus,
  onEdit,
  onDelete,
}: {
  todo: ProjectTodo;
  onCycleStatus: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const overdue = isTodoOverdue(todo);
  const nextStatusLabel =
    todo.status === "todo" ? "in-progress" : todo.status === "in-progress" ? "done" : "todo";

  return (
    <article
      className={`rounded-lg border p-4 ${
        overdue ? "border-rose-300 bg-rose-50" : "border-slate-200 bg-white"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className={`break-words text-base font-bold ${todo.status === "done" ? "text-slate-500 line-through" : "text-slate-950"}`}>
              {todo.title}
            </h4>
            <button
              className={`rounded-lg px-2 py-1 text-xs font-bold transition hover:ring-2 hover:ring-teal-200 ${statusClasses[todo.status]}`}
              type="button"
              onClick={onCycleStatus}
              aria-label={`Change ${todo.title} status to ${nextStatusLabel}`}
              title={`Next: ${nextStatusLabel}`}
            >
              {todo.status}
            </button>
            <span className={`rounded-lg px-2 py-1 text-xs font-bold ${priorityClasses[todo.priority]}`}>
              {todo.priority}
            </span>
            {overdue && (
              <span className="rounded-lg bg-rose-600 px-2 py-1 text-xs font-bold text-white">
                DDL 已过期
              </span>
            )}
          </div>
          {todo.description && (
            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">{todo.description}</p>
          )}
          <div className="mt-3 grid gap-2 text-xs font-semibold text-slate-500 sm:grid-cols-3">
            <span>DDL: {formatDateOnly(todo.ddl)}</span>
            <span>Expected: {todo.expectedFinishTime || "Not set"}</span>
            <span>Updated: {formatDateTime(todo.updatedAt)}</span>
          </div>
        </div>
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <button className="btn btn-secondary" type="button" onClick={onEdit}>
          编辑
        </button>
        <button className="btn btn-danger" type="button" onClick={onDelete}>
          删除
        </button>
      </div>
    </article>
  );
}

function IdeaItem({
  idea,
  onEdit,
  onDelete,
}: {
  idea: Idea;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4">
      <h4 className="break-words text-base font-bold text-slate-950">{idea.title}</h4>
      {idea.content && (
        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">{idea.content}</p>
      )}
      <p className="mt-3 text-xs font-semibold text-slate-500">
        Created {formatDateTime(idea.createdAt)} · Updated {formatDateTime(idea.updatedAt)}
      </p>
      <div className="mt-4 flex justify-end gap-2">
        <button className="btn btn-secondary" type="button" onClick={onEdit}>
          编辑
        </button>
        <button className="btn btn-danger" type="button" onClick={onDelete}>
          删除
        </button>
      </div>
    </article>
  );
}

function ReferenceCard({
  reference,
  onEdit,
  onDelete,
}: {
  reference: ReferenceItem;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const href = reference.url.startsWith("http") ? reference.url : "";

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4">
      <h4 className="break-words text-base font-bold text-slate-950">{reference.title}</h4>
      {href && (
        <a
          className="mt-2 block break-all text-sm font-semibold text-teal-700 hover:text-teal-900"
          href={href}
          target="_blank"
          rel="noreferrer"
        >
          {reference.url}
        </a>
      )}
      {reference.note && (
        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">{reference.note}</p>
      )}
      <p className="mt-3 text-xs font-semibold text-slate-500">
        Created {formatDateTime(reference.createdAt)}
      </p>
      <div className="mt-4 flex justify-end gap-2">
        <button className="btn btn-secondary" type="button" onClick={onEdit}>
          编辑
        </button>
        <button className="btn btn-danger" type="button" onClick={onDelete}>
          删除
        </button>
      </div>
    </article>
  );
}
