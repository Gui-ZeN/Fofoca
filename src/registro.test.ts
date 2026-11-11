import { describe, expect, it } from 'vitest';
import { Registro, SCHEMA, type Arquivo } from './registro';

const armazem = () => {
  const m = new Map<string, string>();
  return { m, getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v) };
};
const relogio = () => { let t = 1000; return { agora: () => t, passar: (ms: number) => { t += ms; } }; };

describe('registro da pesquisa', () => {
  it('antes de iniciar, não registra nada', () => {
    const a = armazem();
    const r = new Registro(a);
    r.registrar('view_change', { vista: 'menu' });
    expect(a.m.get('fofoca.registro')).toBeUndefined();
    expect(r.ativo).toBe(false);
  });

  it('sessão com código do participante, versão, configuração e eventos em ordem com o tempo desde o início', () => {
    const a = armazem(), t = relogio();
    const r = new Registro(a, t.agora);
    r.iniciar({ modo: 'pesquisa', passo_ms: 850 }, { largura: 390, altura: 844 }, new Date('2026-11-11T12:00:00Z'));
    t.passar(1500);
    r.registrar('attempt_submit', { fase: 'T1', vitoria: true });
    const arq = JSON.parse(r.exportar()) as Arquivo;
    expect(arq.schema_version).toBe(SCHEMA);
    expect(arq.sessoes).toHaveLength(1);
    const s = arq.sessoes[0];
    expect(s.participant_code).toMatch(/^P-[A-Z0-9]{4}$/);
    expect(s.started_at).toBe('2026-11-11T12:00:00.000Z');
    expect(s.build_id).toBeTruthy();
    expect(s.config).toEqual({ modo: 'pesquisa', passo_ms: 850 });
    expect(s.eventos.map((e) => [e.seq, e.type, e.t_ms])).toEqual([[1, 'session_start', 0], [2, 'attempt_submit', 1500]]);
  });

  it('novo participante troca o código; as sessões anteriores continuam no arquivo (o zerar não apaga o registro)', () => {
    const a = armazem();
    const r1 = new Registro(a);
    r1.iniciar({}, { largura: 1, altura: 1 });
    const primeiro = r1.participante();
    const r2 = new Registro(a); // nova abertura do app
    const segundo = r2.novoParticipante();
    r2.iniciar({}, { largura: 1, altura: 1 });
    expect(segundo).not.toBe(primeiro);
    const arq = JSON.parse(r2.exportar()) as Arquivo;
    expect(arq.sessoes.map((s) => s.participant_code)).toEqual([primeiro, segundo]);
  });

  it('iniciar duas vezes na mesma abertura não duplica a sessão', () => {
    const a = armazem();
    const r = new Registro(a);
    r.iniciar({}, { largura: 1, altura: 1 });
    r.iniciar({}, { largura: 1, altura: 1 });
    expect((JSON.parse(r.exportar()) as Arquivo).sessoes).toHaveLength(1);
  });

  it('arquivo estragado no armazém: começa um novo em vez de quebrar', () => {
    const a = armazem();
    a.m.set('fofoca.registro', '{isso não é json');
    const r = new Registro(a);
    r.iniciar({}, { largura: 1, altura: 1 });
    expect((JSON.parse(r.exportar()) as Arquivo).sessoes).toHaveLength(1);
  });
});
