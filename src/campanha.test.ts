import { describe, expect, it } from 'vitest';
import type { FaseTrilho } from './trilho';
import { CAMPANHA, ESTOQUE, ORDEM_CAMPANHA, PREDIO, TUTORIAL, VOLTAS } from './campanha';
import { jogar } from './trilho';

// o que cada regra precisa ter sido apresentada antes de aparecer
const usa: Record<string, (f: FaseTrilho) => boolean> = {
  exagerado: (f) => f.vizinhos.some((v) => v.tipo === 'exagerado' || !!v.interesse?.tamanho),
  padaria: (f) => f.vizinhos.some((v) => !!v.chega),
  celular: (f) => f.vizinhos.some((v) => !!v.celular),
  ordem: (f) => f.vizinhos.some((v) => !!v.interesse?.ordem),
};

describe('campanha', () => {
  it('tem as 31 fases do trilho, de cada bloco, uma vez só', () => {
    expect(CAMPANHA).toHaveLength(31);
    expect(new Set(ORDEM_CAMPANHA).size).toBe(31);
    expect(CAMPANHA.every((a) => a.fase)).toBe(true);
    for (const letra of ['T', 'H', 'O', 'D', 'V']) expect(ORDEM_CAMPANHA.filter((r) => r.startsWith(letra)).length).toBeGreaterThan(0);
  });

  it('começa pelo tutorial T1–T5, o único trecho com dica', () => {
    expect(ORDEM_CAMPANHA.slice(0, TUTORIAL)).toEqual(['T1', 'T2', 'T3', 'T4', 'T5']);
    expect(CAMPANHA.slice(TUTORIAL).every((a) => !a.fase.dica)).toBe(true);
  });

  it('o prédio continua depois das 31: estoque gerado e, acabando, ele de novo (espelhado numa volta sim, outra não)', () => {
    expect(PREDIO.slice(0, 31)).toEqual(CAMPANHA);
    expect(PREDIO).toHaveLength(31 + ESTOQUE.length * VOLTAS);
    expect(PREDIO[31].fase).toBe(ESTOQUE[0]);
    const espelhada = PREDIO[31 + ESTOQUE.length].fase; // 2ª volta
    expect(espelhada).not.toBe(ESTOQUE[0]);
    expect(jogar(espelhada, ESTOQUE[0].solucao).vitoria).toBe(true); // mesmo quebra-cabeça
    expect(new Set(PREDIO.map((a) => a.rotulo)).size).toBe(PREDIO.length); // rótulos únicos (tentativas por andar)
  });

  it.each(Object.keys(usa))('a 1ª fase com %s é a que traz a etiqueta NOVO', (regra) => {
    const primeira = CAMPANHA.find((a) => usa[regra](a.fase))!;
    expect(primeira.fase.novidade, primeira.rotulo).toBeTruthy();
  });
});
