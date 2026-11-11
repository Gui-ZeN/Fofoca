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
    titulo: 'Corredor de cima',
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
    // a Fofoqueira colada no Zé abre a corrente enquanto ele está fora (volta na 3); o resto dá a volta longa
    titulo: 'Antes do Zé voltar',
    boato: 'O Seu Zé chora no final do jogo',
    giros: 0, setas: 5, origens: ['r'],
    vizinhos: [
      v('z', 'Seu Zé', 'assunto', [1, 1], { chega: 3 }),
      v('a', 'Ana', 'comum', [1, 0]),
      v('d', 'Davi', 'comum', [0, 2]),
      v('y', 'Rui', 'comum', [2, 1]),
      v('n', 'Neide', 'fofoqueira', [0, 1]),
      v('c', 'Cida', 'comum', [0, 0], { interesse: {} }),
      v('e', 'Edu', 'comum', [2, 0]),
      v('l', 'Lu', 'fofoqueira', [1, 2]),
      v('r', 'Rita', 'comum', [1, 3]),
      v('i', 'Lia', 'comum', [2, 2]),
    ],
    amizades: [['z','a'], ['z','y'], ['z','n'], ['z','l'], ['a','c'], ['a','e'], ['d','n'], ['d','l'], ['y','e'], ['y','i'], ['n','c'], ['l','r'], ['l','i']],
    solucao: { r: 'l', i: 'y', y: 'e', e: 'a', a: 'c' },
    armadilha: { r: 'l', d: 'n' }, // a Neide fala depois que o Zé voltou
  },
  {
    // a estrela 2 fica no caminho da 1: passar direto entrega fora de ordem; dá a volta por baixo
    titulo: 'A 2 está do lado',
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
    // quem quer saber pede fofoca (2): só um Exagerado no caminho; a Fofoqueira de baixo entrega no fim, e a de cima fala com o Zé fora
    titulo: 'Fofoca, não escândalo',
    boato: 'O Seu Zé canta ópera pro gato',
    giros: 0, setas: 5, origens: ['r'],
    vizinhos: [
      v('z', 'Seu Zé', 'assunto', [1, 1], { chega: 4 }),
      v('o', 'Beto', 'exagerado', [1, 0]),
      v('a', 'Ana', 'comum', [0, 0]),
      v('d', 'Davi', 'comum', [1, 3]),
      v('r', 'Rita', 'comum', [2, 0]),
      v('y', 'Rui', 'comum', [2, 2]),
      v('c', 'Cida', 'comum', [0, 1], { interesse: {tamanho:2} }),
      v('u', 'Lúcia', 'exagerado', [0, 3]),
      v('n', 'Neide', 'fofoqueira', [2, 1]),
      v('e', 'Edu', 'comum', [1, 2]),
      v('l', 'Lu', 'fofoqueira', [0, 2]),
    ],
    amizades: [['z','o'], ['z','c'], ['z','n'], ['o','a'], ['a','c'], ['d','u'], ['d','e'], ['r','n'], ['y','n'], ['y','e'], ['c','l'], ['u','l'], ['e','l']],
    solucao: { r: 'n', y: 'e', e: 'd', d: 'u', u: 'l' },
    armadilha: { r: 'n', y: 'e', e: 'l' }, // sem o Exagerado: chega cochicho, não fofoca
  },
  {
    // a estrela 1 só volta na 4 e a 2 é vizinha dela: corrente de 6 setas contornando o Zé
    titulo: 'Volta comprida',
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
    // tudo junto: Fofoqueira colada no Zé fala antes dele voltar (3), a estrela 1 só volta na 4, e a 2 tem que vir depois
    titulo: 'Reunião de condomínio',
    boato: 'O Seu Zé ensaia o discurso da reunião no banho',
    giros: 0, setas: 6, origens: ['r'],
    vizinhos: [
      v('z', 'Seu Zé', 'assunto', [1, 1], { chega: 3 }),
      v('r', 'Rita', 'comum', [2, 0]),
      v('n', 'Neide', 'fofoqueira', [2, 1]),
      v('a', 'Ana', 'comum', [2, 2]),
      v('l', 'Lu', 'fofoqueira', [1, 0]),
      v('d', 'Davi', 'comum', [0, 2]),
      v('y', 'Rui', 'comum', [1, 3]),
      v('e', 'Edu', 'comum', [2, 3]),
      v('c', 'Cida', 'comum', [1, 2], { interesse: {ordem:2} }),
      v('i', 'Lia', 'comum', [0, 0]),
      v('b', 'Bia', 'comum', [0, 3], { interesse: {ordem:1}, chega: 4 }),
    ],
    amizades: [['z','n'], ['z','l'], ['z','c'], ['r','n'], ['r','l'], ['n','a'], ['a','e'], ['a','c'], ['l','i'], ['d','c'], ['d','b'], ['y','e'], ['y','c'], ['y','b']],
    solucao: { r: 'n', a: 'e', e: 'y', y: 'b', b: 'd', d: 'c' },
    armadilha: { r: 'n', a: 'c', c: 'd', d: 'b' }, // a Cida (2) sabe antes da Bia (1)
  },
];
