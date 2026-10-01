# JEV BIM Router

PoC local que demuestra cómo JEV enruta una solicitud BIM a un agente especialista y cómo OpenRouter genera la respuesta con datos BIM simulados.

## Requisitos

- Node.js 22.18 o superior (TypeScript nativo para el runner de pruebas).
- Clave de TypeSafe/JEV y una clave del proveedor de agentes seleccionado.

## Inicio rápido

```bash
npm install
cp .env.example .env.local
```

Completa `.env.local`:

```dotenv
TYPESAFE_API_KEY=tu_clave_typesafe
OPENROUTER_API_KEY=tu_clave_openrouter
OPENROUTER_MODEL=openrouter/free
AGENT_PROVIDER=freellmapi
FREELLMAPI_BASE_URL=http://localhost:3001/v1
FREELLMAPI_API_KEY=tu_clave_freellmapi
FREELLMAPI_MODEL=auto
```

`AGENT_PROVIDER` admite `openrouter` o `freellmapi`. Para usar OpenRouter, establece `AGENT_PROVIDER=openrouter` y configura su modelo; para FreeLLMAPI se usa `auto` por defecto. Las credenciales se leen solo en el servidor. FreeLLMAPI debe estar activo en el puerto local 3001.

Luego ejecuta:

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000). El diagrama del flujo también está disponible en [http://localhost:3000/flow.html](http://localhost:3000/flow.html).

## Cómo funciona

1. JEV recibe una petición con `Noul` (ámbito BIM), `Choice` (agente) y `Score` (claridad).
2. La app detiene solicitudes con probabilidad BIM menor que 0,5.
3. El agente elegido recibe su prompt especialista y el fixture BIM local.
4. El proveedor configurado (OpenRouter o FreeLLMAPI) transmite la respuesta y sus métricas al dashboard.

Agentes disponibles: modelo general, interferencias, cantidades, arquitectura y planos, estructura e instalaciones MEP. Choice muestra la distribución de JEV; el panel y cada respuesta indican el agente asignado. El chat y las métricas solo viven durante la sesión. Los errores de API se muestran en el dashboard; no se generan respuestas de fallback.

## Estructura

- `app/`: página Next.js y Route Handler del chat.
- `src/lib/`: tipos del dominio, routing JEV, adaptadores OpenRouter/FreeLLMAPI y fixture BIM.
- `src/components/`: dashboard de chat y observabilidad.
- `public/flow.html`: diagrama autónomo.
- `docs/` y `tasks/`: intención, specs, ADRs y plan.


## Pruebas automatizadas

El runner usa el test runner integrado de Node; no necesita servicios externos ni claves API:

```bash
npm test
```

Para observar cambios mientras desarrollas:

```bash
npm run test:watch
```

La suite valida el fixture BIM (incluidas las áreas de lavado y la fontanería asociada) y la validación de prompts del endpoint.

## Despliegue con Docker Compose

Requiere Docker Engine y Docker Compose. Configura `.env` a partir del ejemplo y completa las dos claves:

```bash
cp .env.example .env
```

```dotenv
TYPESAFE_API_KEY=tu_clave_typesafe
OPENROUTER_API_KEY=tu_clave_openrouter
OPENROUTER_MODEL=openrouter/free
AGENT_PROVIDER=openrouter
FREELLMAPI_API_KEY=tu_clave_freellmapi
FREELLMAPI_MODEL=auto
```

Al usar FreeLLMAPI desde Docker, el contenedor debe llegar al servicio local mediante `FREELLMAPI_DOCKER_BASE_URL=http://host.docker.internal:3001/v1` (valor predeterminado de Compose). En Linux Compose resuelve ese nombre al host con `host-gateway`.

Construye y arranca la aplicación:

```bash
docker compose up --build -d
```

Abre [http://localhost:3000](http://localhost:3000). Compose publica el servicio solo en loopback, ejecuta la imagen como usuario sin privilegios y comprueba `/` con un healthcheck. Para ver estado y logs:

```bash
docker compose ps
docker compose logs -f app
```

Para detener y retirar el contenedor:

```bash
docker compose down
```

Las claves se inyectan al contenedor en tiempo de ejecución y no forman parte de la imagen. No copies `.env` al repositorio; ya está excluido por `.gitignore` y `.dockerignore`.
