import { describe, expect, it } from 'vitest';
import { MAX, RECARGA_MS, atualizar, cheias, falta, gastar, relogio } from './advertencias';

const T0 = 1_000_000;

describe('advertências do síndico', () => {
  it('começa com 3 e cada descoberta gasta uma; com 0 não fica negativo', () => {
    let a = cheias(T0);
    a = gastar(a, T0);
    a = gastar(a, T0 + 1);
    a = gastar(a, T0 + 2);
    expect(a.restam).toBe(0);
    expect(gastar(a, T0 + 3).restam).toBe(0);
  });

  it('a contagem da recarga começa no primeiro gasto, não antes', () => {
    const a = gastar(cheias(T0), T0 + 5 * RECARGA_MS); // ficou parado com tudo cheio por muito tempo
    expect(a.restam).toBe(MAX - 1);
    expect(falta(a, T0 + 5 * RECARGA_MS)).toBe(RECARGA_MS);
  });

  it('recarrega uma a cada RECARGA_MS, até o máximo', () => {
    let a = cheias(T0);
    a = gastar(a, T0); a = gastar(a, T0); a = gastar(a, T0);
    expect(atualizar(a, T0 + RECARGA_MS - 1).restam).toBe(0);
    expect(atualizar(a, T0 + RECARGA_MS).restam).toBe(1);
    expect(atualizar(a, T0 + 2 * RECARGA_MS + 10).restam).toBe(2);
    expect(atualizar(a, T0 + 99 * RECARGA_MS).restam).toBe(MAX);
    expect(falta(a, T0 + 99 * RECARGA_MS)).toBeUndefined();
  });

  it('gastar no meio da recarga não zera o relógio que já corria', () => {
    let a = gastar(gastar(cheias(T0), T0), T0); // 1 restando, contando desde T0
    a = gastar(a, T0 + RECARGA_MS / 2); // 0 restando
    expect(falta(a, T0 + RECARGA_MS / 2)).toBe(RECARGA_MS / 2);
  });

  it('relógio em minutos:segundos', () => {
    expect(relogio(RECARGA_MS)).toBe('15:00');
    expect(relogio(61_500)).toBe('1:02');
  });
});
