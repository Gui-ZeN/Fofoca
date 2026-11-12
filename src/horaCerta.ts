// Bloco "Hora certa": uma novidade só — quem está fora de casa até a batida N (`chega` no motor;
// recado que chega antes se perde). Consulta 3 (Astra + pesquisa + simulação, 2026-11-10): a regra que
// mais cria armadilha e já existia no motor. Prédios com voltas; cada fase tem uma solução e uma
// armadilha que o jogador "que aprendeu a T4" (não cutucar a Fofoqueira colada no Zé) ainda cai.
// H1 aquece só com as regras atuais; H2 estreia a padaria; H3 tira o Zé de casa; H4: o do meio do caminho na padaria; H5: o Exagerado na padaria; H6: com o celular. (Até 2026-11-12, H4–H6 eram
// todas "Zé fora, a Fofoqueira colada nele fala" — o Fable apontou a repetição jogando.)
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
    // ⚠️ substitui "Fala cedo, entrega tarde" (2026-11-12): era mais um "Zé fora, a Neide colada nele fala à vontade"
    // (H3–H6, D2 e D6 repetiam a ideia; crítica do Fable). Aqui o Zé fica em casa e quem está na padaria é o Davi,
    // no MEIO do caminho: pelo Edu ele recebe na 2 e perde. A Neide atrasa o recado — espalha, a Bia conta pro Davi
    // na 4, e ele já voltou.
    titulo: 'Pão quentinho',
    boato: 'O Seu Zé faz pão de queijo de madrugada',
    giros: 0, setas: 4, origens: ['r'],
    vizinhos: [
      v('r', 'Rita', 'comum', [0, 0]), ze([1, 0]), v('a', 'Ana', 'comum', [2, 0]),
      v('e', 'Edu', 'comum', [0, 1]), v('d', 'Davi', 'comum', [1, 1], { chega: 3 }), v('c', 'Cida', 'comum', [2, 1], quer),
      v('n', 'Neide', 'fofoqueira', [0, 2]), v('b', 'Bia', 'comum', [1, 2]),
    ],
    amizades: [['z', 'r'], ['z', 'a'], ['z', 'd'], ['r', 'e'], ['n', 'b'], ['n', 'e'], ['b', 'd'], ['c', 'd'], ['e', 'd']],
    solucao: { r: 'e', e: 'n', b: 'd', d: 'c' },
    armadilha: { r: 'e', e: 'd', d: 'c' }, // o atalho chega no Davi na 2: ele ainda está na padaria
  },
  {
    // ⚠️ substitui "Volta às quatro" (2026-11-12), pelo mesmo motivo da H4. Aqui quem está na padaria é o Exagerado:
    // a Cida quer uma FOFOCA, e só o Beto aumenta — mas ele só volta na 3 (a Rita, colada nele, fala cedo demais).
    // A Neide espalha até a Ana, que conta pro Beto quando ele já voltou.
    titulo: 'Churrasco na garagem',
    boato: 'O Seu Zé conversa com o porteiro eletrônico',
    giros: 0, setas: 4, origens: ['r'],
    vizinhos: [
      v('a', 'Ana', 'comum', [0, 0]), v('o', 'Beto', 'exagerado', [1, 0], { chega: 3 }), v('b', 'Bia', 'comum', [2, 0]),
      v('n', 'Neide', 'fofoqueira', [0, 1]), v('r', 'Rita', 'comum', [1, 1]), v('c', 'Cida', 'comum', [2, 1], { interesse: { tamanho: 2 } }),
      v('d', 'Davi', 'comum', [0, 2]), ze([1, 2]),
    ],
    amizades: [['z', 'r'], ['z', 'd'], ['r', 'c'], ['r', 'n'], ['r', 'o'], ['c', 'b'], ['b', 'o'], ['n', 'd'], ['n', 'a'], ['o', 'a']],
    solucao: { r: 'n', a: 'o', o: 'b', b: 'c' },
    armadilha: { r: 'c' }, // direto: a Cida recebe cochicho e queria fofoca
  },
  {
    // ⚠️ substitui "Na hora do pão" (2026-11-12): era a mesma ideia da H5 (Zé fora, a Neide colada nele fala à vontade),
    // como o Fable apontou jogando. Aqui é celular + padaria: a Cida só volta na 4; pela porta (Davi, Edu) o recado
    // chega na 3 e se perde. A Neide espalha, a Ana passa pra Bia, e a Bia LIGA pra Cida — chega na 4, na hora.
    titulo: 'Aniversário no 202',
    boato: 'O Seu Zé ensaia parabéns no chuveiro',
    giros: 0, setas: 3, origens: ['r'],
    vizinhos: [
      v('e', 'Edu', 'comum', [1, 0]), v('c', 'Cida', 'comum', [2, 0], { ...quer, chega: 4 }),
      v('r', 'Rita', 'comum', [0, 1]), v('d', 'Davi', 'comum', [1, 1]), ze([2, 1]),
      v('n', 'Neide', 'fofoqueira', [0, 2]), v('a', 'Ana', 'comum', [1, 2]), v('b', 'Bia', 'comum', [2, 2], { celular: ['c'] }),
    ],
    amizades: [['z', 'd'], ['z', 'c'], ['z', 'b'], ['r', 'n'], ['r', 'd'], ['a', 'n'], ['a', 'd'], ['a', 'b'], ['d', 'e'], ['c', 'e']],
    solucao: { r: 'n', a: 'b', b: 'c' },
    armadilha: { r: 'd', d: 'e', e: 'c' }, // pela porta: a Cida ainda está na padaria
  },
];
