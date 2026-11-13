// Bloco "Saída" (2026-11-13): a padaria ao contrário. Hoje a padaria só tem um sentido (`chega`: a pessoa está FORA e
// VOLTA na batida N). Aqui o outro (`sai`): a pessoa está em casa e SAI na batida N — da batida N em diante não ouve
// nem conta mais nada; quem ouviu antes continua "ouviu". Protótipo fora da campanha (?bloco=saida), pra o dono decidir.
// Três usos, uma fase cada, achadas com um buscador sobre o motor (_busca/saida, fora do git):
//   1. a ESTRELA sai: vira prazo. O caminho que passa por duas fofoqueiras gasta as mesmas setas, mas chega depois
//      que ela saiu; só o caminho curto (que passa colado no Seu Zé, sem contar pra ele) chega a tempo;
//   2. o ZÉ sai: "segure o boato até ele sair". A Neide fala com o Zé e com a estrela ao mesmo tempo; a jogada certa
//      atrasa a Neide de propósito, dando a volta, pra ela só falar depois que o Zé saiu;
//   3. a PONTE fecha: o morador do meio sai antes de contar. O caminho curto passa por ele e trava; tem que contornar.
// ⚠️ Em todas, o `sai` só mexe em quem ouve/conta: sair nunca ajuda o boato (a estrela sair é ruim, o Zé sair é bom).

import type { Vizinho } from './motor';
import type { FaseTrilho } from './trilho';

const v = (id: string, nome: string, tipo: Vizinho['tipo'], pos: [number, number], extra: Partial<Vizinho> = {}): Vizinho =>
  ({ id, nome, tipo, pos, ...extra });
const ze = (pos: [number, number], extra: Partial<Vizinho> = {}) => v('z', 'Seu Zé', 'assunto', pos, extra);

export const fasesSaida: FaseTrilho[] = [
  {
    // a Cida sai na 4 (e mora colada no Zé). Rita→Ana→Bia→Cida chega na 3. Pelas fofoqueiras
    // (Rita→Neide→Lu→Ana→Bia→Cida) são as mesmas 3 setas, mas a Cida só ouve na 5 e já saiu.
    titulo: 'Antes da hora',
    boato: 'O Seu Zé guarda o troco em vaso de planta',
    novidade: 'Padaria: alguém sai de casa na batida marcada',
    giros: 0, setas: 3, origens: ['r'],
    vizinhos: [
      ze([0, 0]), v('s', 'Cida', 'comum', [0, 1], { interesse: {}, sai: 4 }),
      v('r', 'Rita', 'comum', [1, 1]), v('n', 'Neide', 'fofoqueira', [2, 1]),
      v('b', 'Bia', 'comum', [0, 2]), v('a', 'Ana', 'comum', [1, 2]), v('m', 'Lu', 'fofoqueira', [2, 2]),
    ],
    amizades: [['r', 'n'], ['r', 'a'], ['n', 'm'], ['z', 's'], ['s', 'b'], ['m', 'a'], ['a', 'b']],
    solucao: { r: 'a', a: 'b', b: 's' },
    armadilha: { r: 'n', a: 'b', b: 's' }, // a Cida só ouve na batida 5; saiu na 4
  },
  {
    // o Zé sai na 4. A Neide fala com ele e com a Cida juntas: ela tem que falar na 4 ou depois, ou seja,
    // ouvir na 3 ou depois. Rita→Davi→Neide chega nela na 2 e o Zé ouve na 3 (ainda em casa). A volta por Davi,
    // Bia e Ana faz a Neide ouvir na 4 e falar na 5.
    titulo: 'Espere o Seu Zé sair',
    boato: 'O Seu Zé conversa com a geladeira',
    giros: 0, setas: 4, origens: ['r'],
    vizinhos: [
      v('s', 'Cida', 'comum', [1, 0], { interesse: {} }),
      v('a', 'Ana', 'comum', [0, 1]), v('n', 'Neide', 'fofoqueira', [1, 1]), ze([2, 1], { sai: 4 }),
      v('b', 'Bia', 'comum', [0, 2]), v('c', 'Davi', 'comum', [1, 2]), v('r', 'Rita', 'comum', [2, 2]),
    ],
    amizades: [['r', 'z'], ['r', 'c'], ['n', 'z'], ['n', 's'], ['n', 'a'], ['n', 'c'], ['a', 'b'], ['b', 'c']],
    solucao: { r: 'c', c: 'b', b: 'a', a: 'n' },
    armadilha: { r: 'c', c: 'n' }, // a Neide fala na batida 3, o Zé ainda estava em casa
  },
  {
    // o Davi, no meio, sai na 3. Pelo meio (Rita→Ana→Davi→Cida) ele ouve na 2 e já saiu quando ia contar, na 3.
    // Pelo alto (Rita→Bia→Edu→Cida) são as mesmas 3 setas. A Neide mora colada no Zé e no Davi, e ninguém precisa dela.
    titulo: 'A ponte fecha',
    boato: 'O Seu Zé empresta o guarda-chuva e esquece',
    giros: 0, setas: 3, origens: ['r'],
    vizinhos: [
      v('d', 'Edu', 'comum', [0, 0]), v('b', 'Bia', 'comum', [1, 0]), v('r', 'Rita', 'comum', [2, 0]),
      v('s', 'Cida', 'comum', [0, 1], { interesse: {} }), v('c', 'Davi', 'comum', [1, 1], { sai: 3 }), v('a', 'Ana', 'comum', [2, 1]),
      ze([0, 2]), v('n', 'Neide', 'fofoqueira', [1, 2]),
    ],
    amizades: [['r', 'a'], ['r', 'b'], ['n', 'z'], ['n', 'c'], ['z', 's'], ['s', 'c'], ['s', 'd'], ['a', 'c'], ['b', 'c'], ['b', 'd']],
    solucao: { r: 'b', b: 'd', d: 's' },
    armadilha: { r: 'a', a: 'c', c: 's' }, // o Davi ouve na 2 e sai na 3, antes de contar
  },
];
