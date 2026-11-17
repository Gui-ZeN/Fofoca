import { describe, expect, it } from 'vitest';
import { alvosDe, portaDe, type Fase, type Vizinho } from './motor';
import { batizar, chaveFio, FOLGA, moldeInterfone, moldeValido, montar, papeisDosFios, principal, revalidar, tetoDoMolde, type PapelFio } from './fabrica';
import { assinatura, repetidos } from './assinatura';
import { aleatorio } from './variar';
import { fasesInterfone } from './interfone';
import { medirQuase, quaseBasta } from './quase';
import { custo, jogar, resolverTrilho, type FaseTrilho } from './trilho';
import capitulo from './andaresInterfone.json';
import manifesto from '../public/arte/manifesto.json';

// ---- a fábrica: molde, montar, batizar, papéis por fio ----

describe('fábrica do Interfone: molde e prédio montado', () => {
  it('o interfone conta 1 regra e sobe o teto: 3 regras em 4 colunas, 4 em 5 colunas; sem fio o teto é o de antes', () => {
    const a = moldeInterfone('media', 'padaria+ordem', 4, 4, 1, 'util'); // 2 do tema + fio = 3
    const b = moldeInterfone('media', 'padaria+ordem', 5, 3, 1, 'util', true); // + Vera = 4
    expect(tetoDoMolde(a)).toBe(3);
    expect(moldeValido(a)).toBe(true);
    expect(moldeValido({ ...a, vera: true })).toBe(false); // 4 regras em 4 colunas
    expect(tetoDoMolde(b)).toBe(4);
    expect(moldeValido(b)).toBe(true);
    expect(moldeValido({ ...b, vera: false, fios: undefined, colunas: 3 })).toBe(true);
    expect(moldeValido({ ...b, fios: undefined, colunas: 3 })).toBe(false); // sem fio: padaria+ordem+Vera = 3 > 2, como sempre
  });

  it('montar sorteia fios entre apartamentos NÃO colados, nunca com a vítima, cada morador numa ponta só (4 e 5 colunas)', () => {
    let montados = 0;
    for (const [colunas, andares] of [[4, 3], [4, 4], [5, 3], [5, 4], [5, 5]] as const) {
      for (const fios of [1, 2]) {
        const sorte = aleatorio(colunas * 100 + andares * 10 + fios);
        const peso = andares === 3 ? 'leve' : andares === 5 ? 'chefe' : 'pesada';
        const m = moldeInterfone(peso, 'cadeia', colunas, andares, fios, 'util');
        for (let i = 0; i < 400; i++) {
          const f = montar(m, sorte);
          if (!f) continue;
          montados++;
          expect(f.interfones, `${colunas}×${andares}`).toHaveLength(fios);
          const pos = Object.fromEntries(f.vizinhos.map((v) => [v.id, v.pos]));
          for (const [a, b] of f.interfones!) {
            expect(a === 'z' || b === 'z').toBe(false);
            expect(Math.abs(pos[a][0] - pos[b][0]) + Math.abs(pos[a][1] - pos[b][1])).toBeGreaterThanOrEqual(2);
            expect(portaDe(f, a)).not.toContain(b);
          }
          const pontas = f.interfones!.flat();
          expect(new Set(pontas).size).toBe(pontas.length);
        }
      }
    }
    expect(montados).toBeGreaterThan(200); // o teste não pode passar "no vazio"
  });

  it('sem `fios` no molde, montar não muda: nada de interfone', () => {
    const sorte = aleatorio(7);
    const m = { ...moldeInterfone('leve', 'cadeia', 4, 3, 1, 'util'), fios: undefined, papelFio: undefined };
    for (let i = 0; i < 100; i++) expect(montar(m, sorte)?.interfones).toBeUndefined();
  });
});

describe('batizar remapeia o interfone pros ids finais', () => {
  const v = (id: string, tipo: Vizinho['tipo'], pos: [number, number], extra: Partial<Vizinho> = {}): Vizinho => ({ id, nome: id, tipo, pos, ...extra });
  // ids provisórios do montar: 'z' é a vítima; os outros viram letras fixas por nome (Rita r, Cida c, Neide n, ...)
  const f: Fase = {
    titulo: '', boato: 'O Seu Zé x', giros: 0, origens: ['a'],
    vizinhos: [v('z', 'assunto', [1, 1]), v('a', 'comum', [0, 0]), v('b', 'comum', [3, 0], { interesse: {} }), v('c', 'fofoqueira', [2, 1]), v('d', 'comum', [0, 2]), v('e', 'comum', [3, 2])],
    amizades: [['a', 'z'], ['z', 'c'], ['c', 'b'], ['z', 'd']],
    interfones: [['c', 'd'], ['e', 'a']],
  };
  const fase = batizar(f, { K: 2, solucao: { a: 'd' }, armadilha: { a: 'z' } }, 't', f.boato);

  it('os pares do fio apontam pros mesmos moradores, agora com o id final (antes ficavam os ids provisórios)', () => {
    expect(fase.vizinhos.map((x) => x.id)).not.toEqual(f.vizinhos.map((x) => x.id)); // os ids mudaram de verdade
    const final = (provisorio: string) => fase.vizinhos[f.vizinhos.findIndex((x) => x.id === provisorio)].id;
    expect(fase.interfones).toEqual(f.interfones!.map(([a, b]) => [final(a), final(b)]));
    const ids = new Set(fase.vizinhos.map((x) => x.id));
    for (const par of fase.interfones!) for (const id of par) expect(ids.has(id), id).toBe(true);
    // a Fofoqueira (c → Neide, 'n') segue sendo a ponta do 1º fio
    expect(fase.vizinhos.find((x) => x.id === fase.interfones![0][0])!.nome).toBe('Neide');
  });

  it('sem fio, a fase batizada também não ganha o campo', () => {
    expect(batizar({ ...f, interfones: undefined }, { K: 2, solucao: { a: 'd' }, armadilha: { a: 'z' } }, 't', f.boato)).not.toHaveProperty('interfones');
  });
});

describe('papéis do fio (Consulta 10)', () => {
  const [i1, i2] = fasesInterfone;
  const K = (f: FaseTrilho) => custo(f.solucao);

  it('a folga conta: I1 tem uma seta de fio, mas com K+1 setas o caminho a pé vence — o fio NÃO é útil', () => {
    const [fio] = i1.interfones!;
    const sem = { ...i1, interfones: undefined };
    expect(resolverTrilho(sem, K(i1))).toEqual([]); // com as setas exatas, o fio parecia obrigatório
    expect(resolverTrilho(sem, K(i1) + FOLGA).length).toBeGreaterThan(0); // com a folga que o jogador recebe, não
    expect(papeisDosFios(i1, i1.solucao, K(i1))[chaveFio(fio)]).not.toBe('util');
  });

  it('I2: o fio é armadilha (a solução não o usa, e o atalho por ele perde)', () => {
    expect(papeisDosFios(i2, i2.solucao, K(i2))).toEqual({ 'n-d': 'armadilha' });
  });

  it('fio sem papel é reconhecido (enfeite): um fio solto a mais em I2', () => {
    // Rita (r) e Ana (a) ficam longe um do outro e nada passa por ali
    const comEnfeite = { ...i2, interfones: [...i2.interfones!, ['r', 'b'] as [string, string]] };
    expect(papeisDosFios(comEnfeite, i2.solucao, K(i2))['r-b']).toBeUndefined();
    expect(revalidar({ ...comEnfeite, setas: K(i2) + FOLGA }).some((e) => e.startsWith('fio sem papel'))).toBe(true);
  });

  it('o papel principal: útil > impede > armadilha', () => {
    expect(principal({ a: 'armadilha', b: 'util' })).toBe('util');
    expect(principal({ a: 'armadilha', b: 'impede' })).toBe('impede');
    expect(principal({ a: 'armadilha' })).toBe('armadilha');
  });
});

describe('a assinatura distingue o uso do fio', () => {
  it('I1 (a seta vai pelo fio e ele é preciso) ≠ I2 (a solução evita o fio)', () => {
    const [a1, a2] = [assinatura(fasesInterfone[0]), assinatura(fasesInterfone[1])];
    expect(a1).toContain('fio seta+preciso');
    expect(a2).toContain('fio evita');
    expect(a1).not.toBe(a2);
  });
  it('sem interfone a assinatura é a de sempre (nada de "fio")', () => {
    expect(assinatura({ ...fasesInterfone[1], interfones: undefined })).not.toContain('fio');
  });
});

// ---- o capítulo gerado (src/andaresInterfone.json) ----
type Entrada = { pos: number; peso: string; saiu: string; tema: string; fase: FaseTrilho; papeis: Record<string, PapelFio> };
const andares = capitulo as unknown as Entrada[];
const nomes = new Set(Object.keys(manifesto).filter((k) => k !== '_cenario'));
const colunasDe = (f: Fase) => Math.max(...f.vizinhos.map((x) => x.pos[0])) + 1;
const alturaDe = (f: Fase) => Math.max(...f.vizinhos.map((x) => x.pos[1])) + 1;
const principalDe = (a: Entrada) => principal(a.papeis);
// a receita "o fio leva à Fofoqueira colada no Zé": alguma ponta é Fofoqueira que mora de porta com a vítima
const colada = (f: Fase) => (f.interfones ?? []).flat().some((id) => f.vizinhos.find((x) => x.id === id)?.tipo === 'fofoqueira' && portaDe(f, id).includes('z'));
const regras = (f: Fase) => {
  const r = new Set<string>(['interfone']);
  for (const v of f.vizinhos) {
    if (v.chega) r.add('padaria');
    if (v.interesse?.ordem) r.add('ordem');
    if (v.interesse?.tamanho || v.interesse?.minTamanho) r.add('tamanho');
    if (v.vigia) r.add('vera');
  }
  return r.size;
};

describe('capítulo do Interfone (andaresInterfone.json)', () => {
  it('25 andares nas posições 0..24, escada leve/média/pesada e chefão no 25º', () => {
    expect(andares).toHaveLength(25);
    andares.forEach((a, i) => expect(a.pos).toBe(i));
    expect(andares.map((a) => a.peso)).toEqual(Array.from({ length: 25 }, (_, p) => (p === 24 ? 'chefe' : ['leve', 'media', 'pesada', 'leve', 'media'][p % 5])));
    // nada caiu pro peso de baixo em silêncio
    andares.forEach((a) => expect(a.saiu, `andar ${a.pos}`).toBe(a.peso));
  });

  it('todo andar tem fio, e cada fio tem um papel válido que bate com o recalculado', () => {
    const erros: string[] = [];
    for (const a of andares) {
      const f = a.fase;
      expect(f.interfones?.length, `andar ${a.pos}`).toBeGreaterThanOrEqual(1);
      expect(Object.keys(a.papeis).sort(), `andar ${a.pos}`).toEqual(f.interfones!.map(chaveFio).sort());
      const nova = papeisDosFios(f, f.solucao, custo(f.solucao));
      for (const [k, p] of Object.entries(a.papeis)) {
        expect(['util', 'impede', 'armadilha']).toContain(p);
        if (nova[k] !== p) erros.push(`andar ${a.pos}: fio ${k} gravado ${p}, recalculado ${nova[k]}`);
      }
    }
    expect(erros).toEqual([]);
  }, 300_000);

  it('cada andar passa na revalidação com os ids finais (solução única em K, ≤ 2 com K+1, armadilha perde, Zé pesa, fios válidos)', () => {
    expect(andares.flatMap((a) => revalidar(a.fase).map((e) => `andar ${a.pos}: ${e}`))).toEqual([]);
  }, 300_000);

  it('todo andar tem o "quaseee" (≥ 3 quases de verdade e a armadilha também quase acerta)', () => {
    expect(andares.filter((a) => !quaseBasta(medirQuase(a.fase), a.peso)).map((a) => a.pos)).toEqual([]);
  }, 300_000);

  it('o roteiro: ~17 com fio útil, ~3 impede, 4–5 armadilha pura (nunca mais de 6); os primeiros começam úteis', () => {
    const p = andares.map(principalDe);
    const n = (x: PapelFio) => p.filter((y) => y === x).length;
    expect(n('util')).toBeGreaterThanOrEqual(15);
    expect(n('util')).toBeLessThanOrEqual(19);
    expect(n('impede')).toBeGreaterThanOrEqual(2);
    expect(n('impede')).toBeLessThanOrEqual(4);
    expect(n('armadilha')).toBeGreaterThanOrEqual(3);
    expect(n('armadilha')).toBeLessThanOrEqual(6);
    expect(p.slice(0, 4)).toEqual(['util', 'util', 'util', 'util']);
  });

  it('a receita "o fio leva à Fofoqueira colada no Zé" aparece no máximo 4 vezes', () => {
    expect(andares.filter((a) => colada(a.fase)).length).toBeLessThanOrEqual(4);
  });

  it('a régua: nenhum andar repete a assinatura dos 2 anteriores e nenhuma passa de 6 no capítulo', () => {
    const as = andares.map((a) => assinatura(a.fase));
    expect(repetidos(as)).toEqual([]);
    const conta = as.reduce((m, a) => m.set(a, (m.get(a) ?? 0) + 1), new Map<string, number>());
    expect(Math.max(...conta.values())).toBeLessThanOrEqual(6);
    expect(new Set(as).size).toBeGreaterThanOrEqual(12); // a assinatura enxerga o fio: não são 25 iguais
  }, 300_000);

  it('prédios de 4 e 5 colunas (4×3, 4×4, 5×3, 5×4; chefão 5×4 ou 5×5), com fio nos dois formatos', () => {
    const ok = new Set(['4x3', '4x4', '5x3', '5x4', '5x5']);
    for (const a of andares) expect(ok.has(`${colunasDe(a.fase)}x${alturaDe(a.fase)}`), `andar ${a.pos}`).toBe(true);
    const chefao = andares[24].fase;
    expect(['5x4', '5x5']).toContain(`${colunasDe(chefao)}x${alturaDe(chefao)}`);
    expect(new Set(andares.map((a) => colunasDe(a.fase)))).toEqual(new Set([4, 5]));
  });

  it('elenco do capítulo: só o básico, Fofoqueira, Exagerado, padaria/ordem/tamanho e a Vera (nada de Nando, Raquel, saída, Arnaldo, Norma)', () => {
    for (const a of andares) for (const v of a.fase.vizinhos) {
      expect(v.tipo === 'apressado' || v.desconfia || v.sai !== undefined || v.abafa || v.recolhe || v.celular || v.soneca || v.ronda, `andar ${a.pos} ${v.nome}`).toBeFalsy();
      expect(['comum', 'fofoqueira', 'exagerado', 'assunto']).toContain(v.tipo);
    }
    expect(andares.filter((a) => a.fase.vizinhos.some((v) => v.vigia)).length).toBeGreaterThan(0);
    expect(andares.some((a) => a.fase.vizinhos.some((v) => v.tipo === 'fofoqueira'))).toBe(true);
    expect(andares.filter((a) => a.fase.murosFinos || a.fase.validade !== undefined).length).toBe(0);
  });

  it('teto de leitura: o fio conta 1 regra → até 3 em 4 colunas e até 4 em 5 colunas', () => {
    for (const a of andares) expect(regras(a.fase), `andar ${a.pos}`).toBeLessThanOrEqual(colunasDe(a.fase) >= 5 ? 4 : 3);
  });

  it('a Vera muda a jogada (tirada a vigia, a solução deixa de ser a mesma) e nome e boato batem com a vítima', () => {
    const enfeites: string[] = [];
    for (const a of andares) {
      const z = a.fase.vizinhos.find((v) => v.id === 'z')!;
      expect(z.nome, `andar ${a.pos}`).toBe(z.vigia ? 'Vera' : 'Seu Zé');
      expect(a.fase.boato.includes(z.vigia ? 'A Vera' : 'O Seu Zé'), `andar ${a.pos}: ${a.fase.boato}`).toBe(true);
      if (!z.vigia) continue;
      const outra = resolverTrilho({ ...a.fase, vizinhos: a.fase.vizinhos.map((v) => ({ ...v, vigia: undefined })) }, custo(a.fase.solucao));
      if (outra.length === 1 && JSON.stringify(Object.entries(outra[0]).sort()) === JSON.stringify(Object.entries(a.fase.solucao).sort())) enfeites.push(`vera@${a.pos}`);
    }
    expect(enfeites).toEqual([]);
  }, 300_000);

  it('o prédio é bem montado: sem coluna vazia nem buraco no térreo que não seja vazio separado, nomes com desenho e únicos, ids únicos', () => {
    for (const a of andares) {
      const f = a.fase, W = colunasDe(f);
      for (let c = 0; c < W; c++) expect(f.vizinhos.some((v) => v.pos[0] === c), `andar ${a.pos} coluna ${c}`).toBe(true);
      expect(new Set(f.vizinhos.map((v) => v.pos.join())).size).toBe(f.vizinhos.length);
      expect(new Set(f.vizinhos.map((v) => v.nome)).size).toBe(f.vizinhos.length);
      expect(new Set(f.vizinhos.map((v) => v.id)).size).toBe(f.vizinhos.length);
      for (const v of f.vizinhos) expect(nomes.has(v.nome), `${v.nome} (andar ${a.pos})`).toBe(true);
      for (const [x, y] of f.amizades) {
        const [p, q] = [x, y].map((id) => f.vizinhos.find((v) => v.id === id)!.pos);
        expect(Math.abs(p[0] - q[0]) + Math.abs(p[1] - q[1])).toBe(1);
      }
      const z = f.vizinhos.find((v) => v.id === 'z')!;
      expect(alvosDe(f, f.vizinhos.find((v) => v.id === f.origens[0])!).length).toBeGreaterThan(0);
      expect(portaDe(f, 'z').length).toBeGreaterThanOrEqual(2);
      expect(z.tipo).toBe('assunto');
      expect(jogar(f, f.solucao).vitoria).toBe(true);
      expect(f.boato).not.toMatch(/bigode|peruca|careca|gord|magr|feio|nariz|barriga/i);
    }
  });
});
