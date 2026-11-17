// Os andares desenhados pelos 5 designers (2026-11-17), juntos num bloco de teste (`?bloco=desenhados`), na ordem de um
// MIX de campanha: fácil, médio e difícil intercalados, com dois difíceis seguidos onde o designer pediu (o dono: "pode ter 2
// difíceis em sequência, não somente andares chefões"). Todos passam em scripts/conferirAndar.ts.
import type { FaseTrilho } from '../trilho';
import type { AndarDesenhado } from './tipo';
import { andares as d1 } from './designer1';
import { andares as d2 } from './designer2';
import { andares as d3 } from './designer3';
import { andares as d4 } from './designer4';
import { andares as d5 } from './designer5';
import { andares as chefe } from './chefe';

const pega = (lista: AndarDesenhado[], titulo: string) => {
  const a = lista.find((x) => x.fase.titulo === titulo);
  if (!a) throw new Error(`andar desenhado não encontrado: ${titulo}`);
  return a;
};

export const MIX: AndarDesenhado[] = [
  pega(d5, 'A Vera ouviu o corredor'), // fácil
  pega(d2, 'A ronda e o cochilo'), // fácil
  pega(d1, 'Quem fala, ela ouve'), // fácil
  pega(d4, 'Fala baixo, Beto'), // fácil
  pega(d3, 'Atalho na ronda'), // fácil
  pega(d1, 'Dois olhos no mesmo caminho'), // médio
  pega(d2, 'Depois das dez'), // fácil (respiro)
  pega(d5, 'Passa reto, não passa por mim'), // fácil (estreia do Nando)
  pega(d4, 'Nonato primeiro'), // médio
  pega(d3, 'Linha direta com a Cida'), // médio
  pega(d4, 'Dois exagerados, uma fresta'), // difícil
  pega(d4, 'Do avesso, devagar'), // difícil — dois seguidos (Designer 4)
  pega(d4, 'Do avesso, sem a Vera'), // fácil (respiro)
  pega(d1, 'A ronda do Seu Zé'), // fácil
  pega(d2, 'Janela da padaria'), // médio
  pega(d3, 'Sinal fraco'), // médio
  pega(d5, 'Reto até a Vera'), // médio
  pega(d1, 'A Soneca no meio do caminho'), // médio
  pega(d3, 'Ramal de cima'), // difícil
  pega(d3, 'Dois fios, uma Vera'), // difícil — dois seguidos (Designer 3)
  pega(d3, 'Duas linhas pra Cida'), // fácil (respiro)
  pega(d5, 'Duas vezes pra acreditar'), // médio
  pega(d2, 'A Bia volta às cinco'), // médio
  pega(d1, 'O compasso da Soneca'), // difícil
  pega(d1, 'A guarda de cinco batidas'), // difícil — dois seguidos (Designer 1)
  pega(d5, 'Quem acredita em quem'), // difícil
  pega(d5, 'Dois fiscais, uma Raquel'), // difícil — dois seguidos, o 2º com dois vilões (Designer 5)
  pega(d2, 'A volta da Neide'), // difícil
  pega(d2, 'Ponto de ronda'), // difícil — o fechamento, três relógios
  pega(chefe, 'O telefone do 402'), // difícil — proposta do dono, montada pelo Chefe (2026-11-17)
];
export const FASES_DESENHADAS: FaseTrilho[] = MIX.map((a) => a.fase);
