# Plan de implementación: Router de Agentes BIM con JEV

## Resumen

Construir una PoC local en español con decisiones JEV reales, tres roles BIM simulados servidos por OpenRouter, observabilidad por sesión y un diagrama HTML autónomo. Las decisiones aceptadas están en [ADRs](../docs/decisions/); los contratos funcionales están en [specs](../docs/specs/).

## Arquitectura y dependencias

```text
Next.js App Router + configuración segura
   └── JEV adapter y decisión tipada
         └── Gate Noul y Choice
               └── OpenRouter + fixture BIM + stream
                     └── Dashboard de chat y métricas
                           └── Diagrama HTML del flujo validado
```

La vista de dashboard y el esquema de resultados del servidor deben acordarse al implementar el contrato de streaming. Las llamadas externas quedan detrás de adaptadores para que las pruebas de UI/lógica no gasten saldo.

## Fases y tareas

1. **Fundación:** Next.js App Router, TypeScript, estilos base, scripts, `.gitignore`, `.env.example` y arranque documentado.
2. **Routing JEV:** adaptar SDK, contrato tipado, tres preguntas, gate `< 0,5`, validación y log de decisión/error.
3. **Slice de agentes:** fixture BIM, tres prompts especialistas, selección tras JEV y streaming desde OpenRouter con uso de tokens.
4. **Dashboard:** chat progresivo, panel de decisión, métricas separadas por proveedor, estado y errores; historial solo de sesión.
5. **Diagrama:** HTML autónomo actualizado para coincidir con el flujo real.
6. **Cierre:** lint, tests, build y verificación manual en vivo de tres especialidades, rechazo fuera de ámbito, errores y apertura independiente del diagrama.

## Puntos de control

- Tras la fundación: arranque local, validación de entorno y lint/build inicial.
- Tras el slice JEV/agentes: prueba del flujo completo con adaptadores simulados y luego credenciales reales.
- Antes de presentar: prueba de las tres rutas, gate, métricas, stream, errores y diagrama `file://`.

## Riesgos y mitigación

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Clave inválida, cuota o indisponibilidad de proveedor | Alto para una demo estrictamente en vivo | Configurar `.env.local` antes de la presentación y hacer una prueba real previa; mostrar error legible |
| El modelo devuelve una respuesta incoherente con el fixture | Medio | Elegir ejemplos cubiertos por datos, incluir el fixture en contexto y pedir admitir datos ausentes |
| Métricas de tokens no disponibles en cierto stream/modelo | Medio | Mostrar “no informado”, no falsear ceros; registrar latencias localmente |
| Scoring del SDK/proveedor cambia | Bajo | Mantener adaptador y tests de contrato contra tipos oficiales; fijar versiones en lockfile |

## Referencias técnicas

- [JEV API](https://docs.typesafe.ai/api) y [SDK TypeScript](https://docs.typesafe.ai/sdk/javascript)
- [OpenRouter TypeScript SDK](https://openrouter.ai/docs/client-sdks/typescript/overview)
- [Next.js Route Handlers](https://nextjs.org/docs/app/getting-started/route-handlers)
