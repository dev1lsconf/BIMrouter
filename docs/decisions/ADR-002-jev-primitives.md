# ADR-002: Enrutar con las primitivas oficiales de JEV

## Estado

Aceptada — 2026-10-01

## Contexto

La demostración debe hacer visible cómo un modelo de decisión probabilística selecciona un agente a partir de un prompt, usando JEV real y todas sus primitivas oficiales.

## Decisión

Usar `@typesafe-ai/sdk` desde el servidor, con una evaluación por prompt que incluya:

- `Noul` para la probabilidad de que la solicitud pertenezca al ámbito BIM; detener si `< 0,5`.
- `Choice` para escoger entre `model`, `clashes` y `quantities`; su opción define el agente.
- `Score` para claridad del prompt en cinco niveles; registrar y mostrar, sin bloquear.

Aplicar la regla de umbral y la validación de opción en código normal tras recibir respuestas tipadas. Un error no produce una ruta por defecto.

## Alternativas consideradas

- **Reglas por keywords:** descartadas como decisor principal porque no demuestran inferencia real JEV.
- **Enviar un solo Choice y omitir las otras primitivas:** descartado porque no demuestra la solicitud explícita.
- **Permitir que un LLM generativo elija agente:** descartado; la decisión debe ser auditable como elección tipada y no texto libre.

## Consecuencias

- Cada decisión muestra valor, probabilidad/distribución y uso de tokens cuando el proveedor lo informa.
- Las tres preguntas son independientes sobre el prompt, se solicitan en una misma llamada; el gate se aplica en la aplicación después de esa evaluación.
- Los umbrales son demostrativos y no equivalen a garantía de corrección.

## Referencias

- [API oficial JEV](https://docs.typesafe.ai/api)
- [SDK JavaScript/TypeScript oficial](https://docs.typesafe.ai/sdk/javascript)
