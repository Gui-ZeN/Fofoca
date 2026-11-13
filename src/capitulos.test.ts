import { describe, expect, it } from 'vitest';
import { andarDoDia, capituloDe, capitulos, dataLocal, estrelas, ganhaEstrela, textoDoDia } from './capitulos';
import { CAMPANHA, POR_BLOCO, PREDIO, SEGMENTOS, VOLTAS } from './campanha';
import estoque from './andares.json';

const pesos = (estoque as unknown as { saiu: string }[]).map((a) => a.saiu);

describe('capítulos', () => {
  const lista = capitulos(SEGMENTOS);

  it('cobrem o prédio inteiro, em sequência, sem buraco nem sobreposição', () => {
    expect(lista[0].inicio).toBe(0);
    for (let i = 1; i < lista.length; i++) expect(lista[i].inicio).toBe(lista[i - 1].fim);
    expect(lista[lista.length - 1].fim).toBe(PREDIO.length);
    lista.forEach((c, i) => expect(c.numero).toBe(i + 1));
  });

  it('os 5 primeiros são os feitos à mão, um por regra que estreia', () => {
    expect(lista.slice(0, 5).map((c) => [c.inicio, c.fim])).toEqual([[0, 5], [5, 14], [14, 20], [20, 28], [28, 31]]);
    expect(CAMPANHA.slice(0, 5).map((a) => a.rotulo)).toEqual(['T1', 'T2', 'T3', 'T4', 'T5']);
    // cada estreia (NOVO) cai dentro do capítulo que tem o nome dela
    const estreia = (r: string) => CAMPANHA.findIndex((a) => a.rotulo === r);
    expect(capituloDe(lista, estreia('T8'))!.titulo).toBe('Vizinhos novos');
    expect(capituloDe(lista, estreia('O1'))!.titulo).toBe('Fila da fofoca');
    expect(capituloDe(lista, estreia('V1'))!.titulo).toBe('A vigia do terceiro');
  });

  it('o 6º é só o bloco 0; do 7º ao 11º, a estreia (ou as duas, Raquel + Duplas) e o bloco que vem depois dela', () => {
    expect(lista.slice(5, 11).map((c) => [c.inicio, c.fim])).toEqual([[31, 56], [56, 84], [84, 115], [115, 143], [143, 171], [171, 199]]);
    expect(lista.slice(5, 11).map((c) => PREDIO[c.inicio].rotulo)).toEqual(['E1', 'P1', 'R1', 'S1', 'A1', 'M1']);
    // o capítulo da Raquel leva as duas estreias (R1–R3 e U1–U3) e o bloco 2
    expect(PREDIO.slice(84, 90).map((a) => a.rotulo)).toEqual(['R1', 'R2', 'R3', 'U1', 'U2', 'U3']);
    expect(PREDIO[90].rotulo).toBe('E51');
    // capítulo de estreia = estreia(s) + 25 do bloco; o do bloco 0 e os das voltas têm só os 25
    expect(lista.slice(6, 11).map((c) => c.fim - c.inicio)).toEqual([28, 31, 28, 28, 28]);
    expect(lista[5].fim - lista[5].inicio).toBe(POR_BLOCO);
  });

  it('os capítulos de estreia têm título e aviso próprios, no tom do regulamento; as voltas repetem os temas, sem estreia', () => {
    const [nando, raquel, saida, arnaldo, norma] = lista.slice(6, 11);
    expect(nando.titulo).toBe('O apressado do 204');
    expect(nando.aviso).toBe('É PROIBIDO CORRER NOS CORREDORES.');
    for (const c of [nando, raquel, saida, arnaldo, norma]) {
      expect(c.aviso, c.titulo).toBe(c.aviso.toUpperCase());
      expect(c.aviso, c.titulo).toMatch(/\.$/);
    }
    expect(new Set(lista.map((c) => c.titulo)).size).toBeGreaterThan(15); // não é tudo igual
    expect(lista.slice(11).every((c) => c.fim - c.inicio === POR_BLOCO && /^E\d+/.test(PREDIO[c.inicio].rotulo))).toBe(true);
    expect(lista).toHaveLength(11 + (VOLTAS - 1) * 6);
  });

  it('todo capítulo depois do 5º termina num chefão (o 25º andar do bloco)', () => {
    for (const c of lista.slice(5)) {
      const n = Number(/^E(\d+)/.exec(PREDIO[c.fim - 1].rotulo)?.[1]);
      expect(n, `capítulo ${c.numero}`).toBeGreaterThan(0);
      expect(pesos[n - 1], `capítulo ${c.numero}`).toBe('chefe');
    }
  });

  it('★ do andar: de primeira e sem seta além do mínimo', () => {
    expect(ganhaEstrela(1, 4, 4)).toBe(true);
    expect(ganhaEstrela(1, 3, 4)).toBe(true);
    expect(ganhaEstrela(1, 5, 4)).toBe(false); // usou a folga
    expect(ganhaEstrela(2, 4, 4)).toBe(false); // não foi de primeira
    expect(ganhaEstrela(1, 9)).toBe(true); // modo de giros: sem mínimo de setas
  });

  it('★ conta só os andares do capítulo vencidos de primeira', () => {
    const rotulos = PREDIO.map((a) => a.rotulo);
    const primeira = new Set(['T1', 'T3', 'T6', 'E1']);
    expect(estrelas(lista[0], rotulos, primeira)).toBe(2);
    expect(estrelas(lista[1], rotulos, primeira)).toBe(1);
    expect(estrelas(lista[5], rotulos, primeira)).toBe(1);
  });
});

describe('fofoca do dia', () => {
  const candidatos = pesos.flatMap((p, i) => (p === 'leve' || p === 'media' ? [i] : []));

  it('a data é a do aparelho, não a de UTC (às 23h30 ainda é o mesmo dia)', () => {
    expect(dataLocal(new Date(2026, 10, 11, 23, 30))).toBe('2026-11-11');
    expect(dataLocal(new Date(2026, 0, 5, 0, 5))).toBe('2026-01-05');
  });

  it('o mesmo andar o dia inteiro, outro no dia seguinte, sempre leve ou médio', () => {
    const manha = andarDoDia(new Date(2026, 10, 11, 7, 0), candidatos);
    expect(andarDoDia(new Date(2026, 10, 11, 23, 59), candidatos)).toBe(manha);
    const semana = Array.from({ length: 7 }, (_, i) => andarDoDia(new Date(2026, 10, 11 + i, 12), candidatos));
    expect(new Set(semana).size).toBeGreaterThan(4);
    for (const a of semana) expect(['leve', 'media']).toContain(pesos[a]);
  });

  it('o compartilhar diz o dia e o resultado, nunca a solução', () => {
    expect(textoDoDia('2026-11-11', 1, 'gui-zen.github.io/Fofoca', true)).toBe('Fofoca! do dia 11/11/2026: espalhei de primeira ★ sem a vítima descobrir. gui-zen.github.io/Fofoca');
    // ⚠️ de primeira, mas gastando a seta de folga: não ganhou a ★ (ganhaEstrela), então o texto não pode prometer uma
    expect(textoDoDia('2026-11-11', 1, 'x', false)).toBe('Fofoca! do dia 11/11/2026: espalhei de primeira sem a vítima descobrir. x');
    expect(textoDoDia('2026-11-11', 3, 'x', false)).toContain('na 3ª tentativa');
  });
});
