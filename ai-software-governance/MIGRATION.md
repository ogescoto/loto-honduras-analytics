# Migración a v1.0.0

> Guía para pasar un proyecto del framework **v0.2.0** (o anterior) a **v1.0.0**.
> Este release es **MAJOR**: retira políticas `mandatory`/`standard` existentes y reorganiza la estructura de carpetas. Motivado por [ADR-0005](gobernanza/ADR.md#adr-0005-reformulación-a-buenas-prácticas-y-subagentes-ligeros).

---

## Resumen

| De (v0.2.0) | A (v1.0.0) |
|---|---|
| 10 roles con ciclo de vida y sub-estados | **6 subagentes** de scope definido (`doc-mapper`, `doc-reader`, `dev-backend`, `dev-frontend`, `tester`, `activity-manager`) |
| Registro de implementación (sub-estados, bitácora doble, tablero) | **Registro de actividad ligero**: tabla `META | TAREA | ESTADO | FECHA_INI | FECHA_FIN` |
| Arranque `INIT.md` / `ONBOARDING.md` | **Asistencia inicial interactiva** `gobernanza/Project_Start.md` |
| Más de 6 reglas duras | **Solo 6 reglas duras** (`gobernanza/Forbidden_Actions.md`) |
| Skills del framework (`/obsidian`, `/init-project`, `/usecases`…) | **Skills solo del proyecto**; el framework no aporta skills |
| Estructura de áreas `00_Governance`…`09_AI` | **`gobernanza/` + `practicas/`** |

---

## Pasos por proyecto

### 1. Anclar al tag

```bash
cd .governance
git fetch --tags
git checkout v1.0.0
```

### 2. Actualizar `AGENTS.md`

En el frontmatter, fijar la versión:

```yaml
governance_version: v1.0.0
```

### 3. Reconfigurar los agentes (por copia)

Los subagentes se **replican por copia** en la configuración de cada herramienta (`.<herramienta>/`), desde las plantillas del framework. No se enlazan.

- Re-copiar los 6 subagentes del catálogo: [`gobernanza/Subagents.md`](gobernanza/Subagents.md) + [`Templates/Subagent_Template.md`](Templates/Subagent_Template.md) + [`Examples/subagents_example.md`](Examples/subagents_example.md).
- Actualizar `.<herramienta>/AGENT_CONTEXT.md` y `.<herramienta>/AGENT_CONFIG.md` con el frontmatter canónico (`agente_app`, `subagentes`, `idioma_respuesta`, `modelos` por perfil; `skills` **solo** si el proyecto los tiene).
- Ajustar los modelos por perfil: barato para leer/probar/registrar; capaz solo para escribir; pensante para documentación.

### 4. Migrar el registro de implementación

- El registro pesado (sub-estados, bitácora doble, tablero) se sustituye por la tabla ligera en `docs/07_Implementacion/ACTIVIDAD.md`:
  `META | TAREA | ESTADO | FECHA_INI | FECHA_FIN`.
- Ver [`gobernanza/Activity_Tracking.md`](gobernanza/Activity_Tracking.md). Lo registra `activity-manager`.
- Si conservas historial histórico, queda como referencia en `archivo/`; el registro vivo es la tabla.

### 5. Retirar skills del framework y roles

- Retirar los skills `/init-project`, `/usecases`, `/screens`, `/obsidian`, `/board` de la configuración de los agentes (están en `archivo/Templates/` como referencia, no activos).
- Retirar los roles especializados (arquitectos de casos de uso/pantallas, PM, Experto Obsidian, initiator). El trabajo lo hacen ahora los 6 subagentes.
- Si el proyecto **sí** tiene skills propios, decláralos en la sección `skills` del frontmatter de `AGENT_CONFIG.md`; si no, esa sección **no se incluye**.

### 6. Reorganizar la bóveda

- `docs/00_Proyecto/` ahora forma parte de la estructura obligatoria del vault (visión/alcance/contexto, ver [`gobernanza/Project_Context_Standard.md`](gobernanza/Project_Context_Standard.md)).
- El **único escritor** de la zona curada (`00_`–`06_` y `manual/`) es `doc-mapper`; `docs/07_Implementacion/` es la zona compartida.
- **Nuevo:** `docs/03_Tecnico/Mapa_Conceptos_Codigo.md` (mapa conceptos ↔ código), que mantiene `doc-mapper` y lee `doc-reader` para responder flujos sin releer código. Plantilla: [`Templates/Mapa_Conceptos_Template.md`](Templates/Mapa_Conceptos_Template.md). No es obligatorio crearlo de inmediato, pero es la base para que `doc-reader` responda preguntas de flujo con modelo barato.
- Ver [`gobernanza/Obsidian_Vault_Standard.md`](gobernanza/Obsidian_Vault_Standard.md).

### 7. MCPs de código y bóveda (opcional/legado)

Los MCP (`codebase-memory-mcp`, `@oomkapwn/enquire-mcp`) son opcionales y no son el flujo principal. Si estaban configurados, se mantienen o se retiran sin afectar las reglas. Ver [`Templates/mcp/`](Templates/mcp/) y `archivo/09_AI/Codebase_And_Vault_MCP.md`.

---

## Qué NO cambia

- El marcador `.governance-root` (ahora declara `version: 1.0.0` y apunta a `gobernanza/Policy_Index.md`).
- El algoritmo de descubrimiento dinámico.
- La bóveda sigue siendo la **fuente de verdad**; el código la materializa.
- Los 3 puntos de aprobación humana (plan inicial, acción destructiva, módulo protegido).

---

## Anti-patrones de migración

- ❌ Anclar a `main` "para probar". El framework se ancla a un **tag**.
- ❌ Enlazar subagentes al framework en vez de copiarlos.
- ❌ Conservar el registro de implementación pesado como registro vivo.
- ❌ Dejar skills del framework activos en la configuración de los agentes.
- ❌ Escribir en la zona curada de la bóveda fuera de `doc-mapper`.

---

## Relacionado

- [`CHANGELOG.md`](CHANGELOG.md) — [1.0.0].
- [`gobernanza/ADR.md`](gobernanza/ADR.md) — ADR-0005.
- [`gobernanza/Framework_Access_Standard.md`](gobernanza/Framework_Access_Standard.md) — anclaje por tag.
- [`Checklists/New_Project.md`](Checklists/New_Project.md) — checklist para proyectos nuevos (ya con v1.0.0).
