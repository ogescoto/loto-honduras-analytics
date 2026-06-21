---
obligation: mandatory
area: process
applies_to: all projects
---

# Checklist: Modificación de Código Existente

Antes y durante la modificación de código ya existente, verifica:

## Antes de tocar nada
- [ ] Leído `.aicodeprotect.yml`. ¿El cambio toca un módulo protegido?
  - [ ] Si **sí** → activado el protocolo de [`../09_AI/Protected_Modules.md`](../09_AI/Protected_Modules.md) y obtenido `APPROVED`.
- [ ] **Consultado el Experto Obsidian** (`/obsidian <pregunta>`) sobre el módulo afectado: dónde está, qué entender, notas relevantes. (No leer toda la bóveda a mano.)
- [ ] Leídos los estándares de la capa afectada ([`../02_UI_UX/`](../02_UI_UX/), [`../04_Backend/`](../04_Backend/), [`../05_Frontend/`](../05_Frontend/), [`../03_Database/`](../03_Database/)).
- [ ] Ejecutada la suite existente: **línea base en verde**.

## Durante el cambio
- [ ] Cambio acotado al alcance de la tarea (sin scope creep).
- [ ] Respetadas las reglas de dependencias y naming.
- [ ] Manejo de errores correcto ([`../04_Backend/Error_Handling.md`](../04_Backend/Error_Handling.md)).
- [ ] Sin secretos en el código.

## Después
- [ ] Tests existentes siguen pasando; añadidos tests para el nuevo comportamiento.
- [ ] Seeds actualizados si cambió el modelo de datos.
- [ ] Migración (si hubo cambio de esquema) con `up`/`down` y compatible.
- [ ] Cobertura por encima del umbral.
- [ ] **Entregados los cambios al Experto Obsidian** (`/obsidian update <archivos> -- <resumen>`) para actualizar la bóveda si cambió arquitectura/API/flujo. El agente no escribió en `docs/`.
- [ ] ADR (por el experto) si hubo decisión relevante.
- [ ] Revisado el reporte del experto.
- [ ] Resumen honesto al humano (qué, dónde, tests, docs, pendientes).

## Si es una utilidad global
- [ ] Análisis de impacto en todos los consumidores.
- [ ] Todos los tests del proyecto en verde.
- [ ] Catálogo `docs/03_Tecnico/Global_Utilities.md` actualizado.
- [ ] Sin eliminar API pública sin deprecación. Ver [`../01_Architecture/Global_Utilities.md`](../01_Architecture/Global_Utilities.md).
