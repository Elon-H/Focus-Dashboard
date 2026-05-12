import { Link } from "react-router-dom";
import { formatDateOnly, getNearestDdl } from "../lib/date";
import type { Project } from "../types";

export function ProjectCard({ project }: { project: Project }) {
  const openTodos = project.todos.filter((todo) => todo.status !== "done");
  const openCount = openTodos.length;
  const nearestDdl = getNearestDdl(openTodos);

  return (
    <Link
      to={`/projects/${project.id}`}
      className="group block rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-panel"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-base font-bold text-slate-950 group-hover:text-teal-800">
            {project.name}
          </h3>
          <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-600">
            {project.description || "No description yet."}
          </p>
        </div>
        <div className="rounded-lg bg-slate-950 px-3 py-2 text-center text-white">
          <p className="text-lg font-bold">{openCount}</p>
          <p className="text-[10px] font-semibold uppercase">open</p>
        </div>
      </div>

      <div className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600">
        <div className="flex items-center justify-between gap-3">
          <span>最近 DDL</span>
          <span className="font-semibold text-slate-900">{formatDateOnly(nearestDdl)}</span>
        </div>
      </div>
    </Link>
  );
}
