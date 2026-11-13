import { describe, expect, it } from 'vitest';
import type { Fase } from './motor';
import { portaDe } from './motor';
import { explicar } from './explicar';
import { fasesRonda } from './ronda';
import { jogar, resolverTrilho } from './trilho';

const semRonda = <F extends Fase>(f: F): F => ({ ...f, vizinhos: f.vizinhos.map((x) => ({ ...x, ronda: undefined })) });
const mesma = (a: Record<string, string>[], b: Record<string, string>) =>
  a.length === 1 && JSON.stringify(Object.entries(a[0]).sort()) === JSON.stringify(Object.entries(b).sort());
const zeDe = (f: Fase) => f.vizinhos.find((x) => x.tipo === 'assunto')!;
const rotulos = fasesRonda.map((f, i) => [`R${i + 1}`, f.titulo, f] as const);

describe('bloco Ronda', () => {
  it('são três, na ordem: estreia 3×3, "espere ele passar" 4×3/3×4, maior com uma regra a mais', () => {
    expect(fasesRonda).toHaveLength(3);
    const dim = fasesRonda.map((f) => [Math.max(...f.vizinhos.map((x) => x.pos[0])) + 1, Math.max(...f.vizinhos.map((x) => x.pos[1])) + 1]);
    expect(dim[0]).toEqual([3, 3]);
    expect([[4, 3], [3, 4]]).toContainEqual(dim[1]);
    expect([[4, 4], [5, 4]]).toContainEqual(dim[2]);
    expect(fasesRonda[2].vizinhos.length).toBeLessThanOrEqual(15);
  });

  it.each(rotulos)('%s (%s): ids de uma letra e únicos, só o Seu Zé (id z) tem ronda', (_n, _t, f) => {
    const ids = f.vizinhos.map((x) => x.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids.every((id) => id.length === 1)).toBe(true);
    expect(f.vizinhos.filter((x) => x.ronda).map((x) => x.id)).toEqual(['z']);
    expect(zeDe(f).id).toBe('z');
    expect(zeDe(f).nome).toBe('Seu Zé');
  });

  it.each(rotulos)('%s (%s): a ronda só passa por moradores que existem, vizinhos de porta em sequência (e na volta ao começo)', (_n, _t, f) => {
    const ronda = zeDe(f).ronda!;
    const ids = new Set(f.vizinhos.map((x) => x.id));
    expect(ronda.length).toBeGreaterThanOrEqual(2);
    expect(ronda.every((id) => ids.has(id))).toBe(true);
    expect(ronda).toContain('z'); // ele sai de casa e volta
    ronda.forEach((id, i) => {
      const prox = ronda[(i + 1) % ronda.length];
      expect(id).not.toBe(prox);
      expect(portaDe(f, id), `${id} → ${prox}`).toContain(prox);
    });
  });

  it.each(rotulos)('%s (%s): solução única dentro das setas, e nenhuma com uma a menos', (_n, _t, f) => {
    expect(mesma(resolverTrilho(f), f.solucao)).toBe(true);
    expect(Object.keys(f.solucao).length).toBe(f.setas);
    expect(resolverTrilho(f, f.setas - 1)).toEqual([]);
    expect(jogar(f, f.solucao).vitoria).toBe(true);
  });

  it.each(rotulos)('%s (%s): a armadilha perde POR CAUSA da ronda (sem ela, vence)', (_n, _t, f) => {
    const r = jogar(f, f.armadilha!);
    expect(r.vitoria).toBe(false);
    const e = explicar(f, r);
    expect(e?.tipo).toBe('ronda');
    expect(jogar(semRonda(f), f.armadilha!).vitoria).toBe(true);
    expect(Object.keys(f.armadilha!).length).toBeLessThan(f.setas); // é o caminho curto
  });

  it.each(rotulos)('%s (%s): sem a ronda, a solução deixa de ser a mesma', (_n, _t, f) => {
    expect(mesma(resolverTrilho(semRonda(f), f.setas), f.solucao)).toBe(false);
  });

  it.each(rotulos)('%s (%s): a solução entra num apartamento da ronda, numa batida em que o Seu Zé não está lá', (_n, _t, f) => {
    const ronda = zeDe(f).ronda!;
    const r = jogar(f, f.solucao);
    const visitados = r.batidas.flatMap((ms, i) => ms.flatMap((m) => [m.de, m.para].map((x) => [x, i + 1] as const)))
      .filter(([x, b]) => x !== 'z' && ronda.includes(x) && ronda[(b - 1) % ronda.length] !== x);
    expect(visitados.length).toBeGreaterThan(0);
    expect(r.ouviu.z).toBeUndefined();
  });

  it('R1 (antes dele): a armadilha é a Neide contando pra Jandira na batida 3, quando ele está lá', () => {
    const f = fasesRonda[0];
    const r = jogar(f, f.armadilha!);
    expect(explicar(f, r)).toEqual({ tipo: 'ronda', id: 'j', vitima: 'z', batida: 3 });
    expect(r.rondas?.find((x) => x.batida === 3)?.onde).toBe('j');
    expect(jogar(f, f.solucao).ouviu.j.batida).toBe(1); // a solução passa pela Jandira antes de ele chegar
  });

  it('R2 (depois dele): a volta é mais longa que o caminho curto e chega no Otávio depois que ele passou', () => {
    const f = fasesRonda[1];
    const curta = resolverTrilho(semRonda(f), 3);
    expect(curta.length).toBeGreaterThan(0); // sem a ronda, 3 setas bastam
    expect(f.setas).toBeGreaterThanOrEqual(5);
    expect(explicar(f, jogar(f, f.armadilha!))).toEqual({ tipo: 'ronda', id: 't', vitima: 'z', batida: 2 });
    expect(jogar(f, f.solucao).ouviu.t.batida).toBe(3);
  });

  it('R3 (ordem + ronda): a Marlene é fatal na batida 4; a Cida ouve antes da Bia nos dois casos', () => {
    const f = fasesRonda[2];
    expect(explicar(f, jogar(f, f.armadilha!))).toEqual({ tipo: 'ronda', id: 'm', vitima: 'z', batida: 4 });
    const r = jogar(f, f.solucao);
    expect(r.ouviu.c.batida).toBeLessThan(r.ouviu.b.batida);
    // sem a Ordem, uma volta menor passa (a regra conta junto com a ronda)
    const semOrdem = { ...f, vizinhos: f.vizinhos.map((x) => (x.interesse ? { ...x, interesse: {} } : x)) };
    expect(mesma(resolverTrilho(semOrdem, f.setas), f.solucao)).toBe(false);
  });

  it('teto de leitura: no máximo a Fofoqueira + 2 regras (a ronda conta 1)', () => {
    for (const f of fasesRonda) {
      const regras = new Set<string>(['ronda']);
      for (const x of f.vizinhos) {
        if (x.chega) regras.add('padaria');
        if (x.interesse?.tamanho || x.interesse?.minTamanho || x.interesse?.ordem) regras.add('tamanho/ordem');
        if (x.celular) regras.add('celular');
        if (x.sai !== undefined) regras.add('saída');
        if (x.tipo === 'exagerado') regras.add('exagerado');
        if (x.tipo === 'docontra' || x.interesse?.versao) regras.add('versão');
        if (x.abafa || x.desconfia || x.vigia || x.recolhe || x.teto || x.tipo === 'apressado') regras.add('outra');
      }
      expect(regras.size).toBeLessThanOrEqual(2);
    }
  });

  it('só usa nomes que já têm desenho (os do elenco)', () => {
    const conhecidos = new Set(['Rita', 'Cida', 'Bia', 'Ana', 'Neide', 'Lu', 'Beto', 'Lúcia', 'Davi', 'Rui', 'Edu', 'Lia', 'Marlene', 'Caio', 'Jandira', 'Otávio', 'Celina', 'Solange', 'Ivo', 'Seu Zé']);
    for (const f of fasesRonda) for (const x of f.vizinhos) expect(conhecidos.has(x.nome), x.nome).toBe(true);
  });

  it('a primeira fase traz a novidade, e só ela', () => {
    expect(fasesRonda[0].novidade).toBe('Ronda: o vilão anda pelo prédio, um apartamento por batida');
    expect(fasesRonda.slice(1).every((f) => !f.novidade)).toBe(true);
  });
});
