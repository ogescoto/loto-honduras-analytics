# Referencia de API — Loto Honduras Analytics

Base URL local: `http://localhost:8787`  
Base URL producción: `https://loto-backend-hono.workers.dev`

---

## Autenticación

Los endpoints protegidos requieren header `Authorization: Bearer <JWT>`.  
El JWT se obtiene al registrarse o iniciar sesión.

---

## Endpoints públicos (sin token)

### `GET /health`
Verifica que el Worker está activo.

**Respuesta:**
```json
{ "success": true, "data": { "status": "ok" } }
```

---

### `GET /api/v1/patterns`
Devuelve patrones estadísticos calculados.

**Parámetros query:**
| Parámetro | Tipo | Default | Descripción |
|---|---|---|---|
| `game` | `GameType` | (todos) | Filtrar por juego. Si se omite, devuelve los 13 juegos. |

**Tipos de patrón en la respuesta (`patternType`):**
| Valor | Descripción |
|---|---|
| `frio_caliente` | Números más y menos frecuentes en ventanas de 30/90/365 días |
| `rachas_inversas` | Números con más sorteos consecutivos sin salir |
| `par_impar` | Distribución par/impar histórica |

**Ejemplo:**
```bash
curl "http://localhost:8787/api/v1/patterns?game=diaria_3pm"
```

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "patternType": "frio_caliente",
      "game": "diaria_3pm",
      "targetNumbers": [2, 5, 1, 4, 3],
      "metadata": {
        "windowDays": 30,
        "hot": [{ "number": 2, "count": 21 }, ...],
        "cold": [{ "number": 71, "count": 1 }, ...]
      },
      "calculatedAt": "2026-06-25T00:00:00.000Z"
    }
  ]
}
```

---

### `GET /api/v1/history`
Devuelve los sorteos recientes de un juego.

**Parámetros query:**
| Parámetro | Tipo | Default | Rango | Descripción |
|---|---|---|---|---|
| `game` | `GameType` | **requerido** | — | Juego a consultar |
| `days` | `number` | `10` | 1–30 | Días hacia atrás desde hoy |

**Ejemplo:**
```bash
curl "http://localhost:8787/api/v1/history?game=pega3_9pm&days=7"
```

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "game": "pega3_9pm",
      "sessionId": "pega3_9pm_2026-06-25",
      "numbers": ["07", "23", "91"],
      "signs": [],
      "drawDate": "2026-06-25T21:00:00.000Z"
    }
  ]
}
```

---

## Juegos válidos (`GameType`)

| Valor | Nombre |
|---|---|
| `diaria_11am` | La Diaria 11AM |
| `diaria_3pm` | La Diaria 3PM |
| `diaria_9pm` | La Diaria 9PM |
| `pega3_11am` | Pega 3 11AM |
| `pega3_3pm` | Pega 3 3PM |
| `pega3_9pm` | Pega 3 9PM |
| `premia2_11am` | Premia 2 11AM |
| `premia2_3pm` | Premia 2 3PM |
| `premia2_9pm` | Premia 2 9PM |
| `juga3_11am` | Jugá 3 11AM |
| `juga3_3pm` | Jugá 3 3PM |
| `juga3_9pm` | Jugá 3 9PM |
| `super_premio` | Super Premio |

---

## Endpoints de autenticación

### `POST /api/v1/auth/register`
```json
{ "email": "user@ejemplo.com", "password": "Min8Chars!", "name": "Nombre (opcional)" }
```
Devuelve `{ data: { token } }` — JWT de 8 horas.

### `POST /api/v1/auth/login`
```json
{ "email": "user@ejemplo.com", "password": "Min8Chars!" }
```

### `POST /api/v1/auth/forgot-password`
```json
{ "email": "user@ejemplo.com" }
```
Envía email de reset via Brevo. Siempre responde OK (anti-enumeración).

### `GET /api/v1/auth/google`
Redirige al flujo OAuth 2.0 de Google. Sin body.

### `GET /api/v1/auth/me`
**Requiere token.** Devuelve el perfil del usuario autenticado.

---

## Endpoints protegidos (requieren token)

### Favoritos

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/v1/favorites` | Lista favoritos del usuario |
| `POST` | `/api/v1/favorites` | Agrega `{ game, number }` |
| `DELETE` | `/api/v1/favorites/:id` | Elimina un favorito propio |

### Premium (requiere suscripción activa)

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/v1/premium/meta-patterns` | Meta-patrones cruzados |

### Admin (requiere rol `admin` o `clerk`)

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/v1/admin/subscriptions` | Lista suscripciones activas |
| `POST` | `/api/v1/admin/register-physical-payment` | Registra cobro en ventanilla |

---

## Formato de respuesta

Todos los endpoints siguen el mismo envelope:

```typescript
// Éxito
{ "success": true, "data": <T> }

// Error
{ "success": false, "error": { "code": string, "message": string } }
```

**Códigos de error comunes:**
| Código | HTTP | Descripción |
|---|---|---|
| `VALIDATION_ERROR` | 400 | Parámetros inválidos |
| `UNAUTHORIZED` | 401 | Token ausente o inválido |
| `FORBIDDEN` | 403 | Rol insuficiente |
| `SUBSCRIPTION_REQUIRED` | 403 | Requiere suscripción activa |
| `NOT_FOUND` | 404 | Recurso no encontrado |
| `CONFLICT` | 409 | Recurso duplicado |
| `NETWORK_ERROR` | — | Error de conexión (cliente) |
