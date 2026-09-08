---
obligation: standard
area: database
applies_to: all projects
---

# Migraciones de Base de Datos

## Propósito
Que el esquema evolucione de forma versionada, reproducible y reversible. El estado de la BD se deriva de la secuencia de migraciones, nunca de cambios manuales.

## Reglas

1. **Toda modificación de esquema es una migración.** Prohibido tocar el esquema "a mano" en cualquier entorno compartido.
2. **Inmutabilidad:** una migración ya aplicada en un entorno compartido (staging/prod) **no se edita**; se corrige con una nueva migración.
3. **Reversibilidad:** cada migración define `up` y `down` (o se documenta por qué `down` no es posible).
4. **Atomicidad:** una migración hace un cambio cohesivo. No mezclar cambios no relacionados.
5. **Orden:** las migraciones se nombran con timestamp/secuencia para garantizar orden determinista.
6. **Sin pérdida de datos silenciosa:** una migración destructiva (drop column/table) requiere revisión y suele tratarse como cambio protegido.

## Nomenclatura
`<timestamp>_<verbo>_<objeto>.sql` (o el formato del ORM):

```
20260618093000_create_payment_methods_table.sql
20260618094500_add_is_default_to_payment_methods.sql
20260620101000_drop_legacy_tokens_table.sql
```

## Ejemplo de migración up/down

```sql
-- 20260618094500_add_is_default_to_payment_methods.sql

-- == UP ==
ALTER TABLE payment_methods
    ADD COLUMN is_default BOOLEAN NOT NULL DEFAULT false;

-- == DOWN ==
ALTER TABLE payment_methods
    DROP COLUMN is_default;
```

## Migraciones que rompen compatibilidad (expand/contract)
Para cambios que afectan a código en ejecución, usa el patrón **expand → migrate → contract**:

1. **Expand:** añade lo nuevo sin quitar lo viejo (nueva columna nullable).
2. **Migrate:** despliega código que escribe en ambos; rellena datos.
3. **Contract:** una vez todo migrado, elimina lo viejo en una migración posterior.

Esto permite despliegues sin downtime y rollbacks seguros.

## Relación con seeds
- Las migraciones definen **estructura**; los seeds definen **datos** (ver [`Seeds_Strategy.md`](Seeds_Strategy.md)).
- El seed de producción puede asumir que las migraciones ya corrieron.

## Verificación obligatoria antes de mergear
- [ ] La migración aplica limpia sobre una BD desde cero.
- [ ] El `down` revierte correctamente (probado en local).
- [ ] No rompe los seeds existentes.
- [ ] Los tests de integración pasan contra el nuevo esquema.

## Anti-patrones
- ❌ Editar una migración ya aplicada en staging/prod.
- ❌ Migración destructiva sin plan de rollback ni respaldo.
- ❌ Cambios de esquema fuera del sistema de migraciones.
- ❌ Una migración gigante con 15 cambios no relacionados.
