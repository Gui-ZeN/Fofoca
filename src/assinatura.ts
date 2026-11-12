// Assinatura de raciocínio de um andar: o que de fato decide a jogada. Serve pra vetar andares vizinhos que pedem o
// mesmo raciocínio (Consulta 7, régua proposta por 7 dos 20 designers; o Fable jogando achou 17/19 iguais e grupos
// inteiros repetidos — "Zé fora + Neide colada", "a Neide fecha a fila").
//   regras: as regras que, tiradas, mudam a solução (padaria, ordem, tamanho, celular, fofoqueira, ...);
//   fofoqueira: atalho (alguma ouve na solução), armadilha (existe e ninguém dela ouve) ou "-" (não há);
//   forma: corrente (só a fila de setas) ou galho (alguém espalhou sozinho além das setas).

import type { Fase, Vizinho } from './motor';
import { custo, jogar, resolverTrilho, type FaseTrilho } from './trilho';

const mesma = (s: Record<string, string>[], p: Record<string, string>) =>
  s.length === 1 && JSON.stringify(Object.entries(s[0]).sort()) === JSON.stringify(Object.entries(p).sort());

// cada regra: se está no andar e como tirá-la
const REGRAS: [string, (v: Vizinho) => boolean, (v: Vizinho) => Vizinho][] = [
  ['padaria', (v) => !!v.chega, (v) => ({ ...v, chega: undefined })],
  ['ordem', (v) => !!v.interesse?.ordem, (v) => (v.interesse ? { ...v, interesse: { ...v.interesse, ordem: undefined } } : v)],
  ['tamanho', (v) => !!(v.interesse?.tamanho || v.interesse?.minTamanho), (v) => (v.interesse ? { ...v, interesse: { ...v.interesse, tamanho: undefined, minTamanho: undefined } } : v)],
  ['versao', (v) => !!v.interesse?.versao, (v) => (v.interesse ? { ...v, interesse: { ...v.interesse, versao: undefined } } : v)],
  ['celular', (v) => !!v.celular, (v) => ({ ...v, celular: undefined })],
  ['fofoqueira', (v) => v.tipo === 'fofoqueira', (v) => (v.tipo === 'fofoqueira' ? { ...v, tipo: 'comum' } : v)],
  ['exagerado', (v) => v.tipo === 'exagerado', (v) => (v.tipo === 'exagerado' ? { ...v, tipo: 'comum' } : v)],
  ['arnaldo', (v) => !!v.abafa, (v) => ({ ...v, abafa: undefined })],
  ['raquel', (v) => !!v.desconfia, (v) => ({ ...v, desconfia: undefined })],
  ['nando', (v) => v.tipo === 'apressado', (v) => (v.tipo === 'apressado' ? { ...v, tipo: 'comum' } : v)],
];

// ⚠️ quem está na padaria muda o raciocínio: o Zé fora (a Fofoqueira colada nele pode falar), a estrela fora (chegar
// tarde) ou alguém no meio do caminho (atrasar o recado). Sem isso a régua confundia a H3 com a H4 nova.
const quemNaPadaria = (f: Fase) => [...new Set(f.vizinhos.filter((v) => v.chega).map((v) => (v.tipo === 'assunto' ? 'zé' : v.interesse ? 'estrela' : 'meio')))].sort().join(',');

export function assinatura(f: FaseTrilho): string {
  const regras = REGRAS.filter(([, tem]) => f.vizinhos.some(tem))
    .filter(([, , tira]) => !mesma(resolverTrilho({ ...f, vizinhos: f.vizinhos.map(tira) } as Fase & { setas: number }, f.setas), f.solucao))
    .map(([nome]) => (nome === 'padaria' ? `padaria(${quemNaPadaria(f)})` : nome));
  const r = jogar(f, f.solucao);
  const fofs = f.vizinhos.filter((v) => v.tipo === 'fofoqueira');
  const papel = !fofs.length ? '-' : fofs.some((v) => r.ouviu[v.id]) ? 'atalho' : 'armadilha';
  const forma = Object.keys(r.ouviu).length > custo(f.solucao) + 1 ? 'galho' : 'corrente';
  return `${regras.join('+') || 'caminho'} | fofoqueira ${papel} | ${forma}`;
}

// Andares que repetem o raciocínio de um dos `janela` anteriores (índices na lista).
export function repetidos(assinaturas: string[], janela = 2): number[] {
  return assinaturas.flatMap((a, i) => (assinaturas.slice(Math.max(0, i - janela), i).includes(a) ? [i] : []));
}
