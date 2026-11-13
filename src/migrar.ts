// Migração do progresso salvo no aparelho (`fofoca.campanha.*`) quando a ordem do prédio mudou.
// Versão 3 (2026-11-13): as estreias (Nando, Raquel+Duplas, saída, Arnaldo, Dona Norma) entraram no meio do estoque
// gerado, que foi regerado com o elenco liberado até ali. O que o aparelho guarda é um ÍNDICE do andar (`liberada`) e
// rótulos (`primeira`, `tentativas`, `visto.<rótulo>`); os rótulos E1..E150 continuam existindo, mas apontam pra outros
// andares (o estoque é outro) e os índices deslocaram.
//
// Formatos antigos, sem chave de versão: v1 = 28 feitos à mão + estoque; v2 = 31 feitos à mão (entraram V1–V3, nas
// posições 28–30) + estoque. ⚠️ Sem a chave não dá pra saber qual dos dois é; trata como v2, que é o que está
// publicado desde 13/11/2026. Quem ainda estava no v1 e tinha `liberada` > 28 cai uns andares adiante do que esperava
// (nunca atrás) — aceito: os andares anteriores continuam abertos. `liberada` ≤ 30 não muda nos dois formatos.
// O modo `?pesquisa` (`fofoca.pesquisa`) NÃO migra: o participante sempre começa do zero (`&zerar`).

import { armazemDoNavegador, type Armazem } from './ajustes';
import { PREDIO } from './campanha';

export const VERSAO = 3;
const CAMPANHA = 'fofoca.campanha';
const FEITOS_V2 = 31;
const ESTOQUE_V2 = 150; // o estoque antigo, em blocos: as voltas começam no índice 31 + 150 (histórico: não depende do estoque de hoje)

const parse = (bruto: string | null): unknown => { try { return bruto === null ? undefined : JSON.parse(bruto); } catch { return undefined; } };

// o rótulo do andar de índice `i` no formato v2 (CAMPANHA vem do prédio de hoje: os 31 primeiros não mudaram)
function rotuloV2(i: number): string {
  if (i < FEITOS_V2) return PREDIO[i].rotulo;
  const volta = Math.floor((i - FEITOS_V2) / ESTOQUE_V2);
  const n = ((i - FEITOS_V2) % ESTOQUE_V2) + 1;
  return volta ? `E${n}.${volta + 1}` : `E${n}`;
}

let indicePorRotulo: Map<string, number> | undefined;
// índice novo do MESMO rótulo; sem rótulo no prédio de hoje (não deveria), fica como estava
export function indiceNovo(i: number): number {
  if (i < FEITOS_V2) return i;
  indicePorRotulo ??= new Map(PREDIO.map((a, j) => [a.rotulo, j]));
  return indicePorRotulo.get(rotuloV2(i)) ?? i;
}

export const marcarVersao = (armazem: Armazem, campanha = CAMPANHA) => {
  try { armazem.setItem(`${campanha}.versao`, String(VERSAO)); } catch { /* sem armazenamento: vale só nesta sessão */ }
};

// Roda uma vez por aparelho (grava `<campanha>.versao`). Devolve se migrou. Nunca lança.
export function migrar(armazem: Armazem = armazemDoNavegador, campanha = CAMPANHA): boolean {
  try {
    const versao = Number(armazem.getItem(`${campanha}.versao`));
    if (Number.isInteger(versao) && versao >= VERSAO) return false;
    // ⚠️ a versão vai ANTES: se um passo abaixo falhar no meio, melhor ficar com o índice antigo (cai uns andares atrás,
    // tudo continua aberto) do que rodar de novo e deslocar o `liberada` duas vezes.
    marcarVersao(armazem, campanha);

    const liberada = parse(armazem.getItem(`${campanha}.liberada`));
    if (typeof liberada === 'number' && Number.isInteger(liberada) && liberada > 0) {
      const novo = indiceNovo(liberada);
      if (novo !== liberada) armazem.setItem(`${campanha}.liberada`, JSON.stringify(novo));
    }

    // o estoque foi regerado: o E7 de hoje é outro quebra-cabeça, então "de primeira" e tentativas dele não valem
    const doEstoque = (r: unknown) => typeof r === 'string' && r.startsWith('E');
    const primeira = parse(armazem.getItem(`${campanha}.primeira`));
    if (Array.isArray(primeira) && primeira.some(doEstoque)) armazem.setItem(`${campanha}.primeira`, JSON.stringify(primeira.filter((r) => !doEstoque(r))));
    const tentativas = parse(armazem.getItem(`${campanha}.tentativas`));
    if (tentativas && typeof tentativas === 'object' && !Array.isArray(tentativas)) {
      const resto = Object.fromEntries(Object.entries(tentativas).filter(([r]) => !doEstoque(r)));
      if (Object.keys(resto).length !== Object.keys(tentativas).length) armazem.setItem(`${campanha}.tentativas`, JSON.stringify(resto));
    }

    // abertura de capítulo já vista: do 6 em diante mudou de conteúdo (1–5 são os feitos à mão)
    const prefixo = `${campanha}.visto.cap`;
    const velhos: string[] = [];
    for (let i = 0; i < armazem.length; i++) {
      const k = armazem.key(i);
      const n = k?.startsWith(prefixo) ? /^\d+$/.test(k.slice(prefixo.length)) && Number(k.slice(prefixo.length)) : 0;
      if (k && n && n >= 6) velhos.push(k);
    }
    for (const k of velhos) armazem.removeItem(k);
    return true;
  } catch {
    return false;
  }
}
