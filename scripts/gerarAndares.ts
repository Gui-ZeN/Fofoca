// Gera o estoque de andares da campanha depois das 28 fases feitas à mão.
// Uso (da pasta Fofoca): npx vite-node scripts/gerarAndares.ts <inicio> <fim> <saida.json>
//   ex.: npx vite-node scripts/gerarAndares.ts 0 25 /tmp/bloco0.json   (posições 0..24 do estoque)
// Semente fixa por posição: o mesmo andar sai igual pra todo mundo e a geração é reproduzível.
// Rodar blocos em paralelo e juntar com scripts/juntarAndares.ts.
import { writeFileSync } from 'node:fs';
import { aleatorio } from '../src/variar';
import { batizar, fabricar, moldeDe, pesoDoAndar, type Peso, type Tema } from '../src/fabrica';
import { assinatura } from '../src/assinatura';
import { medirQuase, quaseBasta } from '../src/quase';
import type { FaseTrilho } from '../src/trilho';

// Boatos absurdos e carinhosos (PRODUCT.md: nunca aparência, raça, orientação ou doença).
const BOATOS = [
  'O Seu Zé dá bom dia pro relógio da cozinha', 'O Seu Zé coleciona tampinha de iogurte', 'O Seu Zé tem medo de borboleta',
  'O Seu Zé chama a samambaia de Dona Glória', 'O Seu Zé torce pro time do neto escondido', 'O Seu Zé dança forró com a vassoura',
  'O Seu Zé perdeu no par ou ímpar pro porteiro', 'O Seu Zé guarda bilhete de ônibus de 1998', 'O Seu Zé conversa com o GPS do carro',
  'O Seu Zé chora com comercial de margarina', 'O Seu Zé apostou um pudim e perdeu', 'O Seu Zé canta parabéns pro gato todo mês',
  'O Seu Zé tem um caderno de receitas secretas', 'O Seu Zé dá nota pros pães da padaria', 'O Seu Zé treina embaixadinha na garagem',
  'O Seu Zé mandou carta pra rádio pedindo música', 'O Seu Zé errou o nome do neto na festa', 'O Seu Zé faz crochê ouvindo rock',
  'O Seu Zé ganhou concurso de bolo no clube', 'O Seu Zé fala câmbio no interfone', 'O Seu Zé tem playlist de música de novela',
  'O Seu Zé escondeu o controle da TV na geladeira', 'O Seu Zé chamou a vizinha de mãe sem querer', 'O Seu Zé aprendeu uma dancinha da internet',
  'O Seu Zé ficou preso na porta giratória do banco', 'O Seu Zé pediu autógrafo pro carteiro', 'O Seu Zé assiste desenho animado de manhã',
  'O Seu Zé faz fila pra comprar pão de queijo às seis', 'O Seu Zé ensina o papagaio a cantar o hino', 'O Seu Zé batizou a geladeira de Berenice',
];
const TITULOS = [
  'Dia de feira', 'Elevador parado', 'Festa junina', 'Reunião extraordinária', 'Mudança no 302', 'Varal coletivo', 'Falta d’água',
  'Bingo do salão', 'Pintura da fachada', 'Interfone mudo', 'Garagem lotada', 'Chuva de verão', 'Noite de jogo', 'Faxina geral',
  'Entrega trocada', 'Barulho no 401', 'Vazamento no terceiro', 'Portão emperrado', 'Feijoada de sábado', 'Assembleia', 'Visita da sogra',
  'Gato no telhado', 'Carta extraviada', 'Obra no vizinho', 'Luz piscando', 'Dedetização', 'Sábado de sol', 'Domingo de clássico',
  'Fila do elevador', 'Pizza no 104', 'Quermesse', 'Simulado de incêndio',
];
const TEMAS: Record<Peso, Tema[]> = {
  leve: ['cadeia', 'padaria', 'ordem', 'tamanho'],
  media: ['cadeia', 'padaria', 'ordem', 'tamanho', 'padaria+ordem'],
  pesada: ['cadeia', 'padaria', 'ordem', 'tamanho', 'padaria+ordem'],
  chefe: ['padaria+ordem', 'padaria', 'ordem'],
};
// prédio maior demora mais pra certificar (o resolvedor explora mais caminhos)
const PRAZO: Record<Peso, number> = { leve: 20_000, media: 60_000, pesada: 240_000, chefe: 420_000 };
const MAIS_LEVE: Record<Peso, Peso | undefined> = { chefe: 'pesada', pesada: 'media', media: 'leve', leve: undefined };

const [inicio, fim, saida] = [Number(process.argv[2]), Number(process.argv[3]), process.argv[4]];
const estoque = [];
// Régua de raciocínio (Consulta 7): dentro do capítulo (blocos de 25, que é como os blocos são gerados), um andar não
// repete a assinatura (src/assinatura.ts) de nenhum dos 2 anteriores, e nenhuma assinatura passa de 25% do capítulo.
const doCapitulo: string[] = [];
const MAX_POR_CAPITULO = 6;
const repete = (a: string) => doCapitulo.slice(-2).includes(a) || doCapitulo.filter((x) => x === a).length >= MAX_POR_CAPITULO;
// O "quaseee" (src/quase.ts, pedido do dono): ≥ 3 planos que erram por um detalhe, de 2 tipos das médias pra cima, e o
// caminho óbvio (a armadilha) também quase acerta. A régua e o "quase" entram DENTRO da busca (fabricar, `aceita`):
// fora dela, com poucas tentativas por tema, a fábrica desistia e descia de peso (só 13% das médias passavam).
for (let pos = inicio; pos < fim; pos++) {
  if (pos % 25 === 0) doCapitulo.length = 0;
  const sorte = aleatorio(20261111 + pos * 7919);
  let peso: Peso | undefined = pesoDoAndar(pos);
  let feito: (ReturnType<typeof fabricar> & object & { fase: FaseTrilho; a: string }) | undefined;
  while (peso && !feito) {
    const temas = [...TEMAS[peso]].sort(() => sorte() - 0.5); // tenta os temas do peso numa ordem sorteada
    // 1 andar em 3: a Fofoqueira é armadilha, não atalho (fabrica.ts, fofArmadilha). Longe do Zé, ela só pega
    // alguém com ordem, tamanho ou padaria; se nenhum tema der, o andar fica com ela de atalho (não desce de peso).
    // ⚠️ 2 andares em 5 tentam a armadilha (era 1 em 3): com o "quase", só ~58% das tentativas dão certo, e com 1 em 3 o
    // estoque ficava com 80,7% de atalho (o andares.test pede < 80%)
    const papeis = pos % 5 === 2 || pos % 5 === 4 ? [true, false] : [false];
    for (const fofArmadilha of papeis) {
      for (const tema of temas) {
        let ultimo: { fase: FaseTrilho; a: string } | undefined;
        const pesoAqui = peso;
        const aceita = (f: Parameters<typeof batizar>[0], c: Parameters<typeof batizar>[1]) => {
          const fase = batizar(f, c, TITULOS[pos % TITULOS.length], BOATOS[(pos * 7) % BOATOS.length]);
          const a = assinatura(fase);
          if (repete(a) || !quaseBasta(medirQuase(fase), pesoAqui)) return false;
          ultimo = { fase, a };
          return true;
        };
        // ⚠️ a Fofoqueira-armadilha que também tem "quase" é rara: com o prazo dividido igual, só 11 de 50 saíram (o
        // estoque ficou com 89% de atalho; o andares.test pede ≤ 80%). Ela ganha 3× o prazo; o atalho de reserva, o resto.
        const prazo = (PRAZO[peso] / temas.length) * (papeis.length === 1 ? 1 : fofArmadilha ? 1.5 : 0.5);
        const achado = fabricar({ ...moldeDe(peso, tema), fofArmadilha }, sorte, prazo, aceita);
        if (achado && ultimo) feito = { ...achado, ...ultimo };
        if (feito) break;
      }
      if (feito) break;
    }
    if (!feito) { console.log(`  posição ${pos}: nada em ${peso}, descendo`); peso = MAIS_LEVE[peso]; }
  }
  if (!feito) throw new Error(`posição ${pos}: nenhuma fase`);
  const fase = feito.fase;
  doCapitulo.push(feito.a);
  estoque.push({ pos, peso: pesoDoAndar(pos), saiu: peso, tema: feito.molde.tema, fase });
  console.log(`posição ${pos}: ${peso} · ${feito.molde.tema} · ${fase.vizinhos.length} moradores · K=${fase.setas} · ${feito.a}`);
}
writeFileSync(saida, JSON.stringify(estoque));
console.log(`ok ${estoque.length} → ${saida}`);
