---
obligation: mandatory
area: testing
applies_to: all projects
---

# Estrategia de Testing

## Propósito
Que cada cambio venga con la red de seguridad adecuada. Los tests no son opcionales: son parte del Definition of Done.

## La pirámide de tests

```
            ╱╲
           ╱E2E╲          pocos, lentos, de alto valor (flujos críticos)
          ╱──────╲
         ╱ Integr. ╲      moderados (módulo + BD/servicios reales o dobles)
        ╱────────────╲
       ╱   Unitarios   ╲  muchos, rápidos (lógica de dominio pura)
      ╱──────────────────╲
```

| Nivel | Qué prueba | Velocidad | Cantidad |
|---|---|---|---|
| **Unitario** | Lógica pura (dominio, casos de uso con dobles) | Muy rápida | Muchos |
| **Integración** | Módulo con BD/servicios reales o contenedores | Media | Moderados |
| **E2E** | Flujo completo desde la UI/API | Lenta | Pocos, los críticos |

> Evita el anti-patrón del "cono de helado" (muchos E2E, pocos unitarios): frágil y lento.

## Reglas (Mandatory)
1. **Toda nueva lógica de negocio lleva tests unitarios.**
2. **Todo nuevo caso de uso lleva, al menos, un test de integración.**
3. **Todo flujo de usuario crítico lleva un test E2E** (y se anota para el manual, ver [`E2E_Standards.md`](E2E_Standards.md)).
4. **Ningún PR se mergea con tests en rojo.**
5. **Los tests usan los seeds de test** (ver [`../03_Database/Seeds_Strategy.md`](../03_Database/Seeds_Strategy.md)), aislados y deterministas.

## Buenas prácticas
- **Patrón AAA:** Arrange, Act, Assert.
- **Un concepto por test.** Nombres que describen el escenario y el resultado esperado.
- **Deterministas:** sin dependencias de hora real, orden o red no controlada. Usa relojes falsos y dobles.
- **Independientes:** el orden no importa; cada test limpia tras de sí (rollback/efímero).
- **Prueba comportamiento, no implementación.** Resiste refactors.

## Ejemplo: test unitario (dominio)

```ts
describe('Payment.create', () => {
  it('rechaza importes no positivos', () => {
    expect(() => Payment.create({ amount: 0, currency: 'EUR', userId: 'u1' }))
      .toThrow(PaymentAmountInvalidError);
  });

  it('crea un pago pendiente con importe válido', () => {
    const payment = Payment.create({ amount: 1000, currency: 'EUR', userId: 'u1' });
    expect(payment.status).toBe('pending');
    expect(payment.amount).toBe(1000);
  });
});
```

## Ejemplo: test de integración (caso de uso + BD)

```ts
describe('CreatePaymentUseCase (integración)', () => {
  beforeEach(async () => { await loadTestSeeds(); });   // datos deterministas
  afterEach(async () => { await rollback(); });          // aislamiento

  it('persiste el pago y emite PaymentCreatedEvent', async () => {
    const result = await createPayment.execute({ userId: 'usr_test_01', amount: 1000, currency: 'EUR' });
    const stored = await paymentRepo.findById(result.id);
    expect(stored).not.toBeNull();
    expect(events).toContainEqual(expect.objectContaining({ type: 'PaymentCreated' }));
  });
});
```

## Dobles de prueba
- **Stub/Fake** para dependencias externas (gateway de pago en modo test).
- **Mock** solo para verificar interacciones cuando importan.
- No mockees lo que puedes probar de verdad de forma barata.

## Relación con seeds y manual
- Tests usan `seed:test`.
- E2E de flujos clave se anotan con `@manual-step` para el manual de usuario (ver [`../07_Documentation/User_Manual_Standard.md`](../07_Documentation/User_Manual_Standard.md)).

## Anti-patrones
- ❌ Tests que dependen del orden de ejecución.
- ❌ Tests que tocan la BD de desarrollo/producción.
- ❌ Mockear absolutamente todo (no prueba nada real).
- ❌ Tests acoplados a la implementación interna.
- ❌ Mergear con tests rojos o "skipped" sin justificación.

## Relacionado
- [`E2E_Standards.md`](E2E_Standards.md), [`Coverage_Requirements.md`](Coverage_Requirements.md)
