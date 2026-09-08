---
obligation: guideline
area: frontend
applies_to: all projects
---

# Gestión de Estado

## Propósito
Evitar el caos de estado: que cada dato viva en el lugar correcto, con la herramienta adecuada, y que el flujo sea predecible.

## Clasifica el estado antes de elegir herramienta

| Tipo de estado | Ejemplos | Dónde vive |
|---|---|---|
| **Local de UI** | input controlado, toggle, tab activa | `useState`/`useReducer` en el componente |
| **Compartido cercano** | estado de un formulario multistep | contexto local / lifting state |
| **Servidor (remoto)** | listas, detalles, datos de la API | librería de *server state* (React Query/SWR) |
| **Global de cliente** | sesión, tema, preferencias | store global ligero (Zustand/Redux/Context) |
| **URL** | filtros, paginación, pestaña | query params / router |

> Regla práctica: **la mayoría del "estado" es estado de servidor.** No lo metas en un store global manualmente; usa una librería de server state con caché e invalidación.

## Principios
1. **Una sola fuente de verdad** por dato. Nada de copias desincronizadas.
2. **Eleva el estado lo justo**, no más. Estado local por defecto.
3. **El estado de servidor no es estado de cliente.** Caché, revalidación e invalidación con herramienta dedicada.
4. **El estado derivado se calcula**, no se almacena.
5. **Inmutabilidad** en las actualizaciones.

## Ejemplo: server state con React Query

```tsx
// Lectura con caché + estados de carga/error gestionados
const { data, isLoading, error } = useQuery({
  queryKey: ['payments', userId],
  queryFn: () => paymentsClient.list(userId),
});

// Mutación + invalidación de la caché
const mutation = useMutation({
  mutationFn: createPayment,
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ['payments', userId] }),
});
```

## Ejemplo: estado global de cliente (Zustand)

```ts
export const useSession = create((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  logout: () => set({ user: null }),
}));
```

## Retorno de una pantalla invocada (Mandatory)

Cuando una pantalla es **invocada desde otra** y devuelve datos (ver
[`Component_Architecture.md`](Component_Architecture.md)), el contexto llamante **no copia el
dato a mano**: **invalida/revalida** el estado de servidor afectado para reflejar el cambio. Es
regla dura (`Mandatory`) aunque este documento sea `guideline`, porque copiar a mano produce
fuentes de verdad desincronizadas.

```tsx
// Al volver de "alta de cliente", revalidar la lista en vez de empujar el dato a mano.
const created = await navigateTo('/customers/new', { returnResult: true });
if (created) {
  queryClient.invalidateQueries({ queryKey: ['customers'] }); // datos frescos del servidor
}
```

Conecta con la fila **"Servidor (remoto)"** de la tabla anterior y con el ejemplo de
`invalidateQueries`: el dato vive en el servidor; el retorno solo dispara su revalidación.

## Reglas para el agente
- Antes de añadir estado global, pregúntate si **realmente** es global o es server state.
- No dupliques datos del servidor en un store manual.
- Deriva (`useMemo`/selectores) en lugar de almacenar lo calculable.
- Sincroniza filtros/paginación con la URL cuando deban ser compartibles/bookmarkeables.
- **(Mandatory)** Al retornar de una pantalla invocada, **revalida** el estado de servidor; no copies el dato a mano.

## Anti-patrones
- ❌ Meter respuestas de la API en Redux a mano y sincronizar a mano.
- ❌ Estado global para algo que solo usa un componente.
- ❌ Estado derivado guardado y que se desincroniza.
- ❌ Múltiples fuentes de verdad del mismo dato.
- ❌ Mutar el estado directamente.

## Relacionado
- [`Component_Architecture.md`](Component_Architecture.md), [`Performance.md`](Performance.md)
