// Campanha: o jogo de verdade (abre sem link). Um andar do prédio por fase, na ordem abaixo.
// Decisão do usuário (2026-11-11): intercalar — depois do tutorial, fase pesada seguida de uma mais leve
// (a "escada" da King), em vez de bloco atrás de bloco. Cada regra nova estreia na fase que tem a
// etiqueta NOVO (exagerado na T8, padaria na H2, celular na T10, ordem na O1) antes de qualquer fase que a use.
// As 4 fases de giros ficam só no teste A/B (?grupo=A/B).

import type { FaseTrilho } from './trilho';
import { espelhar, fasesTrilho } from './trilho';
import estoque from './andares.json';
import { fasesHora } from './horaCerta';
import { fasesOrdem } from './ordem';
import { fasesDificil } from './dificil';

export interface Andar { rotulo: string; fase: FaseTrilho }

const todas: Record<string, FaseTrilho> = Object.fromEntries([
  ...fasesTrilho.map((f, i) => [`T${i + 1}`, f]),
  ...fasesHora.map((f, i) => [`H${i + 1}`, f]),
  ...fasesOrdem.map((f, i) => [`O${i + 1}`, f]),
  ...fasesDificil.map((f, i) => [`D${i + 1}`, f]),
]);

export const ORDEM_CAMPANHA = [
  'T1', 'T2', 'T3', 'T4', 'T5', // tutorial: dica de uma frase, sem advertência
  'T6', 'H1', 'T7', 'T8', 'H2', 'T9', 'H3', 'T10', 'H4',
  'O1', 'O2', 'H5', 'O3', 'H6', 'O4',
  'D1', 'O5', 'D2', 'O6', 'D3', 'D4', 'D5', 'D6',
];

export const TUTORIAL = 5; // as primeiras fases não custam advertência

export const CAMPANHA: Andar[] = ORDEM_CAMPANHA.map((rotulo) => ({ rotulo, fase: todas[rotulo] }));

// Depois das 28 feitas à mão, o estoque gerado (src/andares.json, scripts/gerarAndares.ts): blocos de 25
// com a escada leve/média/pesada e um chefão no fim. Acabou o estoque, ele recomeça — espelhado numa
// volta sim, outra não — então o prédio não termina. Mais andares únicos: rodar o script de novo.
export const ESTOQUE = (estoque as unknown as { pos: number; fase: FaseTrilho }[]).map((a) => a.fase);
export const ESTOQUE_PESOS = (estoque as unknown as { saiu: string }[]).map((a) => a.saiu); // o peso que de fato saiu
export const VOLTAS = 20;
export const PREDIO: Andar[] = [
  ...CAMPANHA,
  ...Array.from({ length: VOLTAS }, (_, volta) => ESTOQUE.map((fase, i) => ({
    rotulo: volta ? `E${i + 1}.${volta + 1}` : `E${i + 1}`,
    fase: volta % 2 ? espelhar(fase) : fase,
  }))).flat(),
];
