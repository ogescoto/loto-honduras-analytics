---
obligation: mandatory
area: database
applies_to: all projects
---

# Estrategia de Semillas (Seeds)

## Propósito
Garantizar que cada entorno (producción, desarrollo, test) tenga **exactamente** los datos iniciales que necesita, sin mezclar responsabilidades. Un dato de prueba no debe llegar nunca a producción; un dato de producción no debe contaminar un test.

## Tipos de seed

### 1. Seed de Producción (`seed:production`)
- **Cuándo se ejecuta:** solo en el despliegue final a producción.
- **Contenido obligatorio:**
  - Catálogos base (roles, permisos, configuraciones fijas, países, monedas…).
  - Datos estructurales necesarios para que el sistema arranque.
- **Prohibido:**
  - Datos ficticios, usuarios de prueba, credenciales por defecto.
  - Información que no deba existir en el entorno real.
- **Requisito:** debe ser idempotente y seguro de re-ejecutar (no duplica catálogos).

### 2. Seed de Desarrollo (`seed:development`)
- **Cuándo se ejecuta:** en entornos de staging, QA o desarrollo local.
- **Contenido obligatorio:**
  - Usuarios clave con distintos roles y permisos para revisión manual.
  - Datos realistas (generados con Faker o anonimizados) para pruebas exploratorias.
  - Escenarios preparados para demo.
- **Nomenclatura:** archivos con prefijo `dev_`. Ej.: `dev_usuarios.sql`, `dev_casos_pago.py`.
- **Requisito:** ejecutable repetidamente sin efectos colaterales (idempotente o limpiando datos previos).

### 3. Seed de Test (`seed:test`)
- **Cuándo se ejecuta:** antes de suites de tests automáticos (unitarios, integración, E2E con Playwright, Stripe, etc.).
- **Contenido obligatorio:**
  - Fixtures deterministas y reproducibles.
  - Datos aislados por caso de uso (no interfieren entre tests).
- **Nomenclatura:** prefijo `test_`. Formato preferido: dentro de los propios tests o en `test_fixtures.*`.
- **Requisito:** los datos viven en transacciones con rollback o en bases de datos efímeras.

## Tabla comparativa

| Aspecto | Producción | Desarrollo | Test |
|---|---|---|---|
| Datos ficticios | ❌ prohibido | ✅ realistas (Faker) | ✅ deterministas |
| Usuarios de prueba | ❌ | ✅ | ✅ |
| Idempotente | ✅ | ✅ | ✅ |
| Persistencia | permanente | reseteable | efímera/rollback |
| Prefijo de archivo | `prod_` / migración | `dev_` | `test_` |

## Responsabilidad del agente
Cada nueva entidad, caso de uso o migración **debe incluir los seeds de desarrollo y test correspondientes**. La checklist [`../Checklists/New_Entity.md`](../Checklists/New_Entity.md) verifica este punto. **No se aprueba un PR sin seeds actualizados.**

## Ejemplo: seed de desarrollo (TypeScript + Faker)

```ts
// src/payments/infrastructure/seeds/dev_payments.ts
// Tipo: desarrollo | Módulo: Pagos
// Ejecutar: npm run db:seed:dev
import { faker } from '@faker-js/faker';

export async function seedDevPayments(db) {
  await db.payments.deleteAll(); // idempotencia: limpiar antes
  for (let i = 0; i < 50; i++) {
    await db.payments.insert({
      id: faker.string.uuid(),
      userId: faker.helpers.arrayElement(devUserIds),
      amount: faker.number.int({ min: 100, max: 50000 }),
      currency: 'EUR',
      status: faker.helpers.arrayElement(['pending', 'completed', 'refunded']),
      createdAt: faker.date.recent(),
    });
  }
}
```

## Ejemplo: fixture de test (determinista)

```ts
// src/payments/__tests__/test_payments.ts
// Tipo: test | datos fijos y reproducibles
export const testPayments = [
  { id: 'pay_0001', userId: 'usr_test_01', amount: 1000, currency: 'EUR', status: 'completed' },
  { id: 'pay_0002', userId: 'usr_test_01', amount: 2500, currency: 'EUR', status: 'pending' },
];
```

## Comandos de ejecución
Deben documentarse en [`../08_DevOps/Environments.md`](../08_DevOps/Environments.md) y en el `Makefile`/`package.json` del proyecto. Ejemplo:

```json
{
  "scripts": {
    "db:seed:prod": "node ./tools/seed.js --env production",
    "db:seed:dev":  "node ./tools/seed.js --env development",
    "db:seed:test": "node ./tools/seed.js --env test"
  }
}
```

## Relacionado
- [`Naming.md`](Naming.md), [`Migrations.md`](Migrations.md)
- Plantilla: [`../Templates/Seed_Template.sql`](../Templates/Seed_Template.sql)
