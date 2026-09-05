---
obligation: mandatory
area: backend
applies_to: all projects
---

# Manejo de Errores

## Propósito
Que los errores sean explícitos, consistentes y diagnosticables. Un error nunca debe perderse en silencio ni filtrar detalles internos al cliente.

## Principios (Mandatory)
1. **Nunca tragar errores en silencio.** Prohibido `catch` vacío.
2. **Falla rápido y claro.** Valida precondiciones al principio; lanza errores específicos.
3. **Distingue tipos de error:** errores de negocio (esperados) vs. errores técnicos (inesperados).
4. **No filtres internos.** El cliente recibe un mensaje útil y un código; los detalles técnicos van al log, no a la respuesta.
5. **Trazabilidad.** Todo error técnico se loguea con un `trace_id` correlacionable con la petición.

## Taxonomía de errores

| Tipo | Origen | HTTP típico | Se loguea como |
|---|---|---|---|
| Validación de entrada | cliente | 400 / 422 | `warn` |
| Autenticación | cliente | 401 | `warn` |
| Autorización | cliente | 403 | `warn` |
| Recurso no encontrado | cliente | 404 | `info`/`warn` |
| Conflicto de estado | cliente | 409 | `warn` |
| Regla de negocio violada | dominio | 422 | `warn` |
| Error técnico/infra | servidor | 500/503 | `error` |

## Jerarquía de excepciones (ejemplo)

```ts
abstract class AppError extends Error {
  abstract readonly code: string;       // estable, para clientes
  abstract readonly httpStatus: number;
  readonly isOperational = true;        // esperado vs. bug
  details?: unknown;
}

class ValidationError extends AppError {
  code = 'VALIDATION_FAILED';
  httpStatus = 422;
}

class NotFoundError extends AppError {
  code = 'RESOURCE_NOT_FOUND';
  httpStatus = 404;
}

class PaymentAmountInvalidError extends AppError {
  code = 'PAYMENT_AMOUNT_INVALID';
  httpStatus = 422;
}
```

## Formato de respuesta de error (estándar del framework)

```json
{
  "error": {
    "code": "PAYMENT_AMOUNT_INVALID",
    "message": "El importe debe ser mayor que cero.",
    "details": [{ "field": "amount", "issue": "must_be_positive" }],
    "trace_id": "req_abc123"
  }
}
```

- `code`: identificador estable, en `UPPER_SNAKE_CASE`. Los clientes programan contra esto.
- `message`: legible por humanos, sin stack traces ni rutas internas.
- `details`: opcional, estructurado.
- `trace_id`: correlaciona con los logs.

## Manejador global
Toda API tiene un **error handler central** que:
1. Mapea `AppError` → respuesta con su `httpStatus` y `code`.
2. Cualquier error no `AppError` → `500` genérico + log a nivel `error` con stack y `trace_id`.
3. Nunca devuelve el stack trace al cliente en producción.

```ts
function errorHandler(err, req, res) {
  const traceId = req.traceId;
  if (err instanceof AppError && err.isOperational) {
    logger.warn({ code: err.code, traceId });
    return res.status(err.httpStatus).json({ error: { code: err.code, message: err.message, details: err.details, trace_id: traceId } });
  }
  logger.error({ err, traceId }); // bug inesperado
  return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Ha ocurrido un error inesperado.', trace_id: traceId } });
}
```

## Reglas para el agente
- Lanza el error **más específico** disponible; crea uno nuevo si hace falta (documentándolo).
- No uses `throw new Error("algo falló")` genérico en lógica de negocio.
- Loguea con contexto estructurado, nunca `console.log` suelto en producción.
- Reintentos solo para errores transitorios e idempotentes, con backoff.

## Anti-patrones
- ❌ `catch (e) {}` (silenciar).
- ❌ Devolver `200` con `success: false`.
- ❌ Exponer stack traces o SQL al cliente.
- ❌ Convertir todo en `500`.
- ❌ Loguear y re-lanzar el mismo error varias veces (ruido).

## Relacionado
- [`API_Design.md`](API_Design.md), [`Validation.md`](Validation.md), [`Security.md`](Security.md)
