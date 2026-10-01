# Spec: `observability-dashboard`

## Objetivo

Permitir que la audiencia siga una petición desde el chat hasta la decisión y la respuesta del agente, y consulte resultados y costes operativos básicos de la sesión.

## Experiencia

- Dashboard en español, tema oscuro por defecto y estética de producto Vercel: sidebar compacta, contraste monocromo, bordes finos, tarjetas y estados discretos.
- Chat con envío de prompt, estado de procesamiento, respuesta progresiva, errores y mensajes de fuera de alcance.
- Panel de ejecución con primitivas y salidas JEV, umbral aplicado, agente elegido, modelo usado, distribución de Choice y claridad.
- Panel de observabilidad con tokens de entrada/salida por JEV y OpenRouter, totales separados, latencia JEV, tiempo al primer fragmento, generación total, extremo a extremo, estado y logs recientes.
- La interfaz distingue “0 tokens” de “uso no informado”. El tiempo se expresa en milisegundos.

## Estado y seguridad

El cliente mantiene el historial y agregados en memoria durante la sesión. No hay endpoint para consultar historial durable ni base de datos. Los Route Handlers nunca serializan claves al cliente; los errores no deben incluir secretos. No imprimir mensajes completos en logs del servidor por defecto; la conversación ya se muestra localmente en el panel.

## Criterios y verificación

- Un mensaje en curso muestra al agente después de JEV y la respuesta incremental después de OpenRouter.
- Un prompt rechazado muestra Noul y métricas JEV, sin agente ni métricas OpenRouter exitosas.
- Errores son distinguibles de respuestas válidas y visibles en la lista de eventos.
- Totales por sesión suman métricas por proveedor sin duplicar tokens.
- Layout usable con teclado, foco visible, etiquetas de controles y viewport estrecho.
- Al recargar o reiniciar, la sesión se pierde de forma esperada.
