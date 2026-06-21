---
tipo: adr
estado: aceptado
actualizado: 2026-06-20
---

# ADR-0001: Adopción del AI Software Governance Framework

[[00_MAPA_DE_CONTENIDOS|Mapa de Contenidos]]

- **Estado:** Aceptado
- **Fecha:** 2026-06-20
- **Decisores:** Tech Lead, propietario del producto
- **Relacionado:** adopción inicial del framework; bóveda `docs/`, `.aicodeprotect.yml`, skill `/obsidian`

## Contexto
El proyecto Loto Honduras Analytics se desarrolla con fuerte asistencia de agentes de IA sobre un monorepo con zonas sensibles (pagos, cobros presenciales con dinero real, RBAC de suscripciones, esquema de BD, tipos compartidos). Sin reglas explícitas, los agentes pueden modificar módulos críticos, dispersar la documentación o trabajar sin una fuente de verdad común.

## Decisión
Adoptaremos el **AI Software Governance Framework** mediante **copia/vendoring** dentro del repositorio, en `ai-software-governance/`. De él se derivan tres mecanismos operativos:

1. **Bóveda Obsidian como única fuente de verdad** en `docs/`, con estructura estándar (`01_Dominio` … `manual/`).
2. **Experto Obsidian** (skill `/obsidian`) como **único escritor** de `docs/`; los demás agentes consultan antes y entregan cambios después.
3. **Módulos protegidos** declarados en `.aicodeprotect.yml`, que exigen aprobación humana (`APPROVED`) para cambios sensibles.

## Alternativas consideradas
- **No usar framework (convenciones informales):** menor fricción inicial, pero sin garantías de coherencia ni protección de zonas críticas. Descartada por el riesgo en pagos/cobros.
- **Referenciar el framework como dependencia externa (submódulo/paquete):** evita duplicar contenido, pero acopla el proyecto a la disponibilidad y versión remota y complica el trabajo offline de los agentes. Descartada a favor de vendoring para tener el estándar disponible localmente y versionado con el repo.

## Consecuencias
- (+) Una sola fuente de verdad navegable; menos contexto gastado por los agentes.
- (+) Zonas críticas protegidas explícitamente contra cambios no aprobados.
- (+) Documentación siempre actualizada vía el Experto Obsidian.
- (−) El contenido vendado puede divergir del upstream; requiere re-sincronización manual.
- (−) Sobrecarga de proceso: documentar y pedir aprobación en módulos protegidos.
- **Impacto en:** todos los módulos; flujo de trabajo de todos los agentes.
- **Reversibilidad:** alta (eliminar `ai-software-governance/`, `.aicodeprotect.yml` y el skill), aunque se perderían las garantías.

## Seguimiento
- [x] Crear la estructura de la bóveda en `docs/`.
- [x] Documentar dominio, arquitectura, módulos y procesos iniciales.
- [ ] Mantener `00_MAPA_DE_CONTENIDOS.md` al día en cada cambio.
