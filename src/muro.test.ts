import { describe, expect, it } from 'vitest';
import type { Fase } from './motor';
import { explicar } from './explicar';
import { fasesMuro } from './muro';
import { jogar, resolverTrilho } from './trilho';

describe('bloco Muro fino', () => {
  const rotulos = fasesMuro.map((f, i) => [`M${i + 1}`, f.titulo, f] as const);
  const semMuros = <F extends Fase>(f: F): F => ({ ...f, murosFinos: undefined });
  const semUm = <F extends Fase>(f: F, i: number): F => ({ ...f, murosFinos: f.murosFinos!.filter((_, j) => j !== i) });
  const mesma = (a: Record<string, string>[], b: Record<string, string>) =>
    a.length === 1 && JSON.stringify(Object.entries(a[0]).sort()) === JSON.stringify(Object.entries(b).sort());
  const dim = (f: Fase) => [Math.max(...f.vizinhos.map((x) => x.pos[0])) + 1, Math.max(...f.vizinhos.map((x) => x.pos[1])) + 1];

  it('são três: estreia (perigo), atalho e as duas paredes juntas', () => {
    expect(fasesMuro).toHaveLength(3);
    expect(fasesMuro.map((f) => f.murosFinos!.length)).toEqual([1, 1, 2]);
  });

  it('tamanhos: 3×3 ou 4×3, 4×3 ou 4×4, 4×4 ou 5×4 (até 15 moradores)', () => {
    expect(dim(fasesMuro[0])).toEqual([3, 3]);
    expect(dim(fasesMuro[1])).toEqual([4, 3]);
    expect(dim(fasesMuro[2])).toEqual([4, 4]);
    for (const f of fasesMuro) expect(f.vizinhos.length).toBeLessThanOrEqual(15);
  });

  it.each(rotulos)('%s (%s): solução única dentro das setas, e nenhuma com uma a menos', (_n, _t, f) => {
    expect(mesma(resolverTrilho(f), f.solucao)).toBe(true);
    expect(Object.keys(f.solucao).length).toBe(f.setas);
    expect(resolverTrilho(f, f.setas - 1)).toEqual([]);
    expect(jogar(f, f.solucao).vitoria).toBe(true);
  });

  it.each(rotulos)('%s (%s): ids de uma letra e únicos; quem tem nome tem desenho', (_n, _t, f) => {
    const ids = f.vizinhos.map((x) => x.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id).toHaveLength(1);
    const conhecidos = new Set(['Rita', 'Cida', 'Bia', 'Ana', 'Neide', 'Lu', 'Beto', 'Lúcia', 'Davi', 'Rui', 'Edu', 'Lia', 'Marlene', 'Caio',
      'Jandira', 'Otávio', 'Celina', 'Solange', 'Ivo', 'Seu Zé']);
    for (const x of f.vizinhos) expect(conhecidos.has(x.nome), x.nome).toBe(true);
    const nomes = f.vizinhos.map((x) => x.nome);
    expect(new Set(nomes).size).toBe(nomes.length);
  });

  it.each(rotulos)('%s (%s): cada muro liga cômodos colados e SEM passagem', (_n, _t, f) => {
    for (const [a, b] of f.murosFinos!) {
      const [x, y] = [f.vizinhos.find((w) => w.id === a)!, f.vizinhos.find((w) => w.id === b)!];
      expect(Math.abs(x.pos[0] - y.pos[0]) + Math.abs(x.pos[1] - y.pos[1])).toBe(1);
      expect(f.amizades.some(([p, q]) => (p === a && q === b) || (p === b && q === a))).toBe(false);
    }
  });

  it.each(rotulos)('%s (%s): a armadilha perde', (_n, _t, f) => {
    expect(jogar(f, f.armadilha!).vitoria).toBe(false);
    expect(Object.keys(f.armadilha!).length).toBeLessThanOrEqual(f.setas);
  });

  it('M1 e M3: a armadilha perde porque o escândalo vazou pro Zé, e sem o muro ela venceria', () => {
    for (const f of [fasesMuro[0], fasesMuro[2]]) {
      const r = jogar(f, f.armadilha!);
      expect(r.motivo).toBe('assunto_ouviu');
      expect(explicar(f, r)).toMatchObject({ tipo: 'vazou', para: 'z' });
      expect(jogar(semMuros(f), f.armadilha!).vitoria).toBe(true);
      expect(mesma(resolverTrilho(semMuros(f)), f.solucao)).toBe(false); // sem o muro a solução deixa de ser a mesma
      expect(jogar(f, f.solucao).ouviu.z).toBeUndefined();
    }
  });

  it('M1 (perigo): a solução não vaza nada; o Beto, colado no Zé, só conta cochicho/boato', () => {
    const f = fasesMuro[0];
    expect(jogar(f, f.solucao).batidas.flat().some((m) => m.vazou)).toBe(false);
    expect(jogar(f, f.solucao).batidas.flat().filter((m) => m.de === 'e').every((m) => m.tamanho < 3)).toBe(true);
    expect(fasesMuro[0].vizinhos.filter((x) => x.tipo === 'exagerado')).toHaveLength(2);
  });

  it('M2 (atalho): sem o muro não há solução, e a Cida ouve por uma mensagem que vazou', () => {
    const f = fasesMuro[1];
    expect(resolverTrilho(semMuros(f), f.setas + 1)).toEqual([]);
    expect(resolverTrilho(semMuros(f))).toEqual([]);
    const r = jogar(f, f.solucao);
    expect(r.batidas.flat().some((m) => m.vazou && m.para === 's')).toBe(true);
    expect(r.ouviu.s.de).toBe('l');
    expect(r.ouviu.s.tamanho).toBe(3);
    expect(r.ouviu.z).toBeUndefined();
    expect(f.vizinhos.find((x) => x.id === 's')!.interesse).toEqual({ tamanho: 3 });
    expect(explicar(f, jogar(f, f.armadilha!))).toMatchObject({ tipo: 'tamanho', id: 's', queria: 3, veio: 1 });
  });

  it('M3 (dois muros): cada um é necessário; um entrega a vítima e o outro leva a estrela', () => {
    const f = fasesMuro[2];
    f.murosFinos!.forEach((_, i) => expect(mesma(resolverTrilho(semUm(f, i)), f.solucao)).toBe(false));
    expect(f.murosFinos!.some((m) => m.includes('z'))).toBe(true);
    expect(f.murosFinos!.some((m) => m.includes('s'))).toBe(true);
    expect(jogar(f, f.solucao).batidas.flat().some((m) => m.vazou && m.para === 's')).toBe(true);
    expect(f.vizinhos.filter((x) => x.tipo === 'fofoqueira').length).toBeGreaterThan(0);
  });

  it('teto de leitura: tamanho é a única regra especial (o Exagerado só pesa por causa dele)', () => {
    for (const f of fasesMuro) {
      expect(f.vizinhos.every((x) => !x.chega && !x.celular && !x.sai && !x.abafa && !x.desconfia && !x.vigia && !x.recolhe && !x.teto && !x.ronda && !x.soneca)).toBe(true);
      expect(f.vizinhos.some((x) => x.interesse?.tamanho === 3)).toBe(true);
    }
  });

  it('a primeira fase traz a novidade, e só ela', () => {
    expect(fasesMuro[0].novidade).toBe('Muro fino: escândalo contado ali vaza pro vizinho do outro lado');
    expect(fasesMuro.slice(1).every((f) => !f.novidade)).toBe(true);
  });
});
