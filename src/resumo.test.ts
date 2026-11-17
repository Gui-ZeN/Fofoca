import { describe, expect, it } from 'vitest';
import { resumir, TRAVOU_MS } from './resumo';
import type { Arquivo, Evento } from './registro';

const sessao = (eventos: { t_ms: number; type: string; [dado: string]: unknown }[], modo = 'pesquisa-dificeis'): Arquivo => ({
  schema_version: 1,
  sessoes: [{ session_id: 's', participant_code: 'P-TEST', started_at: '', build_id: 'x', config: { modo }, tela: { largura: 1, altura: 1 }, eventos: eventos.map((e, i): Evento => ({ ...e, seq: i + 1 })) }],
});
const s = (seg: number) => seg * 1000;

describe('resumo do registro da pesquisa', () => {
  const linhas = resumir(sessao([
    { t_ms: 0, type: 'session_start' },
    { t_ms: s(1), type: 'view_change', vista: 'edicao', fase: 'D1' },
    { t_ms: s(30), type: 'attempt_submit', fase: 'D1', vitoria: false, motivo: 'ordem_errada' },
    { t_ms: s(31), type: 'view_change', vista: 'resultado', fase: 'D1' },
    { t_ms: s(200), type: 'attempt_submit', fase: 'D1', vitoria: true, motivo: null },
    { t_ms: s(210), type: 'view_change', vista: 'edicao', fase: 'D2' }, // foi pro D2
    { t_ms: s(400), type: 'view_change', vista: 'edicao', fase: 'D3' }, // saiu do D2 sem tentar nada
    { t_ms: s(410), type: 'attempt_submit', fase: 'D3', vitoria: false, motivo: 'assunto_ouviu' },
    { t_ms: s(420), type: 'visibility_change', visivel: false }, // a sessão termina no D3
  ]));
  const de = (f: string) => linhas.find((l) => l.fase === f)!;

  it('conta tentativas, o desfecho e por que perdeu', () => {
    expect(de('D1')).toMatchObject({ participante: 'P-TEST', modo: 'pesquisa-dificeis', tentativas: 2, desfecho: 'venceu', motivos: ['ordem_errada'] });
    expect(de('D2')).toMatchObject({ tentativas: 0, desfecho: 'pulou' }); // saiu sem vencer
    expect(de('D3')).toMatchObject({ tentativas: 1, desfecho: 'parou', motivos: ['assunto_ouviu'] }); // a sessão acabou ali
  });

  it('a maior pausa sem tentar (inclusive até sair) e o indício de "travou" (2 min)', () => {
    expect(de('D1').maiorPausa_ms).toBe(s(170)); // da 1ª tentativa (30) à 2ª (200)
    expect(de('D1').travou).toBe(true);
    expect(de('D2').maiorPausa_ms).toBe(s(190)); // entrou na 210, saiu na 400 sem tentar
    expect(de('D2').travou).toBe(true);
    expect(de('D3').maiorPausa_ms).toBe(s(10));
    expect(de('D3').travou).toBe(false);
    expect(TRAVOU_MS).toBe(s(120));
  });

  it('o tempo no andar soma as passagens', () => {
    expect(de('D1').ms).toBe(s(209));
    expect(de('D2').ms).toBe(s(190));
    expect(de('D3').ms).toBe(s(20));
  });

  it('voltar pro andar e vencer na 2ª passagem conta como venceu; voltar e sair de novo, pulou', () => {
    const [a, b] = ['A', 'B'].map((f) => resumir(sessao([
      { t_ms: 0, type: 'view_change', fase: f }, { t_ms: s(5), type: 'view_change', vista: 'menu' },
      { t_ms: s(6), type: 'view_change', fase: f }, ...(f === 'A' ? [{ t_ms: s(9), type: 'attempt_submit', fase: f, vitoria: true }] : []),
      { t_ms: s(10), type: 'view_change', vista: 'menu' },
    ]))[0]);
    expect(a).toMatchObject({ desfecho: 'venceu', tentativas: 1, ms: s(9) });
    expect(b).toMatchObject({ desfecho: 'pulou', tentativas: 0 });
  });
});
