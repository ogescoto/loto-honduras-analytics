# Gobernanza del Framework

> Documento para **humanos**. Explica la filosofía, los principios y el proceso de evolución del framework. Los agentes empiezan en [`AI_START_HERE.md`](AI_START_HERE.md).

---

## Propósito

Establecer un conjunto unificado de reglas, patrones y procesos para el desarrollo de software asistido por IA, garantizando **consistencia, calidad y trazabilidad** en todos los proyectos, independientemente del agente (Claude Code, Cursor, Copilot, Gemini…) o del stack tecnológico.

El framework existe porque, cuando gran parte del código lo genera la IA, el cuello de botella deja de ser *escribir* y pasa a ser *gobernar*: asegurar que lo escrito es coherente, seguro, está documentado y es mantenible.

---

## Principios fundamentales

1. **Código no se escribe sin tarea.** Un agente nunca genera código "por iniciativa propia". Ver [`09_AI/Forbidden_Actions.md`](09_AI/Forbidden_Actions.md).
2. **Todo cambio relevante se documenta en Obsidian.** La bóveda es la verdad; el código es su materialización. Ver [`07_Documentation/Obsidian_Vault_Standard.md`](07_Documentation/Obsidian_Vault_Standard.md).
3. **Semillas para producción, desarrollo y test son obligatorias.** Cada entorno recibe exactamente los datos que necesita. Ver [`03_Database/Seeds_Strategy.md`](03_Database/Seeds_Strategy.md).
4. **Los módulos protegidos requieren aprobación humana.** Hay zonas críticas (auth, pagos, utilidades globales) que la IA no toca sola. Ver [`09_AI/Protected_Modules.md`](09_AI/Protected_Modules.md).
5. **La documentación y el manual de usuario son artefactos vivos, no opcionales.** Se generan y mantienen como parte del Definition of Done.
6. **Explícito sobre implícito.** Las dependencias, las APIs públicas y los niveles de obligatoriedad se declaran; no se asumen.
7. **Reproducibilidad.** Cualquiera (humano o agente) debe poder reconstruir un entorno desde cero con los comandos documentados.

---

## El modelo de obligatoriedad

Cada política tiene un peso. Esto evita discusiones interminables: la regla dice cuán negociable es.

| Nivel | Significado | ¿Se puede incumplir? |
|---|---|---|
| `mandatory` | Regla dura | No, nunca |
| `standard` | Norma por defecto | Sí, con excepción aprobada y registrada |
| `guideline` | Orientación de diseño | Sí, con justificación en el PR/nota |
| `recommendation` | Buena práctica | Sí, libremente |

Las excepciones a reglas `standard` se registran como ADR (ver abajo).

---

## Roles

| Rol | Responsabilidad sobre el framework |
|---|---|
| **Tech Lead / Arquitecto** | Aprueba cambios a políticas `mandatory`/`standard` y a módulos protegidos. |
| **Desarrollador humano** | Define tareas, revisa PRs generados por IA, aprueba o rechaza. |
| **Agente de IA** | Ejecuta tareas dentro de los límites del framework. No es autónomo sobre las reglas. |
| **Custodio de documentación** | Vela por que la bóveda y el manual estén actualizados (puede ser un agente con tarea específica). |

---

## Evolución del framework (proceso ADR)

Este framework se gobierna a sí mismo. Cualquier modificación de políticas debe:

1. Proponerse como **ADR** en [`07_Documentation/ADR.md`](07_Documentation/ADR.md) (usar [`Templates/ADR_Template.md`](Templates/ADR_Template.md)).
2. Indicar: contexto, decisión, alternativas, consecuencias.
3. Ser revisada y aprobada por el Tech Lead.
4. Registrarse en [`CHANGELOG.md`](CHANGELOG.md) con su versión.

No se cambia una política `mandatory` o `standard` con un simple commit: requiere ADR.

---

## Relación con los proyectos

```
              ┌─────────────────────────────┐
              │  ai-software-governance      │  (este repo: reglas)
              │  - políticas                 │
              │  - plantillas                │
              │  - checklists                │
              └──────────────┬──────────────┘
                             │ se incorpora como submódulo / copia
        ┌────────────────────┼────────────────────┐
        ▼                    ▼                    ▼
  ┌───────────┐        ┌───────────┐        ┌───────────┐
  │ proyecto-A│        │ proyecto-B│        │ proyecto-C│
  │ .aicode-  │        │ .aicode-  │        │ .aicode-  │
  │ protect.yml│       │ protect.yml│       │ protect.yml│
  │ docs/ (vault)│     │ docs/ (vault)│     │ docs/ (vault)│
  └───────────┘        └───────────┘        └───────────┘
```

El framework es **agnóstico al stack**: las reglas hablan de conceptos (módulos, seeds, APIs, tests), y cada proyecto las materializa en su tecnología concreta documentándolo en `03_Tecnico/` de su bóveda.

---

## Qué NO es este framework

- No es un linter ni una herramienta CI (aunque incluye scripts en [`Tools/`](Tools/)).
- No es un boilerplate de código de aplicación.
- No impone un lenguaje ni un framework web concreto.
- No sustituye el criterio humano: lo encauza.
