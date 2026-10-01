# JEV BIM Router

PoC local que demuestra cómo JEV enruta una solicitud BIM a un agente especialista y cómo OpenRouter genera la respuesta con datos BIM simulados.

## Requisitos

- Node.js 20 o superior.
- Claves de TypeSafe/JEV y OpenRouter.
- Un slug de modelo disponible en OpenRouter.

## Inicio rápido

```bash
npm install
cp .env.example .env.local
```

Completa `.env.local`:

```dotenv
TYPESAFE_API_KEY=tu_clave_typesafe
OPENROUTER_API_KEY=tu_clave_openrouter
OPENROUTER_MODEL=proveedor/modelo
```

Luego ejecuta:

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000). El diagrama del flujo también está disponible en [http://localhost:3000/flow.html](http://localhost:3000/flow.html).

## Cómo funciona

1. JEV recibe una petición con `Noul` (ámbito BIM), `Choice` (agente) y `Score` (claridad).
2. La app detiene solicitudes con probabilidad BIM menor que 0,5.
3. El agente elegido recibe su prompt especialista y el fixture BIM local.
4. OpenRouter transmite la respuesta y sus métricas al dashboard.

Agentes disponibles: modelo, interferencias y cantidades. El chat y las métricas solo viven durante la sesión. Los errores de API se muestran en el dashboard; no se generan respuestas de fallback.

## Estructura

- `app/`: página Next.js y Route Handler del chat.
- `src/lib/`: tipos del dominio, routing JEV, OpenRouter y fixture BIM.
- `src/components/`: dashboard de chat y observabilidad.
- `public/flow.html`: diagrama autónomo.
- `docs/` y `tasks/`: intención, specs, ADRs y plan.
