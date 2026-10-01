import type { AgentId, AgentMetrics } from "@/lib/domain";
import { fixtureForAgent } from "@/lib/bim-fixture";

const agentInstructions: Record<AgentId, string> = {
  model: "Eres especialista en consultas de modelos BIM. Responde en español, de forma breve y usa solo el fixture proporcionado.",
  clashes: "Eres especialista en coordinación BIM. Explica las interferencias, severidad y elementos implicados usando solo el fixture.",
  quantities: "Eres especialista en mediciones BIM. Responde cantidades y unidades calculables con los datos proporcionados; no inventes totales ausentes.",
  architecture: "Eres especialista BIM en arquitectura. Consulta espacios y estancias (incluidas áreas de lavado), elementos arquitectónicos y planos simulados; indica identificador, nivel y superficie. Usa solo el fixture.",
  structure: "Eres especialista BIM en estructuras. Explica columnas, vigas y losas con sus propiedades disponibles. Usa solo el fixture y admite los datos ausentes.",
  mep: "Eres especialista BIM en instalaciones MEP. Distingue climatización, fontanería y electricidad; consulta también tomas de agua y lavaderos por espacio. Usa solo el fixture y admite los datos ausentes.",
};

type StreamChunk = {
  model?: string;
  error?: { message?: unknown };
  choices?: Array<{ delta?: { content?: unknown } }>;
  usage?: { prompt_tokens?: unknown; completion_tokens?: unknown; input_tokens?: unknown; output_tokens?: unknown };
};

function errorFromResponse(body: string, status: number, apiKey: string): string {
  let message = `FreeLLMAPI respondió con HTTP ${status}.`;
  try {
    const payload = JSON.parse(body) as { error?: { message?: unknown } };
    if (typeof payload.error?.message === "string") message = payload.error.message;
  } catch {
    // Keep the generic status message if the provider returned a non-JSON error.
  }
  return message.replaceAll(apiKey, "[clave oculta]").slice(0, 500);
}

export async function streamFreeLlmReply(
  agent: AgentId,
  prompt: string,
  onChunk: (text: string) => void,
): Promise<AgentMetrics> {
  const apiKey = process.env.FREELLMAPI_API_KEY;
  const baseUrl = process.env.FREELLMAPI_BASE_URL;
  const model = process.env.FREELLMAPI_MODEL || "auto";
  if (!apiKey || !baseUrl) {
    throw new Error("Configura FREELLMAPI_API_KEY y FREELLMAPI_BASE_URL en .env.local.");
  }

  let base: URL;
  try {
    base = new URL(baseUrl);
  } catch {
    throw new Error("FREELLMAPI_BASE_URL debe ser una URL HTTP o HTTPS válida sin credenciales embebidas.");
  }
  const localHosts = new Set(["localhost", "127.0.0.1", "[::1]", "host.docker.internal"]);
  if ((base.protocol !== "http:" && base.protocol !== "https:") || base.username || base.password || base.search || base.hash) {
    throw new Error("FREELLMAPI_BASE_URL debe ser una URL HTTP o HTTPS válida sin credenciales, query ni fragmento.");
  }
  if (base.protocol === "http:" && !localHosts.has(base.hostname.toLowerCase())) {
    throw new Error("FreeLLMAPI solo admite HTTP para un host local; usa HTTPS para un host remoto.");
  }
  const endpoint = `${base.toString().replace(/\/+$/, "")}/chat/completions`;

  const startedAt = performance.now();
  const abortController = new AbortController();
  const timeout = setTimeout(() => abortController.abort(), 180_000);
  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        Accept: "text/event-stream",
      },
      body: JSON.stringify({
        model,
        stream: true,
        messages: [
          { role: "system", content: agentInstructions[agent] },
          { role: "user", content: `Solicitud: ${prompt}\n\nDatos BIM simulados (${agent}):\n${fixtureForAgent(agent)}` },
        ],
      }),
      signal: abortController.signal,
      cache: "no-store",
    });
  } catch (error) {
    clearTimeout(timeout);
    if (abortController.signal.aborted) throw new Error("FreeLLMAPI excedió el tiempo límite de 180 segundos.");
    throw new Error(`No se pudo conectar con FreeLLMAPI: ${error instanceof Error ? error.message : "error de red"}`);
  }

  if (!response.ok) {
    clearTimeout(timeout);
    throw new Error(errorFromResponse(await response.text(), response.status, apiKey));
  }
  if (!response.body) {
    clearTimeout(timeout);
    throw new Error("FreeLLMAPI respondió sin un stream de datos.");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let usedModel = model;
  let firstTokenMs: number | null = null;
  let inputTokens: number | undefined;
  let outputTokens: number | undefined;
  let hasText = false;

  function handleBlock(block: string) {
    const data = block.split(/\r?\n/).filter((line) => line.startsWith("data:")).map((line) => line.slice(5).trimStart()).join("\n");
    if (!data || data === "[DONE]") return;

    let chunk: StreamChunk;
    try {
      chunk = JSON.parse(data) as StreamChunk;
    } catch {
      throw new Error("FreeLLMAPI devolvió un evento SSE inválido.");
    }
    if (typeof chunk.error?.message === "string") {
      throw new Error(chunk.error.message.replaceAll(apiKey, "[clave oculta]").slice(0, 500));
    }
    if (chunk.model) usedModel = chunk.model;
    const usage = chunk.usage;
    if (typeof usage?.prompt_tokens === "number") inputTokens = usage.prompt_tokens;
    else if (typeof usage?.input_tokens === "number") inputTokens = usage.input_tokens;
    if (typeof usage?.completion_tokens === "number") outputTokens = usage.completion_tokens;
    else if (typeof usage?.output_tokens === "number") outputTokens = usage.output_tokens;

    const content = chunk.choices?.[0]?.delta?.content;
    const text = typeof content === "string"
      ? content
      : Array.isArray(content)
        ? content.flatMap((part) => part && typeof part === "object" && "text" in part && typeof part.text === "string" ? [part.text] : []).join("")
        : "";
    if (text) {
      hasText = true;
      firstTokenMs ??= Math.round(performance.now() - startedAt);
      onChunk(text);
    }
  }

  try {
    while (true) {
      const { value, done } = await reader.read();
      buffer += decoder.decode(value, { stream: !done });
      const blocks = buffer.split(/\r?\n\r?\n/);
      buffer = blocks.pop() ?? "";
      for (const block of blocks) handleBlock(block);
      if (done) {
        if (buffer.trim()) handleBlock(buffer);
        break;
      }
    }
  } catch (error) {
    await reader.cancel().catch(() => undefined);
    if (abortController.signal.aborted) throw new Error("FreeLLMAPI excedió el tiempo límite de 180 segundos.");
    throw error;
  } finally {
    clearTimeout(timeout);
  }

  if (!hasText) throw new Error("FreeLLMAPI terminó el stream sin generar texto.");
  return {
    provider: "freellmapi",
    model: response.headers.get("x-routed-via") || usedModel,
    inputTokens,
    outputTokens,
    firstTokenMs,
    totalMs: Math.round(performance.now() - startedAt),
  };
}
