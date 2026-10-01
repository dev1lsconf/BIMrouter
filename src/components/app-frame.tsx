"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useSession } from "@/components/session-context";

type Props = { children: ReactNode; activePage: "overview" | "activity" | "bim" };

export function AppFrame({ children, activePage }: Props) {
  const { runs } = useSession();
  const latestRun = runs.at(-1);
  const isActive = (page: Props["activePage"]) => activePage === page;
  const statusClass = latestRun?.status === "error" ? "failed" : latestRun?.metrics ? "verified" : "";
  const statusText = latestRun?.status === "error" ? "ERROR API" : latestRun?.metrics ? "RESPUESTA EN VIVO" : "BIMrouter";

  return <main className="app-shell">
    <aside className="sidebar">
      <div className="brand"><span className="brand-mark">B</span><span>BIM<span className="brand-light">router</span></span></div>
      <div className="workspace-label">WORKSPACE</div>
      <div className="workspace-switch"><span className="workspace-dot" /> BIM Demo <span className="chevron">⌄</span></div>
      <nav className="nav-group" aria-label="Navegación del proyecto">
        <div className="workspace-label">PROYECTO</div>
        <Link className={`nav-item ${isActive("overview") ? "active" : ""}`} href="/"><span className="nav-symbol">◫</span> Overview</Link>
        <Link className="nav-item" href="/#decision-panel"><span className="nav-symbol">⌘</span> Decisiones</Link>
        <Link className={`nav-item ${isActive("activity") ? "active" : ""}`} href="/actividad"><span className="nav-symbol">◷</span> Actividad</Link>
        <Link className={`nav-item ${isActive("bim") ? "active" : ""}`} href="/bim" aria-label="BIM, datos simulados"><span className="nav-symbol">▦</span> BIM</Link>
      </nav>
      <div className="sidebar-bottom">
        <div className="sidebar-status"><span className="status-dot" /> Entorno local</div>
        <div className="profile"><span className="avatar">JD</span><span><strong>Demo BIM</strong><small>Sesión local</small></span><span className="profile-menu">···</span></div>
      </div>
    </aside>
    <section className="main-column">
      <header className="topbar">
        <div className="breadcrumbs"><span>Proyectos</span><span className="crumb-slash">/</span><strong>BIMrouter</strong></div>
        <div className="topbar-right"><span className={`live-indicator ${statusClass}`}><i />{statusText}</span></div>
      </header>
      {children}
    </section>
  </main>;
}
