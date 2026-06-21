---
template: true
tipo: modulo
modulo: <nombre-modulo>
estado: activo
actualizado: AAAA-MM-DD
---

# Nota de módulo / entidad

> Copia esta plantilla a `docs/04_Modulos/<Modulo>.md` al crear un módulo. Mantén el frontmatter y el historial al día. Ver [`../07_Documentation/Obsidian_Vault_Standard.md`](../07_Documentation/Obsidian_Vault_Standard.md).

## [[00_MAPA_DE_CONTENIDOS|Mapa de Contenidos]]

## Módulo: [Nombre del módulo]

### Responsabilidad
Breve descripción (1-2 frases) de qué problema de negocio resuelve este módulo.

### Lenguaje ubicuo
- **Término A:** definición.
- **Término B:** definición.

### Dependencias
- [[04_Modulos/OtroModulo|OtroModulo]]
- Servicio externo: Stripe

### API pública
- **Comandos:** `CreatePaymentCommand`, `RefundPaymentCommand`
- **Consultas:** `GetPaymentStatusQuery`
- **Eventos:** `PaymentCompletedEvent`

### Entidades principales
- `Payment` — ver [[01_Dominio/Entidades#Payment|Payment]]
- `PaymentMethod`

### Decisiones técnicas relevantes
- [[02_Arquitectura/adr/0003-stripe-checkout|ADR-0003]]: Uso de Stripe Checkout en lugar de elementos propios.

### Flujos relacionados
- [[05_Procesos/Flujo_Pago|Flujo de Pago]]

### Datos y seeds
- Seed dev: `dev_payments`
- Seed test: `test_payments`

### Protección
- Estado en `.aicodeprotect.yml`: (protegido / no protegido)

### Historial de cambios
- AAAA-MM-DD: creación inicial.
- AAAA-MM-DD: añadido soporte para reembolsos.
