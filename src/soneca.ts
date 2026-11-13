// Bloco Soneca (protótipo, 2026-11-13): `soneca: true` num morador comum. Ouve na batida b e só conta na b + 2
// (em vez da b + 1); aceita seta normalmente. `batidas` tem uma entrada (às vezes `[]`) pra cada batida até a última com ação:
// a tela e `quemContou` usam o índice de `batidas` como relógio.
// Sozinho o Soneca não decide nada: ele só pesa junto de uma regra de TEMPO. Três fases, achadas com um buscador sobre o
// motor (_busca/soneca, fora do git), todas com o Ivo de Soneca (o mesmo rosto) e a Cida de estrela:
//   1. ele de propósito: a Cida está na padaria (`chega`). Dois caminhos com as mesmas setas; só o que passa pelo Ivo chega na hora;
//   2. ele de armadilha: a Cida sai cedo (`sai`). O caminho que passa pelo Ivo é igual ao outro nas setas e chega tarde;
//   3. ele num andar maior, com a Neide: o atalho pelo Ivo chega antes da hora; é preciso gastar o tempo dando a volta pela
//      Neide, que só entrega ao Ivo depois, e o Ivo atrasa mais uma batida.
// ⚠️ Em nenhuma o Soneca "ajuda" ou "atrapalha" por si: quem decide é o relógio da Cida. Sem o `soneca` (todos comuns) a solução
// de cada fase deixa de ser a mesma.
import type { Vizinho } from './motor';
import type { FaseTrilho } from './trilho';

const v = (id: string, nome: string, tipo: Vizinho['tipo'], pos: [number, number], extra: Partial<Vizinho> = {}): Vizinho =>
  ({ id, nome, tipo, pos, ...extra });
const ze = (pos: [number, number]) => v('z', 'Seu Zé', 'assunto', pos);
// ⚠️ o Soneca tem desenho próprio desde 2026-11-13 (pijama listrado, touca e travesseiro); antes era o Ivo emprestado.
// O id continua `i` e os comentários abaixo ainda dizem "Ivo": é ele.
const ivo = (pos: [number, number]) => v('i', 'Soneca', 'comum', pos, { soneca: true });

export const fasesSoneca: FaseTrilho[] = [
  {
    // 3×3. A Cida só volta da padaria na 4. Rita→Edu→Davi→Cida chega na 3 e se perde. Rita→Edu→Ivo→Cida são as mesmas
    // 3 setas: o Ivo ouve na 2, conta na 4 e a Cida ouve na 4, na hora. O Seu Zé mora colado na Rita e no Ivo.
    titulo: 'Cochilo estratégico',
    boato: 'O Seu Zé confunde o interfone com o micro-ondas',
    novidade: 'Soneca: ouve e demora uma batida a mais pra contar',
    giros: 0, setas: 3, origens: ['r'],
    vizinhos: [
      v('b', 'Bia', 'comum', [0, 0]), v('r', 'Rita', 'comum', [1, 0]), ze([2, 0]),
      v('a', 'Ana', 'comum', [0, 1]), v('e', 'Edu', 'comum', [1, 1]), ivo([2, 1]),
      v('d', 'Davi', 'comum', [1, 2]), v('s', 'Cida', 'comum', [2, 2], { interesse: {}, chega: 4 }),
    ],
    amizades: [['r', 'z'], ['r', 'b'], ['r', 'e'], ['i', 's'], ['i', 'z'], ['i', 'e'], ['s', 'd'], ['a', 'b'], ['a', 'e'], ['d', 'e']],
    solucao: { r: 'e', e: 'i', i: 's' },
    armadilha: { r: 'e', e: 'd', d: 's' }, // a Cida ouve na 3 e ainda não voltou
  },
  {
    // 4×3. A Cida sai na 5 (só ouve até a 4). Rita→Davi→Lia→Edu→Cida chega na 4. Trocando o último passo por Ivo
    // (Lia→Ivo→Cida) são as mesmas 4 setas, mas o Ivo ouve na 3, conta na 5 e a Cida só ouviria na 5: já saiu.
    titulo: 'Cochilo tarde demais',
    boato: 'O Seu Zé guarda o troco no pote de sal',
    giros: 0, setas: 4, origens: ['r'],
    vizinhos: [
      v('s', 'Cida', 'comum', [0, 0], { interesse: {}, sai: 5 }), ivo([1, 0]), v('u', 'Rui', 'comum', [3, 0]),
      v('e', 'Edu', 'comum', [0, 1]), v('l', 'Lia', 'comum', [1, 1]), v('m', 'Marlene', 'comum', [2, 1]), v('a', 'Ana', 'comum', [3, 1]),
      ze([0, 2]), v('d', 'Davi', 'comum', [1, 2]), v('r', 'Rita', 'comum', [2, 2]), v('b', 'Bia', 'comum', [3, 2]),
    ],
    amizades: [['r', 'd'], ['r', 'm'], ['i', 's'], ['i', 'l'], ['s', 'e'], ['z', 'd'], ['z', 'e'], ['a', 'b'], ['a', 'u'], ['a', 'm'], ['d', 'l'], ['e', 'l']],
    solucao: { r: 'd', d: 'l', l: 'e', e: 's' },
    armadilha: { r: 'd', d: 'l', l: 'i', i: 's' }, // o Ivo cochila e a Cida já saiu
  },
  {
    // 4×4, 15 moradores. A Cida só volta na 6. O atalho Rita→Davi→Ivo→Cida chega na 4: cedo demais. A volta: Rita→Davi→Edu→Neide
    // (a Neide conta pra todos em volta, sem seta), e o Ivo só ouve dela na 4; cochila e conta na 6. A Cida ouve na 6, na hora.
    titulo: 'Rodeio com sesta',
    boato: 'O Seu Zé ensaia discurso pro síndico no elevador',
    giros: 0, setas: 4, origens: ['r'],
    vizinhos: [
      v('j', 'Jandira', 'comum', [0, 0]), v('m', 'Marlene', 'comum', [1, 0]), v('k', 'Caio', 'comum', [3, 0]),
      v('u', 'Rui', 'comum', [0, 1]), v('b', 'Bia', 'comum', [1, 1]), v('l', 'Lia', 'comum', [2, 1]), v('o', 'Otávio', 'comum', [3, 1]),
      v('a', 'Ana', 'comum', [0, 2]), v('n', 'Neide', 'fofoqueira', [1, 2]), v('e', 'Edu', 'comum', [2, 2]), ze([3, 2]),
      v('s', 'Cida', 'comum', [0, 3], { interesse: {}, chega: 6 }), ivo([1, 3]), v('d', 'Davi', 'comum', [2, 3]), v('r', 'Rita', 'comum', [3, 3]),
    ],
    amizades: [['r', 'z'], ['r', 'd'], ['i', 's'], ['i', 'n'], ['i', 'd'], ['s', 'a'], ['z', 'e'], ['z', 'o'], ['n', 'b'], ['n', 'e'], ['a', 'u'], ['b', 'u'], ['b', 'm'], ['d', 'e'], ['u', 'j'], ['l', 'o'], ['k', 'o']],
    solucao: { r: 'd', d: 'e', e: 'n', i: 's' },
    armadilha: { r: 'd', d: 'i', i: 's' }, // a Cida ouve na 4 e só volta na 6
  },
];
