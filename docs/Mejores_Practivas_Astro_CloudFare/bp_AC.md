Para implementar Astro + Cloudflare Workers / Pages en su versión gratuita sin fallos en el deploy ni pantallas de error en producción, estas son las prácticas obligatorias estructuradas en un checklist técnico:1. Configuración del Adaptador (La Base)Obligatorio: Cambiar el modo de salida de Astro a server (todo SSR) o hybrid (páginas estáticas + dinámicas). El modo por defecto (static) ignorará tus endpoints de backend al compilar.  Configuración en astro.config.mjs:JavaScriptimport { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  output: 'server', // o 'hybrid'
  adapter: cloudflare({
    platformProxy: { enabled: true } // Obligatorio para emular D1/KV localmente
  })
});
2. Gestión de Variables de Entorno (Donde el 90% falla)En Desarrollo Local: Las credenciales y variables tradicionales van en un archivo .env o .dev.vars en la raíz del proyecto.  En Producción (Cloudflare Dashboard): Cloudflare no lee el archivo .env. Tienes que ir obligatoriamente a Workers & Pages ➔ Tu Proyecto ➔ Settings ➔ Environment Variables y añadir manualmente cada variable (como NEON_DATABASE_URL).Lectura en el código:Para páginas estáticas (prerender): Usa import.meta.env.VARIABLE.  Para endpoints y páginas SSR (dinámicas): Usa obligatoriamente el contexto del runtime: Astro.locals.runtime.env.VARIABLE o context.locals.runtime.env.VARIABLE.  3. Habilitar Compatibilidad con Node.jsObligatorio: Cloudflare Workers corre sobre el motor V8, no sobre Node.js tradicional. Librerías como los drivers de base de datos (@neondatabase/serverless) o de encriptación necesitan APIs de Node.Configuración en wrangler.jsonc o wrangler.toml:
Asegúrate de tener activa la siguiente bandera, de lo contrario el build fallará en Cloudflare:  JSON"compatibility_flags": [ "nodejs_compat" ]
4. Tipado Estricto de los Recursos de CloudflareObligatorio: Si usas TypeScript y vas a consumir D1, KV o R2, debes inyectar los tipos globales del ecosistema de Cloudflare en Astro para que no te dé errores de compilación.  Paso 1: Ejecuta pnpm wrangler types para generar automáticamente los tipos de tus bases de datos y bindings locales.  Paso 2: Configura tu archivo src/env.d.ts de la siguiente manera:  TypeScript/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

type Runtime = import("@astrojs/cloudflare").Runtime<Env>;
declare namespace App {
  interface Locals extends Runtime {}
}
5. Reglas de Drivers para Bases de Datos (Ej: Neon)Prohibido: Utilizar drivers TCP nativos de Node como pg. El tráfico en Cloudflare Workers debe ir serializado.Obligatorio: Instalar la versión Edge/Serverless (@neondatabase/serverless) y realizar las consultas mediante HTTP/WebSockets empleando la función neon() para consultas atómicas rápidas, evitando mantener pools de conexión abiertos de forma innecesaria en la red Edge.6. Control estricto de los límites del Plan Gratuito  Tiempo de CPU (10ms): Recuerda que cada petición en el plan gratuito de Workers tiene un límite de 10 milisegundos de tiempo de procesamiento de CPU (los tiempos de espera mientras la base de datos Neon responde no cuentan en este límite). Mantén las funciones de backend cortas, modulares y enfocadas en procesar datos estructurados (JSON), delegando cualquier procesamiento pesado (como redimensión de imágenes complejas) al cliente frontend.