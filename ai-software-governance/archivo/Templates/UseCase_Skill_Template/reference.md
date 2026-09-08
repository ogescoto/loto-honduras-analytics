# Referencia: plantilla canónica del caso de uso (para el skill /usecases)

Material de apoyo que el arquitecto carga bajo demanda. Contiene la **plantilla obligatoria**
de salida (Output Blueprint), las convenciones de identificación y un ejemplo vestido.

## Convenciones

- **ID:** `UC-<MODULO>-<NNN>` — módulo en mayúsculas abreviado, número secuencial de 3 dígitos
  (ej. `UC-CAJA-003`, `UC-AUTH-001`). Alineado con `01_Architecture/Naming_Conventions.md`.
- **Archivo:** `UC-<MODULO>-<NNN>_<nombre-kebab>.md` (ej. `UC-CAJA-003_cobrar-tratamiento.md`).
- **Destino en la bóveda:** `docs/01_Dominio/casos_de_uso/` (lo persiste el Experto Obsidian,
  nunca este skill).
- **Numeración de ramas:** nacen de un paso del flujo principal con letras — la rama `a` del
  paso 4 se numera `4.a.1`, `4.a.2`…
- **Formato de paso:** `[Actor/Sistema]` en negrita + acción descriptiva de negocio.

---

## Plantilla obligatoria (copiar íntegra por cada caso de uso)

```markdown
---
tipo: caso-de-uso
id: UC-<MODULO>-<NNN>
modulo: <módulo principal>
estado: borrador | validado | implementado
actualizado: <YYYY-MM-DD>
---

# [UC-<MODULO>-<NNN>] NOMBRE DEL CASO DE USO (Acción Clara)

## 1. CONTROL DE CONTEXTO

* **Módulos del Sistema Afectados:** [Ej. Módulo Clínico, Módulo de Caja, Core Auth]
* **Actores Involucrados:** [Lista de roles descriptivos, ej. Paciente, Odontólogo, Cajero]
* **Precondiciones del Entorno:** [Estado exacto del sistema antes de iniciar]
* **Postcondiciones de Éxito:** [Estado final verificable del sistema al terminar]

---

## 2. FLUJO PRINCIPAL (CAMINO FELIZ)

*La secuencia lineal y perfecta de acciones. Formato: [Actor/Sistema] + [Acción descriptiva].*

1. El **[Actor]** realiza [acción específica]…
2. El **Sistema** valida y responde [acción específica]…
3. …

---

## 3. RAMIFICACIONES Y ESCENARIOS ALTERNOS (ÁRBOL DE DECISIONES)

*Cada ramificación nace de un paso específico del Flujo Principal, con letras (a, b, c).*

### Ramificación desde el Paso [X] — [Nombre del escenario alterno]
* **Condición de Activación:** [Qué detonó esta desviación]
* **Flujo Descriptivo:**
    X.a.1 El **[Actor/Sistema]** hace…
    X.a.2 El **Sistema** procesa…
    * *Nota de Impacto:* [Qué pasa con el estado del negocio aquí]

### Ramificación desde el Paso [Y] — [Escenario de excepción o error]
* **Condición de Activación:** [Fallo del sistema, validación denegada, etc.]
* **Flujo Descriptivo:**
    Y.b.1 El **Sistema** detecta [error/restricción]…
    Y.b.2 El **Sistema** bloquea la acción, muestra alerta y regresa al estado [Z].

---

## 4. ESCENARIOS DE REVERSIÓN E INTEGRIDAD (EL ESCENARIO DEL ARREPENTIMIENTO)

*Flujo detallado si el proceso debe deshacerse por completo DESPUÉS de alcanzar la
Postcondición de Éxito. Si no aplica, declararlo explícitamente y justificar.*

* **Gatillo de Reversión:** [Ej. El cajero se equivocó, el doctor canceló de última hora]
* **Flujo de Deshacer:**
    1. El **[Actor]** solicita la anulación/reversión de la acción.
    2. El **Sistema** genera un registro de contra-asiento o anulación
       (Auditoría: NUNCA se elimina el registro original).
    3. El **Sistema** devuelve los estados de las entidades a su precondición original y
       libera los recursos/insumos comprometidos.

---

## 5. TRAZABILIDAD (cierre de gobernanza)

| Derivación | Referencia |
|---|---|
| Escenarios de test (uno por flujo y por rama) | [pendiente / ruta de los tests] |
| Seeds que las precondiciones exigen (`dev_`/`test_`) | [pendiente / ruta de seeds] |
| Proceso del manual de usuario (si hay actor humano) | [pendiente / `manual/procesos/…`] |
| Notas de la bóveda relacionadas | [[04_Modulos/<Modulo>]], [[05_Procesos/<flujo>]] |
| Supuestos por confirmar | [lista de `[SUPUESTO — confirmar]` o "ninguno"] |
```

---

## Matriz resumen (al final de cada sesión de generación)

| ID | Caso de uso | Actores | Ramas | ¿Reversión? | Módulos |
|---|---|---|---|---|---|
| UC-… | … | … | n | Sí/No aplica | … |

---

## Tabla de traducción código → semántica (Modalidad B)

| Componente de código | Elemento del caso de uso |
|---|---|
| `if / else`, `switch`, guardas tempranas | Ramificaciones / caminos alternos (sección 3) |
| `try / catch`, `throw`, códigos HTTP 4xx/5xx | Flujos de excepción (sección 3) |
| Transacciones, rollbacks, compensaciones, notas de crédito | Escenarios de reversión (sección 4) |
| Enums / máquinas de estado | Precondiciones y postcondiciones (sección 1) |
| Validaciones de entrada (DTO, constraints) | Condiciones de activación de ramas de restricción |
| Guards, roles, permisos, ACL | Actores involucrados y sus límites (sección 1) |
| Colas, jobs, eventos asíncronos | Pasos del Sistema diferidos + rama de fallo del job |

## Herramientas MCP (si están configuradas)

Solo **lectura** — política en `09_AI/Codebase_And_Vault_MCP.md`:

| Tool | Para qué la usa el arquitecto |
|---|---|
| `get_architecture` | Visión estructural del módulo antes de trazar flujos |
| `search_graph` | Localizar símbolos/flujos por nombre de negocio |
| `get_code_snippet` | Leer solo el símbolo relevante (ahorra tokens) |
| `trace_path` | Seguir el flujo entre capas (controller → use case → repo) |

> Sin MCP: todo se hace con Read/Grep/Glob (degradación elegante).
> Este skill **no** usa herramientas de escritura de la bóveda: la persistencia de los UC
> es del Experto Obsidian (`/obsidian update`).

---

## Ejemplo vestido (fragmento orientativo)

```markdown
# [UC-CAJA-003] COBRAR TRATAMIENTO ODONTOLÓGICO

## 2. FLUJO PRINCIPAL (CAMINO FELIZ)
1. El **Cajero** selecciona la cita completada del paciente.
2. El **Sistema** muestra el detalle del tratamiento y el importe a cobrar.
3. El **Cajero** registra el método de pago indicado por el **Paciente**.
4. El **Sistema** valida el importe, emite el comprobante y marca la cita como *Pagada*.

## 3. RAMIFICACIONES…
### Ramificación desde el Paso 3 — El paciente desiste del pago
* **Condición de Activación:** el Paciente decide no pagar en este momento.
* **Flujo Descriptivo:**
    3.a.1 El **Cajero** cancela la operación de cobro.
    3.a.2 El **Sistema** conserva la cita como *Completada — pendiente de pago*.
    * *Nota de Impacto:* la deuda queda visible en la cuenta del paciente.

## 4. ESCENARIOS DE REVERSIÓN…
* **Gatillo de Reversión:** el Cajero cobró un importe equivocado.
* **Flujo de Deshacer:**
    1. El **Cajero** solicita la anulación del cobro.
    2. El **Sistema** genera una nota de crédito vinculada al comprobante original
       (el comprobante original NUNCA se elimina).
    3. El **Sistema** regresa la cita al estado *Completada — pendiente de pago*.
```
