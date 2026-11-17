// A tela inicial (2026-11-17): Jogar grande primeiro, o corredor com o número do andar da vez na porta, e a Fofoca do dia
// junto do Jogar só quando o App a liberar (depois dos 31 feitos à mão). Renderizada em texto, sem navegador.
// O progresso agora é o conjunto de andares VENCIDOS (rótulos): o andar da vez é o primeiro não vencido.
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Indice, Menu } from './Menu';
import { capitulos } from './capitulos';
import { PREDIO, SEGMENTOS } from './campanha';

const CAPS = capitulos(SEGMENTOS);
const ROTULOS = Array.from({ length: 60 }, (_, i) => `R${i}`);
const ate = (n: number) => new Set(ROTULOS.slice(0, n)); // os n primeiros andares vencidos
const desenhar = (vencidos: ReadonlySet<string>, dia?: { feita: number; estrela: boolean }) => renderToStaticMarkup(createElement(Menu, {
  titulos: ROTULOS.map((_, i) => `Andar ${i + 1}`), vencidos, aoJogar: () => {}, capitulos: CAPS, primeira: new Set<string>(),
  rotulos: ROTULOS, dia: dia && { ...dia, aoJogar: () => {} },
}));

describe('tela inicial', () => {
  it('o Jogar vem antes de tudo o que é botão, com o andar da vez', () => {
    const html = desenhar(ate(6));
    const botoes = [...html.matchAll(/<button[^>]*class="([^"]*)"/g)].map((m) => m[1]);
    expect(botoes.indexOf('principal jogar')).toBeLessThan(botoes.indexOf('ver-andares'));
    expect(html).toMatch(/Jogar<small>7º andar<\/small>/);
  });

  it('a porta do corredor mostra o número do andar da vez; com um buraco, é o primeiro não vencido', () => {
    expect(desenhar(ate(6))).toMatch(/class="placa-num"[^>]*>7º</);
    expect(desenhar(ate(41))).toMatch(/class="placa-num"[^>]*>42º</);
    // vencidos R0..R9 e R12: o andar da vez é o 11º (R10), não o 13º
    const buraco = new Set([...ate(10), 'R12']);
    expect(desenhar(buraco)).toMatch(/class="placa-num"[^>]*>11º</);
    expect(desenhar(buraco)).toMatch(/Jogar<small>11º andar<\/small>/);
  });

  it('sem a Fofoca do dia liberada, ela não aparece; liberada, fica junto de Ver andares', () => {
    expect(desenhar(ate(6))).not.toContain('Fofoca do dia');
    const html = desenhar(ate(40), { feita: 0, estrela: false });
    expect(html).toMatch(/<div class="secundarios"><button class="dia"[^>]*>Fofoca do dia<\/button><button class="ver-andares"/);
    expect(desenhar(ate(40), { feita: 1, estrela: true })).toContain('feita de primeira ★');
  });

  it('pesquisa: "Andares difíceis" só aparece quando o App passa o kit (um link só pro playtest)', () => {
    const base = { titulos: ROTULOS.map((_, i) => `Andar ${i + 1}`), vencidos: ate(3), aoJogar: () => {}, capitulos: CAPS, primeira: new Set<string>(), rotulos: ROTULOS };
    expect(desenhar(ate(3))).not.toContain('Andares difíceis');
    expect(renderToStaticMarkup(createElement(Menu, { ...base, pesquisa: { participante: 'P-X', aoExportar: () => {} } }))).not.toContain('Andares difíceis');
    const html = renderToStaticMarkup(createElement(Menu, { ...base, pesquisa: { participante: 'P-X', aoExportar: () => {}, aoDificeis: () => {} } }));
    expect(html).toMatch(/<button class="ver-andares">Andares difíceis<\/button>/);
  });

  it('não sobra nada do prédio de três andares na tela inicial', () => {
    expect(desenhar(ate(6))).not.toMatch(/janela|elevador|Trancado/);
  });
});

describe('Ver andares: feito, atual e trancado com buraco', () => {
  const rotulos = PREDIO.map((a) => a.rotulo);
  // T1–T5, T6, H1 vencidos; T7 (andar 8) é o buraco; T8 (andar 9) já vencido, depois do buraco
  const vencidos = new Set([...rotulos.slice(0, 7), rotulos[8]]);
  const html = renderToStaticMarkup(createElement(Indice, {
    total: rotulos.length, vencidos, proximo: 7, sel: 5, capitulos: CAPS, primeira: new Set<string>(), rotulos, aoIr: () => {}, aoFechar: () => {},
  }));
  const andares = new Map([...html.matchAll(/<button[^>]*?class="([^"]*)"([^>]*)><b>(\d+)<\/b>/g)].map((m) => [Number(m[3]), { cls: m[1], travado: m[2].includes('disabled') }]));

  it('o capítulo 2 (andares 6–14): vencidos feitos, o buraco é o atual, o vencido depois dele segue aberto, o resto trancado', () => {
    expect(andares.get(6)).toEqual({ cls: 'marcado', travado: false }); // o marcado (sel) cobre o feito
    expect(andares.get(7)).toEqual({ cls: 'feito', travado: false });
    expect(andares.get(8)).toEqual({ cls: 'proximo', travado: false });
    expect(andares.get(9)).toEqual({ cls: 'feito', travado: false }); // depois do buraco e vencido: aberto
    for (const n of [10, 11, 12, 13, 14]) expect(andares.get(n), `andar ${n}`).toEqual({ cls: 'trancado', travado: true });
  });

  it('o ✓ aparece só nos feitos e o rótulo de acessibilidade diz o estado', () => {
    expect(html).toContain('aria-label="9º andar, feito"');
    expect(html).toContain('aria-label="10º andar, trancado"');
    expect(html).toContain('aria-label="8º andar"'); // o próximo: sem sufixo
    expect(html.match(/class="visto"/g)).toHaveLength(3); // andares 6, 7 e 9 (o 8 não, nem os trancados)
  });
});
