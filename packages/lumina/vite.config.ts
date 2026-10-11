import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { readdirSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
export default defineConfig({
  plugins: [
    react(),
    {
      name: "lumina-offline-shell",
      closeBundle() {
        const assets = readdirSync("dist/assets").map(
          (file) => "/assets/" + file,
        );
        const version = createHash("sha256")
          .update(assets.join(","))
          .digest("hex")
          .slice(0, 12);
        const shell = [
          "/",
          "/icon.svg",
          "/icon-192.png",
          "/icon-512.png",
          "/manifest.webmanifest",
          ...assets,
        ];
        writeFileSync(
          "dist/sw.js",
          `const CACHE='lumina-${version}';const SHELL=${JSON.stringify(shell)};
 self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)));self.skipWaiting()});
 self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));self.clients.claim()});
 self.addEventListener('fetch',e=>{const u=new URL(e.request.url);if(e.request.method!=='GET'||u.origin!==self.location.origin)return;if(e.request.mode==='navigate'){e.respondWith(fetch(e.request).catch(()=>caches.match('/')));return}if(!SHELL.includes(u.pathname)&&!u.pathname.startsWith('/images/'))return;e.respondWith(caches.match(e.request).then(hit=>hit||fetch(e.request).then(r=>{if(r.ok){const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy))}return r})))});
 `,
        );
      },
    },
  ],
  server: {
    host: "0.0.0.0",
    port: 3000,
    proxy: { "/api": "http://127.0.0.1:3001" },
  },
  build: {
    rollupOptions: {
      output: { manualChunks: { supabase: ["@supabase/supabase-js"] } },
    },
  },
});
