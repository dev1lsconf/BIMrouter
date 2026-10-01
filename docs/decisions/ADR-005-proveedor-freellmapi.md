# ADR-005: Proveedores intercambiables para agentes BIM

## Estado

Aceptada — 2026-10-02

## Contexto

La PoC empezó usando OpenRouter para los seis agentes. Se requiere también conectar un router FreeLLMAPI que corre localmente en el equipo del presentador, conservando OpenRouter como alternativa.

## Decisión

Seleccionar el proveedor de agentes desde `AGENT_PROVIDER`, con `openrouter` como valor predeterminado y `freellmapi` como opción. Cada proveedor tiene un adaptador independiente que conserva el mismo contrato de streaming y métricas. FreeLLMAPI usa su API compatible con OpenAI, una URL base y clave configurables solo en el servidor, y el modelo `auto` por defecto.

La interfaz identifica el proveedor y el modelo efectivos. Los tokens solo se muestran cuando la respuesta del proveedor los informa. El flujo no hace fallback automático a otro proveedor: sus errores quedan visibles.

## Consecuencias

- OpenRouter sigue funcionando con el SDK oficial y su modelo configurable.
- La PoC puede alternar entre ambos servicios reiniciando Next.js con otro `AGENT_PROVIDER`.
- FreeLLMAPI local usa `http://localhost:3001/v1` en desarrollo; en Docker se conecta por `host.docker.internal`.
- No se instala otro SDK: el adaptador envía solicitudes al endpoint compatible con OpenAI.

## Referencias

- [Referencia API de FreeLLMAPI](https://github.com/tashfeenahmed/freellmapi/blob/main/docs/en/api/01-rest-api.md)
- [SDK TypeScript oficial de OpenRouter](https://openrouter.ai/docs/client-sdks/typescript/overview)
