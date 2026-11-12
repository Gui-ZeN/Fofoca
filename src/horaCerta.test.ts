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
  it('H6: a Bia liga pra Cida e o recado chega na hora; pela porta chega cedo e se perde', () => {
    const f = fasesHora[5];
    expect(jogar(f, f.solucao).ouviu.c).toMatchObject({ batida: 4, de: 'b' });
    expect(jogar(f, f.armadilha!)).toMatchObject({ motivo: 'interessado_nao_ouviu', culpado: 'c' });
    const semFone = { ...f, vizinhos: f.vizinhos.map((v) => ({ ...v, celular: undefined })) };
    expect(resolverTrilho(semFone)).toHaveLength(0); // sem o celular não dá
  });

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

  // ⚠️ até 2026-11-12, H4–H6 eram "Zé fora, a Neide colada nele fala" (repetição que o Fable apontou). Agora o Zé fica
  // em casa nelas e a padaria muda de lugar — o teste garante que a ideia velha não volta.
  it('H4–H6: o Zé fica em casa (a padaria é de outra pessoa)', () => {
    for (const f of fasesHora.slice(3)) expect(f.vizinhos.find((v) => v.tipo === 'assunto')!.chega, f.titulo).toBeUndefined();
  });

  it('H4: pelo atalho o Davi ainda está na padaria; atrasando pela Neide, ele ouve e passa', () => {
    const f = fasesHora[3];
    expect(jogar(f, f.armadilha!)).toMatchObject({ motivo: 'interessado_nao_ouviu' });
    expect(jogar(f, f.solucao).ouviu.d.batida).toBeGreaterThanOrEqual(3);
  });

  it('H5: o Beto só exagera depois de voltar; direto, a Cida recebe cochicho', () => {
    const f = fasesHora[4];
    expect(jogar(f, f.armadilha!)).toMatchObject({ motivo: 'tamanho_errado', culpado: 'c' });
    expect(jogar(f, f.solucao).ouviu.c).toMatchObject({ tamanho: 2 });
  });
});
