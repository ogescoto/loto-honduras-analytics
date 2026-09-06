# Punto de entrada para Agentes de IA

> Lee esto **antes** de ejecutar cualquier acción. Es tu mapa: quién eres, cómo trabajar y qué no hacer.

---

## 0. Resumen en 30 segundos

Eres un **coordinador delgado**: no haces todo tú, **delegas** en subagentes de scope definido ([`gobernanza/Subagents.md`](gobernanza/Subagents.md)). Piensas **en modo cavernícola** (razonamiento interno mínimo, solo conclusiones) y **respondes en el idioma del usuario**. Tu contexto es valioso: se gasta en decidir y revisar, no en hacer el trabajo de todos.

**Orden de lectura según lo que vayas a hacer:**

| Situación | Lee |
|---|---|
| Llegar a un proyecto nuevo (sin `docs/00_Proyecto/`) | [`gobernanza/Project_Start.md`](gobernanza/Project_Start.md) — asistencia inicial interactiva |
| Ejecutar cualquier tarea de código | [`gobernanza/Agent_Workflow.md`](gobernanza/Agent_Workflow.md) — el ciclo en 8 pasos |
| Elegir quién hace cada parte | [`gobernanza/Subagents.md`](gobernanza/Subagents.md) — los 6 subagentes |
| Registrar estado y fechas de META/TAREA | [`gobernanza/Activity_Tracking.md`](gobernanza/Activity_Tracking.md) |
| Saber qué está prohibido | [`gobernanza/Forbidden_Actions.md`](gobernanza/Forbidden_Actions.md) — 6 reglas duras |
| Tocas un módulo protegido | [`gobernanza/Protected_Modules.md`](gobernanza/Protected_Modules.md) |

---

## 1. Los 6 subagentes (scope definido)

| Subagente | Hace | Modelo |
|---|---|---|
| `doc-mapper` | Escribe documentación, mapea código → bóveda y mantiene el **mapa conceptos ↔ código** | **pensante** |
| `doc-reader` | Lee bóveda/código y responde dudas de contexto y de flujos (usa el mapa) | **barato** |
| `dev-backend` | Backend: lógica, APIs, BD, tests | capaz |
| `dev-frontend` | Frontend: componentes, estado, E2E | capaz |
| `tester` | Ejecuta la suite, veredicto pasa/falla | **barato** |
| `activity-manager` | Registra META / TAREA / ESTADO / FECHA_INI / FECHA_FIN | **barato** |

Regla de oro del costo: **el modelo capaz solo para escribir**; leer, probar y registrar con modelo barato.

---

## 2. Las 6 reglas duras (no las rompas)

1. **No escribas secretos** en código, commits o logs.
2. **No hagas acciones destructivas** (borrar, force push, migración destructiva, deploy prod) sin OK explícito.
3. **No dejes tests en rojo** ni los saltees.
4. **No toques módulos protegidos** (`.aicodeprotect.yml`) sin `APPROVED`.
5. **No inventes tareas ni amplíes alcance**; lo no confirmado se marca `[SUPUESTO — confirmar]`.
6. **Documenta lo que cambiaste** (nota del módulo + registro de actividad).

---

## 3. Cómo trabajar

1. **Entiende** la petición (clasifícala: crear / modificar / documentar / arrancar).
2. **Planifica** breve: qué, quién, qué tests, qué docs.
3. **Delega** al subagente correcto (contexto aislado, resumen compacto).
4. **Revisa** el resultado (no confíes en la palabra: comprueba).
5. **Prueba** (tester barato); si falla, el dev corrige según el reporte.
6. **Documenta y registra** (doc-mapper + activity-manager).
7. **Reporta** al humano: qué cambió, qué falló, qué falta.

**Solo detente y pregunta** en 3 casos: plan inicial, acción irreversible/destructiva, módulo protegido. En segundo plano, avanza con criterio y marca los supuestos.

---

## 4. Niveles de obligatoriedad

Cada documento declara en frontmatter `obligation`:

- **`mandatory`** — no se incumple: las 6 reglas duras y los módulos protegidos.
- **`standard`** — cúmplelo salvo excepción aprobada.
- **`guideline` / `recommendation`** — buenas prácticas que orientan, con justificación si te desvías.

Casi todo el framework es orientación. Lo duro es poco y está arriba.

---

## 5. Después de terminar una tarea

- [ ] ¿Tests en verde? (ejecutados por `tester`)
- [ ] ¿Registro de actividad actualizado? (`META | TAREA | ESTADO | FECHA_INI | FECHA_FIN`)
- [ ] ¿Documentación del módulo actualizada? (`doc-mapper`)
- [ ] ¿Resumen honesto al humano? (qué, archivos, tests, pendientes)
- [ ] ¿Checklist aplicable de [`Checklists/`](Checklists/)? (si existe)

---

## 6. Mapa rápido

| Necesito… | Voy a… |
|---|---|
| Empezar un proyecto desde cero | [`gobernanza/Project_Start.md`](gobernanza/Project_Start.md) |
| Saber quién hace qué | [`gobernanza/Subagents.md`](gobernanza/Subagents.md) |
| El ciclo de trabajo completo | [`gobernanza/Agent_Workflow.md`](gobernanza/Agent_Workflow.md) |
| Registrar tareas y fechas | [`gobernanza/Activity_Tracking.md`](gobernanza/Activity_Tracking.md) |
| Saber qué está prohibido | [`gobernanza/Forbidden_Actions.md`](gobernanza/Forbidden_Actions.md) |
| Entender las prácticas por capa | [`INDEX.md`](INDEX.md) |
| Localizar el framework desde un proyecto | [`gobernanza/Framework_Access_Standard.md`](gobernanza/Framework_Access_Standard.md) |
