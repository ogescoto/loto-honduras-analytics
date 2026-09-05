---
template: true
area: ai-governance
---

# Plantilla: ficha de subagente

> **Cómo usar:** una ficha por subagente que quieras configurar en tu herramienta. Copia este
> bloque a `.<herramienta>/subagents/<nombre>.md` (o al mecanismo de subagentes de tu
> herramienta) y rellena. Catálogo canónico: [`../gobernanza/Subagents.md`](../gobernanza/Subagents.md).
>
> Es **descriptiva y agnóstica**: cada herramienta la traduce a su propia configuración
> (por ejemplo, un agente de opencode con campo `model`).

---

```markdown
---
name: <doc-mapper | doc-reader | dev-backend | dev-frontend | tester | activity-manager>
description: <una línea: qué hace exclusivamente>
model: <barato | capaz | pensante>
language: <idioma del usuario>
isolated_context: true
---

# Subagente: <nombre>

## Scope (solo esto)

- Qué hace exactamente.
- Qué NO hace (límites duros con otros subagentes).

## Entrada

- Qué recibe (tarea, criterios de aceptación, spec, archivos).

## Salida

- Qué devuelve (resumen compacto al principal, formato concreto).

## Modo de trabajo

- **Modo cavernícola:** razonamiento interno mínimo; solo conclusiones.
- **Idioma de respuesta:** el del usuario.
- **Modelo sugerido:** <barato | capaz | pensante> — coste de tokens según carga.

## Ejemplo de encargo (para el agente principal)

```
Encargo: <objetivo>
Límites: <qué no tocar>
Devuelve: <formato del resumen>
```

---

## Relacionado

- [`../gobernanza/Subagents.md`](../gobernanza/Subagents.md) — catálogo canónico.
- [`../Templates/AGENT_CONFIG_Template.md`](AGENT_CONFIG_Template.md) — modelos por perfil.
