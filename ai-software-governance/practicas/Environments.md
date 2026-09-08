---
obligation: mandatory
area: devops
applies_to: all projects
---

# Entornos y Comandos

## Propósito
Que cualquiera (humano o agente) pueda levantar, sembrar y probar el proyecto en cualquier entorno con comandos documentados y reproducibles.

## Entornos estándar

| Entorno | Propósito | Seed | Datos reales |
|---|---|---|---|
| **local** | Desarrollo en la máquina del dev | `seed:development` | No |
| **test / CI** | Ejecutar suites automáticas | `seed:test` | No |
| **staging** | Pre-producción, demos, generación de manual | `seed:development` | Anonimizados |
| **production** | Entorno real | `seed:production` | Sí |

> Regla: **nunca** ejecutar `seed:development` o `seed:test` contra `production`.

## Variables de entorno
- Cada entorno define su configuración por variables de entorno (ver [`Secrets_Management.md`](Secrets_Management.md)).
- El repositorio incluye un `.env.example` con **todas** las variables necesarias y valores de ejemplo (nunca secretos reales).
- Un arranque que falte una variable obligatoria debe **fallar rápido** con un mensaje claro.

### `.env.example` (ejemplo)

```bash
# App
APP_ENV=local
APP_PORT=3000

# Base de datos
DATABASE_URL=postgres://user:pass@localhost:5432/app_dev

# Servicios externos (claves de TEST, nunca de producción)
STRIPE_API_KEY=sk_test_xxx

# Auth
JWT_SECRET=change-me-in-real-env
```

## Comandos canónicos
Todo proyecto expone estos comandos (en `Makefile`, `package.json`, `justfile`, etc.). Los nombres pueden variar, pero **deben existir y estar documentados**:

| Acción | Comando de referencia |
|---|---|
| Instalar dependencias | `make install` / `npm install` |
| Arrancar en local | `make dev` / `npm run dev` |
| Levantar servicios (BD, etc.) | `make up` / `docker compose up -d` |
| Migrar BD | `make migrate` |
| Seed producción | `make seed-prod` |
| Seed desarrollo | `make seed-dev` |
| Seed test | `make seed-test` |
| Tests | `make test` |
| Lint | `make lint` |
| Build | `make build` |

## Reproducibilidad
- "Desde cero a funcionando" debe documentarse en el README del proyecto, y debe poder ejecutarlo un agente.
- Recomendado: contenedores (Docker / docker-compose) para igualar entornos.
- Versiones de runtime fijadas (`.nvmrc`, `.tool-versions`, `pyproject`, etc.).

## Ejemplo: arranque desde cero

```bash
git clone <repo> && cd <repo>
cp .env.example .env        # rellenar secretos
make install
make up                     # base de datos, etc.
make migrate
make seed-dev
make dev                    # app en http://localhost:3000
```

## Reglas para el agente
- Antes de ejecutar un seed, confirma el entorno objetivo.
- Si un comando no existe pero la política lo exige, créalo y documéntalo.
- Nunca apuntes comandos de dev/test a la base de datos de producción.

## Anti-patrones
- ❌ Pasos de arranque "en la cabeza" de alguien, no documentados.
- ❌ Variables de entorno no listadas en `.env.example`.
- ❌ Mezclar seeds entre entornos.
- ❌ Versiones de runtime sin fijar ("en mi máquina funciona").

## Relacionado
- [`Secrets_Management.md`](Secrets_Management.md), [`CI_CD.md`](CI_CD.md), [`Deployment.md`](Deployment.md), [`Seeds_Strategy.md`](Seeds_Strategy.md)
