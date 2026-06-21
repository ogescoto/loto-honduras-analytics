---
template: true
area: documentation
---

# Plantilla: Manual de Usuario

> Estructura base para `docs/manual/`. Las páginas de procesos se generan/actualizan desde los E2E anotados con `@manual-step` (ver [`../07_Documentation/User_Manual_Standard.md`](../07_Documentation/User_Manual_Standard.md)).

## `index.md` — Introducción

```markdown
# Manual de Usuario de [Nombre del Producto]

Bienvenido. Esta guía explica cómo usar [Producto] paso a paso.

## ¿Qué puedes hacer?
- Gestionar tu cuenta
- Realizar pagos
- ...

## Cómo está organizado este manual
- **Roles:** qué puede hacer cada tipo de usuario.
- **Procesos:** guías paso a paso de cada tarea.
```

## `roles.md` — Roles de usuario

```markdown
# Roles de usuario

| Rol | Puede... |
|---|---|
| Cliente | Ver y realizar pagos, gestionar sus métodos de pago |
| Administrador | Gestionar usuarios, ver reportes |
```

## `procesos/<proceso>.md` — Plantilla de proceso

```markdown
# [Nombre del proceso] (p. ej. Realizar un pago)

## Descripción
Qué consigue el usuario con este proceso.

## Precondiciones
- Tener una cuenta activa.
- Tener un método de pago configurado.

## Pasos
1. **Inicia sesión** con tus credenciales.
   ![Pantalla de inicio de sesión](../assets/login.png)
2. **Ve a la sección de pagos** y pulsa "Nuevo pago".
   ![Sección de pagos](../assets/payments.png)
3. **Introduce el importe** y confirma.
   ![Formulario de pago](../assets/payment-form.png)

## Resultado esperado
Verás el mensaje "Pago completado" y el pago aparecerá en tu historial.
![Confirmación](../assets/payment-success.png)

## Vídeo
[Ver vídeo del proceso](../assets/payment-flow.mp4)
```

## Notas de generación
- El manual lo mantiene el **Experto Obsidian** (`/obsidian`) a partir de los E2E anotados. Las capturas en `assets/` son **opcionales** (mejora automatizable con el script de referencia `../Tools/generate_manual.py`).
- Mantén los textos en **español**, orientados al usuario final, sin jerga técnica.
