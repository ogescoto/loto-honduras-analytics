# Guía de Publicidad — AdSense y alternativas

## Cómo funciona en el proyecto

El componente `AdBanner.astro` maneja todos los anuncios. Solo se renderiza si tienes configurado un Publisher ID activo — sin él, el espacio simplemente no aparece (sin layout shift).

## Configurar tu Publisher ID

Agrega en `.env` (desarrollo) y en Cloudflare Pages Dashboard (producción):

```env
PUBLIC_ADSENSE_ID=ca-pub-XXXXXXXXXXXXXXXX   # tu Publisher ID de Google AdSense
PUBLIC_ADSENSE_SLOT_1=1234567890            # ID de slot para el banner entre secciones
PUBLIC_ADSENSE_SLOT_2=0987654321            # ID de slot para el banner inferior
```

> **Importante:** estas variables deben empezar con `PUBLIC_` para que Astro las exponga en el cliente.

## Dónde están los espacios de anuncios

| Página | Posición | Variable de slot |
|---|---|---|
| `/` (Dashboard) | Entre sección "Calientes/Fríos" y "Rachas Inversas" | `PUBLIC_ADSENSE_SLOT_1` |
| `/` (Dashboard) | Debajo de la sección "Par/Impar" | `PUBLIC_ADSENSE_SLOT_2` |
| `/history` (Historial) | Al final de la lista de sorteos | `PUBLIC_ADSENSE_SLOT_1` |

## Agregar un nuevo espacio de anuncio

En cualquier página `.astro`, importa el componente y colócalo donde quieras:

```astro
---
import AdBanner from "../components/AdBanner.astro";
const adSlot = import.meta.env.PUBLIC_ADSENSE_SLOT_1 ?? "0000000001";
---

<!-- donde quieras el anuncio -->
<AdBanner slot={adSlot} />
```

**Props disponibles:**

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `slot` | `string` | requerido | ID del slot de AdSense |
| `format` | `"auto" \| "rectangle" \| "leaderboard"` | `"rectangle"` | Formato del anuncio |
| `showAds` | `boolean` | `true` | Forzar ocultar (ej. usuarios premium) |

**Ejemplo con formato leaderboard:**
```astro
<AdBanner slot={adSlot} format="leaderboard" />
```

**Ocultar anuncios para usuarios premium:**
```astro
<AdBanner slot={adSlot} showAds={!isPremium} />
```
El Shell ya pasa `isPremium` automáticamente — cuando el usuario tiene suscripción activa, el script de AdSense no se carga en el `<head>`.

## Notas de política de AdSense

- AdSense puede rechazar sitios con contenido de lotería/apuestas en algunas regiones. Si ocurre, las alternativas directas son:
  - **[Media.net](https://media.net)** — contextual ads, buen RPM en Latinoamérica
  - **[Ezoic](https://ezoic.com)** — optimización automática de anuncios
  - **[Publift](https://publift.com)** — requiere >50k visitas/mes

- Para cambiar de proveedor, solo modifica el script en `Shell.astro` (el `<script async src="...adsbygoogle...">`) y el `<ins>` en `AdBanner.astro`. El resto del sistema no cambia.

## Verificar que los anuncios están activos

Abre las DevTools del navegador y busca:
```
window.adsbygoogle  // debe ser un array
```
Si AdSense está cargado pero no muestra anuncios, puede ser porque:
1. La cuenta no está aprobada aún
2. El Publisher ID es incorrecto
3. Hay un bloqueador de anuncios activo en el navegador
