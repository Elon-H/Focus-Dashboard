import { Link } from "react-router-dom";
import { formatDateOnly, formatDateTime, getNearestDdl } from "../lib/date";
import type { Project } from "../types";

export function ProjectCard({ project }: { project: Project }) {
  const doneCount = project.todos.filter((todo) => todo.status === "done").length;
  const totalCount = project.todos.length;
  const openCount = totalCount - doneCount;
  const nearestDdl = getNearestDdl(project.todos);

  return (
    <Link
      to={`/projects/${project.id}`}
      className="group block rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-panel"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="truncate text-lg font-bold text-slate-950 group-hover:text-teal-800">
            {project.name}
          </h3>
          <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-slate-600">
            {project.description || "No description yet."}
          </p>
        </div>
        <div className="rounded-lg bg-sky-50 px-3 py-2 text-center">
          <p className="text-xl font-bold text-sky-900">{totalCount}</p>
          <p className="text-[11px] font-semibold uppercase text-sky-700">todo</p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2">
        <Stat label="已完成" value={doneCount} tone="emerald" />
        <Stat label="未完成" value={openCount} tone="amber" />
        <Stat label="Ideas" value={project.ideas.length} tone="slate" />
      </div>

      <div className="mt-5 border-t border-slate-100 pt-4 text-sm text-slate-600">
        <div className="flex items-center justify-between gap-3">
          <span>最近 DDL</span>
          <span className="font-semibold text-slate-900">{formatDateOnly(nearestDdl)}</span>
        </div>
        <div className="mt-2 flex items-center justify-between gap-3">
          <span>更新时间</span>
          <span className="font-semibold text-slate-900">{formatDateTime(project.updatedAt)}</span>
        </div>
      </div>
    </Link>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone: string }) {
  const classes: Record<string, string> = {
    emerald: "bg-emerald-50 text-emerald-900",
    amber: "bg-amber-50 text-amber-900",
    slate: "bg-slate-100 text-slate-900",
  };

  return (
    <div className={`rounded-lg px-3 py-2 ${classes[tone]}`}>
      <p className="text-lg font-bold">{value}</p>
      <p className="text-xs font-semibold">{label}</p>
    </div>
  );
}
