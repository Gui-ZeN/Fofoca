// Os outros três fiscais do condomínio (2026-11-12), cada um vítima com regra própria (rascunhos da Consulta 6):
//   Vera, a vigia (`vigia`): ESCUTA quando um vizinho de passagem CONTA algo pra outra pessoa. Receber e guardar
//     colado nela pode; falar, não. Raciocínio: onde o boato pode ser FALADO, não só por onde passa.
//   Dona Norma (`recolhe: N`): depois da batida N, quem mora colado nela não conta mais nada. Raciocínio: prazo —
//     a parte do caminho perto dela tem que acontecer cedo.
//   Dr. Álvaro (`teto: N`): no máximo N pessoas sabendo (contando a origem). Raciocínio: a Fofoqueira que resolve
//     rápido espalha demais; o caminho "econômico em gente" é outro.
// 3 fases cada, achadas com um buscador sobre o motor: solução única nas setas; sem a regra existe outra vitória, e
// ela (a armadilha) perde pelo motivo da regra. Protótipos: ?bloco=vera, ?bloco=norma, ?bloco=alvaro.
// As duas primeiras fases de cada um são "a regra atrapalha" (reconhecer, desviar); a 3ª é "usar de propósito":
// a regra vira ferramenta (ver o comentário de cada uma). Pedido da Consulta 8 (Astra): sem isso os fiscais eram só
// regiões proibidas, e o Dr. Álvaro repetia "desvie da Fofoqueira".

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
  // usar de propósito: a estrela mora COLADA na Vera — receber e guardar do lado dela pode; o último a falar não pode ser vizinho dela
  {
    titulo: 'Na ponta do pé',
    boato: 'A Vera cochila de binóculo na mão',
    giros: 0, setas: 4, origens: ['r'],
    vizinhos: [
      v('z', 'Vera', 'assunto', [1,0], { vigia: true }), v('r', 'Rita', 'comum', [0,1]), v('n', 'Neide', 'fofoqueira', [2,1]), v('a', 'Ana', 'comum', [0,2]), v('b', 'Bia', 'comum', [1,2]), v('c', 'Cida', 'comum', [2,2]), v('d', 'Davi', 'comum', [2,0], { interesse: {} }), v('e', 'Edu', 'comum', [1,1]),
    ],
    amizades: [['z', 'd'], ['z', 'e'], ['r', 'a'], ['n', 'c'], ['n', 'd'], ['n', 'e'], ['a', 'b'], ['b', 'c'], ['b', 'e']],
    solucao: { r: 'a', a: 'b', b: 'c', c: 'n' },
    armadilha: { r: 'a', a: 'b', b: 'e', e: 'n' },
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
  // usar de propósito: uma Fofoqueira colada na Dona Norma OUVE na solução — tarde o bastante pra já estar calada (cedo, ela contaria pra Norma)
  {
    titulo: 'Depois que ela apaga a luz',
    boato: 'A Dona Norma plastificou o regimento interno',
    giros: 0, setas: 3, origens: ['r'],
    vizinhos: [
      v('z', 'Dona Norma', 'assunto', [2,1], { recolhe: 3 }), v('r', 'Rita', 'comum', [1,0]), v('n', 'Neide', 'fofoqueira', [0,1]), v('l', 'Lu', 'fofoqueira', [1,1]), v('a', 'Ana', 'comum', [1,2], { interesse: {} }), v('b', 'Bia', 'comum', [2,2]), v('c', 'Cida', 'comum', [0,2]), v('d', 'Davi', 'comum', [0,0]),
    ],
    amizades: [['z', 'l'], ['z', 'b'], ['r', 'l'], ['r', 'd'], ['n', 'l'], ['n', 'c'], ['n', 'd'], ['a', 'b'], ['a', 'c']],
    solucao: { r: 'd', d: 'n', c: 'a' },
    armadilha: { r: 'l', c: 'a' },
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
  // ⚠️ o Dr. Álvaro NÃO ganhou fase de "usar de propósito": com a Fofoqueira na solução ela sai em 1–2 setas e a lotação
  // deixa de decidir (busca de 2026-11-12, zero candidatos com 3+ setas). As três dele seguem sendo "desvie da Neide" —
  // é o motivo de o Astra sugerir adiar esse fiscal.
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
