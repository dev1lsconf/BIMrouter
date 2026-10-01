# ADR-004: Sesión efímera y errores de proveedor visibles

## Estado

Aceptada — 2026-10-01

## Contexto

La aplicación se presentará localmente mañana. Las métricas e historial se necesitan durante la demo; no se solicitó persistencia. La decisión JEV y las respuestas OpenRouter deben ser reales.

## Decisión

Mantener chat y agregados en memoria de la sesión del navegador. No usar base de datos, login ni persistencia. Si JEV u OpenRouter falla, mostrar y registrar el error; nunca sustituirlo silenciosamente por una salida simulada.

## Alternativas consideradas

- **SQLite/localStorage:** no elegidas porque persistir tras reiniciar no aporta a la demo y aumenta superficie de implementación.
- **Fallback sintético:** descartado porque haría indistinguible un resultado falso de una llamada real.
- **Reintentos opacos e ilimitados:** descartados; no se ocultará el estado del proveedor ni se repetirán llamadas sin límite.

## Consecuencias

- Recargar/cerrar la app descarta la sesión.
- Una falla de red o credencial puede detener la presentación; verificar conectividad y credenciales antes de empezar.
- Los eventos de error son visibles, pero las API keys nunca aparecen en UI, payloads o logs.
