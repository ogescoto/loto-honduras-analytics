---
tipo: contexto-global
proyecto: <nombre>
actualizado: <YYYY-MM-DDTHH:MM:SSZ>
---

# Contexto Global — <Nombre del proyecto>

> **Estado vivo del sistema.** Es el archivo que un agente consulta **constantemente** para
> saber qué existe hoy antes de tocar nada.
>
> Cambia con cada módulo, integración o decisión. Lo mantiene **`doc-mapper`**.
> Debe ser **breve**: apunta a las notas de detalle, no las reemplaza.

## En una frase

<Qué es el sistema hoy. Si hay divergencia con `VISION.md`, es un defecto a resolver.>

## Stack

| Capa | Tecnología | Notas |
|---|---|---|
| Lenguaje | <…> | |
| Framework | <…> | |
| Base de datos | <…> | |
| Infraestructura | <…> | |
| Servicios externos | <…> | |

## Módulos existentes

| Módulo | Qué hace | Estado | Nota |
|---|---|---|---|
| <nombre> | <una línea> | <en desarrollo / estable> | [[04_Modulos/<nombre>]] |

## Integraciones

| Con qué | Para qué | Dirección |
|---|---|---|
| <servicio> | <propósito> | <entrada / salida / ambas> |

## Decisiones vigentes

<Las que un agente debe conocer para no contradecirlas. Enlaza al ADR; no lo repitas.>

| Decisión | ADR |
|---|---|
| <en una línea> | [[02_Arquitectura/adr/NNNN-…]] |

## Zonas protegidas

<Resumen legible de `.aicodeprotect.yml`. El archivo manda; esto solo orienta.>

| Zona | Por qué | Requiere aprobación |
|---|---|---|
| <ruta> | <razón> | Sí |

## Deuda técnica conocida

| Qué | Dónde | Impacto |
|---|---|---|
| <…> | <ruta> | <alto/medio/bajo> |

## Comandos

| Acción | Comando |
|---|---|
| Instalar | `<…>` |
| Desarrollo | `<…>` |
| Tests | `<…>` |
| Seeds dev / test | `<…>` |
| Migraciones | `<…>` |

## Dónde seguir

| Necesitas | Ve a |
|---|---|
| El porqué del proyecto | [[00_Proyecto/VISION]] |
| Qué entra en esta versión | [[00_Proyecto/ALCANCE]] |
| Detalle de un módulo | `docs/04_Modulos/` |
| Casos de uso | `docs/01_Dominio/` |
| Trabajo en curso | `docs/07_Implementacion/ACTIVIDAD.md` |
