import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import { defineConfig } from 'vite';

const dockerPort = Number(process.env.VITE_PORT ?? 5173);
const dockerServer =
    process.env.VITE_DOCKER === 'true'
        ? {
              host: '0.0.0.0',
              port: dockerPort,
              strictPort: true,
              origin: `http://${process.env.VITE_BROWSER_HOST ?? 'localhost'}:${dockerPort}`,
              watch: {
                  usePolling: process.env.CHOKIDAR_USEPOLLING === 'true',
              },
          }
        : undefined;

export default defineConfig({
    server: dockerServer,
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.tsx'],
            ssr: 'resources/js/ssr.jsx',
            refresh: true,
        }),
        react(),
        tailwindcss(),
    ],
    esbuild: {
        jsx: 'automatic',
    },
});
