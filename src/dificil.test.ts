import { describe, expect, it } from 'vitest';
import { amigosDe, type Fase } from './motor';
import { fasesDificil } from './dificil';
import { jogar, resolverTrilho } from './trilho';

const sem = <F extends Fase>(f: F, tirar: 'chega' | 'ordem' | 'tamanho'): F => ({
  ...f,
  vizinhos: f.vizinhos.map((v) => (tirar === 'chega'
    ? { ...v, chega: undefined }
    : v.interesse ? { ...v, interesse: { ...v.interesse, [tirar]: undefined } } : v)),
});
const mesma = (a: Record<string, string>[], b: Record<string, string>) =>
  a.length === 1 && JSON.stringify(Object.entries(a[0]).sort()) === JSON.stringify(Object.entries(b).sort());

describe.each(fasesDificil.map((f, i) => [`D${i + 1}`, f.titulo, f] as const))('%s (%s)', (_n, _t, f) => {
  it('prédio 3×4 com o Zé no meio, cercado, e Fofoqueira colada nele', () => {
    expect(Math.max(...f.vizinhos.map((v) => v.pos[1]))).toBe(3);
    const ze = f.vizinhos.find((v) => v.tipo === 'assunto')!;
    expect(ze.pos[0]).toBe(1);
    expect([1, 2]).toContain(ze.pos[1]);
    expect(amigosDe(f, ze.id).length).toBeGreaterThanOrEqual(3);
    expect(f.vizinhos.filter((v) => v.tipo === 'fofoqueira').length).toBe(2);
    expect(amigosDe(f, ze.id).some((id) => f.vizinhos.find((v) => v.id === id)!.tipo === 'fofoqueira')).toBe(true);
  });

  it('solução longa (5 setas ou mais) e a armadilha perde', () => {
    expect(Object.keys(f.solucao).length).toBeGreaterThanOrEqual(5);
    expect(jogar(f, f.armadilha!).vitoria).toBe(false);
  });

  it('cada regra combinada muda a jogada', () => {
    if (f.vizinhos.some((v) => v.chega)) expect(mesma(resolverTrilho(sem(f, 'chega')), f.solucao), 'padaria').toBe(false);
    if (f.vizinhos.some((v) => v.interesse?.ordem)) expect(mesma(resolverTrilho(sem(f, 'ordem')), f.solucao), 'ordem').toBe(false);
    if (f.vizinhos.some((v) => v.interesse?.tamanho)) expect(mesma(resolverTrilho(sem(f, 'tamanho')), f.solucao), 'tamanho').toBe(false);
  });
});
