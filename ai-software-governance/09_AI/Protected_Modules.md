---
obligation: mandatory
area: ai-governance
applies_to: all projects
---

# Módulos Protegidos

## Propósito
Permitir que un proyecto declare zonas de código que **ningún agente de IA puede modificar** sin una revisión y aprobación humana explícita. Protege lo crítico: seguridad, pagos, utilidades globales, contratos públicos.

## Configuración del proyecto
Cada proyecto incluye un archivo `.aicodeprotect.yml` en su raíz. Estructura:

```yaml
version: 1
protected_modules:
  - path: src/core/authentication/**
    reason: "Módulo crítico de seguridad. Cualquier cambio requiere revisión de arquitectura."
    ask_approval: true
    approval_process: "Crear un issue 'Propuesta de cambio protegido' y esperar aprobación del Tech Lead."

  - path: src/global-utils/**
    reason: "Utilidades globales, impacto transversal."
    ask_approval: true

  - path: src/payments/stripe-integration/**
    reason: "Integración con Stripe, sensible a cambios en flujos de pago."
    ask_approval: true

  - path: docs/architecture/**
    ask_approval: false   # solo lectura
```

Ver ejemplo completo en [`../Examples/.aicodeprotect.yml`](../Examples/.aicodeprotect.yml).

## Campos

| Campo | Significado |
|---|---|
| `path` | Glob de archivos/carpetas protegidos |
| `reason` | Por qué está protegido (contexto para el agente y el revisor) |
| `ask_approval: true` | Requiere aprobación humana para modificar |
| `ask_approval: false` | Solo lectura: leer sí, modificar requiere tratarlo como protegido |
| `approval_process` | Canal y procedimiento para pedir aprobación |
| `approval_keyword` | (opcional) palabra clave de aprobación; por defecto `APPROVED` |

## Protocolo de modificación (Mandatory)

Si un agente detecta que su tarea necesita tocar un `path` protegido con `ask_approval: true`:

1. **Detenerse inmediatamente** antes de hacer cualquier modificación.
2. **Elaborar un análisis del cambio propuesto** que incluya:
   - Archivos exactos a modificar.
   - Razón del cambio (caso de uso o bug que lo motiva).
   - Impacto en otros módulos (dependencias entrantes/salientes).
   - Riesgos identificados (seguridad, rendimiento, regresiones).
   - Alternativas consideradas.
3. **Presentar el análisis** a través del canal definido en `approval_process` (issue de GitHub, tarea, etc.).
4. **Esperar aprobación explícita.** La aprobación es un comentario con la palabra clave `APPROVED` (o `approval_keyword`) o un label específico.
5. **Solo tras la aprobación**, proceder con la modificación y luego **actualizar la documentación** correspondiente en la bóveda.

> Si no hay aprobación, el agente **no modifica nada** y reporta el bloqueo al humano.

## Solo lectura (`ask_approval: false`)
Los paths con `ask_approval: false` pueden **leerse** pero **nunca modificarse**. Si la tarea requiere cambiarlos, se trata como si fuera `ask_approval: true` (solicitar permiso).

## Plantilla de solicitud de cambio protegido

```markdown
## Propuesta de cambio protegido

**Path(s) afectado(s):** src/core/authentication/session.ts
**Tarea que lo motiva:** #123 — corregir expiración de sesión
**Cambio propuesto:** ajustar TTL del token de refresh de 7d a 24h
**Impacto:** afecta a todos los flujos autenticados; requiere re-login más frecuente
**Riesgos:** posible aumento de fricción; revisar refresh automático
**Alternativas:** sliding sessions (descartada por complejidad)
**Tests/migraciones:** añadir test de expiración; sin migración de BD

> Esperando `APPROVED` del Tech Lead.
```

## Verificación
- Recomendado: un check en CI o un pre-commit que, dado el diff, verifique que no se tocan paths protegidos sin la aprobación registrada.

## Anti-patrones
- ❌ Modificar un módulo protegido "porque era un cambio pequeño".
- ❌ Interpretar el silencio como aprobación.
- ❌ Editar un path `ask_approval: false`.
- ❌ Aprobar tu propia propuesta como agente.

## Relacionado
- [`Forbidden_Actions.md`](Forbidden_Actions.md), [`Agent_Workflow.md`](Agent_Workflow.md), [`../01_Architecture/Global_Utilities.md`](../01_Architecture/Global_Utilities.md), [`../00_Governance/Exceptions_Process.md`](../00_Governance/Exceptions_Process.md)
