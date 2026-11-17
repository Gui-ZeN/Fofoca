// Bloco Muro fino (protótipo, 2026-11-13): `murosFinos: [a, b][]`, cômodos colados SEM passagem. Quando um do par
// CONTA com tamanho 3 (já com +1 do Exagerado e −1 do Arnaldo) pra qualquer pessoa, o outro ouve NA MESMA batida, mesmo tamanho e versão
// (mensagem extra com `vazou`). Vale nos dois sentidos; vítima ouvindo pelo muro = derrota. Só escândalo vaza, e o vazamento não vaza de novo.
// Três fases, achadas com um buscador sobre o motor (_busca/muro, fora do git). A pergunta de todas: ONDE o boato vira escândalo?
//   1. o muro como PERIGO: o caminho curto deixa o escândalo nascer ANTES de passar pelo Beto, colado no Zé;
//   2. o muro como ATALHO: o escândalo nasce a caminho da Cida, e a outra estrela (Davi) só ouve pela parede do Beto;
//   3. os dois juntos: a porta da Cida passa pelo Rui, colado no Zé pela parede (perigo); a Neide, colada na Cida, leva a estrela.
// ⚠️ Até 2026-11-17 as fases 2 e 3 terminavam com uma seta pra quem JÁ sabia, só pra quem mora no muro contar o escândalo — o dono
// travou nesse vício ("esse não tem como"). Refeitas: o vazamento acontece no caminho natural, e scripts/conferirAndar.ts reprova
// seta pra quem já sabe. As três passam no conferidor.

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
    // REFEITA em 2026-11-17: a antiga mandava a última seta pra quem já sabia, só pro escândalo vazar (o dono travou no mesmo vício
    // em "A volta por baixo"). Agora o escândalo nasce no caminho natural: o Beto, já com dois aumentos, conta pro Ivo (alguém novo) a
    // caminho da Cida, e o Davi — a outra estrela, sem porta que chegue nele a tempo — ouve pela parede. Tentação: o atalho pela Neide
    // (economiza a volta pelo Otávio), mas a Neide conta pro Zé. Desenho (* origem, | muro entre Beto e Davi):
    // Rita*         Otávio        Davi★         Celina
    // Neide(fof)    Bia           Beto+1        Ivo
    // Seu Zé(!)     Lúcia+1       Solange       Cida★3
    titulo: 'Pela parede',
    boato: 'O Seu Zé coleciona tampinhas de garrafa',
    giros: 0, setas: 7, origens: ['g'],
    vizinhos: [
      v('g', 'Rita', 'comum', [0, 0]), v('r', 'Otávio', 'comum', [1, 0]), v('b', 'Davi', 'comum', [2, 0], { interesse: {} }), v('f', 'Celina', 'comum', [3, 0]),
      v('z', 'Neide', 'fofoqueira', [0, 1]), v('l', 'Bia', 'comum', [1, 1]), v('e', 'Beto', 'exagerado', [2, 1]), v('s', 'Ivo', 'comum', [3, 1]),
      v('a', 'Seu Zé', 'assunto', [0, 2]), v('d', 'Lúcia', 'exagerado', [1, 2]), v('c', 'Solange', 'comum', [2, 2]), v('i', 'Cida', 'comum', [3, 2], escandalo),
    ],
    amizades: [['r', 'b'], ['f', 's'], ['s', 'i'], ['r', 'l'], ['e', 'c'], ['a', 'd'], ['d', 'c'], ['l', 'd'], ['b', 'f'], ['e', 's'], ['g', 'z'], ['z', 'a'], ['g', 'r'], ['z', 'l']],
    murosFinos: [['b', 'e']],
    solucao: { g: 'r', r: 'l', l: 'd', d: 'c', c: 'e', e: 's', s: 'i' },
    armadilha: { g: 'z', l: 'd', d: 'c', c: 'e', e: 's', s: 'i' },
  },
  {
    // REFEITA em 2026-11-17 (mesmo vício da antiga). As DUAS paredes no caminho natural: a Cida (quer escândalo) tem porta pro Rui,
    // mas o Rui divide parede com o Seu Zé — contar pela porta vaza pro Zé (a armadilha). O certo é levar o escândalo até a Neide, que
    // divide a outra parede com a Cida: a Neide espalha sozinha e a Cida ouve pela parede. Ninguém conta pra quem já sabe. 9 setas pra 8
    // (a folga deixa a armadilha caber na mão; continua 1 solução só). Desenho (* origem; muros Zé|Rui e Cida|Neide):
    // Ana           Lúcia+1       Rita*         —
    // Seu Zé(!)     Edu           Beto+1        Marlene
    // Rui           Jandira       Otávio        Caio
    // Cida★3        Neide(fof)    —             Solange
    titulo: 'Duas paredes',
    boato: 'O Seu Zé aluga a vaga da garagem em dobro',
    giros: 0, setas: 9, origens: ['m'],
    vizinhos: [
      v('b', 'Ana', 'comum', [0, 0]), v('f', 'Lúcia', 'exagerado', [1, 0]), v('m', 'Rita', 'comum', [2, 0]),
      v('z', 'Seu Zé', 'assunto', [0, 1]), v('r', 'Edu', 'comum', [1, 1]), v('n', 'Beto', 'exagerado', [2, 1]), v('d', 'Marlene', 'comum', [3, 1]),
      v('g', 'Rui', 'comum', [0, 2]), v('e', 'Jandira', 'comum', [1, 2]), v('l', 'Otávio', 'comum', [2, 2]), v('h', 'Caio', 'comum', [3, 2]),
      v('s', 'Cida', 'comum', [0, 3], escandalo), v('c', 'Neide', 'fofoqueira', [1, 3]), v('a', 'Solange', 'comum', [3, 3]),
    ],
    amizades: [['r', 'n'], ['r', 'f'], ['e', 'l'], ['e', 'c'], ['e', 'g'], ['s', 'g'], ['n', 'd'], ['m', 'f'], ['a', 'h'], ['d', 'h'], ['l', 'h'], ['m', 'n'], ['b', 'f']],
    murosFinos: [['z', 'g'], ['s', 'c']],
    solucao: { m: 'f', f: 'r', r: 'n', n: 'd', d: 'h', h: 'l', l: 'e', e: 'c' },
    armadilha: { m: 'f', f: 'r', r: 'n', n: 'd', d: 'h', h: 'l', l: 'e', e: 'g', g: 's' },
  },
];
