# ADR-001: Next.js App Router y TypeScript para la PoC local

## Estado

Aceptada — 2026-10-01

## Contexto

El proyecto necesita una UI de dashboard/chat y endpoints servidor para llamar a JEV y OpenRouter sin exponer las claves. La PoC se presenta localmente y no requiere despliegue ni almacenamiento persistente.

## Decisión

Construir una sola aplicación con Next.js App Router, TypeScript y Route Handlers. Los proveedores se invocan desde el servidor; la UI usa la API local. Usar CSS propio y Node.js 20 o superior.

## Alternativas consideradas

- **Vite y API separada:** viable, pero requiere dos servidores/procesos y configuración adicional para una demo local pequeña.
- **Frontend que llama directamente a proveedores:** descartado porque expondría credenciales al navegador.

## Consecuencias

- Arranque local unificado con `npm run dev`.
- Los secretos quedan en variables de entorno servidor.
- Next.js aporta estructura de página y endpoints en un único proyecto.
- No se compromete compatibilidad con despliegue productivo/multiusuario en esta PoC.

## Referencias

- [Route Handlers de Next.js](https://nextjs.org/docs/app/getting-started/route-handlers)
