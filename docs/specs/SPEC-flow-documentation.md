# Spec: `flow-documentation`

## Objetivo

Entregar un diagrama de flujo en un único HTML que pueda abrirse durante la presentación y explique el proceso real del router.

## Contenido del flujo

`Prompt` → `Noul: ¿es BIM?` → gate `0,5` → (rechazo explicativo o continuación) → `Choice: agente especialista` y `Score: claridad informativa` → fixture BIM → agente OpenRouter → stream de respuesta → métricas/logs.

Mostrar qué se registra en cada etapa, dónde se produce el stream y qué ocurre ante un error de proveedor. El diagrama no debe implicar una integración BIM real ni un fallback simulado.

## Restricciones y aceptación

- Archivo HTML autónomo en español, con estilos y SVG/CSS locales; abrir directamente con `file://` sin red.
- Diseño legible en presentación, responsive, etiquetas textuales además de color y estados de error diferenciados.
- Pasos y umbral coinciden con `jev-routing` y con la app; cada etapa tiene una breve explicación de entrada/salida.
- Verificación manual: abrir el HTML en navegador sin servidor y seguir un caso aceptado, un rechazo y un error.
