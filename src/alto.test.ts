import { describe, expect, it } from 'vitest';
import { fasesAlto } from './alto';
import { enquadrar } from './Cena';
import { jogar, resolverTrilho } from './trilho';

describe('bloco Prédio alto', () => {
  it.each(fasesAlto.map((f) => [f.titulo, f] as const))('%s: uma solução só, e o caminho tentador perde', (_t, f) => {
    const sols = resolverTrilho(f);
    expect(sols).toHaveLength(1);
    expect(jogar(f, f.solucao).vitoria).toBe(true);
    expect(jogar(f, f.armadilha!).vitoria).toBe(false);
  });

  it('5 e 6 andares de verdade', () => {
    expect(fasesAlto.map((f) => Math.max(...f.vizinhos.map((v) => v.pos[1])) + 1)).toEqual([5, 6]);
  });
});

describe('enquadrar (rolagem do prédio alto)', () => {
  // palco de um celular de 390×844: ~390 × 580 px
  it('prédio que cabe não rola (3×4 de hoje)', () => {
    expect(enquadrar(408, 66 + 4 * 136 + 26, 390, 580).rola).toBe(false);
  });
  it('6 andares rola, e o cômodo não fica menor que 100 px', () => {
    const r = enquadrar(408, 66 + 6 * 136 + 26, 390, 580);
    expect(r.rola).toBe(true);
    expect(r.escala * 120).toBeGreaterThanOrEqual(100);
    expect(r.escala * 408).toBeLessThanOrEqual(390); // e não passa da largura da tela
  });
  it('sem tamanho medido ainda, encaixa (não rola)', () => {
    expect(enquadrar(408, 900, 0, 0).rola).toBe(false);
  });
});
