---
obligation: mandatory
area: backend
applies_to: all projects
---

# Validación de Entrada

## Propósito
Que ningún dato no confiable entre al sistema sin ser validado. La validación protege la integridad del dominio y es la primera línea de defensa de seguridad.

## Principios (Mandatory)
1. **Valida en el borde.** Toda entrada externa (HTTP, mensajes, archivos, CLI) se valida antes de tocar la lógica de negocio.
2. **Lista blanca, no lista negra.** Define lo permitido y rechaza el resto.
3. **Valida tipo, forma y reglas de negocio.** No basta con que sea un string; debe ser un email válido y, además, no estar ya registrado.
4. **Confía solo en validación del servidor.** La del cliente es UX, no seguridad.
5. **Falla con un error claro.** Devuelve `422`/`400` con detalles por campo (ver [`Error_Handling.md`](Error_Handling.md)).

## Dos niveles de validación

| Nivel | Responsable | Qué valida | Ejemplo |
|---|---|---|---|
| **Sintáctica / forma** | capa de presentación (DTO/schema) | tipos, formato, requeridos, rangos | `amount` es entero > 0 |
| **Semántica / negocio** | capa de dominio/aplicación | invariantes y estado | el usuario tiene saldo, el pago no está ya reembolsado |

La validación de forma se hace pronto; la de negocio vive en el dominio y **no se puede saltar**.

## Ejemplo: schema de entrada (Zod)

```ts
import { z } from 'zod';

export const CreatePaymentSchema = z.object({
  userId: z.string().uuid(),
  amount: z.number().int().positive(),           // céntimos, > 0
  currency: z.enum(['EUR', 'USD']),
  idempotencyKey: z.string().min(8).optional(),
});

export type CreatePaymentDto = z.infer<typeof CreatePaymentSchema>;
```

```ts
// En el controlador (borde)
const parsed = CreatePaymentSchema.safeParse(req.body);
if (!parsed.success) {
  throw new ValidationError('Datos inválidos', parsed.error.issues);
}
await createPayment.execute(parsed.data);
```

## Validación de negocio en el dominio

```ts
class Payment {
  static create(props: CreatePaymentProps): Payment {
    if (props.amount <= 0) throw new PaymentAmountInvalidError();
    // ...invariantes del dominio
  }
}
```

## La validación de UI no sustituye a la del servidor

El framework exige que **todo control de UI valide su tipo de dato** (ver
[`../02_UI_UX/Design_System.md`](../02_UI_UX/Design_System.md): un campo numérico no acepta
letras, etc.). Eso es **UX y prevención de errores**, **no seguridad**. Reafirma el principio 4:
*confía solo en la validación del servidor*. Que un control filtre por tipo en el cliente **no
exime** de validar forma y reglas de negocio en el borde y el dominio del backend: el cliente
es manipulable y la entrada puede llegar por otros caminos (API directa, scripts, integraciones).

## Reglas adicionales
- **Normaliza** tras validar (trim, lowercase de emails) de forma consistente.
- **Límites de tamaño:** longitud máxima de strings, tamaño máximo de payload y de archivos.
- **Sanitiza** lo que se va a renderizar/almacenar para prevenir inyección (ver [`Security.md`](Security.md)).
- **Nunca** confíes en campos como `role`, `isAdmin`, `price` viniendo del cliente para decisiones de autorización o cobro.

## Anti-patrones
- ❌ Validar solo en el frontend.
- ❌ Pasar `req.body` directo al ORM o al dominio.
- ❌ Lista negra de "palabras malas" en vez de lista blanca.
- ❌ Mensajes de error genéricos que no dicen qué campo falló.
- ❌ Tomar el precio/rol desde el cliente.

## Relacionado
- [`Error_Handling.md`](Error_Handling.md), [`Security.md`](Security.md), [`API_Design.md`](API_Design.md)
