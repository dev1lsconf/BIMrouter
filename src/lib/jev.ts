import { choice, noul, score, TypeSafeClient } from "@typesafe-ai/sdk";
import { isAgentId, type AgentId, type Decision } from "@/lib/domain";

const agentOptions = {
  model: "Consulta general de elementos, niveles desde sótano hasta cubierta, tipos, cantidades y propiedades del modelo BIM.",
  clashes: "Analiza interferencias en cualquier nivel del proyecto, sus elementos implicados, ubicación y severidad.",
  quantities: "Responde mediciones y cantidades agregadas por categoría o por nivel, desde sótano hasta cubierta.",
  architecture: "Consulta espacios desde sótano hasta cubierta, incluidas áreas de lavado, muros, puertas, ventanas, planos y láminas arquitectónicas.",
  structure: "Consulta elementos y propiedades estructurales por nivel, como columnas, vigas y losas.",
  mep: "Consulta instalaciones MEP por nivel: climatización, ventilación, drenaje, fontanería y electricidad.",
} as const;

const clarityLevels = [
  "Muy ambiguo: no identifica qué quiere saber.",
  "Poco claro: falta el elemento o el alcance.",
  "Parcialmente claro: se entiende la intención con datos incompletos.",
  "Claro: indica el tema y el resultado esperado.",
  "Muy claro: especifica tema, alcance y dato requerido.",
] as const;

export async function routeWithJev(prompt: string): Promise<Decision> {
  if (!process.env.TYPESAFE_API_KEY) {
    throw new Error("Falta configurar TYPESAFE_API_KEY en .env.local.");
  }

  const client = new TypeSafeClient({ logLevel: "error" });
  const result = await client.systemOne({
    state: { prompt },
    questions: {
      inBimScope: noul(
        "¿Esta solicitud trata sobre un modelo BIM, sus planos, espacios, estructura o instalaciones?",
        {
          true: "La solicitud pide información sobre el modelo BIM simulado, sus planos, arquitectura, estructura, instalaciones, interferencias o cantidades.",
          false: "La solicitud no se refiere al proyecto BIM simulado ni a sus datos disponibles.",
        },
      ),
      agent: choice("¿Qué agente debe responder esta solicitud?", agentOptions),
      clarity: score("¿Qué tan clara y accionable es esta solicitud?", clarityLevels),
    },
  });

  const { inBimScope, agent, clarity } = result.answers;
  if (!isAgentId(agent.choice)) {
    throw new Error("JEV devolvió un agente que no está configurado.");
  }
  const clarityLegend = Object.fromEntries(
    Object.entries(clarity.legend).map(([level, description]) => [String(Number(level) + 1), description]),
  );

  return {
    inBimScope: inBimScope.noul,
    agent: agent.choice as AgentId,
    agentProbabilities: agent.probabilities as Record<AgentId, number>,
    agentConfidence: agent.confidence,
    clarity: clarity.score + 1,
    clarityLegend,
    clarityConfidence: clarity.confidence,
    model: result.model,
    inputTokens: result.usage.input_tokens,
    outputTokens: result.usage.output_tokens,
  };
}
