// Lê um ou mais arquivos exportados pela pesquisa (fofoca-registro-P-XXXX-data.json) e imprime uma linha por pessoa e andar:
// tentativas, desfecho (venceu / pulou / parou), tempo no andar, maior pausa sem tentar ("travou?" = 2 min ou mais) e por que perdeu.
// Uso: npx vite-node scripts/resumoRegistro.ts <arquivo.json> [mais.json…]
import { readFileSync } from 'node:fs';
import { resumir } from '../src/resumo';
import type { Arquivo } from '../src/registro';

const arquivos = process.argv.slice(2);
if (!arquivos.length) { console.error('uso: npx vite-node scripts/resumoRegistro.ts <registro.json> [...]'); process.exit(2); }
const min = (ms: number) => `${Math.floor(ms / 60000)}:${String(Math.round((ms % 60000) / 1000)).padStart(2, '0')}`;
console.log(['participante', 'modo', 'andar', 'tentativas', 'desfecho', 'tempo', 'maior pausa', 'travou?', 'perdeu por'].join('\t'));
for (const arq of arquivos) {
  const linhas = resumir(JSON.parse(readFileSync(arq, 'utf8')) as Arquivo);
  for (const l of linhas) console.log([l.participante, l.modo, l.fase, l.tentativas, l.desfecho, min(l.ms), min(l.maiorPausa_ms), l.travou ? 'SIM' : '', l.motivos.join(', ')].join('\t'));
}
