---
obligation: standard
area: architecture
applies_to: all projects
---

# Organización de Módulos

## Propósito
Definir cómo se estructura el código en módulos, para que cualquier agente o humano sepa dónde colocar y dónde encontrar cada pieza, y para que las fronteras del negocio se reflejen en las fronteras del código.

## Principios
- Segregación por **bounded contexts** de Domain-Driven Design.
- Cada módulo tiene una **API pública** bien definida; el resto del código es privado.
- Las dependencias entre módulos son **explícitas y unidireccionales** siempre que sea posible (ver [`Dependency_Rules.md`](Dependency_Rules.md)).
- Un módulo es **reemplazable**: si su API pública se respeta, su interior puede reescribirse sin romper a los demás.

## Estructura interna de un módulo

```
src/<module>/
├── domain/            # Entidades, value objects, interfaces de repositorio, eventos
├── application/       # Casos de uso, servicios de aplicación, comandos/consultas
├── infrastructure/    # Implementaciones concretas (BD, APIs externas, seeds)
├── presentation/      # Controladores, vistas, DTOs de entrada/salida (si aplica)
├── __tests__/         # Tests del módulo (o junto a cada archivo, según el stack)
└── MODULE.yaml        # Manifiesto obligatorio del módulo
```

> La estructura es conceptual. En un stack concreto puede mapearse a paquetes, carpetas o namespaces; documenta el mapeo en `docs/03_Tecnico/`.

### Qué va en cada capa

| Capa | Contiene | NO contiene |
|---|---|---|
| `domain` | Reglas de negocio puras, entidades, VOs, interfaces | Frameworks, SQL, HTTP, llamadas a red |
| `application` | Orquestación de casos de uso | Detalles de persistencia o transporte |
| `infrastructure` | Adaptadores: repositorios, clientes HTTP, ORMs, seeds | Lógica de negocio |
| `presentation` | Controladores, mapeo HTTP↔caso de uso, validación de forma | Reglas de negocio |

## Ejemplo concreto: módulo de Pagos

```
src/payments/
├── domain/
│   ├── payment.entity.ts          # Entidad Payment
│   ├── money.vo.ts                # Value Object Money
│   ├── payment-repository.ts      # interface PaymentRepository (puerto)
│   └── events/payment-completed.event.ts
├── application/
│   ├── create-payment.usecase.ts
│   └── get-payment-status.query.ts
├── infrastructure/
│   ├── stripe-payment.repository.ts   # implementa PaymentRepository con Stripe
│   ├── postgres-payment.repository.ts
│   └── seeds/
│       ├── dev_payments.ts
│       └── test_payments.ts
├── presentation/
│   ├── payments.controller.ts
│   └── dto/create-payment.dto.ts
└── MODULE.yaml
```

## Manifiesto MODULE.yaml (obligatorio)
Ver plantilla en [`../Templates/Module_Template.md`](../Templates/Module_Template.md). Debe incluir, como mínimo:
- Nombre, propósito, equipo responsable.
- Bounded context.
- Dependencias (otros módulos, servicios externos).
- Nivel de protección (heredado de `.aicodeprotect.yml` o sobrescrito).

## API pública de un módulo
- Se declara explícitamente (índice de exportaciones, fachada, o sección "API pública" en la nota Obsidian del módulo).
- Tipos típicos de elementos públicos: **Comandos** (mutan estado), **Consultas** (leen), **Eventos** (notifican).
- Todo lo no declarado como público es privado y **no debe importarse desde otro módulo**.

## Módulos protegidos
Cualquier módulo puede marcarse como protegido en `.aicodeprotect.yml`. Los agentes tienen **prohibido** modificar código de módulos protegidos sin aprobación explícita (ver [`../09_AI/Protected_Modules.md`](../09_AI/Protected_Modules.md)).

## Anti-patrones (evitar)
- ❌ Importar entidades internas de otro módulo saltándose su API pública.
- ❌ Lógica de negocio en `presentation` o en `infrastructure`.
- ❌ Dependencias circulares entre módulos.
- ❌ Un "módulo god" que lo hace todo.

## Checklist relacionada
- [`../Checklists/New_Module.md`](../Checklists/New_Module.md)
