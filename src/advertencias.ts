// Advertências do síndico (as "vidas"): decisão do usuário em 2026-11-11 — vidas clássicas.
// São 3; deixar a vítima descobrir gasta uma; zerou, espera recarregar (uma a cada RECARGA_MS).
// Errar tamanho, ordem ou esquecer uma estrela não custa nada. O tutorial (fases 1–5) não cobra.
// ⚠️ O Sol foi contra vida que bloqueia (Consulta 2: num quebra-cabeça, perder é o que ensina).
// Ficou a decisão do usuário; se o teste mostrar gente largando o jogo sem advertência, rever aqui.
// Anúncio/compra pra recuperar ficam pra quando houver loja.

export const MAX = 3;
export const RECARGA_MS = 15 * 60 * 1000;

export interface Advertencias {
  restam: number;
  desde: number; // quando começou a contar a próxima recarga (só vale com restam < MAX)
}

export const cheias = (agora: number): Advertencias => ({ restam: MAX, desde: agora });

// Aplica as recargas que já venceram.
export function atualizar(a: Advertencias, agora: number): Advertencias {
  if (a.restam >= MAX) return { restam: MAX, desde: agora };
  const ganhou = Math.floor(Math.max(0, agora - a.desde) / RECARGA_MS);
  if (!ganhou) return a;
  const restam = Math.min(MAX, a.restam + ganhou);
  return { restam, desde: restam >= MAX ? agora : a.desde + ganhou * RECARGA_MS };
}

export function gastar(a: Advertencias, agora: number): Advertencias {
  const atual = atualizar(a, agora);
  if (atual.restam <= 0) return atual;
  // com todas cheias, a contagem da próxima começa agora
  return { restam: atual.restam - 1, desde: atual.restam >= MAX ? agora : atual.desde };
}

// Quanto falta pra próxima advertência voltar (undefined se estão todas cheias).
export function falta(a: Advertencias, agora: number): number | undefined {
  const atual = atualizar(a, agora);
  return atual.restam >= MAX ? undefined : atual.desde + RECARGA_MS - agora;
}

export const relogio = (ms: number) => {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};
