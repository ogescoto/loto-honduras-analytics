---
obligation: standard
area: ai-governance
applies_to: all projects
---

# Flujo de Trabajo y Reglas de Interacción del Agente

## Propósito

Definir el ciclo de trabajo del agente —**coordinador delgado** que delega en subagentes de scope definido, consume pocos tokens y termina con lo esencial registrado— y las reglas de cómo se formulan las tareas y cómo el agente razona y responde, para obtener resultados predecibles, trazables y dentro del framework.

## Principios

1. **Delega, no resuelvas todo inline.** El principal entiende, decide a quién le toca y revisa el resumen. Cada subagente trabaja con su contexto aislado.
2. **Modelo por perfil.** Barato para leer/probar/registrar; capaz solo para escribir. Ver [`Subagents.md`](Subagents.md).
3. **Modo cavernícola.** Razonamiento interno mínimo; respuesta completa en el idioma del usuario.
4. **Solo 3 momentos de aprobación humana:** plan inicial (arranque del proyecto o tarea grande), acción irreversible/destructiva y módulo protegido. El resto, avanza con criterio y marca `[SUPUESTO — confirmar]` lo no confirmado.

## El ciclo

```
1. ENTIENDE      → lectura mínima: AGENTS.md, docs relevantes, tarea o entrevista inicial
2. PLANIFICA     → plan breve: qué hace, quién (subagente), qué tests, qué docs
3. DELEGA        → subagente correcto con scope claro; recibe resumen compacto
4. REVISA        → verifica el resumen y el estado (no confía en la palabra: comprueba)
5. PRUEBA        → tester ejecuta; si falla, el dev correspondiente corrige según reporte
6. DOCUMENTA     → doc-mapper actualiza bóveda; activity-manager registra estado/fechas
7. REGISTRA      → tabla META/TAREA/ESTADO/FECHA_INI/FECHA_FIN (si el proyecto la usa)
8. REPORTA       → resumen honesto al humano: qué cambió, qué falló, qué falta
```

> **Ahorro de contexto:** no leas toda la bóveda. Usa `doc-reader` para preguntas de contexto; usa `doc-mapper` para escribir. Tu contexto se gasta en decidir y revisar, no en hacer el trabajo de todos.

## Detalle por fase

### 1. Entender
- Clasifica la petición: crear / modificar / documentar / arrancar proyecto.
- Si es un proyecto sin `docs/00_Proyecto/`, activa la **asistencia inicial** ([`Project_Start.md`](Project_Start.md)).
- Consulta `.aicodeprotect.yml` si existe. Antes de cualquier cambio.
- Para dudas de contexto, delega en `doc-reader`.

### 2. Planificar
- Plan breve: archivos a tocar, subagente que ejecuta, tests, documentación.
- Solo si la tarea es **ambigua o compleja** y el usuario lo pide, se genera spec detallada (casos de uso / fichas de pantalla). Por defecto: descripción + criterios de aceptación bastan.
- Si el plan toca algo irreversible o un módulo protegido → pide aprobación **antes** de continuar.

### 3. Delegar
- Elige el subagente según [`Subagents.md`](Subagents.md). Dale un encargo cerrado: objetivo, límites, formato del resumen.
- Cada subagente arranca limpio (contexto aislado) y devuelve solo el resultado.

### 4. Revisar
- Comprueba que el resultado es real: lee el diff, el test o la salida. No aceptes el resumen sin verificar.
- Si el resultado no cumple, devuelve al mismo subagente con indicación concreta.

### 5. Probar
- El `tester` ejecuta la suite (modelo barato).
- Si falla: el `debugger` **no existe como subagente**; el reporte del tester se entrega al `dev` correspondiente, que corrige y vuelve a probar.

### 6–7. Documentar y registrar
- `doc-mapper` escribe la documentación de lo que quedó funcional (tests en verde).
- `activity-manager` actualiza la tabla de actividades (ver [`Activity_Tracking.md`](Activity_Tracking.md)).
- Si no hay subagentes configurados, el principal hace la tarea mínima: actualizar la nota del módulo y la tabla.

### 8. Reportar
- Qué cambiaste, archivos, tests y su resultado, documentación, pendientes.

## Cuándo detenerse y preguntar (solo estos casos)

- Tarea ambigua o irreversible: pide aclaración o aprobación.
- Necesidad de tocar un módulo protegido (`.aicodeprotect.yml`).
- Acción destructiva (borrar, migración destructiva, deploy a producción, `force push`).

## Cómo formular una tarea (para quien la da)

Una buena tarea para un agente incluye:

- **Objetivo claro:** qué se quiere lograr (no cómo, salvo que importe).
- **Contexto:** módulo afectado, nota de la bóveda relevante, restricciones.
- **Criterios de aceptación:** cómo sabremos que está bien (tests, comportamiento).
- **Límites:** qué NO tocar, alcance acotado.

### Plantilla de tarea

```markdown
## Tarea
Implementar el reembolso parcial de un pago.

## Contexto
- Módulo: payments (ver docs/04_Modulos/Pagos.md)
- Flujo: docs/05_Procesos/Flujo_Pago.md
- Integra con Stripe (módulo protegido: requiere aprobación si se toca stripe-integration)

## Criterios de aceptación
- POST /payments/{id}/refund con importe parcial.
- Validación: no exceder el importe original ni reembolsar dos veces.
- Tests unitarios + integración; seeds dev/test actualizados.
- Nota del módulo y API.md actualizadas.

## Límites
- No modificar el flujo de creación de pago.
- No tocar autenticación (protegido).
```

## Cómo razonar y responder (para el agente)

1. **Empieza en [`../AI_START_HERE.md`](../AI_START_HERE.md)** y clasifica la tarea.
2. **Lee antes de escribir:** bóveda del módulo + estándares aplicables.
3. **Comprueba `.aicodeprotect.yml`** antes de tocar nada.
4. **Plan explícito antes de actuar** en tareas no triviales: enumera archivos a cambiar, tests a añadir, docs a actualizar.
5. **Pregunta ante la ambigüedad** en lugar de asumir, especialmente si afecta a algo irreversible o protegido.
6. **No inventes contexto.** Si un dato no está, búscalo o pregúntalo; no lo supongas.
7. **Cita tus fuentes** del repo: archivo y línea cuando referencias código.
8. **Resume al terminar:** qué cambiaste, archivos, tests, documentación, y qué quedó pendiente.

## Comunicación
- Respuestas en el **idioma del usuario** (declarado en el contrato), claras y al grano.
- Reporta honestamente: si los tests fallan, dilo con la salida; si saltaste un paso, dilo.
- No afirmes que algo está hecho y verificado si no lo está.

## Trazabilidad
- Relaciona el trabajo con la tarea/issue que lo motiva.
- Commits siguiendo Conventional Commits (ver [`../practicas/Naming_Conventions.md`](../practicas/Naming_Conventions.md)).
- Decisiones relevantes → ADR.

## Anti-patrones

- ❌ Resolver inline lo que un subagente barato resuelve con menos contexto.
- ❌ Usar modelo capaz para leer o probar.
- ❌ Autodeclarar verde sin que el `tester` ejecute.
- ❌ Reportar éxito sin verificar.
- ❌ Pedir aprobación humana para cosas que no lo requieren (eso bloquea en segundo plano).
- ❌ Tareas vagas ("mejóralo") sin criterios de aceptación.
- ❌ El agente asume requisitos no expresados.
- ❌ Actuar sin plan en cambios grandes.
- ❌ Inventar nombres de archivos/APIs sin comprobar que existen.

## Relacionado

- [`../AI_START_HERE.md`](../AI_START_HERE.md), [`Subagents.md`](Subagents.md), [`Forbidden_Actions.md`](Forbidden_Actions.md), [`Protected_Modules.md`](Protected_Modules.md), [`Project_Start.md`](Project_Start.md), [`Activity_Tracking.md`](Activity_Tracking.md)
