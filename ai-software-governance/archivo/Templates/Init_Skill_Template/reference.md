# Referencia: guion de entrevista y descomposición (para el skill /init-project)

Material de apoyo que el initiator carga bajo demanda.

---

## Guion de entrevista

Pregunta **en bloques cortos**, no de golpe. Espera respuesta antes de seguir.

### Bloque 1 — El problema (para `VISION.md`)

1. "¿Qué problema quieres resolver? ¿Qué duele hoy sin este sistema?"
2. "¿Quién lo va a usar? Descríbeme los roles."
3. "¿Cómo lo resuelven ahora?" (revela integraciones y migraciones)

### Bloque 2 — Los límites (lo que más se olvida)

4. **"¿Qué NO debe ser este sistema?"**
5. "¿Hay algo que la gente pueda esperar y que hayas decidido no hacer?"

> Insiste aquí aunque el usuario no lo vea necesario. Es lo que evita que un agente con buen
> criterio construya algo que se decidió descartar.

### Bloque 3 — El éxito

6. "¿Cómo sabrás que funciona? Dame señales observables."
7. "¿Qué tendría que pasar para considerarlo un fracaso?"

### Bloque 4 — Restricciones

8. "¿Hay normativa, integraciones obligatorias o plazos que vienen dados?"
9. "¿Hay decisiones tomadas fuera del equipo que debo respetar?"

### Bloque 5 — Alcance (para `ALCANCE.md`)

10. "De todo eso, ¿qué entra en **esta** versión?"
11. **"¿Qué queda fuera de esta versión?"**
12. "¿De qué depende que no controlas tú?"
13. "¿Qué te preocupa que salga mal?"

---

## Señales de que falta información

| Si el usuario dice… | Pregunta |
|---|---|
| "que sea rápido" | "¿Rápido comparado con qué? ¿Cuántos segundos es aceptable?" |
| "los usuarios" | "¿Qué roles concretos? ¿Hacen cosas distintas?" |
| "lo típico de un CRUD" | "¿Quién puede crear, editar y borrar? ¿Se borra de verdad o se anula?" |
| "ya veremos" | Márcalo `[SUPUESTO — confirmar]` y sigue |
| "como el sistema X" | "¿Qué parte de X? ¿Qué **no** quieres de X?" |

---

## Heurísticas de descomposición

### De visión a metas

Una meta es **separable** si:
- Tiene valor por sí sola para el usuario.
- Puede cerrarse sin esperar a otra (o sus dependencias son explícitas).
- Sus criterios de "hecho" son verificables sin ambigüedad.

**Señales de mala meta:**
- "Backend" o "Frontend" → son capas, no metas. Una meta cruza capas.
- "Mejorar el rendimiento" → sin criterio medible, no se puede cerrar.
- Una meta que depende de las otras cinco → probablemente es el proyecto entero.

### De meta a tareas

Orden canónico:

```
1. servicio   ← primero lo que la interfaz va a consumir
2. pantalla   ← después lo que el usuario toca
3. test       ← E2E que atraviesa ambos
4. manual     ← pasos de usuario, al final
```

**Tamaño correcto:** una tarea debe caber en un ciclo
`dev → test-runner → (debugger) → mapper`. Si no cabe, pártela.

**Señales de tarea demasiado grande:**
- Toca más de un módulo.
- Su `spec` son tres o más fichas `SCR-*`.
- No se puede describir su "hecho" en una frase.

### Cuándo invocar los otros skills

| Situación | Invoca | Antes de |
|---|---|---|
| Meta funcional y ambigua | `/usecases` | Descomponer en tareas |
| Meta con interfaz | `/screens` (sobre los `UC-*`) | Crear las tareas de pantalla |
| Meta puramente técnica (migración, refactor) | Ninguno | — |

Las **ramificaciones** de los `UC-*` y las **filas del inventario** de los `SCR-*` son las
tareas de test. No las inventes: derívalas.

---

## Ejemplo vestido

### Entrevista (fragmento)

> **Agente:** ¿Qué problema quieres resolver?
> **Usuario:** Los cajeros de la clínica cuadran la caja a mano y siempre hay descuadres.
>
> **Agente:** ¿Qué **no** debe ser este sistema?
> **Usuario:** No es contabilidad. No quiero que emita facturas fiscales.
>
> **Agente:** ¿Cómo sabrás que funciona?
> **Usuario:** Que al cerrar el turno el arqueo cuadre solo, sin Excel.

### Resultado

```markdown
# VISION.md (fragmento)
## El problema
Los cajeros cuadran la caja manualmente en Excel; los descuadres se detectan tarde
y no se puede saber quién los originó.

## Qué NO es
- No es un sistema de contabilidad.
- No emite facturación fiscal.
- No sustituye al ERP existente.

## Cómo se sabe que funciona
- El arqueo de cierre cuadra sin intervención manual.
- Un descuadre queda atribuido a un turno y un cajero concretos.
```

```markdown
# ALCANCE.md (fragmento)
## Dentro
| # | Capacidad | Módulo | Casos de uso |
|---|---|---|---|
| 1 | Abrir y cerrar turno de caja | caja | UC-CAJA-001, UC-CAJA-004 |
| 2 | Registrar cobros | caja | UC-CAJA-003 |

## Fuera de alcance (explícito)
| Qué | Por qué | ¿Vuelve? |
|---|---|---|
| Facturación fiscal | Lo cubre el ERP | No |
| Arqueo multi-sucursal | Solo una sede en v1 | Sí, en v0.2 |
```

### Descomposición

```
M-001 · Flujo de caja v1
 ├── T-001  servicio   Apertura y cierre de turno    spec: UC-CAJA-001
 ├── T-002  servicio   Registro de cobros            spec: UC-CAJA-003
 ├── T-003  pantalla   Apertura de caja              spec: SCR-CAJA-002
 ├── T-004  pantalla   Cobro                         spec: SCR-CAJA-003
 ├── T-005  test       E2E turno completo            spec: UC-CAJA-001,003,004
 └── T-006  manual     Guía del cajero               spec: SCR-CAJA-002,003
```

Cada tarea nace en `sub_estado: PENDING`, `siguiente_rol: dev`, con su `depende_de`.

---

## Checklist antes de entregar

- [ ] `VISION.md` tiene su sección **"Qué NO es"** rellenada.
- [ ] `ALCANCE.md` tiene su sección **"Fuera de alcance"** rellenada.
- [ ] Cada meta tiene criterios de "hecho" **verificables**.
- [ ] Cada tarea tiene `spec` (o está marcada como pendiente de especificar).
- [ ] Cada tarea cabe en un ciclo dev → test → debug.
- [ ] Las dependencias entre tareas están declaradas.
- [ ] Los supuestos por confirmar están listados aparte.
- [ ] El usuario **aprobó explícitamente** los tres niveles.
