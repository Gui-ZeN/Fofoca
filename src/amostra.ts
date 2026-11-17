// Kit do playtest dos difíceis (2026-11-17, a partir de uma consulta colada pelo dono: o teste com 5 pessoas pergunta também
// se os andares desenhados são "difíceis E bons"). Entram NA SEQUÊNCIA da pesquisa, logo depois do tutorial, sem aviso de que são
// difíceis (o dono: "juntar tudo, sem falar que é difícil, e no relatório ver o que fizeram"); no registro são D1–D5.
// ⚠️ A escolha evita o teste virar de LEITURA: quase nenhuma regra dos desenhados aparece no começo da campanha que o
// participante joga antes. Então é uma trilha: cada andar estreia no máximo o que os anteriores não mostraram (com a linha
// NOVO), e o último não estreia nada — junta tudo. "Dois fiscais, uma Raquel" ficou de fora: 3 regras inéditas num andar só.
import type { FaseTrilho } from './trilho';
import type { Capitulo } from './capitulos';
import { MIX } from './desenhados/index';

const TRILHA: { titulo: string; novidade?: string }[] = [
  { titulo: 'Quem fala, ela ouve', novidade: 'Vera: escuta quando um vizinho dela conta algo' }, // fácil
  { titulo: 'Depois das dez', novidade: 'Soneca demora uma batida pra contar · Dona Norma: depois da hora, quem mora colado nela não conta mais nada' }, // fácil
  { titulo: 'A Bia volta às cinco', novidade: 'Padaria: o recado que chegar antes do número da placa se perde · Ordem: o número na estrela diz quem sabe primeiro' }, // médio
  { titulo: 'O telefone do 402', novidade: 'Interfone: dois apartamentos longe um do outro viram vizinhos' }, // difícil
  { titulo: 'A volta da Neide' }, // difícil: nada novo
];

export const fasesAmostra: FaseTrilho[] = TRILHA.map(({ titulo, novidade }) => {
  const a = MIX.find((x) => x.fase.titulo === titulo);
  if (!a) throw new Error(`andar da amostra não encontrado: ${titulo}`);
  return { ...a.fase, novidade }; // sem novidade (o último): nenhuma linha NOVO, mesmo se o designer escreveu uma
});

// A sequência da pesquisa: os andares até `depois` (o tutorial), a amostra, e o resto. A amostra fica DENTRO do capítulo que
// começa ali (nenhuma abertura nova, nenhum título que diga "difícil"); os capítulos seguintes andam o tamanho da amostra.
export function comAmostra<A>(andares: A[], caps: Capitulo[], amostra: A[], depois: number): { andares: A[]; capitulos: Capitulo[] } {
  const empurra = (i: number) => (i > depois ? i + amostra.length : i);
  return {
    andares: [...andares.slice(0, depois), ...amostra, ...andares.slice(depois)],
    capitulos: caps.map((c) => ({ ...c, inicio: empurra(c.inicio), fim: empurra(c.fim) })),
  };
}
