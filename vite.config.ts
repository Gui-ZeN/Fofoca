import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// versão que vai no registro da pesquisa: o commit, quando o build roda no GitHub; "local" no computador
const env = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env ?? {};
const versao = env.GITHUB_SHA ? env.GITHUB_SHA.slice(0, 7) : 'local';

// base relativa: a pasta dist/ abre em qualquer hospedagem estática.
export default defineConfig({ plugins: [react()], base: './', define: { __VERSAO__: JSON.stringify(versao) } });
