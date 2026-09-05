---
template: false
area: documentation
---

# Ejemplo de Bóveda Obsidian de un Proyecto

Ejemplo concreto de cómo queda la carpeta `docs/` de un proyecto que usa el framework. Estándar: [`../gobernanza/Obsidian_Vault_Standard.md`](../gobernanza/Obsidian_Vault_Standard.md).

```
docs/
├── .obsidian/                  ← marca docs/ como bóveda
├── 00_MAPA_DE_CONTENIDOS.md
├── 00_Proyecto/
│   ├── VISION.md
│   ├── ALCANCE.md
│   └── CONTEXTO_GLOBAL.md
├── 01_Dominio/
│   ├── Glosario.md
│   ├── Entidades.md
│   └── Casos_de_Uso.md
├── 02_Arquitectura/
│   ├── C4_Contexto.md
│   ├── Dependencias.md
│   ├── API.md
│   ├── openapi.yaml
│   └── adr/
│       ├── 0001-adopcion-framework.md
│       └── 0003-stripe-checkout.md
├── 03_Tecnico/
│   ├── Stack.md
│   ├── Patrones.md
│   ├── Global_Utilities.md
│   └── Mapa_Conceptos_Codigo.md   ← conceptos/componentes/flujos → archivos
├── 04_Modulos/
│   ├── Usuarios.md
│   ├── Pagos.md
│   └── Notificaciones.md
├── 05_Procesos/
│   ├── Flujo_Registro.md
│   └── Flujo_Pago.md
├── 06_UX_UI/
│   ├── Mapa_Navegacion.md
│   └── Design.md
├── 07_Implementacion/          ← ZONA DE ESCRITURA COMPARTIDA
│   └── ACTIVIDAD.md            ← tabla META | TAREA | ESTADO | FECHA_INI | FECHA_FIN
└── manual/
    ├── index.md
    ├── roles.md
    ├── procesos/
    │   ├── login.md
    │   └── pago.md
    └── assets/
        ├── login.png
        └── payment-success.png
```

## Ejemplo de `00_MAPA_DE_CONTENIDOS.md`

```markdown
# Mapa de Contenidos

## Dominio
- [[01_Dominio/Glosario|Glosario]]
- [[01_Dominio/Entidades|Entidades]]
- [[01_Dominio/Casos_de_Uso|Casos de Uso]]

## Arquitectura
- [[02_Arquitectura/C4_Contexto|Diagrama de Contexto]]
- [[02_Arquitectura/Dependencias|Dependencias]]
- [[02_Arquitectura/API|API]]

## Técnico
- [[03_Tecnico/Mapa_Conceptos_Codigo|Mapa Conceptos ↔ Código]]

## Módulos
- [[04_Modulos/Usuarios|Usuarios]]
- [[04_Modulos/Pagos|Pagos]]
- [[04_Modulos/Notificaciones|Notificaciones]]

## Procesos
- [[05_Procesos/Flujo_Registro|Flujo de Registro]]
- [[05_Procesos/Flujo_Pago|Flujo de Pago]]
```

## Ejemplo de nota de módulo (`04_Modulos/Pagos.md`)
Generada a partir de [`../Templates/Obsidian_Note_Template.md`](../Templates/Obsidian_Note_Template.md). Ver esa plantilla para el contenido completo.
