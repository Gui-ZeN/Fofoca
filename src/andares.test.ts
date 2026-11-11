import { describe, expect, it } from 'vitest';
import { alvosDe } from './motor';
import { custo, jogar, resolverTrilho, type FaseTrilho } from './trilho';
import estoque from './andares.json';

// Recertifica o estoque gerado sem confiar no gerador: as mesmas garantias das fases feitas à mão.
const fases = (estoque as unknown as { pos: number; peso: string; fase: FaseTrilho }[]);

describe('estoque de andares gerados', () => {
  it('150 andares, nas posições 0..149, com a escada leve/média/pesada e um chefão por bloco de 25', () => {
    expect(fases).toHaveLength(150);
    fases.forEach((a, i) => expect(a.pos).toBe(i));
    expect(fases.filter((a) => a.peso === 'chefe').map((a) => a.pos)).toEqual([24, 49, 74, 99, 124, 149]);
  });

  it.each(fases.map((a) => [a.pos, a.fase.titulo, a.fase] as const))('andar gerado %i (%s)', (_p, _t, f) => {
    // bem montado: posições únicas, passagens só entre vizinhos de porta, origem comum sem estrela
    expect(new Set(f.vizinhos.map((v) => v.pos.join())).size).toBe(f.vizinhos.length);
    const pos = Object.fromEntries(f.vizinhos.map((v) => [v.id, v.pos]));
    for (const [a, b] of f.amizades) expect(Math.abs(pos[a][0] - pos[b][0]) + Math.abs(pos[a][1] - pos[b][1])).toBe(1);
    expect(f.vizinhos.some((v) => v.id === f.origens[0] && v.tipo === 'comum' && !v.interesse)).toBe(true);
    for (const [de, para] of Object.entries(f.solucao)) expect(alvosDe(f, f.vizinhos.find((v) => v.id === de)!)).toContain(para);
    // a solução vence, é a única nas setas, e com uma a menos não dá
    expect(jogar(f, f.solucao).vitoria).toBe(true);
    expect(custo(f.solucao)).toBe(f.setas);
    expect(resolverTrilho(f)).toHaveLength(1);
    expect(resolverTrilho(f, f.setas - 1)).toHaveLength(0);
    // a armadilha (o caminho mais curto) perde
    expect(jogar(f, f.armadilha!).vitoria).toBe(false);
    // texto sem aparência como piada (PRODUCT.md)
    expect(f.boato).not.toMatch(/bigode|peruca|careca|gord|magr|feio|nariz|barriga/i);
  });
});
