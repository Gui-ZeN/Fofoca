// Bloco "Prédio cheio" (difícil): nada de regra nova — prédio 3×4, o Zé no MEIO e cercado (3–4 portas),
// duas Fofoqueiras (ao menos uma colada nele) e soluções de 5–6 setas, combinando o que os blocos
// anteriores ensinaram (padaria, ordem, tamanho exato). Pedido do usuário depois de jogar Hora certa e
// Ordem: "muito fácil ainda" e "o vilão sempre fica numa ponta" (medido: 0 de 20 vítimas no meio).
// ⚠️ Zé no meio sozinho não dificulta (a vítima só ouve por seta sua ou Fofoqueira colada; simulado:
// o caminho curto acerta 99% igual) — quem dificulta é a Fofoqueira em volta dele.
// Achadas com o buscador sobre o motor (1 solução no K mínimo; K ≥ 5; o caminho curto perde; quem só
// aprendeu "não cutucar o Zé nem a Fofoqueira colada" também perde; cada regra combinada muda a jogada)
// e convertidas por script. A armadilha de cada fase é o plano desse jogador "que já aprendeu".
// Jogado numa sessão separada (?bloco=dificil).

import type { Vizinho } from './motor';
import type { FaseTrilho } from './trilho';

const v = (id: string, nome: string, tipo: Vizinho['tipo'], pos: [number, number], extra: Partial<Vizinho> = {}): Vizinho =>
  ({ id, nome, tipo, pos, ...extra });

export const fasesDificil: FaseTrilho[] = [
  {
    // Zé no meio com 4 portas; as duas Fofoqueiras de baixo vazam uma pra outra até ele: a volta é por cima
    titulo: 'Síndico de férias',
    boato: 'O Seu Zé torce contra o próprio time',
    giros: 0, setas: 5, origens: ['r'],
    vizinhos: [
      v('z', 'Seu Zé', 'assunto', [1, 1]),
      v('r', 'Rita', 'comum', [0, 0]),
      v('a', 'Ana', 'comum', [1, 0]),
      v('d', 'Davi', 'comum', [2, 0]),
      v('c', 'Cida', 'comum', [2, 3], { interesse: {} }),
      v('y', 'Rui', 'comum', [0, 1]),
      v('e', 'Edu', 'comum', [2, 1]),
      v('n', 'Neide', 'fofoqueira', [0, 2]),
      v('l', 'Lu', 'fofoqueira', [1, 2]),
      v('i', 'Lia', 'comum', [2, 2]),
    ],
    amizades: [['z','a'], ['z','y'], ['z','e'], ['z','l'], ['r','a'], ['r','y'], ['a','d'], ['d','e'], ['c','i'], ['y','n'], ['e','i'], ['n','l'], ['l','i']],
    solucao: { r: 'a', a: 'd', d: 'e', e: 'i', i: 'c' },
    armadilha: { r: 'y', y: 'n', i: 'c' }, // assunto_ouviu
  },
  {
    // ⚠️ substitui a D2 antiga (2026-11-12): era "Zé fora, a Fofoqueira colada nele fala" de novo. Aqui o Zé fica em
    // casa. A Cida quer uma FOFOCA e só volta na 4: a Neide conta pra ela na 2 (perde) e pro Davi; a volta pelo Beto
    // (Exagerado), Ana e Edu chega na 6, no tamanho certo. A Lu, colada no Zé, não pode ouvir.
    titulo: 'Pombo na janela',
    boato: 'O Seu Zé chora no final do jogo',
    giros: 0, setas: 5, origens: ['r'],
    vizinhos: [
      v('z', 'Seu Zé', 'assunto', [1, 2]),
      v('r', 'Rita', 'comum', [2, 2]),
      v('c', 'Cida', 'comum', [2, 0], { interesse: { tamanho: 2 }, chega: 4 }),
      v('b', 'Bia', 'comum', [0, 2]),
      v('d', 'Davi', 'comum', [1, 1]),
      v('o', 'Beto', 'exagerado', [0, 1]),
      v('e', 'Edu', 'comum', [1, 0]),
      v('l', 'Lu', 'fofoqueira', [1, 3]),
      v('n', 'Neide', 'fofoqueira', [2, 1]),
      v('i', 'Lia', 'comum', [2, 3]),
      v('a', 'Ana', 'comum', [0, 0]),
    ],
    amizades: [['z','r'], ['z','b'], ['z','d'], ['z','l'], ['r','n'], ['r','i'], ['c','e'], ['c','n'], ['b','o'], ['d','o'], ['d','e'], ['d','n'], ['o','a'], ['e','a']],
    solucao: { r: 'n', d: 'o', o: 'a', a: 'e', e: 'c' },
    armadilha: { r: 'n' }, // a Neide conta pra Cida na 2, e ela ainda está fora
  },
  {
    // a estrela 2 fica no caminho da 1: passar direto entrega fora de ordem; dá a volta por baixo
    titulo: 'Varanda nova',
    boato: 'O Seu Zé apelidou o carro de Tetê',
    giros: 0, setas: 5, origens: ['r'],
    vizinhos: [
      v('z', 'Seu Zé', 'assunto', [1, 1]),
      v('a', 'Ana', 'comum', [0, 0]),
      v('b', 'Bia', 'comum', [0, 2], { interesse: {ordem:1} }),
      v('r', 'Rita', 'comum', [2, 1]),
      v('n', 'Neide', 'fofoqueira', [0, 1]),
      v('l', 'Lu', 'fofoqueira', [2, 2]),
      v('d', 'Davi', 'comum', [1, 0]),
      v('y', 'Rui', 'comum', [1, 3]),
      v('e', 'Edu', 'comum', [2, 3]),
      v('c', 'Cida', 'comum', [1, 2], { interesse: {ordem:2} }),
      v('i', 'Lia', 'comum', [0, 3]),
    ],
    amizades: [['z','n'], ['z','d'], ['z','c'], ['a','d'], ['b','n'], ['b','c'], ['b','i'], ['r','l'], ['l','e'], ['y','e'], ['y','c'], ['y','i']],
    solucao: { r: 'l', e: 'y', y: 'i', i: 'b', b: 'c' },
    armadilha: { r: 'l', e: 'y', y: 'c', c: 'b' }, // ordem_errada
  },
  {
    // ⚠️ substitui a D4 antiga "Fofoca, não escândalo" (2026-11-12): era "Zé fora, a Fofoqueira colada nele fala" de
    // novo. Aqui o Zé fica em casa. A Cida quer FOFOCA: pela direita (Davi, Edu) chega cochicho. A Neide espalha, o
    // Davi e o Edu levam até a Bia — colada no Zé, sem contar pra ele — e a Lúcia (Exagerado) entrega no tamanho.
    // A Lu, colada no Zé, é a outra armadilha (pela Ana). O título mudou: o caminho óbvio chega pequeno, não grande.
    titulo: 'Rifa do condomínio',
    boato: 'O Seu Zé guarda as moedas de 1 real num pote',
    giros: 0, setas: 5, origens: ['r'],
    vizinhos: [
      v('z', 'Seu Zé', 'assunto', [1, 1]),
      v('r', 'Rita', 'comum', [1, 0]),
      v('c', 'Cida', 'comum', [2, 3], { interesse: { tamanho: 2 } }),
      v('b', 'Bia', 'comum', [1, 2]),
      v('d', 'Davi', 'comum', [2, 1]),
      v('e', 'Edu', 'comum', [2, 2]),
      v('o', 'Beto', 'exagerado', [0, 3]),
      v('l', 'Lu', 'fofoqueira', [0, 1]),
      v('u', 'Lúcia', 'exagerado', [1, 3]),
      v('n', 'Neide', 'fofoqueira', [2, 0]),
      v('a', 'Ana', 'comum', [0, 0]),
    ],
    amizades: [['z','r'], ['z','b'], ['z','l'], ['r','n'], ['r','a'], ['c','e'], ['c','u'], ['b','e'], ['b','u'], ['d','e'], ['d','n'], ['o','u'], ['l','a']],
    solucao: { r: 'n', d: 'e', e: 'b', b: 'u', u: 'c' },
    armadilha: { r: 'n', d: 'e', e: 'c' }, // pela direita: a Cida recebe cochicho e queria fofoca
  },
  {
    // a estrela 1 só volta na 4 e a 2 é vizinha dela: corrente de 6 setas contornando o Zé
    titulo: 'Sofá novo no 201',
    boato: 'O Seu Zé dá boa noite pra lua',
    giros: 0, setas: 6, origens: ['r'],
    vizinhos: [
      v('z', 'Seu Zé', 'assunto', [1, 2]),
      v('n', 'Neide', 'fofoqueira', [1, 3]),
      v('l', 'Lu', 'fofoqueira', [0, 2]),
      v('c', 'Cida', 'comum', [0, 0], { interesse: {ordem:2} }),
      v('a', 'Ana', 'comum', [1, 0]),
      v('d', 'Davi', 'comum', [2, 0]),
      v('y', 'Rui', 'comum', [1, 1]),
      v('e', 'Edu', 'comum', [2, 1]),
      v('r', 'Rita', 'comum', [2, 2]),
      v('b', 'Bia', 'comum', [0, 1], { interesse: {ordem:1}, chega: 4 }),
    ],
    amizades: [['z','n'], ['z','l'], ['z','y'], ['z','r'], ['l','b'], ['c','a'], ['c','b'], ['a','d'], ['a','y'], ['d','e'], ['y','e'], ['y','b'], ['e','r']],
    solucao: { r: 'e', e: 'd', d: 'a', a: 'y', y: 'b', b: 'c' },
    armadilha: { r: 'e', e: 'y', y: 'b', b: 'c' }, // interessado_nao_ouviu
  },
  {
    // ⚠️ substitui a D6 antiga (2026-11-12): era "Zé fora, a Fofoqueira colada nele fala" pela 5ª vez. Final do
    // capítulo, com tudo junto e o Zé em CASA: a Cida (1) só volta na 4, então o boato dá a volta pelo Beto e pela
    // Lia; a Neide espalha no MEIO do caminho (não fecha a fila); o Rui entrega pra Cida e o Edu, pra Bia (2).
    titulo: 'Reunião de condomínio',
    boato: 'O Seu Zé ensaia o discurso da reunião no banho',
    giros: 0, setas: 6, origens: ['r'],
    vizinhos: [
      v('z', 'Seu Zé', 'assunto', [1, 2]),
      v('r', 'Rita', 'comum', [2, 3]),
      v('a', 'Ana', 'comum', [0, 2]),
      v('n', 'Neide', 'fofoqueira', [2, 0]),
      v('o', 'Beto', 'exagerado', [2, 2]),
      v('b', 'Bia', 'comum', [0, 0], { interesse: { ordem: 2 } }),
      v('e', 'Edu', 'comum', [0, 1]),
      v('c', 'Cida', 'comum', [1, 1], { interesse: { ordem: 1 }, chega: 4 }),
      v('l', 'Lu', 'fofoqueira', [1, 3]),
      v('y', 'Rui', 'comum', [1, 0]),
      v('i', 'Lia', 'comum', [2, 1]),
    ],
    amizades: [['z','a'], ['z','o'], ['z','c'], ['z','l'], ['r','o'], ['r','l'], ['a','e'], ['n','y'], ['n','i'], ['o','i'], ['b','e'], ['b','y'], ['e','c'], ['c','y'], ['c','i']],
    solucao: { r: 'o', o: 'i', i: 'n', y: 'c', c: 'e', e: 'b' },
    armadilha: { r: 'o', o: 'i', i: 'c', c: 'e', e: 'b' }, // pela Lia direto: a Cida ainda está na padaria
  },
];
