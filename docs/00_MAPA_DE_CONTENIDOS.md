---
tipo: indice
estado: activo
actualizado: 2026-06-21
---

# Mapa de Contenidos — Loto Honduras Analytics

Punto de entrada de la bóveda. La documentación es la **única fuente de verdad** del proyecto: el código materializa lo que aquí se describe. Solo el [[#Experto Obsidian|Experto Obsidian]] escribe en `docs/`.

> **Proyecto:** sistema analítico de lotería *edge-first* (Cloudflare). Dos capas de patrones: datos duros + imaginario popular (nivel 1, freemium) y meta-patrones psico-estadísticos (nivel 2, premium).

## 01 · Dominio
- [[01_Dominio/Glosario|Glosario — lenguaje ubicuo]]
- [[01_Dominio/Entidades|Entidades del modelo de datos]]
- [[01_Dominio/Casos_de_Uso|Casos de uso]]

## 02 · Arquitectura
- [[02_Arquitectura/C4_Contexto|C4 · Diagrama de Contexto]]
- [[02_Arquitectura/Dependencias|Dependencias entre apps y paquetes]]
- [[02_Arquitectura/API|Contrato de la API REST]]
- ADRs:
  - [[02_Arquitectura/adr/0001-adopcion-del-framework-de-gobernanza|ADR-0001 · Adopción del framework de gobernanza]]
  - [[02_Arquitectura/adr/0002-arquitectura-edge-cloudflare|ADR-0002 · Arquitectura edge en Cloudflare]]
  - [[02_Arquitectura/adr/0003-pagos-stripe-via-rest-en-edge|ADR-0003 · Pagos con Stripe vía REST en el edge]]

## 03 · Técnico
- [[03_Tecnico/Stack|Stack tecnológico y comandos canónicos]]

## 04 · Módulos
- [[04_Modulos/Patrones|Patrones (nivel 1 y meta-patrones)]]
- [[04_Modulos/Suscripciones|Suscripciones híbridas]] 🔒
- [[04_Modulos/Pagos|Pagos (Stripe)]] 🔒
- [[04_Modulos/Admin_Cobros_Presenciales|Admin · Cobros presenciales]] 🔒
- [[04_Modulos/Scraper_Ingestion|Scraper · Ingestión de sorteos]]
- [[04_Modulos/Frontend|Frontend (Astro)]]

> 🔒 = contiene rutas protegidas por `.aicodeprotect.yml` (requieren aprobación humana).

## 05 · Procesos (flujos end-to-end)
- [[05_Procesos/Flujo_Acceso_Premium|Acceso a meta-patrones premium]]
- [[05_Procesos/Flujo_Pago_Online|Pago online (Stripe)]]
- [[05_Procesos/Flujo_Cobro_Presencial|Cobro presencial en ventanilla]]
- [[05_Procesos/Flujo_Ingestion_Scraping|Ingestión periódica vía scraping]]

## 06 · UX / UI
- [[06_UX_UI/Mapa_Navegacion|Mapa de navegación]]

## Manual de usuario
- [[manual/index|Índice del manual]]
- [[manual/roles|Roles de usuario]]

---

## Experto Obsidian
La bóveda tiene un único escritor: el skill `/obsidian`. Los demás agentes la **consultan** antes de tocar código y le **entregan** los cambios después. Ver `ai-software-governance/07_Documentation/Obsidian_Vault_Standard.md`.
