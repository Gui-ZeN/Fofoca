// A FORMA do prédio: onde pode morar gente (o resto fica vazio) e se a rede tem gargalo.
// ⚠️ Até 2026-11-12 os vazios eram sobra do sorteio, e 95% dos vizinhos tinham passagem entre si: todo andar era uma
// grade cheia com um ou dois furos, e o vazio raramente decidia alguma coisa (medido pelo Opus na Consulta 7; o dono
// perguntou "qual a pegada dos apartamentos vazios?"). Agora o vazio é PAREDE desenhada de propósito: o prédio tem
// formato (L, U, poço, H, degraus), e o formato faz o gargalo — um morador por onde o boato é obrigado a passar.

import { amigosDe, type Fase } from './motor';

export type Formato = 'cheio' | 'L' | 'U' | 'poco' | 'H' | 'degraus';

// As células (coluna, andar) onde pode morar alguém, num prédio de `colunas` × `andares`. O andar 0 é o de cima;
// o térreo (andares - 1) está sempre inteiro — prédio não flutua.
export function celulas(formato: Formato, andares: number, espelhado: boolean, colunas = 3): [number, number][] {
  const terreo = andares - 1;
  const meio = (c: number) => c > 0 && c < colunas - 1; // as colunas de dentro (uma só no prédio de 3)
  const fica = (c: number, r: number) => {
    // bloco embaixo e uma torre de um lado (a base engrossa no prédio de 5, pra caber a lotação do molde)
    if (formato === 'L') return r > terreo - (andares >= 5 ? 3 : 2) || c === 0;
    // duas torres ligadas por baixo
    if (formato === 'U') return r > terreo - (andares >= 4 ? 2 : 1) || !meio(c);
    // um anel em volta de um poço no meio
    if (formato === 'poco') return !meio(c) || r === 0 || r > Math.max(1, andares - 3);
    // duas torres com uma ponte no meio da altura (e o térreo)
    if (formato === 'H') return !meio(c) || r === terreo || r === Math.floor(terreo / 2);
    // uma escadaria: um cômodo no alto, dois no andar de baixo, e daí pra baixo o prédio inteiro
    if (formato === 'degraus') return c <= r + colunas - 3; // no prédio de 4 colunas o degrau do alto tem 2 cômodos
    return true;
  };
  const out: [number, number][] = [];
  for (let r = 0; r < andares; r++) for (let c = 0; c < colunas; c++) if (fica(c, r)) out.push([espelhado ? colunas - 1 - c : c, r]);
  return out;
}

// ⚠️ 'cheio' (grade inteira com furos sorteados) fica fora do sorteio: é o prédio antigo, em que o vazio não diz nada.
// ⚠️ Não ponha de volta o zigue-zague (2 de largura trocando de lado): vira uma árvore, o caminho é um só e o certificado
// recusa tudo — 0 andares em 1,4 milhão de tentativas, nos três pesos em que cabia (medido em 2026-11-12).
export const FORMATOS: Formato[] = ['L', 'U', 'poco', 'H', 'degraus'];

// Em que planta o prédio foi desenhado: a que contém todos os moradores e deixa, no máximo, 1 cômodo sem ninguém.
export function formatoDe(f: Fase): Formato | undefined {
  const andares = Math.max(...f.vizinhos.map((v) => v.pos[1])) + 1;
  for (const formato of FORMATOS) for (const espelhado of [false, true]) {
    const cel = new Set(celulas(formato, andares, espelhado, Math.max(...f.vizinhos.map((v) => v.pos[0])) + 1).map((p) => p.join()));
    if (cel.size - f.vizinhos.length <= 1 && f.vizinhos.every((v) => cel.has(v.pos.join()))) return formato;
  }
}

// Gargalo: existe um morador (fora a origem e a vítima) que, tirado, separa a origem de alguma estrela.
export function temGargalo(f: Fase): boolean {
  const origem = f.origens?.[0];
  if (!origem) return false;
  const estrelas = f.vizinhos.filter((v) => v.interesse).map((v) => v.id);
  const alcanca = (sem: string) => {
    const visto = new Set([origem]); const fila = [origem];
    while (fila.length) for (const y of amigosDe(f, fila.shift()!)) if (y !== sem && !visto.has(y)) { visto.add(y); fila.push(y); }
    return visto;
  };
  return f.vizinhos.some((v) => v.id !== origem && v.tipo !== 'assunto' && !v.interesse && estrelas.some((e) => !alcanca(v.id).has(e)));
}
