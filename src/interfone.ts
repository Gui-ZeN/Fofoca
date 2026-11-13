// Bloco Interfone (protótipo, 2026-11-13): `interfones: [a, b][]` na fase liga dois apartamentos distantes.
// Os dois viram vizinhos pra todos os efeitos (seta, Fofoqueira, Arnaldo, Vera, Norma), MENOS o Nando, que só passa reto por porta/escada.
// Sem batida extra: contar pelo fio chega na mesma batida que contar pelo corredor. `porInterfone(fase, a, b)` diz se o laço é fio.
// Três fases, achadas com um buscador sobre o motor (_busca/interfone, fora do git); prédios largos, porque o fio só faz sentido com distância:
//   1. o fio ECONOMIZA: sem ele o caminho a pé custa uma seta a mais do que o jogador tem;
//   2. o fio é ARMADILHA: o atalho cai na Neide, que mora colada no Zé e conta pra todo mundo. A solução vai a pé;
//   3. dois fios: um leva à estrela, o outro à Neide. Tem que saber qual.
// ⚠️ O fio nunca é do Zé (ele não tem seta; ligar ele a alguém seria só "não toque"). Em I2/I3 a armadilha custa MENOS setas que a solução:
// é isso que a faz tentar. Sem o fio a jogada não existe, mas a solução de I2 continua a mesma (o fio só acrescenta uma saída que perde).

import type { Vizinho } from './motor';
import type { FaseTrilho } from './trilho';

const v = (id: string, nome: string, tipo: Vizinho['tipo'], pos: [number, number], extra: Partial<Vizinho> = {}): Vizinho =>
  ({ id, nome, tipo, pos, ...extra });
const ze = (pos: [number, number]) => v('z', 'Seu Zé', 'assunto', pos);

export const fasesInterfone: FaseTrilho[] = [
  {
    // 4×3. O Edu, ao lado da Rita, e a Bia, no outro canto, são amigos de interfone. Rita → Edu → Bia → Cida são 3 setas;
    // a pé (Rita → Lia → Davi → Ana → Cida) são 4, e o jogador só tem 3.
    titulo: 'Alô, é da portaria?',
    boato: 'O Seu Zé guarda o troco em vaso de planta',
    novidade: 'Interfone: dois apartamentos longe um do outro viram vizinhos',
    giros: 0, setas: 3, origens: ['r'],
    vizinhos: [
      v('a', 'Ana', 'comum', [0, 0]), v('d', 'Davi', 'comum', [1, 0]), v('i', 'Lia', 'comum', [2, 0]),
      v('s', 'Cida', 'comum', [0, 1], { interesse: {} }), v('r', 'Rita', 'comum', [2, 1]), v('e', 'Edu', 'comum', [3, 1]),
      v('b', 'Bia', 'comum', [0, 2]), ze([1, 2]), v('u', 'Rui', 'comum', [2, 2]), v('m', 'Marlene', 'comum', [3, 2]),
    ],
    amizades: [['i', 'r'], ['i', 'd'], ['e', 'r'], ['e', 'm'], ['r', 'u'], ['d', 'a'], ['u', 'm'], ['u', 'z'], ['s', 'a'], ['s', 'b'], ['b', 'z']],
    interfones: [['e', 'b']],
    solucao: { r: 'e', e: 'b', b: 's' },
    armadilha: { r: 'i', i: 'd', d: 'a', a: 's' }, // a pé: 4 setas, uma a mais do que há
  },
  {
    // 4×3. O fio liga o Davi à Neide, que mora colada no Zé e na Cida. Rita → Lia → Davi → Neide são 3 setas e a Cida
    // ouve dela, mas o Zé também (a Fofoqueira conta pra todo mundo). A pé: Rita → Lia → Davi → Rui → Cida, 4 setas.
    titulo: 'Linha cruzada',
    boato: 'O Seu Zé dá nome pra cada pé de alface',
    giros: 0, setas: 4, origens: ['r'],
    vizinhos: [
      v('d', 'Davi', 'comum', [0, 0]), v('u', 'Rui', 'comum', [1, 0]),
      v('i', 'Lia', 'comum', [0, 1]), v('s', 'Cida', 'comum', [1, 1], { interesse: {} }), v('n', 'Neide', 'fofoqueira', [2, 1]), v('b', 'Bia', 'comum', [3, 1]),
      v('r', 'Rita', 'comum', [0, 2]), ze([2, 2]), v('a', 'Ana', 'comum', [3, 2]),
    ],
    amizades: [['r', 'i'], ['i', 'd'], ['d', 'u'], ['u', 's'], ['n', 's'], ['n', 'z'], ['z', 'a']],
    interfones: [['n', 'd']],
    solucao: { r: 'i', i: 'd', d: 'u', u: 's' },
    armadilha: { r: 'i', i: 'd', d: 'n' }, // o fio leva o boato à Neide, que conta pra Cida e pro Zé
  },
  {
    // 5×4, dois fios. Neide–Ana e Marlene–Caio. Rita → Lia → Ana → Marlene → Caio (fio) → Cida: 5 setas, e o fio da Ana pra Neide
    // fica de lado. Quem pega o fio da Ana: Rita → Lia → Ana → Neide, 3 setas, e a Neide conta pro Zé.
    // ⚠️ nenhuma regra além da Fofoqueira: com os dois fios o andar já pede leitura (teto: Fofoqueira + 2 regras).
    titulo: 'Ramal errado',
    boato: 'O Seu Zé aluga a vaga e esquece de avisar',
    giros: 0, setas: 5, origens: ['r'],
    vizinhos: [
      v('n', 'Neide', 'fofoqueira', [0, 0]), v('s', 'Cida', 'comum', [1, 0], { interesse: {} }), v('j', 'Jandira', 'comum', [4, 0]),
      ze([0, 1]), v('k', 'Caio', 'comum', [1, 1]), v('d', 'Davi', 'comum', [2, 1]), v('v', 'Otávio', 'comum', [4, 1]),
      v('b', 'Bia', 'comum', [0, 2]), v('e', 'Edu', 'comum', [1, 2]), v('i', 'Lia', 'comum', [2, 2]), v('a', 'Ana', 'comum', [3, 2]), v('m', 'Marlene', 'comum', [4, 2]),
      v('u', 'Rui', 'comum', [3, 3]), v('r', 'Rita', 'comum', [2, 3]),
    ],
    amizades: [['s', 'n'], ['s', 'k'], ['j', 'v'], ['n', 'z'], ['b', 'e'], ['i', 'd'], ['i', 'r'], ['i', 'a'], ['k', 'e'], ['m', 'a'], ['m', 'v'], ['u', 'r']],
    interfones: [['n', 'a'], ['m', 'k']],
    solucao: { r: 'i', i: 'a', a: 'm', m: 'k', k: 's' },
    armadilha: { r: 'i', i: 'a', a: 'n' }, // o outro fio leva a Neide, e a Neide conta pro Zé
  },
];
