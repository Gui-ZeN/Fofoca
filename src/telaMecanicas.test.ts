// A tela das cinco mecânicas novas (2026-11-13). Fases pequenas montadas à mão (as dos blocos reais são de outros arquivos).
// Renderiza o Predio em texto (sem navegador) e confere os símbolos; a geometria pura é testada direto.
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { espalhar, type Fase, type Vizinho } from './motor';
import { FichaValidade } from './Icones';
import { Predio, geometriaFio, geometriaMuro, ondeDaRonda, rotaDaRonda, tracoDoFio } from './Predio';

const v = (id: string, nome: string, tipo: Vizinho['tipo'], pos: [number, number], extra: Partial<Vizinho> = {}): Vizinho => ({ id, nome, tipo, pos, ...extra });
const base = (extra: Partial<Fase>, vizinhos: Vizinho[], amizades: [string, string][]): Fase => ({ titulo: 't', boato: 'b', giros: 0, vizinhos, amizades, ...extra });

const props = (fase: Fase, extra = {}) => ({
  fase, origem: 'a', setas: {}, batida: 0, montando: true, aoTocar: () => {}, aoGirar: () => {}, ...extra,
});
// o aviso do React sobre useLayoutEffect no servidor é ruído aqui (o Predio mede texto de verdade no navegador)
const desenhar = (p: ReturnType<typeof props>) => {
  const erro = vi.spyOn(console, 'error').mockImplementation(() => {});
  try { return renderToStaticMarkup(createElement('svg', null, createElement(Predio, p))); } finally { erro.mockRestore(); }
};
const conta = (html: string, re: RegExp) => (html.match(re) ?? []).length;

const ronda = base({}, [
  v('a', 'Rita', 'comum', [0, 0], { seta: 'b' }), v('b', 'Davi', 'comum', [1, 0], { seta: 'c' }),
  v('c', 'Cida', 'comum', [2, 0], { interesse: {} }), v('z', 'Seu Zé', 'assunto', [1, 1], { ronda: ['z', 'b', 'a'] }),
], [['a', 'b'], ['b', 'c'], ['b', 'z']]);

describe('ronda', () => {
  it('a rota tem uma parada por item, na ordem, com o número da batida', () => {
    const rota = rotaDaRonda(ronda);
    expect(rota.map((p) => p.id)).toEqual(['z', 'b', 'a']);
    expect(rota.map((p) => p.n)).toEqual([1, 2, 3]);
    expect(conta(desenhar(props(ronda)), /class="parada"/g)).toBe(3);
  });
  it('visita repetida ao mesmo apartamento não cai em cima da anterior', () => {
    const f = base({}, ronda.vizinhos.map((w) => (w.id === 'z' ? { ...w, ronda: ['b', 'a', 'b'] } : w)), ronda.amizades);
    const [p1, , p3] = rotaDaRonda(f);
    expect(p1.x).not.toBe(p3.x);
  });
  it('sem ronda, nada de rota nem pegadas (fase antiga igual)', () => {
    const f = base({}, ronda.vizinhos.map((w) => ({ ...w, ronda: undefined })), ronda.amizades);
    const html = desenhar(props(f));
    expect(rotaDaRonda(f)).toEqual([]);
    expect(html).not.toContain('rota-ronda');
    expect(html).not.toContain('pegadas');
  });
  it('o selo de pegadas existe na plaquinha dela', () => {
    expect(conta(desenhar(props(ronda)), /class="pegadas"/g)).toBe(1);
  });
  it('espalhando, ela é desenhada na casa que visita e a casa dela fica vazia', () => {
    const r = espalhar(ronda, { origem: 'a', setas: { a: 'b' } });
    expect(r.rondas?.[0]).toEqual({ batida: 1, onde: 'z' });
    // batida 2: ela está em b (Davi)
    expect(ondeDaRonda(ronda.vizinhos[3], r, 2, false)).toBe('b');
    const html = desenhar(props(ronda, { resultado: r, montando: false, batida: 2 }));
    expect(conta(html, /class="visita"/g)).toBe(1);
    expect(html).not.toContain('rota-ronda'); // a rota some quando o boato anda
  });
  it('no fim, ela fica onde esteve na última batida (não na seguinte)', () => {
    const r = espalhar(ronda, { origem: 'a', setas: { a: 'b' } });
    const ultima = r.rondas![r.rondas!.length - 1];
    expect(ondeDaRonda(ronda.vizinhos[3], r, r.batidas.length + 1, false)).toBe(ultima.onde);
  });
});

describe('soneca', () => {
  const f = base({}, [
    v('a', 'Rita', 'comum', [0, 0], { seta: 'b' }), v('b', 'Davi', 'comum', [1, 0], { seta: 'c', soneca: true }),
    v('c', 'Cida', 'comum', [2, 0], { interesse: {} }),
  ], [['a', 'b'], ['b', 'c']]);
  it('o selo "z z" existe só em quem tem soneca, mesmo sem nomes', () => {
    expect(conta(desenhar(props(f)), /class="soneca"/g)).toBe(1);
  });
  it('na batida de espera o balão dele fica com os zzz', () => {
    const r = espalhar(f, { origem: 'a', setas: { a: 'b' } });
    expect(r.ouviu.b.batida).toBe(1);
    expect(desenhar(props(f, { resultado: r, montando: false, batida: 2 }))).toContain('class="zzz"');
    expect(desenhar(props(f, { resultado: r, montando: false, batida: 3 }))).not.toContain('class="zzz"');
  });
});

describe('interfone', () => {
  // a (0,0) e c (0,2): longe um do outro, sem porta
  const f = base({ interfones: [['a', 'c']] }, [
    v('a', 'Rita', 'comum', [0, 0], { seta: 'b' }), v('b', 'Davi', 'comum', [1, 0]), v('c', 'Cida', 'comum', [0, 2], { interesse: {} }),
  ], [['a', 'b']]);
  it('há um fio por par, com um aparelho em cada ponta', () => {
    const html = desenhar(props(f));
    expect(conta(html, /class="fio-interfone"/g)).toBe(1);
    expect(conta(html, /class="aparelho"/g)).toBe(2);
  });
  it('o fio sai pelo lado do prédio, fora das paredes', () => {
    const g = geometriaFio(f, ['a', 'c']);
    expect(g.c1.x).toBeLessThan(0);
    expect(g.c2.x).toBeLessThan(0);
  });
  it('a seta desenhada por esse laço segue o fio, nos dois sentidos', () => {
    const ida = tracoDoFio(f, 'a', 'c'), volta = tracoDoFio(f, 'c', 'a');
    expect([ida.x1, ida.y1]).toEqual([volta.x2, volta.y2]);
    expect([ida.x2, ida.y2]).toEqual([volta.x1, volta.y1]);
    const html = desenhar(props(f, { setas: { a: 'c' } }));
    expect(html).toContain('class="seta fio girada"');
  });
  it('par que já tem porta não ganha fio', () => {
    const g = base({ interfones: [['a', 'b']] }, f.vizinhos, [['a', 'b']]);
    expect(desenhar(props(g))).not.toContain('fio-interfone');
  });
});

describe('muro fino', () => {
  const f = base({ murosFinos: [['a', 'b'], ['a', 'c']] }, [
    v('a', 'Rita', 'comum', [0, 0], { seta: 'd' }), v('b', 'Davi', 'comum', [1, 0]), v('c', 'Cida', 'comum', [0, 1]), v('d', 'Lia', 'comum', [2, 0], { interesse: {} }),
  ], []);
  it('há um muro marcado por par: parede quando lado a lado, laje quando um mora em cima do outro', () => {
    const [a, b, c] = f.vizinhos;
    expect(geometriaMuro(a, b)?.tipo).toBe('parede');
    expect(geometriaMuro(a, c)?.tipo).toBe('laje');
    expect(conta(desenhar(props(f)), /class="muro-fino"/g)).toBe(2);
  });
  it('sem muro, nenhuma faixa', () => {
    expect(desenhar(props({ ...f, murosFinos: undefined }))).not.toContain('muro-fino');
  });
  it('o vazamento pra quem não é a vítima solta ondas douradas', () => {
    const g = base({ murosFinos: [['a', 'b']] }, [
      v('a', 'Rita', 'exagerado', [0, 0], { seta: 'c' }), v('b', 'Davi', 'comum', [1, 0]), v('c', 'Cida', 'comum', [0, 1], { interesse: {} }),
    ], [['a', 'c']]);
    const r = espalhar(g, { origem: 'a', setas: {} });
    // a conta: cochicho → exagerado vira fofoca (2), não vaza; o teste só confere o caminho do desenho com uma mensagem vazou
    const falso = { ...r, batidas: [[{ de: 'a', para: 'b', tamanho: 3 as const, versao: 'normal' as const, vazou: true }]] };
    expect(desenhar(props(g, { resultado: falso, montando: false, batida: 1 }))).toContain('ondas-vera ouro');
  });
});

describe('boato que esfria', () => {
  it('a ficha mostra o prazo montando e a batida contra o prazo espalhando', () => {
    expect(renderToStaticMarkup(createElement(FichaValidade, { validade: 5, batida: 0, montando: true }))).toContain('>5</span>');
    const andando = renderToStaticMarkup(createElement(FichaValidade, { validade: 5, batida: 3, montando: false }));
    expect(andando).toContain('3/5');
    expect(andando).not.toContain('fria');
  });
  it('passou do prazo, a ficha fica vermelha', () => {
    expect(renderToStaticMarkup(createElement(FichaValidade, { validade: 5, batida: 6, montando: false }))).toContain('validade fria');
  });
});
