// Bloco Ronda (protótipo, 2026-11-13): a vítima ANDA. `ronda: string[]` em ciclo; na batida b (1 = a primeira) ela está
// no apartamento de ronda[(b - 1) % ronda.length] (o próprio id = em casa). Visitando X, ESCUTA o que X recebe ou conta NA MESMA batida
// (ouviu = derrota, mensagem com `escuta` + `ronda`); fora de casa, recado pra ela se perde. `rondas` no resultado diz onde ela esteve.
// Três fases, achadas com um buscador sobre o motor (_busca/ronda, fora do git). Em todas, a pergunta nova é QUANDO, não só POR ONDE:
// o mesmo morador é seguro numa batida e fatal em outra, e o caminho curto (a armadilha) cruza o Seu Zé na hora errada.
//   1. antes dele: a Jandira é visitada na batida 3. O boato passa por ela nas batidas 1 e 2 e sai de lá a tempo;
//   2. depois dele: o Otávio é visitado na batida 2. A volta maior chega nele na 3, quando o Seu Zé já voltou pra casa;
//   3. depois dele + Ordem: a Marlene é visitada na batida 4, e é o único caminho até a Bia, que tem que ouvir depois da Cida.
// ⚠️ Rondas de 4 batidas (casa, A, casa, B): o prédio é em grade e não tem triângulo de portas, então 3 paradas em ciclo (com a
// volta ao começo) não existem. "Casa" no meio da ronda é o que dá ao jogador uma batida segura pra entrar no apartamento dele.
import type { Vizinho } from './motor';
import type { FaseTrilho } from './trilho';

const v = (id: string, nome: string, tipo: Vizinho['tipo'], pos: [number, number], extra: Partial<Vizinho> = {}): Vizinho =>
  ({ id, nome, tipo, pos, ...extra });
const ze = (pos: [number, number], ronda: string[]) => v('z', 'Seu Zé', 'assunto', pos, { ronda });

export const fasesRonda: FaseTrilho[] = [
  {
    // Ronda z, Lia, Jandira, Lia: na batida 3 ele está na Jandira. Pelo atalho da Neide (Rita → Jandira → Neide) o boato volta pra
    // Jandira exatamente na 3 e o Seu Zé escuta. Pela porta (Rita → Jandira → Otávio → Cida) são 3 setas, e a Jandira já passou
    // o boato adiante na batida 2, antes de ele chegar.
    titulo: 'A ronda das nove',
    boato: 'O Seu Zé confere a lixeira de lanterna',
    novidade: 'Ronda: o vilão anda pelo prédio, um apartamento por batida',
    giros: 0, setas: 3, origens: ['r'],
    vizinhos: [
      v('r', 'Rita', 'comum', [1, 0]), ze([2, 0], ['z', 'i', 'j', 'i']),
      v('t', 'Otávio', 'comum', [0, 1]), v('j', 'Jandira', 'comum', [1, 1]), v('i', 'Lia', 'comum', [2, 1]),
      v('c', 'Cida', 'comum', [0, 2], { interesse: {} }), v('n', 'Neide', 'fofoqueira', [1, 2]),
    ],
    amizades: [['r', 'z'], ['r', 'j'], ['z', 'i'], ['c', 'n'], ['c', 't'], ['n', 'j'], ['t', 'j'], ['j', 'i']],
    solucao: { r: 'j', j: 't', t: 'c' },
    armadilha: { r: 'j', j: 'n' }, // a Neide conta na 3 pra Jandira, e o Seu Zé está lá
  },
  {
    // Ronda z, Otávio, z, Jandira: na batida 2 ele está no Otávio. Rita → Otávio → Davi → Cida passa por lá na batida 2 e perde.
    // A volta (Rita → Marlene → Edu → Otávio → Davi → Cida) gasta 2 setas a mais, mas só chega no Otávio na 3, com ele em casa.
    titulo: 'Espere ele passar',
    boato: 'O Seu Zé ensaia discurso de reunião no corredor',
    giros: 0, setas: 5, origens: ['r'],
    vizinhos: [
      v('j', 'Jandira', 'comum', [0, 0]), v('e', 'Edu', 'comum', [1, 0]), v('m', 'Marlene', 'comum', [2, 0]),
      ze([0, 1], ['z', 't', 'z', 'j']), v('t', 'Otávio', 'comum', [1, 1]), v('r', 'Rita', 'comum', [2, 1]),
      v('v', 'Ivo', 'comum', [0, 2]), v('d', 'Davi', 'comum', [1, 2]), v('k', 'Celina', 'comum', [2, 2]),
      v('o', 'Caio', 'comum', [0, 3]), v('c', 'Cida', 'comum', [1, 3], { interesse: {} }),
    ],
    amizades: [['r', 't'], ['r', 'm'], ['z', 't'], ['z', 'v'], ['z', 'j'], ['c', 'd'], ['t', 'd'], ['t', 'e'], ['k', 'd'], ['d', 'v'], ['v', 'o'], ['j', 'e'], ['e', 'm']],
    solucao: { r: 'm', m: 'e', e: 't', t: 'd', d: 'c' },
    armadilha: { r: 't', t: 'd', d: 'c' }, // o Otávio conta pra Davi na batida 2, com o Seu Zé no apartamento dele
  },
  {
    // Ordem + ronda: a Cida (1) tem que ouvir antes da Bia (2), e da Cida a única saída útil é a Marlene. Ronda z, Caio, z, Marlene:
    // ele está na Marlene na batida 4. Rita → Edu → Cida → Marlene → Bia conta pra Marlene na 4 e perde; a volta por Ivo, Rui e Edu
    // faz a Cida ouvir na 4 e a Marlene só na 5, quando ele já voltou pra casa (6 setas em vez de 4).
    titulo: 'A fila e a ronda',
    boato: 'O Seu Zé conta as vagas da garagem toda noite',
    giros: 0, setas: 6, origens: ['r'],
    vizinhos: [
      v('o', 'Caio', 'comum', [0, 0]), ze([1, 0], ['o', 'z', 'o', 'm']), v('i', 'Lia', 'comum', [3, 0]),
      v('m', 'Marlene', 'comum', [0, 1]), v('c', 'Cida', 'comum', [1, 1], { interesse: { ordem: 1 } }), v('e', 'Edu', 'comum', [2, 1]), v('r', 'Rita', 'comum', [3, 1]),
      v('b', 'Bia', 'comum', [0, 2], { interesse: { ordem: 2 } }), v('t', 'Otávio', 'comum', [1, 2]), v('u', 'Rui', 'comum', [2, 2]), v('v', 'Ivo', 'comum', [3, 2]),
      v('j', 'Jandira', 'comum', [0, 3]), v('g', 'Solange', 'comum', [1, 3]), v('d', 'Davi', 'comum', [2, 3]), v('k', 'Celina', 'comum', [3, 3]),
    ],
    amizades: [['r', 'i'], ['r', 'e'], ['r', 'v'], ['z', 'c'], ['z', 'o'], ['c', 'm'], ['c', 'e'], ['b', 'm'], ['b', 't'], ['k', 'd'], ['m', 'o'], ['j', 'g'], ['t', 'g'], ['t', 'u'], ['e', 'u'], ['v', 'u'], ['g', 'd'], ['d', 'u']],
    solucao: { r: 'v', v: 'u', u: 'e', e: 'c', c: 'm', m: 'b' },
    armadilha: { r: 'e', e: 'c', c: 'm', m: 'b' }, // a Cida conta pra Marlene na batida 4, e o Seu Zé está lá
  },
];
