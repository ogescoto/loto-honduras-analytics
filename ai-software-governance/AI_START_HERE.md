# Onboarding para Agentes de IA

> **⚠️ Lee esto ANTES de ejecutar cualquier acción sobre un proyecto gobernado.**
> Este archivo es tu punto de entrada obligatorio. Si lo saltas, estás incumpliendo el framework.

---

## 0. Contexto en 30 segundos

> **¿Cómo llegaste aquí?** En cada proyecto, el archivo `CLAUDE.md` de su raíz es lo primero que lees y te redirige a este documento. `CLAUDE.md` aporta el contexto **específico** del proyecto (nombre, stack, rutas); este framework aporta las reglas **genéricas**. Si no existe `CLAUDE.md` en el proyecto, créalo desde [`Templates/CLAUDE_Template.md`](Templates/CLAUDE_Template.md).

Estás operando bajo un framework de gobernanza. Esto significa:

- **No escribes código sin una tarea explícita.** (ver [`09_AI/Forbidden_Actions.md`](09_AI/Forbidden_Actions.md))
- **Hay zonas de código protegidas** que no puedes tocar sin aprobación humana. (ver [`09_AI/Protected_Modules.md`](09_AI/Protected_Modules.md))
- **La documentación (bóveda Obsidian) es la fuente de verdad.** Léela antes y actualízala después. (ver [`07_Documentation/Obsidian_Vault_Standard.md`](07_Documentation/Obsidian_Vault_Standard.md))
- **Toda entidad/caso de uso nuevo requiere seeds de dev y test.** (ver [`03_Database/Seeds_Strategy.md`](03_Database/Seeds_Strategy.md))

---

## 1. Identifica tu tarea

Antes de leer nada más, clasifica lo que vas a hacer:

| Tipo de tarea | Señal | Ruta a seguir |
|---|---|---|
| **Crear** nuevo módulo/entidad/funcionalidad | "añade", "crea", "implementa" | → Ruta **[CREACIÓN]** |
| **Modificar** código existente | "cambia", "arregla", "refactoriza" | → Ruta **[MODIFICACIÓN]** |
| **Documentar** | "documenta", "actualiza la nota" | → Ruta **[DOCUMENTACIÓN]** |

Si tu tarea mezcla varias, ejecuta las rutas en orden: primero MODIFICACIÓN/CREACIÓN, luego DOCUMENTACIÓN.

---

## 2. Rutas de lectura obligatoria según tarea

### [CREACIÓN] Nueva funcionalidad

Lee, en este orden:

1. [`01_Architecture/Module_Organization.md`](01_Architecture/Module_Organization.md) — entender cómo se estructuran los módulos.
2. [`01_Architecture/Naming_Conventions.md`](01_Architecture/Naming_Conventions.md) — cómo nombrar todo.
3. [`01_Architecture/Dependency_Rules.md`](01_Architecture/Dependency_Rules.md) — qué puede depender de qué.
4. [`03_Database/Seeds_Strategy.md`](03_Database/Seeds_Strategy.md) — crear los seeds de dev y test correspondientes.
5. [`06_Testing/Testing_Strategy.md`](06_Testing/Testing_Strategy.md) — qué tests son obligatorios.
6. [`07_Documentation/Obsidian_Vault_Standard.md`](07_Documentation/Obsidian_Vault_Standard.md) — crear/actualizar la nota del módulo.
7. Plantilla: [`Templates/Module_Template.md`](Templates/Module_Template.md) (módulo nuevo) o [`Templates/Entity_Template.md`](Templates/Entity_Template.md) (entidad).
8. **Cierre:** checklist [`Checklists/New_Module.md`](Checklists/New_Module.md) o [`Checklists/New_Entity.md`](Checklists/New_Entity.md).

### [MODIFICACIÓN] Cambio en código existente

1. **Prioridad máxima:** lee `.aicodeprotect.yml` del proyecto para saber qué archivos/módulos están protegidos.
2. Si tu cambio toca un módulo protegido → activa el protocolo de [`09_AI/Protected_Modules.md`](09_AI/Protected_Modules.md). **No modifiques nada sin aprobación.**
3. Si el cambio NO está protegido:
   - Lee la nota Obsidian del módulo afectado (`docs/04_Modulos/<modulo>.md`) para entender su contexto.
   - Lee los estándares aplicables según la capa: [`02_UI_UX/`](02_UI_UX/), [`04_Backend/`](04_Backend/), [`05_Frontend/`](05_Frontend/), [`03_Database/`](03_Database/).
   - Ejecuta las pruebas existentes y verifica que pasan **antes** de tocar nada (línea base verde).
4. Realiza el cambio respetando [`04_Backend/Error_Handling.md`](04_Backend/Error_Handling.md) y [`01_Architecture/Dependency_Rules.md`](01_Architecture/Dependency_Rules.md).
5. Al terminar, actualiza la documentación Obsidian si el cambio altera arquitectura, API o flujo de negocio.
6. **Cierre:** checklist [`Checklists/Modify_Existing.md`](Checklists/Modify_Existing.md).

### [DOCUMENTACIÓN] Sólo cambios en documentación

> La bóveda (`docs/`) la escribe **únicamente el Experto Obsidian** (`/obsidian`). Si eres un agente desarrollador/diseñador, **no edites `docs/` directamente**: entrega el cambio al experto.

1. Si la tarea **es** mantener la documentación, actúa como Experto Obsidian (skill `/obsidian`), siguiendo [`07_Documentation/Obsidian_Vault_Standard.md`](07_Documentation/Obsidian_Vault_Standard.md) y [`09_AI/Documentation_Expert.md`](09_AI/Documentation_Expert.md).
2. Si añades/cambias un caso de uso, verifica que tenga asociado un escenario de test E2E y refléjalo en el manual ([`07_Documentation/User_Manual_Standard.md`](07_Documentation/User_Manual_Standard.md)).
3. Mantén los enlaces wiki sin romper y el `00_MAPA_DE_CONTENIDOS.md` al día.

---

## 3. Niveles de obligatoriedad

Cada documento incluye en su cabecera YAML un campo `obligation`:

- **`mandatory`**: no puedes incumplirlo bajo ninguna circunstancia.
- **`standard`**: cúmplelo, salvo que una excepción sea aprobada explícitamente.
- **`guideline`**: orienta tu diseño, pero puedes desviarte con justificación documentada.
- **`recommendation`**: buena práctica, no obligatoria.

Cuando dos reglas entren en conflicto, gana la de mayor obligatoriedad. En empate, gana la más específica (la del módulo sobre la global).

---

## 4. Reglas de oro (nunca las rompas)

1. **No inventes tareas.** Si no hay tarea explícita, no escribas código.
2. **No toques módulos protegidos sin aprobación.**
3. **No borres datos, archivos o ramas** sin confirmación explícita.
4. **No introduzcas secretos** (API keys, contraseñas) en el código ni en commits.
5. **No dejes el repositorio en estado roto:** los tests deben pasar al terminar.
6. **Documenta lo que cambies** en la bóveda.

Lista completa: [`09_AI/Forbidden_Actions.md`](09_AI/Forbidden_Actions.md).

---

## 5. Después de finalizar la tarea

- [ ] Revisa la checklist correspondiente en [`Checklists/`](Checklists/).
- [ ] Asegúrate de que los seeds (dev/test) están actualizados.
- [ ] Ejecuta linter y tests; confirma que pasan.
- [ ] Actualiza la bóveda Obsidian si procede.
- [ ] Si el proyecto genera manual de usuario automático, deja anotaciones `@manual-step` en los tests E2E.
- [ ] Resume al humano: qué cambiaste, qué archivos, qué tests añadiste y qué documentación actualizaste.

---

## 6. Mapa rápido del framework

| Necesito… | Voy a… |
|---|---|
| Saber qué políticas existen | [`00_Governance/Policy_Index.md`](00_Governance/Policy_Index.md) |
| Estructurar un módulo | [`01_Architecture/Module_Organization.md`](01_Architecture/Module_Organization.md) |
| Nombrar algo | [`01_Architecture/Naming_Conventions.md`](01_Architecture/Naming_Conventions.md) |
| Crear seeds | [`03_Database/Seeds_Strategy.md`](03_Database/Seeds_Strategy.md) |
| Diseñar una API | [`04_Backend/API_Design.md`](04_Backend/API_Design.md) |
| Manejar errores | [`04_Backend/Error_Handling.md`](04_Backend/Error_Handling.md) |
| Escribir tests | [`06_Testing/Testing_Strategy.md`](06_Testing/Testing_Strategy.md) |
| Documentar | [`07_Documentation/Obsidian_Vault_Standard.md`](07_Documentation/Obsidian_Vault_Standard.md) |
| Desplegar | [`08_DevOps/Deployment.md`](08_DevOps/Deployment.md) |
| Entender qué tengo prohibido | [`09_AI/Forbidden_Actions.md`](09_AI/Forbidden_Actions.md) |
