# Intención: Router de agentes BIM con JEV

## Resultado

Construir una prueba de concepto local para presentar un router de agentes BIM. La aplicación combina una decisión real de JEV, respuestas de agentes mediante OpenRouter, un dashboard interactivo y un diagrama HTML del flujo.

## Usuario y contexto

El usuario principal es quien presenta la PoC en una demostración técnica. La interfaz, los ejemplos y las respuestas de los agentes estarán en español.

## Flujo acordado

1. La persona escribe una solicitud BIM en el chat.
2. JEV evalúa el mismo prompt con tres primitivas: `Noul` estima si pertenece al ámbito BIM; `Choice` elige un agente; `Score` puntúa la claridad del prompt.
3. Si la probabilidad de `Noul` es menor que 0,5, el flujo se detiene y explica que la solicitud está fuera de alcance. `Score` se muestra como señal informativa y no bloquea.
4. Si la solicitud pasa el filtro, el agente seleccionado consulta el fixture BIM simulado y genera una respuesta en español con un modelo configurable de OpenRouter.
5. El dashboard conserva el chat y métricas durante la sesión. Las respuestas se transmiten progresivamente.

## Agentes

- **Modelo general:** consultas de elementos, niveles, propiedades y ubicación en el modelo simulado.
- **Interferencias:** consultas sobre colisiones predefinidas, severidad y elementos implicados.
- **Cantidades:** consultas de mediciones y cantidades agregadas disponibles en el fixture.
- **Arquitectura y planos:** consultas de espacios, elementos arquitectónicos y láminas simuladas.
- **Estructura:** consultas de columnas, vigas, losas y sus propiedades disponibles.
- **Instalaciones MEP:** consultas de climatización, fontanería y electricidad.

## Éxito

En una presentación local, el usuario puede demostrar que prompts distintos activan agentes distintos, inspeccionar la evaluación y el resultado de JEV, ver tokens y latencias de ambos proveedores, y abrir un diagrama HTML que explica el flujo real.

## Restricciones y fuera de alcance

- Requiere claves reales de TypeSafe/JEV y OpenRouter en variables de entorno locales.
- No se simulan respuestas ante fallos de API: el dashboard muestra el error y registra el turno fallido.
- BIM es un fixture local con planos/láminas de ejemplo, no hay conexión a Revit, IFC, Autodesk Platform Services ni modelos BIM reales.
- No hay despliegue público, autenticación, almacenamiento persistente ni uso multiusuario.
- Las conversaciones y métricas se descartan al cerrar o reiniciar la aplicación.
