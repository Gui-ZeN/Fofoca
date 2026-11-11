// O que a tela mostra no prédio quando se perde: a causa, ligada a quem ela aconteceu.
// Consulta 4 (UX): "tamanho: pedido × recebido; ordem: quem ouviu em qual batida; padaria: chegada do
// recado × volta; estrela sem notícia: destacada, sem inventar culpado". Pura, testada; o Predio só desenha.

import { quemContou, type Fase, type Resultado, type Tamanho, type Versao } from './motor';

export type Explicacao =
  | { tipo: 'vitima'; de: string[]; para: string }
  | { tipo: 'tamanho'; id: string; queria: Tamanho; veio: Tamanho }
  | { tipo: 'versao'; id: string; queria: Versao; veio: Versao }
  | { tipo: 'ordem'; antes: string; depois: string; batidaAntes: number; batidaDepois: number }
  | { tipo: 'padaria'; id: string; chegou: number; volta: number }
  | { tipo: 'sem_noticia'; id: string };

export function explicar(fase: Fase, r: Resultado): Explicacao | undefined {
  if (r.vitoria || !r.motivo) return;
  if (r.motivo === 'assunto_ouviu') return { tipo: 'vitima', de: quemContou(r, r.culpado!), para: r.culpado! };
  if (r.motivo === 'tamanho_errado') {
    const v = fase.vizinhos.find((x) => x.id === r.culpado)!;
    return { tipo: 'tamanho', id: v.id, queria: (v.interesse!.tamanho ?? v.interesse!.minTamanho)!, veio: r.ouviu[v.id].tamanho };
  }
  if (r.motivo === 'versao_errada') {
    const v = fase.vizinhos.find((x) => x.id === r.culpado)!;
    return { tipo: 'versao', id: v.id, queria: v.interesse!.versao!, veio: r.ouviu[v.id].versao };
  }
  if (r.motivo === 'ordem_errada') {
    return { tipo: 'ordem', antes: r.antes!, depois: r.culpado!, batidaAntes: r.ouviu[r.antes!].batida, batidaDepois: r.ouviu[r.culpado!].batida };
  }
  if (r.motivo === 'interessado_nao_ouviu') {
    // ⚠️ o motor culpa a 1ª estrela da lista; a que perdeu o recado na padaria pode ser outra — procura em todas
    for (const v of fase.vizinhos) {
      if (!v.interesse || r.ouviu[v.id] || !v.chega) continue;
      const perdidos = r.batidas.flatMap((ms, i) => (ms.some((m) => m.para === v.id) && v.chega! > i + 1 ? [i + 1] : []));
      if (perdidos.length) return { tipo: 'padaria', id: v.id, chegou: perdidos[perdidos.length - 1], volta: v.chega };
    }
    return { tipo: 'sem_noticia', id: r.culpado! };
  }
}
