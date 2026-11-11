// Bloco "Hora certa": uma novidade só — quem está fora de casa até a batida N (`chega` no motor;
// recado que chega antes se perde). Consulta 3 (Astra + pesquisa + simulação, 2026-11-10): a regra que
// mais cria armadilha e já existia no motor. Prédios com voltas; cada fase tem uma solução e uma
// armadilha que o jogador "que aprendeu a T4" (não cutucar a Fofoqueira colada no Zé) ainda cai.
// H1 aquece só com as regras atuais; H2 estreia a padaria; H3 tira o Zé de casa; H4–H6 combinam com a Fofoqueira.
// Jogado numa sessão separada do teste trilho × giros (?bloco=hora).

import type { Vizinho } from './motor';
import type { FaseTrilho } from './trilho';

const v = (id: string, nome: string, tipo: Vizinho['tipo'], pos: [number, number], extra: Partial<Vizinho> = {}): Vizinho =>
  ({ id, nome, tipo, pos, ...extra });
const ze = (pos: [number, number], chega?: number) => v('z', 'Seu Zé', 'assunto', pos, chega ? { chega } : {});
const quer = { interesse: {} };

export const fasesHora: FaseTrilho[] = [
  {
    // a Lu parece segura (longe do Zé), mas é fofoqueira e conta pra Neide, que está colada nele
    titulo: 'Fofoca de segunda mão',
    boato: 'O Seu Zé dorme com o rádio ligado',
    giros: 0, setas: 3, origens: ['r'],
    vizinhos: [
      v('a', 'Ana', 'comum', [0, 0]), v('n', 'Neide', 'fofoqueira', [1, 0]), ze([2, 0]),
      v('r', 'Rita', 'comum', [0, 1]), v('l', 'Lu', 'fofoqueira', [1, 1]),
      v('d', 'Davi', 'comum', [0, 2]), v('u', 'Rui', 'comum', [1, 2]), v('c', 'Cida', 'comum', [2, 2], quer),
    ],
    amizades: [['a', 'n'], ['n', 'z'], ['a', 'r'], ['n', 'l'], ['r', 'l'], ['r', 'd'], ['l', 'u'], ['d', 'u'], ['u', 'c']],
    solucao: { r: 'd', d: 'u', u: 'c' },
    armadilha: { r: 'l', u: 'c' }, // a Lu conta pra Neide, a Neide conta pro Zé
  },
  {
    // o caminho curto chega na batida 2, e a Cida só volta na 3: tem que dar a volta
    titulo: 'Foi na padaria',
    boato: 'O Seu Zé chama o gato de senhor',
    novidade: 'Padaria: o recado que chegar antes do número da placa se perde',
    giros: 0, setas: 4, origens: ['r'],
    vizinhos: [
      ze([0, 0]), v('a', 'Ana', 'comum', [1, 0]), v('r', 'Rita', 'comum', [2, 0]),
      v('d', 'Davi', 'comum', [1, 1]), v('u', 'Rui', 'comum', [2, 1]),
      v('c', 'Cida', 'comum', [2, 2], { ...quer, chega: 3 }),
    ],
    amizades: [['z', 'a'], ['a', 'r'], ['a', 'd'], ['r', 'u'], ['d', 'u'], ['u', 'c']],
    solucao: { r: 'a', a: 'd', d: 'u', u: 'c' },
    armadilha: { r: 'u', u: 'c' }, // chega na 2: a Cida ainda está na padaria
  },
  {
    // o Zé só volta na 3: a Neide colada nele pode falar antes disso; a volta sem ela não cabe nas setas
    titulo: 'O Zé saiu',
    boato: 'O Seu Zé ensaia discurso pra reunião',
    giros: 0, setas: 2, origens: ['r'],
    vizinhos: [
      v('r', 'Rita', 'comum', [0, 0]), v('n', 'Neide', 'fofoqueira', [1, 0]), ze([2, 0], 3),
      v('a', 'Ana', 'comum', [0, 1]), v('d', 'Davi', 'comum', [1, 1]), v('c', 'Cida', 'comum', [2, 1], quer),
    ],
    amizades: [['r', 'n'], ['n', 'z'], ['n', 'd'], ['r', 'a'], ['a', 'd'], ['d', 'c']],
    solucao: { r: 'n', d: 'c' },
    armadilha: { r: 'a', a: 'd', d: 'c' }, // evitar a Neide custa 3 setas
  },
  {
    // fase do Astra (Consulta 3): falar cedo com a Neide (o Zé ainda não voltou) e entregar tarde (a Cida só chega na 4)
    titulo: 'Fala cedo, entrega tarde',
    boato: 'O Seu Zé perdeu no dominó pro neto',
    giros: 0, setas: 3, origens: ['r'],
    vizinhos: [
      v('a', 'Ana', 'comum', [0, 0]), v('r', 'Rita', 'comum', [1, 0]),
      v('b', 'Bia', 'comum', [0, 1]), v('n', 'Neide', 'fofoqueira', [1, 1]), ze([2, 1], 3),
      v('e', 'Edu', 'comum', [0, 2]), v('c', 'Cida', 'comum', [1, 2], { ...quer, chega: 4 }),
    ],
    amizades: [['a', 'r'], ['a', 'b'], ['r', 'n'], ['b', 'n'], ['n', 'z'], ['b', 'e'], ['n', 'c'], ['e', 'c']],
    solucao: { r: 'n', b: 'e', e: 'c' },
    armadilha: { r: 'a', a: 'b', b: 'n' }, // a Neide fala tarde demais: o Zé já voltou
  },
  {
    // a Neide fala antes do Zé e da Cida voltarem; a Cida tem que receber pelo outro lado, depois da 4
    titulo: 'Volta às quatro',
    boato: 'O Seu Zé conversa com o porteiro eletrônico',
    giros: 0, setas: 3, origens: ['r'],
    vizinhos: [
      v('a', 'Ana', 'comum', [0, 0]), ze([1, 0], 4), v('e', 'Edu', 'comum', [2, 0]),
      v('r', 'Rita', 'comum', [0, 1]), v('n', 'Neide', 'fofoqueira', [1, 1]), v('d', 'Davi', 'comum', [2, 1]),
      v('c', 'Cida', 'comum', [1, 2], { ...quer, chega: 4 }), v('b', 'Bia', 'comum', [2, 2], quer),
    ],
    amizades: [['a', 'r'], ['a', 'z'], ['n', 'c'], ['n', 'r'], ['n', 'z'], ['n', 'd'], ['c', 'b'], ['e', 'd'], ['d', 'b']],
    solucao: { r: 'n', d: 'b', b: 'c' },
    armadilha: { r: 'n', d: 'b' }, // a Neide conta pra Cida na 2, mas ela só volta na 4
  },
  {
    // duas estrelas: a Neide atende a Bia e "perde" o recado da Cida (fora até a 3), que recebe pela volta
    titulo: 'Na hora do pão',
    boato: 'O Seu Zé tem medo do aspirador',
    giros: 0, setas: 3, origens: ['r'],
    vizinhos: [
      ze([1, 0], 3), v('u', 'Rui', 'comum', [2, 0]),
      v('b', 'Bia', 'comum', [0, 1], quer), v('n', 'Neide', 'fofoqueira', [1, 1]), v('r', 'Rita', 'comum', [2, 1]),
      v('a', 'Ana', 'comum', [0, 2]), v('c', 'Cida', 'comum', [1, 2], { ...quer, chega: 3 }), v('d', 'Davi', 'comum', [2, 2]),
    ],
    amizades: [['a', 'b'], ['a', 'c'], ['r', 'n'], ['r', 'd'], ['r', 'u'], ['n', 'b'], ['n', 'c'], ['n', 'z'], ['u', 'z']],
    solucao: { r: 'n', b: 'a', a: 'c' },
    armadilha: { r: 'n' }, // a Neide conta pra Cida cedo demais
  },
];
