// Bloco "Duplas" (2026-11-12): fases em que DOIS personagens com regra conversam (pedido do dono: "fases com
// múltiplos personagens especiais… pra ser mais legal"). Uma fase por combinação que cria decisão de verdade; em
// todas, cada regra presente muda a jogada (conferido pelo buscador e pelo teste). Protótipo: ?bloco=duplas.
//   1. Fofoqueira + Nando: ela espalha pra todo lado e um dos recados atinge o Nando — por qual lado?
//   2. Nando + Raquel: o Nando, que passa sozinho, é uma das duas fontes de que a Raquel precisa;
//   3. Vera + Raquel: juntar dois galhos na Raquel sem ninguém contar nada do lado da vigia.
// ⚠️ Cabem no teto de leitura (Fofoqueira + 2 regras). Três regras juntas, só se um dia o teste com pessoas pedir.

import type { Vizinho } from './motor';
import type { FaseTrilho } from './trilho';

const v = (id: string, nome: string, tipo: Vizinho['tipo'], pos: [number, number], extra: Partial<Vizinho> = {}): Vizinho =>
  ({ id, nome, tipo, pos, ...extra });

export const fasesDuplas: FaseTrilho[] = [
  // Fofoqueira + Nando
  {
    titulo: 'Bola de bilhar',
    boato: 'O Seu Zé perde na sinuca pro próprio taco', // ⚠️ sem adjetivo com gênero: a vítima pode ser sorteada
    novidade: 'Duplas: duas regras na mesma fase',
    giros: 0, setas: 5, origens: ['r'],
    vizinhos: [
      v('z', 'Seu Zé', 'assunto', [1,1]), v('r', 'Rita', 'comum', [0,0]), v('n', 'Neide', 'fofoqueira', [0,2]), v('p', 'Nando', 'apressado', [1,2]), v('a', 'Ana', 'comum', [2,2]), v('b', 'Bia', 'comum', [1,0], { interesse: {} }), v('c', 'Cida', 'comum', [2,0]), v('d', 'Davi', 'comum', [0,1]), v('e', 'Edu', 'comum', [2,1]),
    ],
    amizades: [['z', 'd'], ['z', 'e'], ['r', 'd'], ['n', 'p'], ['n', 'd'], ['p', 'a'], ['a', 'e'], ['b', 'c'], ['c', 'e']],
    solucao: { r: 'd', d: 'n', a: 'e', e: 'c', c: 'b' },
    armadilha: { r: 'd', d: 'n', a: 'e', e: 'z' },
  },
  // Nando + Raquel
  {
    titulo: 'Testemunha apressada',
    boato: 'O Seu Zé tem medo de elevador',
    giros: 0, setas: 4, origens: ['r'],
    vizinhos: [
      v('z', 'Seu Zé', 'assunto', [2,2]), v('r', 'Rita', 'comum', [2,0]), v('n', 'Neide', 'fofoqueira', [1,0]), v('p', 'Nando', 'apressado', [0,1]), v('q', 'Raquel', 'comum', [0,2], { interesse: {}, desconfia: true }), v('a', 'Ana', 'comum', [2,3]), v('b', 'Bia', 'comum', [1,2]), v('c', 'Cida', 'comum', [2,1]), v('d', 'Davi', 'comum', [0,0]), v('e', 'Edu', 'comum', [1,1]),
    ],
    amizades: [['z', 'a'], ['z', 'b'], ['r', 'n'], ['r', 'c'], ['n', 'd'], ['n', 'e'], ['p', 'q'], ['p', 'd'], ['p', 'e'], ['q', 'b'], ['b', 'e'], ['c', 'e']],
    solucao: { r: 'n', d: 'p', e: 'b', b: 'q' },
    armadilha: { r: 'n', d: 'p' },
  },
  // Vera + Raquel
  {
    titulo: 'Duas bocas, um ouvido',
    boato: 'A Vera anota a placa de quem estaciona torto',
    giros: 0, setas: 4, origens: ['r'],
    vizinhos: [
      v('z', 'Vera', 'assunto', [1,0], { vigia: true }), v('r', 'Rita', 'comum', [2,1]), v('n', 'Neide', 'fofoqueira', [1,2]), v('q', 'Raquel', 'comum', [0,3], { interesse: {}, desconfia: true }), v('a', 'Ana', 'comum', [2,2]), v('b', 'Bia', 'comum', [2,0]), v('c', 'Cida', 'comum', [1,3]), v('d', 'Davi', 'comum', [0,2]), v('e', 'Edu', 'comum', [1,1]),
    ],
    amizades: [['z', 'b'], ['z', 'e'], ['r', 'a'], ['r', 'b'], ['r', 'e'], ['n', 'a'], ['n', 'c'], ['n', 'd'], ['n', 'e'], ['q', 'c'], ['q', 'd']],
    solucao: { r: 'a', a: 'n', c: 'q', d: 'q' },
    armadilha: { r: 'a', a: 'n', d: 'q' },
  },
];
