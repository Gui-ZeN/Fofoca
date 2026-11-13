import { describe, expect, it } from 'vitest';
import { APRESENTACOES, CHEGADAS_DE_TESTE } from './Chegada';
import { PREDIO } from './campanha';
import type { FaseTrilho } from './trilho';
import { fasesApressado } from './apressado';
import { fasesRaquel } from './raquel';
import { fasesArnaldo } from './arnaldo';
import { fasesNonato } from './nonato';
import { fasesAlvaro, fasesNorma } from './fiscais';
import { fasesSaida } from './saida';

// cada cena de chegada mostra o que de fato estreia naquele andar, e é a 1ª vez que aparece
const usa: Record<string, (f: FaseTrilho) => boolean> = {
  T4: (f) => f.vizinhos.some((v) => v.tipo === 'fofoqueira'),
  T8: (f) => f.vizinhos.some((v) => v.tipo === 'exagerado'),
  H2: (f) => f.vizinhos.some((v) => !!v.chega),
  T10: (f) => f.vizinhos.some((v) => !!v.celular),
  O1: (f) => f.vizinhos.some((v) => !!v.interesse?.ordem),
  V1: (f) => f.vizinhos.some((v) => !!v.vigia),
  P1: (f) => f.vizinhos.some((v) => v.tipo === 'apressado'),
  R1: (f) => f.vizinhos.some((v) => !!v.desconfia),
  S1: (f) => f.vizinhos.some((v) => v.sai !== undefined),
  A1: (f) => f.vizinhos.some((v) => !!v.abafa),
  M1: (f) => f.vizinhos.some((v) => !!v.recolhe),
};

describe('cenas de chegada', () => {
  it('existe uma cena pra cada estreia da campanha, e só pra elas', () => {
    expect(Object.keys(APRESENTACOES).sort()).toEqual(Object.keys(usa).sort());
  });

  it.each(Object.keys(usa))('%s: o andar é a estreia, e a cena acha quem mostrar', (rotulo) => {
    const i = PREDIO.findIndex((a) => a.rotulo === rotulo);
    expect(i).toBeGreaterThanOrEqual(0);
    expect(PREDIO.findIndex((a) => usa[rotulo](a.fase))).toBe(i); // nenhum andar antes já usava
    const quem = APRESENTACOES[rotulo].quem(PREDIO[i].fase);
    expect(quem).toBeDefined();
    expect(APRESENTACOES[rotulo].regra(quem!)).toContain(rotulo === 'H2' || rotulo === 'O1' ? '' : quem!.nome);
  });

  // as cenas das estreias que saíram do bloco de teste continuam sendo achadas por ele (?bloco=apressado/raquel/arnaldo/norma),
  // e as que ficaram de fora da campanha (Nonato, Dr. Álvaro) continuam em CHEGADAS_DE_TESTE
  it.each([
    ['P1', fasesApressado], ['R1', fasesRaquel], ['A1', fasesArnaldo], ['M1', fasesNorma], ['S1', fasesSaida], ['N1', fasesNonato], ['L1', fasesAlvaro],
  ] as [string, FaseTrilho[]][])('%s: a 1ª fase do bloco de teste tem quem a cena mostra', (rotulo, fases) => {
    const cena = APRESENTACOES[rotulo] ?? CHEGADAS_DE_TESTE[rotulo];
    expect(cena, rotulo).toBeDefined();
    expect(cena.quem(fases[0]), rotulo).toBeDefined();
  });

  it('cena na campanha vive em APRESENTACOES; só Nonato e Dr. Álvaro seguem fora dela', () => {
    expect(Object.keys(CHEGADAS_DE_TESTE).sort()).toEqual(['L1', 'N1']);
    expect(Object.keys(CHEGADAS_DE_TESTE).filter((k) => k in APRESENTACOES)).toEqual([]);
  });
});
