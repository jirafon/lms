import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import dotenv from "dotenv"

dotenv.config()

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: "0.0.0.0",                           // listen on all interfaces
    port: Number(process.env.PORT) || 5173,    // use Render’s PORT or fall back
    strictPort: true,                          // fail if that port is unavailable
    allowedHosts: ["all"],  // allow your Render host
  },
  preview: {
    host: "0.0.0.0",
    port: Number(process.env.PORT) || 4173,
    strictPort: true,
    allowedHosts: ["all"],  // allow your Render host
  },
})
