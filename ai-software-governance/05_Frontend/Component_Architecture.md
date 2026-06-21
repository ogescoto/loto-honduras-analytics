---
obligation: standard
area: frontend
applies_to: all projects
---

# Arquitectura de Componentes

## Propósito
Que la capa de presentación sea modular, testeable y mantenible, con una separación clara entre lógica y vista.

## Principios
1. **Componentes pequeños y con una sola responsabilidad.** Si un componente hace demasiado, divídelo.
2. **Separa presentación de lógica.** Componentes "tontos" (presentacionales) reciben props y emiten eventos; la lógica vive en hooks/contenedores/servicios.
3. **Composición sobre herencia.** Construye interfaces componiendo piezas pequeñas.
4. **Props explícitas y tipadas.** Nada de `any`; contratos claros.
5. **Reutiliza el Design System.** Ver [`../02_UI_UX/Design_System.md`](../02_UI_UX/Design_System.md). No reinventes componentes base.

## Tipos de componente

| Tipo | Responsabilidad | Conoce el estado global / red |
|---|---|---|
| Presentacional / UI | Renderizar a partir de props | No |
| Contenedor / feature | Orquestar datos y lógica | Sí |
| Layout | Estructura de página | No |
| Página / ruta | Punto de entrada de una ruta | Sí |

## Estructura de carpetas (ejemplo, feature-based)

```
src/features/payments/
├── components/            # UI específicos de la feature
│   ├── PaymentList.tsx        (presentacional)
│   └── PaymentRow.tsx
├── containers/
│   └── PaymentsPage.tsx       (contenedor: usa hooks + UI)
├── hooks/
│   └── usePayments.ts         (lógica de datos)
├── api/
│   └── payments.client.ts     (acceso a la API)
└── types.ts
```

Componentes verdaderamente compartidos viven en `src/components/ui/` (Design System).

## Ejemplo: separación lógica/vista

```tsx
// hooks/usePayments.ts  — lógica
export function usePayments(userId: string) {
  const { data, error, isLoading } = useQuery(['payments', userId], () =>
    paymentsClient.list(userId),
  );
  return { payments: data ?? [], error, isLoading };
}

// containers/PaymentsPage.tsx — contenedor
export function PaymentsPage({ userId }: { userId: string }) {
  const { payments, error, isLoading } = usePayments(userId);
  if (isLoading) return <Skeleton />;
  if (error) return <ErrorState onRetry={...} />;
  if (payments.length === 0) return <EmptyState />;
  return <PaymentList items={payments} />;   // componente presentacional puro
}

// components/PaymentList.tsx — presentacional
export function PaymentList({ items }: { items: Payment[] }) {
  return <ul>{items.map(p => <PaymentRow key={p.id} payment={p} />)}</ul>;
}
```

## Pantalla invocable con retorno de datos (Mandatory)

Una pantalla debe poder ser **invocada desde otra** y, al cerrarse, **devolver el resultado al
contexto llamante**, que se **refresca con los datos actualizados**. Ejemplo típico: un selector
de cliente que abre la página de "alta de cliente"; al guardar, el llamante recibe el nuevo
cliente y lo muestra ya seleccionado, sin recargar todo a mano.

El contrato es **agnóstico de la herramienta**; se materializa con alguno de estos mecanismos:
- **Parámetro/estado de navegación de retorno** (la página llamada devuelve un valor al volver).
- **Callback** entregado por el llamante (`onResult(entity)`).
- **Invalidación de caché** del estado de servidor del llamante (ver
  [`State_Management.md`](State_Management.md)) para revalidar y reflejar el cambio.

```tsx
// Llamante: abre la pantalla de alta y reacciona al resultado.
async function pickOrCreateCustomer() {
  const created = await navigateTo('/customers/new', { returnResult: true });
  if (created) {
    setCustomerId(created.id);                       // contexto actualizado
    queryClient.invalidateQueries({ queryKey: ['customers'] }); // datos frescos
  }
}
```

> Regla dura: el llamante **no copia el dato a mano** ni asume estados obsoletos; revalida el
> estado de servidor. La sincronización vive en [`State_Management.md`](State_Management.md).

## Anti-doble-click en acciones (Mandatory)

Todo control que dispare un proceso se **bloquea mientras procesa**. Patrón estándar: reutilizar
el componente `Button` con `loading` del Design System (ver
[`../02_UI_UX/Design_System.md`](../02_UI_UX/Design_System.md)) + una **guardia de reentrada** en
el handler. La regla de UX que lo motiva está en
[`../02_UI_UX/Design_Principles.md`](../02_UI_UX/Design_Principles.md).

```tsx
function SaveButton({ onSave }: { onSave: () => Promise<void> }) {
  const [busy, setBusy] = useState(false);
  async function handle() {
    if (busy) return;            // guardia de reentrada: ignora clicks repetidos
    setBusy(true);
    try { await onSave(); }
    finally { setBusy(false); }
  }
  return <Button loading={busy} onClick={handle}>Guardar cambios</Button>;
}
```

## Reglas
- **Todo componente contempla los 5 estados** (carga, vacío, error, éxito, parcial) cuando aplica (ver [`../02_UI_UX/Design_Principles.md`](../02_UI_UX/Design_Principles.md)).
- Sin lógica de negocio en componentes de UI.
- Sin llamadas a la API directamente en componentes presentacionales.
- Nombres de componentes en `PascalCase`; uno por archivo.
- Efectos secundarios aislados en hooks, no esparcidos.
- **(Mandatory)** Toda página es invocable desde otra y retorna sus datos al contexto llamante.
- **(Mandatory)** Toda acción que procesa bloquea reentradas (no doble click).

## Anti-patrones
- ❌ Componentes "god" de 800 líneas.
- ❌ `fetch` dentro de un componente presentacional.
- ❌ Lógica de negocio en el render.
- ❌ Prop drilling profundo (usa contexto o composición).
- ❌ Duplicar componentes base del Design System.
- ❌ Pantalla que no puede invocarse desde otra ni devolver su resultado al llamante.
- ❌ Llamante que tras crear/editar copia el dato a mano en vez de revalidar el estado de servidor.
- ❌ Handler de acción sin guardia de reentrada (permite doble click/doble envío).

## Relacionado
- [`State_Management.md`](State_Management.md), [`Performance.md`](Performance.md), [`../02_UI_UX/Design_System.md`](../02_UI_UX/Design_System.md)
