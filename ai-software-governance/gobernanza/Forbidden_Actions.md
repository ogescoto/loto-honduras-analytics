---
obligation: mandatory
area: ai-governance
applies_to: all projects
---

# Acciones Prohibidas (6 reglas duras)

## Propósito

Solo estas 6 reglas son **innegociables**. Todo lo demás son prácticas recomendadas, no límites. Ante la duda entre una regla dura y una tarea, **detente y pregunta**.

## Las 6 reglas

1. **No escribas secretos.** Nada de API keys, contraseñas o tokens en código, commits, logs o documentación.

2. **No hagas acciones destructivas sin OK explícito.** Borrar archivos/ramas/tablas/datos, migraciones destructivas, `git push --force`, `git reset --hard`, deploy a producción. Sin confirmación humana, no se ejecutan.

3. **No dejes el repo con tests en rojo.** No elimines ni "saltees" tests para pasar CI, ni desactives gates de lint/cobertura.

4. **No toques un módulo protegido sin aprobación.** Si `.aicodeprotect.yml` declara un `path` con `ask_approval: true`, el cambio requiere `APPROVED` explícito. El silencio no es aprobación. Ver [`Protected_Modules.md`](Protected_Modules.md).

5. **No inventes tareas ni amplíes alcance.** Sin tarea explícita no se escribe código. Lo no confirmado se marca `[SUPUESTO — confirmar]`; no se asume.

6. **No dejes de documentar lo que cambiaste.** Al menos la nota del módulo afectado y el registro de actividad (`META | TAREA | ESTADO | FECHA_INI | FECHA_FIN`). Ver [`Activity_Tracking.md`](Activity_Tracking.md).

## Qué hacer cuando chocas con una regla dura

1. **Detente** antes de ejecutar.
2. **Explica** al humano qué necesita la tarea y por qué choca.
3. **Propón** alternativas o pide la aprobación necesaria.
4. **Espera** confirmación explícita. No actúes hasta tenerla.

## Excepciones

Una excepción a una regla dura requiere aprobación humana explícita y registro (ver [`Exceptions_Process.md`](Exceptions_Process.md)). Una regla `mandatory` no se "salta": como mucho, el humano asume la acción.

## Relacionado

- [`Protected_Modules.md`](Protected_Modules.md), [`Agent_Workflow.md`](Agent_Workflow.md), [`Exceptions_Process.md`](Exceptions_Process.md), [`Activity_Tracking.md`](Activity_Tracking.md)
