import { describe, expect, it } from 'vitest';
import type { FaseTrilho } from './trilho';
import { BLOCOS_DO_ESTOQUE, CAMPANHA, ESTOQUE, ESTREIAS, ORDEM_CAMPANHA, POR_BLOCO, PREDIO, SEGMENTOS, TUTORIAL, VOLTAS } from './campanha';
import { jogar } from './trilho';

// o que cada regra precisa ter sido apresentada antes de aparecer
const usa: Record<string, (f: FaseTrilho) => boolean> = {
  exagerado: (f) => f.vizinhos.some((v) => v.tipo === 'exagerado' || !!v.interesse?.tamanho),
  padaria: (f) => f.vizinhos.some((v) => !!v.chega),
  celular: (f) => f.vizinhos.some((v) => !!v.celular),
  ordem: (f) => f.vizinhos.some((v) => !!v.interesse?.ordem),
};

describe('campanha', () => {
  it('tem as 31 fases do trilho, de cada bloco, uma vez só', () => {
    expect(CAMPANHA).toHaveLength(31);
    expect(new Set(ORDEM_CAMPANHA).size).toBe(31);
    expect(CAMPANHA.every((a) => a.fase)).toBe(true);
    for (const letra of ['T', 'H', 'O', 'D', 'V']) expect(ORDEM_CAMPANHA.filter((r) => r.startsWith(letra)).length).toBeGreaterThan(0);
  });

  it('começa pelo tutorial T1–T5, o único trecho com dica', () => {
    expect(ORDEM_CAMPANHA.slice(0, TUTORIAL)).toEqual(['T1', 'T2', 'T3', 'T4', 'T5']);
    expect(CAMPANHA.slice(TUTORIAL).every((a) => !a.fase.dica)).toBe(true);
  });

  it('o prédio continua depois das 31: estoque gerado e, acabando, ele de novo (espelhado numa volta sim, outra não)', () => {
    expect(PREDIO.slice(0, 31)).toEqual(CAMPANHA);
    expect(PREDIO[31].fase).toBe(ESTOQUE[0]);
    const espelhada = PREDIO.find((a) => a.rotulo === 'E1.2')!.fase; // 2ª volta
    expect(espelhada).not.toBe(ESTOQUE[0]);
    expect(jogar(espelhada, ESTOQUE[0].solucao).vitoria).toBe(true); // mesmo quebra-cabeça
    expect(jogar(PREDIO.find((a) => a.rotulo === 'E1.3')!.fase, ESTOQUE[0].solucao).vitoria).toBe(true); // 3ª volta: igual à 1ª
  });

  it('nenhum andar some nem duplica: 31 + o estoque inteiro + 18 estreias + as voltas, rótulos únicos', () => {
    expect(ESTOQUE).toHaveLength(BLOCOS_DO_ESTOQUE * POR_BLOCO); // blocos fechados de 25
    expect(PREDIO).toHaveLength(31 + ESTOQUE.length * VOLTAS + 18);
    expect(new Set(PREDIO.map((a) => a.rotulo)).size).toBe(PREDIO.length); // rótulos únicos (tentativas por andar)
    // os gerados mantêm os rótulos E1..E150 (e E{i}.{volta} nas voltas), na ordem
    const gerados = PREDIO.filter((a) => a.rotulo.startsWith('E')).map((a) => a.rotulo);
    expect(gerados.slice(0, ESTOQUE.length)).toEqual(ESTOQUE.map((_, i) => `E${i + 1}`));
    expect(gerados[ESTOQUE.length]).toBe('E1.2');
    expect(gerados).toHaveLength(ESTOQUE.length * VOLTAS);
    // cada fase do estoque (1ª volta) e das estreias aparece, a mesma, uma vez
    ESTOQUE.forEach((f, i) => expect(PREDIO.find((a) => a.rotulo === `E${i + 1}`)!.fase).toBe(f));
    for (const e of ESTREIAS) e.fases.forEach((f, j) => expect(PREDIO.find((a) => a.rotulo === `${e.letra}${j + 1}`)!.fase, `${e.letra}${j + 1}`).toBe(f));
  });

  it('a ordem exata dos segmentos: feitos, bloco 0, Nando, bloco 1, Raquel + Duplas, bloco 2, saída, bloco 3, Arnaldo, bloco 4, Norma, bloco 5, e as voltas', () => {
    const nome = (s: (typeof SEGMENTOS)[number]) => `${s.tipo}:${s.id}${s.volta ? `.${s.volta + 1}` : ''}`;
    expect(SEGMENTOS.slice(0, 13).map(nome)).toEqual([
      'feitos:feitos', 'bloco:bloco0', 'estreia:nando', 'bloco:bloco1', 'estreia:raquel', 'estreia:duplas', 'bloco:bloco2',
      'estreia:saida', 'bloco:bloco3', 'estreia:arnaldo', 'bloco:bloco4', 'estreia:norma', 'bloco:bloco5',
    ]);
    // depois, só blocos, volta por volta (sem estreia)
    expect(SEGMENTOS).toHaveLength(13 + (VOLTAS - 1) * BLOCOS_DO_ESTOQUE);
    expect(SEGMENTOS.slice(13).every((s) => s.tipo === 'bloco' && s.volta! >= 1)).toBe(true);
    // contíguos e cobrindo o prédio todo
    expect(SEGMENTOS[0].inicio).toBe(0);
    SEGMENTOS.forEach((s, i) => { if (i) expect(s.inicio).toBe(SEGMENTOS[i - 1].fim); });
    expect(SEGMENTOS[SEGMENTOS.length - 1].fim).toBe(PREDIO.length);
  });

  it('os rótulos das estreias, na ordem: P1–P3, R1–R3, U1–U3, S1–S3, A1–A3, M1–M3', () => {
    const estreias = SEGMENTOS.filter((s) => s.tipo === 'estreia');
    expect(estreias.map((s) => PREDIO.slice(s.inicio, s.fim).map((a) => a.rotulo))).toEqual(
      ['P', 'R', 'U', 'S', 'A', 'M'].map((l) => [1, 2, 3].map((n) => `${l}${n}`)),
    );
  });

  it('cada estreia vem ANTES de qualquer andar gerado do bloco que a segue (o bloco usa o elenco já liberado)', () => {
    const estreias = SEGMENTOS.filter((s) => s.tipo === 'estreia');
    expect(estreias).toHaveLength(6);
    for (const s of estreias) {
      const proximo = SEGMENTOS.find((x) => x.tipo === 'bloco' && x.inicio >= s.fim)!;
      expect(s.fim, s.id).toBeLessThanOrEqual(proximo.inicio);
      // e logo atrás dela vem um bloco gerado, ou outra estreia (Raquel → Duplas), nunca um andar de bloco depois
      const antes = SEGMENTOS.find((x) => x.fim === s.inicio)!;
      expect(['bloco', 'estreia']).toContain(antes.tipo);
    }
    // a estreia k abre exatamente depois do bloco k (0..4): nada do bloco k+1 vem antes dela
    const rotuloPrimeiro = (id: string) => PREDIO.findIndex((a) => a.rotulo === (ESTREIAS.find((e) => e.id === id)!.letra + '1'));
    const gerado = (n: number) => PREDIO.findIndex((a) => a.rotulo === `E${n}`);
    expect(rotuloPrimeiro('nando')).toBeGreaterThan(gerado(25));
    expect(rotuloPrimeiro('nando')).toBeLessThan(gerado(26));
    expect(rotuloPrimeiro('raquel')).toBeGreaterThan(gerado(50));
    expect(rotuloPrimeiro('duplas')).toBeLessThan(gerado(51));
    expect(rotuloPrimeiro('saida')).toBeGreaterThan(gerado(75));
    expect(rotuloPrimeiro('saida')).toBeLessThan(gerado(76));
    expect(rotuloPrimeiro('arnaldo')).toBeGreaterThan(gerado(100));
    expect(rotuloPrimeiro('arnaldo')).toBeLessThan(gerado(101));
    expect(rotuloPrimeiro('norma')).toBeGreaterThan(gerado(125));
    expect(rotuloPrimeiro('norma')).toBeLessThan(gerado(126));
  });

  it('nenhuma estreia nas voltas do estoque: os 18 rótulos de estreia existem uma vez só', () => {
    const doEstreia = PREDIO.filter((a) => /^[PRUSAM]\d$/.test(a.rotulo));
    expect(doEstreia).toHaveLength(18);
    expect(SEGMENTOS.filter((s) => s.tipo === 'estreia').every((s) => s.volta === undefined)).toBe(true);
    expect(PREDIO.filter((a) => a.rotulo.includes('.')).every((a) => a.rotulo.startsWith('E'))).toBe(true);
  });

  it.each(Object.keys(usa))('a 1ª fase com %s é a que traz a etiqueta NOVO', (regra) => {
    const primeira = CAMPANHA.find((a) => usa[regra](a.fase))!;
    expect(primeira.fase.novidade, primeira.rotulo).toBeTruthy();
  });
});
