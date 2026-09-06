// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
    // Phaser 的 package main 指向源码树 src/phaser.js。Vite 8 预构建会卡住，
    // /about 拿到 /node_modules/.vite/deps/phaser.js 的 504，游戏起不来。
    // 改走已经打好的 ESM，并排除预构建。
    resolve: {
      alias: {
        phaser: "phaser/dist/phaser.esm.min.js",
      },
    },
    optimizeDeps: {
      exclude: ["phaser"],
    },
  },
  redirects: {},
});
