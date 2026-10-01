# Especificación: Router de Agentes BIM con JEV

## Objetivo y usuario

Entregar una PoC local, demostrable en una presentación técnica, que enrute una solicitud BIM a uno de seis agentes usando decisiones tipadas reales de JEV, genere la respuesta mediante OpenRouter y haga visible el recorrido completo.

## Stack

- Next.js App Router y TypeScript; Route Handlers sirven la API local y guardan las claves en el servidor.
- Node.js 20 o superior; el SDK JavaScript oficial de TypeSafe documenta ese requisito.
- SDK oficial `@typesafe-ai/sdk` para JEV y `@openrouter/sdk` para agentes.
- CSS propio para la interfaz. No se requiere base de datos ni plataforma externa.
- Vitest para pruebas unitarias/integración con proveedores simulados; comprobación manual end-to-end de proveedores reales como paso previo a la presentación.

## Estructura prevista

```text
app/                         páginas y Route Handlers de Next.js
src/lib/jev/                 tipos, evaluación y política de enrutamiento
src/lib/agents/              prompts especialistas y llamada OpenRouter
src/lib/bim/                 fixture y consultas simuladas
src/lib/observability/       tipos y métricas de sesión
src/components/              chat y panel de decisión/telemetría
public/                      recursos estáticos
docs/intent/                 intención confirmada
docs/specs/                  mapa y especificaciones
docs/decisions/              ADRs
tasks/                       plan y lista de tareas
```

La implementación puede ajustar agrupaciones menores, manteniendo los límites de capacidades aprobados.

## Estilo de código

- Tipos explícitos en límites de proveedor/UI; nombres y contratos en inglés para identificadores, contenido visible en español.
- Funciones pequeñas por adaptador/capacidad, validación antes de actuar, errores tipados y retorno temprano.
- No registrar secretos; representar datos ausentes como `null`/estado no disponible, no como cero.

```ts
type AgentId = "model" | "clashes" | "quantities" | "architecture" | "structure" | "mep";

function isAgentId(value: string): value is AgentId {
  return value === "model" || value === "clashes" || value === "quantities"
    || value === "architecture" || value === "structure" || value === "mep";
}
```

El control de tipos en el límite evita que una respuesta de proveedor no validada se use directamente como identificador de agente.

## Interfaz y flujo de datos

El usuario envía un prompt al Route Handler local. El servidor valida el cuerpo, llama una vez a JEV con las preguntas `Noul`, `Choice` y `Score`, aplica el umbral de dominio y, si corresponde, envía el prompt y el contexto BIM simulado al agente elegido. OpenRouter transmite la respuesta progresivamente. La interfaz muestra chat, estado de la decisión, distribución de probabilidades de `Choice`, confianza, score y latencias.

La API del servidor devuelve/eventualmente transmite datos suficientes para mostrar el estado de enrutamiento, el agente, fragmentos de texto, uso de tokens cuando esté disponible y estado/error final. Nunca devuelve claves. No se fijará un slug de modelo: `OPENROUTER_MODEL` debe ser configurable.

## Métricas y logs

Por turno se registran en memoria de cliente: prompt y respuesta visibles en el chat, estado, agente (si lo hay), salida y probabilidades de `Choice`, salida de `Noul`, valor/leyenda de `Score`, modelo JEV, modelo OpenRouter, tokens de entrada/salida de cada proveedor cuando se informen, tiempo de JEV, tiempo hasta el primer fragmento, tiempo total del agente y duración extremo a extremo. También se registran errores sin guardar secretos. El dashboard agrega número de turnos, tokens de sesión por proveedor y latencia media.

Los datos viven solo mientras la pestaña/sesión permanece abierta; reiniciar pierde el historial. Los logs de diagnóstico del servidor no deben incluir API keys.

## Visual y accesibilidad

Interfaz en español, oscura por defecto, inspirada en Vercel: navegación lateral compacta, superficies negras/grises, bordes finos, tipografía sans geométrica, tarjetas densas y estados sobrios. No usar marca o logotipos de Vercel como si fuera un producto oficial. El chat, el panel de ejecución y métricas deben seguir siendo utilizables en una ventana de presentación y en móvil. Controles con etiquetas, foco visible y contraste legible.

## Configuración y comandos

Variables locales requeridas en `.env.local`:

```dotenv
TYPESAFE_API_KEY=
OPENROUTER_API_KEY=
OPENROUTER_MODEL=
```

Ignorar `.env.local` en Git y proporcionar `.env.example` sin valores secretos.

```bash
npm install
npm run dev
npm run lint
npm test
npm run build
```

`npm run dev` debe abrir la PoC en `http://localhost:3000`. En la documentación de arranque se explicará cómo elegir un modelo disponible y completar las claves.

## Estrategia de verificación

- Tests de política de umbral: 0,49 detiene; 0,50 permite continuar.
- Tests de contrato del router con respuesta JEV tipada: dirige cada opción válida al agente correspondiente y preserva resultados y métricas.
- Tests de agentes con proveedor simulado: cada agente usa su propio prompt y fixture; el stream actualiza la respuesta y completa métricas al final.
- Tests de errores: claves inválidas, respuestas HTTP no exitosas, streams interrumpidos y ausencia de uso de tokens se presentan como error/valor no disponible, nunca como éxito inventado.
- Prueba manual con proveedores reales: prompts BIM para las seis áreas, prompt fuera de dominio, métricas reales y recorrido visible.
- Abrir `public/diagrama-flujo.html` directamente, sin servidor ni recursos de red, y cotejar su flujo con la aplicación.

## Límites

- **Siempre:** claves solo servidor; validar entradas y salidas del proveedor; conservar separación de métricas JEV/OpenRouter; mostrar errores reales; no persistir la sesión.
- **Pedir antes:** persistencia/base de datos, autenticación, despliegue, BIM real, llamadas que gasten saldo más allá de la verificación de la demo o incorporar dependencias fuera del stack aprobado.
- **Nunca:** incluir claves o respuestas falsas en repositorio, enviar solicitudes fuera del dominio al agente tras el rechazo de `Noul`, ni tratar el `Score` como probabilidad.

## Criterios de éxito

1. La app arranca localmente con las tres variables de entorno y ninguna clave aparece en el navegador.
2. Prompts de las seis áreas BIM enrutan a sus agentes mediante `Choice` de JEV; cada respuesta muestra el agente asignado.
3. `Noul < 0,5` detiene la llamada al agente; `Noul >= 0,5` continúa.
4. `Score` de claridad 1–5 se muestra y no bloquea.
5. La respuesta OpenRouter aparece incrementalmente; la UI muestra tokens y latencias disponibles por proveedor y total de sesión.
6. Un error de proveedor aparece en UI y logs sin respuesta sintética.
7. El diagrama HTML explica entradas, evaluación JEV, gate, agente, OpenRouter, respuesta y métricas.
8. Lint, tests y build pasan; la verificación manual real se completa antes de presentar.

## Referencias oficiales

- [API JEV](https://docs.typesafe.ai/api)
- [SDK JavaScript/TypeScript de TypeSafe](https://docs.typesafe.ai/sdk/javascript)
- [SDK TypeScript de OpenRouter](https://openrouter.ai/docs/client-sdks/typescript/overview)
- [Route Handlers de Next.js](https://nextjs.org/docs/app/getting-started/route-handlers)
