import { describe, expect, it } from 'vitest';
import { apagarProgresso, CHAVE_AJUSTES, gravarAjustes, lerAjustes, type Armazem } from './ajustes';

const armazem = (inicial: Record<string, string> = {}): Armazem & { dados: Map<string, string> } => {
  const dados = new Map(Object.entries(inicial));
  return {
    dados,
    getItem: (k) => dados.get(k) ?? null,
    setItem: (k, v) => { dados.set(k, v); },
    removeItem: (k) => { dados.delete(k); },
    key: (i) => [...dados.keys()][i] ?? null,
    get length() { return dados.size; },
  };
};

describe('ajustes', () => {
  it('sem nada gravado: velocidade normal e animação normal', () => {
    expect(lerAjustes(armazem())).toEqual({ rapido: false, reduzir: false });
  });

  it('grava e lê de volta', () => {
    const a = armazem();
    gravarAjustes(a, { rapido: true, reduzir: true });
    expect(lerAjustes(a)).toEqual({ rapido: true, reduzir: true });
  });

  it('não confia no que está gravado: JSON quebrado ou tipo errado viram o padrão', () => {
    expect(lerAjustes(armazem({ [CHAVE_AJUSTES]: '{quebrado' }))).toEqual({ rapido: false, reduzir: false });
    expect(lerAjustes(armazem({ [CHAVE_AJUSTES]: '{"rapido":"sim","reduzir":1}' }))).toEqual({ rapido: false, reduzir: false });
    expect(lerAjustes(armazem({ [CHAVE_AJUSTES]: 'null' }))).toEqual({ rapido: false, reduzir: false });
  });
});

describe('apagar progresso', () => {
  const tudo = () => armazem({
    'fofoca.campanha.liberada': '12', 'fofoca.campanha.tentativas': '{}', 'fofoca.campanha.visto.T4': 'true',
    'fofoca.campanhaX': 'outro', 'fofoca.pesquisa.liberada': '3', 'fofoca.advertencias': '{"restam":0}',
    [CHAVE_AJUSTES]: '{"rapido":true}', 'fofoca.registro': '{}', 'fofoca.participante': '"P-1"',
  });

  it('apaga só a campanha pedida', () => {
    const a = tudo();
    expect(apagarProgresso(a, 'fofoca.campanha')).toBe(3);
    expect([...a.dados.keys()].filter((k) => k.startsWith('fofoca.campanha.'))).toEqual([]);
    expect(a.dados.has('fofoca.campanhaX')).toBe(true); // prefixo parecido não é a mesma campanha
    expect(a.dados.has('fofoca.pesquisa.liberada')).toBe(true);
  });

  it('não mexe nas advertências (não vira jeito de fugir da suspensão), nos ajustes nem no registro', () => {
    const a = tudo();
    apagarProgresso(a, 'fofoca.campanha');
    for (const k of ['fofoca.advertencias', CHAVE_AJUSTES, 'fofoca.registro', 'fofoca.participante']) expect(a.dados.has(k), k).toBe(true);
  });
});
