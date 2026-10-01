import { NextResponse } from "next/server";
import { routeWithJev } from "@/lib/jev";
import { streamAgentReply } from "@/lib/openrouter";
import type { ChatEvent } from "@/lib/domain";
import { validatePrompt } from "@/lib/prompt-validation";

export const runtime = "nodejs";

function safeErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : "Error inesperado.";
  return message.replace(/https:\/\/openrouter\.ai\/workspaces\/[^\s)]+/g, "OpenRouter dashboard");
}

function eventStream(run: (send: (event: ChatEvent) => void) => Promise<void>) {
  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: ChatEvent) => controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
      try {
        await run(send);
      } catch (error) {
        send({ type: "error", message: safeErrorMessage(error) });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}

export async function POST(request: Request) {
  let prompt: unknown;
  try {
    ({ prompt } = await request.json());
  } catch {
    return NextResponse.json({ error: "El cuerpo debe ser JSON válido." }, { status: 400 });
  }

  const validation = validatePrompt(prompt);
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const normalizedPrompt = validation.prompt;
  return eventStream(async (send) => {
    const totalStartedAt = performance.now();
    const decisionStartedAt = performance.now();
    const decision = await routeWithJev(normalizedPrompt);
    const decisionMs = Math.round(performance.now() - decisionStartedAt);
    const rejected = decision.inBimScope < 0.5;
    send({ type: "decision", decision, decisionMs });

    if (rejected) {
      send({
        type: "complete",
        message: "Esta solicitud parece estar fuera del ámbito BIM de la demo. Prueba con una consulta de modelo, interferencias, cantidades, arquitectura y planos, estructura o instalaciones MEP.",
        totalMs: Math.round(performance.now() - totalStartedAt),
      });
      return;
    }

    const metrics = await streamAgentReply(decision.agent, normalizedPrompt, (text) => send({ type: "delta", text }));
    send({ type: "metrics", metrics, totalMs: Math.round(performance.now() - totalStartedAt) });
  });
}
