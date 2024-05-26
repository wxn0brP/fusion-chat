import { defineConfig } from 'astro/config';

import tailwind from "@astrojs/tailwind";

// https://astro.build/config
export default defineConfig({
    outDir: "../front/astro",
    integrations: [
        tailwind({
            configFile: "./tailwind.config.mjs"
        })
    ],
});