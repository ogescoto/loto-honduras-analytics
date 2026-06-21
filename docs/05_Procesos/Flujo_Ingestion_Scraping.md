---
tipo: proceso
estado: andamiaje
actualizado: 2026-06-20
---

# Flujo: Ingestión periódica vía scraping

[[00_MAPA_DE_CONTENIDOS|Mapa de Contenidos]]

Caso de uso [[01_Dominio/Casos_de_Uso#CU-04|CU-04]]. Cómo el [[04_Modulos/Scraper_Ingestion|scraper-cron]] alimenta el histórico de sorteos.

## Actor
- Sistema (Cloudflare Scheduled Worker), Scrapoxy, fuente oficial.

## Secuencia
```mermaid
sequenceDiagram
  participant CR as scraper-cron (cron)
  participant PX as Scrapoxy
  participant SRC as Fuente Lotería HN
  participant DB as Neon (lottery_history)
  CR->>PX: fetch(LOTERIA_SOURCE_URL) vía proxy rotativo
  PX->>SRC: petición con IP residencial
  SRC-->>PX: HTML/JSON de sorteos
  PX-->>CR: respuesta
  CR->>CR: parseDraws() -> ParsedDraw[]
  CR->>DB: upsert idempotente (drawNumber único)
```

## Reglas
- **Idempotencia:** `drawNumber` es único; reingestar el mismo sorteo no debe duplicar.
- Tras la ingestión, los datos quedan disponibles para recalcular [[04_Modulos/Patrones|patrones]].

## Pendiente
- **Andamiaje:** `parseDraws` y el `scheduled` no implementan fetch real, parseo ni upsert; falta definir la frecuencia del cron y el manejo de errores/reintentos. Ver [[04_Modulos/Scraper_Ingestion|módulo]].

## Historial de cambios
- 2026-06-20: creación inicial (estado andamiaje).
