// Capítulos e Fofoca do dia (2026-11-11, Guilherme: "seguir os blocos", com abertura/fechamento, índice por
// capítulo, desafio opcional e fofoca do dia). Puro e testado; as telas ficam no App, no Menu e no Capitulo.
//
// - Os 31 andares feitos à mão viram 5 capítulos curtos, um por regra que estreia ali.
// - Depois, os capítulos seguem os SEGMENTOS da campanha (campanha.ts): cada capítulo é (as estreias, se houver) + o bloco
//   gerado de 25 que vem depois delas, e termina no chefão do bloco. O capítulo 6 é só o bloco 0 (nenhuma estreia antes).
// - Desafio opcional: a ★ de "de primeira" (andar vencido na primeira tentativa). ⚠️ Não é "menos setas":
//   toda fase tem solução única e mínima (medido em 178/178), então "menos setas" nunca aconteceria.

import type { Segmento } from './campanha';

export interface Capitulo {
  numero: number;
  titulo: string;
  aviso: string; // o aviso do síndico na abertura (voz "Conforme o regulamento")
  inicio: number; // índice do 1º andar (0 = 1º andar)
  fim: number; // índice depois do último (exclusivo)
}

// os 5 feitos à mão: [título, aviso, até o índice (exclusivo)]
const FEITOS: [string, string, number][] = [
  ['Primeiros boatos', 'PROIBIDO COMENTAR A VIDA ALHEIA.', 5], // T1–T5, o tutorial
  ['Vizinhos novos', 'MORADOR NOVO DEVE SE APRESENTAR NA PORTARIA.', 14], // Exagerado, padaria, celular
  ['Fila da fofoca', 'RESPEITEM A ORDEM DE CHEGADA.', 20], // ordem
  ['Reunião de condomínio', 'A REUNIÃO SERÁ BREVE.', 28], // prédio cheio
  ['A vigia do terceiro', 'A VIGILÂNCIA É PARA A SEGURANÇA DE TODOS.', 31], // Vera
];

// Capítulos de estreia (2026-11-13): título e aviso, na voz "Conforme o regulamento". Chave = id do segmento de estreia.
// ⚠️ A Raquel e as Duplas formam UM capítulo (duas estreias seguidas, antes do mesmo bloco): vale a 1ª, e as duplas não têm texto.
const ESTREIAS: Record<string, [string, string]> = {
  nando: ['O apressado do 204', 'É PROIBIDO CORRER NOS CORREDORES.'],
  raquel: ['A desconfiada do 105', 'BOATO SEM DUAS FONTES NÃO SERÁ AFIXADO NO MURAL.'],
  saida: ['A saída das seis', 'QUEM SAIR DE CASA DEVE AVISAR A PORTARIA.'],
  arnaldo: ['O fiscal do barulho', 'BARULHO SOMENTE ATÉ AS 22 HORAS.'],
  norma: ['O toque de recolher', 'APÓS O TOQUE DE RECOLHER, NENHUMA CONVERSA NOS CORREDORES.'],
};

// temas dos capítulos gerados sem estreia (o bloco 0 e as voltas; repetem com outra numeração): situações de condomínio, nunca piada de aparência
const TEMAS: [string, string][] = [
  ['A encomenda misteriosa', 'ENCOMENDA ALHEIA NÃO SE ABRE NEM SE COMENTA.'],
  ['A festa surpresa', 'FESTA SÓ COM AUTORIZAÇÃO DA ADMINISTRAÇÃO.'],
  ['O bolo desaparecido', 'QUEM PEGOU O BOLO DO SALÃO, FAVOR DEVOLVER.'],
  ['A obra no 302', 'OBRA SÓ EM HORÁRIO COMERCIAL.'],
  ['O apagão', 'NO ESCURO TAMBÉM VALE O REGULAMENTO.'],
  ['A vaga da garagem', 'CADA UM NA SUA VAGA.'],
  ['O gato do 501', 'ANIMAL NA ÁREA COMUM SÓ NA COLEIRA.'],
  ['A eleição do síndico', 'O SÍNDICO CONTINUA SENDO O SÍNDICO.'],
  ['O varal compartilhado', 'ROUPA ALHEIA NÃO SE COMENTA.'],
  ['O interfone quebrado', 'RECADO SE DÁ NA PORTARIA, NÃO NA ESCADA.'],
];

export function capitulos(segmentos: Segmento[]): Capitulo[] {
  const lista: Capitulo[] = [];
  let inicio = 0;
  for (const [titulo, aviso, ate] of FEITOS) {
    lista.push({ numero: lista.length + 1, titulo, aviso, inicio, fim: ate });
    inicio = ate;
  }
  let tema = 0;
  let estreias: Segmento[] = [];
  for (const seg of segmentos) {
    if (seg.tipo === 'feitos') continue;
    if (seg.tipo === 'estreia') { estreias.push(seg); continue; }
    const [titulo, aviso] = estreias.length ? ESTREIAS[estreias[0].id] : TEMAS[tema++ % TEMAS.length];
    lista.push({ numero: lista.length + 1, titulo, aviso, inicio: (estreias[0] ?? seg).inicio, fim: seg.fim });
    estreias = [];
  }
  return lista;
}

export const capituloDe = (lista: Capitulo[], indice: number) => lista.find((c) => indice >= c.inicio && indice < c.fim);

// ★ de um andar: vencido na 1ª tentativa e sem seta além do mínimo (`minimo` indefinido = modo sem setas).
// ⚠️ O "sem seta além" veio com a folga dos andares gerados (fabrica.ts): sem ele, a folga barateava a ★.
export const ganhaEstrela = (tentativa: number, usadas: number, minimo?: number) =>
  tentativa === 1 && (minimo === undefined || usadas <= minimo);

// ★ do capítulo: quantos andares dele foram vencidos de primeira
export const estrelas = (c: Capitulo, rotulos: string[], primeira: Set<string>) =>
  rotulos.slice(c.inicio, c.fim).filter((r) => primeira.has(r)).length;

// ---------- Fofoca do dia ----------

// A data do APARELHO (não UTC): ⚠️ usar a data de toISOString() viraria o dia às 21h em Fortaleza
// (bug já visto em outros projetos). Formato AAAA-MM-DD.
export function dataLocal(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

// O mesmo andar pra todo mundo no mesmo dia (dentre os candidatos: os andares leves e médios do estoque).
export function andarDoDia(d: Date, candidatos: number[]): number {
  const dia = Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86_400_000);
  return candidatos[(dia * 7919) % candidatos.length];
}

// O que vai no compartilhar: o dia e o resultado, nunca a solução.
// ⚠️ `estrela` vem de `ganhaEstrela`, não das tentativas: de primeira mas gastando a seta de folga não ganha a ★, e o
// texto prometia uma mesmo assim (achado do Astra, Consulta 9).
export function textoDoDia(data: string, tentativas: number, endereco: string, estrela: boolean): string {
  const [a, m, d] = data.split('-');
  const como = tentativas <= 1 ? (estrela ? 'de primeira ★' : 'de primeira') : `na ${tentativas}ª tentativa`;
  return `Fofoca! do dia ${d}/${m}/${a}: espalhei ${como} sem a vítima descobrir. ${endereco}`;
}
