---
obligation: standard
area: testing
applies_to: all projects
---

# Estándares de Pruebas E2E

## Propósito
Definir cómo se escriben las pruebas de extremo a extremo, que verifican flujos completos **y** alimentan el manual de usuario automático.

## Herramienta por defecto
**Playwright** (recomendado). Para otros frameworks, adapta las convenciones manteniendo el espíritu.

## Qué se prueba en E2E
- Solo **flujos de usuario críticos** (login, alta, compra/pago, acciones de negocio principales).
- No se duplica en E2E lo ya cubierto en unitario/integración.

## Reglas
1. **Selección robusta de elementos:** usa `data-testid` o roles accesibles, no clases CSS ni texto frágil.
2. **Independencia:** cada test prepara su estado (vía seed de test o API) y no depende de otros.
3. **Datos deterministas:** usar `seed:test`; nada de depender de datos preexistentes aleatorios.
4. **Sin esperas fijas:** usa esperas por condición (auto-waiting), nunca `sleep(3000)`.
5. **Entorno controlado:** se ejecutan contra staging/efímero con seeds cargados.

## Anotaciones para el manual de usuario (`@manual-step`)
Cada paso relevante de cara al usuario se anota para que el **Experto Obsidian** (`/obsidian`) genere la página del manual (texto; captura opcional). Ver [`../07_Documentation/User_Manual_Standard.md`](../07_Documentation/User_Manual_Standard.md).

```ts
import { test, expect } from '@playwright/test';

test('El usuario completa un pago', async ({ page }) => {
  // @manual-step Inicia sesión con tus credenciales
  await page.goto('/login');
  await page.getByTestId('email').fill('test@ejemplo.com');
  await page.getByTestId('password').fill('Secreto123!');
  await page.getByRole('button', { name: 'Entrar' }).click();

  // @manual-step Ve a la sección de pagos y pulsa "Nuevo pago"
  await page.getByRole('link', { name: 'Pagos' }).click();
  await page.getByRole('button', { name: 'Nuevo pago' }).click();

  // @manual-step Introduce el importe y confirma
  await page.getByTestId('amount').fill('25.00');
  await page.getByRole('button', { name: 'Pagar' }).click();

  // @manual-step Verás la confirmación del pago
  await expect(page.getByText('Pago completado')).toBeVisible();
});
```

El generador del manual:
1. Ejecuta el test en staging.
2. Captura pantalla en cada `@manual-step`.
3. Ensambla la página Markdown del manual con el texto del paso + la captura.

## Convenciones de organización
```
e2e/
├── auth/login.spec.ts
├── payments/create-payment.spec.ts
└── fixtures/            # helpers, login programático, datos
```

## Estabilidad (anti-flakiness)
- Esperas por condición, no por tiempo.
- Aislar estado por test.
- Reintentos limitados solo para flakiness conocida e investigada, no para tapar bugs.
- Un test que falla intermitentemente se arregla o se cuarentena con ticket, no se ignora.

## Anti-patrones
- ❌ Seleccionar por clase CSS o por texto traducible frágil.
- ❌ `page.waitForTimeout(3000)`.
- ❌ Tests E2E que dependen de datos de producción.
- ❌ Cubrir casuística de detalle en E2E (eso es unitario).
- ❌ Olvidar las anotaciones `@manual-step` en flujos de cara al usuario.

## Relacionado
- [`Testing_Strategy.md`](Testing_Strategy.md), [`../07_Documentation/User_Manual_Standard.md`](../07_Documentation/User_Manual_Standard.md), [`../02_UI_UX/Accessibility.md`](../02_UI_UX/Accessibility.md)
