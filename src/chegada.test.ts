import { describe, expect, it } from 'vitest';
import { APRESENTACOES } from './Chegada';
import { CAMPANHA } from './campanha';
import type { FaseTrilho } from './trilho';

// cada cena de chegada mostra o que de fato estreia naquele andar, e é a 1ª vez que aparece
const usa: Record<string, (f: FaseTrilho) => boolean> = {
  T4: (f) => f.vizinhos.some((v) => v.tipo === 'fofoqueira'),
  T8: (f) => f.vizinhos.some((v) => v.tipo === 'exagerado'),
  H2: (f) => f.vizinhos.some((v) => !!v.chega),
  T10: (f) => f.vizinhos.some((v) => !!v.celular),
  O1: (f) => f.vizinhos.some((v) => !!v.interesse?.ordem),
  V1: (f) => f.vizinhos.some((v) => !!v.vigia),
};

describe('cenas de chegada', () => {
  it('existe uma cena pra cada estreia da campanha, e só pra elas', () => {
    expect(Object.keys(APRESENTACOES).sort()).toEqual(Object.keys(usa).sort());
  });

  it.each(Object.keys(usa))('%s: o andar é a estreia, e a cena acha quem mostrar', (rotulo) => {
    const i = CAMPANHA.findIndex((a) => a.rotulo === rotulo);
    expect(i).toBeGreaterThanOrEqual(0);
    expect(CAMPANHA.findIndex((a) => usa[rotulo](a.fase))).toBe(i); // nenhum andar antes já usava
    const quem = APRESENTACOES[rotulo].quem(CAMPANHA[i].fase);
    expect(quem).toBeDefined();
    expect(APRESENTACOES[rotulo].regra(quem!)).toContain(rotulo === 'H2' || rotulo === 'O1' ? '' : quem!.nome);
  });
});
