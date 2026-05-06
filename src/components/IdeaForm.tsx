import { useState, type FormEvent } from "react";
import type { Idea, IdeaInput } from "../types";

interface IdeaFormProps {
  idea?: Idea;
  onSubmit: (input: IdeaInput) => void;
  onCancel: () => void;
}

export function IdeaForm({ idea, onSubmit, onCancel }: IdeaFormProps) {
  const [title, setTitle] = useState(idea?.title ?? "");
  const [content, setContent] = useState(idea?.content ?? "");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim()) return;
    onSubmit({ title, content });
  }

  return (
    <form className="space-y-4 rounded-lg border border-slate-200 bg-slate-50 p-4" onSubmit={handleSubmit}>
      <label className="block">
        <span className="form-label">Idea title</span>
        <input
          className="form-input mt-1"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="一个可以推进项目的想法"
          required
        />
      </label>
      <label className="block">
        <span className="form-label">Content</span>
        <textarea
          className="form-input mt-1 min-h-28 resize-y"
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder="记录上下文、假设或下一步"
        />
      </label>
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
