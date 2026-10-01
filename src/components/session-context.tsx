"use client";

import { createContext, useContext, useState, type Dispatch, type ReactNode, type SetStateAction } from "react";
import type { AgentId, AgentMetrics, AgentProvider, Decision } from "@/lib/domain";

export type Message = { id: string; role: "user" | "assistant"; text: string; agent?: AgentId; outOfScope?: boolean };
export type Run = {
  id: string;
  prompt: string;
  status: "procesando" | "completo" | "fuera de alcance" | "error";
  provider?: AgentProvider;
  decision?: Decision;
  decisionMs?: number;
  metrics?: AgentMetrics;
  totalMs?: number;
  error?: string;
};

type Session = {
  messages: Message[];
  setMessages: Dispatch<SetStateAction<Message[]>>;
  runs: Run[];
  setRuns: Dispatch<SetStateAction<Run[]>>;
  busy: boolean;
  setBusy: Dispatch<SetStateAction<boolean>>;
};

const SessionContext = createContext<Session | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([
    { id: "welcome", role: "assistant", text: "Hola. Pregunta sobre el modelo BIM de demostración y te mostraré cómo JEV elige el agente adecuado." },
  ]);
  const [runs, setRuns] = useState<Run[]>([]);
  const [busy, setBusy] = useState(false);

  return <SessionContext.Provider value={{ messages, setMessages, runs, setRuns, busy, setBusy }}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const session = useContext(SessionContext);
  if (!session) throw new Error("useSession debe usarse dentro de SessionProvider.");
  return session;
}
