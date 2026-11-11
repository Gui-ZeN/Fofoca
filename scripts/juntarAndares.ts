// Junta os blocos gerados por gerarAndares.ts em src/andares.json, na ordem das posições.
// Uso: npx vite-node scripts/juntarAndares.ts <bloco0.json> <bloco1.json> ...
import { readFileSync, writeFileSync } from 'node:fs';

const todos = process.argv.slice(2).flatMap((arq) => JSON.parse(readFileSync(arq, 'utf8')) as { pos: number }[]);
todos.sort((a, b) => a.pos - b.pos);
todos.forEach((a, i) => { if (a.pos !== i) throw new Error(`falta a posição ${i}`); });
writeFileSync(new URL('../src/andares.json', import.meta.url), JSON.stringify(todos));
console.log(`src/andares.json: ${todos.length} andares`);
