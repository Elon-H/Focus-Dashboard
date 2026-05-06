import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { EmptyState } from "../components/EmptyState";
import { Modal } from "../components/Modal";
import { ProjectCard } from "../components/ProjectCard";
import { ProjectForm } from "../components/ProjectForm";
import { useAppStore } from "../stores/AppStoreContext";
import type { ProjectInput } from "../types";

export function DashboardPage() {
  const navigate = useNavigate();
  const { projects, createProject, addDemoProject } = useAppStore();
  const [isProjectModalOpen, setProjectModalOpen] = useState(false);

  function handleCreateProject(input: ProjectInput) {
    const projectId = createProject(input);
    setProjectModalOpen(false);
    navigate(`/projects/${projectId}`);
  }

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">
              Dashboard
            </p>
            <h2 className="mt-2 text-3xl font-bold text-slate-950">项目待办管理</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              把项目、想法、todo、参考资料和每日专注 session 放在一个本地工作台里。
            </p>
          </div>
          <button className="btn btn-primary" type="button" onClick={() => setProjectModalOpen(true)}>
            创建项目
          </button>
        </div>
      </section>

      <section id="projects" className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Projects
            </p>
            <h2 className="mt-1 text-2xl font-bold text-slate-950">所有项目</h2>
          </div>
          <p className="text-sm font-semibold text-slate-600">{projects.length} projects</p>
        </div>

        {projects.length === 0 ? (
          <EmptyState
            title="还没有项目"
            description="创建第一个项目后，你可以在详情页记录 ideas、todo list 和 references。也可以先加载一份 demo 数据检查交互。"
            actionLabel="创建第一个项目"
            onAction={() => setProjectModalOpen(true)}
            secondaryLabel="加载 demo 项目"
            onSecondaryAction={addDemoProject}
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
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
