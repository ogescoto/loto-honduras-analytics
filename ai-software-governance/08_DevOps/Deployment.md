---
obligation: standard
area: devops
applies_to: all projects
---

# Despliegue

## Propósito
Que el paso a producción sea seguro, reversible y observable. Desplegar no debe dar miedo.

## Principios
1. **Reversibilidad.** Todo despliegue tiene un rollback claro y rápido.
2. **Gradualidad.** Preferir despliegues progresivos (canary/rolling) sobre "big bang".
3. **Inmutabilidad.** Se despliegan artefactos versionados, no cambios en caliente.
4. **Observabilidad.** Tras desplegar, se vigilan métricas y logs.
5. **Sin downtime** cuando sea posible (ver patrón expand/contract en [`../03_Database/Migrations.md`](../03_Database/Migrations.md)).

## Flujo de promoción

```
PR ──► Preview (efímero)
   merge a main ──► Staging (seed:development, validación + manual)
            aprobación ──► Production (seed:production)
```

- **Preview:** entorno/URL por PR para revisión.
- **Staging:** réplica de producción; aquí se valida y se genera el manual de usuario.
- **Production:** promoción explícita y aprobada.

## Estrategias de despliegue

| Estrategia | Cuándo |
|---|---|
| **Rolling** | Por defecto; sustitución gradual de instancias |
| **Canary / Rolling release** | Cambios de riesgo; exponer a un % de tráfico primero |
| **Blue-green** | Cuando se necesita conmutación instantánea + rollback inmediato |

## Migraciones y despliegue
- Las migraciones se aplican de forma compatible (expand/contract) para permitir rollback del código sin romper la BD.
- Nunca un despliegue que requiera migración destructiva irreversible sin respaldo y aprobación.

## Rollback
- Definir el procedimiento exacto (volver a la versión anterior del artefacto).
- Probar el rollback, no solo el despliegue.
- Si el despliegue incluyó migración, el rollback contempla el estado de la BD.

## Post-despliegue (checklist)
- [ ] Health checks en verde.
- [ ] Métricas clave estables (errores, latencia, throughput).
- [ ] Logs sin picos de error.
- [ ] Smoke test de flujos críticos.
- [ ] Plan de rollback listo durante la ventana de observación.

## Observabilidad mínima
- **Logs** estructurados con `trace_id` (ver [`../04_Backend/Error_Handling.md`](../04_Backend/Error_Handling.md)).
- **Métricas** (errores, latencia, saturación).
- **Alertas** sobre umbrales relevantes.
- **Health/readiness checks** expuestos por el servicio.

## Reglas para el agente
- No despliegues a producción sin que el proyecto lo autorice explícitamente; trátalo como acción de alto impacto.
- Asegura que existe rollback antes de desplegar.
- Documenta el despliegue (versión, cambios, migraciones) en el changelog del proyecto.

## Anti-patrones
- ❌ Editar producción en caliente.
- ❌ Desplegar sin plan de rollback.
- ❌ Migraciones destructivas sin respaldo.
- ❌ Desplegar y no observar.

## Relacionado
- [`CI_CD.md`](CI_CD.md), [`Environments.md`](Environments.md), [`../03_Database/Migrations.md`](../03_Database/Migrations.md), [`../Checklists/Release.md`](../Checklists/Release.md)
