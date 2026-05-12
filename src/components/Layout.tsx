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
    <div className="min-h-screen bg-[#f5f7fb] text-slate-900">
      <div className="flex min-h-screen w-full flex-col lg:flex-row">
        <aside className="border-b border-slate-200 bg-slate-950 px-4 py-3 text-white lg:sticky lg:top-0 lg:h-screen lg:w-20 lg:border-b-0 lg:border-r lg:border-slate-800 lg:px-3 lg:py-5">
          <div className="flex items-center justify-between gap-3 lg:flex-col">
            <Link
              to="/"
              className="grid h-10 w-10 place-items-center rounded-xl bg-white text-base font-black text-slate-950"
              title="Focus Projects"
            >
              F
            </Link>
            <div
              className="rounded-lg bg-emerald-400/15 px-3 py-1.5 text-center text-xs font-bold text-emerald-100 lg:px-2"
              title="Today completed focus sessions"
            >
              <p className="leading-none">{data.dailyFocusCount.count}</p>
              <p className="mt-0.5 text-[9px] uppercase tracking-normal text-emerald-200">Focus</p>
            </div>
          </div>

          <nav className="mt-3 flex gap-2 overflow-x-auto lg:mt-6 lg:flex-col lg:items-center lg:overflow-visible">
            <NavLink
              to="/"
              title="Dashboard"
              className={({ isActive }) =>
                `min-w-fit rounded-lg px-3 py-2 text-center text-xs font-bold transition lg:w-14 lg:px-2 ${
                  isActive
                    ? "bg-white text-slate-950"
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              <span className="lg:hidden">Dashboard</span>
              <span className="hidden lg:block">Home</span>
            </NavLink>
            <NavLink
              to="/calendar"
              title="Calendar"
              className={({ isActive }) =>
                `min-w-fit rounded-lg px-3 py-2 text-center text-xs font-bold transition lg:w-14 lg:px-2 ${
                  isActive
                    ? "bg-white text-slate-950"
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              Cal
            </NavLink>
            <Link
              to="/#timer"
              title="Timer"
              className="min-w-fit rounded-lg px-3 py-2 text-center text-xs font-bold text-slate-300 transition hover:bg-white/10 hover:text-white lg:w-14 lg:px-2"
            >
              Timer
            </Link>
            <Link
              to="/#projects"
              title="Projects"
              className="min-w-fit rounded-lg px-3 py-2 text-center text-xs font-bold text-slate-300 transition hover:bg-white/10 hover:text-white lg:w-14 lg:px-2"
            >
              Projects
            </Link>
          </nav>
        </aside>

        <main className="min-w-0 flex-1 px-3 py-4 sm:px-5 lg:px-5 lg:py-5">
          <div className="mx-auto max-w-[1400px] space-y-4">
            <TimerPanel />
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
