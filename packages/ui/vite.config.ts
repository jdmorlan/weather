import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// The Bun server (packages/server) is the single entry point on :8080.
// It proxies `/api/*` to upstream APIs (injecting secrets) and everything
// else to this Vite dev server. HMR WebSocket connects directly to Vite
// on :5173 to avoid proxying WS through Bun.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    hmr: {
      clientPort: 5173,
    },
  },
})
