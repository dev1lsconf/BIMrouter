export type AgentId = "model" | "clashes" | "quantities";

export type Decision = {
  inBimScope: number;
  agent: AgentId;
  agentProbabilities: Record<AgentId, number>;
  agentConfidence: number;
  clarity: number;
  clarityLegend: Record<string, string>;
  clarityConfidence: number;
  model: string;
  inputTokens: number;
  outputTokens: number;
};

export type AgentMetrics = {
  model: string;
  inputTokens?: number;
  outputTokens?: number;
  firstTokenMs: number | null;
  totalMs: number;
};

export type ChatEvent =
  | { type: "decision"; decision: Decision; decisionMs: number }
  | { type: "delta"; text: string }
  | { type: "metrics"; metrics: AgentMetrics; totalMs: number }
  | { type: "complete"; message: string; totalMs: number }
  | { type: "error"; message: string; decision?: Decision; decisionMs?: number };

export const AGENTS: Record<AgentId, { label: string; description: string }> = {
  model: { label: "Modelo", description: "Elementos, niveles y propiedades" },
  clashes: { label: "Interferencias", description: "Colisiones y severidad" },
  quantities: { label: "Cantidades", description: "Mediciones por categoría y nivel" },
};

export function isAgentId(value: string): value is AgentId {
  return value === "model" || value === "clashes" || value === "quantities";
}
