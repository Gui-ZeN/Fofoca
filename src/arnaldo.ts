// Bloco "Arnaldo" (protótipo da Consulta 6): o primeiro fiscal do condomínio. Ele é a vítima da fase e
// reclama de qualquer barulho: quem está colado nele (por passagem) conta um tamanho menor (`abafa` no motor).
// Três fases com funções diferentes, como o Sol pediu — e não três de "desvie do Arnaldo":
//   1. reconhecer: um boato já aumentado passa colado nele e chega menor na estrela;
//   2. escolher: a área dele estraga o caminho tentador;
//   3. usar de propósito: só passando colado nele o escândalo vira fofoca.
// Jogado numa sessão separada (?bloco=arnaldo), fora da campanha, até 3 andares.

import type { Vizinho } from './motor';
import type { FaseTrilho } from './trilho';

const v = (id: string, nome: string, tipo: Vizinho['tipo'], pos: [number, number], extra: Partial<Vizinho> = {}): Vizinho =>
  ({ id, nome, tipo, pos, ...extra });
const arnaldo = (pos: [number, number]) => v('z', 'Arnaldo', 'assunto', pos, { abafa: true });
const quer = (tamanho: 1 | 2 | 3): Partial<Vizinho> => ({ interesse: { tamanho } });

export const fasesArnaldo: FaseTrilho[] = [
  {
    // o Beto aumenta, mas mora colado no Arnaldo: sai cochicho de novo — e a Cida quer cochicho.
    // Desviar do Beto não dá (o outro caminho passa pelo Edu, que entrega pro Arnaldo).
    titulo: 'Fala baixo, Beto',
    boato: 'O Arnaldo canta ópera no banho',
    novidade: 'Arnaldo: quem mora colado nele fala um tamanho menor',
    giros: 0, setas: 3, origens: ['r'],
    vizinhos: [
      v('r', 'Rita', 'comum', [0, 0]), v('o', 'Beto', 'exagerado', [1, 0]), v('a', 'Ana', 'comum', [2, 0]),
      v('e', 'Edu', 'comum', [0, 1]), arnaldo([1, 1]), v('c', 'Cida', 'comum', [2, 1], quer(1)),
    ],
    amizades: [['r', 'o'], ['o', 'a'], ['a', 'c'], ['r', 'e'], ['e', 'z'], ['o', 'z']],
    solucao: { r: 'o', o: 'a', a: 'c' },
  },
  {
    // dois caminhos de três setas: pelo Rui (colado no Arnaldo) a fofoca volta a cochicho; pela Ana, chega inteira
    titulo: 'Corredor do silêncio',
    boato: 'O Arnaldo dorme de meia',
    giros: 0, setas: 3, origens: ['r'],
    vizinhos: [
      v('r', 'Rita', 'comum', [0, 0]), v('o', 'Beto', 'exagerado', [1, 0]), v('a', 'Ana', 'comum', [2, 0]),
      v('d', 'Davi', 'comum', [0, 1]), v('x', 'Rui', 'comum', [1, 1]), v('c', 'Cida', 'comum', [2, 1], quer(2)),
      v('e', 'Edu', 'comum', [0, 2]), arnaldo([1, 2]), v('b', 'Bia', 'comum', [2, 2]),
    ],
    amizades: [['r', 'o'], ['o', 'x'], ['x', 'c'], ['x', 'z'], ['o', 'a'], ['a', 'c'], ['r', 'd'], ['d', 'e'], ['e', 'z'], ['b', 'c'], ['b', 'z']],
    solucao: { r: 'o', o: 'a', a: 'c' },
    armadilha: { r: 'o', o: 'x', x: 'c' }, // mesmo tamanho de caminho, mas o Rui fala baixo: chega cochicho
  },
  {
    // Beto e Lúcia fazem um escândalo; a Cida quer fofoca. Pela Bia chega escândalo. Só passando pelo Rui,
    // colado no Arnaldo, o escândalo baixa pra fofoca: aqui entrar na área é a jogada.
    titulo: 'Escândalo demais',
    boato: 'O Arnaldo pede silêncio cantando',
    giros: 0, setas: 4, origens: ['r'],
    vizinhos: [
      v('r', 'Rita', 'comum', [0, 0]), v('o', 'Beto', 'exagerado', [1, 0]), v('d', 'Davi', 'comum', [2, 0]),
      v('a', 'Ana', 'comum', [0, 1]), v('u', 'Lúcia', 'exagerado', [1, 1]), v('b', 'Bia', 'comum', [2, 1]),
      arnaldo([0, 2]), v('x', 'Rui', 'comum', [1, 2]), v('c', 'Cida', 'comum', [2, 2], quer(2)),
    ],
    amizades: [['r', 'o'], ['o', 'd'], ['o', 'u'], ['u', 'a'], ['a', 'z'], ['u', 'b'], ['b', 'c'], ['u', 'x'], ['x', 'z'], ['x', 'c']],
    solucao: { r: 'o', o: 'u', u: 'x', x: 'c' },
    armadilha: { r: 'o', o: 'u', u: 'b', b: 'c' }, // fugir do Arnaldo: chega escândalo
  },
];
