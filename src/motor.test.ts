import { describe, expect, it } from 'vitest';
import { amigosDe, espalhar, quemContou, resolver, type Fase } from './motor';
import { fases } from './fases';

const predio = fases[8]; // "O prédio da Dona Cida", a fase exemplo do plano

describe('espalhar', () => {
  it('jogada óbvia: a Lúcia conta pra Fofoqueira e o Seu Zé ouve', () => {
    const r = espalhar(predio, { origem: 'l', setas: {} });
    expect(r.vitoria).toBe(false);
    expect(r.motivo).toBe('assunto_ouviu');
    expect(r.ouviu.n).toEqual({ tamanho: 2, versao: 'normal', batida: 1, de: 'l' });
    expect(r.ouviu.z.batida).toBe(2);
  });

  it('a origem também aplica o próprio tipo: Beto exagera, mas a Cida só ouve um boato', () => {
    const r = espalhar(predio, { origem: 'b', setas: {} });
    expect(r.motivo).toBe('tamanho_errado');
    expect(r.ouviu.c.tamanho).toBe(2);
  });

  it('solução: girar a Lúcia pro Beto vira escândalo e para no Padre', () => {
    const r = espalhar(predio, { origem: 'l', setas: { l: 'b' } });
    expect(r.vitoria).toBe(true);
    expect(r.ouviu.c.tamanho).toBe(3);
    expect(r.ouviu.p.batida).toBe(3);
    expect(r.ouviu.z).toBeUndefined();
    expect(r.batidas).toHaveLength(3); // túmulo não gera batida nova
  });

  it('cada um ouve uma vez só (a fofoqueira não reconta pra quem já sabia)', () => {
    const r = espalhar(predio, { origem: 'n', setas: {} });
    // Lúcia volta a seta pra Neide (já sabia), então o Beto nunca ouve.
    expect(Object.keys(r.ouviu).sort()).toEqual(['c', 'l', 'n', 'p', 'z']);
    const lucia = r.ouviu.l;
    expect(lucia.batida).toBe(1); // não foi sobrescrita depois
  });

  it('chegadas simultâneas: maior tamanho vence; empate, a versão normal', () => {
    const f: Fase = {
      titulo: 't', boato: '', giros: 0,
      vizinhos: [
        { id: 'f', nome: '', tipo: 'fofoqueira', pos: [0, 0] },
        { id: 'x', nome: '', tipo: 'exagerado', pos: [1, 0], seta: 'alvo' },
        { id: 'y', nome: '', tipo: 'comum', pos: [2, 0], seta: 'alvo' },
        { id: 'k', nome: '', tipo: 'docontra', pos: [3, 0], seta: 'alvo2' },
        { id: 'w', nome: '', tipo: 'comum', pos: [4, 0], seta: 'alvo2' },
        { id: 'alvo', nome: '', tipo: 'comum', pos: [0, 1] },
        { id: 'alvo2', nome: '', tipo: 'comum', pos: [1, 1] },
      ],
      amizades: [['f', 'x'], ['f', 'y'], ['f', 'k'], ['f', 'w'], ['x', 'alvo'], ['y', 'alvo'], ['k', 'alvo2'], ['w', 'alvo2']],
    };
    const r = espalhar(f, { origem: 'f', setas: {} });
    expect(r.ouviu.alvo.tamanho).toBe(2);
    expect(r.ouviu.alvo2.versao).toBe('normal');
  });

  it('horário: recado pro Seu Zé antes de ele voltar se perde; depois, ele ouve', () => {
    const padaria = fases[12];
    const cedo = espalhar(padaria, { origem: 'n', setas: {} }); // Neide conta na batida 1, ele volta na 2
    expect(cedo.vitoria).toBe(true);
    expect(cedo.ouviu.z).toBeUndefined();
    expect(cedo.batidas[0].some((m) => m.para === 'z')).toBe(true); // o recado foi mandado, só não tinha ninguém
    const tarde = espalhar(padaria, { origem: 'a', setas: {} }); // Neide só conta na batida 2
    expect(tarde.motivo).toBe('assunto_ouviu');
    expect(tarde.ouviu.z.batida).toBe(2);
  });

  it('do contra inverte, e dois do contra desinvertem', () => {
    const f = fases[9];
    expect(espalhar(f, { origem: 'r', setas: {} }).motivo).toBe('versao_errada');
    expect(espalhar(f, { origem: 'd', setas: {} }).vitoria).toBe(true);
  });
});

// Checagens de cada fase: estrutura válida, desenho legível e quebra-cabeça justo.
describe.each(fases.map((f, i) => [i + 1, f] as const))('fase %i', (_n, fase) => {
  const ids = fase.vizinhos.map((v) => v.id);

  it('estrutura válida', () => {
    expect(new Set(ids).size).toBe(ids.length);
    for (const [a, b] of fase.amizades) expect(ids).toContain(a), expect(ids).toContain(b);
    const posicoes = fase.vizinhos.map((v) => v.pos.join(','));
    expect(new Set(posicoes).size).toBe(posicoes.length);
    for (const v of fase.vizinhos) {
      if (v.seta) expect(amigosDe(fase, v.id), `seta de ${v.nome}`).toContain(v.seta);
      if (v.interesse) expect(v.tipo).not.toBe('assunto');
    }
  });

  it('nenhuma linha atravessa outro vizinho', () => {
    const p = Object.fromEntries(fase.vizinhos.map((v) => [v.id, v.pos]));
    for (const [a, b] of fase.amizades) {
      const [ax, ay] = p[a], [bx, by] = p[b];
      for (const v of fase.vizinhos) {
        if (v.id === a || v.id === b) continue;
        const [px, py] = v.pos;
        const t = ((px - ax) * (bx - ax) + (py - ay) * (by - ay)) / ((bx - ax) ** 2 + (by - ay) ** 2);
        if (t <= 0 || t >= 1) continue;
        const dist = Math.hypot(ax + t * (bx - ax) - px, ay + t * (by - ay) - py);
        expect(dist, `linha ${a}-${b} passa em ${v.nome}`).toBeGreaterThan(0.35);
      }
    }
  });

  it('tem de 1 a 3 soluções', () => {
    const n = resolver(fase).length;
    expect(n).toBeGreaterThanOrEqual(1);
    expect(n).toBeLessThanOrEqual(3);
  });

  it('todos os giros oferecidos são necessários', () => {
    if (fase.giros === 0) return;
    expect(resolver({ ...fase, giros: fase.giros - 1 })).toHaveLength(0);
  });

  it('existe pelo menos uma armadilha (origem que perde)', () => {
    if (fase === fases[0]) return; // fase 1 é só pra aprender a tocar e espalhar
    const perde = fase.vizinhos.some(
      (v) => v.tipo !== 'assunto' && !v.interesse && !espalhar(fase, { origem: v.id, setas: {} }).vitoria,
    );
    expect(perde).toBe(true);
  });
});

describe('ordem (bloco Ordem)', () => {
  // r — a — b⭐1 e r — c⭐2: a Bia tem que saber antes da Cida
  const f: Fase = {
    titulo: 'ordem', boato: '', giros: 0, origens: ['r'], setas: 3,
    vizinhos: [
      { id: 'r', nome: 'Rita', tipo: 'comum', pos: [1, 0] },
      { id: 'a', nome: 'Ana', tipo: 'comum', pos: [0, 0] },
      { id: 'b', nome: 'Bia', tipo: 'comum', pos: [0, 1], interesse: { ordem: 1 } },
      { id: 'c', nome: 'Cida', tipo: 'comum', pos: [2, 0], interesse: { ordem: 2 } },
    ],
    amizades: [['r', 'a'], ['a', 'b'], ['r', 'c'], ['b', 'c']],
  };
  it('na ordem vence; fora de ordem perde e aponta quem soube cedo e quem tinha a vez', () => {
    expect(espalhar(f, { origem: 'r', setas: { r: 'a', a: 'b', b: 'c' } }).vitoria).toBe(true);
    const r = espalhar(f, { origem: 'r', setas: { r: 'c', c: 'b' } });
    expect(r).toMatchObject({ vitoria: false, motivo: 'ordem_errada', culpado: 'c', antes: 'b' });
  });
  it('ao mesmo tempo também perde', () => {
    const junto = { ...f, vizinhos: [...f.vizinhos, { id: 'n', nome: 'Neide', tipo: 'fofoqueira' as const, pos: [1, 1] as [number, number] }], amizades: [['r', 'n'], ['n', 'b'], ['n', 'c']] as [string, string][] };
    const r = espalhar(junto, { origem: 'r', setas: { r: 'n' } });
    expect(r.ouviu.b.batida).toBe(r.ouviu.c.batida);
    expect(r.motivo).toBe('ordem_errada');
  });
});

describe('procedência: de quem cada um ouviu de fato', () => {
  const mk = (vizinhos: Fase['vizinhos'], amizades: [string, string][]): Fase => ({ titulo: '', boato: '', giros: 0, origens: ['r'], vizinhos, amizades });
  const c = (id: string, extra: Partial<Fase['vizinhos'][0]> = {}) => ({ id, nome: id, tipo: 'comum' as const, pos: [0, 0] as [number, number], ...extra });

  it('a origem não ouviu de ninguém; transmissão comum e da Fofoqueira registram quem contou', () => {
    const f = mk([c('r'), { ...c('n'), tipo: 'fofoqueira' }, c('a'), c('z', { tipo: 'assunto' })], [['r', 'n'], ['n', 'a'], ['n', 'z']]);
    const r = espalhar(f, { origem: 'r', setas: { r: 'n' } });
    expect(r.ouviu.r.de).toBeNull();
    expect(r.ouviu.n.de).toBe('r');
    expect(r.ouviu.a.de).toBe('n');
    expect(r.ouviu.z.de).toBe('n');
  });

  it('chegada simultânea: vale quem entregou a maior (o desempate), não o primeiro da lista', () => {
    // r conta pra a (comum) e pra e (exagerado) via Fofoqueira; os dois contam pro x na mesma batida
    const f = mk([c('r'), { ...c('n'), tipo: 'fofoqueira' }, c('a'), { ...c('e'), tipo: 'exagerado' }, c('x')],
      [['r', 'n'], ['n', 'a'], ['n', 'e'], ['a', 'x'], ['e', 'x']]);
    const r = espalhar(f, { origem: 'r', setas: { r: 'n', a: 'x', e: 'x' } });
    expect(r.ouviu.x.tamanho).toBe(2);
    expect(r.ouviu.x.de).toBe('e');
    expect(r.batidas[2].map((m) => m.de)).toContain('a'); // o envio do a existiu, mas não foi o que valeu
  });

  it('recado perdido na padaria não conta; quem chegou depois da volta é o remetente', () => {
    const f2 =mk([c('r'), { ...c('n'), tipo: 'fofoqueira' }, c('b'), c('x', { chega: 3 })], [['r', 'n'], ['n', 'b'], ['n', 'x'], ['b', 'x']]);
    const r3 = espalhar(f2, { origem: 'r', setas: { r: 'n', b: 'x' } });
    expect(r3.ouviu.x.batida).toBe(3); // a Fofoqueira contou na 2 (perdido); o b contou na 3
    expect(r3.ouviu.x.de).toBe('b');
  });

  it('quemContou: um remetente normalmente; no empate de tamanho, todos os que empataram', () => {
    const f = mk([c('r'), { ...c('n'), tipo: 'fofoqueira' }, c('a'), c('b'), c('z', { tipo: 'assunto' })],
      [['r', 'n'], ['n', 'a'], ['n', 'b'], ['a', 'z'], ['b', 'z']]);
    expect(quemContou(espalhar(f, { origem: 'r', setas: { r: 'n', a: 'z' } }), 'z')).toEqual(['a']);
    expect(quemContou(espalhar(f, { origem: 'r', setas: { r: 'n', a: 'z', b: 'z' } }), 'z').sort()).toEqual(['a', 'b']);
    expect(quemContou(espalhar(f, { origem: 'r', setas: {} }), 'r')).toEqual([]); // a origem
  });

  it('quem já ouviu não troca de remetente com recado repetido', () => {
    const f = mk([c('r'), c('a'), c('b')], [['r', 'a'], ['a', 'b'], ['b', 'r']]);
    const r = espalhar(f, { origem: 'r', setas: { r: 'a', a: 'b', b: 'r' } });
    expect(r.ouviu.r.de).toBeNull();
    expect(r.ouviu.b.de).toBe('a');
  });
});
