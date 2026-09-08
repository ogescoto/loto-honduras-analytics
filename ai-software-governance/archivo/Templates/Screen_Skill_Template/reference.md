# Referencia: plantilla canónica de la ficha de pantalla (para el skill /screens)

Material de apoyo que el arquitecto carga bajo demanda. Contiene la **plantilla obligatoria**
de salida (Output Blueprint), las convenciones de identificación y un ejemplo vestido.

## Convenciones

- **ID:** `SCR-<MODULO>-<NNN>` — módulo en mayúsculas abreviado, número secuencial de 3 dígitos
  (ej. `SCR-CAJA-002`, `SCR-AUTH-001`). Alineado con `01_Architecture/Naming_Conventions.md`.
- **Archivo:** `SCR-<MODULO>-<NNN>_<nombre-kebab>.md` (ej. `SCR-CAJA-002_apertura-de-caja.md`).
- **Destino en la bóveda:** `docs/01_Dominio/pantallas/` (lo persiste el Experto Obsidian,
  nunca este skill).
- **Tipos de pantalla:** `listado` | `formulario` | `detalle` | `reporte`.
- **Nomenclatura de controles:** nombre visible para el usuario, entre asteriscos
  (ej. *Guardar cambios*), nunca el identificador técnico.

---

## Plantilla obligatoria (copiar íntegra por cada pantalla)

```markdown
---
tipo: pantalla
id: SCR-<MODULO>-<NNN>
modulo: <módulo principal>
tipo_pantalla: listado | formulario | detalle | reporte
estado: borrador | validado | implementado
actualizado: <YYYY-MM-DD>
---

# [SCR-<MODULO>-<NNN>] NOMBRE DE LA PANTALLA

## 1. IDENTIDAD Y RUTA

* **Nombre de negocio:** [Cómo la llama el usuario, ej. "Apertura de caja"]
* **Propósito en una frase:** [Qué permite lograr]
* **Ruta / deep-link:** [Ej. `/caja/apertura`, o `[SUPUESTO — confirmar]`]
* **Tipo:** listado | formulario | detalle | reporte
* **Posición en el shell:** [Área de contenido del shell; entrada de menú desde la que se
  alcanza, si la hay]
* **Cumple "página completa, no modal":** Sí / No aplica (justificar si es un modal)

---

## 2. ACTORES Y PERMISOS

| Actor / Rol | ¿Puede entrar? | Qué ve o puede hacer de distinto |
|---|---|---|
| [Ej. Cajero] | Sí | Acceso completo |
| [Ej. Supervisor] | Sí | Además puede [acción exclusiva] |
| [Ej. Recepcionista] | No | Se redirige a [pantalla] con aviso de permiso insuficiente |

---

## 3. CONTRATO DE DATOS

* **Recibe del llamante:** [Parámetros de ruta, contexto, registro seleccionado. "Ninguno" si
  es punto de entrada.]
* **Consulta al cargar:** [Qué datos pide al sistema para pintarse]
* **Retorna al llamante:** [Qué devuelve al cerrarse — obligatorio si es pantalla invocable.
  "No retorna (pantalla terminal)" si aplica.]
* **Persiste:** [Qué escribe en el sistema, o "no persiste (solo lectura)"]

---

## 4. INVENTARIO DE ACCIONES

*UNA FILA POR CONTROL. Sin excepciones, sin resúmenes.*

| Control | Dispara | Validación previa | Efecto en el sistema | Feedback al usuario | Navega a | Bloqueo | Reversible |
|---|---|---|---|---|---|---|---|
| *[Nombre visible]* | [Qué proceso] | [Reglas que deben cumplirse antes] | [Qué cambia] | [Qué ve: toast, inline, modal] | [SCR-… o "permanece"] | Sí / N/A | Sí (mecanismo) / No / N/A |

> **Columna "Bloqueo":** `Sí` para toda acción que dispare un proceso — el control se
> deshabilita y muestra carga hasta resolver (anti-doble-click). `N/A` solo para controles
> que no procesan (ej. abrir un desplegable).
>
> **Columna "Reversible":** si la acción muta estado, indica cómo se deshace (anulación,
> contra-asiento, edición posterior) o `No` si es irreversible — en ese caso el feedback
> **debe** incluir confirmación previa.

---

## 5. LOS CINCO ESTADOS

*Los cinco se declaran siempre. Si uno no aplica, escribir "no aplica" CON su razón.*

| Estado | Qué muestra esta pantalla |
|---|---|
| **Carga** | [Skeleton/spinner concreto; sin salto de layout] |
| **Vacío** | [Mensaje útil + acción sugerida. Nunca pantalla en blanco] |
| **Error** | [Qué pasó en lenguaje de usuario + cómo recuperarse] |
| **Éxito** | [Confirmación concreta tras la acción principal] |
| **Parcial / offline** | [Qué se degrada y cómo se comunica] |

---

## 6. MAPA DE NAVEGACIÓN

* **Se llega desde:**
  * [SCR-…] mediante *[control]*
  * Menú principal → [entrada] — **con overlay de procesamiento**
* **Se sale hacia:**
  * [SCR-…] tras [acción]
  * [Pantalla anterior] al cancelar

---

## 7. TRAZABILIDAD (cierre de gobernanza)

| Derivación | Referencia |
|---|---|
| Casos de uso que materializa | [UC-…], [UC-…] o `[SIN UC — generar con /usecases]` |
| Escenarios E2E (uno por acción que muta estado) | [pendiente / ruta de los tests] |
| Pasos del manual de usuario (`@manual-step`) | [pendiente / `manual/procesos/…`] |
| Notas de la bóveda relacionadas | [[04_Modulos/<Modulo>]], [[05_Procesos/<flujo>]] |
| Incumplimientos de reglas `Mandatory` de UI | [lista o "ninguno"] |
| Supuestos por confirmar | [lista de `[SUPUESTO — confirmar]` o "ninguno"] |
```

---

## Mapa de pantallas (al final de cada sesión de generación)

| ID | Pantalla | Tipo | Actores | Acciones | UC que cubre |
|---|---|---|---|---|---|
| SCR-… | … | formulario | … | n | UC-… |

---

## Tabla de traducción código → superficie de interacción (Modalidad B)

| Componente de código | Elemento de la ficha |
|---|---|
| Router, definición de rutas, páginas por sistema de archivos | Ruta y deep-link (sección 1) |
| Guardas de ruta, roles, `can()`, decoradores de permiso | Actores y permisos (sección 2) |
| Parámetros de ruta, props de entrada | "Recibe del llamante" (sección 3) |
| Valor devuelto al cerrar / callback de resultado | "Retorna al llamante" (sección 3) |
| Handlers `onClick`, `onSubmit`, acciones de fila | Filas del inventario (sección 4) |
| Schema de validación, reglas de campo | Columna "Validación previa" (sección 4) |
| `disabled` + `loading` durante la petición | Columna "Bloqueo" (sección 4) |
| Estados `loading` / lista vacía / `error` | Los cinco estados (sección 5) |
| `navigate()`, `redirect`, enlaces | Columna "Navega a" + mapa (secciones 4 y 6) |

## Herramientas MCP (si están configuradas)

Solo **lectura** — política en `09_AI/Codebase_And_Vault_MCP.md`:

| Tool | Para qué la usa el arquitecto |
|---|---|
| `get_architecture` | Visión estructural del módulo de UI antes de mapear pantallas |
| `search_graph` | Localizar páginas y handlers por nombre de negocio |
| `get_code_snippet` | Leer solo el componente relevante (ahorra tokens) |
| `trace_path` | Seguir la navegación entre pantallas y hacia el backend |

> Sin MCP: todo se hace con Read/Grep/Glob (degradación elegante).
> Este skill **no** usa herramientas de escritura de la bóveda: la persistencia de las fichas
> es del Experto Obsidian (`/obsidian update`).

---

## Ejemplo vestido (fragmento orientativo)

```markdown
# [SCR-CAJA-002] APERTURA DE CAJA

## 1. IDENTIDAD Y RUTA
* **Nombre de negocio:** Apertura de caja
* **Propósito en una frase:** Permite al cajero abrir su turno declarando el fondo inicial.
* **Ruta / deep-link:** `/caja/apertura`
* **Tipo:** formulario
* **Posición en el shell:** área de contenido; menú principal → Caja → Abrir caja
* **Cumple "página completa, no modal":** Sí

## 4. INVENTARIO DE ACCIONES

| Control | Dispara | Validación previa | Efecto en el sistema | Feedback al usuario | Navega a | Bloqueo | Reversible |
|---|---|---|---|---|---|---|---|
| *Monto inicial* (campo) | Validación en línea | Numérico, mayor que cero | Ninguno | Error inline bajo el campo | Permanece | N/A | N/A |
| *Abrir caja* | Apertura del turno | Monto válido; el cajero no tiene otra caja abierta | Crea el turno en estado *Abierta* | Toast "Caja abierta" | SCR-CAJA-001 | Sí | Sí (anulación de apertura por Supervisor) |
| *Cancelar* | Descarte del formulario | Confirmar si hay datos escritos | Ninguno | Modal de confirmación | SCR-CAJA-001 | N/A | N/A |

## 5. LOS CINCO ESTADOS

| Estado | Qué muestra esta pantalla |
|---|---|
| **Carga** | Skeleton del formulario mientras se verifica si ya hay una caja abierta |
| **Vacío** | No aplica — el formulario siempre tiene campos que mostrar |
| **Error** | "No se pudo abrir la caja" + motivo en lenguaje de usuario + botón Reintentar |
| **Éxito** | Toast "Caja abierta" y redirección al listado |
| **Parcial / offline** | Aviso "Sin conexión: no es posible abrir caja" y botón deshabilitado |

## 7. TRAZABILIDAD
| Derivación | Referencia |
|---|---|
| Casos de uso que materializa | UC-CAJA-001 |
| Escenarios E2E | pendiente — 1 por acción que muta (*Abrir caja*) |
| Incumplimientos de reglas `Mandatory` de UI | ninguno |
```
