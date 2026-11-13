// Ajustes do jogador, guardados no aparelho (`fofoca.ajustes`). Puro e testado; a tela fica no Menu.
// - rapido: o "Espalhar!" já começa em ×2 (o botão ×2 da fase também grava aqui);
// - reduzir: menos animação, mesmo com o sistema pedindo movimento normal (o "movimento reduzido" do
//   sistema continua valendo sozinho, pelo CSS);
// - som: as notas de ritmo do espalhar (som.ts). Ligado por padrão;
// - musica: a musiquinha de fundo (musica.ts). Ligada por padrão;
// - vibrar: o celular treme quando a estrela ouve, quando a vítima descobre e na vitória. Ligado por padrão.

export interface Ajustes { rapido: boolean; reduzir: boolean; som: boolean; musica: boolean; vibrar: boolean }
export const CHAVE_AJUSTES = 'fofoca.ajustes';
const PADRAO: Ajustes = { rapido: false, reduzir: false, som: true, musica: true, vibrar: true };

export interface Armazem { getItem(k: string): string | null; setItem(k: string, v: string): void; removeItem(k: string): void; key(i: number): string | null; readonly length: number }

// Lê sem confiar no que está gravado: campo faltando, tipo errado ou JSON quebrado viram o padrão.
export function lerAjustes(armazem: Armazem): Ajustes {
  try {
    const bruto = JSON.parse(armazem.getItem(CHAVE_AJUSTES) ?? '{}');
    return {
      rapido: typeof bruto?.rapido === 'boolean' ? bruto.rapido : PADRAO.rapido,
      reduzir: typeof bruto?.reduzir === 'boolean' ? bruto.reduzir : PADRAO.reduzir,
      som: typeof bruto?.som === 'boolean' ? bruto.som : PADRAO.som,
      musica: typeof bruto?.musica === 'boolean' ? bruto.musica : PADRAO.musica,
      vibrar: typeof bruto?.vibrar === 'boolean' ? bruto.vibrar : PADRAO.vibrar,
    };
  } catch {
    return { ...PADRAO };
  }
}

export function gravarAjustes(armazem: Armazem, a: Ajustes) {
  try { armazem.setItem(CHAVE_AJUSTES, JSON.stringify(a)); } catch { /* sem armazenamento: vale só nesta sessão */ }
}

// Apaga o progresso de UMA campanha ("fofoca.campanha" ou "fofoca.pesquisa"): andar liberado, tentativas,
// cenas vistas. ⚠️ Não mexe nas advertências (apagar não pode virar jeito de fugir da suspensão), nos ajustes
// nem no registro da pesquisa. Devolve quantas chaves apagou.
export function apagarProgresso(armazem: Armazem, campanha: string): number {
  const chaves: string[] = [];
  for (let i = 0; i < armazem.length; i++) {
    const k = armazem.key(i);
    if (k && (k === campanha || k.startsWith(`${campanha}.`))) chaves.push(k);
  }
  for (const k of chaves) armazem.removeItem(k);
  return chaves.length;
}

// O armazém do navegador (aba anônima bloqueada: vira um de mentira, e o jogo segue sem salvar).
const memoria = new Map<string, string>();
export const armazemDoNavegador: Armazem = {
  getItem: (k) => { try { return localStorage.getItem(k); } catch { return memoria.get(k) ?? null; } },
  setItem: (k, v) => { try { localStorage.setItem(k, v); } catch { memoria.set(k, v); } },
  removeItem: (k) => { try { localStorage.removeItem(k); } catch { memoria.delete(k); } },
  key: (i) => { try { return localStorage.key(i); } catch { return [...memoria.keys()][i] ?? null; } },
  get length() { try { return localStorage.length; } catch { return memoria.size; } },
};

// Menos animação: uma classe na raiz (o CSS desliga animações e transições com ela).
export function aplicarMovimento(reduzir: boolean) {
  if (typeof document !== 'undefined') document.documentElement.classList.toggle('reduzir', reduzir);
}
