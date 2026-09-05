# Plantilla del registro de implementación (fuente única)

Esqueleto copiable de `docs/07_Implementacion/`, la **zona de escritura compartida** de la
bóveda. Norma completa: [`../../07_Documentation/Implementation_Log_Standard.md`](../../07_Documentation/Implementation_Log_Standard.md).

```
Implementation_Log_Template/
├── PROTOCOLO.md          ← contrato de entrada; se copia tal cual
├── TABLERO_Template.md   → 00_TABLERO.md      (solo lo escribe el PM)
├── META_Template.md      → M-<NNN>/META.md
├── INDICE_Template.md    → M-<NNN>/00_INDICE.md
├── TAREA_Template.md     → M-<NNN>/T-<NNN>_<nombre>.md
├── LOG_Template.md       → M-<NNN>/_log/LOG_<YYYY-MM-DD>.md
└── README.md             ← este archivo
```

## Qué resuelve

Permite que **agentes que no se conocen se releven**: uno deja el trabajo en un sub-estado
conocido y otro lo recoge sin haber hablado nunca. El `sub_estado` de cada tarea decide qué rol
entra después — nadie asigna trabajo a nadie.

```
PENDING → CODING → CODE_COMPLETE → TESTING ─┬─ TEST_PASSED → MAPPED → COMPLETE
                        ▲                    │
                        └── FIX_REQUIRED ◄── TEST_FAILED → DEBUG_ANALYSIS
```

## Instalación en un proyecto

```bash
mkdir -p docs/07_Implementacion
cp <framework>/Templates/Implementation_Log_Template/PROTOCOLO.md docs/07_Implementacion/
cp <framework>/Templates/Implementation_Log_Template/TABLERO_Template.md docs/07_Implementacion/00_TABLERO.md
```

Al abrir una meta:

```bash
mkdir -p docs/07_Implementacion/M-001_flujo-pagos/_log
cp <framework>/Templates/Implementation_Log_Template/META_Template.md   docs/07_Implementacion/M-001_flujo-pagos/META.md
cp <framework>/Templates/Implementation_Log_Template/INDICE_Template.md docs/07_Implementacion/M-001_flujo-pagos/00_INDICE.md
```

Y una copia de `TAREA_Template.md` por cada tarea.

## Quién escribe qué

| Artefacto | Escribe |
|---|---|
| `PROTOCOLO.md` | Humano (casi nunca cambia) |
| `00_TABLERO.md` | **Solo el Project Manager** (`/board`) |
| `META.md`, `00_INDICE.md` | PM y quien abre la meta |
| `T-*.md`, `_log/*.md` | **Todos los agentes** (append-only) |

El resto de la bóveda (`docs/01_` … `06_`, `docs/manual/`) lo escribe **solo el Experto
Obsidian**. Esta carpeta es la única excepción.

## Mantenerlo "siempre actualizado"

La instalación es una **copia**. Cuando el framework mejore las plantillas, re-sincroniza
`PROTOCOLO.md` y las plantillas — **nunca** los archivos ya en uso (tienen historial que no se
reescribe).

> Regla: no edites la plantilla instalada para "arreglarla" localmente. Mejora la fuente y
> re-sincroniza, para que todos los proyectos hereden la mejora.
