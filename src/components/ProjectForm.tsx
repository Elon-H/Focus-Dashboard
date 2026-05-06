import { useState, type FormEvent } from "react";
import type { Project, ProjectInput } from "../types";

interface ProjectFormProps {
  project?: Project;
  onSubmit: (input: ProjectInput) => void;
  onCancel: () => void;
}

export function ProjectForm({ project, onSubmit, onCancel }: ProjectFormProps) {
  const [name, setName] = useState(project?.name ?? "");
  const [description, setDescription] = useState(project?.description ?? "");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim()) return;
    onSubmit({ name, description });
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <label className="block">
        <span className="form-label">项目名称</span>
        <input
          className="form-input mt-1"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="例如: 论文复现、课程项目、阅读计划"
          required
        />
      </label>
      <label className="block">
        <span className="form-label">简短描述</span>
        <textarea
          className="form-input mt-1 min-h-24 resize-y"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="这个项目的目标、背景或当前阶段"
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
