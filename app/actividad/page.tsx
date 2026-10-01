"use client";

import { useMemo } from "react";
import { AGENTS } from "@/lib/domain";
import { AppFrame } from "@/components/app-frame";
import { useSession, type Run } from "@/components/session-context";

export default function ActivityPage() {
  const { runs } = useSession();
  const totals = useMemo(() => {
    const completed = runs.filter((run) => run.status === "completo" || run.status === "fuera de alcance");
    const agentRuns = completed.filter((run) => run.metrics);
    const hasAgentUsage = agentRuns.some((run) => run.metrics?.inputTokens !== undefined || run.metrics?.outputTokens !== undefined);
    const durations = completed.map((run) => run.totalMs).filter((value): value is number => value !== undefined);
    return {
      jev: completed.reduce((sum, run) => sum + (run.decision?.inputTokens ?? 0) + (run.decision?.outputTokens ?? 0), 0),
      agent: hasAgentUsage ? agentRuns.reduce((sum, run) => sum + (run.metrics?.inputTokens ?? 0) + (run.metrics?.outputTokens ?? 0), 0) : null,
      agentRuns: agentRuns.length,
      avg: durations.length ? Math.round(durations.reduce((sum, value) => sum + value, 0) / durations.length) : 0,
    };
  }, [runs]);

  return <AppFrame activePage="activity">
    <div className="content">
      <div className="page-heading"><div><div className="eyebrow">OBSERVABILIDAD <span>/</span> SESIÓN</div><h1>Actividad</h1><p>Solicitudes, decisiones JEV y métricas de los agentes en esta sesión.</p></div><span className="activity-count">{runs.length} solicitudes</span></div>
      <div className="metrics-grid">
        <Metric label="Solicitudes" value={String(runs.length)} hint="en esta sesión" />
        <Metric label="Tokens JEV" value={number(totals.jev)} hint="entrada + salida" />
        <Metric label="Tokens agente" value={totals.agent === null ? (totals.agentRuns ? "No informado" : "0") : number(totals.agent)} hint="uso informado por el proveedor" />
        <Metric label="Tiempo medio" value={totals.avg ? `${number(totals.avg)} ms` : "—"} hint="solicitudes completadas" />
      </div>
      <section className="panel activity-page-panel">
        <div className="panel-header"><div><h2>Registro de solicitudes</h2><p>Los datos se conservan solo mientras esta sesión siga abierta.</p></div></div>
        {runs.length === 0 ? <div className="activity-empty-state"><span>◷</span><h2>Sin actividad todavía</h2><p>Envía una consulta desde el Overview para ver aquí el agente asignado, el resultado JEV y sus métricas.</p></div> : <div className="activity-table-wrap">
          <table className="activity-table"><thead><tr><th>Estado</th><th>Consulta</th><th>Agente asignado</th><th>Proveedor</th><th>Noul</th><th>Score</th><th>Tokens JEV</th><th>Tokens agente</th><th>Decisión JEV</th><th>Primer token</th><th>Tiempo total</th></tr></thead>
            <tbody>{[...runs].reverse().map((run) => <ActivityEntry key={run.id} run={run} />)}</tbody>
          </table>
        </div>}
      </section>
      <footer className="page-footer"><span>JEV BIM ROUTER <b>·</b> Métricas de sesión</span><span>Sin persistencia en servidor</span></footer>
    </div>
  </AppFrame>;
}

function Metric({ label, value, hint }: { label: string; value: string; hint: string }) {
  return <div className="metric-card"><div className="metric-label">{label}</div><strong>{value}</strong><small>{hint}</small></div>;
}

function ActivityEntry({ run }: { run: Run }) {
  const agent = run.decision && run.decision.inBimScope >= 0.5 ? AGENTS[run.decision.agent].label : run.decision ? "Fuera de alcance" : "Pendiente";
  const jevTokens = run.decision ? run.decision.inputTokens + run.decision.outputTokens : undefined;
  const agentTokens = run.metrics && (run.metrics.inputTokens !== undefined || run.metrics.outputTokens !== undefined)
    ? (run.metrics.inputTokens ?? 0) + (run.metrics.outputTokens ?? 0)
    : undefined;
  const status = run.status === "completo" ? "Completada" : run.status === "error" ? "Error" : run.status === "procesando" ? "En curso" : "Fuera de alcance";
  return <tr>
    <td><span className={`activity-status ${run.status}`}>{status}</span></td>
    <td className="activity-prompt" title={run.prompt}>{run.prompt}{run.error && <small role="alert">{run.error}</small>}</td>
    <td>{agent}</td>
    <td>{run.provider === "freellmapi" ? "FreeLLMAPI" : run.provider === "openrouter" ? "OpenRouter" : "—"}</td>
    <td>{run.decision ? `${Math.round(run.decision.inBimScope * 100)}%` : "—"}</td>
    <td>{run.decision ? `${run.decision.clarity.toFixed(1)} / 5` : "—"}</td>
    <td>{jevTokens === undefined ? "—" : number(jevTokens)}</td>
    <td>{agentTokens === undefined ? "—" : number(agentTokens)}</td>
    <td>{run.decisionMs === undefined ? "—" : `${number(run.decisionMs)} ms`}</td>
    <td>{run.metrics?.firstTokenMs == null ? "—" : `${number(run.metrics.firstTokenMs)} ms`}</td>
    <td>{run.totalMs === undefined ? "—" : `${number(run.totalMs)} ms`}</td>
  </tr>;
}

function number(value: number) {
  return new Intl.NumberFormat("es-ES").format(value);
}
