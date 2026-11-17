// Kit do playtest dos difíceis (2026-11-17, a partir de uma consulta colada pelo dono: o teste com 5 pessoas pergunta também
// se os andares desenhados são "difíceis E bons"). Link: `?pesquisa=dificeis`, na mesma sessão de pesquisa (o registro das
// jogadas é o mesmo; exporta-se pelo menu do `?pesquisa`).
// ⚠️ A escolha evita o teste virar de LEITURA: quase nenhuma regra dos desenhados aparece no começo da campanha que o
// participante joga antes. Então é uma trilha: cada andar estreia no máximo o que os anteriores não mostraram (com a linha
// NOVO), e o último não estreia nada — junta tudo. "Dois fiscais, uma Raquel" ficou de fora: 3 regras inéditas num andar só.
import type { FaseTrilho } from './trilho';
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
