// Registro local das jogadas, só no modo pesquisa (Consulta 4, Sol + Astra): pra o teste com pessoas render
// mais que as anotações do observador. Fica no aparelho; o observador exporta pelo menu ("Exportar registro").
// ⚠️ Sobrevive ao `&zerar` de propósito (que apaga só o progresso da pesquisa): se o observador esquecer de
// exportar entre um participante e outro, nada se perde — cada sessão leva o código do participante.
// Não registra nome, coordenada de toque nem nada pessoal: código anônimo, telas, tentativas e tempos.

export const SCHEMA = 1;
const CHAVE = 'fofoca.registro';
const CHAVE_PARTICIPANTE = 'fofoca.participante';

declare const __VERSAO__: string; // vite.config: commit no GitHub, "local" no computador

export interface Evento { seq: number; t_ms: number; type: string; [dado: string]: unknown }
export interface Sessao {
  session_id: string;
  participant_code: string;
  started_at: string; // UTC
  build_id: string;
  config: Record<string, unknown>;
  tela: { largura: number; altura: number };
  eventos: Evento[];
}
export interface Arquivo { schema_version: number; sessoes: Sessao[] }

export interface Armazem { getItem(k: string): string | null; setItem(k: string, v: string): void }

const codigo = (sorte: () => number) =>
  `P-${Array.from({ length: 4 }, () => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.floor(sorte() * 32)]).join('')}`;

export class Registro {
  private sessao?: Sessao;
  private t0 = 0;
  private seq = 0;
  constructor(private armazem: Armazem, private relogio: () => number = () => performance.now(), private sorte: () => number = Math.random) {}

  private arquivo(): Arquivo {
    try { const a = JSON.parse(this.armazem.getItem(CHAVE) ?? '') as Arquivo; if (a?.schema_version === SCHEMA) return a; } catch { /* vazio ou estragado */ }
    return { schema_version: SCHEMA, sessoes: [] };
  }
  private salvar(a: Arquivo) { try { this.armazem.setItem(CHAVE, JSON.stringify(a)); } catch { /* cheio ou bloqueado: segue sem registrar */ } }

  participante(): string {
    const atual = this.armazem.getItem(CHAVE_PARTICIPANTE);
    return atual ?? this.novoParticipante();
  }
  novoParticipante(): string {
    const c = codigo(this.sorte);
    try { this.armazem.setItem(CHAVE_PARTICIPANTE, c); } catch { /* sem armazenamento */ }
    return c;
  }

  get ativo() { return !!this.sessao; }

  iniciar(config: Record<string, unknown>, tela: { largura: number; altura: number }, agoraUtc = new Date()) {
    if (this.sessao) return;
    this.t0 = this.relogio();
    this.seq = 0;
    this.sessao = {
      session_id: `${agoraUtc.getTime().toString(36)}-${Math.floor(this.sorte() * 1e6).toString(36)}`,
      participant_code: this.participante(),
      started_at: agoraUtc.toISOString(),
      build_id: typeof __VERSAO__ === 'string' ? __VERSAO__ : 'local',
      config, tela, eventos: [],
    };
    const a = this.arquivo();
    a.sessoes.push(this.sessao);
    this.salvar(a);
    this.registrar('session_start');
  }

  registrar(type: string, dados: Record<string, unknown> = {}) {
    if (!this.sessao) return;
    const ev: Evento = { seq: ++this.seq, t_ms: Math.round(this.relogio() - this.t0), type, ...dados };
    this.sessao.eventos.push(ev);
    const a = this.arquivo();
    const i = a.sessoes.findIndex((s) => s.session_id === this.sessao!.session_id);
    if (i >= 0) a.sessoes[i] = this.sessao; else a.sessoes.push(this.sessao);
    this.salvar(a);
  }

  exportar(): string { return JSON.stringify(this.arquivo(), null, 1); }
}

// A instância do jogo (no navegador). Sem localStorage (aba anônima bloqueada), vira um armazém de mentira.
const memoria = new Map<string, string>();
const armazemDoNavegador: Armazem = {
  getItem: (k) => { try { return localStorage.getItem(k); } catch { return memoria.get(k) ?? null; } },
  setItem: (k, v) => { try { localStorage.setItem(k, v); } catch { memoria.set(k, v); } },
};
export const registro = new Registro(armazemDoNavegador);

// Baixa o arquivo (o observador manda pra análise). Nome com o participante atual e a data.
export function baixarRegistro() {
  const blob = new Blob([registro.exportar()], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `fofoca-registro-${registro.participante()}-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
