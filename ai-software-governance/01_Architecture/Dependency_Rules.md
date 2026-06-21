---
obligation: mandatory
area: architecture
applies_to: all projects
---

# Reglas de Dependencias

## Propósito
Evitar el "big ball of mud": un sistema donde todo depende de todo y nada se puede cambiar sin miedo. Las dependencias se declaran, se dirigen y se limitan.

## Regla de oro: la dependencia apunta hacia el dominio

```
presentation → application → domain ← infrastructure
```

- `domain` **no depende de nada** externo (ni frameworks, ni BD, ni HTTP).
- `application` depende solo de `domain`.
- `infrastructure` depende de `domain` (implementa sus interfaces/puertos).
- `presentation` depende de `application`.

Esto es la **Regla de Dependencia** de la arquitectura limpia: las dependencias de código fuente apuntan siempre hacia las políticas de más alto nivel (el dominio).

## Dependencias entre módulos

1. **Explícitas:** toda dependencia de un módulo hacia otro se declara en su `MODULE.yaml`.
2. **Unidireccionales:** si A depende de B, B no debe depender de A. **Prohibidas las dependencias circulares.**
3. **A través de la API pública:** un módulo solo importa la API pública de otro, nunca su interior.
4. **Comunicación desacoplada cuando se pueda:** preferir eventos de dominio sobre llamadas directas para reducir acoplamiento.

### Diagrama de ejemplo (válido)

```
   ┌──────────────┐      ┌──────────────────┐
   │   payments   │────▶ │   notifications  │
   └──────┬───────┘      └──────────────────┘
          │
          ▼
   ┌──────────────┐
   │    users     │
   └──────────────┘
          │
          ▼
   ┌──────────────┐
   │ global-utils │   (capa transversal permitida para todos)
   └──────────────┘
```

### Diagrama inválido (circular) — PROHIBIDO

```
   payments ──▶ users
       ▲           │
       └───────────┘   ❌ ciclo
```

## Capas transversales permitidas
- `global-utils` puede ser usada por cualquier módulo (ver [`Global_Utilities.md`](Global_Utilities.md)).
- El dominio compartido (`shared-kernel`), si existe, es de solo lectura para los módulos.

## Servicios externos
- Se acceden siempre desde `infrastructure`, nunca desde `domain` o `application` directamente.
- Se declaran en `MODULE.yaml` bajo `external_services`.
- Se aíslan tras una interfaz del dominio (puerto), para poder testear con dobles.

## Cómo verificar
- Documentar el grafo de dependencias en `docs/02_Arquitectura/Dependencias.md`.
- Recomendado: herramienta de análisis estático en CI que falle ante ciclos (p. ej. `dependency-cruiser`, `import-linter`, `ArchUnit` según stack).

## Qué hacer si necesitas una dependencia "prohibida"
1. Pregúntate si la lógica está en la capa correcta.
2. Considera invertir la dependencia con una interfaz (puerto) en el dominio.
3. Considera comunicar vía evento en vez de llamada directa.
4. Si aun así es necesario un cambio estructural, abre un ADR ([`../07_Documentation/ADR.md`](../07_Documentation/ADR.md)).

## Anti-patrones
- ❌ `domain` importando un cliente de base de datos.
- ❌ Importar `../otro-modulo/infrastructure/...` desde fuera.
- ❌ Dependencias circulares entre módulos o entre capas.
- ❌ Servicios externos llamados desde la capa de presentación.
