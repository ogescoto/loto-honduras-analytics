# Referencia: mapa de la bóveda (para el skill /obsidian)

Material de apoyo que el experto carga bajo demanda. Describe **dónde va cada cosa** en la
bóveda, para mapear cambios de código → notas, y para responder consultas con rapidez.

## Estructura estándar de la bóveda

```
docs/                              ← vault (contiene .obsidian/)
├── .obsidian/                     ← config de Obsidian (marca la carpeta como vault)
├── 00_MAPA_DE_CONTENIDOS.md       ← índice navegable; PUNTO DE ENTRADA
├── 01_Dominio/                    ← lenguaje ubicuo, entidades, casos de uso, glosario
├── 02_Arquitectura/               ← ADRs, diagramas, dependencias, API, openapi
│   └── adr/                       ← un archivo por decisión (NNNN-titulo.md)
├── 03_Tecnico/                    ← stack, patrones, utilidades globales
├── 04_Modulos/                    ← una nota por módulo de negocio (Pagos.md, Usuarios.md…)
├── 05_Procesos/                   ← flujos end-to-end (Flujo_Pago.md…)
├── 06_UX_UI/                      ← navegación, mockups, design system
└── manual/                        ← manual de usuario (índice, roles, procesos, assets)
```

## Mapa: cambio de código → nota a actualizar

| Cambió… | Actualiza… |
|---|---|
| Código dentro de un módulo | `04_Modulos/<Modulo>.md` |
| Endpoint (nuevo/modificado) | `02_Arquitectura/API.md` (y la nota del módulo) |
| Entidad / value object | `01_Dominio/Entidades.md` o la nota del módulo |
| Flujo de negocio | `05_Procesos/<flujo>.md` |
| Decisión arquitectónica | nuevo ADR en `02_Arquitectura/adr/` |
| Stack / utilidad global | `03_Tecnico/` |
| Vista / navegación | `06_UX_UI/` |
| Flujo de usuario final | `manual/procesos/<proceso>.md` |
| Nuevo módulo | crear `04_Modulos/<Modulo>.md` + enlazar en `00_MAPA_DE_CONTENIDOS.md` |

## Convenciones que el experto preserva
- **Enlaces wiki:** `[[04_Modulos/Pagos|Pagos]]`.
- **Frontmatter** en cada nota (`tipo`, `modulo`, `estado`, `actualizado`).
- **Historial de cambios** al pie de las notas de módulo.
- **Notas atómicas** (un concepto por nota), enlazadas, no monolíticas.

## Plantillas del framework que usa el experto
- Nota de módulo/entidad → `Templates/Obsidian_Note_Template.md`
- ADR → `Templates/ADR_Template.md`
- Manual de usuario → `Templates/User_Manual_Template.md`

## Para responder consultas rápido
1. Abre `00_MAPA_DE_CONTENIDOS.md`.
2. Salta a la sección relevante (Módulos / Procesos / Arquitectura).
3. Lee solo la nota necesaria; resume; enlaza.
4. Revisa si el área tocada está en `.aicodeprotect.yml` (avisar si protegida).

> Si la estructura real del proyecto difiere, **adáptate a lo que existe** (descubrimiento
> dinámico) y, si procede, propón alinear con el estándar — pero nunca rompas la finalidad.
