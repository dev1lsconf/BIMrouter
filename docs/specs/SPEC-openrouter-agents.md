# Spec: `openrouter-agents`

## Objetivo

Ejecutar el agente elegido con el SDK TypeScript oficial de OpenRouter y responder en español usando un conjunto local de datos BIM simulado.

## Agentes y fixture

- `model`: consulta elementos, niveles, tipos y propiedades del modelo.
- `clashes`: inspecciona registros de interferencia predefinidos, elementos implicados, ubicación y severidad.
- `quantities`: responde cantidades/totales predefinidos por categoría y nivel.

El fixture es explícitamente ficticio y versionado con la aplicación. El contexto que recibe el agente contiene los datos necesarios; no se integra una herramienta BIM externa. Cada agente conserva un prompt de sistema propio que limita su rol y le indica reconocer cuando el fixture no contiene un dato.

## Integración y stream

Todos los agentes usan `OPENROUTER_MODEL`, la misma clave de OpenRouter y mensajes de rol separados. La respuesta se envía en streaming; el backend mide inicio de llamada, primer fragmento y final. Al terminar, incorpora el uso reportado por el proveedor si está disponible. El dashboard muestra tokens faltantes como “no informado”, nunca como cero inventado.

## Errores y criterios

- `OPENROUTER_API_KEY` y `OPENROUTER_MODEL` se leen solo en servidor.
- Errores de autenticación, cuota, timeout o stream interrumpido quedan visibles y ligados al turno; no se generan respuestas de fallback.
- El adaptador valida que solo se invoque un agente permitido y que su contexto venga del fixture aprobado.
- Tests comprueban prompts diferenciados, selección de la opción, stream progresivo, uso de tokens y reporte de error.
