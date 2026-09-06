import type { APIRoute } from "astro";

export const GET: APIRoute = ({ url }) => {
  const base = url.origin;
  const pages = ["/", "/history", "/patrones", "/premium", "/login"];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map((p) => `  <url><loc>${base}${p}</loc><changefreq>daily</changefreq></url>`).join("\n")}
</urlset>`;
  return new Response(xml, {
    headers: { "Content-Type": "application/xml" },
  });
};
