import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
export default defineConfig({
  plugins: [react()],
  server: {
    host: "127.0.0.1",
    port: 3000,
    strictPort: true,
    proxy: { "/api": "http://127.0.0.1:3001" },
  },
  resolve: {
    alias: {
      "@lumina/aurora": path.resolve(__dirname, "../aurora/src/index.ts"),
    },
  },
});
