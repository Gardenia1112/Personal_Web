// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  // 全站 canonical / og 的基准域名（Astro.site）。⚠️ 占位：最终部署域名确定后改这一行即可。
  // 注：② 移除的是「个人网站」这条失效外链；这里 lszbf.com 是站点自身的 canonical 域名，两者不冲突。
  site: "https://lszbf.com",
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
