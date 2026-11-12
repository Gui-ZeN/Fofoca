import { describe, expect, it } from 'vitest';
import { amigosDe, type Fase, type Vizinho } from './motor';
import { fasesDuplas } from './duplas';
import { fasesNorma, fasesVera } from './fiscais';
import { jogar, resolverTrilho } from './trilho';

const mesma = (a: Record<string, string>[], b: Record<string, string>) =>
  a.length === 1 && JSON.stringify(Object.entries(a[0]).sort()) === JSON.stringify(Object.entries(b).sort());
// cada regra do andar, e como tirá-la
const REGRAS: [string, (v: Vizinho) => boolean, (v: Vizinho) => Vizinho][] = [
  ['Vera', (v) => !!v.vigia, (v) => ({ ...v, vigia: undefined })],
  ['Dona Norma', (v) => !!v.recolhe, (v) => ({ ...v, recolhe: undefined })],
  ['Dr. Álvaro', (v) => !!v.teto, (v) => ({ ...v, teto: undefined })],
  ['Raquel', (v) => !!v.desconfia, (v) => ({ ...v, desconfia: undefined })],
  ['Nando', (v) => v.tipo === 'apressado', (v) => (v.tipo === 'apressado' ? { ...v, tipo: 'comum' } : v)],
];
const tira = <F extends Fase>(f: F, fn: (v: Vizinho) => Vizinho): F => ({ ...f, vizinhos: f.vizinhos.map(fn) });

describe.each(fasesDuplas.map((f) => [f.titulo, f] as const))('dupla: %s', (_t, f) => {
  it('uma solução só, nas setas justas, e a armadilha perde', () => {
    expect(mesma(resolverTrilho(f), f.solucao)).toBe(true);
    expect(resolverTrilho(f, f.setas - 1)).toHaveLength(0);
    expect(jogar(f, f.armadilha!).vitoria).toBe(false);
  });

  it('as DUAS regras mudam a jogada (tirando qualquer uma, a solução é outra)', () => {
    const presentes = REGRAS.filter(([, tem]) => f.vizinhos.some(tem));
    expect(presentes.length + (f.vizinhos.some((v) => v.tipo === 'fofoqueira') ? 1 : 0)).toBeGreaterThanOrEqual(2);
    for (const [nome, , fn] of presentes) expect(mesma(resolverTrilho(tira(f, fn)), f.solucao), nome).toBe(false);
  });
});

describe('duplas: cada uma faz o que promete', () => {
  it('Fofoqueira + Nando: é a Fofoqueira que conta pro Nando, e ele passa adiante', () => {
    const r = jogar(fasesDuplas[0], fasesDuplas[0].solucao);
    expect(r.ouviu.p.de).toBe('n');
    expect(r.batidas.flat().some((m) => m.de === 'p')).toBe(true);
  });

  it('Nando + Raquel: o Nando é uma das duas fontes da Raquel', () => {
    const r = jogar(fasesDuplas[1], fasesDuplas[1].solucao);
    expect(r.ouviu.q).toBeDefined();
    expect(r.batidas.flat().some((m) => m.de === 'p' && m.para === 'q')).toBe(true);
  });

  it('Vera + Raquel: a Raquel acredita e a Vera não escuta ninguém', () => {
    const r = jogar(fasesDuplas[2], fasesDuplas[2].solucao);
    expect(r.ouviu.q).toBeDefined();
    expect(r.ouviu.z).toBeUndefined();
  });
});

describe('fiscais: a 3ª fase usa a regra como ferramenta', () => {
  it('Vera: a estrela mora colada nela (receber e guardar do lado dela pode)', () => {
    const f = fasesVera[2];
    expect(f.vizinhos.filter((v) => v.interesse).every((v) => amigosDe(f, 'z').includes(v.id))).toBe(true);
  });

  it('Dona Norma: uma Fofoqueira colada nela ouve na solução, já calada; sem o toque de recolher, a mesma jogada perde', () => {
    const f = fasesNorma[2];
    const r = jogar(f, f.solucao);
    expect(f.vizinhos.some((v) => v.tipo === 'fofoqueira' && amigosDe(f, 'z').includes(v.id) && r.ouviu[v.id])).toBe(true);
    expect(jogar(tira(f, (v) => ({ ...v, recolhe: undefined })), f.solucao).vitoria).toBe(false);
  });

});
