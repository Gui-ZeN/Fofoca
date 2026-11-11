import { describe, expect, it } from 'vitest';
import type { Fase } from './motor';
import { fasesNonato } from './nonato';
import { explicar } from './explicar';
import { jogar, resolverTrilho } from './trilho';

// a mesma fase com o Nonato virando um morador comum (não inverte)
const semContra = <F extends Fase>(f: F): F => ({ ...f, vizinhos: f.vizinhos.map((v) => (v.tipo === 'docontra' ? { ...v, tipo: 'comum' } : v)) });
const mesma = (a: Record<string, string>[], b: Record<string, string>) =>
  a.length === 1 && JSON.stringify(Object.entries(a[0]).sort()) === JSON.stringify(Object.entries(b).sort());
const rotulos = fasesNonato.map((f, i) => [`N${i + 1}`, f.titulo, f] as const);

describe('bloco Nonato', () => {
  it.each(rotulos)('%s (%s): uma solução só, dentro das setas', (_n, _t, f) => {
    expect(mesma(resolverTrilho(f), f.solucao)).toBe(true);
    expect(jogar(f, f.solucao).vitoria).toBe(true);
  });

  it.each(rotulos)('%s (%s): sem o Nonato inverter, a jogada muda', (_n, _t, f) => {
    expect(mesma(resolverTrilho(semContra(f)), f.solucao)).toBe(false);
  });

  it.each(rotulos)('%s (%s): a armadilha perde pela versão', (_n, _t, f) => {
    expect(jogar(f, f.armadilha!).motivo).toBe('versao_errada');
  });

  it('toda estrela declara a versão (sem isso o Nonato não muda nada)', () => {
    for (const f of fasesNonato) for (const v of f.vizinhos.filter((x) => x.interesse)) expect(v.interesse!.versao, f.titulo).toBeDefined();
  });

  it('o Nonato inverte ao CONTAR: ele mesmo ouve a versão certa', () => {
    const f = fasesNonato[1];
    const r = jogar(f, f.solucao);
    expect(r.ouviu.n.versao).toBe('normal');
    expect(r.ouviu.e.versao).toBe('invertida');
  });

  it('N3: a Cida ouve antes do Nonato (certa) e a Bia depois (ao contrário)', () => {
    const f = fasesNonato[2];
    const r = jogar(f, f.solucao);
    expect(r.ouviu.c.versao).toBe('normal');
    expect(r.ouviu.b.versao).toBe('invertida');
  });

  it('a derrota explica: o que a estrela queria e o que veio', () => {
    const f = fasesNonato[0];
    expect(explicar(f, jogar(f, f.armadilha!))).toEqual({ tipo: 'versao', id: 'c', queria: 'normal', veio: 'invertida' });
    const g = fasesNonato[1];
    expect(explicar(g, jogar(g, g.armadilha!))).toEqual({ tipo: 'versao', id: 'c', queria: 'invertida', veio: 'normal' });
  });
});
