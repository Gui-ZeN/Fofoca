import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base relativa: a pasta dist/ abre em qualquer hospedagem estática.
export default defineConfig({ plugins: [react()], base: './' });
