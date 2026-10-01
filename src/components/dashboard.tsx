"use client";

import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import { AGENTS, type AgentId, type AgentMetrics, type ChatEvent, type Decision } from "@/lib/domain";
import { bimFixture } from "@/lib/bim-fixture";

type Message = { id: string; role: "user" | "assistant"; text: string; agent?: AgentId; outOfScope?: boolean };
type Run = {
  id: string;
  prompt: string;
  status: "procesando" | "completo" | "fuera de alcance" | "error";
  decision?: Decision;
  decisionMs?: number;
  metrics?: AgentMetrics;
  totalMs?: number;
  error?: string;
};

const examples = [
  "¿Qué elementos y niveles tiene el modelo?",
  "¿Qué interferencias hay en Planta 1?",
  "¿Cuántas puertas aparecen en el modelo?",
  "¿Dónde encuentro los planos de Planta 1?",
  "Describe la viga B-302.",
  "¿Qué instalaciones MEP hay en el modelo?",
];

export function Dashboard() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      text: "Hola. Pregunta sobre el modelo BIM de demostración y te mostraré cómo JEV elige el agente adecuado.",
    },
  ]);
  const [runs, setRuns] = useState<Run[]>([]);
  const [prompt, setPrompt] = useState("");
  const [busy, setBusy] = useState(false);
  const latestRun = runs.at(-1);

  const totals = useMemo(() => {
    const completed = runs.filter((run) => run.status === "completo" || run.status === "fuera de alcance");
    const jevTokens = completed.reduce((sum, run) => sum + (run.decision?.inputTokens ?? 0) + (run.decision?.outputTokens ?? 0), 0);
    const hasAgentUsage = completed.some((run) => run.metrics?.inputTokens !== undefined || run.metrics?.outputTokens !== undefined);
    const agentTokens = hasAgentUsage
      ? completed.reduce((sum, run) => sum + (run.metrics?.inputTokens ?? 0) + (run.metrics?.outputTokens ?? 0), 0)
      : null;
    const times = completed.map((run) => run.totalMs).filter((value): value is number => value !== undefined);
    const averageMs = times.length ? Math.round(times.reduce((sum, value) => sum + value, 0) / times.length) : 0;
    return { jevTokens, agentTokens, averageMs };
  }, [runs]);

  async function submit(value: string) {
    const text = value.trim();
    if (!text || busy) return;

    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setBusy(true);
    setPrompt("");
    setMessages((current) => [
      ...current,
      { id: `${id}-user`, role: "user", text },
      { id: `${id}-assistant`, role: "assistant", text: "" },
    ]);
    setRuns((current) => [...current, { id, prompt: text, status: "procesando" }]);

    const updateRun = (update: Partial<Run>) => setRuns((current) => current.map((run) => run.id === id ? { ...run, ...update } : run));
    const updateAssistant = (nextText: string, append = false) => setMessages((current) => current.map((message) =>
      message.id === `${id}-assistant`
        ? { ...message, text: append ? message.text + nextText : nextText }
        : message,
    ));

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: text }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error ?? `La solicitud falló (${response.status}).`);
      }
      if (!response.body) throw new Error("El servidor no abrió el stream de respuesta.");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        buffer += decoder.decode(value, { stream: !done });
        let boundary = buffer.indexOf("\n\n");
        while (boundary !== -1) {
          const block = buffer.slice(0, boundary);
          buffer = buffer.slice(boundary + 2);
          const data = block.split("\n").find((line) => line.startsWith("data: "))?.slice(6);
          if (data) handleEvent(JSON.parse(data) as ChatEvent);
          boundary = buffer.indexOf("\n\n");
        }
        if (done) break;
      }

      function handleEvent(event: ChatEvent) {
        if (event.type === "decision") {
          updateRun({ decision: event.decision, decisionMs: event.decisionMs });
          setMessages((current) => current.map((message) => message.id === `${id}-assistant`
            ? { ...message, agent: event.decision.inBimScope >= 0.5 ? event.decision.agent : undefined, outOfScope: event.decision.inBimScope < 0.5 }
            : message));
        }
        if (event.type === "delta") updateAssistant(event.text, true);
        if (event.type === "metrics") updateRun({ metrics: event.metrics, totalMs: event.totalMs, status: "completo" });
        if (event.type === "complete") updateRun({ totalMs: event.totalMs, status: "fuera de alcance" }), updateAssistant(event.message);
        if (event.type === "error") {
          updateRun({ status: "error", error: event.message });
          updateAssistant(`No se pudo completar la solicitud. ${event.message}`);
        }
      }

      if (busy) setBusy(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error inesperado.";
      updateRun({ status: "error", error: message });
      updateAssistant(`No se pudo completar la solicitud. ${message}`);
    } finally {
      setBusy(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void submit(prompt);
  }

  function newSession() {
    if (busy) return;
    setMessages([{ id: "welcome", role: "assistant", text: "Sesión nueva. Prueba cualquiera de las seis áreas BIM disponibles." }]);
    setRuns([]);
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark">J</span><span>jev<span className="brand-light">router</span></span></div>
        <div className="workspace-label">WORKSPACE</div>
        <div className="workspace-switch"><span className="workspace-dot" /> BIM Demo <span className="chevron">⌄</span></div>
        <div className="nav-group">
          <div className="workspace-label">PROYECTO</div>
          <a className="nav-item active" href="#overview"><span className="nav-symbol">◫</span> Overview</a>
          <a className="nav-item" href="#decision-panel"><span className="nav-symbol">⌘</span> Decisiones</a>
          <a className="nav-item" href="#activity-panel"><span className="nav-symbol">◷</span> Actividad</a>
          <a className="nav-item" href="#bim-panel" aria-label="BIM, datos simulados"><span className="nav-symbol">▦</span> BIM</a>
        </div>
        <div className="sidebar-bottom">
          <div className="sidebar-status"><span className="status-dot" /> Entorno local</div>
          <div className="profile"><span className="avatar">JD</span><span><strong>Demo BIM</strong><small>Sesión local</small></span><span className="profile-menu">···</span></div>
        </div>
      </aside>

      <section className="main-column">
        <header className="topbar">
          <div className="breadcrumbs"><span>Proyectos</span><span className="crumb-slash">/</span><strong>JEV BIM Router</strong></div>
          <div className="topbar-right"><span className={`live-indicator ${latestRun?.status === "error" ? "failed" : latestRun?.metrics ? "verified" : ""}`}><i />{latestRun?.status === "error" ? "ERROR API" : latestRun?.metrics ? "RESPUESTA EN VIVO" : "JEV + OPENROUTER"}</span></div>
        </header>

        <div className="content" id="overview">
          <div className="page-heading">
            <div><div className="eyebrow">OBSERVABILIDAD <span>/</span> DEMO BIM</div><h1>Agent Router</h1><p>Enrutamiento probabilístico con JEV System 1</p></div>
            <button className="button button-secondary" onClick={newSession} disabled={busy}><span>＋</span> Nueva sesión</button>
          </div>

          <div className="metrics-grid">
            <MetricCard label="Solicitudes" value={String(runs.length)} detail="esta sesión" marker="↗" />
            <MetricCard label="Tokens JEV" value={formatNumber(totals.jevTokens)} detail="entrada + salida" marker="◈" />
            <MetricCard label="Tokens agente" value={totals.agentTokens === null ? (runs.length ? "—" : "0") : formatNumber(totals.agentTokens)} detail="OpenRouter" marker="◈" />
            <MetricCard label="Tiempo medio" value={totals.averageMs ? `${formatNumber(totals.averageMs)} ms` : "—"} detail="extremo a extremo" marker="◷" />
          </div>

          <div className="workspace-grid">
            <section className="panel chat-panel">
              <div className="panel-header"><div><h2>Chat de enrutamiento</h2><p>Pregunta al modelo BIM simulado</p></div><span className="panel-menu">···</span></div>
              <div className="chat-transcript" aria-live="polite">
                {messages.map((message) => (
                  <div className={`message-row ${message.role}`} key={message.id}>
                    {message.role === "assistant" && <span className="assistant-avatar">J</span>}
                    <div className="message-content">
                      {message.role === "assistant" && <div className="message-label">JEV ROUTER <span>·</span>{message.agent ? <>AGENTE ASIGNADO: <b>{AGENTS[message.agent].label}</b></> : message.outOfScope ? "FUERA DE ALCANCE" : "BIM DEMO"}</div>}
                      <div className={`message-bubble ${message.role}`}>{message.text || <span className="typing"><i /><i /><i /></span>}</div>
                    </div>
                    {message.role === "user" && <span className="user-avatar">TÚ</span>}
                  </div>
                ))}
              </div>
              {runs.length === 0 && <div className="example-prompts"><span>PRUEBA UNA CONSULTA</span>{examples.map((example) => <button key={example} onClick={() => void submit(example)}>{example}<b>↗</b></button>)}</div>}
              <form className="composer" onSubmit={handleSubmit}>
                <label className="sr-only" htmlFor="prompt">Escribe una consulta BIM</label>
                <textarea id="prompt" rows={2} value={prompt} onChange={(event) => setPrompt(event.target.value)} placeholder="Escribe una consulta sobre el modelo BIM…" disabled={busy} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); void submit(prompt); } }} />
                <div className="composer-footer"><span>Enter para enviar <span className="keycap">↵</span> · Shift + Enter para nueva línea</span><button className="send-button" type="submit" disabled={busy || !prompt.trim()} aria-label="Enviar consulta">↑</button></div>
              </form>
              <div className="chat-footnote"><span>◈</span> JEV decide · OpenRouter responde · BIM simulado</div>
            </section>

            <aside className="right-column">
              <section className="panel decision-panel" id="decision-panel">
                <div className="panel-header"><div><h2>Última decisión</h2><p>Evaluación de JEV</p></div><span className="decision-state">{latestRun?.status === "procesando" ? "EN CURSO" : latestRun?.status === "error" ? "ERROR" : latestRun?.decision ? "COMPLETADA" : "ESPERANDO"}</span></div>
                {latestRun?.decision ? <DecisionDetails run={latestRun} /> : latestRun?.error ? <DecisionError message={latestRun.error} /> : <EmptyDecision />}
              </section>

              <section className="panel activity-panel" id="activity-panel">
                <div className="panel-header"><div><h2>Actividad reciente</h2><p>Eventos de esta sesión</p></div><span className="activity-count">{runs.length}</span></div>
                {runs.length === 0 ? <div className="empty-activity">Las decisiones y métricas aparecerán aquí.</div> : <div className="activity-list">{[...runs].reverse().slice(0, 5).map((run) => <ActivityRow key={run.id} run={run} />)}</div>}
              </section>
              <div className="provider-note"><span className="lock-mark">⌑</span><span>Las claves API permanecen en el servidor.<br /><a href="/flow.html" target="_blank" rel="noreferrer">Ver diagrama del flujo <b>↗</b></a></span></div>
            </aside>
          </div>
          <BimDataPanel />
          <footer className="page-footer"><span>JEV BIM ROUTER <b>·</b> PoC local</span><span>System 1 <b>·</b> TypeSafe AI</span></footer>
        </div>
      </section>
    </main>
  );
}

function MetricCard({ label, value, detail, marker }: { label: string; value: string; detail: string; marker: string }) {
  return <div className="metric-card"><div className="metric-label">{label}<span>{marker}</span></div><strong>{value}</strong><small>{detail}</small></div>;
}

function EmptyDecision() {
  return <div className="empty-decision"><div className="decision-orbit">J</div><strong>Esperando una solicitud</strong><span>Choice puede asignar cualquiera de estas seis áreas BIM:</span><div className="agent-area-list">{Object.entries(AGENTS).map(([id, agent]) => <div key={id}><b>{agent.label}</b><span>{agent.description}</span></div>)}</div><div className="primitive-list"><span><i /> Noul <small>ámbito BIM</small></span><span><i /> Choice <small>agente</small></span><span><i /> Score <small>claridad</small></span></div></div>;
}

function DecisionError({ message }: { message: string }) {
  return <div className="decision-error" role="alert"><span className="error-icon">!</span><strong>No se pudo evaluar la solicitud</strong><p>{message}</p></div>;
}

function DecisionDetails({ run }: { run: Run }) {
  const decision = run.decision!;
  const accepted = decision.inBimScope >= 0.5;
  return <div className="decision-details">
    <div className="route-result"><div><span className="result-label">AGENTE SELECCIONADO</span><strong>{accepted ? AGENTS[decision.agent].label : "Fuera de alcance"}</strong></div><span className={`route-badge ${accepted ? "success" : "warning"}`}>{accepted ? "ROUTED" : "REJECTED"}</span></div>
    <div className="primitive-row"><div><span className="primitive-name"><i className="primitive-dot noul" /> Noul <small>Ámbito BIM</small></span><strong>{Math.round(decision.inBimScope * 100)}<small>%</small></strong></div><div className="progress-track"><span className={accepted ? "bar-green" : "bar-amber"} style={{ width: `${Math.round(decision.inBimScope * 100)}%` }} /></div><div className="threshold-note">Umbral de ruta <b>50%</b></div></div>
    <div className="primitive-row"><div><span className="primitive-name"><i className="primitive-dot choice" /> Choice <small>Distribución</small></span><strong>{Math.round(decision.agentConfidence * 100)}<small>%</small></strong></div><div className="choice-bars">{Object.entries(decision.agentProbabilities).map(([agent, probability]) => <div className="choice-bar" key={agent}><span>{AGENTS[agent as keyof typeof AGENTS].label}</span><span className="bar-track"><i style={{ width: `${Math.round(probability * 100)}%` }} /></span><b>{Math.round(probability * 100)}%</b></div>)}</div></div>
    <div className="primitive-row score-row"><div><span className="primitive-name"><i className="primitive-dot score" /> Score <small>Claridad</small></span><strong>{decision.clarity.toFixed(1)}<small> / 5</small></strong></div><div className="score-caption">{decision.clarityLegend[String(Math.round(decision.clarity))] ?? "Claridad del prompt"}</div></div>
    <div className="execution-stats"><div><span>JEV LATENCIA</span><strong>{run.decisionMs ?? "—"}<small> ms</small></strong></div><div><span>JEV TOKENS</span><strong>{formatNumber(decision.inputTokens + decision.outputTokens)}</strong></div></div>
    {run.metrics && <div className="execution-stats agent-stats"><div><span>PRIMER TOKEN</span><strong>{run.metrics.firstTokenMs ?? "—"}<small> ms</small></strong></div><div><span>AGENTE TOTAL</span><strong>{run.metrics.totalMs}<small> ms</small></strong></div><div><span>TOKENS OPENROUTER</span><strong>{run.metrics.inputTokens === undefined && run.metrics.outputTokens === undefined ? "No informado" : formatNumber((run.metrics.inputTokens ?? 0) + (run.metrics.outputTokens ?? 0))}</strong></div></div>}
    <div className="model-name"><span>MODELO JEV</span><b>{decision.model}</b>{run.metrics && <><span>MODELO OPENROUTER</span><b>{run.metrics.model}</b></>}</div>
    {run.error && <div className="inline-error" role="alert">{run.error}</div>}
  </div>;
}

function ActivityRow({ run }: { run: Run }) {
  const name = run.decision ? AGENTS[run.decision.agent].label : "Solicitud BIM";
  return <div className="activity-row"><span className={`activity-dot ${run.status === "error" ? "error" : run.status === "procesando" ? "pending" : ""}`} /><div><strong>{name}</strong><span>{run.prompt}</span></div><small>{run.totalMs !== undefined ? `${run.totalMs} ms` : run.status}</small></div>;
}

function BimDataPanel() {
  return <section className="panel bim-panel" id="bim-panel">
    <div className="panel-header"><div><h2>BIM · Datos simulados</h2><p>Fixture local completo usado por los seis agentes</p></div><span className="fixture-badge">LOCAL</span></div>
    <div className="bim-data-content">
      <div className="bim-summary">
        <div><span>PROYECTO</span><strong>{bimFixture.project}</strong></div>
        <div><span>UNIDAD BASE</span><strong>{bimFixture.units}</strong></div>
        <div><span>NIVELES</span><strong>{bimFixture.levels.join(" · ")}</strong></div>
      </div>

      <BimDataGroup title={`Elementos del modelo · ${bimFixture.elements.length}`}>
        <BimTable headers={["ID", "Tipo", "Nivel", "Propiedades"]}>
          {bimFixture.elements.map((element) => <tr key={element.id}><td>{element.id}</td><td>{element.type}</td><td>{element.level}</td><td>{formatFields(element, ["id", "type", "level"])}</td></tr>)}
        </BimTable>
      </BimDataGroup>

      <div className="bim-data-columns">
        <BimDataGroup title={`Planos · ${bimFixture.architecture.sheets.length}`}>
          <BimTable headers={["ID", "Plano", "Nivel", "Escala"]}>
            {bimFixture.architecture.sheets.map((sheet) => <tr key={sheet.id}><td>{sheet.id}</td><td>{sheet.name}</td><td>{sheet.level}</td><td>{sheet.scale}</td></tr>)}
          </BimTable>
        </BimDataGroup>
        <BimDataGroup title={`Espacios · ${bimFixture.architecture.spaces.length}`}>
          <BimTable headers={["ID", "Espacio", "Nivel", "Área"]}>
            {bimFixture.architecture.spaces.map((space) => <tr key={space.id}><td>{space.id}</td><td>{space.name}</td><td>{space.level}</td><td>{space.area} {space.unit}</td></tr>)}
          </BimTable>
        </BimDataGroup>
      </div>

      <BimDataGroup title={`Estructura · ${bimFixture.structure.system}`}>
        <BimTable headers={["ID", "Elemento", "Nivel", "Propiedades"]}>
          {bimFixture.structure.elements.map((element) => <tr key={element.id}><td>{element.id}</td><td>{element.type}</td><td>{element.level}</td><td>{formatFields(element, ["id", "type", "level"])}</td></tr>)}
        </BimTable>
      </BimDataGroup>

      <BimDataGroup title="Instalaciones MEP">
        <div className="mep-groups">{Object.entries(bimFixture.mep).map(([system, elements]) => <div className="mep-group" key={system}><strong>{system === "hvac" ? "Climatización" : system === "plumbing" ? "Fontanería" : "Electricidad"}</strong>{elements.map((element) => <div className="mep-element" key={element.id}><b>{element.id} · {element.type}</b><span>{element.level} · {formatFields(element, ["id", "type", "level"])}</span></div>)}</div>)}</div>
      </BimDataGroup>

      <BimDataGroup title={`Interferencias · ${bimFixture.clashes.length}`}>
        <BimTable headers={["ID", "Nivel", "Severidad", "Elementos", "Descripción"]}>
          {bimFixture.clashes.map((clash) => <tr key={clash.id}><td>{clash.id}</td><td>{clash.level}</td><td>{clash.severity}</td><td>{clash.elements.join(" · ")}</td><td>{clash.description}</td></tr>)}
        </BimTable>
      </BimDataGroup>
      <p className="fixture-footnote">Datos ficticios de demostración; no representan un modelo BIM real.</p>
    </div>
  </section>;
}

function BimDataGroup({ title, children }: { title: string; children: ReactNode }) {
  return <section className="bim-data-group"><h3>{title}</h3>{children}</section>;
}

function BimTable({ headers, children }: { headers: string[]; children: ReactNode }) {
  return <div className="bim-table-wrap"><table className="bim-table"><thead><tr>{headers.map((header) => <th key={header}>{header}</th>)}</tr></thead><tbody>{children}</tbody></table></div>;
}

function formatFields(value: object, omitted: string[]) {
  const labels: Record<string, string> = {
    area: "Área (m²)", height: "Alto (m)", length: "Longitud (m)", quantity: "Unidades", thickness: "Espesor (m)",
    width: "Ancho (m)", section: "Sección", system: "Sistema",
  };
  return Object.entries(value).filter(([key]) => !omitted.includes(key)).map(([key, field]) => `${labels[key] ?? key}: ${String(field)}`).join(" · ");
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("es-ES").format(value);
}
