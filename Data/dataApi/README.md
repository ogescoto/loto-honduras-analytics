# API Remota - Loterias de Honduras

## Descubrimiento

La API fue descubierta mediante **Puppeteer** con interceptación de red al navegar
`https://loteriasdehonduras.com`. El sitio es una SPA en **Nuxt 3** que consume una
API REST externa en runtime.

## API Base URL

```
https://api.loteriasdehonduras.com/honduras
```

## Endpoints Descubiertos

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/sites/env?date={ISO_DATE}` | GET | Configuración del sitio (CMS data) |
| `/feed/game-stats` | GET | **Feed completo**: resultados recientes + stats |
| `/site-games/{gameId}` | GET | Datos de un juego específico |
| `/site-games/{gameId}?date={ISO_DATE}` | GET | Datos de un juego en fecha específica |
| `/site-games/{gameId}/statistics` | GET | Estadísticas históricas de un juego |

## Game IDs Descubiertos

| ID | Juego | Horario |
|----|-------|---------|
| `693ae5bbd7b13e9daed23b07` | La Diaria | 3:00 PM |
| `693ae5bbd7b13e9daed23b31` | La Diaria | 11:00 AM |
| `693ae5bbd7b13e9daed23b1f` | unknown | - |
| `693ae5bbd7b13e9daed23b19` | Super Premio | 9:00 PM |

> **Nota**: Se detectaron múltiples `site-games/{id}` calls durante la navegación.
> El listado completo de IDs debe extraerse de la respuesta de `GET /feed/game-stats`.

## Formato de Respuesta - `GET /feed/game-stats`

```json
{
  "gameStats": [
    {
      "_id": "...",
      "title": "La Diaria 3:00 PM",
      "game": {
        "_id": "...",
        "lastSession": {
          "score": [["12"], ["34"]],
          "date": "2025-06-23T21:00:00.000Z",
          "createdAt": "2025-06-23T21:05:00.000Z",
          "updatedAt": "2025-06-23T21:05:00.000Z",
          "reference": "1234",
          "money": "L. 1,000"
        },
        "delays": [],
        "ballStats": { ... }
      },
      "last_session_date": "2025-06-23T21:04:02.665Z",
      "last_session_id": "..."
    }
  ],
  "hotNumbers": [...],
  "coldNumbers": [...],
  "firstPosStats": [...],
  "feed": [...]
}
```

## Formato de Respuesta - `GET /site-games/{gameId}/statistics`

```json
{
  "_id": "...",
  "title": "La Diaria 3:00 PM",
  "lastSession": { ... },
  "statistics": {
    "ballStats": {
      "counts": [{ "score": ["37"], "count": 6 }],
      "layout": []
    }
  }
}
```

## Rate Limiting

- No se detectó rate limiting explícito durante la investigación
- Se recomienda respetar **2 segundos entre requests** como cortesía
- La API responde con `Content-Type: application/json; charset=utf-8`
- No se requieren headers de autenticación visibles

## Limitaciones Conocidas

1. **`/feed/game-stats`** solo devuelve los resultados más recientes (no histórico completo)
2. **`/site-games/{gameId}/statistics`** devuelve estadísticas agregadas, no el histórico completo por fecha
3. No se encontró un endpoint público que devuelva todos los resultados de todas las fechas
4. Los datos históricos se cargan desde el **calendario interactivo** del SPA (requiere Puppeteer)

## Estrategia de Extracción

La extracción histórica requiere usar **Puppeteer** para:

1. Navegar a la página de cada juego
2. Interactuar con el calendario para seleccionar fechas pasadas
3. Capturar la respuesta de la API que se dispara al cambiar la fecha
4. Parsear y almacenar los resultados

Para el **scraping diario** (solo el día actual), se puede llamar directamente:
```bash
curl "https://api.loteriasdehonduras.com/honduras/feed/game-stats"
```
