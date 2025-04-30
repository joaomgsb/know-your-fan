import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dotenvExpand from 'dotenv-expand';
import { loadEnv } from 'vite';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Carrega as variáveis de ambiente
  const env = loadEnv(mode, process.cwd(), '');
  dotenvExpand.expand({ parsed: env });

  return {
    plugins: [react()],
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
    server: {
      port: 5173,
      host: true
    },
    build: {
      outDir: 'dist',
      sourcemap: mode === 'development'
    },
  };
});
