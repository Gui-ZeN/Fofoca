import { describe, expect, it } from 'vitest';
import { ACORDES, oQueToca, PASSO, PASSOS_POR_COMPASSO } from './musica';
import { frequencia } from './som';

describe('musiquinha de fundo', () => {
  it('meio-tempo: bumbo no 1, caixa no 3, e o chimbal no contratempo', () => {
    const compasso = Array.from({ length: PASSOS_POR_COMPASSO }, (_, p) => oQueToca(p));
    expect(compasso.flatMap((q, p) => (q.bumbo ? [p] : []))).toEqual([0, 10]);
    expect(compasso.flatMap((q, p) => (q.caixa ? [p] : []))).toEqual([8]);
    expect(compasso.flatMap((q, p) => (q.chimbal ? [p] : []))).toEqual([2, 6, 10, 14]);
    expect(PASSO).toBeGreaterThan(0.15); // lenta: é pra relaxar, não pra apressar quem pensa
  });

  it('gira os 4 acordes sem fim, e as notas soltas só entram na 2ª metade', () => {
    const acordeDoCompasso = (n: number) => oQueToca(n * PASSOS_POR_COMPASSO).acorde;
    expect([0, 1, 2, 3, 4, 5, 8].map(acordeDoCompasso)).toEqual([ACORDES[0], ACORDES[1], ACORDES[2], ACORDES[3], ACORDES[0], ACORDES[1], ACORDES[0]]);
    const brilhos = Array.from({ length: 8 * PASSOS_POR_COMPASSO }, (_, p) => oQueToca(p).brilho);
    expect(brilhos.slice(0, 4 * PASSOS_POR_COMPASSO).filter(Boolean)).toHaveLength(0);
    expect(brilhos.slice(4 * PASSOS_POR_COMPASSO).filter(Boolean)).toHaveLength(4);
  });

  it('está no mesmo tom das notas de ritmo do boato (sol): a escadinha não desafina com a música', () => {
    const classe = (hz: number) => ((Math.round(12 * Math.log2(hz / 440)) % 12) + 12) % 12; // 0 = lá
    const pentatonica = new Set([0, 1, 2, 3, 4].map((p) => classe(frequencia(p)))); // sol, lá, si, ré, mi
    const brilhos = Array.from({ length: 8 * PASSOS_POR_COMPASSO }, (_, p) => oQueToca(p).brilho).filter((x): x is number => !!x);
    expect(brilhos.every((hz) => pentatonica.has(classe(hz)))).toBe(true);
    expect(ACORDES.every((a) => a.notas.some((hz) => pentatonica.has(classe(hz))))).toBe(true);
  });
});
