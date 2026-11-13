import { describe, expect, it } from 'vitest';
import type { Fase } from './motor';
import { explicar } from './explicar';
import { fasesEsfria } from './esfria';
import { CAMPANHA, ESTOQUE } from './campanha';
import { fasesTrilho, jogar, resolverTrilho } from './trilho';
import { fasesRaquel } from './raquel';
import { fasesAlvaro, fasesNorma, fasesVera } from './fiscais';
import { fasesDuplas } from './duplas';

describe('bloco Esfria (boato que esfria)', () => {
  const rotulos = fasesEsfria.map((f, i) => [`E${i + 1}`, f.titulo, f] as const);
  const semValidade = <F extends Fase>(f: F): F => ({ ...f, validade: undefined });
  const mesma = (a: Record<string, string>[], b: Record<string, string>) =>
    a.length === 1 && JSON.stringify(Object.entries(a[0]).sort()) === JSON.stringify(Object.entries(b).sort());
  const estrelas = (f: Fase) => f.vizinhos.filter((x) => x.interesse);
  const colunas = (f: Fase) => Math.max(...f.vizinhos.map((x) => x.pos[0])) + 1;
  const andares = (f: Fase) => Math.max(...f.vizinhos.map((x) => x.pos[1])) + 1;

  it('são três, e todas têm validade', () => {
    expect(fasesEsfria).toHaveLength(3);
    expect(fasesEsfria.every((f) => typeof f.validade === 'number')).toBe(true);
  });

  it('tamanhos: E1 4×3, E2 4×3 ou 4×4 com duas estrelas, E3 5×4 com até 15 moradores', () => {
    const [a, b, c] = fasesEsfria;
    expect([colunas(a), andares(a)]).toEqual([4, 3]);
    expect(colunas(b)).toBe(4);
    expect([3, 4]).toContain(andares(b));
    expect(estrelas(b)).toHaveLength(2);
    expect([colunas(c), andares(c)]).toEqual([5, 4]);
    expect(c.vizinhos.length).toBeLessThanOrEqual(15);
    expect(estrelas(a)).toHaveLength(1);
    expect(estrelas(c)).toHaveLength(1);
  });

  it.each(rotulos)('%s (%s): ids de uma letra, únicos, e uma vítima só', (_n, _t, f) => {
    const ids = f.vizinhos.map((x) => x.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids.every((i) => i.length === 1)).toBe(true);
    expect(f.vizinhos.filter((x) => x.tipo === 'assunto')).toHaveLength(1);
    expect(f.vizinhos.find((x) => x.tipo === 'assunto')!.id).toBe('z');
  });

  it.each(rotulos)('%s (%s): solução única dentro das setas, e nenhuma com uma a menos', (_n, _t, f) => {
    expect(mesma(resolverTrilho(f), f.solucao)).toBe(true);
    expect(Object.keys(f.solucao).length).toBe(f.setas);
    expect(resolverTrilho(f, f.setas - 1)).toEqual([]);
    expect(jogar(f, f.solucao).vitoria).toBe(true);
  });

  it.each(rotulos)('%s (%s): a armadilha perde porque o boato esfriou — e sem a validade ela venceria', (_n, _t, f) => {
    const r = jogar(f, f.armadilha!);
    expect(r.vitoria).toBe(false);
    expect(r.ouviu.z).toBeUndefined(); // não foi o Zé nem a Vera: foi o prazo
    expect(explicar(f, r)?.tipo).toBe('esfriou');
    expect(jogar(semValidade(f), f.armadilha!).vitoria).toBe(true);
    expect(Object.keys(f.armadilha!).length).toBeLessThanOrEqual(f.setas);
  });

  it.each(rotulos)('%s (%s): sem a validade, a solução deixa de ser a mesma', (_n, _t, f) => {
    expect(mesma(resolverTrilho(semValidade(f)), f.solucao)).toBe(false);
  });

  it.each(rotulos)('%s (%s): prazo justo — a última estrela ouve na batida da validade ou uma antes', (_n, _t, f) => {
    const r = jogar(f, f.solucao);
    const ultima = Math.max(...estrelas(f).map((x) => r.ouviu[x.id].batida));
    expect([f.validade! - 1, f.validade!]).toContain(ultima);
  });

  it.each(rotulos)('%s (%s): o Zé (ou a Vera) pesa: como morador comum a solução seria outra', (_n, _t, f) => {
    const comum: Fase = { ...f, vizinhos: f.vizinhos.map((x) => (x.tipo === 'assunto' ? { ...x, tipo: 'comum', vigia: undefined } : x)) };
    expect(mesma(resolverTrilho(comum), f.solucao)).toBe(false);
  });

  it('E1 (estreia): sem regra além da Fofoqueira; o desvio pelas duas Fofoqueiras custa as mesmas setas e perde só pelo prazo', () => {
    const f = fasesEsfria[0];
    expect(f.vizinhos.filter((x) => x.tipo === 'fofoqueira')).toHaveLength(2);
    expect(f.vizinhos.every((x) => x.tipo === 'comum' || x.tipo === 'fofoqueira' || x.tipo === 'assunto')).toBe(true);
    expect(Object.keys(f.armadilha!).length).toBe(f.setas);
    expect(jogar(f, f.solucao).ouviu.n).toBeUndefined(); // a solução não passa pelas Fofoqueiras
    expect(jogar(f, f.armadilha!).ouviu.n).toBeDefined();
  });

  it('E2 (relógio): a Fofoqueira é indispensável — sem ela não há saída nem com uma seta a mais — e é ela que dá a vez às duas frentes', () => {
    const f = fasesEsfria[1];
    const semFof: Fase = { ...f, vizinhos: f.vizinhos.map((x) => (x.tipo === 'fofoqueira' ? { ...x, tipo: 'comum' } : x)) };
    expect(resolverTrilho(semFof, f.setas + 1)).toEqual([]);
    const fof = f.vizinhos.find((x) => x.tipo === 'fofoqueira')!;
    const r = jogar(f, f.solucao);
    expect(r.ouviu[fof.id]).toBeDefined();
    // ela mora colada em quem mora colado no Zé: contar pra todos os vizinhos é o risco
    const zeAmigos = f.amizades.filter((p) => p.includes('z')).flatMap((p) => p.filter((x) => x !== 'z'));
    const fofAmigos = f.amizades.filter((p) => p.includes(fof.id)).flatMap((p) => p.filter((x) => x !== fof.id));
    expect(fofAmigos.some((x) => zeAmigos.includes(x))).toBe(true);
    expect(fofAmigos).not.toContain('z');
    expect(r.batidas.filter((ms) => ms.some((m) => m.de === fof.id))).toHaveLength(1);
  });

  it('E3: validade + UMA regra (a Vera, que escuta); sem a escuta dela a solução seria outra', () => {
    const f = fasesEsfria[2];
    const vera = f.vizinhos.find((x) => x.tipo === 'assunto')!;
    expect(vera.nome).toBe('Vera');
    expect(vera.vigia).toBe(true);
    expect(mesma(resolverTrilho({ ...f, vizinhos: f.vizinhos.map((x) => ({ ...x, vigia: undefined })) }), f.solucao)).toBe(false);
    // a Vera nunca ouve na solução, nem por escuta
    expect(jogar(f, f.solucao).ouviu.z).toBeUndefined();
  });

  it('teto de leitura: no máximo a Fofoqueira + 2 regras; E1 e E2 sem regra especial, E3 só a Vera', () => {
    const regras = (f: Fase) => {
      const r = new Set<string>();
      for (const x of f.vizinhos) {
        if (x.sai !== undefined) r.add('saída');
        if (x.chega) r.add('padaria');
        if (x.interesse?.tamanho || x.interesse?.minTamanho || x.interesse?.ordem) r.add('tamanho/ordem');
        if (x.celular) r.add('celular');
        if (x.tipo === 'docontra' || x.interesse?.versao) r.add('versão');
        if (x.abafa || x.desconfia || x.vigia || x.recolhe || x.teto || x.tipo === 'apressado' || x.tipo === 'exagerado') r.add('outra');
      }
      return r.size;
    };
    expect(fasesEsfria.map(regras)).toEqual([0, 0, 1]);
  });

  it('só usa nomes que já têm desenho nas outras fases', () => {
    // os nomes de fabrica.ts (COMUNS, que não aparecem todos nas fases feitas à mão, ex. Otávio) também têm desenho
    const conhecidos = new Set([
      'Otávio', 'Celina', 'Solange', 'Ivo', 'Jandira', 'Caio', 'Marlene', 'Edu', 'Lia', 'Rui',
      ...[...CAMPANHA.map((a) => a.fase), ...ESTOQUE, ...fasesTrilho, ...fasesRaquel, ...fasesVera, ...fasesNorma, ...fasesAlvaro, ...fasesDuplas].flatMap((f) => f.vizinhos.map((x) => x.nome)),
    ]);
    for (const f of fasesEsfria) for (const x of f.vizinhos) expect(conhecidos.has(x.nome), x.nome).toBe(true);
  });

  it('a primeira fase traz a novidade, e só ela', () => {
    expect(fasesEsfria[0].novidade).toBe('O boato esfria: depois da batida marcada, ninguém mais quer ouvir');
    expect(fasesEsfria.slice(1).every((f) => !f.novidade)).toBe(true);
  });
});
