---
tipo: proceso
estado: activo
actualizado: 2026-06-20
---

# Flujo: Acceso a meta-patrones premium

[[00_MAPA_DE_CONTENIDOS|Mapa de Contenidos]]

Caso de uso [[01_Dominio/Casos_de_Uso#CU-02|CU-02]]. Cómo un cliente accede a los [[01_Dominio/Glosario#Patrones|meta-patrones]] de nivel 2.

## Actores
- Cliente (con o sin suscripción), backend (`require-active-subscription`).

## Secuencia
```mermaid
sequenceDiagram
  participant C as Cliente (frontend)
  participant API as backend-hono
  participant MW as require-active-subscription
  participant DB as Neon
  C->>API: GET /api/v1/premium/meta-patterns (userId)
  API->>MW: ejecuta middleware
  MW->>DB: ¿suscripción activa y endDate > ahora?
  alt sin userId
    MW-->>C: 401 UNAUTHENTICATED
  else sin suscripción vigente
    MW-->>C: 403 SUBSCRIPTION_REQUIRED
  else vigente
    MW->>API: next()
    API->>DB: SELECT meta_patterns
    API-->>C: 200 { metaPatterns[] }
  end
```

## Reglas
- Acceso ⇔ `isActive = true` **y** `endDate > ahora`.
- La suscripción puede provenir de Stripe o de un [[05_Procesos/Flujo_Cobro_Presencial|cobro presencial]]; el flujo es idéntico desde aquí.

## Pendiente
- En producción `userId` debe venir del **JWT**, no del query (andamiaje). Ver [[04_Modulos/Suscripciones|Suscripciones]].

## Historial de cambios
- 2026-06-20: creación inicial.
