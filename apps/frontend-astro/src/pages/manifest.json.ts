import type { APIRoute } from "astro";

export const GET: APIRoute = () => {
  const manifest = {
    name: "Loto Honduras Analytics",
    short_name: "Loto HN",
    description: "Patrones estadísticos e imaginario popular de la lotería de Honduras.",
    start_url: "/",
    display: "standalone",
    background_color: "#f8fafc",
    theme_color: "#0f766e",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
  return new Response(JSON.stringify(manifest), {
    headers: { "Content-Type": "application/manifest+json" },
  });
};
