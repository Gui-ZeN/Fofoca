import { describe, expect, it } from 'vitest';
import { frequencia, semitons, tocar } from './som';

describe('som de ritmo', () => {
  it('cada batida sobe um degrau da pentatônica, e continua subindo depois da oitava', () => {
    expect([0, 1, 2, 3, 4, 5, 6].map(semitons)).toEqual([0, 2, 4, 7, 9, 12, 14]);
    const fs = Array.from({ length: 12 }, (_, i) => frequencia(i));
    for (let i = 1; i < fs.length; i++) expect(fs[i]).toBeGreaterThan(fs[i - 1]);
    expect(frequencia(5)).toBeCloseTo(frequencia(0) * 2); // 5 degraus = uma oitava
  });

  it('sem navegador (testes, servidor) não quebra', () => {
    expect(() => tocar('recado', 3)).not.toThrow();
  });
});
