import { useEffect, type ReactNode } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useAppStore } from "../stores/AppStoreContext";
import { TimerPanel } from "./TimerPanel";

export function Layout({ children }: { children: ReactNode }) {
  const { data } = useAppStore();
  const location = useLocation();

  useEffect(() => {
    if (!location.hash) return;

    window.setTimeout(() => {
      document
        .getElementById(location.hash.slice(1))
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  }, [location.hash, location.pathname]);

  return (
    <div className="min-h-screen bg-[#f6f7f4] text-slate-900">
      <div className="mx-auto flex min-h-screen w-full max-w-[1480px] flex-col lg:flex-row">
        <aside className="border-b border-slate-200 bg-white/85 px-5 py-4 backdrop-blur lg:sticky lg:top-0 lg:h-screen lg:w-72 lg:border-b-0 lg:border-r lg:px-6 lg:py-7">
          <div className="flex items-center justify-between gap-4 lg:block">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">
                Local Workspace
              </p>
              <h1 className="mt-2 text-2xl font-bold tracking-normal text-slate-950">
                Focus Projects
              </h1>
            </div>
            <div className="rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2 text-right lg:mt-6 lg:text-left">
              <p className="text-xs font-medium text-emerald-800">Today</p>
              <p className="text-xl font-bold text-emerald-950">
                {data.dailyFocusCount.count}
                <span className="ml-1 text-sm font-semibold text-emerald-800">sessions</span>
              </p>
            </div>
          </div>

          <nav className="mt-4 flex gap-2 lg:mt-8 lg:flex-col">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 text-sm font-semibold transition ${
                  isActive
                    ? "bg-slate-950 text-white"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                }`
              }
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/calendar"
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 text-sm font-semibold transition ${
                  isActive
                    ? "bg-slate-950 text-white"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                }`
              }
            >
              Calendar
            </NavLink>
            <Link
              to="/#timer"
              className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
            >
              Timer
            </Link>
            <Link
              to="/#projects"
              className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
            >
              Projects
            </Link>
          </nav>

          <div className="mt-8 hidden rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 lg:block">
            <p className="font-semibold text-slate-900">本地优先</p>
            <p className="mt-2 leading-6">
              数据保存在浏览器 localStorage 中，不需要后端、登录或外部 API。
            </p>
          </div>
        </aside>

        <main className="min-w-0 flex-1 px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
          <div className="space-y-6">
            <TimerPanel />
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
