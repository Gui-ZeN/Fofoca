// Capítulos e Fofoca do dia (2026-11-11, Guilherme: "seguir os blocos", com abertura/fechamento, índice por
// capítulo, desafio opcional e fofoca do dia). Puro e testado; as telas ficam no App, no Menu e no Capitulo.
//
// - Os 28 andares feitos à mão viram 4 capítulos curtos, um por regra que estreia ali.
// - Depois, um capítulo a cada 25 andares do estoque gerado: cada bloco termina num chefão de 6 andares.
// - Desafio opcional: a ★ de "de primeira" (andar vencido na primeira tentativa). ⚠️ Não é "menos setas":
//   toda fase tem solução única e mínima (medido em 178/178), então "menos setas" nunca aconteceria.

export interface Capitulo {
  numero: number;
  titulo: string;
  aviso: string; // o aviso do síndico na abertura (voz "Conforme o regulamento")
  inicio: number; // índice do 1º andar (0 = 1º andar)
  fim: number; // índice depois do último (exclusivo)
}

// os 4 feitos à mão: [título, aviso, até o índice (exclusivo)]
const FEITOS: [string, string, number][] = [
  ['Primeiros boatos', 'PROIBIDO COMENTAR A VIDA ALHEIA.', 5], // T1–T5, o tutorial
  ['Vizinhos novos', 'MORADOR NOVO DEVE SE APRESENTAR NA PORTARIA.', 14], // Exagerado, padaria, celular
  ['Fila da fofoca', 'RESPEITEM A ORDEM DE CHEGADA.', 20], // ordem
  ['Reunião de condomínio', 'A REUNIÃO SERÁ BREVE.', 28], // prédio cheio
];
export const FEITOS_A_MAO = 28;
export const POR_BLOCO = 25; // o estoque gerado: escada leve/média/pesada e um chefão no 25º

// temas dos capítulos gerados (repetem com outra numeração): situações de condomínio, nunca piada de aparência
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

export function capitulos(total: number): Capitulo[] {
  const lista: Capitulo[] = [];
  let inicio = 0;
  for (const [titulo, aviso, ate] of FEITOS) {
    if (inicio >= total) break;
    lista.push({ numero: lista.length + 1, titulo, aviso, inicio, fim: Math.min(ate, total) });
    inicio = ate;
  }
  for (let k = 0; inicio < total; k++, inicio += POR_BLOCO) {
    const [titulo, aviso] = TEMAS[k % TEMAS.length];
    lista.push({ numero: lista.length + 1, titulo, aviso, inicio, fim: Math.min(inicio + POR_BLOCO, total) });
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
export function textoDoDia(data: string, tentativas: number, endereco: string): string {
  const [a, m, d] = data.split('-');
  const como = tentativas <= 1 ? 'de primeira ★' : `na ${tentativas}ª tentativa`;
  return `Fofoca! do dia ${d}/${m}/${a}: espalhei ${como} sem a vítima descobrir. ${endereco}`;
}
