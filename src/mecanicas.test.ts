// As cinco mecânicas novas do motor (2026-11-13): ronda, soneca, interfone, muro fino e boato que esfria.
// Casos pequenos montados à mão (batida = índice + 1 em `batidas`; a origem ouve na 0) + regressão das fases existentes.
import { describe, expect, it } from 'vitest';
import { alvosDe, ateAVitima, amigosDe, espalhar, porCelular, porInterfone, quemContou, type Fase, type Resultado, type Vizinho } from './motor';
import { explicar } from './explicar';
import { jogar, resolverTrilho } from './trilho';
import { PREDIO } from './campanha';
import snapshot from './mecanicas.snapshot.json';

const w = (id: string, tipo: Vizinho['tipo'], pos: [number, number], extra: Partial<Vizinho> = {}): Vizinho => ({ id, nome: id, tipo, pos, ...extra });
const fase = (vizinhos: Vizinho[], amizades: [string, string][], extra: Partial<Fase> = {}): Fase =>
  ({ titulo: '', boato: '', giros: 0, vizinhos, amizades, ...extra });
const vai = (f: Fase, setas: Record<string, string>, origem = 'r') => espalhar(f, { origem, setas });
const [R, A, B, S] = ['r', 'a', 'b', 's'];

// linha r - a - b - s (a estrela): r ouve na 0, a na 1, b na 2, s na 3; mais z (a vítima) e q (ninguém liga pra ele)
const linha = (extra: Record<string, Partial<Vizinho>> = {}, fim: Partial<Fase> = {}): Fase =>
  fase(
    [w(R, 'comum', [0, 0]), w(A, 'comum', [1, 0]), w(B, 'comum', [2, 0]), w(S, 'comum', [3, 0], { interesse: {} }),
      w('z', 'assunto', [0, 1]), w('q', 'comum', [3, 1])].map((x) => ({ ...x, ...extra[x.id] })),
    [[R, A], [A, B], [B, S]], fim,
  );
const todos = { r: 'a', a: 'b', b: 's' };

describe('ronda: a vítima que anda', () => {
  it('visitando quem RECEBE o boato: escuta (derrota), com `escuta` + `ronda` e `de` = quem falou', () => {
    const r = vai(linha({ z: { ronda: ['z', 'b'] } }), todos); // na batida 2 ela está no b; a conta pro b
    expect(r.vitoria).toBe(false);
    expect(r.motivo).toBe('assunto_ouviu');
    expect(r.culpado).toBe('z');
    expect(r.ouviu.z.batida).toBe(2);
    expect(r.batidas[1]).toContainEqual({ de: 'a', para: 'z', tamanho: 1, versao: 'normal', escuta: true, ronda: true });
  });

  it('visitando quem CONTA o boato: escuta também', () => {
    const r = vai(linha({ z: { ronda: ['z', 'a'] } }), todos); // batida 2: o a conta pro b
    expect(r.ouviu.z.batida).toBe(2);
    expect(r.ouviu.z.de).toBe('a');
    expect(r.batidas[1].find((m) => m.ronda)).toMatchObject({ de: 'a', para: 'z' });
  });

  it('não escuta na batida vizinha: estar no b na 1 (nada acontece) e em casa na 2 e 3 não escuta', () => {
    const r = vai(linha({ z: { ronda: ['b', 'z', 'z'] } }), todos);
    expect(r.ouviu.z).toBeUndefined();
    expect(r.vitoria).toBe(true);
    expect(r.batidas.flat().some((m) => m.ronda)).toBe(false);
    expect(r.rondas).toEqual([{ batida: 1, onde: 'b' }, { batida: 2, onde: 'z' }, { batida: 3, onde: 'z' }]);
  });

  it('em casa vale a regra normal de vítima (recado pra ela = derrota, sem `ronda`)', () => {
    const f = linha({ z: { ronda: ['z'] } }, {});
    f.amizades.push(['b', 'z']);
    const r = vai(f, { r: 'a', a: 'b', b: 'z' });
    expect(r.motivo).toBe('assunto_ouviu');
    expect(r.ouviu.z.batida).toBe(3);
    expect(r.batidas[2].some((m) => m.ronda)).toBe(false);
  });

  it('recado mandado PRA ELA se perde enquanto está fora de casa', () => {
    const f = linha({ z: { ronda: ['q'] } }); // ela passa o tempo todo no q, onde ninguém fala nem ouve nada
    f.amizades.push(['b', 'z']);
    const r = vai(f, { r: 'a', a: 'b', b: 'z' });
    expect(r.batidas[2]).toContainEqual({ de: 'b', para: 'z', tamanho: 1, versao: 'normal' }); // o recado foi mandado
    expect(r.ouviu.z).toBeUndefined(); // ... e ela não estava lá
    expect(r.motivo).toBe('interessado_nao_ouviu'); // a derrota é a estrela sem notícia, não a vítima
  });

  it('o ciclo dá a volta: [q, c] com 4 batidas só escuta na 4 (batida par = c)', () => {
    const f = fase(
      [w(R, 'comum', [0, 0]), w(A, 'comum', [1, 0]), w(B, 'comum', [2, 0]), w('c', 'comum', [3, 0]), w(S, 'comum', [4, 0], { interesse: {} }), w('z', 'assunto', [0, 1], { ronda: ['q', 'c'] }), w('q', 'comum', [4, 1])],
      [[R, A], [A, B], [B, 'c'], ['c', S]],
    );
    const r = vai(f, { r: 'a', a: 'b', b: 'c', c: 's' });
    // b2: ela está no c, mas ninguém fala dele (a→b); b3: está no q; b4: está no c, que conta pro s
    expect(r.ouviu.z.batida).toBe(4);
    expect(r.ouviu.z.de).toBe('c');
    expect(r.rondas).toEqual([{ batida: 1, onde: 'q' }, { batida: 2, onde: 'c' }, { batida: 3, onde: 'q' }, { batida: 4, onde: 'c' }]);
  });

  it('sem ronda nada muda: sem `rondas` no resultado', () => {
    const r = vai(linha(), todos);
    expect('rondas' in r).toBe(false);
    expect(r.vitoria).toBe(true);
  });

  it('explicação: a ronda cita quem ela visitava e a batida; ateAVitima corta `rondas`', () => {
    const f = linha({ z: { ronda: ['a', 'z', 'z'] } });
    const r = vai(f, todos);
    expect(r.rondas).toHaveLength(3); // o motor simula tudo
    expect(explicar(f, r)).toEqual({ tipo: 'ronda', id: 'a', vitima: 'z', batida: 1 });
    const c = ateAVitima(r);
    expect(c.rondas).toEqual([{ batida: 1, onde: 'a' }]);
    expect(c.batidas).toHaveLength(1);
  });

  it('o resolvedor desvia da vítima: dois caminhos, só o que não passa pelo a na batida 2 vence', () => {
    const f = fase(
      [w(R, 'comum', [0, 0]), w(A, 'comum', [1, 0]), w(B, 'comum', [0, 1]), w(S, 'comum', [1, 1], { interesse: {} }), w('z', 'assunto', [2, 0], { ronda: ['z', 'a'] })],
      [[R, A], [A, S], [R, B], [B, S]], { setas: 2, origens: [R] },
    );
    expect(resolverTrilho(f, 2)).toEqual([{ r: 'b', b: 's' }]);
    expect(jogar(f, { r: 'a', a: 's' }).motivo).toBe('assunto_ouviu');
  });
});

describe('soneca: ouve na b e só conta na b + 2', () => {
  it('conta na b + 2 e a batida do meio existe, vazia', () => {
    const r = vai(linha({ a: { soneca: true } }), todos);
    expect(r.ouviu.a.batida).toBe(1);
    expect(r.ouviu.b.batida).toBe(3); // sem soneca seria 2
    expect(r.ouviu.s.batida).toBe(4);
    expect(r.vitoria).toBe(true);
    expect(r.batidas).toHaveLength(4);
    expect(r.batidas[1]).toEqual([]); // batida 2: o a dormindo
    expect(r.batidas[2]).toEqual([{ de: 'a', para: 'b', tamanho: 1, versao: 'normal' }]);
    expect(quemContou(r, 's')).toEqual(['b']); // o índice de `batidas` continua sendo o relógio
    expect(quemContou(r, 'b')).toEqual(['a']);
  });

  it('dois sonecas em fila: cada um atrasa uma batida', () => {
    const r = vai(linha({ a: { soneca: true }, b: { soneca: true } }), todos);
    expect([r.ouviu.a.batida, r.ouviu.b.batida, r.ouviu.s.batida]).toEqual([1, 3, 5]);
    expect(r.batidas.map((x) => x.length)).toEqual([1, 0, 1, 0, 1]);
    expect(quemContou(r, 's')).toEqual(['b']);
  });

  it('a origem pode ser soneca: conta na 2', () => {
    const r = vai(linha({ r: { soneca: true } }), todos);
    expect(r.batidas[0]).toEqual([]);
    expect(r.ouviu.a.batida).toBe(2);
  });

  it('aceita seta normalmente (a seta que o jogador desenha vale)', () => {
    const f = linha({ a: { soneca: true } });
    f.amizades.push(['a', 'q']);
    const r = vai(f, { r: 'a', a: 'q' });
    expect(r.ouviu.q.batida).toBe(3);
  });

  it('soneca no fim da linha não deixa batida vazia sobrando (nada acontece depois)', () => {
    const r = vai(linha({ s: { soneca: true } }), todos);
    expect(r.batidas).toHaveLength(3);
    expect(r.vitoria).toBe(true);
  });

  it('sem soneca nada muda: batidas e ouviu iguais aos de antes', () => {
    const r = vai(linha(), todos);
    expect(r.batidas).toHaveLength(3);
    expect(r.batidas.every((x) => x.length === 1)).toBe(true);
    expect(Object.fromEntries(Object.entries(r.ouviu).map(([k, o]) => [k, o.batida]))).toEqual({ r: 0, a: 1, b: 2, s: 3 });
  });

  it('o resolvedor acha a jogada com a soneca (a ordem em que as pessoas ouvem muda)', () => {
    const f = { ...linha({ a: { soneca: true } }), setas: 3, origens: [R] as [string] };
    expect(resolverTrilho(f, 3)).toEqual([todos]);
    expect(jogar(f, todos).vitoria).toBe(true);
  });

  it('com validade, a soneca estoura o prazo: ouve na 1, conta na 3, a estrela só ouviria na 4', () => {
    const r = vai(linha({ a: { soneca: true } }, { validade: 3 }), todos);
    expect(r.ouviu.b.batida).toBe(3);
    expect(r.esfriou).toEqual([{ id: 's', batida: 4 }]);
  });
});

describe('interfone: atalho entre apartamentos distantes', () => {
  // r e s moram longe (sem porta entre eles); o interfone liga os dois
  const longe = (extra: Partial<Fase> = {}) =>
    fase([w(R, 'comum', [0, 0]), w(A, 'comum', [1, 0]), w(S, 'comum', [2, 2], { interesse: {} })], [[R, A]], { setas: 2, origens: [R], interfones: [[R, S]], ...extra });

  it('porInterfone vale nos dois sentidos e só pra quem tem fio', () => {
    const f = longe();
    expect(porInterfone(f, R, S)).toBe(true);
    expect(porInterfone(f, S, R)).toBe(true);
    expect(porInterfone(f, R, A)).toBe(false);
    expect(porInterfone(longe({ interfones: undefined }), R, S)).toBe(false);
  });

  it('os dois viram vizinhos: seta possível, sem ser ligação de celular', () => {
    const f = longe();
    expect(amigosDe(f, R)).toEqual([A, S]);
    expect(amigosDe(f, S)).toEqual([R]);
    expect(alvosDe(f, f.vizinhos[0])).toEqual([A, S]);
    expect(porCelular(f, R, S)).toBe(false);
    expect(porCelular(f, R, 'zzz')).toBe(true);
  });

  it('seta pelo fio: chega na mesma batida que chegaria por uma porta (1)', () => {
    const r = jogar(longe(), { r: 's' });
    expect(r.ouviu.s.batida).toBe(1);
    expect(r.vitoria).toBe(true);
    expect(resolverTrilho(longe(), 2)).toEqual([{ r: 's' }]); // o resolvedor enxerga o fio
    expect(resolverTrilho(longe({ interfones: undefined }), 2)).toEqual([]);
  });

  it('a Fofoqueira espalha pelo fio também', () => {
    const f = fase(
      [w(R, 'comum', [0, 0]), w('n', 'fofoqueira', [1, 0]), w(S, 'comum', [2, 2], { interesse: {} })],
      [[R, 'n']], { interfones: [['n', S]] },
    );
    const r = vai(f, { r: 'n' });
    expect(r.ouviu.s.batida).toBe(2);
    expect(r.batidas[1]).toContainEqual({ de: 'n', para: 's', tamanho: 1, versao: 'normal' });
  });

  it('um par que já tem porta não duplica o vizinho', () => {
    const f = fase([w(R, 'comum', [0, 0]), w(A, 'comum', [1, 0])], [[R, A]], { interfones: [[R, A]] });
    expect(amigosDe(f, R)).toEqual([A]);
    expect(porInterfone(f, R, A)).toBe(false); // vale a porta: sem fio pra desenhar
  });

  // Nando em r(0,0) - p(1,0) - b(2,0): vindo do r por porta, passa reto pro b
  const nando = (extra: Partial<Fase>, amizades: [string, string][]) =>
    fase([w(R, 'comum', [0, 0]), w('p', 'apressado', [1, 0]), w(B, 'comum', [2, 0]), w('x', 'comum', [1, 2])], amizades, extra);

  it('Nando NÃO passa reto por interfone: o fio não é porta (ouvindo de quem liga pelo fio, ele guarda)', () => {
    const f = nando({ interfones: [['x', 'p']] }, [[R, 'p'], ['p', B]]);
    const porta = vai(f, { r: 'p' });
    expect(porta.ouviu.b.batida).toBe(2); // por porta, como sempre
    expect(porta.ouviu.x).toBeUndefined(); // e não passa pro interfone
    const fio = vai(f, { x: 'p' }, 'x');
    expect(fio.ouviu.p.batida).toBe(1);
    expect(fio.ouviu.b).toBeUndefined(); // veio pelo fio: não há "lado"
  });

  it('o lado oposto precisa ser porta: um vizinho só de interfone, mesmo colado, não recebe', () => {
    const so = nando({ interfones: [['p', B]] }, [[R, 'p']]);
    expect(vai(so, { r: 'p' }).ouviu.b).toBeUndefined();
    const porta = nando({}, [[R, 'p'], ['p', B]]);
    expect(vai(porta, { r: 'p' }).ouviu.b.batida).toBe(2);
    expect(explicar({ ...so, vizinhos: so.vizinhos.map((x) => (x.id === 'b' ? { ...x, interesse: {} } : x)) }, vai({ ...so, vizinhos: so.vizinhos.map((x) => (x.id === 'b' ? { ...x, interesse: {} } : x)) }, { r: 'p' })))
      .toEqual({ tipo: 'reto', id: 'p', motivo: 'sem saida' });
  });
});

describe('muro fino: o escândalo vaza pela parede', () => {
  // r → e (exagerado) → f (exagerado) → t: f conta escândalo (3) na batida 3. w mora colado no f, sem porta.
  const prediodo = (extra: Partial<Fase> = {}, f: Partial<Vizinho> = {}, w2: Partial<Vizinho> = {}): Fase =>
    fase(
      [w(R, 'comum', [0, 0]), w('e', 'exagerado', [1, 0]), w('f', 'exagerado', [2, 0], f), w('t', 'comum', [3, 0]), w('w', 'comum', [2, 1], w2)],
      [[R, 'e'], ['e', 'f'], ['f', 't']], { murosFinos: [['f', 'w']], ...extra },
    );
  const cadeia = { r: 'e', e: 'f', f: 't' };

  it('escândalo (3) vaza: o do outro lado ouve na mesma batida, mesmo tamanho e versão, com `vazou`', () => {
    const r = vai(prediodo(), cadeia);
    expect(r.ouviu.f).toMatchObject({ tamanho: 2, batida: 2 });
    expect(r.ouviu.t).toMatchObject({ tamanho: 3, batida: 3 });
    expect(r.ouviu.w).toEqual({ tamanho: 3, versao: 'normal', batida: 3, de: 'f' });
    expect(r.batidas[2]).toEqual([
      { de: 'f', para: 't', tamanho: 3, versao: 'normal' },
      { de: 'f', para: 'w', tamanho: 3, versao: 'normal', vazou: true },
    ]);
  });

  it('só o tamanho 3 vaza: com um exagerado só (tamanho 2) a parede segura', () => {
    const r = vai(prediodo({}, { tipo: 'comum' }), cadeia);
    expect(r.ouviu.t.tamanho).toBe(2);
    expect(r.ouviu.w).toBeUndefined();
    expect(r.batidas.flat().some((m) => m.vazou)).toBe(false);
  });

  it('conta depois do Arnaldo: 3 reduzido a 2 não vaza', () => {
    const f = prediodo();
    f.vizinhos.push(w('arn', 'assunto', [2, 2], { abafa: true }));
    f.amizades.push(['f', 'arn']);
    const r = vai(f, cadeia);
    expect(r.ouviu.t.tamanho).toBe(2);
    expect(r.ouviu.w).toBeUndefined();
  });

  it('vale nos dois sentidos: quem conta é o w, e o f (do par) ouve', () => {
    const f = fase(
      [w(R, 'comum', [0, 0]), w('e', 'exagerado', [1, 0]), w('w', 'exagerado', [2, 1]), w('t', 'comum', [3, 1]), w('f', 'comum', [2, 0])],
      [[R, 'e'], ['e', 'w'], ['w', 't']], { murosFinos: [['f', 'w']] }, // par escrito na ordem inversa
    );
    const r = vai(f, { r: 'e', e: 'w', w: 't' });
    expect(r.ouviu.f).toEqual({ tamanho: 3, versao: 'normal', batida: 3, de: 'w' });
  });

  it('mantém a versão (Do Contra inverte antes de contar)', () => {
    // r → d (do contra, inverte) → e (exagerado, 2) → f (exagerado, 3): f conta escândalo na versão invertida
    const g = fase(
      [w(R, 'comum', [0, 0]), w('d', 'docontra', [1, 0]), w('e', 'exagerado', [2, 0]), w('f', 'exagerado', [3, 0]), w('t', 'comum', [4, 0]), w('w', 'comum', [3, 1])],
      [[R, 'd'], ['d', 'e'], ['e', 'f'], ['f', 't']], { murosFinos: [['f', 'w']] },
    );
    const r = vai(g, { r: 'd', d: 'e', e: 'f', f: 't' });
    expect(r.ouviu.w).toMatchObject({ tamanho: 3, versao: 'invertida', de: 'f' });
  });

  it('a vítima ouvindo pelo muro perde (e a explicação diz de quem pra quem)', () => {
    const f = prediodo({ murosFinos: [['f', 'z']] });
    f.vizinhos.push(w('z', 'assunto', [2, 1]));
    f.vizinhos = f.vizinhos.filter((x) => x.id !== 'w');
    const r = vai(f, cadeia);
    expect(r.vitoria).toBe(false);
    expect(r.motivo).toBe('assunto_ouviu');
    expect(r.culpado).toBe('z');
    expect(r.ouviu.z.batida).toBe(3);
    expect(explicar(f, r)).toEqual({ tipo: 'vazou', id: 'f', de: 'f', para: 'z' });
  });

  it('quem ouviu pelo muro conta na batida seguinte, se tiver seta', () => {
    const f = prediodo({}, {}, {});
    f.vizinhos.push(w('s', 'comum', [3, 1], { interesse: {} }));
    f.amizades.push(['w', 's']);
    const r = vai(f, { ...cadeia, w: 's' });
    expect(r.ouviu.w.batida).toBe(3);
    expect(r.ouviu.s).toMatchObject({ batida: 4, de: 'w', tamanho: 3 });
    expect(quemContou(r, 's')).toEqual(['w']);
  });

  it('o vazamento não vaza de novo: w também mora colado em outro, que não ouve', () => {
    const f = prediodo({ murosFinos: [['f', 'w'], ['w', 'y']] });
    f.vizinhos.push(w('y', 'comum', [1, 1]));
    expect(vai(f, cadeia).ouviu.y).toBeUndefined();
  });

  it('quem já é o destinatário não ganha mensagem repetida', () => {
    const r = vai(prediodo({ murosFinos: [['f', 't']] }), cadeia);
    expect(r.batidas[2]).toHaveLength(1);
    expect(r.ouviu.t.batida).toBe(3);
  });

  it('o Padre/quem está fora de casa não ouve pelo muro (vale a presença, como nos recados)', () => {
    expect(vai(prediodo({}, {}, { chega: 4 }), cadeia).ouviu.w).toBeUndefined();
    expect(vai(prediodo({}, {}, { chega: 3 }), cadeia).ouviu.w?.batida).toBe(3);
  });
});

describe('boato que esfria: validade', () => {
  it('na batida N vale; na N + 1 já esfriou', () => {
    const ok = vai(linha({}, { validade: 3 }), todos); // a estrela ouve na 3
    expect(ok.vitoria).toBe(true);
    expect('esfriou' in ok).toBe(false);
    const frio = vai(linha({}, { validade: 2 }), todos);
    expect(frio.vitoria).toBe(false);
    expect(frio.motivo).toBe('interessado_nao_ouviu');
    expect(frio.ouviu.s).toBeUndefined();
    expect(frio.esfriou).toEqual([{ id: 's', batida: 3 }]);
    expect(frio.batidas).toHaveLength(3); // o b ainda mandou; só ninguém ouviu
  });

  it('a simulação para ali, e só a primeira leva é registrada', () => {
    const f = linha({}, { validade: 1 });
    const r = vai(f, todos); // b ouviria na 2: esfriou; a estrela (batida 3) nem entra
    expect(r.esfriou).toEqual([{ id: 'b', batida: 2 }]);
    expect(Object.keys(r.ouviu).sort()).toEqual(['a', 'r']);
    expect(r.batidas).toHaveLength(2);
  });

  it('a fofoqueira esfria pra todo mundo de uma vez', () => {
    const f = fase(
      [w(R, 'comum', [0, 0]), w('n', 'fofoqueira', [1, 0]), w(A, 'comum', [2, 0]), w(S, 'comum', [1, 1], { interesse: {} })],
      [[R, 'n'], ['n', A], ['n', S]], { validade: 1 },
    );
    const r = vai(f, { r: 'n' });
    expect(r.esfriou).toEqual([{ id: 'a', batida: 2 }, { id: 's', batida: 2 }]);
  });

  it('a explicação aponta a estrela e a batida em que o recado chegaria', () => {
    const f = linha({}, { validade: 2 });
    expect(explicar(f, vai(f, todos))).toEqual({ tipo: 'esfriou', id: 's', batida: 3 });
  });

  it('a vítima também não ouve depois da validade', () => {
    const f = linha({ b: { tipo: 'assunto' } }, { validade: 1 });
    expect(vai(f, todos).ouviu.b).toBeUndefined();
    expect(vai(linha({ b: { tipo: 'assunto' } }, { validade: 2 }), todos).motivo).toBe('assunto_ouviu');
  });

  it('ateAVitima: o que esfriou depois da batida em que a vítima ouviu sai do resultado', () => {
    // b (fofoqueira) conta pra z (vítima) e pra c na 3; c conta pro d na 4, já frio
    const f = fase(
      [w(R, 'comum', [0, 0]), w(A, 'comum', [1, 0]), w(B, 'fofoqueira', [2, 0]), w('z', 'assunto', [3, 0]), w('c', 'comum', [2, 1]), w('d', 'comum', [2, 2], { interesse: {} })],
      [[R, A], [A, B], [B, 'z'], [B, 'c'], ['c', 'd']], { validade: 3 },
    );
    const r: Resultado = vai(f, { r: 'a', a: 'b', c: 'd' });
    expect(r.esfriou).toEqual([{ id: 'd', batida: 4 }]);
    expect(ateAVitima(r).esfriou).toEqual([]);
  });
});

describe('regressão: as fases que já existem não mudaram', () => {
  type Forma = { v: boolean; m: string | null; c: string | null; b: number; n: number; o: unknown[] };
  const forma = (r: Resultado): Forma => ({
    v: r.vitoria, m: r.motivo ?? null, c: r.culpado ?? null, b: r.batidas.length,
    n: r.batidas.reduce((s, x) => s + x.length, 0),
    o: Object.entries(r.ouviu).sort(([a], [b]) => a.localeCompare(b)).map(([id, o]) => [id, o.batida, o.tamanho, o.versao, o.de]),
  });
  const fases = PREDIO.slice(0, 199);

  it('o snapshot gravado antes de mexer no motor cobre as 199 fases', () => {
    expect(snapshot).toHaveLength(199);
    expect(snapshot.map((x) => x.r)).toEqual(fases.map((a) => a.rotulo));
  });

  it('jogar(solucao) continua vencendo e jogar({}) continua igual (batidas, mensagens e quem ouviu)', () => {
    const diferentes: string[] = [];
    fases.forEach((a, i) => {
      const s = jogar(a.fase, a.fase.solucao);
      expect(s.vitoria, a.rotulo).toBe(true);
      if (JSON.stringify(forma(s)) !== JSON.stringify(snapshot[i].s) || JSON.stringify(forma(jogar(a.fase, {}))) !== JSON.stringify(snapshot[i].z)) diferentes.push(a.rotulo);
    });
    expect(diferentes).toEqual([]);
  });
});
