# Tareas: Router de Agentes BIM con JEV

> Estado actual: la PoC local está publicada en el repositorio privado. El routing ofrece seis áreas BIM y muestra el agente asignado en el chat.

## Documentación aprobada

- [x] Guardar intención, mapa de capacidades, specs y ADRs.
  - Aceptación: objetivo, módulos, contratos, límites y decisiones están documentados en español.
  - Verificación: revisar que cada spec enlaza con una capacidad y que cada decisión significativa tiene ADR.

## Implementación

- [ ] 1. Crear fundación Next.js App Router y configuración local segura.
  - Aceptación: app TypeScript arranca en localhost; `.env.example` contiene solo nombres de variables y `.env.local` está ignorado.
  - Verificación: `npm run dev`, `npm run lint`, `npm run build`.
  - Dependencias: ninguna.
- [ ] 2. Implementar adaptador JEV y política de routing tipada.
  - Aceptación: cada prompt produce Noul/Choice/Score; `< 0,5` rechaza; `>= 0,5` permite Choice; los errores no asignan ruta por defecto.
  - Verificación: `npm test` casos 0,49 / 0,50, seis agentes, payload inválido y error proveedor.
  - Dependencias: 1.
- [ ] 3. Crear fixture BIM y agentes especialistas.
  - Aceptación: fixture ficticio cubre modelo, interferencias, cantidades, arquitectura/planos, estructura e instalaciones MEP; cada agente tiene instrucciones propias y reconoce datos ausentes.
  - Verificación: `npm test` con preguntas representativas y fixture controlado.
  - Dependencias: 1.
- [ ] 4. Conectar agente elegido a OpenRouter con streaming.
  - Aceptación: se ejecuta solo el agente de Choice; fragmentos llegan al cliente; modelo compartido viene de `OPENROUTER_MODEL`; tokens finales se registran cuando existen.
  - Verificación: tests del adaptador y una llamada real manual con cada rol.
  - Dependencias: 2, 3.
- [ ] 5. Construir chat y panel de decisión/observabilidad.
  - Aceptación: historial efímero, resultados JEV, agente, tokens separados, tres duraciones, logs y errores visibles; claves ausentes del cliente.
  - Verificación: tests de estado/UI; revisar flujo aceptado, rechazo, stream y error en navegador.
  - Dependencias: 2, 4.
- [ ] 6. Crear diagrama HTML autónomo.
  - Aceptación: español, flujo idéntico a implementación, incluye gate, métricas y errores; sin dependencias remotas.
  - Verificación: abrir localmente con `file://` y verificar responsive.
  - Dependencias: 2, 4, 5.
- [ ] 7. Preparar y verificar demo completa.
  - Aceptación: criterios de `docs/specs/SPEC-router-agentes-bim.md` cumplidos y guía de arranque actualizada.
  - Verificación: `npm run lint`, `npm test`, `npm run build` y smoke test manual con claves reales.
  - Dependencias: 1–6.

## Checkpoint final

- [ ] Rechazo fuera de ámbito no llama OpenRouter.
- [ ] Cada especialidad enruta al agente esperado.
- [ ] Dashboard muestra tiempos y tokens reales reportados, o “no informado”.
- [ ] Fallos de proveedores se muestran claramente sin respuestas sintéticas.
- [ ] No hay claves en cliente, logs ni repositorio.
- [ ] El diagrama HTML se abre offline y coincide con el comportamiento implementado.
