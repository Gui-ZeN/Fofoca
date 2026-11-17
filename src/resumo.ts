// Resumo do registro da pesquisa (2026-11-17, kit do playtest dos difíceis): por sessão e por andar, o que o observador quer
// ler sem abrir o JSON — tentativas, se venceu, se saiu sem vencer, e a maior pausa sem tentar nada.
// ⚠️ "travou" aqui é um INDÍCIO: 2 minutos entre entrar/tentar e a próxima tentativa (ou a saída). O protocolo do README conta
// "2 min sem hipótese nova", e mexer nas setas conta como hipótese — o registro não guarda toque. Quem decide é a folha do observador.
import type { Arquivo } from './registro';

export const TRAVOU_MS = 120_000;
export type Desfecho = 'venceu' | 'pulou' | 'parou'; // pulou = foi pra outro andar/menu sem vencer; parou = a sessão acabou ali
export interface Linha { participante: string; modo: string; fase: string; tentativas: number; desfecho: Desfecho; ms: number; maiorPausa_ms: number; travou: boolean; motivos: string[] }

export function resumir(arquivo: Arquivo): Linha[] {
  const out: Linha[] = [];
  for (const s of arquivo.sessoes) {
    const modo = String(s.config.modo ?? '?');
    const porFase = new Map<string, Linha & { entrou: number; marco: number }>();
    let atual: (Linha & { entrou: number; marco: number }) | undefined;
    const sai = (t: number) => {
      if (!atual) return;
      atual.ms += t - atual.entrou;
      atual.maiorPausa_ms = Math.max(atual.maiorPausa_ms, t - atual.marco);
      if (atual.desfecho !== 'venceu') atual.desfecho = 'pulou';
      atual = undefined;
    };
    for (const e of s.eventos) {
      const fase = typeof e.fase === 'string' ? e.fase : undefined;
      if (e.type === 'view_change' && fase !== atual?.fase) {
        sai(e.t_ms);
        if (fase) {
          let l = porFase.get(fase);
          if (!l) { l = { participante: s.participant_code, modo, fase, tentativas: 0, desfecho: 'parou', ms: 0, maiorPausa_ms: 0, travou: false, motivos: [], entrou: 0, marco: 0 }; porFase.set(fase, l); }
          l.entrou = l.marco = e.t_ms;
          if (l.desfecho === 'pulou') l.desfecho = 'parou'; // voltou: o desfecho é o da última passagem
          atual = l;
        }
      }
      if (e.type === 'attempt_submit' && atual && fase === atual.fase) {
        atual.tentativas++;
        atual.maiorPausa_ms = Math.max(atual.maiorPausa_ms, e.t_ms - atual.marco);
        atual.marco = e.t_ms;
        if (e.vitoria) atual.desfecho = 'venceu';
        else if (typeof e.motivo === 'string') atual.motivos.push(e.motivo);
      }
    }
    // a sessão acabou com a pessoa num andar: conta o tempo até o último evento, e o desfecho fica 'parou' (se não venceu)
    if (atual) {
      const fim = s.eventos[s.eventos.length - 1]?.t_ms ?? atual.entrou;
      atual.ms += fim - atual.entrou;
      atual.maiorPausa_ms = Math.max(atual.maiorPausa_ms, fim - atual.marco);
    }
    for (const l of porFase.values()) {
      const { entrou: _e, marco: _m, ...linha } = l;
      out.push({ ...linha, travou: linha.maiorPausa_ms >= TRAVOU_MS });
    }
  }
  return out;
}
