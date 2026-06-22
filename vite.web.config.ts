import { resolve } from 'path'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Why: src/renderer also contains index.html for electron-vite; without this,
// http://127.0.0.1:5175/ boots main.tsx (no preload) and hits the root error boundary.
function webDevDefaultEntryPlugin(): Plugin {
  return {
    name: 'web-dev-default-entry',
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        if (req.url === '/' || req.url === '/index.html') {
          req.url = '/web-index.html'
        }
        next()
      })
    }
  }
}

export default defineConfig({
  root: resolve('src/renderer'),
  // Why: electron-vite owns :5173 for the desktop renderer. The paired web
  // client must not compete for that port when both dev servers run together.
  server: {
    host: '127.0.0.1',
    port: 5175,
    strictPort: true
  },
  // Why: `pnpm dev` and `pnpm dev:web` run concurrently in local workflows.
  // Sharing `node_modules/.vite/deps` lets one server's optimize pass corrupt
  // React for the other, which surfaces as dnd-kit `useMemo` crashes.
  cacheDir: resolve('node_modules/.vite-web'),
  // Why: pairing URLs may live under a reverse-proxy path prefix like
  // /orca/web-index.html, so built assets must resolve relative to the page.
  base: './',
  plugins: [webDevDefaultEntryPlugin(), react(), tailwindcss()],
  define: {
    ORCA_FEATURE_WALL_ENABLED: 'true'
  },
  resolve: {
    dedupe: ['react', 'react-dom'],
    alias: {
      '@renderer': resolve('src/renderer/src'),
      '@': resolve('src/renderer/src')
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom', '@dnd-kit/core', '@dnd-kit/sortable', '@dnd-kit/utilities']
  },
  build: {
    outDir: resolve('out/web'),
    emptyOutDir: true,
    // Why: the paired web client intentionally ships Monaco and diagram workers;
    // keep the warning gate above the known worker payload, not Vite's web-app default.
    chunkSizeWarningLimit: 8192,
    rollupOptions: {
      input: resolve('src/renderer/web-index.html')
    }
  },
  worker: {
    format: 'es'
  }
})
