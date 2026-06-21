---
obligation: standard
area: documentation
applies_to: all projects
---

# Manual de Usuario Automático

## Objetivo
Generar, al final de cada ciclo de release, un manual de usuario completo que documente todos los escenarios de uso del sistema, incluyendo pasos, capturas de pantalla y vídeos, a partir de los tests E2E anotados.

La premisa: **si un flujo merece un test E2E, merece estar en el manual** — y ambos se mantienen juntos para que el manual nunca quede obsoleto.

> **El manual vive en la bóveda (`docs/manual/`) y, como el resto de la bóveda, lo escribe el Experto Obsidian** (`/obsidian`). Ver [`../09_AI/Documentation_Expert.md`](../09_AI/Documentation_Expert.md). El flujo principal es **Markdown**; la captura automática de pantallas/vídeo es una **mejora opcional**, no un requisito.

## Formato de salida
Sitio web estático (MkDocs, Docusaurus o Hugo) o PDF, generado a partir de fuentes Markdown en `docs/manual/`.

## Estructura base
Ver plantilla en [`../Templates/User_Manual_Template.md`](../Templates/User_Manual_Template.md):

```
docs/manual/
├── index.md                 # Introducción
├── roles.md                 # Roles de usuario
├── procesos/
│   ├── login.md
│   ├── pago.md              # generado desde el E2E anotado
│   └── ...
└── assets/                  # capturas y vídeos generados
```

Cada proceso documenta: descripción, precondiciones, pasos numerados, resultado esperado y multimedia.

## Generación automática

1. **Anotaciones en E2E.** Cada caso de uso de cara al usuario tiene un test E2E (Playwright) con etiquetas `@manual-step` que describen el paso (ver [`../06_Testing/E2E_Standards.md`](../06_Testing/E2E_Standards.md)).

2. **Ensamblaje por el Experto Obsidian.** El experto (`/obsidian`) lee las anotaciones `@manual-step` de los E2E y mantiene las páginas Markdown del manual en `docs/manual/procesos/`, en español y orientadas al usuario.

3. **Multimedia (opcional).** La captura automática de pantallas/vídeo es una mejora opcional. Si se usa, las capturas se guardan en `docs/manual/assets/` y se enlazan desde las páginas. Existe un script de referencia [`../Tools/generate_manual.py`](../Tools/generate_manual.py) (**opcional/legado**) que puede ejecutar los E2E en staging y capturar pantallas; no es el flujo principal.

## Flujo conceptual

```
E2E anotado (@manual-step)
        │  el agente entrega los flujos al experto
        ▼
/obsidian ──► docs/manual/procesos/*.md  (+ assets opcionales) ──► sitio/PDF
```

## Responsabilidad del agente
- Al implementar un **nuevo flujo de usuario**, añade las anotaciones `@manual-step` en sus tests E2E y **entrégaselo al Experto Obsidian** para que actualice el manual.
- Los textos de los pasos, en **español**, claros y orientados a la acción del usuario (los redacta/ajusta el experto).
- En la checklist de release ([`../Checklists/Release.md`](../Checklists/Release.md)) se verifica que el manual está actualizado.

## Calidad del manual
- Escrito para el **usuario final**, no para desarrolladores.
- Sin jerga técnica innecesaria.
- Cada proceso autoexplicativo: alguien nuevo debe poder seguirlo.

## Anti-patrones
- ❌ Manual escrito a mano que se desincroniza del producto.
- ❌ Flujos de usuario sin anotaciones `@manual-step`.
- ❌ Capturas obsoletas que no se regeneran en release.
- ❌ Lenguaje técnico dirigido al usuario final.

## Relacionado
- [`../06_Testing/E2E_Standards.md`](../06_Testing/E2E_Standards.md), [`Obsidian_Vault_Standard.md`](Obsidian_Vault_Standard.md), [`../09_AI/Documentation_Expert.md`](../09_AI/Documentation_Expert.md), [`../Templates/User_Manual_Template.md`](../Templates/User_Manual_Template.md)
