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
  | { tipo: 'saiu'; id: string; batida: number; sai: number; contando: boolean } // `sai`: ele já tinha saído quando o recado chegou (ou quando ia contar)
  | { tipo: 'duvida'; id: string; de: string }
  // ⚠️ `id` existe em todas as explicações que a tela enquadra (`citados` em Predio.tsx faz `[e.id]`): em `ronda` é a pessoa
  // VISITADA (a vítima já é o culpado do resultado); em `vazou` é quem contou (= `de`).
  | { tipo: 'ronda'; id: string; vitima: string; batida: number } // a vítima estava visitando `id` e escutou, na batida `batida`
  | { tipo: 'vazou'; id: string; de: string; para: string } // o escândalo contado por `de` vazou pela parede pra vítima `para`
  | { tipo: 'esfriou'; id: string; batida: number } // a estrela `id` ficou sem ouvir: o recado chegaria na batida `batida`, já fria
  | { tipo: 'reto'; id: string; motivo: 'sem saida' | 'atrapalhou' }
  | { tipo: 'toque'; id: string; batida: number; hora: number; norma: string }
  | { tipo: 'demais'; id: string; souberam: number; teto: number }
  | { tipo: 'sem_noticia'; id: string };

export function explicar(fase: Fase, r: Resultado): Explicacao | undefined {
  if (r.vitoria || !r.motivo) return;
  if (r.motivo === 'assunto_ouviu') {
    // como a vítima ouviu: recado de verdade (vale como sempre), ronda ou vazamento pela parede. Se chegaram juntos, vale o recado.
    const o = r.ouviu[r.culpado!];
    const juntos = (r.batidas[o.batida - 1] ?? []).filter((m) => m.para === r.culpado && m.tamanho === o.tamanho && m.versao === o.versao);
    if (juntos.length && !juntos.some((m) => !m.ronda && !m.vazou)) {
      const m = juntos[0];
      if (m.vazou) return { tipo: 'vazou', id: m.de, de: m.de, para: r.culpado! };
      const onde = r.rondas?.find((x) => x.batida === o.batida)?.onde;
      if (onde) return { tipo: 'ronda', id: onde, vitima: r.culpado!, batida: o.batida };
    }
    return { tipo: 'vitima', de: quemContou(r, r.culpado!), para: r.culpado! };
  }
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
  if (r.motivo === 'gente_demais') {
    const v = fase.vizinhos.find((x) => x.id === r.culpado)!;
    return { tipo: 'demais', id: v.id, souberam: Object.keys(r.ouviu).length, teto: v.teto! };
  }
  if (r.motivo === 'interessado_nao_ouviu') {
    // o boato esfriou antes de chegar na estrela (só existe com `validade`; é a causa, então vem antes das outras)
    const fria = r.esfriou?.find((e) => !!fase.vizinhos.find((v) => v.id === e.id)?.interesse && !r.ouviu[e.id]);
    if (fria) return { tipo: 'esfriou', id: fria.id, batida: fria.batida };
    // estrela desconfiada que ouviu de uma pessoa só: não acreditou (não é "não ouviu")
    for (const v of fase.vizinhos) if (v.interesse && !r.ouviu[v.id] && r.duvida?.[v.id]) return { tipo: 'duvida', id: v.id, de: r.duvida[v.id].de! };
    // ⚠️ o motor culpa a 1ª estrela da lista; a que perdeu o recado na padaria pode ser outra — procura em todas.
    // Estrelas primeiro; depois quem estava NO MEIO do caminho (Consulta 8: "Bia não ouviu" escondia onde parou).
    for (const soEstrela of [true, false]) {
      for (const v of fase.vizinhos) {
        if (v.tipo === 'assunto' || !!v.interesse !== soEstrela || r.ouviu[v.id] || !v.chega) continue;
        const perdidos = r.batidas.flatMap((ms, i) => (ms.some((m) => m.para === v.id) && v.chega! > i + 1 ? [i + 1] : []));
        if (perdidos.length) return { tipo: 'padaria', id: v.id, chegou: perdidos[perdidos.length - 1], volta: v.chega };
      }
    }
    // já tinha saído (`sai`): a estrela primeiro, depois quem estava no meio do caminho; o Zé não entra (ele sair é bom)
    for (const soEstrela of [true, false]) {
      const s = r.saidas?.find((x) => {
        const v = fase.vizinhos.find((w) => w.id === x.id)!;
        return v.tipo !== 'assunto' && !!v.interesse === soEstrela;
      });
      if (s) return { tipo: 'saiu', id: s.id, batida: s.batida, sai: fase.vizinhos.find((w) => w.id === s.id)!.sai!, contando: s.contando };
    }
    // alguém no meio do caminho ficou em dúvida (Raquel) ou foi calado pelo toque de recolher (Dona Norma)
    for (const v of fase.vizinhos) if (!r.ouviu[v.id] && r.duvida?.[v.id]) return { tipo: 'duvida', id: v.id, de: r.duvida[v.id].de! };
    // o Nando ouviu e não passou: não tinha ninguém do outro lado, ou dois contaram juntos e ele se atrapalhou
    for (const v of fase.vizinhos) {
      if (v.tipo !== 'apressado' || !r.ouviu[v.id] || r.batidas.flat().some((m) => m.de === v.id)) continue;
      const juntos = new Set((r.batidas[r.ouviu[v.id].batida - 1] ?? []).filter((m) => m.para === v.id).map((m) => m.de));
      return { tipo: 'reto', id: v.id, motivo: juntos.size >= 2 ? 'atrapalhou' : 'sem saida' };
    }
    const c = r.calados?.[0];
    if (c) return { tipo: 'toque', id: c.id, batida: c.batida, hora: fase.vizinhos.find((v) => v.id === c.norma)!.recolhe!, norma: c.norma };
    return { tipo: 'sem_noticia', id: r.culpado! };
  }
}
