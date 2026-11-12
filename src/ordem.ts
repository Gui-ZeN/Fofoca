// Bloco "Ordem": uma novidade só — a estrela com número menor tem que saber ANTES (empate perde;
// `interesse.ordem` no motor). Consulta 3: "Fofoqueira + Ordem" é boa e barata — às vezes ela tem que
// ser a última da fila, porque conta pra todo mundo ao mesmo tempo. Fases achadas com o buscador sobre
// o motor (1 solução no K mínimo; sem a ordem, a jogada muda; o caminho curto perde) e mapeadas à mão.
// Jogado numa sessão separada (?bloco=ordem). O5 e O6 combinam com a padaria do bloco Hora certa.

import type { Vizinho } from './motor';
import type { FaseTrilho } from './trilho';

const v = (id: string, nome: string, tipo: Vizinho['tipo'], pos: [number, number], extra: Partial<Vizinho> = {}): Vizinho =>
  ({ id, nome, tipo, pos, ...extra });
const ze = (pos: [number, number]) => v('z', 'Seu Zé', 'assunto', pos);
const vez = (ordem: number, chega?: number): Partial<Vizinho> => ({ interesse: { ordem }, ...(chega ? { chega } : {}) });

export const fasesOrdem: FaseTrilho[] = [
  {
    // a Cida (2) está do lado; a Bia (1) fica no fundo: tem que ir nela primeiro e voltar
    titulo: 'A Bia primeiro',
    boato: 'O Seu Zé dança na cozinha',
    novidade: 'Ordem: o número na estrela diz quem tem que saber primeiro',
    giros: 0, setas: 4, origens: ['r'],
    vizinhos: [
      v('r', 'Rita', 'comum', [0, 0]), v('a', 'Ana', 'comum', [1, 0]), v('c', 'Cida', 'comum', [2, 0], vez(2)),
      v('d', 'Davi', 'comum', [1, 1]), v('b', 'Bia', 'comum', [2, 1], vez(1)),
      ze([1, 2]),
    ],
    amizades: [['r', 'a'], ['a', 'd'], ['a', 'c'], ['b', 'd'], ['b', 'c'], ['d', 'z']],
    solucao: { r: 'a', a: 'd', d: 'b', b: 'c' },
    armadilha: { r: 'a', a: 'c', c: 'b' }, // a Cida sabe primeiro
  },
  {
    // a Neide conta pras duas na mesma batida: junto não vale; a Bia tem que chegar antes e a Neide ficar pro fim
    titulo: 'Junto não vale',
    boato: 'O Seu Zé dorme no sofá de propósito',
    giros: 0, setas: 3, origens: ['r'],
    vizinhos: [
      ze([1, 0]), v('c', 'Cida', 'comum', [2, 0], vez(2)),
      v('b', 'Bia', 'comum', [1, 1], vez(1)), v('n', 'Neide', 'fofoqueira', [2, 1]),
      v('u', 'Rui', 'comum', [1, 2]), v('r', 'Rita', 'comum', [2, 2]),
    ],
    amizades: [['n', 'c'], ['n', 'b'], ['n', 'r'], ['c', 'z'], ['b', 'z'], ['b', 'u'], ['r', 'u']],
    solucao: { r: 'u', u: 'b', b: 'n' },
    armadilha: { r: 'n' }, // a Neide conta pras duas ao mesmo tempo
  },
  {
    // ⚠️ substitui "A Neide por último" (2026-11-12): a O2, a O3 e a O6 terminavam todas com a Neide fechando a fila
    // (Fable). Aqui a fila encontra o tamanho: a Bia é a 1 e quer uma FOFOCA. Pelo Edu ela recebe cochicho; tem que
    // passar pelo Beto (Exagerado), que a Neide alcança, e voltar pelo Edu — que mora colado no Zé e não pode contar
    // pra ele. A Cida (2) só depois.
    titulo: 'Festa na laje',
    boato: 'O Seu Zé dança sozinho na cozinha',
    giros: 0, setas: 4, origens: ['r'],
    vizinhos: [
      v('n', 'Neide', 'fofoqueira', [0, 0]), v('o', 'Beto', 'exagerado', [1, 0]), v('c', 'Cida', 'comum', [2, 0], vez(2)),
      v('r', 'Rita', 'comum', [0, 1]), v('e', 'Edu', 'comum', [1, 1]), v('b', 'Bia', 'comum', [2, 1], { interesse: { ordem: 1, tamanho: 2 } }),
      ze([1, 2]), v('a', 'Ana', 'comum', [2, 2]),
    ],
    amizades: [['z', 'a'], ['z', 'e'], ['r', 'n'], ['r', 'e'], ['o', 'n'], ['o', 'c'], ['o', 'e'], ['c', 'b'], ['e', 'b']],
    solucao: { r: 'n', o: 'e', e: 'b', b: 'c' },
    armadilha: { r: 'e', e: 'b', b: 'c' }, // o atalho: a Bia recebe cochicho e queria fofoca
  },
  {
    // três na fila; aqui a Neide abre: ela entrega a 1 e o resto segue em corrente
    titulo: 'Um, dois, três',
    boato: 'O Seu Zé coleciona ímã de geladeira',
    giros: 0, setas: 4, origens: ['r'],
    vizinhos: [
      v('d', 'Davi', 'comum', [1, 0]), ze([2, 0]),
      v('r', 'Rita', 'comum', [0, 1]), v('a', 'Ana', 'comum', [1, 1]), v('c', 'Cida', 'comum', [2, 1], vez(2)),
      v('n', 'Neide', 'fofoqueira', [0, 2]), v('b', 'Bia', 'comum', [1, 2], vez(1)), v('u', 'Rui', 'comum', [2, 2], vez(3)),
    ],
    amizades: [['u', 'b'], ['u', 'c'], ['z', 'c'], ['z', 'd'], ['a', 'b'], ['a', 'c'], ['a', 'r'], ['a', 'd'], ['b', 'n'], ['n', 'r']],
    solucao: { r: 'n', b: 'a', a: 'c', c: 'u' },
  },
  {
    // a Bia (1) está na padaria até a 3: quem chega cedo perde o recado; a Neide abre o caminho longo
    titulo: 'Fila do pão',
    boato: 'O Seu Zé dá corda no relógio todo dia',
    giros: 0, setas: 4, origens: ['r'],
    vizinhos: [
      v('c', 'Cida', 'comum', [0, 0], vez(2)), v('d', 'Davi', 'comum', [1, 0]), v('n', 'Neide', 'fofoqueira', [2, 0]),
      v('b', 'Bia', 'comum', [0, 1], vez(1, 3)), v('a', 'Ana', 'comum', [1, 1]), v('r', 'Rita', 'comum', [2, 1]),
      ze([0, 2]), v('u', 'Rui', 'comum', [2, 2]),
    ],
    amizades: [['r', 'n'], ['r', 'a'], ['r', 'u'], ['z', 'b'], ['c', 'd'], ['c', 'b'], ['d', 'n'], ['d', 'a'], ['a', 'b']],
    solucao: { r: 'n', d: 'a', a: 'b', b: 'c' },
    armadilha: { r: 'a', a: 'b', b: 'c' }, // a Bia ainda está na padaria
  },
  {
    // ⚠️ substitui a O6 antiga (2026-11-12): era a O5 de novo (a 1ª da fila na padaria + a Neide espalhando), como a
    // régua de raciocínio (src/assinatura.ts) e o Fable apontaram. Aqui não tem Fofoqueira: quem está na padaria é o
    // Davi, no MEIO do caminho e colado no Zé. Direto, a Rita conta pra ele na 1 e perde; dando a volta (Rui, Bia), o
    // recado chega nele na 3, quando volta. Ele conta pra Lia (1) e ela pra Cida (2) — a Bia direto pra Cida inverte a fila.
    titulo: 'Café da tarde',
    boato: 'O Seu Zé esconde chocolate na caixa de remédio',
    giros: 0, setas: 5, origens: ['r'],
    vizinhos: [
      v('a', 'Ana', 'comum', [0, 0]), ze([1, 0]),
      v('e', 'Lia', 'comum', [0, 1], vez(1)), v('d', 'Davi', 'comum', [1, 1], { chega: 3 }), v('r', 'Rita', 'comum', [2, 1]),
      v('c', 'Cida', 'comum', [0, 2], vez(2)), v('b', 'Bia', 'comum', [1, 2]), v('n', 'Rui', 'comum', [2, 2]),
    ],
    amizades: [['z', 'a'], ['z', 'd'], ['r', 'd'], ['r', 'n'], ['a', 'e'], ['b', 'c'], ['b', 'd'], ['b', 'n'], ['c', 'e'], ['d', 'e']],
    solucao: { r: 'n', n: 'b', b: 'd', d: 'e', e: 'c' },
    armadilha: { r: 'd', d: 'e', e: 'c' }, // direto pro Davi: ele ainda está na padaria
  },
];
