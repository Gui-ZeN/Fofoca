import { describe, expect, it, vi } from 'vitest';
import type { FaseTrilho } from './trilho';
import { aposVencer, BLOCOS_DO_ESTOQUE, CAMPANHA, CANDIDATOS_DIA, diaLiberado, estadoDoAndar, FEITOS_A_MAO, ESTOQUE_PESOS, ESTOQUE, ESTREIAS, INTERFONE_GERADO, ORDEM_CAMPANHA, POR_BLOCO, PREDIO, proximoAndar, SEGMENTOS, TUTORIAL, VOLTAS } from './campanha';
import { capitulos } from './capitulos';
import { ORDEM_V3 } from './migrar';
import estoqueJson from './andares.json';
import { jogar } from './trilho';

// o que cada regra precisa ter sido apresentada antes de aparecer
const usa: Record<string, (f: FaseTrilho) => boolean> = {
  exagerado: (f) => f.vizinhos.some((v) => v.tipo === 'exagerado' || !!v.interesse?.tamanho),
  padaria: (f) => f.vizinhos.some((v) => !!v.chega),
  celular: (f) => f.vizinhos.some((v) => !!v.celular),
  ordem: (f) => f.vizinhos.some((v) => !!v.interesse?.ordem),
};

describe('Fofoca do dia', () => {
  it('só abre depois dos 31 feitos à mão VENCIDOS (ela não tem cena de chegada); não olha mais um índice', () => {
    const feitos = ORDEM_CAMPANHA;
    expect(diaLiberado(new Set())).toBe(false);
    expect(diaLiberado(new Set(feitos.slice(0, FEITOS_A_MAO - 1)))).toBe(false); // ainda falta o 31º
    expect(diaLiberado(new Set(feitos))).toBe(true); // venceu o 31º
    expect(diaLiberado(new Set([...feitos.slice(1), 'E1', 'E2', 'I1']))).toBe(false); // vencer andares de fora não compensa um feito à mão que falta
    expect(FEITOS_A_MAO).toBe(31);
  });

  it('a Fofoca do dia não pega andar com fio (CANDIDATOS_DIA lê só o estoque)', () => {
    expect(CANDIDATOS_DIA.every((i) => !ESTOQUE[i].interfones?.length)).toBe(true);
  });

  it('só sorteia andar sem regra de estreia (Nando, Raquel, saída, Arnaldo, Norma): o dia não tem cena de chegada', () => {
    // ⚠️ achado do auditor (2026-11-17): antes eram 36 dos 114 candidatos leves/médios com uma dessas regras
    const regra = (i: number) => ESTOQUE[i].vizinhos.some((v) => v.tipo === 'apressado' || v.desconfia || v.abafa || v.recolhe || v.sai !== undefined);
    expect(CANDIDATOS_DIA.filter(regra)).toEqual([]);
    expect(CANDIDATOS_DIA.every((i) => ESTOQUE_PESOS[i] === 'leve' || ESTOQUE_PESOS[i] === 'media')).toBe(true);
    expect(CANDIDATOS_DIA.length).toBeGreaterThan(40); // sobra variedade pra meses de dias diferentes
  });
});

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
    expect(PREDIO).toHaveLength(31 + ESTOQUE.length * VOLTAS + 18 + 3 + INTERFONE_GERADO.length); // + I1–I3 e o capítulo gerado do Interfone
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

  it('a ordem exata dos segmentos: feitos, bloco 0, Interfone (+ bloco gerado), Nando, bloco 1, Raquel + Duplas, bloco 2, saída, bloco 3, Arnaldo, bloco 4, Norma, bloco 5, e as voltas', () => {
    const nome = (s: (typeof SEGMENTOS)[number]) => `${s.tipo}:${s.id}${s.volta ? `.${s.volta + 1}` : ''}`;
    const com = INTERFONE_GERADO.length ? 1 : 0; // o bloco do Interfone só entra com o JSON preenchido
    expect(SEGMENTOS.slice(0, 14 + com).map(nome)).toEqual([
      'feitos:feitos', 'bloco:bloco0', 'estreia:interfone', ...(com ? ['bloco:blocoInterfone'] : []), 'estreia:nando', 'bloco:bloco1', 'estreia:raquel', 'estreia:duplas', 'bloco:bloco2',
      'estreia:saida', 'bloco:bloco3', 'estreia:arnaldo', 'bloco:bloco4', 'estreia:norma', 'bloco:bloco5',
    ]);
    // depois, só blocos, volta por volta (sem estreia)
    expect(SEGMENTOS).toHaveLength(14 + com + (VOLTAS - 1) * BLOCOS_DO_ESTOQUE);
    expect(SEGMENTOS.slice(14 + com).every((s) => s.tipo === 'bloco' && s.volta! >= 1)).toBe(true);
    // contíguos e cobrindo o prédio todo
    expect(SEGMENTOS[0].inicio).toBe(0);
    SEGMENTOS.forEach((s, i) => { if (i) expect(s.inicio).toBe(SEGMENTOS[i - 1].fim); });
    expect(SEGMENTOS[SEGMENTOS.length - 1].fim).toBe(PREDIO.length);
  });

  it('os rótulos das estreias, na ordem: I1–I3, P1–P3, R1–R3, U1–U3, S1–S3, A1–A3, M1–M3', () => {
    const estreias = SEGMENTOS.filter((s) => s.tipo === 'estreia');
    expect(estreias.map((s) => PREDIO.slice(s.inicio, s.fim).map((a) => a.rotulo))).toEqual(
      ['I', 'P', 'R', 'U', 'S', 'A', 'M'].map((l) => [1, 2, 3].map((n) => `${l}${n}`)),
    );
  });

  it('cada estreia vem ANTES de qualquer andar gerado do bloco que a segue (o bloco usa o elenco já liberado)', () => {
    const estreias = SEGMENTOS.filter((s) => s.tipo === 'estreia');
    expect(estreias).toHaveLength(7);
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

describe('o capítulo do Interfone no prédio', () => {
  const rot = (a: { rotulo: string }[]) => a.map((x) => x.rotulo);
  const falso25 = Array.from({ length: 25 }, (_, i) => (estoqueJson as unknown as { fase: FaseTrilho }[])[i]).map((a, pos) => ({ pos, peso: 'leve', saiu: 'leve', tema: 'x', fase: a.fase }));
  // o JSON do Interfone é do outro agente e muda: as duas formas (vazio e 25) são conferidas com ele trocado por um de mentira
  const carregar = async (conteudo: unknown[]) => {
    vi.resetModules();
    vi.doMock('./andaresInterfone.json', () => ({ default: conteudo }));
    const c = await import('./campanha');
    const caps = (await import('./capitulos')).capitulos(c.SEGMENTOS);
    vi.doUnmock('./andaresInterfone.json');
    vi.resetModules();
    return { ...c, caps };
  };

  it('com o JSON vazio: depois do bloco 0 vêm só I1–I3, e o Nando passa ao andar 60', async () => {
    const { PREDIO: p, SEGMENTOS: seg, caps } = await carregar([]);
    expect(rot(p.slice(53, 62))).toEqual(['E23', 'E24', 'E25', 'I1', 'I2', 'I3', 'P1', 'P2', 'P3']);
    expect(p[56].rotulo).toBe('I1');
    expect(seg.some((s) => s.id === 'blocoInterfone')).toBe(false);
    expect(rot(p).some((r) => r.startsWith('IF'))).toBe(false);
    // o capítulo 7 é só a estreia (não engole o Nando); o Nando fica no 8
    expect(caps.slice(6, 8).map((c) => [c.titulo, c.inicio, c.fim])).toEqual([['O fio da portaria', 56, 59], ['O apressado do 204', 59, 87]]);
  });

  it('com 25 andares gerados: I1 no andar 57, IF1…IF25 nos andares 60–84, Nando no 85, rótulos únicos', async () => {
    const { PREDIO: p, SEGMENTOS: seg, caps } = await carregar(falso25);
    expect(p[56].rotulo).toBe('I1'); // andar 57
    expect(rot(p.slice(56, 59))).toEqual(['I1', 'I2', 'I3']);
    expect(rot(p.slice(59, 84))).toEqual(Array.from({ length: 25 }, (_, i) => `IF${i + 1}`)); // andares 60–84
    expect(p[84].rotulo).toBe('P1'); // o Nando no andar 85
    expect(p[55].rotulo).toBe('E25'); // o bloco 0 termina no 56, intacto
    expect(new Set(rot(p)).size).toBe(p.length);
    expect(seg.slice(0, 5).map((s) => `${s.tipo}:${s.id}`)).toEqual(['feitos:feitos', 'bloco:bloco0', 'estreia:interfone', 'bloco:blocoInterfone', 'estreia:nando']);
    // um capítulo só, com nome próprio, de I1 a IF25; o Nando é o 8º
    expect(caps[6]).toMatchObject({ numero: 7, titulo: 'O fio da portaria', inicio: 56, fim: 84 });
    expect(caps[6].aviso).toBe(caps[6].aviso.toUpperCase());
    expect(caps[7]).toMatchObject({ numero: 8, titulo: 'O apressado do 204', inicio: 84, fim: 112 });
    expect(new Set(caps.map((c) => c.titulo)).size).toBeGreaterThan(15);
  });

  it('o capítulo entra uma vez só: as voltas do estoque não repetem I nem IF', async () => {
    const { PREDIO: p, SEGMENTOS: seg } = await carregar(falso25);
    expect(rot(p).filter((r) => /^IF?\d+/.test(r))).toHaveLength(28);
    expect(seg.filter((s) => s.id === 'interfone' || s.id === 'blocoInterfone').every((s) => s.volta === undefined)).toBe(true);
    expect(p.filter((a) => a.rotulo.includes('.')).every((a) => a.rotulo.startsWith('E'))).toBe(true);
    expect(p).toHaveLength(31 + ESTOQUE.length * VOLTAS + 18 + 3 + 25);
  });

  it('o JSON de hoje (qualquer tamanho): I1 no andar 57 e os capítulos cobrem o prédio', () => {
    expect(PREDIO[56].rotulo).toBe('I1');
    const lista = capitulos(SEGMENTOS);
    expect(lista[6].titulo).toBe('O fio da portaria');
    expect(lista[lista.length - 1].fim).toBe(PREDIO.length);
  });
});

describe('progresso por andares vencidos', () => {
  const rotulos = PREDIO.map((a) => a.rotulo);
  const vencidosAte = (n: number) => new Set(ORDEM_V3.slice(0, n)); // o que a migração gera de um `liberada` v3

  it('o próximo é o primeiro andar do prédio não vencido', () => {
    expect(proximoAndar(rotulos, new Set())).toBe(0);
    expect(proximoAndar(rotulos, vencidosAte(10))).toBe(10);
    expect(proximoAndar(rotulos, new Set(['T2', 'T3']))).toBe(0); // vencer fora de ordem não anda o próximo
    expect(proximoAndar(rotulos, new Set(rotulos))).toBe(rotulos.length);
  });

  it('feito = vencido; o próximo = atual; trancado = depois do próximo e não vencido; vencido depois de um buraco segue aberto', () => {
    const v = new Set([...vencidosAte(56), 'P1']); // quem estava no 57 antes do capítulo: I1 é o buraco, P1 já foi
    const proximo = proximoAndar(rotulos, v);
    expect(rotulos[proximo]).toBe('I1');
    const est = (r: string) => estadoDoAndar(v, r, rotulos.indexOf(r), proximo);
    expect(est('T1')).toBe('feito');
    expect(est('E25')).toBe('feito');
    expect(est('I1')).toBe('proximo');
    expect(est('I2')).toBe('trancado');
    expect(est('P1')).toBe('feito'); // depois do buraco, mas vencido: aberto
    expect(est('P2')).toBe('trancado');
  });

  it('vencer marca o rótulo e o jogo avança pro PRÓXIMO NÃO VENCIDO, não pro idx + 1', () => {
    // quem tinha passado do 56 e agora tem o capítulo novo pela frente: o buraco é I1…
    let v: ReadonlySet<string> = vencidosAte(100);
    const alvo = ORDEM_V3[100]; // o que vinha depois do que ele já tinha vencido
    const visitados: string[] = [];
    let idx = proximoAndar(rotulos, v);
    while (rotulos[idx] !== alvo) {
      visitados.push(rotulos[idx]);
      const r = aposVencer(rotulos, v, idx);
      v = r.vencidos;
      idx = r.proximo;
    }
    expect(visitados).toEqual(rotulos.slice(56, 59 + INTERFONE_GERADO.length)); // I1–I3 e o gerado, e só eles
    // refazer um andar antigo não leva pro andar seguinte a ele: leva pro que falta
    expect(aposVencer(rotulos, vencidosAte(100), 2).proximo).toBe(56); // vence o T3 de novo → I1
    expect(rotulos[aposVencer(rotulos, vencidosAte(100), 2).proximo]).toBe('I1');
    // jogar I3 sem ter feito I1 e I2 também não pula nada
    expect(rotulos[aposVencer(rotulos, vencidosAte(56), 58).proximo]).toBe('I1');
  });

  it('o último andar vencido de todos cai em idx + 1 (nada pendente)', () => {
    const todos = new Set(rotulos);
    expect(aposVencer(rotulos, todos, 5).proximo).toBe(6);
  });
});
