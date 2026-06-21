import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";

// SSR sobre Cloudflare para HTML ultraligero en redes móviles.
export default defineConfig({
  output: "server",
  adapter: cloudflare(),
});
