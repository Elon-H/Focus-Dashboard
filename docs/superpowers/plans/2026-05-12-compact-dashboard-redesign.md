# Compact Dashboard Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the homepage around the approved A layout: slim navigation, compact timer, In Progress plus Todo homepage lanes, direct status changes, and simplified project cards.

**Architecture:** Keep the current React + Vite + TypeScript structure and Zustand-like context store. Reuse the existing `cycleTodoStatus`, date helpers, timer hook, and project card route links. The redesign is UI-only plus smoke/docs updates; it does not change storage keys or persisted data shape.

**Tech Stack:** React, TypeScript, Tailwind CSS, React Router, localStorage-backed app store.

---

## File Map

- Modify `src/pages/DashboardPage.tsx`: replace hero-heavy dashboard with compact board, add `todo` lane, use `cycleTodoStatus` from the store, and avoid nested button-inside-link markup.
- Modify `src/components/ProjectCard.tsx`: reduce project card to project name, unfinished count, description preview, and nearest DDL for unfinished todos.
- Modify `src/components/Layout.tsx`: shrink desktop sidebar into a narrow rail, remove the large local-first panel, keep route anchors and global timer mount.
- Modify `src/components/TimerPanel.tsx`: compress timer into a top strip while preserving countdown, mode switching, notification, session count, and settings behavior.
- Modify `scripts/smoke-check.mjs`: add checks for homepage Todo lane, direct status cycling, compact project cards, slim layout, and compact timer.
- Modify `README.md`: document the compact dashboard, homepage status controls, and simplified project cards.

---

### Task 1: Dashboard Task Lanes and Direct Status Controls

**Files:**
- Modify: `src/pages/DashboardPage.tsx`

- [ ] **Step 1: Generalize the task item type and sorter**

Replace the current `InProgressTodoItem` and `compareInProgressTodos` names with generic dashboard todo equivalents:

```ts
interface DashboardTodoItem {
  projectId: string;
  projectName: string;
  todo: ProjectTodo;
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
```

- [ ] **Step 2: Build status-specific homepage lists**

Use a helper to flatten project todos by status:

```ts
function collectDashboardTodos(projects: Project[], status: ProjectTodo["status"]): DashboardTodoItem[] {
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
```

Import `Project` from `../types` if needed, then create:

```ts
const inProgressTodos = useMemo(
  () => collectDashboardTodos(projects, "in-progress"),
  [projects],
);

const todoTodos = useMemo(
  () => collectDashboardTodos(projects, "todo"),
  [projects],
);
```

- [ ] **Step 3: Use store status cycling from the homepage**

Change the store destructuring:

```ts
const { projects, createProject, addDemoProject, cycleTodoStatus } = useAppStore();
```

Pass `cycleTodoStatus(item.projectId, item.todo.id)` into each homepage task card status button.

- [ ] **Step 4: Replace the large dashboard hero with the compact board**

Remove the top dashboard create-project hero section. Keep project creation available from the Projects panel header and the empty state.

Render the page as:

```tsx
<div className="grid gap-4 xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)]">
  <div className="space-y-4">
    <TaskLane
      title="In Progress"
      eyebrow="Active Work"
      countLabel={`${inProgressTodos.length} active`}
      emptyText="还没有 in-progress todo。点击 Todo 里的状态按钮即可开始推进。"
      items={inProgressTodos}
      statusTone="progress"
      onCycleStatus={cycleTodoStatus}
    />
    <TaskLane
      title="Todo"
      eyebrow="Waiting"
      countLabel={`${todoTodos.length} waiting`}
      emptyText="还没有待开始 todo。进入项目详情页新增任务后会显示在这里。"
      items={todoTodos}
      statusTone="todo"
      onCycleStatus={cycleTodoStatus}
    />
  </div>
  <ProjectsPanel />
</div>
```

Keep the final implementation inline in `DashboardPage.tsx` unless extracting subcomponents makes the file clearer.

- [ ] **Step 5: Implement non-nested interactive task cards**

Use an `<article>` card with a status `<button>` and a separate project `<Link>`:

```tsx
function DashboardTodoCard({
  item,
  onCycleStatus,
}: {
  item: DashboardTodoItem;
  onCycleStatus: (projectId: string, todoId: string) => void;
}) {
  const overdue = isTodoOverdue(item.todo);
  const nextStatus = item.todo.status === "todo" ? "in-progress" : "done";
  const statusClasses =
    item.todo.status === "in-progress"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : "border-sky-200 bg-sky-50 text-sky-800";

  return (
    <article
      className={`grid gap-3 rounded-xl border p-3 shadow-sm sm:grid-cols-[112px_minmax(0,1fr)_auto] sm:items-center ${
        overdue ? "border-rose-300 bg-rose-50" : "border-slate-200 bg-white"
      }`}
    >
      <button
        className={`rounded-full border px-3 py-2 text-xs font-bold ${statusClasses}`}
        type="button"
        onClick={() => onCycleStatus(item.projectId, item.todo.id)}
        aria-label={`Move ${item.todo.title} to ${nextStatus}`}
      >
        {item.todo.status}
      </button>
      <div className="min-w-0">
        <h3 className="truncate text-sm font-bold text-slate-950">{item.todo.title}</h3>
        <div className="mt-1 text-xs font-semibold text-teal-700">{item.projectName}</div>
      </div>
      <Link className="text-xs font-bold text-teal-700" to={`/projects/${item.projectId}`}>
        查看项目
      </Link>
    </article>
  );
}
```

Use concrete Tailwind classes in implementation and keep the status control as a real button, not a nested interactive element inside a link.

- [ ] **Step 6: Run a focused build check**

Run:

```bash
npm run build
```

Expected: TypeScript and Vite build complete with exit code 0.

---

### Task 2: Compact Project Cards

**Files:**
- Modify: `src/components/ProjectCard.tsx`

- [ ] **Step 1: Count unfinished todos only**

Use unfinished todos as the source of project card counts and nearest DDL:

```ts
const openTodos = project.todos.filter((todo) => todo.status !== "done");
const openCount = openTodos.length;
const nearestDdl = getNearestDdl(openTodos);
```

Remove `doneCount`, `totalCount`, the `Stat` component, and `formatDateTime`.

- [ ] **Step 2: Render only compact operational fields**

Use one compact card body:

```tsx
<Link to={`/projects/${project.id}`} className="group block rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-panel">
  <div className="flex items-start justify-between gap-3">
    <div className="min-w-0">
      <h3 className="truncate text-base font-bold text-slate-950 group-hover:text-teal-800">
        {project.name}
      </h3>
      <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-600">
        {project.description || "No description yet."}
      </p>
    </div>
    <div className="rounded-xl bg-slate-950 px-3 py-2 text-center text-white">
      <p className="text-lg font-bold">{openCount}</p>
      <p className="text-[10px] font-semibold uppercase">open</p>
    </div>
  </div>
  <div className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600">
    最近 DDL <span className="float-right text-slate-950">{formatDateOnly(nearestDdl)}</span>
  </div>
</Link>
```

- [ ] **Step 3: Run the build check**

Run:

```bash
npm run build
```

Expected: Build exits 0 and there are no unused imports from `ProjectCard.tsx`.

---

### Task 3: Slim Layout and Compact Timer

**Files:**
- Modify: `src/components/Layout.tsx`
- Modify: `src/components/TimerPanel.tsx`

- [ ] **Step 1: Convert the desktop sidebar to a slim rail**

In `Layout.tsx`, reduce desktop width from `lg:w-72` to a compact rail such as `lg:w-20`, remove the large local-first info box, and keep accessible link labels:

```tsx
<aside className="border-b border-slate-200 bg-slate-950 px-4 py-3 text-white lg:sticky lg:top-0 lg:h-screen lg:w-20 lg:border-b-0 lg:border-r lg:border-slate-800 lg:px-3 lg:py-5">
  <div className="flex items-center justify-between gap-3 lg:flex-col">
    <Link to="/" className="grid h-10 w-10 place-items-center rounded-xl bg-white text-base font-black text-slate-950">
      F
    </Link>
    <div className="rounded-lg bg-emerald-400/15 px-2 py-1 text-center text-xs font-bold text-emerald-100">
      {data.dailyFocusCount.count}
    </div>
  </div>
</aside>
```

Keep `Dashboard`, `Calendar`, `Timer`, and `Projects` routes. On desktop, use compact labels or short text with `title` attributes.

- [ ] **Step 2: Tighten main content spacing**

Change the main wrapper spacing from `space-y-6` and larger padding to compact spacing:

```tsx
<main className="min-w-0 flex-1 px-3 py-4 sm:px-5 lg:px-5 lg:py-5">
  <div className="space-y-4">
    <TimerPanel />
    {children}
  </div>
</main>
```

- [ ] **Step 3: Compress TimerPanel into a top strip**

Keep `id="timer"`, `mode`, `status`, `message`, `handleStart`, `switchMode`, `applySettings`, and the notification logic unchanged.

Replace the current two-block timer layout with a compact responsive grid:

```tsx
<section id="timer" className="rounded-xl border border-slate-200 bg-white p-4 shadow-panel">
  <div className="grid gap-4 xl:grid-cols-[minmax(220px,0.7fr)_minmax(260px,1fr)_minmax(260px,0.8fr)] xl:items-center">
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {(Object.keys(modeLabels) as TimerMode[]).map((item) => (
          <button key={item} type="button" onClick={() => switchMode(item)}>
            {modeLabels[item]}
          </button>
        ))}
      </div>
      <p>{data.dailyFocusCount.count} sessions today</p>
    </div>
    <div>
      <div className="text-[clamp(2.5rem,6vw,4.75rem)] font-black leading-none tracking-normal">
        {formatSeconds(remainingSeconds)}
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-teal-700" style={{ width: `${progress}%` }} />
      </div>
    </div>
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {status === "running" ? (
          <button type="button" onClick={pause}>暂停</button>
        ) : (
          <button type="button" onClick={handleStart}>{status === "paused" ? "继续" : "开始"}</button>
        )}
        <button type="button" onClick={reset}>重置</button>
      </div>
      <form className="grid gap-2 sm:grid-cols-[1fr_1fr_1fr_auto]" onSubmit={applySettings}>
        <NumberField
          label="Focus"
          value={settingsDraft.focusMinutes}
          onChange={(value) => setSettingsDraft((current) => ({ ...current, focusMinutes: value }))}
        />
        <NumberField
          label="Short"
          value={settingsDraft.shortBreakMinutes}
          onChange={(value) => setSettingsDraft((current) => ({ ...current, shortBreakMinutes: value }))}
        />
        <NumberField
          label="Long"
          value={settingsDraft.longBreakMinutes}
          onChange={(value) => setSettingsDraft((current) => ({ ...current, longBreakMinutes: value }))}
        />
        <button className="btn btn-primary self-end" type="submit">保存</button>
      </form>
    </div>
  </div>
  {message && <div>{message}</div>}
</section>
```

Use `text-[clamp(2.5rem,6vw,4.75rem)]` for the timer number so it stays prominent but no longer dominates the page.

- [ ] **Step 4: Keep settings compact but editable**

Keep the three `NumberField` controls, but render them in a compact grid on desktop:

```tsx
<form className="grid gap-3 sm:grid-cols-[1fr_1fr_1fr_auto]" onSubmit={applySettings}>
  <NumberField
    label="Focus"
    value={settingsDraft.focusMinutes}
    onChange={(value) => setSettingsDraft((current) => ({ ...current, focusMinutes: value }))}
  />
  <NumberField
    label="Short"
    value={settingsDraft.shortBreakMinutes}
    onChange={(value) => setSettingsDraft((current) => ({ ...current, shortBreakMinutes: value }))}
  />
  <NumberField
    label="Long"
    value={settingsDraft.longBreakMinutes}
    onChange={(value) => setSettingsDraft((current) => ({ ...current, longBreakMinutes: value }))}
  />
  <button className="btn btn-primary self-end" type="submit">保存</button>
</form>
```

- [ ] **Step 5: Run build**

Run:

```bash
npm run build
```

Expected: Build exits 0 and timer behavior code still compiles.

---

### Task 4: Smoke Checks and README

**Files:**
- Modify: `scripts/smoke-check.mjs`
- Modify: `README.md`

- [ ] **Step 1: Extend smoke checks**

Add source checks that assert:

```js
check(dashboardSource.includes('collectDashboardTodos(projects, "todo")'), "Dashboard builds Todo lane");
check(dashboardSource.includes("cycleTodoStatus"), "Dashboard can cycle todo status");
check(projectCardSource.includes("todo.status !== \"done\""), "Project card counts unfinished todos");
check(!projectCardSource.includes("formatDateTime"), "Project card no longer shows update timestamp");
check(layoutSource.includes("lg:w-20"), "Layout uses slim desktop navigation rail");
check(timerSource.includes("clamp(2.5rem"), "Timer uses compact timer typography");
```

Keep existing smoke checks for calendar route, fixed port, notification behavior, storage normalization, and earlier quality fixes.

- [ ] **Step 2: Update README**

Document:

- homepage has In Progress and Todo lanes
- clicking status badges changes status directly from homepage
- project cards show unfinished todo count and nearest DDL
- compact dashboard is designed to fit more information into one Mac browser viewport

- [ ] **Step 3: Run full verification**

Run:

```bash
npm run build
npm run smoke
```

Expected: both commands exit 0.

- [ ] **Step 4: Manual verification checklist**

Open `http://127.0.0.1:5173/` and check:

- a `todo` item appears in the Todo lane
- clicking its status badge moves it into In Progress
- clicking the In Progress badge moves it out of the homepage and into done
- the owning project detail page still shows done items in Done Archive
- project cards show unfinished count and nearest DDL only
- the timer remains mounted and continues while navigating
