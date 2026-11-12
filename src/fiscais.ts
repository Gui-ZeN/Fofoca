// Os outros três fiscais do condomínio (2026-11-12), cada um vítima com regra própria (rascunhos da Consulta 6):
//   Vera, a vigia (`vigia`): ESCUTA quando um vizinho de passagem CONTA algo pra outra pessoa. Receber e guardar
//     colado nela pode; falar, não. Raciocínio: onde o boato pode ser FALADO, não só por onde passa.
//   Dona Norma (`recolhe: N`): depois da batida N, quem mora colado nela não conta mais nada. Raciocínio: prazo —
//     a parte do caminho perto dela tem que acontecer cedo.
//   Dr. Álvaro (`teto: N`): no máximo N pessoas sabendo (contando a origem). Raciocínio: a Fofoqueira que resolve
//     rápido espalha demais; o caminho "econômico em gente" é outro.
// 3 fases cada, achadas com um buscador sobre o motor: solução única nas setas; sem a regra existe outra vitória, e
// ela (a armadilha) perde pelo motivo da regra. Protótipos: ?bloco=vera, ?bloco=norma, ?bloco=alvaro.
// ⚠️ Diferente de Arnaldo/Nonato/Raquel/Nando, as 3 fases de cada um NÃO foram desenhadas como reconhecer → desviar →
// usar de propósito: são três prédios em que a regra decide, em tamanho crescente. Rever antes de entrar na campanha.

import type { Vizinho } from './motor';
import type { FaseTrilho } from './trilho';

const v = (id: string, nome: string, tipo: Vizinho['tipo'], pos: [number, number], extra: Partial<Vizinho> = {}): Vizinho =>
  ({ id, nome, tipo, pos, ...extra });


export const fasesVera: FaseTrilho[] = [
  {
    titulo: 'De olho no corredor',
    boato: 'A Vera anota quem chega depois das dez',
    novidade: 'Vera: escuta quando um vizinho dela conta algo',
    giros: 0, setas: 3, origens: ['r'],
    vizinhos: [
      v('z', 'Vera', 'assunto', [1,2], { vigia: true }), v('r', 'Rita', 'comum', [1,0]), v('a', 'Ana', 'comum', [0,2], { interesse: {} }), v('b', 'Bia', 'comum', [2,1]), v('c', 'Cida', 'comum', [2,2]), v('d', 'Davi', 'comum', [1,1]), v('e', 'Edu', 'comum', [0,1]), v('u', 'Rui', 'comum', [0,0]),
    ],
    amizades: [['z', 'a'], ['z', 'c'], ['z', 'd'], ['r', 'd'], ['r', 'u'], ['a', 'e'], ['b', 'c'], ['d', 'e'], ['e', 'u']],
    solucao: { r: 'u', u: 'e', e: 'a' },
    armadilha: { r: 'd', d: 'e', e: 'a' },
  },
  {
    titulo: 'Paredes têm ouvidos',
    boato: 'A Vera sabe a senha do wi-fi de todo mundo',
    giros: 0, setas: 4, origens: ['r'],
    vizinhos: [
      v('z', 'Vera', 'assunto', [0,1], { vigia: true }), v('r', 'Rita', 'comum', [2,0]), v('a', 'Ana', 'comum', [2,2]), v('b', 'Bia', 'comum', [2,1]), v('c', 'Cida', 'comum', [0,2], { interesse: {} }), v('d', 'Davi', 'comum', [1,1]), v('e', 'Edu', 'comum', [1,0]), v('u', 'Rui', 'comum', [1,2]),
    ],
    amizades: [['z', 'c'], ['z', 'd'], ['r', 'b'], ['r', 'e'], ['a', 'b'], ['a', 'u'], ['b', 'd'], ['c', 'u'], ['d', 'e'], ['d', 'u']],
    solucao: { r: 'b', b: 'a', a: 'u', u: 'c' },
    armadilha: { r: 'b', b: 'd', d: 'u', u: 'c' },
  },
  {
    titulo: 'Na ponta do pé',
    boato: 'A Vera cochila de binóculo na mão',
    giros: 0, setas: 5, origens: ['r'],
    vizinhos: [
      v('z', 'Vera', 'assunto', [2,1], { vigia: true }), v('r', 'Rita', 'comum', [1,0]), v('a', 'Ana', 'comum', [0,0]), v('b', 'Bia', 'comum', [2,2], { interesse: {} }), v('c', 'Cida', 'comum', [1,1]), v('d', 'Davi', 'comum', [0,2]), v('e', 'Edu', 'comum', [0,1]), v('u', 'Rui', 'comum', [1,2]),
    ],
    amizades: [['z', 'b'], ['z', 'c'], ['r', 'a'], ['r', 'c'], ['a', 'e'], ['b', 'u'], ['c', 'e'], ['c', 'u'], ['d', 'e'], ['d', 'u']],
    solucao: { r: 'a', a: 'e', e: 'd', d: 'u', u: 'b' },
    armadilha: { r: 'c', c: 'u', u: 'b' },
  },
];

export const fasesNorma: FaseTrilho[] = [
  {
    titulo: 'Toque de recolher',
    boato: 'A Dona Norma multou o próprio capacho',
    novidade: 'Dona Norma: depois da hora, quem mora colado nela não conta mais nada',
    giros: 0, setas: 3, origens: ['r'],
    vizinhos: [
      v('z', 'Dona Norma', 'assunto', [2,1], { recolhe: 2 }), v('r', 'Rita', 'comum', [2,2]), v('a', 'Ana', 'comum', [0,0]), v('b', 'Bia', 'comum', [0,1], { interesse: {} }), v('c', 'Cida', 'comum', [1,1]), v('d', 'Davi', 'comum', [1,0]), v('e', 'Edu', 'comum', [0,2]), v('u', 'Rui', 'comum', [1,2]),
    ],
    amizades: [['z', 'r'], ['z', 'c'], ['r', 'u'], ['a', 'd'], ['b', 'c'], ['b', 'e'], ['c', 'd'], ['c', 'u'], ['e', 'u']],
    solucao: { r: 'u', u: 'e', e: 'b' },
    armadilha: { r: 'u', u: 'c', c: 'b' },
  },
  {
    titulo: 'Silêncio depois das dez',
    boato: 'A Dona Norma mede o volume da TV dos outros',
    giros: 0, setas: 4, origens: ['r'],
    vizinhos: [
      v('z', 'Dona Norma', 'assunto', [0,1], { recolhe: 2 }), v('r', 'Rita', 'comum', [0,2]), v('a', 'Ana', 'comum', [2,1]), v('b', 'Bia', 'comum', [1,2]), v('c', 'Cida', 'comum', [2,2]), v('d', 'Davi', 'comum', [2,0], { interesse: {} }), v('e', 'Edu', 'comum', [1,0]), v('u', 'Rui', 'comum', [1,1]),
    ],
    amizades: [['z', 'r'], ['z', 'u'], ['r', 'b'], ['a', 'c'], ['a', 'd'], ['a', 'u'], ['b', 'c'], ['b', 'u'], ['d', 'e'], ['e', 'u']],
    solucao: { r: 'b', b: 'c', c: 'a', a: 'd' },
    armadilha: { r: 'b', b: 'u', u: 'a', a: 'd' },
  },
  {
    titulo: 'Antes que ela apague a luz',
    boato: 'A Dona Norma plastificou o regimento interno',
    giros: 0, setas: 5, origens: ['r'],
    vizinhos: [
      v('z', 'Dona Norma', 'assunto', [2,1], { recolhe: 3 }), v('r', 'Rita', 'comum', [2,2]), v('a', 'Ana', 'comum', [1,1]), v('b', 'Bia', 'comum', [0,2]), v('c', 'Cida', 'comum', [1,0], { interesse: {} }), v('d', 'Davi', 'comum', [1,2]), v('e', 'Edu', 'comum', [0,1]), v('u', 'Rui', 'comum', [0,0]),
    ],
    amizades: [['z', 'r'], ['z', 'a'], ['r', 'd'], ['a', 'c'], ['a', 'e'], ['b', 'd'], ['b', 'e'], ['c', 'u'], ['e', 'u']],
    solucao: { r: 'd', d: 'b', b: 'e', e: 'u', u: 'c' },
    armadilha: { r: 'd', d: 'b', b: 'e', e: 'a', a: 'c' },
  },
];

export const fasesAlvaro: FaseTrilho[] = [
  {
    titulo: 'Lotação máxima',
    boato: 'O Dr. Álvaro numerou as vagas de bicicleta',
    novidade: 'Dr. Álvaro: só um número certo de pessoas pode ficar sabendo',
    giros: 0, setas: 3, origens: ['r'],
    vizinhos: [
      v('z', 'Dr. Álvaro', 'assunto', [1,2], { teto: 4 }), v('r', 'Rita', 'comum', [2,0]), v('a', 'Ana', 'comum', [1,1]), v('b', 'Bia', 'comum', [0,1], { interesse: {} }), v('c', 'Cida', 'comum', [2,1]), v('d', 'Davi', 'comum', [0,2]), v('e', 'Edu', 'comum', [0,0]), v('u', 'Neide', 'fofoqueira', [1,0]),
    ],
    amizades: [['z', 'a'], ['z', 'd'], ['r', 'c'], ['r', 'u'], ['a', 'b'], ['a', 'c'], ['a', 'u'], ['b', 'd'], ['b', 'e'], ['e', 'u']],
    solucao: { r: 'c', c: 'a', a: 'b' },
    armadilha: { r: 'u', e: 'b' },
  },
  {
    titulo: 'Assunto reservado',
    boato: 'O Dr. Álvaro pede firma reconhecida pra emprestar açúcar',
    giros: 0, setas: 4, origens: ['r'],
    vizinhos: [
      v('z', 'Dr. Álvaro', 'assunto', [1,2], { teto: 5 }), v('r', 'Rita', 'comum', [2,0]), v('a', 'Ana', 'comum', [0,0]), v('b', 'Bia', 'comum', [0,1]), v('c', 'Cida', 'comum', [0,2], { interesse: {} }), v('d', 'Davi', 'comum', [2,1]), v('e', 'Edu', 'comum', [1,1]), v('u', 'Neide', 'fofoqueira', [1,0]),
    ],
    amizades: [['z', 'c'], ['z', 'e'], ['r', 'd'], ['r', 'u'], ['a', 'u'], ['b', 'c'], ['b', 'e'], ['d', 'e'], ['e', 'u']],
    solucao: { r: 'd', d: 'e', e: 'b', b: 'c' },
    armadilha: { r: 'u', e: 'b', b: 'c' },
  },
  {
    titulo: 'Em sigilo',
    boato: 'O Dr. Álvaro assina até lista de compras',
    giros: 0, setas: 4, origens: ['r'],
    vizinhos: [
      v('z', 'Dr. Álvaro', 'assunto', [0,1], { teto: 5 }), v('r', 'Rita', 'comum', [0,0]), v('a', 'Ana', 'comum', [2,2], { interesse: {} }), v('b', 'Bia', 'comum', [1,0]), v('c', 'Cida', 'comum', [0,2]), v('d', 'Davi', 'comum', [1,1]), v('e', 'Edu', 'comum', [2,1]), v('u', 'Neide', 'fofoqueira', [1,2]),
    ],
    amizades: [['z', 'r'], ['z', 'c'], ['z', 'd'], ['r', 'b'], ['a', 'e'], ['a', 'u'], ['b', 'd'], ['c', 'u'], ['d', 'e'], ['d', 'u']],
    solucao: { r: 'b', b: 'd', d: 'e', e: 'a' },
    armadilha: { r: 'b', b: 'd', d: 'u' },
  },
];
