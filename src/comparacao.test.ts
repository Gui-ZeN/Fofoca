import { describe, expect, it } from 'vitest';
import { amigosDe, espalhar, resolver } from './motor';
import { fasesGiros } from './comparacao';
import { espelhar, fasesTrilho } from './trilho';

describe.each(fasesGiros.map((f, i) => [i + 1, f.titulo, f] as const))('comparação %i (%s)', (_n, _t, f) => {
  it('setas prontas válidas', () => {
    for (const p of f.vizinhos) if (p.seta) expect(amigosDe(f, p.id), p.nome).toContain(p.seta);
  });

  it('sem girar nada, perde', () => {
    expect(espalhar(f, { origem: f.origens[0], setas: {} }).vitoria).toBe(false);
  });

  it('a solução pretendida vence e é a única com esses giros', () => {
    expect(espalhar(f, { origem: f.origens[0], setas: f.solucao }).vitoria).toBe(true);
    const sol = resolver(f);
    expect(sol.map((j) => JSON.stringify(Object.entries(j.setas).sort()))).toEqual([JSON.stringify(Object.entries(f.solucao).sort())]);
  });

  it('todos os giros são necessários', () => {
    expect(resolver({ ...f, giros: f.giros - 1 })).toHaveLength(0);
  });

  it('espelhado continua o mesmo quebra-cabeça', () => {
    expect(resolver(espelhar(f))).toHaveLength(1);
  });
});

// A/B justo: a mecânica que a pessoa encontra primeiro não pode ganhar ou perder uma explicação.
it('cada prédio reaproveitado tem a mesma dica nas duas mecânicas', () => {
  for (const g of fasesGiros.filter((f) => f.par)) {
    const t = fasesTrilho.find((f) => f.titulo === g.par)!;
    expect(g.dica, g.titulo).toBe(t.dica);
  }
});
