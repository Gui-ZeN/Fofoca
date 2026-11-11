import { describe, expect, it } from 'vitest';
import type { Fase } from './motor';
import { fasesHora } from './horaCerta';
import { jogar, resolverTrilho } from './trilho';

const semHora = <F extends Fase>(f: F): F => ({ ...f, vizinhos: f.vizinhos.map((v) => ({ ...v, chega: undefined })) });
const mesma = (a: Record<string, string>[], b: Record<string, string>) =>
  a.length === 1 && JSON.stringify(Object.entries(a[0]).sort()) === JSON.stringify(Object.entries(b).sort());

describe('regra da padaria', () => {
  it('recado que chega antes da volta se perde; depois, a pessoa ouve', () => {
    const f = fasesHora[1]; // Cida volta na 3
    const cedo = jogar(f, { r: 'u', u: 'c' });
    expect(cedo.ouviu.c).toBeUndefined();
    expect(cedo.motivo).toBe('interessado_nao_ouviu');
    expect(jogar(f, f.solucao).ouviu.c.batida).toBe(4);
  });

  it('com o Zé fora, a Fofoqueira colada nele pode falar', () => {
    const f = fasesHora[2]; // Zé volta na 3; a Neide fala na 2
    const r = jogar(f, f.solucao);
    expect(r.ouviu.z).toBeUndefined();
    expect(r.ouviu.n.batida).toBe(1);
  });
});

describe('cada fase ensina o que diz', () => {
  it('H1 é só regra atual: ninguém sai de casa, e o vazamento vem a dois passos (Lu → Neide → Zé)', () => {
    const f = fasesHora[0];
    expect(f.vizinhos.every((v) => !v.chega)).toBe(true);
    const r = jogar(f, f.armadilha!);
    expect(r.motivo).toBe('assunto_ouviu');
    expect(r.batidas.flat().some((m) => m.de === 'n' && m.para === 'z')).toBe(true);
  });

  it.each(fasesHora.slice(1).map((f, i) => [`H${i + 2}`, f.titulo, f] as const))('%s (%s): sem os horários, a jogada muda ou não cabe', (_n, _t, f) => {
    expect(f.vizinhos.some((v) => v.chega)).toBe(true);
    expect(mesma(resolverTrilho(semHora(f)), f.solucao)).toBe(false);
  });

  it('H4–H6: a solução usa a Fofoqueira colada no Zé (a lição da T4 sozinha não basta)', () => {
    for (const f of fasesHora.slice(3)) {
      const r = jogar(f, f.solucao);
      expect(r.ouviu.n, f.titulo).toBeDefined();
      expect(f.amizades.some(([a, b]) => (a === 'n' && b === 'z') || (a === 'z' && b === 'n')), f.titulo).toBe(true);
    }
  });
});
