---
obligation: mandatory
area: ai-governance
applies_to: all projects
---

# Acciones Prohibidas para Agentes de IA

## Propósito
Lista explícita de lo que un agente **nunca** debe hacer. Cuando una de estas situaciones se cruza con una tarea, el agente se detiene y pide confirmación humana.

> Esta lista es `mandatory` y no admite interpretación creativa. Ante la duda, **pregunta**, no actúes.

## 1. Sobre el alcance del trabajo
- ❌ **Escribir código sin una tarea explícita.** No "mejorar" cosas por iniciativa propia.
- ❌ Ampliar el alcance de una tarea sin acordarlo (scope creep).
- ❌ Refactorizar masivamente "de paso" mientras se hace otra cosa.

## 2. Sobre módulos protegidos
- ❌ Modificar cualquier `path` protegido en `.aicodeprotect.yml` sin aprobación (ver [`Protected_Modules.md`](Protected_Modules.md)).
- ❌ Interpretar el silencio o la falta de respuesta como aprobación.

## 3. Sobre datos y destructividad
- ❌ Borrar archivos, ramas, tablas o datos **sin confirmación explícita**.
- ❌ Ejecutar migraciones destructivas sin respaldo y aprobación.
- ❌ Ejecutar `seed:development` o `seed:test` contra producción.
- ❌ `git push --force`, `git reset --hard`, reescritura de historial compartido sin permiso.

## 4. Sobre seguridad y secretos
- ❌ Escribir secretos (API keys, contraseñas, tokens) en el código, commits, logs o documentación.
- ❌ Desactivar comprobaciones de seguridad (auth, validación, escaneo) para "que funcione".
- ❌ Introducir dependencias sin verificar reputación/mantenimiento.
- ❌ Implementar criptografía propia.

## 5. Sobre calidad
- ❌ Dejar el repositorio con **tests en rojo**.
- ❌ Eliminar/“skippear” tests para pasar CI.
- ❌ Desactivar gates de CI o reglas de lint para desbloquear un merge.
- ❌ Bajar la cobertura por debajo del umbral sin justificación.

## 6. Sobre documentación
- ❌ **Escribir directamente en la bóveda (`docs/`).** La bóveda la escribe **solo el Experto Obsidian** (`/obsidian`). Si crees que falta documentación, **entrégasela al experto**; no la escribas tú. Ver [`Documentation_Expert.md`](Documentation_Expert.md).
- ❌ Cambiar arquitectura/API/flujos y **no entregar** los cambios al experto para que actualice la bóveda.
- ❌ Crear un módulo sin que el experto cree su nota en `docs/04_Modulos/`.
- ❌ Trabajar sin **consultar** antes al experto (desperdicia contexto y arriesga incoherencia).

## 7. Sobre seeds
- ❌ Crear una entidad/caso de uso **sin** sus seeds de desarrollo y test.
- ❌ Meter datos de prueba en el seed de producción.

## 8. Sobre acciones de impacto externo
- ❌ Desplegar a producción sin autorización explícita.
- ❌ Enviar datos a servicios externos sin que sea parte de la tarea autorizada.
- ❌ Realizar acciones irreversibles o de cara al exterior sin confirmar.

## Qué hacer cuando te topas con un "❌"
1. **Detente** antes de ejecutar la acción.
2. **Explica** al humano qué necesita la tarea y por qué choca con una prohibición.
3. **Propón** alternativas o pide la aprobación necesaria.
4. **Espera** confirmación explícita. No actúes hasta tenerla.

## Excepciones
Cualquier excepción a estas reglas requiere aprobación humana explícita y, si afecta a una política `standard`/`mandatory`, un registro (ver [`../00_Governance/Exceptions_Process.md`](../00_Governance/Exceptions_Process.md)). Una prohibición `mandatory` no se "salta": como mucho, el humano asume la acción.

## Relacionado
- [`Protected_Modules.md`](Protected_Modules.md), [`Documentation_Expert.md`](Documentation_Expert.md), [`Prompt_Rules.md`](Prompt_Rules.md), [`Agent_Workflow.md`](Agent_Workflow.md), [`../04_Backend/Security.md`](../04_Backend/Security.md), [`../08_DevOps/Secrets_Management.md`](../08_DevOps/Secrets_Management.md)
