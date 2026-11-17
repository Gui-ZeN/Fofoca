// A sequência do teste com 5 pessoas (src/pesquisa.ts): todas as mecânicas, cada uma estreando num andar fácil com ensino
// (cena de chegada ou linha NOVO), e os difíceis só com o que já estreou.
import { describe, expect, it } from 'vitest';
import { CAPITULOS_PESQUISA, SEQUENCIA_PESQUISA } from './pesquisa';
import { APRESENTACOES, CHEGADAS_DE_TESTE } from './Chegada';
import { CAMPANHA } from './campanha';
import type { FaseTrilho } from './trilho';

// as regras que um andar usa (o que o jogador precisa ter aprendido pra jogar)
const regras = (f: FaseTrilho): string[] => {
  const vs = f.vizinhos, r: [boolean, string][] = [
    [vs.some((v) => v.tipo === 'fofoqueira'), 'Fofoqueira'], [vs.some((v) => v.tipo === 'exagerado'), 'Exagerado'],
    [vs.some((v) => v.tipo === 'docontra'), 'Do Contra'], [vs.some((v) => v.tipo === 'apressado'), 'Nando'],
    [vs.some((v) => !!v.chega), 'padaria'], [vs.some((v) => v.sai !== undefined), 'sai'], [vs.some((v) => !!v.interesse?.ordem), 'ordem'],
    [vs.some((v) => !!v.soneca), 'Soneca'], [vs.some((v) => !!v.desconfia), 'Raquel'], [vs.some((v) => !!v.celular?.length), 'celular'],
    [!!f.interfones?.length, 'interfone'], [!!f.murosFinos?.length, 'muro fino'], [f.validade !== undefined, 'esfria'],
    [vs.some((v) => !!v.ronda?.length), 'ronda'], [vs.some((v) => !!v.vigia), 'Vera'], [vs.some((v) => !!v.abafa), 'Arnaldo'],
    [vs.some((v) => v.recolhe !== undefined), 'Norma'], [vs.some((v) => !!v.teto), 'Dr. Álvaro'],
  ];
  return r.filter(([tem]) => tem).map(([, nome]) => nome);
};
const TODAS = ['Fofoqueira', 'Exagerado', 'Do Contra', 'Nando', 'padaria', 'sai', 'ordem', 'Soneca', 'Raquel', 'celular', 'interfone', 'muro fino', 'esfria', 'ronda', 'Vera', 'Arnaldo', 'Norma', 'Dr. Álvaro'];
const temCena = (rotulo: string) => !!(APRESENTACOES[rotulo] ?? CHEGADAS_DE_TESTE[rotulo]);

describe('sequência da pesquisa (teste com 5 pessoas)', () => {
  it('uns 25 andares (decisão do dono: caber numa sessão), rótulos únicos', () => {
    expect(SEQUENCIA_PESQUISA.length).toBeGreaterThanOrEqual(24);
    expect(SEQUENCIA_PESQUISA.length).toBeLessThanOrEqual(30);
    const rotulos = SEQUENCIA_PESQUISA.map((a) => a.rotulo);
    expect(new Set(rotulos).size).toBe(rotulos.length);
  });

  it('um rótulo da campanha só aparece com o MESMO andar da campanha (senão vencer um marcaria o outro)', () => {
    for (const a of SEQUENCIA_PESQUISA) {
      const c = CAMPANHA.find((x) => x.rotulo === a.rotulo);
      if (c) expect(a.fase, a.rotulo).toBe(c.fase);
    }
  });

  it('todas as mecânicas aparecem, até as fracas (ronda, Dr. Álvaro)', () => {
    const vistas = new Set(SEQUENCIA_PESQUISA.flatMap((a) => regras(a.fase)));
    for (const m of TODAS) expect(vistas.has(m), m).toBe(true);
  });

  it('cada mecânica estreia num andar fácil e com ensino: cena de chegada ou linha NOVO', () => {
    const vistas = new Set<string>();
    for (const a of SEQUENCIA_PESQUISA) {
      const novas = regras(a.fase).filter((m) => !vistas.has(m));
      if (novas.length) {
        expect(a.dificil, `${a.rotulo} estreia ${novas} num difícil`).toBeFalsy();
        expect(novas.length, `${a.rotulo} estreia ${novas} de uma vez`).toBe(1);
        expect(temCena(a.rotulo) || !!a.fase.novidade, `${a.rotulo} estreia ${novas} sem cena nem NOVO`).toBe(true);
      }
      novas.forEach((m) => vistas.add(m));
    }
  });

  it('há difíceis no meio (pelo menos 5), dois deles seguidos, e o último andar é difícil', () => {
    const d = SEQUENCIA_PESQUISA.map((a) => !!a.dificil);
    expect(d.filter(Boolean).length).toBeGreaterThanOrEqual(5);
    expect(d.some((x, i) => x && d[i + 1])).toBe(true);
    expect(d[d.length - 1]).toBe(true);
    expect(d.slice(0, 5).some(Boolean)).toBe(false); // o tutorial fica como é
  });

  it('os capítulos cobrem a sequência inteira, sem buraco nem sobra', () => {
    expect(CAPITULOS_PESQUISA[0].inicio).toBe(0);
    CAPITULOS_PESQUISA.forEach((c, i) => {
      expect(c.numero).toBe(i + 1);
      expect(c.fim).toBeGreaterThan(c.inicio);
      if (i > 0) expect(c.inicio).toBe(CAPITULOS_PESQUISA[i - 1].fim);
    });
    expect(CAPITULOS_PESQUISA[CAPITULOS_PESQUISA.length - 1].fim).toBe(SEQUENCIA_PESQUISA.length);
  });
});
