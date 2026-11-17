// Gera o capítulo do Interfone (src/andaresInterfone.json): 25 andares com fio, certificados POR FIO (fabrica.ts, papeisDosFios).
// Em duas etapas, porque a régua de repetição (a mesma de gerarAndares.ts) vale no capítulo inteiro e a busca é lenta:
//   1. pool  <pos> <segundos> <saida.json> [rodada]   — junta candidatos da vaga `pos` (rode uma posição por processo, em paralelo);
//   2. juntar <saida.json> <pool.json>...             — escolhe um candidato por vaga respeitando a régua e o roteiro.
// Uso (da pasta Fofoca): npx vite-node scripts/gerarInterfone.ts pool 3 120 _busca/interfone/pool3.json
// Semente fixa por posição e rodada: reproduzível. Nada cai pro básico: vaga sem candidato = a etapa 2 falha e diz qual.
import { readFileSync, writeFileSync } from 'node:fs';
import { aleatorio } from '../src/variar';
import { batizar, fabricar, moldeInterfone, moldeValido, papeisDosFios, pesoDoAndar, principal, revalidar, type PapelFio, type Peso, type Tema } from '../src/fabrica';
import { assinatura } from '../src/assinatura';
import { portaDe } from '../src/motor';
import { custo } from '../src/trilho';
import { medirQuase, quaseBasta } from '../src/quase';
import type { FaseTrilho } from '../src/trilho';

// ---- o roteiro do bloco (hipótese do Sol, Consulta 10): ~17 fio útil, ~3 impede, 4–5 armadilha pura (nunca mais de 6) ----
const IMPEDE = [9, 14, 19];
const ARMADILHA = [5, 11, 15, 20, 23];
const VERA = [1, 4, 7, 10, 12, 16, 18, 22];
const DOIS_FIOS = [12, 17, 22, 24];
const vagaDe = (pos: number) => ({
  pos,
  peso: pesoDoAndar(pos) as Peso,
  papel: (process.env.PAPEL as PapelFio | undefined) ?? (IMPEDE.includes(pos) ? 'impede' : ARMADILHA.includes(pos) ? 'armadilha' : 'util') as PapelFio,
  vera: VERA.includes(pos),
  fios: DOIS_FIOS.includes(pos) ? 2 : 1,
});
// tamanhos que cada peso aceita (colunas, andares); o pool gira entre eles
const TAMANHOS: Record<Peso, [number, number][]> = {
  leve: [[4, 3]], media: [[4, 4], [5, 3]], pesada: [[5, 4], [4, 4]], chefe: [[5, 4], [5, 5]],
};
const TEMAS: Record<Peso, Tema[]> = {
  leve: ['cadeia', 'padaria', 'ordem', 'tamanho'],
  media: ['cadeia', 'padaria', 'ordem', 'tamanho', 'padaria+ordem'],
  pesada: ['cadeia', 'padaria', 'ordem', 'tamanho', 'padaria+ordem'],
  chefe: ['padaria+ordem', 'padaria', 'ordem'],
};
const BOATOS = [
  'O Seu Zé fala câmbio no interfone', 'O Seu Zé aperta todos os botões da portaria', 'O Seu Zé finge que é a central de atendimento',
  'O Seu Zé grava recado no interfone e esquece', 'O Seu Zé responde o interfone em francês', 'O Seu Zé chama o porteiro de comandante',
  'O Seu Zé treina o discurso do síndico no interfone', 'O Seu Zé pede música pelo interfone', 'O Seu Zé testa o interfone toda madrugada',
  'O Seu Zé dá boa noite pro interfone', 'O Seu Zé confunde o interfone com o rádio', 'O Seu Zé joga conversa fora na linha cruzada',
  'O Seu Zé ensaia declaração de amor no ramal', 'O Seu Zé anota recado no braço', 'O Seu Zé desliga o interfone e liga de novo',
  'O Seu Zé manda abraço pela portaria', 'O Seu Zé aprendeu a ligar pro 302', 'O Seu Zé faz plantão na linha do vizinho',
  'O Seu Zé ganhou um ramal só pra ele', 'O Seu Zé canta bingo pelo interfone', 'O Seu Zé briga com o fio emaranhado',
  'O Seu Zé chama a Dona Marta toda manhã', 'O Seu Zé aposta corrida com o elevador', 'O Seu Zé acha que o interfone é secreto',
  'O Seu Zé pede pizza no ramal errado',
];
const TITULOS = [
  'Fio cruzado', 'Ramal 12', 'Portaria ocupada', 'Linha dividida', 'Chamada perdida', 'Código da portaria', 'Fone fora do gancho',
  'Recado na caixa', 'Ligação a cobrar', 'Telefone sem fio', 'Ramal trocado', 'Eco no corredor', 'Tom de ocupado', 'Alô, quem fala?',
  'Campainha dupla', 'Chiado na linha', 'Interfone novo', 'Zumbido às seis', 'Linha direta', 'Portão da garagem', 'Ouvido na parede',
  'Central da torre', 'Número errado', 'Toque duplo', 'Última ligação',
];
const boatoDe = (pos: number) => BOATOS[(pos * 5) % BOATOS.length];

interface Candidato { pos: number; tema: Tema; fase: FaseTrilho; papeis: Record<string, PapelFio>; a: string; colada: boolean }
// a receita "o fio leva à Fofoqueira colada no Zé" (a de I2): alguma ponta de fio é uma Fofoqueira que mora de porta com a vítima
const coladaNoZe = (f: FaseTrilho) => (f.interfones ?? []).flat().some((id) => f.vizinhos.find((v) => v.id === id)?.tipo === 'fofoqueira' && portaDe(f, id).includes('z'));

function pool(pos: number, segundos: number, saida: string, rodada: number) {
  const vaga = vagaDe(pos);
  const sorte = aleatorio(20261117 + pos * 7919 + rodada * 104729);
  const fim = Date.now() + segundos * 1000;
  const achados: Candidato[] = [];
  const vistos = new Set<string>();
  const tentativas: Record<string, number> = {}, deu: Record<string, number> = {};
  let volta = 0;
  while (Date.now() < fim) {
    const tamanhos = TAMANHOS[vaga.peso], temas = TEMAS[vaga.peso];
    const [colunas, andares] = tamanhos[volta % tamanhos.length];
    const tema = temas[Math.floor(volta / tamanhos.length) % temas.length];
    volta++;
    const molde = moldeInterfone(vaga.peso, tema, colunas, andares, vaga.fios, vaga.papel, vaga.vera);
    if (!moldeValido(molde)) continue;
    const chave = `${colunas}x${andares} ${tema}`;
    tentativas[chave] = (tentativas[chave] ?? 0) + 1;
    let ultimo: { fase: FaseTrilho; papeis: Record<string, PapelFio>; a: string } | undefined;
    const aceita = (f: Parameters<typeof batizar>[0], c: Parameters<typeof batizar>[1]) => {
      const fase = batizar(f, c, TITULOS[pos % TITULOS.length], boatoDe(pos));
      // o certificado vale pros ids provisórios; confere de novo com os finais antes de guardar
      if (revalidar(fase).length) return false;
      const papeis = papeisDosFios(fase, fase.solucao, custo(fase.solucao)) as Record<string, PapelFio>;
      if (Object.values(papeis).some((p) => !p) || principal(papeis) !== vaga.papel) return false;
      if (!quaseBasta(medirQuase(fase), vaga.peso)) return false;
      ultimo = { fase, papeis, a: assinatura(fase) };
      return true;
    };
    const achado = fabricar(molde, sorte, Math.min(25_000, Math.max(1000, fim - Date.now())), aceita);
    if (!achado || !ultimo) continue;
    const id = JSON.stringify([ultimo.fase.vizinhos.map((v) => [v.id, v.pos, v.tipo]), ultimo.fase.amizades, ultimo.fase.interfones]);
    if (vistos.has(id)) continue;
    vistos.add(id);
    deu[chave] = (deu[chave] ?? 0) + 1;
    achados.push({ pos, tema, ...ultimo, colada: coladaNoZe(ultimo.fase) });
    console.log(`pos ${pos} ${chave}: ${ultimo.a} ${JSON.stringify(ultimo.papeis)}`);
  }
  writeFileSync(saida, JSON.stringify(achados));
  console.log(`pos ${pos} (${vaga.peso}, ${vaga.papel}${vaga.vera ? ', Vera' : ''}, ${vaga.fios} fio): ${achados.length} candidatos; tentativas ${JSON.stringify(tentativas)} deu ${JSON.stringify(deu)}`);
}

function juntar(saida: string, arquivos: string[]) {
  // Nada entra só porque estava num pool: cada candidato passa de novo pela revalidação e pelo papel que a VAGA pede (as regras
  // dos papéis mudam, e um pool velho não pode carregar andar que o certificado de hoje recusaria).
  const todos = arquivos.flatMap((a) => JSON.parse(readFileSync(a, 'utf8')) as Candidato[]).filter((c) => {
    const papeis = papeisDosFios(c.fase, c.fase.solucao, custo(c.fase.solucao)) as Record<string, PapelFio>;
    if (revalidar(c.fase).length || Object.values(papeis).some((p) => !p) || principal(papeis) !== vagaDe(c.pos).papel) return false;
    c.papeis = papeis;
    return true;
  });
  const porPos = Array.from({ length: 25 }, (_, p) => todos.filter((c) => c.pos === p));
  const faltam = porPos.map((c, p) => (c.length ? -1 : p)).filter((p) => p >= 0);
  if (faltam.length) { console.error(`vagas sem candidato: ${faltam.join(', ')} — nada gravado`); process.exit(1); }
  // régua (a mesma de gerarAndares.ts): não repete as 2 assinaturas anteriores e nenhuma passa de 6 no capítulo; a receita da Fofoqueira
  // colada no Zé aparece no máximo 4 vezes. Busca com retrocesso, candidatos mais raros primeiro.
  const MAX_IGUAIS = 6, MAX_COLADA = 4;
  const escolha: Candidato[] = [];
  const conta = new Map<string, number>();
  let colada = 0, passos = 0;
  const vai = (p: number): boolean => {
    if (p === 25) return true;
    if (++passos > 5_000_000) return false;
    const anteriores = escolha.slice(-2).map((c) => c.a);
    const ordem = [...porPos[p]].sort((x, y) => (conta.get(x.a) ?? 0) - (conta.get(y.a) ?? 0) || Number(x.colada) - Number(y.colada));
    for (const c of ordem) {
      if (anteriores.includes(c.a) || (conta.get(c.a) ?? 0) >= MAX_IGUAIS || (c.colada && colada >= MAX_COLADA)) continue;
      escolha.push(c); conta.set(c.a, (conta.get(c.a) ?? 0) + 1); if (c.colada) colada++;
      if (vai(p + 1)) return true;
      escolha.pop(); conta.set(c.a, conta.get(c.a)! - 1); if (c.colada) colada--;
    }
    return false;
  };
  if (!vai(0)) { console.error(`nenhuma combinação respeita a régua com estes candidatos (por vaga: ${porPos.map((c) => c.length).join(' ')})`); process.exit(1); }
  const json = escolha.map((c, pos) => ({ pos, peso: pesoDoAndar(pos), saiu: pesoDoAndar(pos), tema: c.tema, fase: c.fase, papeis: c.papeis }));
  writeFileSync(saida, JSON.stringify(json));
  console.log(`ok ${json.length} andares → ${saida} (candidatos por vaga: ${porPos.map((c) => c.length).join(' ')})`);
}

const [cmd, ...args] = process.argv.slice(2);
if (cmd === 'pool') pool(Number(args[0]), Number(args[1]), args[2], Number(args[3] ?? 0));
else if (cmd === 'juntar') juntar(args[0], args.slice(1));
else console.error('uso: pool <pos> <segundos> <saida.json> [rodada] | juntar <saida.json> <pool.json>...');
