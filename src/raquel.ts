// Bloco "Raquel" (2026-11-12): a desconfiada. Ela só ACREDITA quando ouviu de duas pessoas diferentes
// (`desconfia` no motor). Escolhida pela crítica do Fable (variedade de raciocínio): é a única regra que quebra
// "solução = um caminho só". Como cada morador conta pra uma pessoa só, abrir dois galhos exige a Fofoqueira.
// Três fases, cada uma com uma função:
//   1. reconhecer: a Raquel é a estrela; a Fofoqueira conta pra ela, mas uma fonte só não basta;
//   2. desviar: o caminho curto passa por ela, e lá só chega uma fonte — ela trava o boato; tem que dar a volta;
//   3. usar de propósito: o único caminho até a estrela passa por ela — a Fofoqueira abre dois galhos e os dois
//      se encontram na Raquel.
// Jogado numa sessão separada (?bloco=raquel), fora da campanha.

import type { Vizinho } from './motor';
import type { FaseTrilho } from './trilho';

const v = (id: string, nome: string, tipo: Vizinho['tipo'], pos: [number, number], extra: Partial<Vizinho> = {}): Vizinho =>
  ({ id, nome, tipo, pos, ...extra });
const ze = (pos: [number, number]) => v('z', 'Seu Zé', 'assunto', pos);
const raquel = (pos: [number, number], extra: Partial<Vizinho> = {}) => v('q', 'Raquel', 'comum', pos, { desconfia: true, ...extra });

export const fasesRaquel: FaseTrilho[] = [
  {
    // a Neide conta pra Raquel sozinha (1ª fonte); a 2ª tem que vir pela Ana e pela Bia
    titulo: 'Só acredito ouvindo duas vezes',
    boato: 'O Seu Zé dorme de meia',
    novidade: 'Raquel: só acredita ouvindo de duas pessoas',
    giros: 0, setas: 3, origens: ['r'],
    vizinhos: [
      v('r', 'Rita', 'comum', [0, 0]), v('n', 'Neide', 'fofoqueira', [1, 0]), v('a', 'Ana', 'comum', [2, 0]),
      v('d', 'Davi', 'comum', [0, 1]), raquel([1, 1], { interesse: {} }), v('b', 'Bia', 'comum', [2, 1]),
      ze([0, 2]),
    ],
    amizades: [['r', 'n'], ['n', 'a'], ['n', 'q'], ['a', 'b'], ['b', 'q'], ['r', 'd'], ['d', 'z']],
    solucao: { r: 'n', a: 'b', b: 'q' },
    armadilha: { r: 'n' }, // a Neide conta pra ela, e ela não acredita
  },
  {
    // pela Ana e pela Raquel são 3 setas, mas na Raquel só chega a Ana: ela trava. A volta por baixo tem 5.
    titulo: 'Caminho travado',
    boato: 'O Seu Zé ensaia discurso no espelho',
    giros: 0, setas: 5, origens: ['r'],
    vizinhos: [
      v('r', 'Rita', 'comum', [0, 0]), v('a', 'Ana', 'comum', [1, 0]), raquel([2, 0]),
      v('d', 'Davi', 'comum', [0, 1]), v('e', 'Edu', 'comum', [1, 1]), v('c', 'Cida', 'comum', [2, 1], { interesse: {} }),
      ze([0, 2]), v('u', 'Rui', 'comum', [1, 2]), v('b', 'Bia', 'comum', [2, 2]),
    ],
    amizades: [['r', 'a'], ['a', 'q'], ['q', 'c'], ['r', 'd'], ['d', 'e'], ['e', 'u'], ['u', 'b'], ['b', 'c'], ['d', 'z']],
    solucao: { r: 'd', d: 'e', e: 'u', u: 'b', b: 'c' },
    armadilha: { r: 'a', a: 'q', q: 'c' }, // o atalho: a Raquel ouve só da Ana e não passa adiante
  },
  {
    // só a Raquel chega na Cida: a Neide conta pra Ana e pro Edu, e os dois contam pra Raquel
    titulo: 'Duas bocas',
    boato: 'O Seu Zé dá boa noite pra lua',
    giros: 0, setas: 4, origens: ['r'],
    vizinhos: [
      v('r', 'Rita', 'comum', [0, 0]), v('n', 'Neide', 'fofoqueira', [1, 0]), v('a', 'Ana', 'comum', [2, 0]),
      v('d', 'Davi', 'comum', [0, 1]), v('e', 'Edu', 'comum', [1, 1]), raquel([2, 1]),
      ze([1, 2]), v('c', 'Cida', 'comum', [2, 2], { interesse: {} }),
    ],
    amizades: [['r', 'n'], ['n', 'a'], ['n', 'e'], ['a', 'q'], ['e', 'q'], ['q', 'c'], ['r', 'd'], ['d', 'e'], ['e', 'z']],
    solucao: { r: 'n', a: 'q', e: 'q', q: 'c' },
    armadilha: { r: 'n', a: 'q', q: 'c' }, // um galho só: a Raquel não acredita e a Cida fica sem saber
  },
];
