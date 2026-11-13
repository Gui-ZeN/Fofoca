import { describe, expect, it } from 'vitest';
import { espalhar, type Fase, type Vizinho } from './motor';
import { explicar } from './explicar';
import { fasesSaida } from './saida';
import { fasesTrilho, jogar, resolverTrilho } from './trilho';
import { fasesRaquel } from './raquel';
import { fasesAlvaro, fasesNorma, fasesVera } from './fiscais';
import { fasesDuplas } from './duplas';

const w = (id: string, tipo: Vizinho['tipo'], pos: [number, number], extra: Partial<Vizinho> = {}): Vizinho => ({ id, nome: id, tipo, pos, ...extra });
// linha r - a - b - s (a estrela): r ouve na 0, a na 1, b na 2, s na 3
const linha = (extra: Record<string, Partial<Vizinho>> = {}): Fase => ({
  titulo: '', boato: '', giros: 0,
  vizinhos: [w('r', 'comum', [0, 0]), w('a', 'comum', [1, 0]), w('b', 'comum', [2, 0]), w('s', 'comum', [3, 0], { interesse: {} })].map((x) => ({ ...x, ...extra[x.id] })),
  amizades: [['r', 'a'], ['a', 'b'], ['b', 's']],
});
const todos = { r: 'a', a: 'b', b: 's' };
const vai = (f: Fase) => espalhar(f, { origem: 'r', setas: todos });

describe('motor: quem sai de casa (`sai: N`)', () => {
  it('recado na batida N-1 vale; quem ouviu antes continua "ouviu" mesmo depois de sair', () => {
    const r = vai(linha({ s: { sai: 4 } })); // a estrela ouve na 3 e sai na 4
    expect(r.ouviu.s.batida).toBe(3);
    expect(r.vitoria).toBe(true);
    expect(r.saidas).toBeUndefined();
  });

  it('recado na batida N se perde: a estrela que saiu não ouviu', () => {
    const r = vai(linha({ s: { sai: 3 } }));
    expect(r.ouviu.s).toBeUndefined();
    expect(r.vitoria).toBe(false);
    expect(r.motivo).toBe('interessado_nao_ouviu');
    expect(r.saidas).toEqual([{ id: 's', batida: 3, contando: false }]);
  });

  it('depois da batida N também se perde (a estrela sai na 2, o recado só chega na 3)', () => {
    expect(vai(linha({ s: { sai: 2 } })).ouviu.s).toBeUndefined();
  });

  it('quem saiu não conta mais: ouviu na 1 e sai na 2, então não conta na 2; saindo na 3 conta na 2', () => {
    const preso = vai(linha({ a: { sai: 2 } }));
    expect(preso.ouviu.a.batida).toBe(1); // ouviu antes de sair
    expect(preso.ouviu.b).toBeUndefined();
    expect(preso.vitoria).toBe(false);
    expect(preso.batidas.flat().some((m) => m.de === 'a')).toBe(false); // o envio dele nem aparece
    expect(preso.saidas).toEqual([{ id: 'a', batida: 2, contando: true }]);
    expect(vai(linha({ a: { sai: 3 } })).vitoria).toBe(true);
  });

  it('a fofoqueira que saiu também se cala', () => {
    const f = linha({ a: { sai: 2 } });
    f.vizinhos[1] = { ...f.vizinhos[1], tipo: 'fofoqueira' };
    expect(vai(f).ouviu.b).toBeUndefined();
  });

  it('a vítima que saiu não ouve: sair ajuda o boato a passar', () => {
    const f: Fase = {
      titulo: '', boato: '', giros: 0,
      vizinhos: [w('r', 'comum', [0, 0]), w('n', 'fofoqueira', [1, 0]), w('z', 'assunto', [2, 0], { sai: 2 }), w('s', 'comum', [1, 1], { interesse: {} })],
      amizades: [['r', 'n'], ['n', 'z'], ['n', 's']],
    };
    const r = espalhar(f, { origem: 'r', setas: { r: 'n' } }); // a Neide fala na batida 2: o Zé já saiu
    expect(r.ouviu.z).toBeUndefined();
    expect(r.vitoria).toBe(true);
    const cedo = espalhar({ ...f, vizinhos: f.vizinhos.map((x) => (x.id === 'z' ? { ...x, sai: 3 } : x)) }, { origem: 'r', setas: { r: 'n' } });
    expect(cedo.vitoria).toBe(false); // sai na 3: a batida 2 ainda vale
    expect(cedo.motivo).toBe('assunto_ouviu');
  });

  it('`chega` e `sai` na mesma pessoa: o `sai` é ignorado (só vale a volta)', () => {
    const r = vai(linha({ b: { chega: 2, sai: 2 } })); // b ouve na 2: vale pelo `chega`; o `sai: 2` cortaria
    expect(r.ouviu.b.batida).toBe(2);
    expect(r.vitoria).toBe(true);
    expect(r.saidas).toBeUndefined();
  });

  it('sem `sai` nada muda', () => {
    const r = vai(linha());
    expect(r.vitoria).toBe(true);
    expect('saidas' in r).toBe(false);
  });
});

describe('explicação: já tinha saído', () => {
  it('estrela que saiu antes de o recado chegar', () => {
    const f = linha({ s: { sai: 3 } });
    expect(explicar(f, vai(f))).toEqual({ tipo: 'saiu', id: 's', batida: 3, sai: 3, contando: false });
  });

  it('quem estava no meio e saiu antes de contar', () => {
    const f = linha({ a: { sai: 2 } });
    expect(explicar(f, vai(f))).toEqual({ tipo: 'saiu', id: 'a', batida: 2, sai: 2, contando: true });
  });

  it('o Seu Zé saindo nunca é culpado de nada', () => {
    const f = linha({ b: { tipo: 'assunto', sai: 2 } });
    const r = vai(f); // o recado pro Zé se perde, e a estrela fica sem notícia
    expect(r.saidas?.[0].id).toBe('b');
    expect(explicar(f, r)).toEqual({ tipo: 'sem_noticia', id: 's' });
  });
});

describe('bloco Saída', () => {
  const rotulos = fasesSaida.map((f, i) => [`S${i + 1}`, f.titulo, f] as const);
  const semSai = <F extends Fase>(f: F): F => ({ ...f, vizinhos: f.vizinhos.map((x) => ({ ...x, sai: undefined })) });
  const mesma = (a: Record<string, string>[], b: Record<string, string>) =>
    a.length === 1 && JSON.stringify(Object.entries(a[0]).sort()) === JSON.stringify(Object.entries(b).sort());
  const quemSai = (f: Fase) => f.vizinhos.filter((x) => x.sai !== undefined);

  it('são três, uma de cada uso, na ordem em que o jogador vê: meio do caminho (S1), vítima (S2), estrela (S3)', () => {
    expect(fasesSaida).toHaveLength(3);
    const [a, b, c] = fasesSaida.map((f) => quemSai(f));
    expect(a.map((x) => !x.interesse && x.tipo === 'comum')).toEqual([true]);
    expect(b.map((x) => x.tipo)).toEqual(['assunto']);
    expect(c.map((x) => !!x.interesse)).toEqual([true]);
  });

  it.each(rotulos)('%s (%s): prédio de 3 colunas e 3 ou 4 andares', (_n, _t, f) => {
    expect(Math.max(...f.vizinhos.map((x) => x.pos[0])) + 1).toBe(3);
    expect([3, 4]).toContain(Math.max(...f.vizinhos.map((x) => x.pos[1])) + 1);
  });

  it.each(rotulos)('%s (%s): solução única dentro das setas, e nenhuma com uma a menos', (_n, _t, f) => {
    expect(mesma(resolverTrilho(f), f.solucao)).toBe(true);
    expect(Object.keys(f.solucao).length).toBe(f.setas);
    expect(resolverTrilho(f, f.setas - 1)).toEqual([]);
    expect(jogar(f, f.solucao).vitoria).toBe(true);
  });

  it.each(rotulos)('%s (%s): sem o `sai`, a solução muda', (_n, _t, f) => {
    expect(mesma(resolverTrilho(semSai(f)), f.solucao)).toBe(false);
  });

  it('S3 (estrela): a armadilha vence sem o `sai`, e com ele a Cida saiu antes de ouvir', () => {
    const f = fasesSaida[2];
    expect(jogar(semSai(f), f.armadilha!).vitoria).toBe(true);
    const r = jogar(f, f.armadilha!);
    expect(r.vitoria).toBe(false);
    expect(r.ouviu.z).toBeUndefined(); // não foi o Zé: foi a saída
    expect(jogar(f, f.solucao).ouviu.s.batida).toBe(f.vizinhos.find((x) => x.id === 's')!.sai! - 1); // chega na última batida em que ela está
    expect(explicar(f, r)).toEqual({ tipo: 'saiu', id: 's', batida: 5, sai: 4, contando: false });
  });

  it('S2 (Zé): a armadilha perde porque o Zé ainda estava em casa; com ele já fora, ela venceria', () => {
    const f = fasesSaida[1];
    const r = jogar(f, f.armadilha!);
    expect(r.motivo).toBe('assunto_ouviu');
    expect(r.ouviu.z.batida).toBe(f.vizinhos.find((x) => x.id === 'z')!.sai! - 1); // uma batida antes de ele sair
    const ja = { ...f, vizinhos: f.vizinhos.map((x) => (x.id === 'z' ? { ...x, sai: r.ouviu.z.batida } : x)) };
    expect(jogar(ja, f.armadilha!).vitoria).toBe(true);
    expect(resolverTrilho(semSai(f))).toEqual([]); // sem ele sair, não há como: a Neide sempre fala com o Zé
    expect(jogar(f, f.solucao).ouviu.z).toBeUndefined();
  });

  it('S1 (ponte): a armadilha vence sem o `sai`, e com ele o Davi ouve e sai antes de contar', () => {
    const f = fasesSaida[0];
    expect(jogar(semSai(f), f.armadilha!).vitoria).toBe(true);
    const r = jogar(f, f.armadilha!);
    expect(r.vitoria).toBe(false);
    expect(r.ouviu.c.batida).toBe(2);
    expect(explicar(f, r)).toEqual({ tipo: 'saiu', id: 'c', batida: 3, sai: 3, contando: true });
  });

  it('teto de leitura: no máximo a Fofoqueira + 2 regras (o `sai` conta 1) e 2 selos por plaquinha', () => {
    for (const f of fasesSaida) {
      const regras = new Set<string>();
      for (const x of f.vizinhos) {
        if (x.sai !== undefined) regras.add('saída');
        if (x.chega) regras.add('padaria');
        if (x.interesse?.tamanho || x.interesse?.minTamanho || x.interesse?.ordem) regras.add('tamanho/ordem');
        if (x.celular) regras.add('celular');
        if (x.tipo === 'docontra' || x.interesse?.versao) regras.add('versão');
        if (x.abafa || x.desconfia || x.vigia || x.recolhe || x.teto || x.tipo === 'apressado' || x.tipo === 'exagerado') regras.add('outra');
      }
      expect(regras.size).toBeLessThanOrEqual(2);
      expect(regras.has('saída')).toBe(true);
    }
  });

  it('só usa nomes que já têm desenho nas outras fases', () => {
    const conhecidos = new Set([...fasesTrilho, ...fasesRaquel, ...fasesVera, ...fasesNorma, ...fasesAlvaro, ...fasesDuplas].flatMap((f) => f.vizinhos.map((x) => x.nome)));
    for (const f of fasesSaida) for (const x of f.vizinhos) expect(conhecidos.has(x.nome), x.nome).toBe(true);
  });

  it('a primeira fase (a ponte) traz a novidade, e só ela', () => {
    expect(fasesSaida[0].titulo).toBe('A ponte fecha');
    expect(fasesSaida.slice(1).every((f) => !f.novidade)).toBe(true);
    expect(fasesSaida[0].novidade).toBe('Padaria: alguém sai de casa na batida marcada');
  });
});
