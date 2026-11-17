// Andar do Chefe (2026-11-17), a partir de uma proposta colada pelo dono ("O telefone do 402"). Duas correções antes de desenhar:
// no motor a Dona Norma É a vítima (o recolher é a regra dela; não convive com o Seu Zé como "fiscal"), e o fio gasta uma batida
// como a porta. Achado com um buscador a partir de uma planta à mão (_busca/chefe/telefone_busca.ts) e conferido por
// scripts/conferirAndar.ts. ⚠️ A proposta pedia uma 3ª armadilha (a Norma ouvir sem ninguém contar direto pra ela): com uma
// Fofoqueira só, e do outro lado do prédio, nenhuma busca achou — ficaram duas, ordem e recolher.
import type { AndarDesenhado } from './tipo';

export const andares: AndarDesenhado[] = [
  {
    // DIFICIL — O telefone do 402. Prédio (* origem, ! vilão, ★n ordem; fio Neide–Caio):
    //   Beto      Caio      ·          Otávio    ·
    //   Rita*     ·         Norma!5    Edu       Ivo
    //   Cida★1    Lia       Rui        Bia       Ana★2
    //   ·         Davi      Neide      ·         Jandira
    // Solução: Rita sobe (Beto, Caio) e liga pelo fio pra Neide, que espalha na 4. Esquerda: Davi → Lia → Cida (6).
    // Direita: o Rui, vizinho da Norma, conta pra Bia na 5 — a última batida antes do recolher — e a Ana só pode ouvir
    // depois da Cida: Bia → Edu → Ivo → Ana (8). Armadilha: Bia → Ana direto (a Ana ouve na 6, junto da Cida).
    // A outra tentação: descer pela Cida (Rita → Cida → Lia → Davi → Neide) chega tarde, e o Rui já está calado.
    dificuldade: 'dificil',
    referencia: 'Proposta do dono ("O telefone do 402"); Opus Magnum: dois braços que precisam chegar em ordem, um deles de propósito mais longo.',
    ideia: 'O fio leva o boato até a Neide a tempo de o Rui ainda falar; e a Ana tem que esperar a Cida, então o caminho dela é o comprido.',
    vilao: 'A Dona Norma cala o Rui depois da batida 5: quem chega na Neide pelo caminho de baixo chega tarde, e a Ana fica sem saber.',
    fase: {
      titulo: 'O telefone do 402', boato: 'A Dona Norma atende o interfone de pijama',
      giros: 0, setas: 10, origens: ['r'],
      vizinhos: [
        { id: 'b', nome: 'Beto', tipo: 'comum', pos: [0, 0] },
        { id: 'k', nome: 'Caio', tipo: 'comum', pos: [1, 0] },
        { id: 'o', nome: 'Otávio', tipo: 'comum', pos: [3, 0] },
        { id: 'r', nome: 'Rita', tipo: 'comum', pos: [0, 1] },
        { id: 'z', nome: 'Dona Norma', tipo: 'assunto', pos: [2, 1], recolhe: 5 },
        { id: 'e', nome: 'Edu', tipo: 'comum', pos: [3, 1] },
        { id: 'v', nome: 'Ivo', tipo: 'comum', pos: [4, 1] },
        { id: 'c', nome: 'Cida', tipo: 'comum', pos: [0, 2], interesse: { ordem: 1 } },
        { id: 'l', nome: 'Lia', tipo: 'comum', pos: [1, 2] },
        { id: 'u', nome: 'Rui', tipo: 'comum', pos: [2, 2] },
        { id: 'i', nome: 'Bia', tipo: 'comum', pos: [3, 2] },
        { id: 'a', nome: 'Ana', tipo: 'comum', pos: [4, 2], interesse: { ordem: 2 } },
        { id: 'd', nome: 'Davi', tipo: 'comum', pos: [1, 3] },
        { id: 'n', nome: 'Neide', tipo: 'fofoqueira', pos: [2, 3] },
        { id: 'j', nome: 'Jandira', tipo: 'comum', pos: [4, 3] },
      ],
      amizades: [['b', 'k'], ['b', 'r'], ['c', 'r'], ['l', 'c'], ['d', 'l'], ['d', 'n'], ['n', 'u'], ['u', 'z'], ['u', 'i'], ['i', 'e'], ['i', 'a'], ['o', 'e'], ['v', 'e'], ['v', 'a'], ['a', 'j']],
      interfones: [['n', 'k']],
      solucao: { r: 'b', b: 'k', k: 'n', d: 'l', l: 'c', u: 'i', i: 'e', e: 'v', v: 'a' },
      armadilha: { r: 'b', b: 'k', k: 'n', d: 'l', l: 'c', u: 'i', i: 'a' }, // Bia → Ana direto: a Ana ouve junto da Cida
    },
  },
];
