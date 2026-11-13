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
    // ⚠️ o Zé subiu pro lado da Rita (2026-11-13, "o vilão é um pedaço de nada"): embaixo, só com o Davi, ele ficava de enfeite. Agora
    // Rita → Zé → Davi → Bia → Cida teria as mesmas 4 setas e a mesma ordem; é ele que fecha esse caminho. O Rui ocupa o lugar dele.
    vizinhos: [
      v('r', 'Rita', 'comum', [0, 0]), v('a', 'Ana', 'comum', [1, 0]), v('c', 'Cida', 'comum', [2, 0], vez(2)),
      ze([0, 1]), v('d', 'Davi', 'comum', [1, 1]), v('b', 'Bia', 'comum', [2, 1], vez(1)),
      v('u', 'Rui', 'comum', [1, 2]),
    ],
    amizades: [['r', 'a'], ['a', 'd'], ['a', 'c'], ['b', 'd'], ['b', 'c'], ['d', 'u'], ['z', 'r'], ['z', 'd']],
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
    // passar pelo Beto (Exagerado), que a Neide alcança, e voltar pelo Edu. A Cida (2) só depois.
    // ⚠️ o Zé e a Cida trocaram de lugar (2026-11-13, "o vilão é um pedaço de nada"): embaixo, só com a Ana e o Edu, ele ficava de enfeite. Agora
    // mora entre o Beto e a Bia: Neide → Beto → Zé → Bia teria o mesmo tamanho e as mesmas setas; é ele que fecha esse caminho. A Cida desceu e só
    // se alcança pela Ana (a Bia conta pra Ana, a Ana pra Cida) — uma seta a mais.
    titulo: 'Festa na laje',
    boato: 'O Seu Zé dança sozinho na cozinha',
    giros: 0, setas: 5, origens: ['r'],
    vizinhos: [
      v('n', 'Neide', 'fofoqueira', [0, 0]), v('o', 'Beto', 'exagerado', [1, 0]), v('c', 'Cida', 'comum', [1, 2], vez(2)),
      v('r', 'Rita', 'comum', [0, 1]), v('e', 'Edu', 'comum', [1, 1]), v('b', 'Bia', 'comum', [2, 1], { interesse: { ordem: 1, tamanho: 2 } }),
      ze([2, 0]), v('a', 'Ana', 'comum', [2, 2]),
    ],
    amizades: [['r', 'n'], ['r', 'e'], ['o', 'n'], ['o', 'e'], ['e', 'b'], ['a', 'c'], ['e', 'c'], ['o', 'z'], ['z', 'b'], ['b', 'a']],
    solucao: { r: 'n', o: 'e', e: 'b', b: 'a', a: 'c' },
    armadilha: { r: 'e', e: 'b', b: 'a', a: 'c' }, // o atalho: a Bia recebe cochicho e queria fofoca
  },
  {
    // três na fila; aqui a Neide abre: ela entrega a 1 e o resto segue em corrente
    titulo: 'Um, dois, três',
    boato: 'O Seu Zé coleciona ímã de geladeira',
    // ⚠️ o Zé foi pro canto de baixo e o Rui (3) subiu (2026-11-13, "o vilão é um pedaço de nada"): em cima, só com a Cida e o Davi, o Zé ficava de
    // enfeite. Agora Neide → Bia → Zé → Cida chegaria na mesma ordem com as mesmas setas; é ele que fecha o caminho, e a fila passa a dar a volta
    // pelo Davi (a Cida conta pro Davi e o Davi, pro Rui — 5 setas, uma a mais).
    giros: 0, setas: 5, origens: ['r'],
    vizinhos: [
      v('d', 'Davi', 'comum', [2, 0]), ze([2, 2]),
      v('r', 'Rita', 'comum', [0, 1]), v('a', 'Ana', 'comum', [1, 1]), v('c', 'Cida', 'comum', [2, 1], vez(2)),
      v('n', 'Neide', 'fofoqueira', [0, 2]), v('b', 'Bia', 'comum', [1, 2], vez(1)), v('u', 'Rui', 'comum', [1, 0], vez(3)),
    ],
    amizades: [['c', 'z'], ['a', 'b'], ['a', 'c'], ['a', 'r'], ['b', 'n'], ['n', 'r'], ['b', 'z'], ['d', 'c'], ['u', 'd'], ['u', 'a']],
    solucao: { r: 'n', b: 'a', a: 'c', c: 'd', d: 'u' },
  },
  {
    // a Bia (1) está na padaria até a 3: quem chega cedo perde o recado; a Neide abre o caminho longo
    titulo: 'Fila do pão',
    boato: 'O Seu Zé dá corda no relógio todo dia',
    giros: 0, setas: 4, origens: ['r'],
    // ⚠️ o Zé trocou de lugar com a Cida (2026-11-13, "o vilão é um pedaço de nada"): embaixo, só com a Bia, ele ficava de enfeite. Agora mora
    // em cima, colado no Davi e na Bia: Neide → Davi → Zé → Bia teria as mesmas 4 setas e a mesma espera; é ele que fecha esse caminho.
    // A Cida desceu e o Rui foi pro meio de baixo: pela Ana e pelo Rui ela ainda dá pra alcançar cedo demais (e perder a ordem).
    vizinhos: [
      v('c', 'Cida', 'comum', [0, 2], vez(2)), v('d', 'Davi', 'comum', [1, 0]), v('n', 'Neide', 'fofoqueira', [2, 0]),
      v('b', 'Bia', 'comum', [0, 1], vez(1, 3)), v('a', 'Ana', 'comum', [1, 1]), v('r', 'Rita', 'comum', [2, 1]),
      ze([0, 0]), v('u', 'Rui', 'comum', [1, 2]),
    ],
    amizades: [['r', 'n'], ['r', 'a'], ['z', 'b'], ['b', 'c'], ['d', 'n'], ['d', 'a'], ['a', 'b'], ['z', 'd'], ['a', 'u'], ['c', 'u']],
    solucao: { r: 'n', d: 'a', a: 'b', b: 'c' },
    armadilha: { r: 'a', a: 'b', b: 'c' }, // a Bia ainda está na padaria
  },
  {
    // ⚠️ substitui a O6 antiga (2026-11-12): era a O5 de novo (a 1ª da fila na padaria + a Neide espalhando), como a
    // régua de raciocínio (src/assinatura.ts) e o Fable apontaram. Aqui não tem Fofoqueira: quem está na padaria é o
    // Davi, no MEIO do caminho. Direto, a Rita conta pra ele na 1 e perde; dando a volta (Rui, Bia), o
    // recado chega nele na 3, quando volta. Ele conta pra Lia (1) e ela pra Cida (2) — a Bia direto pra Cida inverte a fila.
    // ⚠️ o Zé mudou de canto (2026-11-13, "o vilão é um pedaço de nada"): em cima do Davi ele só tinha a Ana e ficava de enfeite. Agora mora
    // colado na Rita e na Ana: Rita → Zé → Ana → Davi chegaria na 3, na volta dele, com as mesmas 5 setas. É o Zé que fecha esse caminho.
    titulo: 'Café da tarde',
    boato: 'O Seu Zé esconde chocolate na caixa de remédio',
    giros: 0, setas: 5, origens: ['r'],
    vizinhos: [
      v('a', 'Ana', 'comum', [1, 0]), ze([2, 0]),
      v('e', 'Lia', 'comum', [0, 1], vez(1)), v('d', 'Davi', 'comum', [1, 1], { chega: 3 }), v('r', 'Rita', 'comum', [2, 1]),
      v('c', 'Cida', 'comum', [0, 2], vez(2)), v('b', 'Bia', 'comum', [1, 2]), v('n', 'Rui', 'comum', [2, 2]),
    ],
    amizades: [['z', 'a'], ['a', 'd'], ['r', 'd'], ['r', 'n'], ['b', 'c'], ['b', 'd'], ['b', 'n'], ['c', 'e'], ['d', 'e'], ['z', 'r']],
    solucao: { r: 'n', n: 'b', b: 'd', d: 'e', e: 'c' },
    armadilha: { r: 'd', d: 'e', e: 'c' }, // direto pro Davi: ele ainda está na padaria
  },
];
