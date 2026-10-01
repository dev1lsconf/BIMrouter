# ADR-003: Agentes especialistas con OpenRouter y fixture BIM

## Estado

Aceptada — 2026-10-01

## Contexto

La PoC requiere respuestas generativas reales pero no conectar un modelo BIM real. La presentación debe distinguir el router del modelo que redacta la respuesta.

## Decisión

Usar el SDK TypeScript oficial `@openrouter/sdk` en el servidor. Los seis agentes tendrán prompts de sistema especialistas y compartirán el modelo configurado por `OPENROUTER_MODEL`. Cada uno recibe el prompt del usuario más solo el contexto relevante del fixture BIM ficticio. Transmitir la respuesta en streaming y leer tokens reportados al finalizar cuando estén disponibles.

## Alternativas consideradas

- **Tres modelos separados:** no elegida; multiplica configuración y variables en una demo cuyo propósito principal es explicar routing por agente.
- **BIM real:** fuera de alcance por tiempo y por no ser necesaria para visualizar la selección.
- **Respuesta determinista local:** descartada para el camino normal porque no probaría la ejecución real del agente mediante OpenRouter.

## Consecuencias

- Se cambia modelo con una variable de entorno, sin alterar los seis roles.
- El fixture es explícitamente demostrativo y no debe presentarse como datos de un edificio real.
- El contenido generado puede variar; los ejemplos de presentación deben usar preguntas que el fixture cubra.
- Tokens y latencias de OpenRouter se separan de métricas JEV.

## Referencia

- [SDK TypeScript oficial de OpenRouter](https://openrouter.ai/docs/client-sdks/typescript/overview)
