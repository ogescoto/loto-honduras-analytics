---
tipo: adr
estado: anulado
actualizado: 2026-06-25
---

# ADR-0004: Proxy de scraping vía Decodo (gateway gestionado)

[[00_MAPA_DE_CONTENIDOS|Mapa de Contenidos]]

- **Estado:** ⛔ **Anulado / Reemplazado** por [[02_Arquitectura/adr/0005-ingestion-github-actions-webshare|ADR-0005]].
- **Fecha:** 2026-06-23 (anulado el 2026-06-25)
- **Decisores:** Tech Lead

> **No implementar.** Decodo **nunca llegó a producción**. Esta decisión se anuló al
> descubrir la fuente real (API JSON) y al elegir **WebShare** como proxy, ejecutado
> desde **GitHub Actions** (Node) en vez del Worker. Se conserva esta nota por
> trazabilidad histórica. La decisión vigente está en
> [[02_Arquitectura/adr/0005-ingestion-github-actions-webshare|ADR-0005]].

## Contexto (histórico)
Se buscaba un proxy rotativo para que el `scraper-cron` (Cloudflare Worker) no fuese
bloqueado por reputación de IP al descargar la fuente. Se propuso Decodo como gateway
HTTP invocable con `fetch` estándar (compatible con el runtime edge).

## Por qué se anuló
1. La **fuente real** resultó ser una **API JSON** (`api.loteriasdehonduras.com`), no
   scraping de HTML — cambia la naturaleza de la ingestión.
2. El proxy elegido pasó a ser **WebShare**, que entrega una **lista de proxies a nivel
   de socket** (no un gateway de URL). Eso **no es invocable** desde `fetch` en Workers,
   así que la ingestión se movió a **GitHub Actions (Node)**, donde `undici` ProxyAgent
   sí permite enrutar por proxy.

Ver la decisión vigente en [[02_Arquitectura/adr/0005-ingestion-github-actions-webshare|ADR-0005]].
