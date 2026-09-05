Parte 1: Arquitectura Técnica y Buenas Prácticas (Astro + Cloudflare)
El mayor peligro al meter anuncios en una plataforma serverless es el abuso de peticiones (Requests) y la latencia. Si optimizas mal, los scripts de anuncios destruirán el rendimiento (Core Web Vitals) de tu frontend y agotarán tus 100,000 peticiones diarias gratuitas en el Worker.

1. El Enfoque Tecnológico por Tipo de Anuncio
A. Redes de Anuncios Programáticos (Google AdSense, Setup con Scripts Externos)
Estas redes inyectan un script pesado en el navegador del usuario que realiza subastas en tiempo real (RTB).

Regla de Oro: Jamás hagas proxy o fetch a estos scripts desde tu backend (Worker). Deben ser manejados 100% por el cliente.

Práctica Correcta en Astro: Usa la directiva is:inline o cárgalos de forma asíncrona para que no bloqueen el renderizado inicial del HTML generado por SSR.

Fragmento de código
---
// src/components/AdSenseBanner.astro
interface Props {
  slotId: string;
}
const { slotId } = Astro.props;
---
<!-- Contenedor del anuncio -->
<ins class="adsbygoogle"
     style="display:block"
     data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
     data-ad-slot={slotId}
     data-ad-format="auto"
     data-full-width-responsive="true"></ins>

<script is:inline>
     // Se ejecuta solo en el cliente, después de que el HTML base se ha servido
     (adsbygoogle = window.adsbygoogle || []).push({});
</script>
B. Anuncios Nativos, Banners Propios o Enlaces de Afiliados (Sponsorships)
Si vendes espacios publicitarios directamente a empresas locales o pones banners de afiliados (por ejemplo, un banner de Amazon o de un servicio aliado):

No consultes la base de datos (Neon/D1) en cada visita: Si tienes 10,000 visitas al día y en cada una ejecutas un SELECT en el Worker para traer el banner, consumirás recursos innecesariamente.

Usa Cloudflare KV o Caché de Edge con Stale-While-Revalidate (SWR): Guarda los datos del banner (imagen, link) en Cloudflare KV y sírvelos configurando los encabezados de caché HTTP. De esta forma, Cloudflare sirve el banner desde su memoria global interna (CDN) y tu Worker trabaja 0 milisegundos.

TypeScript
// src/pages/api/v1/banner.ts
import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ locals }) => {
  const { SESIONES_KV } = locals.runtime.env;

  // Intentar sacar el banner de la memoria ultra-rápida KV
  let bannerData = await SESIONES_KV.get("active_campaign");

  if (!bannerData) {
    // Fallback de emergencia si no está en caché (aquí podrías consultar Neon)
    bannerData = JSON.stringify({
      imageUrl: "https://assets.tudominio.com/banners/promo.png",
      targetUrl: "https://empresa-aliada.com/?ref=tusaas"
    });
    // Guardar en KV por 1 hora
    await SESIONES_KV.put("active_campaign", bannerData, { expirationTtl: 3600 });
  }

  return new Response(bannerData, {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      // Decirle a Cloudflare que guarde este JSON en su CDN por 10 minutos
      'Cache-Control': 'public, max-age=600, stale-while-revalidate=30'
    }
  });
};
2. Checklist Técnico Obligatorio para el Despliegue
[ ] Archivo ads.txt en la raíz: Obligatorio para cualquier red de anuncios (AdSense, Ezoic, etc.). En Astro, colócalo directamente en la carpeta /public/ads.txt. Al compilar, Astro lo moverá a la raíz de producción ([tudominio.com/ads.txt](https://tudominio.com/ads.txt)). Sin esto, las redes de anuncios bloquearán tus pagos por sospecha de fraude.

[ ] Retrasar la carga de Scripts (Lazy Loading de Ads): Los anuncios destruyen la métrica LCP (Largest Contentful Paint). Utiliza un IntersectionObserver en el cliente para cargar el script de publicidad solo cuando el usuario haga scroll y esté cerca de ver el bloque de anuncios.

[ ] Configurar Content Security Policy (CSP): Si manejas cabeceras de seguridad en tu Nginx o Cloudflare (por ejemplo, usando Cloudflare Transformation Rules), asegúrate de dar permisos a los dominios de la red de anuncios (como *.googlesyndication.com) para evitar que el navegador bloquee la publicidad.