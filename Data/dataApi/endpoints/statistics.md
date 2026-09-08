# Endpoint: GET /site-games/{gameId}/statistics

## URL

```
GET https://api.loteriasdehonduras.com/honduras/site-games/{gameId}/statistics
```

## Parámetros

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `gameId` | string | Sí | ID del juego (ej: `693ae5bbd7b13e9daed23b07`) |

## Descripción

Devuelve estadísticas detalladas de un juego específico, incluyendo
el último resultado y frecuencias de números.

## Response

```json
{
  "_id": "...",
  "title": "La Diaria 3:00 PM",
  "mobile_title": "La Diaria 3:00 PM",
  "game": {
    "lastSession": {
      "score": [["37"]],
      "date": "2025-09-12T21:00:00.000Z",
      "createdAt": "2025-09-12T21:05:00.000Z",
      "updatedAt": "2025-09-12T21:05:00.000Z"
    },
    "ballStats": {
      "counts": [
        { "score": ["37"], "count": 6, "layout": [] },
        { "score": ["73"], "count": 5, "layout": [] },
        { "score": ["71"], "count": 4, "layout": [] }
      ]
    }
  },
  "statistics": {
    "positionStats": [...],
    "frequencyStats": [...]
  }
}
```

## Notas

- `ballStats.counts` contiene el top N de números más frecuentes con su conteo
- No devuelve el histórico completo por fecha
- Los datos históricos completos solo se obtienen interactuando con el calendario

## Ejemplo cURL

```bash
curl -s "https://api.loteriasdehonduras.com/honduras/site-games/693ae5bbd7b13e9daed23b07/statistics" | jq '.game.ballStats.counts[:5]'
```
