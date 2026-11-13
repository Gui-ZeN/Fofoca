// Bloco Boato que esfria (protótipo, 2026-11-13): `validade: N` na fase. Recado que chegaria numa batida MAIOR
// que N não é ouvido por ninguém (na batida N ainda vale) e a simulação para ali. `esfriou` no resultado lista quem ficou sem ouvir
// (só a 1ª leva) e a batida em que o recado chegaria.
// Três fases, achadas com um buscador sobre o motor (_busca/esfria, fora do git). Em todas o prazo é justo: na solução a última
// estrela ouve na batida N ou na N − 1, e a armadilha só perde por esfriar (sem a validade ela ganharia).
// ⚠️ A validade só pesa onde um caminho LENTO custa as mesmas setas de um rápido. Sem Fofoqueira, batida = seta, e o caminho comprido
// já estoura as `setas` sozinho (a validade seria enfeite). Com UMA Fofoqueira num prédio em grade não dá (a grade é bipartida: o
// desvio por ela custa uma batida a mais, nunca duas, e cabe no prazo). Por isso a estreia e a 3 têm DUAS Fofoqueiras coladas
// (Neide + Lu): o par é o desvio barato em seta e caro em tempo. Só a 2 usa uma, porque lá a Fofoqueira é o relógio ao contrário.

import type { Vizinho } from './motor';
import type { FaseTrilho } from './trilho';

const v = (id: string, nome: string, tipo: Vizinho['tipo'], pos: [number, number], extra: Partial<Vizinho> = {}): Vizinho =>
  ({ id, nome, tipo, pos, ...extra });
const ze = (pos: [number, number], extra: Partial<Vizinho> = {}) => v('z', 'Seu Zé', 'assunto', pos, extra);

export const fasesEsfria: FaseTrilho[] = [
  {
    // ensina: o prazo existe e a volta pelas Fofoqueiras (Neide → Lu) gasta as MESMAS 3 setas mas chega tarde.
    // Rita → Davi → Ana → Cida chega na 3 (prazo 4); o atalho pelo Zé (Davi → Zé → Cida) não serve; a volta pelas duas
    // Fofoqueiras faz a Ana ouvir na 4 e a Cida só na 5.
    titulo: 'Fofoca com prazo',
    boato: 'O Seu Zé guarda a chave na samambaia',
    novidade: 'O boato esfria: depois da batida marcada, ninguém mais quer ouvir',
    vizinhos: [
      v('l', 'Lu', 'fofoqueira', [0, 0]), v('a', 'Ana', 'comum', [1, 0]), v('c', 'Cida', 'comum', [2, 0], { interesse: {} }),
      v('n', 'Neide', 'fofoqueira', [0, 1]), v('d', 'Davi', 'comum', [1, 1]), ze([2, 1]), v('y', 'Rui', 'comum', [3, 1]),
      v('i', 'Lia', 'comum', [0, 2]), v('r', 'Rita', 'comum', [1, 2]), v('b', 'Bia', 'comum', [2, 2]),
    ],
    amizades: [['z', 'c'], ['z', 'd'], ['z', 'b'], ['z', 'y'], ['c', 'a'], ['a', 'd'], ['a', 'l'], ['d', 'n'], ['d', 'r'], ['n', 'i'], ['n', 'l']],
    giros: 0, setas: 3, origens: ['r'], validade: 4,
    solucao: { r: 'd', d: 'a', a: 'c' },
    armadilha: { r: 'd', d: 'n', a: 'c' }, // a Cida ouviria na 5; o boato esfriou na 4
  },
  {
    // ensina: com duas estrelas, passar por uma pra chegar na outra (Bia → Cida) estoura o prazo. A Neide espalha pras duas
    // frentes na mesma batida (Ana e Marlene ouvem juntas), mas a Ana mora colada no Zé e a Rita também: a Neide é o relógio e o risco.
    titulo: 'A Neide marca o tempo',
    boato: 'O Seu Zé coleciona tampinha de garrafa',
    vizinhos: [
      v('y', 'Rui', 'comum', [0, 0]), v('c', 'Cida', 'comum', [1, 0], { interesse: {} }), ze([2, 0]), v('r', 'Rita', 'comum', [3, 0]),
      v('d', 'Davi', 'comum', [0, 1]), v('k', 'Caio', 'comum', [1, 1]), v('a', 'Ana', 'comum', [2, 1]), v('n', 'Neide', 'fofoqueira', [3, 1]),
      v('e', 'Edu', 'comum', [0, 2]), v('b', 'Bia', 'comum', [1, 2], { interesse: {} }), v('i', 'Lia', 'comum', [2, 2]), v('m', 'Marlene', 'comum', [3, 2]),
    ],
    amizades: [['z', 'a'], ['z', 'r'], ['z', 'c'], ['a', 'n'], ['a', 'i'], ['a', 'k'], ['r', 'n'], ['d', 'y'], ['d', 'e'], ['d', 'k'], ['n', 'm'], ['b', 'i'], ['b', 'e'], ['b', 'k'], ['y', 'c'], ['c', 'k'], ['i', 'm']],
    giros: 0, setas: 5, origens: ['r'], validade: 5,
    solucao: { r: 'n', a: 'k', m: 'i', i: 'b', k: 'c' },
    armadilha: { r: 'n', m: 'i', i: 'b', b: 'k', k: 'c' }, // uma frente só: passa pela Bia e a Cida ouviria na 6
  },
  {
    // ensina: prazo + Vera. Rita → Otávio → Marlene → Lia → Cida chega na 4 (prazo 5). Rita → Caio → Marlene teria o mesmo tamanho,
    // mas o Caio mora colado na Vera, que escuta o recado dele (ela ouve na 2); a volta pelas Fofoqueiras (Marlene → Lu → Neide →
    // Jandira) gasta as mesmas setas e a Cida só ouviria na 6.
    titulo: 'A Vera e o relógio',
    boato: 'A Vera ensaia discurso pro espelho',
    vizinhos: [
      v('r', 'Rita', 'comum', [1, 0]), v('v', 'Otávio', 'comum', [2, 0]), v('d', 'Davi', 'comum', [3, 0]),
      v('z', 'Vera', 'assunto', [0, 1], { vigia: true }), v('k', 'Caio', 'comum', [1, 1]), v('m', 'Marlene', 'comum', [2, 1]), v('i', 'Lia', 'comum', [3, 1]), v('c', 'Cida', 'comum', [4, 1], { interesse: {} }),
      v('y', 'Rui', 'comum', [0, 2]), v('l', 'Lu', 'fofoqueira', [2, 2]), v('n', 'Neide', 'fofoqueira', [3, 2]), v('j', 'Jandira', 'comum', [4, 2]),
      v('b', 'Bia', 'comum', [0, 3]), v('e', 'Edu', 'comum', [1, 3]), v('a', 'Ana', 'comum', [4, 3]),
    ],
    amizades: [['z', 'y'], ['z', 'k'], ['a', 'j'], ['d', 'v'], ['c', 'i'], ['c', 'j'], ['b', 'y'], ['b', 'e'], ['i', 'm'], ['i', 'n'], ['m', 'k'], ['m', 'l'], ['m', 'v'], ['k', 'r'], ['r', 'v'], ['n', 'j'], ['n', 'l']],
    giros: 0, setas: 4, origens: ['r'], validade: 5,
    solucao: { r: 'v', v: 'm', m: 'i', i: 'c' },
    armadilha: { r: 'v', v: 'm', m: 'l', j: 'c' }, // Lu → Neide → Jandira → Cida: a Cida ouviria na 6
  },
];
