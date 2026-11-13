import { describe, expect, it } from 'vitest';
import { fasesAlto } from './alto';
import { enquadrar } from './Cena';
import { custo, jogar, resolverTrilho } from './trilho';
import { FOLGA, papelDoZe } from './fabrica';
import { formatoDe } from './planta';

describe('bloco Prédio alto', () => {
  it.each(fasesAlto.map((f) => [f.titulo, f] as const))('%s: uma solução só, e o caminho tentador perde', (_t, f) => {
    const sols = resolverTrilho(f);
    expect(sols).toHaveLength(1);
    expect(jogar(f, f.solucao).vitoria).toBe(true);
    expect(jogar(f, f.armadilha!).vitoria).toBe(false);
  });

  it.each(fasesAlto.map((f) => [f.titulo, f] as const))('%s: feito pela fábrica de hoje (planta desenhada, folga de 1 seta, o Zé pesa)', (_t, f) => {
    // ⚠️ 2026-11-13: antes eram da fábrica antiga (torre com cômodo vazio, Zé de enfeite)
    expect(formatoDe(f)).toBeDefined();
    expect(f.setas).toBe(custo(f.solucao) + FOLGA);
    expect(resolverTrilho(f, custo(f.solucao))).toHaveLength(1);
    expect(papelDoZe(f, custo(f.solucao), f.solucao)).toBeDefined();
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

  it('prédio de 4 colunas que cabe inteiro NÃO rola, mesmo com o cômodo menor que 100 px', () => {
    // ⚠️ num celular de 390 de largura o prédio de 4 colunas fica com cômodo de ~90 px (o limite é a largura). O
    // "rola" ligava só por causa disso, sem nada pra rolar: 102 dos 199 andares da campanha (achado jogando a campanha
    // inteira no painel, 2026-11-13). E com "rola" o tabuleiro deixa o navegador tratar o arrasto vertical como rolagem.
    const r = enquadrar(4 * 120 + 36, 66 - 14 + 4 * 112 + 26, 390, 620);
    expect(r.rola).toBe(false);
    expect(r.escala).toBeCloseTo(390 / 516);
    // e o que não cabe mesmo (6 andares) continua rolando
    expect(enquadrar(4 * 120 + 36, 66 + 8 * 112 + 26, 390, 620).rola).toBe(true);
  });
});
