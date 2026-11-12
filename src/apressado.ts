// Bloco "Apressado" (2026-11-12): o Nando. Não aceita seta; conta sozinho pra quem mora do lado OPOSTO de quem
// contou pra ele (ouviu da esquerda, conta pra direita; de baixo, pra cima). Sem passagem do outro lado, guarda.
// Veio do estudo do Fable (Sporos): é a única regra em que o LADO por onde o boato entra decide pra onde sai.
// Três fases, cada uma com uma função:
//   1. reconhecer: entrando pela esquerda, ele passa reto pra estrela — economiza seta;
//   2. desviar: a Rita conta direto pra ele (de baixo), e ele sobe reto pro Zé; tem que dar a volta;
//   3. usar de propósito: só ele chega na estrela; pela esquerda ele manda pro Zé, por cima ele desce pra Ana.
// Achadas com um buscador sobre o motor (solução única nas setas; com o Nando comum a jogada muda; a armadilha
// vence se o Zé não existisse e perde porque o Nando passou reto pra ele). Jogado em ?bloco=apressado.

import type { Vizinho } from './motor';
import type { FaseTrilho } from './trilho';

const v = (id: string, nome: string, tipo: Vizinho['tipo'], pos: [number, number], extra: Partial<Vizinho> = {}): Vizinho =>
  ({ id, nome, tipo, pos, ...extra });
const ze = (pos: [number, number]) => v('z', 'Seu Zé', 'assunto', pos);
const nando = (pos: [number, number]) => v('p', 'Nando', 'apressado', pos);
const quer = { interesse: {} };

export const fasesApressado: FaseTrilho[] = [
  {
    // o Edu conta pro Nando pela esquerda, e ele passa reto pra Bia — três setas em vez de quatro
    titulo: 'Passa reto',
    boato: 'O Seu Zé corre de meia na esteira',
    novidade: 'Nando: conta sozinho pra quem está do outro lado',
    giros: 0, setas: 3, origens: ['r'],
    vizinhos: [
      v('r', 'Rita', 'comum', [0, 0]), ze([1, 0]),
      v('c', 'Ana', 'comum', [0, 1]), v('d', 'Davi', 'comum', [1, 1]), v('a', 'Lia', 'comum', [2, 1]),
      v('e', 'Edu', 'comum', [0, 2]), nando([1, 2]), v('b', 'Bia', 'comum', [2, 2], quer),
    ],
    amizades: [['p', 'b'], ['p', 'd'], ['p', 'e'], ['z', 'r'], ['z', 'd'], ['r', 'c'], ['a', 'b'], ['a', 'd'], ['c', 'd'], ['c', 'e']],
    solucao: { r: 'c', c: 'e', e: 'p' },
    armadilha: { r: 'c', c: 'd', d: 'p' }, // por cima, ele passa reto pra baixo — e embaixo não tem ninguém
  },
  {
    // contar direto pro Nando (de baixo) faz ele subir reto até o Zé; a volta é pela esquerda
    titulo: 'Corrida no corredor',
    boato: 'O Seu Zé treina pra maratona do bairro',
    giros: 0, setas: 3, origens: ['r'],
    vizinhos: [
      v('a', 'Cida', 'comum', [0, 0], quer), ze([1, 0]), v('c', 'Rui', 'comum', [2, 0]),
      v('b', 'Bia', 'comum', [0, 1]), nando([1, 1]), v('e', 'Edu', 'comum', [2, 1]),
      v('d', 'Davi', 'comum', [0, 2]), v('r', 'Rita', 'comum', [1, 2]),
    ],
    amizades: [['p', 'z'], ['p', 'r'], ['p', 'b'], ['p', 'e'], ['z', 'a'], ['z', 'c'], ['r', 'd'], ['a', 'b'], ['b', 'd'], ['c', 'e']],
    solucao: { r: 'd', d: 'b', b: 'a' },
    armadilha: { r: 'p' }, // ele ouve de baixo e sobe reto pro Zé
  },
  {
    // só o Nando chega na Cida (pela Ana): pela esquerda ele manda pro Zé; por cima (Bia) ele desce pra Ana
    titulo: 'Entrou por onde?',
    boato: 'O Seu Zé leva o cachorro pra passear de carro',
    giros: 0, setas: 4, origens: ['r'],
    vizinhos: [
      v('e', 'Edu', 'comum', [0, 0]), v('b', 'Bia', 'comum', [1, 0]),
      v('r', 'Rita', 'comum', [0, 1]), nando([1, 1]), ze([2, 1]),
      v('d', 'Davi', 'comum', [0, 2]), v('a', 'Ana', 'comum', [1, 2]), v('c', 'Cida', 'comum', [2, 2], quer),
    ],
    amizades: [['p', 'z'], ['p', 'r'], ['p', 'a'], ['p', 'b'], ['z', 'c'], ['r', 'd'], ['r', 'e'], ['a', 'c'], ['b', 'e']],
    solucao: { r: 'e', e: 'b', b: 'p', a: 'c' },
    armadilha: { r: 'p', a: 'c' }, // pela esquerda: ele passa reto pro Zé
  },
];
