# 🎲 Loto Honduras Analytics — Arquitectura & Especificación de Sistema

Este documento define la arquitectura técnica global para un sistema analítico de lotería, diseñado bajo el paradigma de **Edge Computing** mediante el ecosistema de **Cloudflare**, garantizando un costo operativo prácticamente nulo, latencia mínima en dispositivos móviles y escalabilidad global automática.

---

## 🛠️ Stack Tecnológico Principal

### 1. Frontend & Client Layer
*   **Framework:** **Astro** (Configurado en modo **SSR** utilizando el `@cloudflare/next-on-pages` o el adaptador oficial `@astrojs/cloudflare`). Proporciona un HTML ultraligero ideal para redes móviles de baja conectividad.
*   **Estilos:** **Tailwind CSS** (Estrategia Utility-First para optimización extrema del CSS entregado al cliente).
*   **Diseño UI:** **Shadcn/ui** (Componentes accesibles y reactivos).

### 2. Backend & Serverless API Layer
*   **Runtime:** **Cloudflare Workers** (Motor V8 Isolates, compatible con TypeScript y Web Crypto API).
*   **Framework API:** **Hono** (Mínimo overhead de ruteo, tipado estricto e interoperabilidad 100% nativa con Cloudflare Workers).
*   **Testing:** **Vitest** / **Jest** (Ejecutados sobre entornos aislados para emular los Service Workers globales).

### 3. Data & Storage Layer
*   **ORM:** **Drizzle ORM** (Diseñado específicamente para Edge runtimes, TypeScript-First y sin dependencias pesadas de Node.js).
*   **Base de Datos Desarrollo:** **PostgreSQL** montado en contenedor **Docker** local.
*   **Base de Datos Producción:** **Neon DB** (Serverless Postgres), consumida a través de WebSockets utilizando el driver `@neondatabase/serverless`.

### 4. Ingestion & Proxy Layer
*   **Orquestación de Tráfico:** **Scrapoxy (by Decodo)** integrado como súper-proxy rotativo en el entorno Docker para evadir firewalls comerciales y balancear proxies gratuitos.

---

## 📁 Estructura del Monorepo (pnpm / Turborepo)

```text
loto-analytics-monorepo/
├── apps/
│   ├── frontend-astro/              # Aplicación Astro (Desplegada en Cloudflare Pages)
│   │   ├── src/
│   │   │   ├── components/          # Widgets de patrones, gráficas optimizadas para móvil
│   │   │   ├── layouts/             # PWA Shell (Layout adaptativo móvil/web)
│   │   │   └── pages/               # Vistas: Dashboard, Admin (Cobros Físicos), Landing
│   │   ├── astro.config.mjs         # Configurado con target 'cloudflare'
│   │   └── package.json
│   │
│   ├── backend-hono/                # API RESTful (Desplegada en Cloudflare Workers)
│   │   ├── src/
│   │   │   ├── db/                  # Capa de datos con Drizzle
│   │   │   │   ├── schema.ts        # Declaración de tablas y enums
│   │   │   │   └── client.ts        # Inicialización condicional (Docker local vs Neon Cloud)
│   │   │   ├── middlewares/         # Auth (JWT Edge Check), RBAC de Suscripciones
│   │   │   ├── routes/              # Controladores (/auth, /patterns, /admin)
│   │   │   └── index.ts             # Punto de entrada de la Edge API
│   │   ├── wrangler.toml            # Variables de entorno y secretos del Worker
│   │   └── package.json
│   │
│   └── scraper-cron/                # Cron Worker secundario (Cloudflare Scheduled Event)
│       ├── src/
│       │   ├── parser.ts            # Extractor semántico del HTML/JSON de Loto Honduras
│       │   └── index.ts             # Disparador periódico para scraping
│       └── wrangler.toml            # Configuración del Trigger cron de Cloudflare
│
├── packages/
│   └── shared-types/                # Definiciones estrictas de TypeScript compartidas (DTI)
│
├── docker/                          # Entorno Local Aislado
│   ├── docker-compose.yml           # Postgres local + Scrapoxy Core
│   └── scrapoxy/
│       └── config.json              # Configuración inicial del pool de proxies
└── package.json
🛢️ Capa de Datos: Modelado Entidad-Relación (Drizzle ORM)
El esquema de base de datos define el histórico crudo, las transacciones híbridas (Stripe online y cobros en efectivo en ventanilla física) junto con la estructura jerárquica de patrones.

TypeScript
// apps/backend-hono/src/db/schema.ts
import { pgTable, uuid, text, integer, timestamp, boolean, pgEnum, jsonb } from 'drizzle-orm/pg-core';

export const paymentMethodEnum = pgEnum('payment_method', ['stripe', 'cash_presencial']);
export const gameTypeEnum = pgEnum('game_type', ['diaria', 'pega3', 'premia2', 'super_premio']);

// 1. Tabla de Usuarios Globales
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').unique().notNull(),
  name: text('name'),
  role: text('role').default('customer').notNull(), // 'customer', 'admin', 'clerk'
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 2. Control de Acceso: Suscripciones Híbridas (Tiempo Limitado)
export const subscriptions = pgTable('subscriptions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  paymentMethod: paymentMethodEnum('payment_method').notNull(),
  startDate: timestamp('start_date').defaultNow().notNull(),
  endDate: timestamp('end_date').notNull(), // Límite exacto de expiración temporal
  registeredByAdminId: uuid('registered_by_admin_id').references(() => users.id), // Auditoría presencial
  receiptNumber: text('receipt_number'), // Control correlativo manual de recibos físicos
});

// 3. Histórico de Sorteos Crudos (Scraping Target)
export const lotteryHistory = pgTable('lottery_history', {
  id: uuid('id').defaultRandom().primaryKey(),
  game: gameTypeEnum('game').notNull(),
  drawNumber: integer('draw_number').unique().notNull(),
  winningNumbers: integer('winning_numbers').array().notNull(), // Array nativo Postgres (ej: [23]) o [12, 45, 88]
  drawTimestamp: timestamp('draw_timestamp').notNull(),
  insertedAt: timestamp('inserted_at').defaultNow().notNull(),
});

// 4. Patrones de Primer Nivel (Algoritmos Científicos e Imaginario Popular)
export const gamePatterns = pgTable('game_patterns', {
  id: uuid('id').defaultRandom().primaryKey(),
  patternType: text('pattern_type').notNull(), // 'frio_caliente', 'numerologia_suenos', 'par_impar'
  game: gameTypeEnum('game').notNull(),
  targetNumbers: integer('target_numbers').array().notNull(),
  metadata: jsonb('metadata').notNull(), // Almacena métricas analíticas (ej: porcentaje de aparición)
  calculatedAt: timestamp('calculated_at').defaultNow().notNull(),
});

// 5. Meta-Patrones (Patrones sobre Patrones / Patrones Cruzados)
export const metaPatterns = pgTable('meta_patterns', {
  id: uuid('id').defaultRandom().primaryKey(),
  parentPatternIds: uuid('parent_pattern_ids').array().notNull(), // Relación N:1 o N:M hacia gamePatterns
  description: text('description').notNull(), // "Patrón de números calientes que coinciden con los sueños más buscados de la semana"
  crossData: jsonb('cross_data').notNull(), // Estructura relacional compleja del patrón de segundo orden
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
🕷️ Integración de Ingestión: Scrapoxy + Docker Setup
Para asegurar que las llamadas al sitio web de la lotería no sean bloqueadas por inspecciones de paquetes o reputación de IPs Cloudflare, dockerizamos la infraestructura para simular tráfico residencial legítimo de manera distribuida.

docker/docker-compose.yml
YAML
version: '3.8'

services:
  # Base de Datos Relacional Local para desarrollo ágil
  local-postgres:
    image: postgres:15-alpine
    container_name: loto_postgres_dev
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: dev_user
      POSTGRES_PASSWORD: dev_password_secret
      POSTGRES_DB: loto_analytics_dev
    volumes:
      - pgdata_local:/var/lib/postgresql/data

  # Instancia Maestra de Scrapoxy para orquestación de proxificación
  scrapoxy:
    image: fabienvauchelles/scrapoxy:latest
    container_name: scrapoxy_master
    ports:
      - "8888:8888" # Puerto del Proxy de cara al Worker Scraper
      - "8890:8890" # Consola Web Administrativa
    volumes:
      - ./scrapoxy:/cfg
    environment:
      - AUTH_LOCAL_USERNAME=scraper_admin
      - AUTH_LOCAL_PASSWORD=security_token_gate_1122
      - STORAGE_FILE_FILENAME=/cfg/scrapoxy_config.json
    restart: always

volumes:
  pgdata_local:
🧠 Motor de Patrones: Científicos e Imaginario Popular
El backend clasifica los datos en dos capas conceptuales que cruzan la realidad estadística con la psicología colectiva de los apostadores:

📊 Patrones Nivel 1: Datos Duros + Análisis Empírico
Estadística de Frecuencia (Fríos / Calientes): Extracción matemática de los números que más se han repetido en ventanas de 30, 90 y 365 días.

Rachas Inversas: Números con mayor tiempo acumulado sin aparecer en los sorteos oficiales.

Análisis Estructural: Proporciones recurrentes basadas en paridad (Pares vs Impares) o distribución de cuadrantes numéricos.

🔮 Patrones Nivel 1: El Imaginario Popular (Mapeo de Búsquedas y Sueños)
La Guía de los Sueños (Diccionario Onírico Tradicional): Mapeo estricto del folklore de Honduras (ejemplo: soñar con "Fuego" equivale al número 24, "Dinero" al 08).

Tendencias de Búsqueda Activas: Rastreo interno de palabras clave o consultas más frecuentes dentro de la plataforma (ej. qué números está buscando más la gente antes de los sorteos de las 9:00 PM).

🔄 Meta-Patrones (Nivel 2: Patrones sobre Patrones)
El algoritmo ejecuta un cruce estadístico secundario. Si la analítica fría indica que el número 24 está "caliente" (frecuencia alta) y simultáneamente los logs revelan un incremento masivo en búsquedas de usuarios asociadas a "soñar con Fuego" (24), el sistema consolida automáticamente un Meta-Patrón de Coincidencia Psico-Estadística. Estos patrones híbridos representan el mayor valor agregado y se bloquean bajo la suscripción Premium.

🔒 Lógica de Control Edge de Suscripciones Híbridas (Hono Core)
Este script se ejecuta en los nodos perimetrales globales de Cloudflare, evaluando el estatus del cliente de manera instantánea mediante los bindings de Neon DB.

TypeScript
// apps/backend-hono/src/index.ts
import { Hono } from 'hono';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { subscriptions, users } from './db/schema';
import { eq, and, gt } from 'drizzle-orm';

type Env = {
  NEON_DATABASE_URL: string;
};

const app = new Hono<{ Bindings: Env }>();

// Middleware de Inyección de Conexión de Base de Datos para el Edge
app.use('*', async (c, next) => {
  const sql = neon(c.env.NEON_DATABASE_URL);
  const db = drizzle(sql);
  c.set('db', db);
  await next();
});

// ENDPOINT: Registro manual presencial en ventanilla física (Uso exclusivo por Admin/Clerk)
app.post('/api/v1/admin/register-physical-payment', async (c) => {
  const db = c.get('db');
  const { clientEmail, validityMonths, paperReceiptNumber, administratorId } = await c.req.json();

  // 1. Obtener ID del cliente mediante email
  const [clientUser] = await db.select().from(users).where(eq(users.email, clientEmail)).limit(1);
  if (!clientUser) return c.json({ success: false, error: 'Usuario no registrado' }, 404);

  // 2. Computar ventanas temporales limitadas de acceso
  const now = new Date();
  const absoluteExpirationDate = new Date();
  absoluteExpirationDate.setMonth(now.getMonth() + Number(validityMonths));

  // 3. Persistir la suscripción física auditada
  await db.insert(subscriptions).values({
    userId: clientUser.id,
    isActive: true,
    paymentMethod: 'cash_presencial',
    startDate: now,
    endDate: absoluteExpirationDate,
    registeredByAdminId: administratorId,
    receiptNumber: paperReceiptNumber
  });

  return c.json({
    success: true,
    message: `Acceso Premium activado físicamente para ${clientEmail} hasta el ${absoluteExpirationDate.toISOString()}`
  });
});

// ENDPOINT SEGURO: Acceso a Meta-Patrones Premium (Verificación de expiración estricta)
app.get('/api/v1/premium/meta-patterns', async (c) => {
  const db = c.get('db');
  
  // Nota: En producción, el 'userId' se extrae directamente del payload verificado del JWT
  const userId = c.req.query('userId'); 
  const currentTimestamp = new Date();

  // Buscar si el usuario posee contratos de suscripción activos y vigentes en tiempo
  const [validSubscription] = await db.select()
    .from(subscriptions)
    .where(
      and(
        eq(subscriptions.userId, userId),
        eq(subscriptions.isActive, true),
        gt(subscriptions.endDate, currentTimestamp) // Valida que la fecha actual sea menor que la expiración
      )
    )
    .limit(1);

  if (!validSubscription) {
    return c.json({
      access: 'denied',
      error: 'Requiere suscripción activa. Su pase en línea o físico ha expirado.'
    }, 403);
  }

  // Si pasa las validaciones de negocio en el Edge, se extraen los patrones avanzados
  return c.json({
    access: 'granted',
    generatedAt: currentTimestamp.toISOString(),
    metaPatterns: [
      {
        id: "mp_01",
        description: "Meta-Patrón Cruzado: Coincidencia Máxima Sueño-Estadística (Diaria)",
        targetNumbers: [24, 08],
        confidenceScore: "94.2%"
      }
    ]
  });
});

export default app;