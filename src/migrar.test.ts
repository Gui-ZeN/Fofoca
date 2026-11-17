import { describe, expect, it } from 'vitest';
import type { Armazem } from './ajustes';
import { PREDIO, proximoAndar, estadoDoAndar } from './campanha';
import { indiceNovo, marcarVersao, migrar, ORDEM_V3, VERSAO } from './migrar';

type Memoria = Armazem & { dados: Map<string, string> };
const armazem = (inicial: Record<string, string> = {}): Memoria => {
  const dados = new Map(Object.entries(inicial));
  return {
    dados,
    getItem: (k) => dados.get(k) ?? null,
    setItem: (k, v) => { dados.set(k, v); },
    removeItem: (k) => { dados.delete(k); },
    key: (i) => [...dados.keys()][i] ?? null,
    get length() { return dados.size; },
  };
};
// o mesmo armazém, mas que lança a partir da N-ésima gravação (setItem): cota estourada ou aba bloqueada no meio do caminho
const quebraNaGravacao = (a: Memoria, n: number): Armazem => {
  let gravacoes = 0;
  return {
    getItem: (k) => a.getItem(k), removeItem: (k) => a.removeItem(k), key: (i) => a.key(i), get length() { return a.length; },
    setItem: (k, v) => { if (++gravacoes >= n) throw new Error('cota'); a.setItem(k, v); },
  };
};
const C = 'fofoca.campanha';
const PREDIO_ROTULOS = PREDIO.map((a) => a.rotulo);
const vencidosDepois = (a: Memoria) => JSON.parse(a.dados.get(`${C}.vencidos`)!) as string[];
// um aparelho v3 (tem a chave de versão) com `liberada` no formato v3
const v3 = (liberada: number, extra: Record<string, string> = {}) => armazem({ [`${C}.versao`]: '3', [`${C}.liberada`]: String(liberada), ...extra });
const liberadaDepois = (liberada: number) => { const a = armazem({ [`${C}.liberada`]: String(liberada) }); migrar(a); return JSON.parse(a.dados.get(`${C}.liberada`)!); };

describe('migrar o progresso salvo (v3: o índice acompanha as estreias)', () => {
  it('exemplos: liberada 8, 28 e 30 não mudam; 60 (E30) vira 63 (o mesmo E30, 3 estreias do Nando antes), na ordem v3', () => {
    expect(liberadaDepois(8)).toBe(8);
    expect(liberadaDepois(28)).toBe(28);
    expect(liberadaDepois(30)).toBe(30);
    expect(liberadaDepois(60)).toBe(63);
    expect(ORDEM_V3[63]).toBe('E30');
  });

  it('todo índice antigo vai pro índice v3 do MESMO rótulo, e nunca pra trás (E1..E150 e as voltas)', () => {
    const antigo = (i: number) => {
      if (i < 31) return ORDEM_V3[i];
      const volta = Math.floor((i - 31) / 150), n = ((i - 31) % 150) + 1;
      return volta ? `E${n}.${volta + 1}` : `E${n}`;
    };
    for (let i = 0; i < 31 + 150 * 20; i++) {
      const novo = indiceNovo(i);
      expect(ORDEM_V3[novo], `índice ${i}`).toBe(antigo(i));
      expect(novo).toBeGreaterThanOrEqual(i);
    }
    expect(indiceNovo(31 + 150 * 20 - 1)).toBe(ORDEM_V3.length - 1);
  });

  it('o desvio é o das estreias já passadas: 0 no bloco 0, 3, 9, 12, 15 e 18 nos seguintes', () => {
    expect([0, 25, 50, 75, 100, 125].map((k) => indiceNovo(31 + k) - (31 + k))).toEqual([0, 3, 9, 12, 15, 18]);
    expect(indiceNovo(31 + 150) - (31 + 150)).toBe(18); // 1ª volta repetida
  });

  it('a ordem v3 é o prédio de hoje sem o capítulo do Interfone, não importa o tamanho do JSON dele', () => {
    expect(ORDEM_V3.some((r) => /^IF?\d/.test(r))).toBe(false);
    expect(ORDEM_V3.slice(0, 57)).toEqual([...PREDIO_ROTULOS.slice(0, 56), 'P1']);
    expect(new Set(ORDEM_V3).size).toBe(ORDEM_V3.length);
  });
});

describe('migrar para a v4: andares vencidos', () => {
  const caso = (liberada: number) => {
    const a = v3(liberada);
    expect(migrar(a)).toBe(true);
    return a;
  };

  it.each([10, 56, 57, 100, 199, 300])('liberada %i (v3): vencidos = todos os rótulos abaixo dela; o que ele tinha vencido segue vencido e aberto', (L) => {
    const a = caso(L);
    expect(vencidosDepois(a)).toEqual(ORDEM_V3.slice(0, L));
    const v = new Set(vencidosDepois(a));
    const proximo = proximoAndar(PREDIO_ROTULOS, v);
    // tudo o que tinha vencido está aberto como feito, mesmo depois do buraco do capítulo novo
    for (const r of ORDEM_V3.slice(0, L)) expect(estadoDoAndar(v, r, PREDIO_ROTULOS.indexOf(r), proximo), r).toBe('feito');
    // e o que ele NÃO tinha vencido continua pendente
    expect(v.has(ORDEM_V3[L])).toBe(false);
    expect(a.dados.get(`${C}.versao`)).toBe(String(VERSAO));
  });

  it('quem estava além do 56 vê I1 como o próximo andar; antes do 56, o próximo é o mesmo de antes', () => {
    for (const L of [56, 57, 100, 199, 300]) {
      const v = new Set(vencidosDepois(caso(L)));
      expect(PREDIO_ROTULOS[proximoAndar(PREDIO_ROTULOS, v)], `liberada ${L}`).toBe('I1');
    }
    for (const L of [10, 30, 40, 55]) {
      const v = new Set(vencidosDepois(caso(L)));
      expect(PREDIO_ROTULOS[proximoAndar(PREDIO_ROTULOS, v)], `liberada ${L}`).toBe(ORDEM_V3[L]);
    }
  });

  it('liberada 57: P1 já vencido fica aberto atrás do buraco I1; P2 segue trancado', () => {
    const v = new Set(vencidosDepois(caso(57)));
    const proximo = proximoAndar(PREDIO_ROTULOS, v);
    const est = (r: string) => estadoDoAndar(v, r, PREDIO_ROTULOS.indexOf(r), proximo);
    expect([est('E25'), est('I1'), est('I3'), est('P1'), est('P2')]).toEqual(['feito', 'proximo', 'trancado', 'feito', 'trancado']);
  });

  it('★ (primeira), tentativas e as cenas já vistas ficam como estavam (os rótulos não mudaram)', () => {
    const a = v3(100, {
      [`${C}.primeira`]: JSON.stringify(['T1', 'E7', 'P1', 'E3.2']),
      [`${C}.tentativas`]: JSON.stringify({ T1: 1, E7: 3, P1: 2, 'E3.2': 1 }),
      [`${C}.visto.P1`]: 'true', [`${C}.visto.V1`]: 'true',
    });
    migrar(a);
    expect(JSON.parse(a.dados.get(`${C}.primeira`)!)).toEqual(['T1', 'E7', 'P1', 'E3.2']); // na v3 os E já eram os de hoje
    expect(JSON.parse(a.dados.get(`${C}.tentativas`)!)).toEqual({ T1: 1, E7: 3, P1: 2, 'E3.2': 1 });
    expect(a.dados.get(`${C}.visto.P1`)).toBe('true');
    expect(a.dados.get(`${C}.visto.V1`)).toBe('true');
    expect(a.dados.get(`${C}.liberada`)).toBe('100'); // a chave antiga não é apagada
  });

  it('a abertura de capítulo já vista anda uma casa do 7 em diante (o 7 agora é o Interfone); 1–6 ficam', () => {
    const a = v3(100, { [`${C}.visto.cap1`]: 'true', [`${C}.visto.cap6`]: 'true', [`${C}.visto.cap7`]: 'true', [`${C}.visto.cap8`]: 'true', [`${C}.visto.capitulo`]: 'true' });
    migrar(a);
    expect([...a.dados.keys()].filter((k) => k.includes('.visto.')).sort())
      .toEqual([`${C}.visto.cap1`, `${C}.visto.cap6`, `${C}.visto.cap8`, `${C}.visto.cap9`, `${C}.visto.capitulo`].sort());
  });

  it('v1/v2 (sem a chave de versão) encadeiam: o índice vira o v3 e dele saem os vencidos; E* de "de primeira" e tentativas somem', () => {
    const a = armazem({
      [`${C}.liberada`]: '60', [`${C}.primeira`]: JSON.stringify(['T1', 'E1', 'V1']), [`${C}.tentativas`]: JSON.stringify({ T1: 2, E7: 3, P1: 4 }),
      [`${C}.visto.cap5`]: 'true', [`${C}.visto.cap6`]: 'true', [`${C}.visto.cap9`]: 'true',
    });
    expect(migrar(a)).toBe(true);
    expect(a.dados.get(`${C}.liberada`)).toBe('63');
    expect(vencidosDepois(a)).toEqual(ORDEM_V3.slice(0, 63));
    expect(JSON.parse(a.dados.get(`${C}.primeira`)!)).toEqual(['T1', 'V1']);
    expect(JSON.parse(a.dados.get(`${C}.tentativas`)!)).toEqual({ T1: 2, P1: 4 });
    expect([...a.dados.keys()].filter((k) => k.includes('.visto.cap')).sort()).toEqual([`${C}.visto.cap5`]);
    expect(PREDIO_ROTULOS[proximoAndar(PREDIO_ROTULOS, new Set(vencidosDepois(a)))]).toBe('I1');
  });
});

describe('migrar: recuperável e idempotente', () => {
  const estado = (a: Memoria) => JSON.stringify([...a.dados.entries()].sort());

  it('rodar duas vezes não estraga: a 2ª não faz nada e o estado é o mesmo', () => {
    const a = armazem({ [`${C}.liberada`]: '60', [`${C}.tentativas`]: '{"E7":2,"T1":1}' });
    expect(migrar(a)).toBe(true);
    const depois = estado(a);
    expect(migrar(a)).toBe(false);
    expect(estado(a)).toBe(depois);
    expect(a.dados.get(`${C}.liberada`)).toBe('63'); // não deslocou duas vezes
    expect(vencidosDepois(a)).toEqual(ORDEM_V3.slice(0, 63));
  });

  it('guarda uma cópia das chaves antigas ANTES de mexer: dá pra recuperar tudo dela', () => {
    const a = armazem({ [`${C}.liberada`]: '60', [`${C}.primeira`]: '["T1","E1"]', [`${C}.tentativas`]: '{"E7":2}', [`${C}.visto.cap7`]: 'true', [`${C}.versao`]: '3' });
    migrar(a);
    const copia = JSON.parse(a.dados.get(`${C}.v3.backup`)!);
    expect(copia.versao).toBe(3);
    expect(copia.chaves).toEqual({
      [`${C}.liberada`]: '60', [`${C}.primeira`]: '["T1","E1"]', [`${C}.tentativas`]: '{"E7":2}', [`${C}.visto.cap7`]: 'true',
    });
  });

  it('falha de gravação no meio: não lança, não corrompe, e o próximo carregamento chega no mesmo resultado de uma migração limpa', () => {
    const inicial = {
      [`${C}.liberada`]: '60', [`${C}.primeira`]: '["T1","E1","V1"]', [`${C}.tentativas`]: '{"E7":2,"T1":1}',
      [`${C}.visto.cap5`]: 'true', [`${C}.visto.cap7`]: 'true',
    };
    const limpo = armazem(inicial);
    migrar(limpo);
    // quebra em cada ponto possível (a 1ª gravação é a cópia; as seguintes, as chaves e por último a versão)
    const gravacoes = (() => { let c = 0; const t = armazem(inicial); migrar({ ...t, setItem: (k, v) => { c++; t.setItem(k, v); }, getItem: t.getItem, removeItem: t.removeItem, key: t.key, get length() { return t.length; } }); return c; })();
    expect(gravacoes).toBeGreaterThanOrEqual(5);
    for (let n = 1; n <= gravacoes; n++) {
      const a = armazem(inicial);
      let r: boolean | undefined;
      expect(() => { r = migrar(quebraNaGravacao(a, n)); }, `quebra na ${n}ª gravação`).not.toThrow();
      expect(r, `quebra na ${n}ª gravação`).toBe(false);
      expect(a.dados.get(`${C}.versao`), `quebra na ${n}ª`).toBeUndefined(); // a versão só vai por último: não marcou
      if (n === 1) expect(estado(a), 'sem cópia, nada muda').toBe(estado(armazem(inicial)));
      else expect(JSON.parse(a.dados.get(`${C}.v3.backup`)!).chaves[`${C}.liberada`], `cópia na ${n}ª`).toBe('60'); // o original está a salvo
      expect(migrar(a), `retomada depois da ${n}ª`).toBe(true); // armazém bom de novo
      expect(estado(a), `retomada depois da ${n}ª`).toBe(estado(limpo));
    }
  });

  it('JSON estragado ou tipo errado: não quebra, não inventa e ainda grava a versão', () => {
    for (const ruim of ['{quebrado', 'null', '"60"', '-3', '4.5', '[]', 'abc']) {
      const a = armazem({ [`${C}.liberada`]: ruim, [`${C}.tentativas`]: ruim, [`${C}.primeira`]: ruim });
      expect(() => migrar(a), ruim).not.toThrow();
      expect(a.dados.get(`${C}.liberada`), ruim).toBe(ruim);
      expect(a.dados.get(`${C}.tentativas`), ruim).toBe(ruim);
      expect(a.dados.get(`${C}.primeira`), ruim).toBe(ruim);
      expect(a.dados.has(`${C}.vencidos`), ruim).toBe(false); // não inventa progresso
      expect(a.dados.get(`${C}.versao`), ruim).toBe(String(VERSAO));
    }
  });

  it('armazém que lança em tudo: não quebra', () => {
    const quebrado: Armazem = {
      getItem: () => { throw new Error('bloqueado'); }, setItem: () => { throw new Error('bloqueado'); },
      removeItem: () => { throw new Error('bloqueado'); }, key: () => null, length: 0,
    };
    expect(() => migrar(quebrado)).not.toThrow();
  });

  it('aparelho novo (sem progresso): só marca a versão, sem cópia', () => {
    const a = armazem();
    migrar(a);
    expect([...a.dados.entries()]).toEqual([[`${C}.versao`, String(VERSAO)]]);
  });

  it('já na versão 4 (ou maior): não mexe em nada', () => {
    const a = armazem({ [`${C}.versao`]: '4', [`${C}.liberada`]: '60', [`${C}.vencidos`]: '["T1"]', [`${C}.tentativas`]: '{"E7":2}' });
    expect(migrar(a)).toBe(false);
    expect(a.dados.get(`${C}.liberada`)).toBe('60');
    expect(a.dados.get(`${C}.vencidos`)).toBe('["T1"]');
    expect(a.dados.get(`${C}.tentativas`)).toBe('{"E7":2}');
    expect(a.dados.has(`${C}.v3.backup`)).toBe(false);
  });

  it('só a campanha migra: a pesquisa, as advertências, os ajustes e a fofoca do dia ficam como estão', () => {
    const outros = {
      'fofoca.pesquisa.liberada': '60', 'fofoca.pesquisa.tentativas': '{"E7":2}', 'fofoca.pesquisa.visto.cap6': 'true',
      'fofoca.advertencias': '{"x":1}', 'fofoca.ajustes': '{"som":false}', 'fofoca.dia.feita.2026-11-13': '1',
      'fofoca.apressado.liberada': '2',
    };
    const a = armazem({ ...outros, [`${C}.liberada`]: '60' });
    migrar(a);
    for (const [k, v] of Object.entries(outros)) expect(a.dados.get(k), k).toBe(v);
    expect(JSON.parse(a.dados.get(`${C}.v3.backup`)!).chaves).toEqual({ [`${C}.liberada`]: '60' }); // a cópia é só da campanha
  });

  it('marcarVersao (usada depois de "apagar progresso") impede a migração de deslocar o progresso novo', () => {
    const a = armazem();
    marcarVersao(a);
    a.dados.set(`${C}.vencidos`, '["T1","T2"]'); // jogou do zero na campanha nova
    expect(migrar(a)).toBe(false);
    expect(a.dados.get(`${C}.vencidos`)).toBe('["T1","T2"]');
  });
});
