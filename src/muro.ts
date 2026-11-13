// Bloco Muro fino (protótipo, 2026-11-13): `murosFinos: [a, b][]`, cômodos colados SEM passagem. Quando um do par
// CONTA com tamanho 3 (já com +1 do Exagerado e −1 do Arnaldo) pra qualquer pessoa, o outro ouve NA MESMA batida, mesmo tamanho e versão
// (mensagem extra com `vazou`). Vale nos dois sentidos; vítima ouvindo pelo muro = derrota. Só escândalo vaza, e o vazamento não vaza de novo.
// Três fases, achadas com um buscador sobre o motor (_busca/muro, fora do git). A pergunta de todas: ONDE o boato vira escândalo?
//   1. o muro como PERIGO: o caminho curto deixa o escândalo nascer ANTES de passar pelo Beto, colado no Zé;
//   2. o muro como ATALHO: a Cida só tem uma porta (que entrega cochicho); o escândalo contado pela Lúcia vaza pra ela pela parede;
//   3. os dois juntos: um muro entrega a vítima (o Rui), o outro leva a estrela (o Caio).
// ⚠️ Nas fases 2 e 3 a última seta (Lúcia → Beto, Caio → Beto) é pra alguém que JÁ sabe: não leva o boato a ninguém, só faz quem está
// colado no muro CONTAR o escândalo. É o jeito de usar o muro; a tela mostra o vazamento, não precisa de regra a mais.

import type { Vizinho } from './motor';
import type { FaseTrilho } from './trilho';

const v = (id: string, nome: string, tipo: Vizinho['tipo'], pos: [number, number], extra: Partial<Vizinho> = {}): Vizinho =>
  ({ id, nome, tipo, pos, ...extra });
const ze = (pos: [number, number]) => v('z', 'Seu Zé', 'assunto', pos);
const escandalo = { interesse: { tamanho: 3 as const } };

export const fasesMuro: FaseTrilho[] = [
  {
    // O Beto mora colado no Zé, pela parede. Rita → Lúcia → Beto → Bia gasta só 3 setas, mas o Beto conta o escândalo (a Lúcia já
    // aumentou) e o Zé ouve junto. A volta (Rita → Ana → Beto → Lúcia → Otávio → Bia) passa pelo Beto ainda pequeno e deixa o
    // escândalo nascer na Lúcia, longe da parede. Ensina: aumentar tarde mantém o trecho anterior seguro.
    titulo: 'Parede fina',
    boato: 'O Seu Zé faz pão de queijo às três da manhã',
    novidade: 'Muro fino: escândalo contado ali vaza pro vizinho do outro lado',
    giros: 0, setas: 5, origens: ['r'],
    vizinhos: [
      v('d', 'Jandira', 'comum', [0, 0]), v('c', 'Ana', 'comum', [1, 0]), v('r', 'Rita', 'comum', [2, 0]),
      ze([0, 1]), v('e', 'Beto', 'exagerado', [1, 1]), v('l', 'Lúcia', 'exagerado', [2, 1]),
      v('a', 'Lia', 'comum', [0, 2]), v('s', 'Bia', 'comum', [1, 2], escandalo), v('b', 'Otávio', 'comum', [2, 2]),
    ],
    amizades: [['r', 'l'], ['r', 'c'], ['e', 'l'], ['e', 's'], ['e', 'c'], ['l', 'b'], ['s', 'b'], ['z', 'a'], ['z', 'd'], ['c', 'd']],
    murosFinos: [['e', 'z']],
    solucao: { r: 'c', c: 'e', e: 'l', l: 'b', b: 's' },
    armadilha: { r: 'l', l: 'e', e: 's' }, // o Beto conta escândalo e o Zé ouve pela parede
  },
  {
    // A Cida só tem uma porta (a Solange), e por ali o boato chega pequeno. A Lúcia mora colada nela, sem passagem: quando ela
    // conta o escândalo (Rita → Bia → Beto → Lúcia, e a Lúcia conta de volta pro Beto), a Cida ouve pela parede. Sem o muro não tem jeito.
    titulo: 'Pela parede',
    boato: 'O Seu Zé coleciona tampinhas de garrafa',
    giros: 0, setas: 4, origens: ['r'],
    vizinhos: [
      v('g', 'Ana', 'comum', [0, 0]), v('b', 'Ivo', 'comum', [1, 0]), v('r', 'Rita', 'comum', [2, 0]), v('f', 'Solange', 'comum', [3, 0]),
      ze([0, 1]), v('c', 'Bia', 'comum', [2, 1]), v('s', 'Cida', 'comum', [3, 1], escandalo),
      v('a', 'Otávio', 'comum', [0, 2]), v('d', 'Celina', 'comum', [1, 2]), v('e', 'Beto', 'exagerado', [2, 2]), v('l', 'Lúcia', 'exagerado', [3, 2]),
    ],
    amizades: [['r', 'c'], ['r', 'f'], ['e', 'l'], ['e', 'c'], ['s', 'f'], ['z', 'a'], ['z', 'g'], ['a', 'd']],
    murosFinos: [['l', 's']],
    solucao: { r: 'c', c: 'e', e: 'l', l: 'e' },
    armadilha: { r: 'f', f: 's' }, // a porta da Solange entrega um cochicho, não o escândalo que a Cida quer
  },
  {
    // Dois muros: o do Rui (colado no Zé) entrega a vítima, o do Caio (colado na Cida) leva o escândalo até ela. A Neide espalha o
    // boato pro prédio todo sem custar seta. O tentador é o Beto contar pro Rui, que mora na porta da Cida: o escândalo vaza pro Zé.
    // O Caio, que não toca no Zé, é quem conta o escândalo pro Beto de volta, e a Cida ouve pela parede dele.
    titulo: 'Duas paredes',
    boato: 'O Seu Zé aluga a vaga da garagem em dobro',
    giros: 0, setas: 4, origens: ['r'],
    vizinhos: [
      v('b', 'Otávio', 'comum', [0, 0]), v('f', 'Ana', 'comum', [1, 0]), v('m', 'Lu', 'fofoqueira', [2, 0]),
      ze([0, 1]), v('r', 'Rita', 'comum', [1, 1]), v('n', 'Neide', 'fofoqueira', [2, 1]), v('d', 'Marlene', 'comum', [3, 1]),
      v('g', 'Rui', 'comum', [0, 2]), v('e', 'Beto', 'exagerado', [1, 2]), v('l', 'Lúcia', 'exagerado', [2, 2]), v('h', 'Solange', 'comum', [3, 2]),
      v('s', 'Cida', 'comum', [0, 3], escandalo), v('c', 'Caio', 'comum', [1, 3]), v('a', 'Edu', 'comum', [3, 3]),
    ],
    amizades: [['r', 'e'], ['r', 'n'], ['r', 'f'], ['e', 'l'], ['e', 'c'], ['e', 'g'], ['l', 'n'], ['l', 'h'], ['s', 'g'], ['z', 'b'], ['n', 'm'], ['n', 'd'], ['m', 'f']],
    murosFinos: [['z', 'g'], ['s', 'c']],
    solucao: { r: 'n', l: 'e', e: 'c', c: 'e' },
    armadilha: { r: 'n', l: 'e', e: 'g', g: 's' }, // o Rui conta escândalo pra Cida e o Zé, colado nele, ouve junto
  },
];
