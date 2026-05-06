import { useState, type FormEvent } from "react";
import type { ReferenceInput, ReferenceItem } from "../types";

interface ReferenceFormProps {
  reference?: ReferenceItem;
  onSubmit: (input: ReferenceInput) => void;
  onCancel: () => void;
}

export function ReferenceForm({ reference, onSubmit, onCancel }: ReferenceFormProps) {
  const [title, setTitle] = useState(reference?.title ?? "");
  const [url, setUrl] = useState(reference?.url ?? "");
  const [note, setNote] = useState(reference?.note ?? "");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim()) return;
    onSubmit({ title, url, note });
  }

  return (
    <form className="space-y-4 rounded-lg border border-slate-200 bg-slate-50 p-4" onSubmit={handleSubmit}>
      <label className="block">
        <span className="form-label">Reference title</span>
        <input
          className="form-input mt-1"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="论文、文档、网页或笔记名称"
          required
        />
      </label>
      <label className="block">
        <span className="form-label">URL</span>
        <input
          className="form-input mt-1"
          type="url"
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          placeholder="https://..."
        />
      </label>
      <label className="block">
        <span className="form-label">Note</span>
        <textarea
          className="form-input mt-1 min-h-24 resize-y"
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="为什么保存、如何使用、关键页码"
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
