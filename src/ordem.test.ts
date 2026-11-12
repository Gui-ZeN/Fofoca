import { describe, expect, it } from 'vitest';
import type { Fase } from './motor';
import { fasesOrdem } from './ordem';
import { jogar, resolverTrilho } from './trilho';

const sem = <F extends Fase>(f: F, tirar: 'ordem' | 'chega'): F => ({
  ...f,
  vizinhos: f.vizinhos.map((v) => (tirar === 'chega'
    ? { ...v, chega: undefined }
    : v.interesse ? { ...v, interesse: { ...v.interesse, ordem: undefined } } : v)),
});
const mesma = (a: Record<string, string>[], b: Record<string, string>) =>
  a.length === 1 && JSON.stringify(Object.entries(a[0]).sort()) === JSON.stringify(Object.entries(b).sort());
const rotulos = fasesOrdem.map((f, i) => [`O${i + 1}`, f.titulo, f] as const);

describe('bloco Ordem', () => {
  it.each(rotulos)('%s (%s): sem a ordem, a jogada muda', (_n, _t, f) => {
    expect(f.vizinhos.filter((v) => v.interesse?.ordem).length).toBeGreaterThanOrEqual(2);
    expect(mesma(resolverTrilho(sem(f, 'ordem')), f.solucao)).toBe(false);
  });

  it('a vitória respeita a fila: cada número ouve depois do anterior', () => {
    for (const f of fasesOrdem) {
      const r = jogar(f, f.solucao);
      const fila = f.vizinhos.filter((v) => v.interesse?.ordem).sort((a, b) => a.interesse!.ordem! - b.interesse!.ordem!);
      for (let i = 1; i < fila.length; i++) expect(r.ouviu[fila[i].id].batida, f.titulo).toBeGreaterThan(r.ouviu[fila[i - 1].id].batida);
    }
  });

  it('O2: a Neide conta pras duas na mesma batida, e junto perde', () => {
    const r = jogar(fasesOrdem[1], { r: 'n' });
    expect(r.ouviu.b.batida).toBe(r.ouviu.c.batida);
    expect(r).toMatchObject({ motivo: 'ordem_errada', culpado: 'c', antes: 'b' });
  });

  it('O3: o atalho entrega cochicho à Bia, que queria fofoca; pelo Beto chega no tamanho e na ordem', () => {
    const f = fasesOrdem[2];
    expect(jogar(f, f.armadilha!)).toMatchObject({ motivo: 'tamanho_errado', culpado: 'b' });
    expect(jogar(f, f.solucao).ouviu.b).toMatchObject({ tamanho: 2, de: 'e' });
    const semTamanho = { ...f, vizinhos: f.vizinhos.map((v) => (v.interesse ? { ...v, interesse: { ...v.interesse, tamanho: undefined } } : v)) };
    expect(mesma(resolverTrilho(semTamanho), f.solucao)).toBe(false);
  });

  it.each(rotulos.slice(4))('%s (%s): a padaria também importa', (_n, _t, f) => {
    expect(f.vizinhos.some((v) => v.chega)).toBe(true);
    expect(mesma(resolverTrilho(sem(f, 'chega')), f.solucao)).toBe(false);
  });
});
