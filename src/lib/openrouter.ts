import { OpenRouter } from "@openrouter/sdk";
import type { AgentId } from "@/lib/domain";
import { fixtureForAgent } from "@/lib/bim-fixture";

const agentInstructions: Record<AgentId, string> = {
  model: "Eres especialista en consultas de modelos BIM. Responde en español, de forma breve y usa solo el fixture proporcionado.",
  clashes: "Eres especialista en coordinación BIM. Explica las interferencias, severidad y elementos implicados usando solo el fixture.",
  quantities: "Eres especialista en mediciones BIM. Responde cantidades y unidades calculables con los datos proporcionados; no inventes totales ausentes.",
  architecture: "Eres especialista BIM en arquitectura. Consulta espacios, elementos arquitectónicos y planos simulados; indica identificador, nivel y escala. Usa solo el fixture.",
  structure: "Eres especialista BIM en estructuras. Explica columnas, vigas y losas con sus propiedades disponibles. Usa solo el fixture y admite los datos ausentes.",
  mep: "Eres especialista BIM en instalaciones MEP. Distingue climatización, fontanería y electricidad. Usa solo el fixture y admite los datos ausentes.",
};

export async function streamAgentReply(
  agent: AgentId,
  prompt: string,
  onChunk: (text: string) => void,
): Promise<{ model: string; inputTokens?: number; outputTokens?: number; firstTokenMs: number | null; totalMs: number }> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL;
  if (!apiKey || !model) {
    throw new Error("Configura OPENROUTER_API_KEY y OPENROUTER_MODEL en .env.local.");
  }

  const client = new OpenRouter({ apiKey });
  const startedAt = performance.now();
  let firstTokenMs: number | null = null;
  let inputTokens: number | undefined;
  let outputTokens: number | undefined;
  let usedModel = model;
  let hasText = false;

  const stream = await client.chat.send({
    chatRequest: {
      model,
      stream: true,
      streamOptions: { includeUsage: true },
      messages: [
        { role: "system", content: agentInstructions[agent] },
        {
          role: "user",
          content: `Solicitud: ${prompt}\n\nDatos BIM simulados (${agent}):\n${fixtureForAgent(agent)}`,
        },
      ],
    },
  });

  if (!(stream instanceof ReadableStream)) {
    throw new Error("OpenRouter devolvió una respuesta no progresiva inesperada.");
  }

  for await (const chunk of stream) {
    if (chunk.error) throw new Error(chunk.error.message ?? "OpenRouter reportó un error en el stream.");
    usedModel = chunk.model || usedModel;
    const text = chunk.choices[0]?.delta.content;
    if (text) {
      hasText = true;
      firstTokenMs ??= Math.round(performance.now() - startedAt);
      onChunk(text);
    }
    if (chunk.usage) {
      inputTokens = chunk.usage.promptTokens;
      outputTokens = chunk.usage.completionTokens;
    }
  }

  if (!hasText) throw new Error("OpenRouter terminó el stream sin generar texto.");

  return {
    model: usedModel,
    inputTokens,
    outputTokens,
    firstTokenMs,
    totalMs: Math.round(performance.now() - startedAt),
  };
}
