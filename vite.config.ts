import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// Same plugins as the firstbriq frontend, so the components move over unchanged.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: './',
});
