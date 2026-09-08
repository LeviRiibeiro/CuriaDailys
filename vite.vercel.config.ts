import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': fileURLToPath(new URL('./', import.meta.url)) } },
  define: {
    'process.env.NEXT_PUBLIC_SUPABASE_URL': JSON.stringify(process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''),
    'process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY': JSON.stringify(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? ''),
  },
  build: { outDir: 'dist-vercel', emptyOutDir: true },
});
