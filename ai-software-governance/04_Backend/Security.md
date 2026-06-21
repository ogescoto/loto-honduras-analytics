---
obligation: mandatory
area: backend
applies_to: all projects
---

# Seguridad Backend

## Propósito
Establecer el mínimo de seguridad innegociable para cualquier servicio. La seguridad no es una fase final: es una restricción permanente del diseño.

> Esta política es `mandatory`. Un agente que detecte que su tarea requiere romper una de estas reglas debe **detenerse y pedir aprobación**.

## 1. Autenticación
- Toda ruta no pública exige autenticación.
- Usa estándares probados (OAuth2/OIDC, JWT firmados, sesiones seguras). No inventes criptografía.
- Tokens con expiración corta + refresh. Revocación posible.
- Contraseñas: hash con `bcrypt`/`argon2` y sal. **Nunca** en texto plano ni cifrado reversible.

## 2. Autorización
- Verifica permisos **por recurso**, no solo "está logueado".
- Aplica el **principio de menor privilegio**.
- Comprueba ownership: que el usuario X solo acceda a *sus* recursos (evita IDOR).
- Las decisiones de autorización ocurren en el servidor, nunca confiando en flags del cliente.

## 3. Validación y saneamiento
- Toda entrada se valida (ver [`Validation.md`](Validation.md)).
- Previene inyección:
  - **SQL:** consultas parametrizadas / ORM. Nunca concatenar entrada en SQL.
  - **XSS:** escapar/sanitizar salida; CSP.
  - **Command injection:** no construir comandos de shell con entrada.
  - **Path traversal:** validar rutas de archivo.

## 4. Gestión de secretos
- **Ningún secreto en el código ni en el repositorio.** Ver [`../08_DevOps/Secrets_Management.md`](../08_DevOps/Secrets_Management.md).
- Secretos vía variables de entorno o gestor de secretos.
- Rotación posible; nada de credenciales por defecto en producción.

## 5. Transporte y datos
- **HTTPS/TLS** obligatorio en tránsito.
- Datos sensibles cifrados en reposo cuando aplique.
- Cabeceras de seguridad: `HSTS`, `X-Content-Type-Options`, `X-Frame-Options`, `Content-Security-Policy`.
- CORS restrictivo (lista blanca de orígenes).

## 6. Límites y abuso
- **Rate limiting** en endpoints sensibles (login, pagos, password reset).
- Protección contra fuerza bruta (lockout/backoff).
- Límites de tamaño de payload y de subida de archivos.

## 7. Logging y privacidad
- **Nunca loguear** contraseñas, tokens, tarjetas, PII innecesaria.
- Logs con `trace_id`, sin datos sensibles.
- Cumplir la normativa aplicable (GDPR/LOPD): minimización, derecho al olvido, consentimiento.

## 8. Dependencias
- Auditar dependencias (`npm audit`, `pip-audit`, Dependabot).
- No introducir paquetes sin verificar mantenimiento y reputación.
- Fijar versiones; revisar cambios de dependencias críticas.

## Checklist de seguridad mínima (por PR sensible)
- [ ] Endpoints nuevos autenticados y autorizados.
- [ ] Entrada validada y saneada.
- [ ] Sin secretos en el código.
- [ ] Consultas parametrizadas.
- [ ] Sin PII/secretos en logs.
- [ ] Rate limiting donde corresponde.
- [ ] Dependencias nuevas auditadas.

## Referencia
- OWASP Top 10 y OWASP ASVS como base de revisión.

## Anti-patrones
- ❌ Confiar en `isAdmin` enviado por el cliente.
- ❌ Concatenar entrada en SQL/comandos.
- ❌ Guardar secretos en el repo o en variables hardcodeadas.
- ❌ Loguear tokens o contraseñas.
- ❌ Implementar tu propio algoritmo criptográfico.

## Relacionado
- [`Validation.md`](Validation.md), [`Error_Handling.md`](Error_Handling.md), [`../08_DevOps/Secrets_Management.md`](../08_DevOps/Secrets_Management.md), [`../09_AI/Forbidden_Actions.md`](../09_AI/Forbidden_Actions.md)
