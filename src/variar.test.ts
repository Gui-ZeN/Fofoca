import { describe, expect, it } from 'vitest';
import { amigosDe, resolver } from './motor';
import { fases } from './fases';
import { justa, variar } from './variar';

const SEMENTES = Array.from({ length: 25 }, (_, i) => i * 7919 + 13);
const assinatura = (f: ReturnType<typeof variar>) =>
  JSON.stringify(f.vizinhos.map((v) => [v.nome, v.pos, v.seta]).sort());

describe.each(fases.map((f, i) => [i + 1, f] as const))('variações da fase %i', (n, base) => {
  const tutorial = n === 1;

  it('a fase desenhada à mão já é justa', () => {
    expect(justa(base, tutorial)).toBe(true);
  });

  it('toda variação sorteada é justa e bem formada', () => {
    for (const s of SEMENTES) {
      const f = variar(base, s, tutorial);
      expect(justa(f, tutorial), `semente ${s}`).toBe(true);
      // mesmos moradores, mesmos apartamentos, mesmas passagens
      expect(f.vizinhos.map((v) => v.nome).sort()).toEqual(base.vizinhos.map((v) => v.nome).sort());
      expect(f.vizinhos.map((v) => v.pos.join()).sort()).toEqual(base.vizinhos.map((v) => v.pos.join()).sort());
      expect(f.amizades).toEqual(base.amizades);
      for (const v of f.vizinhos) if (v.seta) expect(amigosDe(f, v.id)).toContain(v.seta);
    }
  });

  it('a mesma semente dá a mesma variação', () => {
    expect(assinatura(variar(base, 42, tutorial))).toBe(assinatura(variar(base, 42, tutorial)));
  });

  // A rota que o jogador vê: em qual apartamento tocar e quais setas girar para onde.
  it('as sementes geram rotas diferentes', () => {
    const rotas = new Set(SEMENTES.map((s) => {
      const f = variar(base, s, tutorial);
      const pos = (id: string) => f.vizinhos.find((v) => v.id === id)!.pos.join(',');
      return JSON.stringify(resolver(f).map((j) => [pos(j.origem), Object.entries(j.setas).map(([a, b]) => [pos(a), pos(b)])]).sort());
    }));
    // tutoriais pequenos (4 vizinhos ou menos) quase não têm o que embaralhar, e tudo bem
    expect(rotas.size).toBeGreaterThanOrEqual(base.vizinhos.length >= 5 ? 4 : 1);
  });
});
