import { describe, expect, it } from 'vitest';
import type { Armazem } from './ajustes';
import { PREDIO } from './campanha';
import { indiceNovo, marcarVersao, migrar, VERSAO } from './migrar';

const armazem = (inicial: Record<string, string> = {}): Armazem & { dados: Map<string, string> } => {
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
const C = 'fofoca.campanha';
const liberadaDepois = (liberada: number) => {
  const a = armazem({ [`${C}.liberada`]: String(liberada) });
  migrar(a);
  return JSON.parse(a.dados.get(`${C}.liberada`)!);
};

describe('migrar o progresso salvo (versão 3)', () => {
  it('exemplos: liberada 8, 28 e 30 não mudam; 60 (E30) vira 63 (o mesmo E30, 3 estreias do Nando antes)', () => {
    expect(liberadaDepois(8)).toBe(8);
    expect(liberadaDepois(28)).toBe(28);
    expect(liberadaDepois(30)).toBe(30);
    expect(liberadaDepois(60)).toBe(63);
    expect(PREDIO[63].rotulo).toBe('E30');
  });

  it('todo índice antigo vai pro índice novo do MESMO rótulo, e nunca pra trás (E1..E150 e as voltas)', () => {
    const antigo = (i: number) => {
      if (i < 31) return PREDIO[i].rotulo;
      const volta = Math.floor((i - 31) / 150), n = ((i - 31) % 150) + 1;
      return volta ? `E${n}.${volta + 1}` : `E${n}`;
    };
    for (let i = 0; i < 31 + 150 * 20; i++) {
      const novo = indiceNovo(i);
      expect(PREDIO[novo].rotulo, `índice ${i}`).toBe(antigo(i));
      expect(novo).toBeGreaterThanOrEqual(i);
    }
    expect(indiceNovo(31 + 150 * 20 - 1)).toBe(PREDIO.length - 1);
  });

  it('o desvio é o das estreias já passadas: 0 no bloco 0, 3, 9, 12, 15 e 18 nos seguintes', () => {
    expect([0, 25, 50, 75, 100, 125].map((k) => indiceNovo(31 + k) - (31 + k))).toEqual([0, 3, 9, 12, 15, 18]);
    expect(indiceNovo(31 + 150) - (31 + 150)).toBe(18); // 1ª volta repetida
  });

  it('grava a versão e só roda uma vez (rodar de novo não desloca o andar duas vezes)', () => {
    const a = armazem({ [`${C}.liberada`]: '60' });
    expect(migrar(a)).toBe(true);
    expect(a.dados.get(`${C}.versao`)).toBe(String(VERSAO));
    expect(migrar(a)).toBe(false);
    expect(JSON.parse(a.dados.get(`${C}.liberada`)!)).toBe(63);
  });

  it('apaga das tentativas e da lista de "de primeira" os rótulos E*, e só eles', () => {
    const a = armazem({
      [`${C}.tentativas`]: JSON.stringify({ T1: 2, V3: 1, E7: 3, 'E7.2': 1, P1: 4 }),
      [`${C}.primeira`]: JSON.stringify(['T1', 'E1', 'V1', 'E26.2']),
    });
    migrar(a);
    expect(JSON.parse(a.dados.get(`${C}.tentativas`)!)).toEqual({ T1: 2, V3: 1, P1: 4 });
    expect(JSON.parse(a.dados.get(`${C}.primeira`)!)).toEqual(['T1', 'V1']);
  });

  it('esquece as aberturas de capítulo do 6 em diante, e guarda as dos feitos à mão e as cenas', () => {
    const a = armazem({
      [`${C}.visto.cap1`]: 'true', [`${C}.visto.cap5`]: 'true', [`${C}.visto.cap6`]: 'true', [`${C}.visto.cap12`]: 'true',
      [`${C}.visto.T4`]: 'true', [`${C}.visto.V1`]: 'true', [`${C}.visto.capitulo`]: 'true',
    });
    migrar(a);
    expect([...a.dados.keys()].sort()).toEqual([`${C}.versao`, `${C}.visto.T4`, `${C}.visto.V1`, `${C}.visto.cap1`, `${C}.visto.cap5`, `${C}.visto.capitulo`].sort());
  });

  it('JSON estragado ou tipo errado: não quebra, não inventa e ainda grava a versão', () => {
    for (const ruim of ['{quebrado', 'null', '"60"', '-3', '4.5', '[]', 'abc']) {
      const a = armazem({ [`${C}.liberada`]: ruim, [`${C}.tentativas`]: ruim, [`${C}.primeira`]: ruim });
      expect(() => migrar(a), ruim).not.toThrow();
      expect(a.dados.get(`${C}.liberada`), ruim).toBe(ruim);
      expect(a.dados.get(`${C}.tentativas`), ruim).toBe(ruim);
      expect(a.dados.get(`${C}.primeira`), ruim).toBe(ruim);
      expect(a.dados.get(`${C}.versao`), ruim).toBe(String(VERSAO));
    }
  });

  it('armazém que lança: não quebra', () => {
    const quebrado: Armazem = {
      getItem: () => { throw new Error('bloqueado'); }, setItem: () => { throw new Error('bloqueado'); },
      removeItem: () => { throw new Error('bloqueado'); }, key: () => null, length: 0,
    };
    expect(() => migrar(quebrado)).not.toThrow();
  });

  it('aparelho novo (sem progresso): só marca a versão', () => {
    const a = armazem();
    migrar(a);
    expect([...a.dados.entries()]).toEqual([[`${C}.versao`, String(VERSAO)]]);
  });

  it('já na versão 3 (ou maior): não mexe em nada', () => {
    const a = armazem({ [`${C}.versao`]: '3', [`${C}.liberada`]: '60', [`${C}.tentativas`]: '{"E7":2}' });
    expect(migrar(a)).toBe(false);
    expect(a.dados.get(`${C}.liberada`)).toBe('60');
    expect(a.dados.get(`${C}.tentativas`)).toBe('{"E7":2}');
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
  });

  it('marcarVersao (usada depois de "apagar progresso") impede a migração de deslocar o progresso novo', () => {
    const a = armazem();
    marcarVersao(a);
    a.dados.set(`${C}.liberada`, '60'); // jogou do zero e chegou no E30 da campanha nova
    expect(migrar(a)).toBe(false);
    expect(a.dados.get(`${C}.liberada`)).toBe('60');
  });
});
