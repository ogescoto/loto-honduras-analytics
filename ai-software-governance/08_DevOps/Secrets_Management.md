---
obligation: mandatory
area: devops
applies_to: all projects
---

# Gestión de Secretos

## Propósito
Que ningún secreto (API key, contraseña, token, certificado) viva en el código ni en el repositorio, y que su manejo sea seguro y rotable.

> Política `mandatory`. Un agente **nunca** escribe un secreto real en el código, en un commit ni en un log.

## Reglas (Mandatory)

1. **Cero secretos en el repositorio.** Ni en el código, ni en archivos versionados, ni en el historial de Git.
2. **Secretos vía entorno o gestor.** Variables de entorno en local; gestor de secretos en entornos compartidos (Vault, AWS/GCP Secrets Manager, GitHub/Vercel/CI secrets).
3. **`.env` ignorado, `.env.example` versionado.** El ejemplo lista las variables con valores ficticios; el real nunca se sube.
4. **Rotación posible.** Los secretos deben poder rotarse sin reescribir código.
5. **Sin credenciales por defecto en producción.** Nada de `admin/admin`.
6. **No loguear secretos.** Ver [`../04_Backend/Security.md`](../04_Backend/Security.md).

## `.gitignore` mínimo

```gitignore
.env
.env.*
!.env.example
*.pem
*.key
secrets/
```

## Patrón de uso

```ts
// ✅ Correcto: leer del entorno, fallar si falta
const stripeKey = process.env.STRIPE_API_KEY;
if (!stripeKey) throw new Error('Falta STRIPE_API_KEY');

// ❌ Prohibido: secreto hardcodeado
const stripeKey = 'sk_live_51Hxxxx...';   // NUNCA
```

## Detección y prevención
- **Secret scanning** en CI (gitleaks, trufflehog, escáner del proveedor) — gate obligatorio.
- **Pre-commit hook** opcional para detectar secretos antes del commit.
- Si se filtra un secreto: **rotarlo de inmediato** (no basta con borrar el commit; ya está comprometido) y registrar el incidente.

## Por entorno

| Entorno | Dónde viven los secretos |
|---|---|
| local | `.env` (no versionado) |
| CI / test | secretos del runner de CI |
| staging / production | gestor de secretos del proveedor |

## Qué hacer ante un secreto filtrado
1. **Rotar** el secreto comprometido inmediatamente.
2. Revocar el antiguo.
3. Purgar del historial si procede (sabiendo que ya debe considerarse comprometido).
4. Investigar alcance y registrar el incidente.

## Reglas para el agente
- Si tu tarea necesita un secreto, usa una **variable de entorno** y documenta su nombre en `.env.example`.
- Si detectas un secreto hardcodeado en el código, **detente y avísalo**; no lo dejes pasar.
- Nunca incluyas secretos en mensajes, PRs, logs o documentación.

## Anti-patrones
- ❌ Claves API en el código o en comentarios.
- ❌ Subir `.env` real al repo.
- ❌ Credenciales por defecto en producción.
- ❌ "Lo quito del próximo commit" tras filtrar un secreto (ya está comprometido: rotar).
- ❌ Loguear tokens para depurar.

## Relacionado
- [`../04_Backend/Security.md`](../04_Backend/Security.md), [`Environments.md`](Environments.md), [`CI_CD.md`](CI_CD.md), [`../09_AI/Forbidden_Actions.md`](../09_AI/Forbidden_Actions.md)
