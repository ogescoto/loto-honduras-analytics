# Endpoint: GET /feed/game-stats

## URL

```
GET https://api.loteriasdehonduras.com/honduras/feed/game-stats
```

## Descripción

Devuelve el feed principal de resultados de todos los juegos.
Incluye el último resultado de cada juego, números calientes/fríos,
estadísticas de primera posición y contenido del feed.

## Headers

- `Content-Type: application/json; charset=utf-8`

## Response

```json
{
  "firstPosStats": [],
  "gameStats": [
    {
      "_id": "693ae5bbd7b13e9daed23b19",
      "title": "Super Premio Loto",
      "mobile_title": "Super Premio Loto",
      "logo": {
        "key": "2025/12/17/NXYVSuD4zg2GzDZby0uD1.png",
        "mimetype": "image/png",
        "extension": "png",
        "size": 2883
      },
      "content": {
        "body": "<h1>...</h1>...",
        "footer": "..."
      },
      "seo": { "title": "...", "url": "...", "description": "..." },
      "game": {
        "_id": "...",
        "title": "...",
        "lastSession": {
          "score": [["68"]],
          "date": "2025-06-22T03:00:00.000Z",
          "createdAt": "2025-06-23T03:05:00.000Z",
          "updatedAt": "2025-06-23T03:05:00.000Z",
          "reference": "123456"
        },
        "last_session_date": "2025-06-23T03:04:02.665Z",
        "schedule": [
          { "time": "14:00", "weekday": 0, "description": "..." },
          ...
        ]
      },
      "siteCompany": {
        "title": "LoteriasdeHonduras.com",
        "seo": { "url": "loto-hn" }
      }
    }
  ],
  "hotNumbers": [
    { "score": ["37"], "count": 6, "max_date": "2025-09-12T21:00:00.000Z" }
  ],
  "coldNumbers": [],
  "feed": [
    { "_id": "...", "body": "...", "link": "...", "date": "..." }
  ]
}
```

## Notas

- Cada `gameStats[].game.lastSession` contiene el resultado más reciente
- `score` es un array de arrays (soporta múltiples posiciones y bolos)
- Para juegos de 2 cifras (La Diaria): `score: [["37"]]`
- Para juegos de 3 cifras (Pega 3): `score: [["1"], ["2"], ["3"]]`
- Para juegos con combinaciones (Premia 2): `score: [["12", "34"]]`

## Ejemplo cURL

```bash
curl -s "https://api.loteriasdehonduras.com/honduras/feed/game-stats" | jq '.gameStats[] | {title, lastSession: .game.lastSession.score}'
```
