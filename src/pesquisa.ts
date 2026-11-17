// A sequência do teste com 5 pessoas (`?pesquisa`), desde 2026-11-17. Pedido do dono: "o Pesquisa deveria ter todas as mecânicas,
// fases difíceis, tudo" — em uns 25 andares (decisão dele, pra caber numa sessão), TODAS as mecânicas, até as que ele já achou
// fracas (ronda, Dr. Álvaro: "o teste é pra saber o que gente de fora acha"), e sem avisar que algum andar é difícil.
// Como ensina: cada mecânica estreia num andar FÁCIL (a 1ª fase do bloco dela, com a cena de chegada quando existe, senão a
// linha NOVO) e depois volta misturada num andar desenhado difícil, que só usa o que já estreou — inclusive dois seguidos.
// ⚠️ Rótulos únicos na sequência e iguais às chaves das cenas de chegada (V1, N1, A1…): a cena aparece pelo rótulo. Os
// desenhados são Q + a posição no mix (Q11, Q27…). Antes (15 min) os desenhados eram D1–D5, que JÁ são andares da campanha
// ("Prédio cheio"): vencer um marcava o outro como vencido.
import type { FaseTrilho } from './trilho';
import type { Capitulo } from './capitulos';
import { CAMPANHA } from './campanha';
import { MIX } from './desenhados/index';
import { fasesNonato } from './nonato';
import { fasesArnaldo } from './arnaldo';
import { fasesRaquel } from './raquel';
import { fasesApressado } from './apressado';
import { fasesAlvaro, fasesNorma } from './fiscais';
import { fasesSaida } from './saida';
import { fasesRonda } from './ronda';
import { fasesSoneca } from './soneca';
import { fasesInterfone } from './interfone';
import { fasesMuro } from './muro';
import { fasesEsfria } from './esfria';

export interface AndarDaPesquisa { rotulo: string; fase: FaseTrilho; dificil?: boolean }

const campanha = (rotulo: string): AndarDaPesquisa => {
  const a = CAMPANHA.find((x) => x.rotulo === rotulo);
  if (!a) throw new Error(`andar da campanha não encontrado: ${rotulo}`);
  return { rotulo, fase: a.fase as FaseTrilho };
};
const estreia = (rotulo: string, fases: FaseTrilho[]): AndarDaPesquisa => ({ rotulo, fase: fases[0] });
const desenhado = (titulo: string): AndarDaPesquisa => {
  const i = MIX.findIndex((x) => x.fase.titulo === titulo);
  if (i < 0) throw new Error(`andar desenhado não encontrado: ${titulo}`);
  return { rotulo: `Q${i + 1}`, fase: MIX[i].fase, dificil: true };
};

export const SEQUENCIA_PESQUISA: AndarDaPesquisa[] = [
  // 1–5 · o tutorial de sempre: seta, guardar, passar adiante, Fofoqueira (com a cena da Neide)
  campanha('T1'), campanha('T2'), campanha('T3'), campanha('T4'), campanha('T5'),
  // 6–10 · vizinhos novos
  campanha('T8'), // Exagerado e tamanho exato (cena)
  campanha('H2'), // padaria (cena)
  campanha('T10'), // celular (cena)
  campanha('O1'), // ordem (cena)
  { ...campanha('D6'), dificil: true }, // Reunião de condomínio: Fofoqueira + Exagerado + padaria + ordem, 6 setas
  // 11–14 · os fiscais
  campanha('V1'), // Vera (cena)
  estreia('N1', fasesNonato), // Nonato, o Do Contra (cena)
  estreia('A1', fasesArnaldo), // Arnaldo (cena)
  desenhado('Dois exagerados, uma fresta'), // Exagerado + Do Contra + tamanho + versão + Arnaldo, 8 setas
  // 15–18 · o relógio
  estreia('M1', fasesNorma), // Dona Norma (cena)
  estreia('Z1', fasesSoneca), // Soneca (linha NOVO)
  estreia('I1', fasesInterfone), // interfone (cena)
  desenhado('O telefone do 402'), // Fofoqueira + ordem + fio + Norma, 9 setas
  // 19–23 · gente difícil
  estreia('P1', fasesApressado), // Nando (cena)
  estreia('R1', fasesRaquel), // Raquel (cena)
  estreia('G1', fasesRonda), // ronda (linha NOVO)
  desenhado('Dois fiscais, uma Raquel'), // Nando + Raquel + ronda + Norma, 7 setas
  desenhado('A volta da Neide'), // padaria + ordem + Soneca + Norma, 7 setas — dois difíceis seguidos
  // 24–28 · o fim do dia
  estreia('S1', fasesSaida), // sai de casa (cena)
  estreia('L1', fasesAlvaro), // Dr. Álvaro (cena)
  estreia('J1', fasesMuro), // muro fino (linha NOVO)
  estreia('K1', fasesEsfria), // boato que esfria (linha NOVO)
  desenhado('Ponto de ronda'), // padaria + sai + Soneca + ronda, 10 setas: o fechamento
];

// Capítulos da pesquisa (abertura com o aviso da administração, como na campanha). Índices: 0 = 1º andar; `fim` exclusivo.
const cap = (numero: number, titulo: string, aviso: string, inicio: number, fim: number): Capitulo => ({ numero, titulo, aviso, inicio, fim });
export const CAPITULOS_PESQUISA: Capitulo[] = [
  cap(1, 'Primeiros boatos', 'PROIBIDO COMENTAR A VIDA ALHEIA.', 0, 5),
  cap(2, 'Vizinhos novos', 'MORADOR NOVO DEVE SE APRESENTAR NA PORTARIA.', 5, 10),
  cap(3, 'Os fiscais do prédio', 'A VIGILÂNCIA É PARA A SEGURANÇA DE TODOS.', 10, 14),
  cap(4, 'O toque de recolher', 'APÓS O TOQUE DE RECOLHER, NENHUMA CONVERSA NOS CORREDORES.', 14, 18),
  cap(5, 'A desconfiada do 105', 'BOATO SEM DUAS FONTES NÃO SERÁ AFIXADO NO MURAL.', 18, 23),
  cap(6, 'A saída das seis', 'QUEM SAIR DE CASA DEVE AVISAR A PORTARIA.', 23, 28),
];
