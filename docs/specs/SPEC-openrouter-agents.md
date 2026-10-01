# Spec: `openrouter-agents`

## Objetivo

Ejecutar el agente elegido con OpenRouter o el proveedor local FreeLLMAPI y responder en español usando un conjunto local de datos BIM simulado.

## Agentes y fixture

- `model`: consulta general de elementos, niveles, tipos y propiedades del modelo.
- `clashes`: inspecciona registros de interferencia predefinidos, elementos implicados, ubicación y severidad.
- `quantities`: responde cantidades/totales predefinidos por categoría y nivel.
- `architecture`: consulta espacios, elementos arquitectónicos y planos/láminas simulados.
- `structure`: consulta columnas, vigas y losas con propiedades disponibles.
- `mep`: consulta sistemas de climatización, fontanería y electricidad.

El fixture es explícitamente ficticio y versionado con la aplicación. El contexto que recibe el agente contiene los datos necesarios; no se integra una herramienta BIM externa. Cada agente conserva un prompt de sistema propio que limita su rol y le indica reconocer cuando el fixture no contiene un dato.

## Integración y stream

`AGENT_PROVIDER` elige `openrouter` (predeterminado) o `freellmapi`. OpenRouter usa `OPENROUTER_API_KEY` y `OPENROUTER_MODEL`; FreeLLMAPI usa `FREELLMAPI_BASE_URL`, `FREELLMAPI_API_KEY` y `FREELLMAPI_MODEL` (`auto` por defecto). Ambos reciben mensajes de rol separados y transmiten la respuesta en streaming. El backend mide inicio de llamada, primer fragmento y final, e incorpora el uso de tokens reportado cuando está disponible. El dashboard identifica proveedor y modelo, y muestra tokens faltantes como “no informado”, nunca como cero inventado.

## Errores y criterios

- Las claves y URL de proveedor se leen solo en servidor; el selector admite únicamente los valores configurados `openrouter` y `freellmapi`.
- FreeLLMAPI habla el formato compatible con OpenAI; el modo HTTP se limita a hosts locales.
- Errores de autenticación, cuota, timeout o stream interrumpido quedan visibles y ligados al turno; no se generan respuestas de fallback.
- El adaptador valida que solo se invoque un agente permitido y que su contexto venga del fixture aprobado.
- Tests comprueban prompts diferenciados, selección de la opción, stream progresivo, uso de tokens y reporte de error.
