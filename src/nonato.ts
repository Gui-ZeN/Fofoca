// Bloco "Nonato" (Consulta 6): o Do Contra. Ele conta tudo AO CONTRÁRIO (inverte a versão ao contar, não ao
// ouvir; `docontra` no motor). A estrela declara a versão que quer — sem isso ela aceita qualquer uma e ele não
// muda nada (motor.ts, avaliar). Três fases, cada uma com uma função:
//   1. desviar: a estrela quer a versão certa e o caminho curto passa pelo Nonato;
//   2. usar de propósito: a estrela só acredita na versão ao contrário — tem que passar por ele;
//   3. acompanhar a troca: uma estrela quer a certa e a outra a ao contrário; a ordem do caminho decide.
// ⚠️ O passo "dois Do Contra seguidos desfazem a troca" (Sol) precisa de um 2º personagem do contra; só existe
// o desenho do Nonato. Fica pra quando houver outro.
// Jogado numa sessão separada (?bloco=nonato), fora da campanha.

import type { Vizinho } from './motor';
import type { FaseTrilho } from './trilho';

const v = (id: string, nome: string, tipo: Vizinho['tipo'], pos: [number, number], extra: Partial<Vizinho> = {}): Vizinho =>
  ({ id, nome, tipo, pos, ...extra });
const ze = (pos: [number, number]) => v('z', 'Seu Zé', 'assunto', pos);
const nonato = (pos: [number, number]) => v('n', 'Nonato', 'docontra', pos);
const quer = (versao: 'normal' | 'invertida'): Partial<Vizinho> => ({ interesse: { versao } });

export const fasesNonato: FaseTrilho[] = [
  {
    // dois caminhos de três setas: pelo Nonato a Cida ouve ao contrário e não acredita; pela Ana e pelo Davi, chega certa
    titulo: 'O do contra',
    boato: 'O Seu Zé fala com as plantas',
    novidade: 'Nonato: conta tudo ao contrário',
    giros: 0, setas: 3, origens: ['r'],
    vizinhos: [
      v('r', 'Rita', 'comum', [0, 0]), nonato([1, 0]), v('b', 'Bia', 'comum', [2, 0]),
      v('a', 'Ana', 'comum', [0, 1]), v('d', 'Davi', 'comum', [1, 1]), v('c', 'Cida', 'comum', [2, 1], quer('normal')),
      ze([1, 2]),
    ],
    amizades: [['r', 'n'], ['n', 'b'], ['b', 'c'], ['r', 'a'], ['a', 'd'], ['d', 'c'], ['d', 'z']],
    solucao: { r: 'a', a: 'd', d: 'c' },
    armadilha: { r: 'n', n: 'b', b: 'c' }, // mesmo tamanho de caminho, mas chega ao contrário
  },
  {
    // a Lia só acredita na versão ao contrário: o atalho pela Ana entrega a certa; tem que dar a volta pelo Nonato
    titulo: 'Do avesso',
    boato: 'O Seu Zé ronca de olho aberto',
    giros: 0, setas: 4, origens: ['r'],
    vizinhos: [
      v('r', 'Rita', 'comum', [0, 0]), v('a', 'Ana', 'comum', [1, 0]), v('c', 'Lia', 'comum', [2, 0], quer('invertida')),
      v('d', 'Davi', 'comum', [0, 1]), nonato([1, 1]), v('e', 'Edu', 'comum', [2, 1]),
      ze([0, 2]), v('u', 'Rui', 'comum', [1, 2]),
    ],
    amizades: [['r', 'a'], ['a', 'c'], ['a', 'n'], ['n', 'e'], ['e', 'c'], ['r', 'd'], ['d', 'z'], ['n', 'u'], ['u', 'z']],
    solucao: { r: 'a', a: 'n', n: 'e', e: 'c' },
    armadilha: { r: 'a', a: 'c' }, // o atalho: chega a versão certa, e a Lia não acredita
  },
  {
    // a Cida quer a certa e a Bia a ao contrário: a corrente tem que passar pela Cida ANTES do Nonato
    titulo: 'Cada um com a sua',
    boato: 'O Seu Zé torce pros dois times',
    giros: 0, setas: 4, origens: ['r'],
    vizinhos: [
      v('r', 'Rita', 'comum', [0, 0]), v('c', 'Cida', 'comum', [1, 0], quer('normal')), v('a', 'Ana', 'comum', [2, 0]),
      v('d', 'Davi', 'comum', [0, 1]), nonato([1, 1]), v('e', 'Edu', 'comum', [2, 1]),
      ze([0, 2]), v('u', 'Rui', 'comum', [1, 2]), v('b', 'Bia', 'comum', [2, 2], quer('invertida')),
    ],
    amizades: [['r', 'c'], ['c', 'n'], ['n', 'u'], ['u', 'b'], ['r', 'd'], ['d', 'z'], ['d', 'n'], ['c', 'a'], ['a', 'e'], ['e', 'b'], ['u', 'z']],
    solucao: { r: 'c', c: 'n', n: 'u', u: 'b' },
    armadilha: { r: 'c', c: 'a', a: 'e', e: 'b' }, // ninguém inverte: a Bia ouve a certa
  },
];
