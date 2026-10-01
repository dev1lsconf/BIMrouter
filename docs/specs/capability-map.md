# Mapa de capacidades: Router de Agentes BIM con JEV

| ID estable | Responsabilidad | Depende de |
|---|---|---|
| `jev-routing` | Clasificar y seleccionar el agente adecuado para una solicitud usando `Noul`, `Choice` y `Score` | — |
| `openrouter-agents` | Ejecutar un agente especialista con OpenRouter sobre un fixture BIM local | `jev-routing` |
| `observability-dashboard` | Interfaz de chat, historial de sesión, decisiones, logs y métricas | `jev-routing`, `openrouter-agents` |
| `flow-documentation` | Diagrama HTML autónomo que documenta el flujo usado por la aplicación | `jev-routing`, `openrouter-agents`, `observability-dashboard` |

## Orden de construcción

`jev-routing` → `openrouter-agents` → `observability-dashboard` → `flow-documentation`.

Las llamadas JEV y de OpenRouter se ejecutan en el servidor. El dashboard es cliente de la API local. El diagrama representa el mismo orden de decisiones y ejecución; no constituye una implementación paralela.
