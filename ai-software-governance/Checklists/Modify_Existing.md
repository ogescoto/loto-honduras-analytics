---
obligation: mandatory
area: process
applies_to: all projects
---

# Checklist: Modificación de Código Existente

Antes y durante la modificación de código ya existente, verifica:

## Antes de tocar nada
- [ ] Leído `.aicodeprotect.yml`. ¿El cambio toca un módulo protegido?
  - [ ] Si **sí** → activado el protocolo de [`../gobernanza/Protected_Modules.md`](../gobernanza/Protected_Modules.md) y obtenido `APPROVED`.
- [ ] **Consultado `doc-reader`** (o leído directamente) sobre el módulo afectado: dónde está, qué entender, notas relevantes de la bóveda. (No leer toda la bóveda a mano.)
- [ ] Leídos los estándares de la capa afectada ([`../practicas/`](../practicas/)).
- [ ] Ejecutada la suite existente: **línea base en verde**.

## Durante el cambio
- [ ] Cambio acotado al alcance de la tarea (sin scope creep).
- [ ] Respetadas las reglas de dependencias y naming.
- [ ] Manejo de errores correcto ([`../practicas/Error_Handling.md`](../practicas/Error_Handling.md)).
- [ ] Sin secretos en el código.

## Después
- [ ] Tests existentes siguen pasando; añadidos tests para el nuevo comportamiento.
- [ ] Seeds actualizados si cambió el modelo de datos.
- [ ] Migración (si hubo cambio de esquema) con `up`/`down` y compatible.
- [ ] Cobertura por encima del umbral.
- [ ] **Entregados los cambios a `doc-mapper`** (subagente de documentación, [`../gobernanza/Subagents.md`](../gobernanza/Subagents.md)) para actualizar la bóveda si cambió arquitectura/API/flujo. El agente no escribió en `docs/` fuera de `07_Implementacion/`.
- [ ] ADR (por `doc-mapper`) si hubo decisión relevante.
- [ ] Revisado el reporte de `doc-mapper`.
- [ ] Resumen honesto al humano (qué, dónde, tests, docs, pendientes).

## Si es una utilidad global
- [ ] Análisis de impacto en todos los consumidores.
- [ ] Todos los tests del proyecto en verde.
- [ ] Catálogo `docs/03_Tecnico/Global_Utilities.md` actualizado.
- [ ] Sin eliminar API pública sin deprecación. Ver [`../practicas/Global_Utilities.md`](../practicas/Global_Utilities.md).
