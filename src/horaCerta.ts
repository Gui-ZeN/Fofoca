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
    // ⚠️ o Zé desceu pro lado da Cida (2026-11-13, "o vilão é um pedaço de nada"): no canto de cima ele só tinha a Ana e ficava de enfeite. Agora
    // Rita → Ana → Davi → Zé → Cida também chega depois da volta, com as mesmas 4 setas; é ele que fecha esse caminho. A Bia ocupa o canto vazio.
    vizinhos: [
      v('b', 'Bia', 'comum', [0, 0]), v('a', 'Ana', 'comum', [1, 0]), v('r', 'Rita', 'comum', [2, 0]),
      v('d', 'Davi', 'comum', [1, 1]), v('u', 'Rui', 'comum', [2, 1]),
      ze([1, 2]), v('c', 'Cida', 'comum', [2, 2], { ...quer, chega: 3 }),
    ],
    amizades: [['b', 'a'], ['a', 'r'], ['a', 'd'], ['r', 'u'], ['d', 'u'], ['u', 'c'], ['d', 'z'], ['z', 'c']],
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
    // ⚠️ a Ana ganhou porta pra Cida (2026-11-13, "o vilão é um pedaço de nada"): Rita → Zé → Ana → Cida chegaria em 3 setas, sem passar
    // pelo Davi nem pela padaria. O Zé fecha esse atalho e obriga a dar a volta pela Neide.
    amizades: [['z', 'r'], ['z', 'a'], ['z', 'd'], ['r', 'e'], ['n', 'b'], ['n', 'e'], ['b', 'd'], ['c', 'd'], ['e', 'd'], ['a', 'c']],
    solucao: { r: 'e', e: 'n', b: 'd', d: 'c' },
    armadilha: { r: 'e', e: 'd', d: 'c' }, // o atalho chega no Davi na 2: ele ainda está na padaria
  },
  {
    // ⚠️ substitui "Volta às quatro" (2026-11-12), pelo mesmo motivo da H4. Aqui quem está na padaria é o Exagerado:
    // a Cida quer uma FOFOCA, e só o Beto aumenta — mas ele só volta na 3 (a Rita, colada nele, fala cedo demais).
    // A Neide espalha até a Ana, que conta pro Beto quando ele já voltou.
    // ⚠️ o prédio foi remontado em volta da Rita (2026-11-13, "o vilão é um pedaço de nada"): o Zé ficava embaixo, longe de tudo, e não atrapalhava
    // caminho nenhum. Agora a Neide, a Cida e o Zé moram colados na Rita, e a volta pelo Beto passa pela Bia e pela Ana (a Neide espalha até a Ana,
    // que conta pra Bia, que conta pro Beto já de volta). Rita → Zé → Davi → Neide (que espalha pro Beto, já de volta) também teria 4 setas; o Zé fecha esse caminho.
    titulo: 'Churrasco na garagem',
    boato: 'O Seu Zé conversa com o porteiro eletrônico',
    giros: 0, setas: 4, origens: ['r'],
    vizinhos: [
      v('a', 'Ana', 'comum', [2, 1]), v('o', 'Beto', 'exagerado', [1, 0], { chega: 3 }), v('b', 'Bia', 'comum', [2, 0]),
      v('n', 'Neide', 'fofoqueira', [1, 1]), v('r', 'Rita', 'comum', [0, 1]), v('c', 'Cida', 'comum', [0, 0], { interesse: { tamanho: 2 } }),
      v('d', 'Davi', 'comum', [1, 2]), ze([0, 2]),
    ],
    amizades: [['z', 'r'], ['z', 'd'], ['r', 'c'], ['r', 'n'], ['b', 'o'], ['n', 'd'], ['n', 'a'], ['o', 'n'], ['b', 'a'], ['o', 'c']],
    solucao: { r: 'n', a: 'b', b: 'o', o: 'c' },
    armadilha: { r: 'c' }, // direto: a Cida recebe cochicho e queria fofoca
  },
  {
    // ⚠️ substitui "Na hora do pão" (2026-11-12): era a mesma ideia da H5 (Zé fora, a Neide colada nele fala à vontade),
    // como o Fable apontou jogando. Aqui é celular + padaria: a Cida só volta na 4; pela porta (Davi, Edu) o recado
    // chega na 3 e se perde. O Davi passa pra Ana, a Ana pra Bia, e a Bia LIGA pra Cida — chega na 4, na hora.
    // ⚠️ o Zé foi pro canto, colado na Rita e na Neide (2026-11-13, "o vilão é um pedaço de nada"): no meio do prédio ele só atrapalhava um caminho
    // que ninguém tentava. Agora Rita → Davi → Neide (que espalha pra Bia) → Bia liga seria o atalho, uma seta mais curto; a Neide, colada no
    // Zé, vira perigo em vez de ajuda — por isso a solução cresceu de 3 pra 4 setas e a Neide não conta pra ninguém.
    titulo: 'Aniversário no 202',
    boato: 'O Seu Zé ensaia parabéns no chuveiro',
    giros: 0, setas: 4, origens: ['r'],
    vizinhos: [
      v('e', 'Edu', 'comum', [1, 0]), v('c', 'Cida', 'comum', [2, 0], { ...quer, chega: 4 }),
      v('r', 'Rita', 'comum', [0, 1]), v('d', 'Davi', 'comum', [1, 1]), v('a', 'Ana', 'comum', [2, 1]),
      ze([0, 2]), v('n', 'Neide', 'fofoqueira', [1, 2]), v('b', 'Bia', 'comum', [2, 2], { celular: ['c'] }),
    ],
    amizades: [['r', 'd'], ['d', 'a'], ['a', 'b'], ['e', 'd'], ['e', 'c'], ['c', 'a'], ['r', 'z'], ['z', 'n'], ['d', 'n'], ['n', 'b']],
    solucao: { r: 'd', d: 'a', a: 'b', b: 'c' },
    armadilha: { r: 'd', d: 'e', e: 'c' }, // pela porta: a Cida ainda está na padaria
  },
];
