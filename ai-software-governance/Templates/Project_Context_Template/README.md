# Plantilla de `docs/00_Proyecto/` (fuente única)

Los tres archivos que capturan **la intención del proyecto**: por qué existe, qué entra en esta
versión y qué es el sistema hoy.

Norma: [`../../gobernanza/Project_Context_Standard.md`](../../gobernanza/Project_Context_Standard.md).

```
Project_Context_Template/
├── VISION.md            → docs/00_Proyecto/VISION.md
├── ALCANCE.md           → docs/00_Proyecto/ALCANCE.md
├── CONTEXTO_GLOBAL.md   → docs/00_Proyecto/CONTEXTO_GLOBAL.md
└── README.md            ← este archivo
```

## Tres archivos, tres ritmos

| Archivo | Responde | Cambia | Quién lo lee |
|---|---|---|---|
| `VISION.md` | ¿Por qué existe? ¿Qué **no** es? | Casi nunca | Una vez, para entender el porqué |
| `ALCANCE.md` | ¿Qué entra y qué queda fuera? | Por versión | Al planificar |
| `CONTEXTO_GLOBAL.md` | ¿Qué es el sistema hoy? | Continuamente | **Constantemente** |

Están separados porque sus ritmos difieren. Mezclarlos haría que lo estable se pierda entre el
ruido operativo del día a día.

## Instalación

```bash
mkdir -p docs/00_Proyecto
cp <framework>/Templates/Project_Context_Template/VISION.md          docs/00_Proyecto/
cp <framework>/Templates/Project_Context_Template/ALCANCE.md         docs/00_Proyecto/
cp <framework>/Templates/Project_Context_Template/CONTEXTO_GLOBAL.md docs/00_Proyecto/
```

## Se rellenan preguntando, no inventando

`VISION.md` y `ALCANCE.md` capturan **la intención del usuario**. Un agente que no tiene la
información **pregunta**; no rellena con supuestos plausibles. Lo no confirmado se marca
`[SUPUESTO — confirmar]` y se lista al final.

`CONTEXTO_GLOBAL.md` sí se deriva del estado real del proyecto, y lo mantiene al día
**`doc-mapper`** conforme avanza el trabajo.

## Quién escribe

Los tres viven en la bóveda curada, así que los escribe **solo `doc-mapper`**. No hay excepción
aquí — la única zona de escritura compartida es `docs/07_Implementacion/`
([`Activity_Tracking.md`](../../gobernanza/Activity_Tracking.md)).

## Por qué `ALCANCE.md` importa más de lo que parece

Su valor está en la sección **"Fuera de alcance"**. Sin ella, un agente con buen criterio
implementa lo que le parece una mejora obvia — y que se decidió deliberadamente no hacer.
Declarar el no-alcance es lo que convierte una decisión en una regla verificable.
