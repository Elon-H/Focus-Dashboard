import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  formatDateOnly,
  formatDateTime,
  formatMonthTitle,
  getMonthDays,
  isTodoOverdue,
  todayKey,
} from "../lib/date";
import { useAppStore } from "../stores/AppStoreContext";
import type { ProjectTodo, TodoPriority, TodoStatus } from "../types";

type CalendarMarker = "DDL" | "Expected";

interface CalendarEvent {
  date: string;
  markers: CalendarMarker[];
  projectId: string;
  projectName: string;
  todo: ProjectTodo;
}

const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const statusClasses: Record<TodoStatus, string> = {
  todo: "bg-slate-100 text-slate-700",
  "in-progress": "bg-amber-50 text-amber-800",
  done: "bg-emerald-50 text-emerald-800",
};

const priorityClasses: Record<TodoPriority, string> = {
  low: "bg-slate-100 text-slate-700",
  medium: "bg-sky-50 text-sky-800",
  high: "bg-rose-50 text-rose-800",
};

function shiftMonth(date: Date, offset: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + offset, 1);
}

function getExpectedDate(todo: ProjectTodo): string {
  return /^\d{4}-\d{2}-\d{2}/.test(todo.expectedFinishTime)
    ? todo.expectedFinishTime.slice(0, 10)
    : "";
}

function getEventMarkersByDate(todo: ProjectTodo): Record<string, CalendarMarker[]> {
  const markersByDate: Record<string, CalendarMarker[]> = {};
  const expectedDate = getExpectedDate(todo);

  if (todo.ddl) {
    markersByDate[todo.ddl] = [...(markersByDate[todo.ddl] ?? []), "DDL"];
  }

  if (expectedDate) {
    markersByDate[expectedDate] = [...(markersByDate[expectedDate] ?? []), "Expected"];
  }

  return markersByDate;
}

function priorityRank(priority: TodoPriority): number {
  if (priority === "high") return 3;
  if (priority === "medium") return 2;
  return 1;
}

export function CalendarPage() {
  const { data, projects } = useAppStore();
  const [monthDate, setMonthDate] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => todayKey());

  const eventsByDate = useMemo(() => {
    const groups: Record<string, CalendarEvent[]> = {};

    projects.forEach((project) => {
      project.todos.forEach((todo) => {
        Object.entries(getEventMarkersByDate(todo)).forEach(([date, markers]) => {
          groups[date] = [
            ...(groups[date] ?? []),
            {
              date,
              markers,
              projectId: project.id,
              projectName: project.name,
              todo,
            },
          ];
        });
      });
    });

    Object.values(groups).forEach((events) => {
      events.sort((a, b) => {
        const overdueDiff = Number(isTodoOverdue(b.todo)) - Number(isTodoOverdue(a.todo));
        if (overdueDiff !== 0) return overdueDiff;

        const priorityDiff = priorityRank(b.todo.priority) - priorityRank(a.todo.priority);
        if (priorityDiff !== 0) return priorityDiff;

        return a.todo.title.localeCompare(b.todo.title);
      });
    });

    return groups;
  }, [projects]);

  const calendarDays = useMemo(() => getMonthDays(monthDate), [monthDate]);
  const selectedEvents = eventsByDate[selectedDate] ?? [];
  const selectedSessions = data.focusHistory[selectedDate] ?? 0;
  const monthTodoTotal = calendarDays.reduce(
    (sum, day) => sum + (eventsByDate[todayKey(day)]?.length ?? 0),
    0,
  );
  const monthSessionTotal = calendarDays.reduce(
    (sum, day) => sum + (data.focusHistory[todayKey(day)] ?? 0),
    0,
  );

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">
              Calendar
            </p>
            <h2 className="mt-2 text-3xl font-bold text-slate-950">日历视图</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              按日期查看所有项目的 todo DDL、expectedFinishTime 和每日 Focus session。
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:min-w-72">
            <Metric label="Month todos" value={monthTodoTotal} />
            <Metric label="Month sessions" value={monthSessionTotal} />
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <h3 className="text-2xl font-bold text-slate-950">{formatMonthTitle(monthDate)}</h3>
            <div className="flex flex-wrap gap-2">
              <button
                className="btn btn-secondary"
                type="button"
                onClick={() => setMonthDate((current) => shiftMonth(current, -1))}
              >
                上月
              </button>
              <button
                className="btn btn-secondary"
                type="button"
                onClick={() => {
                  const today = new Date();
                  setMonthDate(today);
                  setSelectedDate(todayKey(today));
                }}
              >
                今天
              </button>
              <button
                className="btn btn-secondary"
                type="button"
                onClick={() => setMonthDate((current) => shiftMonth(current, 1))}
              >
                下月
              </button>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-7 gap-2 text-center text-xs font-bold uppercase text-slate-500">
            {weekdayLabels.map((label) => (
              <div key={label}>{label}</div>
            ))}
          </div>

          <div className="mt-2 grid grid-cols-7 gap-2">
            {calendarDays.map((day) => {
              const dateKey = todayKey(day);
              const isCurrentMonth = day.getMonth() === monthDate.getMonth();
              const isToday = dateKey === todayKey();
              const isSelected = dateKey === selectedDate;
              const events = eventsByDate[dateKey] ?? [];
              const sessions = data.focusHistory[dateKey] ?? 0;
              const overdueCount = events.filter((event) => isTodoOverdue(event.todo)).length;
              const highCount = events.filter((event) => event.todo.priority === "high").length;

              return (
                <button
                  key={dateKey}
                  className={`min-h-32 rounded-lg border p-2 text-left transition hover:border-teal-300 hover:bg-teal-50/40 ${
                    isSelected
                      ? "border-teal-600 bg-teal-50"
                      : isCurrentMonth
                        ? "border-slate-200 bg-white"
                        : "border-slate-100 bg-slate-50 text-slate-400"
                  }`}
                  type="button"
                  onClick={() => setSelectedDate(dateKey)}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-lg text-sm font-bold ${
                        isToday ? "bg-slate-950 text-white" : "text-slate-900"
                      }`}
                    >
                      {day.getDate()}
                    </span>
                    {sessions > 0 && (
                      <span className="rounded-lg bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-800">
                        {sessions} focus
                      </span>
                    )}
                  </div>

                  <div className="mt-3 space-y-1">
                    {events.slice(0, 3).map((event) => (
                      <div
                        key={`${event.todo.id}-${event.date}-${event.markers.join("-")}`}
                        className={`truncate rounded-md px-2 py-1 text-xs font-semibold ${
                          event.todo.priority === "high"
                            ? "bg-rose-50 text-rose-800"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {event.markers.join("+")} · {event.todo.title}
                      </div>
                    ))}
                    {events.length > 3 && (
                      <div className="text-xs font-semibold text-slate-500">
                        +{events.length - 3} more
                      </div>
                    )}
                  </div>

                  {(overdueCount > 0 || highCount > 0) && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {overdueCount > 0 && (
                        <span className="rounded-md bg-rose-600 px-1.5 py-0.5 text-[11px] font-bold text-white">
                          {overdueCount} overdue
                        </span>
                      )}
                      {highCount > 0 && (
                        <span className="rounded-md bg-amber-50 px-1.5 py-0.5 text-[11px] font-bold text-amber-800">
                          {highCount} high
                        </span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Selected day
              </p>
              <h3 className="mt-2 text-xl font-bold text-slate-950">
                {formatDateOnly(selectedDate)}
              </h3>
            </div>
            <div className="rounded-lg bg-emerald-50 px-3 py-2 text-right">
              <p className="text-xs font-bold text-emerald-700">Focus</p>
              <p className="text-2xl font-bold text-emerald-950">{selectedSessions}</p>
            </div>
          </div>

          {selectedEvents.length === 0 && selectedSessions === 0 ? (
            <div className="mt-5 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center">
              <p className="font-bold text-slate-950">这一天还没有安排</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                给 todo 设置 DDL 或 expectedFinishTime 后，会自动出现在日历里。
              </p>
            </div>
          ) : (
            <div className="mt-5 space-y-3">
              {selectedEvents.map((event) => (
                <CalendarTodoCard
                  key={`${event.todo.id}-${event.date}-${event.markers.join("-")}`}
                  event={event}
                />
              ))}
              {selectedEvents.length === 0 && selectedSessions > 0 && (
                <div className="rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-900">
                  这一天完成了 {selectedSessions} 个 Focus session，没有 todo 日期事件。
                </div>
              )}
            </div>
          )}
        </aside>
      </section>
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

function CalendarTodoCard({ event }: { event: CalendarEvent }) {
  const overdue = isTodoOverdue(event.todo);

  return (
    <article
      className={`rounded-lg border p-4 ${
        overdue ? "border-rose-300 bg-rose-50" : "border-slate-200 bg-white"
      }`}
    >
      <div className="flex flex-wrap items-center gap-2">
        {event.markers.map((marker) => (
          <span
            key={marker}
            className="rounded-lg bg-teal-50 px-2 py-1 text-xs font-bold text-teal-800"
          >
            {marker}
          </span>
        ))}
        <span
          className={`rounded-lg px-2 py-1 text-xs font-bold ${statusClasses[event.todo.status]}`}
        >
          {event.todo.status}
        </span>
        <span
          className={`rounded-lg px-2 py-1 text-xs font-bold ${
            priorityClasses[event.todo.priority]
          }`}
        >
          {event.todo.priority}
        </span>
        {overdue && (
          <span className="rounded-lg bg-rose-600 px-2 py-1 text-xs font-bold text-white">
            DDL 已过期
          </span>
        )}
      </div>

      <h4 className="mt-3 break-words text-base font-bold text-slate-950">{event.todo.title}</h4>
      <Link
        className="mt-1 inline-block text-sm font-semibold text-teal-700 hover:text-teal-900"
        to={`/projects/${event.projectId}`}
      >
        {event.projectName}
      </Link>
      {event.todo.description && (
        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">
          {event.todo.description}
        </p>
      )}
      <div className="mt-3 grid gap-2 text-xs font-semibold text-slate-500">
        <span>DDL: {formatDateOnly(event.todo.ddl)}</span>
        <span>Expected: {event.todo.expectedFinishTime || "Not set"}</span>
        <span>Updated: {formatDateTime(event.todo.updatedAt)}</span>
      </div>
    </article>
  );
}
