import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";
import tailwind from "@astrojs/tailwind";

// SSR sobre Cloudflare para HTML ultraligero en redes móviles.
export default defineConfig({
  output: "server",
  adapter: cloudflare({ platformProxy: { enabled: true } }),
  integrations: [tailwind({ applyBaseStyles: false })],
  vite: {
    server: {
      allowedHosts: [
        "chariot-drowsily-lure.ngrok-free.dev",
        // Agrega aquí otros túneles o hosts adicionales si cambian
      ],
    },
  },
});
