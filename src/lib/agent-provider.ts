import type { AgentId, AgentMetrics, AgentProvider } from "@/lib/domain";
import { streamAgentReply as streamOpenRouterReply } from "@/lib/openrouter";
import { streamFreeLlmReply } from "@/lib/freellmapi";

export function getAgentProvider(): AgentProvider {
  const provider = process.env.AGENT_PROVIDER || "openrouter";
  if (provider !== "openrouter" && provider !== "freellmapi") {
    throw new Error("AGENT_PROVIDER debe ser 'openrouter' o 'freellmapi'.");
  }
  return provider;
}

export function streamAgentReply(
  agent: AgentId,
  prompt: string,
  onChunk: (text: string) => void,
): Promise<AgentMetrics> {
  return getAgentProvider() === "freellmapi"
    ? streamFreeLlmReply(agent, prompt, onChunk)
    : streamOpenRouterReply(agent, prompt, onChunk);
}
