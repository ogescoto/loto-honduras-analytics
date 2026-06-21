---
obligation: guideline
area: ui-ux
applies_to: all projects
---

# Principios de Diseño (UI/UX)

## Propósito
Dar a los agentes y diseñadores un marco común para tomar decisiones de interfaz coherentes, sin imponer un estilo visual concreto.

## Principios

1. **Claridad ante todo.** La interfaz comunica qué se puede hacer y qué está pasando. Evita ambigüedad.
2. **Consistencia.** Mismos patrones para mismos problemas: un botón primario se ve y se comporta igual en toda la app. Apóyate en el [`Design_System.md`](Design_System.md).
3. **Feedback inmediato.** Toda acción del usuario produce una respuesta visible (estado de carga, éxito, error).
4. **Prevención de errores.** Es mejor evitar el error (deshabilitar, confirmar, validar en línea) que solo informarlo.
5. **Jerarquía visual.** Lo importante destaca; lo secundario se subordina. Usa tamaño, color y espacio con intención.
6. **Accesibilidad por defecto.** Ver [`Accessibility.md`](Accessibility.md). No es opcional.
7. **Carga cognitiva mínima.** Reconocer sobre recordar; valores por defecto sensatos; pasos progresivos.
8. **Respeta al usuario.** Sin patrones oscuros (dark patterns), sin engaños, sin interrupciones innecesarias.

## Estados que toda vista debe contemplar

| Estado | Qué mostrar |
|---|---|
| **Carga** | Skeleton/spinner; no salto de layout |
| **Vacío** | Mensaje útil + acción sugerida (no una pantalla en blanco) |
| **Error** | Qué pasó + cómo recuperarse (reintentar) |
| **Éxito** | Confirmación clara |
| **Parcial / offline** | Comunicar degradación, no fallar en silencio |

> Un agente que implemente una vista **debe** considerar estos cinco estados, no solo el "camino feliz".

## Reglas de pantalla e interacción (Mandatory)

Estas reglas son **innegociables** (nivel `Mandatory`, aunque este documento sea `guideline`).
Aplican a toda pantalla y a todo elemento que dispare un proceso.

### 1. CRUD y reportes en página completa, no en modal
Toda pantalla de **CRUD** (alta/edición/listado) o de **reporte** ocupa su **propia página
completa**. Los **modales** se reservan para confirmaciones y avisos cortos (p.ej. "¿Eliminar
este registro?"), **nunca** para formularios CRUD ni reportes. Razón: los modales rompen el
historial de navegación, el deep-linking, el responsive y la accesibilidad de flujos largos.

### 2. Toda página vive dentro del container de la app (shell)
Cada página se renderiza **dentro del container de la página principal**: un **shell**
persistente con cabecera, menú/navegación y un **área de contenido** donde se montan las
páginas. No se abren páginas fuera del shell, en ventanas/popups sueltos ni en pestañas nuevas
del navegador para flujos internos. El shell se mantiene; solo cambia el área de contenido.

### 3. Anti-doble-click en cualquier acción que procese
Todo botón o elemento clicable que **dispare un proceso** (guardar, enviar, generar, navegar)
se **deshabilita y muestra estado de carga** desde el primer click hasta que la operación
termina (éxito o error). El usuario **no puede** disparar la misma acción dos veces por un
doble click. Es *idempotencia visual*: una intención = una ejecución. El patrón técnico (botón
`loading`/`disabled` + guardia de reentrada) está en
[`../05_Frontend/Component_Architecture.md`](../05_Frontend/Component_Architecture.md).

### 4. Overlay de procesamiento en menú y navegación
Al **navegar** o ejecutar una acción **desde el menú**, se muestra un **overlay bloqueante de
procesamiento** que cubre el área e **impide reentradas** (doble click en el menú) hasta que la
navegación/acción se resuelve. Evita lanzar dos veces la misma página o pisar una carga en curso.

## Microcopy
- Mensajes en **español**, claros y orientados a la acción.
- Errores que explican qué hacer, no códigos crudos al usuario.
- Botones con verbos (`Guardar cambios`, no `OK`).

## Responsive y dispositivos
- Diseño adaptable: móvil, tablet, escritorio.
- Áreas táctiles suficientes (mínimo ~44×44 px).
- No depender solo de hover (no existe en táctil).

## Relación con el manual de usuario
Cada flujo de UI relevante debe poder documentarse en el manual de usuario automático (ver [`../07_Documentation/User_Manual_Standard.md`](../07_Documentation/User_Manual_Standard.md)) mediante tests E2E anotados.

## Anti-patrones
- ❌ Pantallas en blanco sin estado vacío.
- ❌ Acciones sin feedback.
- ❌ Inconsistencia visual entre vistas equivalentes.
- ❌ Dark patterns (suscripciones difíciles de cancelar, casillas pre-marcadas engañosas).
- ❌ Texto de error técnico mostrado al usuario final.
- ❌ Formulario CRUD o reporte dentro de un modal en vez de su propia página.
- ❌ Abrir una página fuera del shell (popup, ventana o pestaña suelta) para un flujo interno.
- ❌ Botón que permite doble envío por no bloquearse durante el proceso.
- ❌ Navegar desde el menú sin overlay, permitiendo dobles clicks que lanzan la acción dos veces.
