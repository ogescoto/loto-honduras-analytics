# Manual Técnico — Loto Honduras Analytics

Documentación técnica de uso y operación del sistema.

## Contenido

| Archivo | Descripción |
|---|---|
| [API_Reference.md](./API_Reference.md) | Endpoints disponibles, parámetros y ejemplos |
| [Publicidad_AdSense.md](./Publicidad_AdSense.md) | Cómo configurar y ubicar anuncios en el sitio |
| [Entorno_Desarrollo.md](./Entorno_Desarrollo.md) | Levantar el entorno local paso a paso |

## Inicio rápido

```powershell
# 1. Instalar dependencias
pnpm install

# 2. Levantar base de datos (Docker)
pnpm up

# 3. Cargar datos históricos y calcular patrones
pnpm seed:dev

# 4. Iniciar todos los servicios
pnpm dev
# → Backend:  http://localhost:8787
# → Frontend: http://localhost:4321
```
