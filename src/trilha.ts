// A trilha: blocos de 25 fases, cada um com uma mecânica nova. As fases desenhadas à mão abrem
// cada bloco como tutorial; o resto vem do gerador, com dificuldade subindo e uma fase de respiro
// a cada 5. Depois do último bloco a trilha continua sem fim, com tudo liberado.

import type { Fase, Tipo } from './motor';
import { fases as tutoriais } from './fases';
import { gerar, type Pedido } from './gerador';

export interface Bloco {
  nome: string;
  inicio: number;
  tipos: Tipo[];
  novo?: Tipo;
  horario?: 'sempre' | 'as-vezes'; // o Seu Zé na padaria
  tutoriais: Record<number, number>; // número da fase -> índice em fases.ts
}

export const TAMANHO_BLOCO = 25;

export const BLOCOS: Bloco[] = [
  { nome: 'Primeiros boatos', inicio: 1, tipos: ['fofoqueira'], tutoriais: { 1: 0, 2: 1, 4: 2, 6: 3, 10: 4, 13: 5 } },
  { nome: 'O Exagerado', inicio: 26, tipos: ['fofoqueira', 'exagerado'], novo: 'exagerado', tutoriais: { 26: 6, 29: 7 } },
  { nome: 'Do Contra', inicio: 51, tipos: ['fofoqueira', 'exagerado', 'docontra'], novo: 'docontra', tutoriais: { 51: 9 } },
  { nome: 'Boca de túmulo', inicio: 76, tipos: ['fofoqueira', 'exagerado', 'docontra', 'tumulo'], novo: 'tumulo', tutoriais: { 76: 10, 78: 8, 80: 11 } }, // o prédio da Dona Cida usa o Padre
  { nome: 'Hora da padaria', inicio: 101, tipos: ['fofoqueira', 'exagerado', 'docontra', 'tumulo'], horario: 'sempre', tutoriais: { 101: 12 } },
  { nome: 'Sem fim', inicio: 126, tipos: ['fofoqueira', 'exagerado', 'docontra', 'tumulo'], horario: 'as-vezes', tutoriais: {} },
];

export const blocoDa = (n: number) => [...BLOCOS].reverse().find((b) => n >= b.inicio)!;

// O que pedir ao gerador na fase n.
export function pedidoDa(n: number): Pedido {
  const b = blocoDa(n);
  const nivel = BLOCOS.indexOf(b);
  const p = ((n - b.inicio) % TAMANHO_BLOCO) / TAMANHO_BLOCO; // 0 no começo do bloco, ~1 no fim
  const respiro = n % 5 === 0;
  let giros = nivel === 0 ? (n < 10 ? 0 : 1) : p < 0.65 ? 1 : 2;
  if (respiro) giros = Math.max(0, giros - 1);
  return {
    // 5 é o mínimo pra ter caminho, armadilha e gente que importa
    vizinhos: Math.min(8, Math.max(5, 5 + Math.min(nivel, 2) + Math.round(p * 2) - (respiro ? 1 : 0))),
    giros,
    tipos: b.tipos,
    obrigatorio: b.novo,
    // dois interessados só com gente sobrando pra ser origem e armadilha
    interessados: p > 0.4 && n % 3 === 0 && !respiro ? 2 : 1,
    alvo: 2.6 + Math.min(nivel, 4) * 0.8 + p * 3 - (respiro ? 1.5 : 0),
    horario: b.horario === 'sempre' || (b.horario === 'as-vezes' && n % 2 === 0),
  };
}

const cache = new Map<number, Fase>();

// Fase n da trilha (1, 2, 3...). Mesma fase para todo mundo: a semente é o próprio número.
export function faseDaTrilha(n: number): Fase {
  const pronta = cache.get(n);
  if (pronta) return pronta;
  const b = blocoDa(n);
  let fase: Fase | undefined = b.tutoriais[n] !== undefined ? tutoriais[b.tutoriais[n]] : undefined;
  // se o pedido não sair, alivia (um interessado só, mais gente, menos giros) até sair
  for (let alivio = 0; !fase && alivio < 6; alivio++) {
    const p = pedidoDa(n);
    fase = gerar({
      ...p,
      interessados: alivio > 0 ? 1 : p.interessados,
      vizinhos: Math.min(8, p.vizinhos + (alivio > 2 ? 1 : 0)),
      giros: Math.max(0, p.giros - (alivio > 3 ? 1 : 0)),
    }, n * 2654435761 + alivio);
  }
  if (!fase) throw new Error(`o gerador não conseguiu montar a fase ${n}`); // os testes cobrem 1 a 100
  cache.set(n, fase);
  return fase;
}
