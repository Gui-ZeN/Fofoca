// Gera o estoque de andares da campanha depois das 28 fases feitas à mão.
// Uso (da pasta Fofoca): npx vite-node scripts/gerarAndares.ts <inicio> <fim> <saida.json>
//   ex.: npx vite-node scripts/gerarAndares.ts 0 25 /tmp/bloco0.json   (posições 0..24 do estoque)
// Semente fixa por posição: o mesmo andar sai igual pra todo mundo e a geração é reproduzível.
// Rodar blocos em paralelo e juntar com scripts/juntarAndares.ts.
import { writeFileSync } from 'node:fs';
import { aleatorio } from '../src/variar';
import { batizar, fabricar, moldeDe, pesoDoAndar, type Peso, type Tema } from '../src/fabrica';

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
const PRAZO: Record<Peso, number> = { leve: 20_000, media: 40_000, pesada: 150_000, chefe: 240_000 };
const MAIS_LEVE: Record<Peso, Peso | undefined> = { chefe: 'pesada', pesada: 'media', media: 'leve', leve: undefined };

const [inicio, fim, saida] = [Number(process.argv[2]), Number(process.argv[3]), process.argv[4]];
const estoque = [];
for (let pos = inicio; pos < fim; pos++) {
  const sorte = aleatorio(20261111 + pos * 7919);
  let peso: Peso | undefined = pesoDoAndar(pos);
  let feito;
  while (peso && !feito) {
    const temas = [...TEMAS[peso]].sort(() => sorte() - 0.5); // tenta os temas do peso numa ordem sorteada
    for (const tema of temas) {
      feito = fabricar(moldeDe(peso, tema), sorte, PRAZO[peso] / temas.length);
      if (feito) break;
    }
    if (!feito) { console.log(`  posição ${pos}: nada em ${peso}, descendo`); peso = MAIS_LEVE[peso]; }
  }
  if (!feito) throw new Error(`posição ${pos}: nenhuma fase`);
  const fase = batizar(feito.f, feito.c, TITULOS[pos % TITULOS.length], BOATOS[(pos * 7) % BOATOS.length]);
  estoque.push({ pos, peso: pesoDoAndar(pos), saiu: peso, tema: feito.molde.tema, fase });
  console.log(`posição ${pos}: ${peso} · ${feito.molde.tema} · ${fase.vizinhos.length} moradores · K=${fase.setas}`);
}
writeFileSync(saida, JSON.stringify(estoque));
console.log(`ok ${estoque.length} → ${saida}`);
