// A tela inicial (2026-11-17): Jogar grande primeiro, o corredor com o número do andar da vez na porta, e a Fofoca do dia
// junto do Jogar só quando o App a liberar (depois dos 31 feitos à mão). Renderizada em texto, sem navegador.
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Menu } from './Menu';
import { capitulos } from './capitulos';
import { SEGMENTOS } from './campanha';

const CAPS = capitulos(SEGMENTOS);
const desenhar = (liberada: number, dia?: { feita: number; estrela: boolean }) => renderToStaticMarkup(createElement(Menu, {
  titulos: Array.from({ length: 60 }, (_, i) => `Andar ${i + 1}`), liberada, aoJogar: () => {}, capitulos: CAPS, primeira: new Set<string>(),
  rotulos: Array.from({ length: 60 }, (_, i) => `R${i}`), dia: dia && { ...dia, aoJogar: () => {} },
}));

describe('tela inicial', () => {
  it('o Jogar vem antes de tudo o que é botão, com o andar da vez', () => {
    const html = desenhar(6);
    const botoes = [...html.matchAll(/<button[^>]*class="([^"]*)"/g)].map((m) => m[1]);
    expect(botoes.indexOf('principal jogar')).toBeLessThan(botoes.indexOf('ver-andares'));
    expect(html).toMatch(/Jogar<small>7º andar<\/small>/);
  });

  it('a porta do corredor mostra o número do andar da vez', () => {
    expect(desenhar(6)).toMatch(/class="placa-num"[^>]*>7º</);
    expect(desenhar(41)).toMatch(/class="placa-num"[^>]*>42º</);
  });

  it('sem a Fofoca do dia liberada, ela não aparece; liberada, fica junto de Ver andares', () => {
    expect(desenhar(6)).not.toContain('Fofoca do dia');
    const html = desenhar(40, { feita: 0, estrela: false });
    expect(html).toMatch(/<div class="secundarios"><button class="dia"[^>]*>Fofoca do dia<\/button><button class="ver-andares"/);
    expect(desenhar(40, { feita: 1, estrela: true })).toContain('feita de primeira ★');
  });

  it('não sobra nada do prédio de três andares na tela inicial', () => {
    expect(desenhar(6)).not.toMatch(/janela|elevador|Trancado/);
  });
});
