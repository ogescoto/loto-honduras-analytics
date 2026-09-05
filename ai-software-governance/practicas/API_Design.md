---
obligation: standard
area: backend
applies_to: all projects
---

# Diseño de APIs

## Propósito
Que las APIs sean predecibles, consistentes y fáciles de consumir, tanto por humanos como por agentes. Una API bien diseñada se documenta sola.

## Estilo por defecto: REST sobre HTTP/JSON
(Para otros estilos —GraphQL, gRPC, RPC— documenta la decisión en un ADR y adapta estas reglas.)

## Reglas REST

| Aspecto | Regla | Ejemplo |
|---|---|---|
| Recursos | Sustantivos en plural | `/payments`, `/users` |
| Jerarquía | Anidar cuando hay pertenencia | `/users/{id}/payments` |
| Verbos HTTP | Semánticos | `GET` leer, `POST` crear, `PUT/PATCH` actualizar, `DELETE` borrar |
| Acciones no-CRUD | Sub-recurso o verbo explícito | `POST /payments/{id}/refund` |
| Filtros/orden | Query params | `GET /payments?status=pending&sort=-created_at` |
| Paginación | `limit` + `cursor`/`offset` | `?limit=20&cursor=...` |
| Versionado | En la ruta o cabecera | `/v1/payments` |
| Formato | JSON, `snake_case` o `camelCase` consistente | — |

## Códigos de estado HTTP

| Código | Uso |
|---|---|
| `200 OK` | Lectura/actualización con éxito |
| `201 Created` | Recurso creado (incluir `Location`) |
| `204 No Content` | Éxito sin cuerpo (p. ej. delete) |
| `400 Bad Request` | Entrada malformada |
| `401 Unauthorized` | No autenticado |
| `403 Forbidden` | Autenticado pero sin permiso |
| `404 Not Found` | Recurso inexistente |
| `409 Conflict` | Conflicto de estado (duplicado, versión) |
| `422 Unprocessable Entity` | Validación de negocio fallida |
| `429 Too Many Requests` | Rate limit |
| `500` / `503` | Error del servidor / no disponible |

## Forma de la respuesta
Respuesta de éxito (recurso):

```json
{
  "data": {
    "id": "pay_123",
    "amount": 2500,
    "currency": "EUR",
    "status": "completed",
    "created_at": "2026-06-18T09:30:00Z"
  }
}
```

Respuesta de error (formato estándar del proyecto, ver [`Error_Handling.md`](Error_Handling.md)):

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

## Idempotencia
- `GET`, `PUT`, `DELETE` son idempotentes por definición.
- Para `POST` que crean recursos cobrables (pagos), soporta cabecera `Idempotency-Key`.

## Contrato y documentación
- Toda API pública se describe con **OpenAPI** (`docs/02_Arquitectura/openapi.yaml`) o equivalente.
- El contrato es parte del Definition of Done; se actualiza en el mismo PR que el endpoint.
- Cambios incompatibles → nueva versión + ADR.

## Seguridad (resumen, ver `Security.md`)
- Autenticación en toda ruta no pública.
- Autorización por recurso (no confíes solo en "estar logueado").
- Validación de toda entrada (ver [`Validation.md`](Validation.md)).

## Anti-patrones
- ❌ Verbos en la URL (`/getPayments`, `/createUser`).
- ❌ `200 OK` para errores con `{"success": false}`.
- ❌ Filtrar/ordenar con rutas en vez de query params.
- ❌ Romper el contrato sin versionar.
- ❌ Exponer IDs internos secuenciales si son sensibles.
