import { useState, type FormEvent } from "react";
import type { ProjectTodo, TodoInput, TodoPriority, TodoStatus } from "../types";

interface TodoFormProps {
  todo?: ProjectTodo;
  onSubmit: (input: TodoInput) => void;
  onCancel: () => void;
}

export function TodoForm({ todo, onSubmit, onCancel }: TodoFormProps) {
  const [title, setTitle] = useState(todo?.title ?? "");
  const [description, setDescription] = useState(todo?.description ?? "");
  const [status, setStatus] = useState<TodoStatus>(todo?.status ?? "todo");
  const [ddl, setDdl] = useState(todo?.ddl ?? "");
  const [expectedFinishTime, setExpectedFinishTime] = useState(todo?.expectedFinishTime ?? "");
  const [priority, setPriority] = useState<TodoPriority>(todo?.priority ?? "medium");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim()) return;
    onSubmit({ title, description, status, ddl, expectedFinishTime, priority });
  }

  return (
    <form className="space-y-4 rounded-lg border border-slate-200 bg-slate-50 p-4" onSubmit={handleSubmit}>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block md:col-span-2">
          <span className="form-label">Todo title</span>
          <input
            className="form-input mt-1"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="需要完成的任务"
            required
          />
        </label>
        <label className="block md:col-span-2">
          <span className="form-label">Description</span>
          <textarea
            className="form-input mt-1 min-h-24 resize-y"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="任务范围、验收标准或备注"
          />
        </label>
        <label className="block">
          <span className="form-label">Status</span>
          <select
            className="form-input mt-1"
            value={status}
            onChange={(event) => setStatus(event.target.value as TodoStatus)}
          >
            <option value="todo">todo</option>
            <option value="in-progress">in-progress</option>
            <option value="done">done</option>
          </select>
        </label>
        <label className="block">
          <span className="form-label">Priority</span>
          <select
            className="form-input mt-1"
            value={priority}
            onChange={(event) => setPriority(event.target.value as TodoPriority)}
          >
            <option value="low">low</option>
            <option value="medium">medium</option>
            <option value="high">high</option>
          </select>
        </label>
        <label className="block">
          <span className="form-label">DDL</span>
          <input
            className="form-input mt-1"
            type="date"
            value={ddl}
            onChange={(event) => setDdl(event.target.value)}
          />
        </label>
        <label className="block">
          <span className="form-label">Expected finish time</span>
          <input
            className="form-input mt-1"
            type="datetime-local"
            value={expectedFinishTime}
            onChange={(event) => setExpectedFinishTime(event.target.value)}
          />
        </label>
      </div>
      <div className="flex justify-end gap-3">
        <button className="btn btn-secondary" type="button" onClick={onCancel}>
          取消
        </button>
        <button className="btn btn-primary" type="submit">
          保存
        </button>
      </div>
    </form>
  );
}
