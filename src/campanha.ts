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
import { fasesNorma, fasesVera } from './fiscais';
import { fasesApressado } from './apressado';
import { fasesRaquel } from './raquel';
import { fasesDuplas } from './duplas';
import { fasesSaida } from './saida';
import { fasesArnaldo } from './arnaldo';

export interface Andar { rotulo: string; fase: FaseTrilho }

const todas: Record<string, FaseTrilho> = Object.fromEntries([
  ...fasesTrilho.map((f, i) => [`T${i + 1}`, f]),
  ...fasesHora.map((f, i) => [`H${i + 1}`, f]),
  ...fasesOrdem.map((f, i) => [`O${i + 1}`, f]),
  ...fasesDificil.map((f, i) => [`D${i + 1}`, f]),
  ...fasesVera.map((f, i) => [`V${i + 1}`, f]),
]);

export const ORDEM_CAMPANHA = [
  'T1', 'T2', 'T3', 'T4', 'T5', // tutorial: dica de uma frase, sem advertência
  'T6', 'H1', 'T7', 'T8', 'H2', 'T9', 'H3', 'T10', 'H4',
  'O1', 'O2', 'H5', 'O3', 'H6', 'O4',
  'D1', 'O5', 'D2', 'O6', 'D3', 'D4', 'D5', 'D6',
  // a Vera estreia antes do estoque gerado, que usa ela de vítima em 1 andar de cada 3 (2026-11-12)
  'V1', 'V2', 'V3',
];

export const TUTORIAL = 5; // as primeiras fases não custam advertência

export const CAMPANHA: Andar[] = ORDEM_CAMPANHA.map((rotulo) => ({ rotulo, fase: todas[rotulo] }));

// Depois das 31 feitas à mão, o estoque gerado (src/andares.json, scripts/gerarAndares.ts): blocos de 25 com a escada
// leve/média/pesada e um chefão no fim. Acabou o estoque, ele recomeça — espelhado numa volta sim, outra não — então o
// prédio não termina. Mais andares únicos: rodar o script de novo.
export const ESTOQUE = (estoque as unknown as { pos: number; fase: FaseTrilho }[]).map((a) => a.fase);
export const ESTOQUE_PESOS = (estoque as unknown as { saiu: string }[]).map((a) => a.saiu); // o peso que de fato saiu
export const VOLTAS = 20;
export const POR_BLOCO = 25; // o estoque gerado: escada leve/média/pesada e um chefão no 25º
export const FEITOS_A_MAO = CAMPANHA.length;

// Os personagens que só existiam em blocos de teste estreiam aqui, UM POR VEZ, cada estreia seguida de um bloco
// gerado (2026-11-13, "ir misturando os blocos soltos na campanha"). ⚠️ Contrato com a fábrica (scripts/gerarAndares.ts):
// o bloco k do estoque usa o elenco liberado ATÉ ALI — bloco 0: Zé e Vera; 1: + Nando; 2: + Raquel; 3: + "sai pra
// padaria"; 4: + Arnaldo; 5: + Dona Norma. Por isso a estreia vem ANTES do bloco que a usa, nunca depois.
// Ficam fora: Nonato e Dr. Álvaro. As estreias NÃO se repetem nas voltas do estoque.
// Raquel e Duplas vêm juntas porque as duplas misturam Nando, Raquel e Vera, e só então fazem sentido.
interface Estreia { id: string; letra: string; fases: FaseTrilho[] }
export const ESTREIAS: Estreia[] = [
  { id: 'nando', letra: 'P', fases: fasesApressado },
  { id: 'raquel', letra: 'R', fases: fasesRaquel },
  { id: 'duplas', letra: 'U', fases: fasesDuplas },
  { id: 'saida', letra: 'S', fases: fasesSaida },
  { id: 'arnaldo', letra: 'A', fases: fasesArnaldo },
  { id: 'norma', letra: 'M', fases: fasesNorma },
];
// quais estreias vêm logo DEPOIS do bloco k do estoque (e antes do k+1), só na 1ª volta
const DEPOIS_DO_BLOCO: string[][] = [['nando'], ['raquel', 'duplas'], ['saida'], ['arnaldo'], ['norma']];

// Um pedaço contíguo do prédio: o que vem pronto da mão, uma estreia ou um bloco gerado. `inicio`/`fim` são índices
// em PREDIO (fim exclusivo). Os capítulos (capitulos.ts) seguem estes segmentos.
export interface Segmento { tipo: 'feitos' | 'estreia' | 'bloco'; id: string; inicio: number; fim: number; volta?: number }

export const BLOCOS_DO_ESTOQUE = Math.ceil(ESTOQUE.length / POR_BLOCO);
const montar = (): { predio: Andar[]; segmentos: Segmento[] } => {
  const predio: Andar[] = [...CAMPANHA];
  const segmentos: Segmento[] = [{ tipo: 'feitos', id: 'feitos', inicio: 0, fim: predio.length }];
  const poe = (tipo: Segmento['tipo'], id: string, andares: Andar[], volta?: number) => {
    segmentos.push({ tipo, id, inicio: predio.length, fim: predio.length + andares.length, ...(volta === undefined ? {} : { volta }) });
    predio.push(...andares);
  };
  for (let volta = 0; volta < VOLTAS; volta++) {
    for (let k = 0; k < BLOCOS_DO_ESTOQUE; k++) {
      // os rótulos dos gerados não dependem das estreias: E1..E150 (e E{i}.{volta} nas voltas)
      poe('bloco', `bloco${k}`, ESTOQUE.slice(k * POR_BLOCO, (k + 1) * POR_BLOCO).map((fase, j) => {
        const i = k * POR_BLOCO + j;
        return { rotulo: volta ? `E${i + 1}.${volta + 1}` : `E${i + 1}`, fase: volta % 2 ? espelhar(fase) : fase };
      }), volta);
      if (volta === 0) {
        for (const id of DEPOIS_DO_BLOCO[k] ?? []) {
          const e = ESTREIAS.find((x) => x.id === id)!;
          poe('estreia', id, e.fases.map((fase, j) => ({ rotulo: `${e.letra}${j + 1}`, fase })));
        }
      }
    }
  }
  return { predio, segmentos };
};
const { predio, segmentos } = montar();
export const PREDIO: Andar[] = predio;
export const SEGMENTOS: Segmento[] = segmentos;
