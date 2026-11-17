// Conferidor dos andares desenhados à mão (2026-11-17). A régua única dos designers: um andar só entra se passar em tudo.
// Uso: npx vite-node scripts/conferirAndar.ts src/desenhados/<arquivo>.ts      (sai com código 1 se algum andar reprovar)
// O arquivo exporta `andares: AndarDesenhado[]` (tipo em src/desenhados/tipo.ts).
//
// O que reprova (✘) — o dono, sobre o "pesadelo": "a Ronda eu achei inútil. A Vera inútil." Por isso o vilão tem que
// pesar NO JOGO, não só no papel: sem a ameaça dele a solução seria mais CURTA (desvio) ou o caminho tentador VENCERIA.
import { alvosDe, controlavel, type Fase, type Vizinho } from '../src/motor';
import { jogar, resolverTrilho, custo, type FaseTrilho, type Plano } from '../src/trilho';
import type { AndarDesenhado } from '../src/desenhados/tipo';

const COM_ARTE = new Set(['Lúcia', 'Lia', 'Cida', 'Lu', 'Ana', 'Bia', 'Neide', 'Davi', 'Rita', 'Rui', 'Beto', 'Seu Zé', 'Edu', 'Vera', 'Dr. Álvaro',
  'Arnaldo', 'Solange', 'Ivo', 'Dona Norma', 'Otávio', 'Celina', 'Nando', 'Jandira', 'Caio', 'Marlene', 'Nonato', 'Raquel', 'Dona Zefa', 'Dudu',
  'Íris', 'Kátia', 'Mirela', 'Paulo', 'Seu Chico', 'Tânia', 'Tetê', 'Wesley', 'Zeca', 'Soneca']);
const LIMITE = { facil: { regras: 2, W: 4, H: 4, K: [3, 6] }, medio: { regras: 3, W: 5, H: 5, K: [5, 9] }, dificil: { regras: 4, W: 5, H: 7, K: [7, 13] } } as const;
const mesma = (s: Plano[], p: Plano) => s.length === 1 && JSON.stringify(Object.entries(s[0]).sort()) === JSON.stringify(Object.entries(p).sort());
const colado = (a: [number, number], b: [number, number]) => Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) === 1;
const muda = (f: FaseTrilho, fv: (v: Vizinho) => Vizinho, extra: Partial<FaseTrilho> = {}): FaseTrilho => ({ ...f, ...extra, vizinhos: f.vizinhos.map((v) => fv({ ...v })) });

// as regras do andar (a mesma conta do teto.test.ts, com o nome que aparece no relatório) e como tirar cada uma
const MECANICAS: { nome: string; tem: (f: FaseTrilho) => boolean; tira: (f: FaseTrilho) => FaseTrilho; regra: boolean }[] = [
  { nome: 'padaria (chega)', regra: true, tem: (f) => f.vizinhos.some((v) => v.chega), tira: (f) => muda(f, (v) => ({ ...v, chega: undefined })) },
  { nome: 'sai pra padaria (sai)', regra: true, tem: (f) => f.vizinhos.some((v) => v.sai !== undefined), tira: (f) => muda(f, (v) => ({ ...v, sai: undefined })) },
  { nome: 'ordem', regra: true, tem: (f) => f.vizinhos.some((v) => v.interesse?.ordem), tira: (f) => muda(f, (v) => (v.interesse ? { ...v, interesse: { ...v.interesse, ordem: undefined } } : v)) },
  { nome: 'tamanho', regra: true, tem: (f) => f.vizinhos.some((v) => v.interesse?.tamanho || v.interesse?.minTamanho), tira: (f) => muda(f, (v) => (v.interesse ? { ...v, interesse: { ...v.interesse, tamanho: undefined, minTamanho: undefined } } : v)) },
  { nome: 'versão', regra: true, tem: (f) => f.vizinhos.some((v) => v.interesse?.versao), tira: (f) => muda(f, (v) => (v.interesse ? { ...v, interesse: { ...v.interesse, versao: undefined } } : v)) },
  { nome: 'Soneca', regra: true, tem: (f) => f.vizinhos.some((v) => v.soneca), tira: (f) => muda(f, (v) => ({ ...v, soneca: undefined })) },
  { nome: 'Raquel (desconfia)', regra: true, tem: (f) => f.vizinhos.some((v) => v.desconfia), tira: (f) => muda(f, (v) => ({ ...v, desconfia: undefined })) },
  { nome: 'Nando (apressado)', regra: true, tem: (f) => f.vizinhos.some((v) => v.tipo === 'apressado'), tira: (f) => muda(f, (v) => (v.tipo === 'apressado' ? { ...v, tipo: 'comum' } : v)) },
  { nome: 'celular', regra: true, tem: (f) => f.vizinhos.some((v) => v.celular?.length), tira: (f) => muda(f, (v) => ({ ...v, celular: undefined })) },
  { nome: 'interfone', regra: true, tem: (f) => !!f.interfones?.length, tira: (f) => ({ ...f, interfones: undefined }) },
  { nome: 'muro fino', regra: true, tem: (f) => !!f.murosFinos?.length, tira: (f) => ({ ...f, murosFinos: undefined }) },
  { nome: 'boato que esfria', regra: true, tem: (f) => f.validade !== undefined, tira: (f) => ({ ...f, validade: undefined }) },
  { nome: 'Fofoqueira', regra: false, tem: (f) => f.vizinhos.some((v) => v.tipo === 'fofoqueira'), tira: (f) => muda(f, (v) => (v.tipo === 'fofoqueira' ? { ...v, tipo: 'comum' } : v)) },
  { nome: 'Exagerado', regra: false, tem: (f) => f.vizinhos.some((v) => v.tipo === 'exagerado'), tira: (f) => muda(f, (v) => (v.tipo === 'exagerado' ? { ...v, tipo: 'comum' } : v)) },
  { nome: 'Do Contra', regra: false, tem: (f) => f.vizinhos.some((v) => v.tipo === 'docontra'), tira: (f) => muda(f, (v) => (v.tipo === 'docontra' ? { ...v, tipo: 'comum' } : v)) },
];
// as regras dos vilões (cada uma conta no teto e tem que pesar no jogo)
const VILOES: { nome: string; tem: (v: Vizinho) => boolean; tira: (v: Vizinho) => Vizinho }[] = [
  { nome: 'ronda', tem: (v) => !!v.ronda?.length, tira: (v) => ({ ...v, ronda: undefined }) },
  { nome: 'Vera (escuta)', tem: (v) => !!v.vigia, tira: (v) => ({ ...v, vigia: undefined }) },
  { nome: 'Arnaldo (abafa)', tem: (v) => !!v.abafa, tira: (v) => ({ ...v, abafa: undefined }) },
  { nome: 'Dona Norma (recolhe)', tem: (v) => v.recolhe !== undefined, tira: (v) => ({ ...v, recolhe: undefined }) },
];

const menorK = (f: Fase, ate: number) => { for (let k = 1; k <= ate; k++) if (resolverTrilho(f, k).length) return k; return Infinity; };
const legal = (f: Fase, p: Plano) => Object.entries(p).every(([de, para]) => { const v = f.vizinhos.find((x) => x.id === de); return !!v && controlavel(v) && alvosDe(f, v).includes(para); });

function conferir(a: AndarDesenhado): { ok: boolean; linhas: string[]; K: number } {
  const f = a.fase, L = LIMITE[a.dificuldade], linhas: string[] = [];
  let ok = true;
  const erro = (s: string) => { ok = false; linhas.push(`  ✘ ${s}`); };
  const nota = (s: string) => linhas.push(`  · ${s}`);
  // forma
  const ids = f.vizinhos.map((v) => v.id), nomes = f.vizinhos.map((v) => v.nome), cel = f.vizinhos.map((v) => v.pos.join(','));
  if (new Set(ids).size !== ids.length || ids.some((i) => i.length !== 1)) erro('ids têm que ser de 1 caractere e únicos');
  if (new Set(nomes).size !== nomes.length) erro('nomes repetidos');
  for (const n of nomes) if (!COM_ARTE.has(n)) erro(`"${n}" não tem desenho (use um nome do elenco)`);
  if (new Set(cel).size !== cel.length) erro('dois moradores no mesmo apartamento');
  const W = Math.max(...f.vizinhos.map((v) => v.pos[0])) + 1, H = Math.max(...f.vizinhos.map((v) => v.pos[1])) + 1;
  if (W > L.W || H > L.H) erro(`prédio ${W}×${H} passa do tamanho de ${a.dificuldade} (${L.W}×${L.H})`);
  for (const [x, y] of f.amizades) { const p = f.vizinhos.find((v) => v.id === x)?.pos, q = f.vizinhos.find((v) => v.id === y)?.pos; if (!p || !q || !colado(p, q)) erro(`porta ${x}-${y} entre apartamentos não colados`); }
  for (const [x, y] of f.murosFinos ?? []) { const p = f.vizinhos.find((v) => v.id === x)?.pos, q = f.vizinhos.find((v) => v.id === y)?.pos; if (!p || !q || !colado(p, q)) erro(`muro ${x}-${y} entre apartamentos não colados`); if (f.amizades.some(([m, n]) => (m === x && n === y) || (m === y && n === x))) erro(`muro ${x}-${y} onde já há porta`); }
  for (const [x, y] of f.interfones ?? []) { const p = f.vizinhos.find((v) => v.id === x)?.pos, q = f.vizinhos.find((v) => v.id === y)?.pos; if (!p || !q || colado(p, q)) erro(`fio ${x}-${y} tem que ligar apartamentos NÃO colados`); }
  if (!f.vizinhos.some((v) => v.id === f.origens[0] && controlavel(v))) erro('a origem tem que ser um morador que conta');
  if (!f.vizinhos.some((v) => v.interesse)) erro('falta estrela');
  if (!f.vizinhos.some((v) => v.tipo === 'assunto')) erro('falta vilão');
  if (!ok) return { ok, linhas, K: 0 };
  // solução
  const K = menorK(f, 13);
  if (K === Infinity) { erro('não tem solução com até 13 setas'); return { ok, linhas, K: 0 }; }
  const sol = resolverTrilho(f, K);
  if (!mesma(sol, f.solucao)) erro(`com ${K} setas há ${sol.length} solução(ões), e tem que ser 1 só, igual à gravada`);
  if (f.setas !== K && f.setas !== K + 1) erro(`setas = ${f.setas}; tem que ser ${K} (justo) ou ${K + 1} (com folga)`);
  if (f.setas === K + 1 && resolverTrilho(f, K + 1).length > 2) erro(`com a seta de folga há ${resolverTrilho(f, K + 1).length} soluções (máx 2)`);
  if (!jogar(f, f.solucao).vitoria) erro('a solução gravada não vence');
  if (K < L.K[0] || K > L.K[1]) nota(`atenção: K=${K} fora da faixa de ${a.dificuldade} (${L.K[0]}–${L.K[1]})`);
  // ⚠️ seta pra quem JÁ SABE (2026-11-17, o dono travou em "A volta por baixo": "esse não tem como"). A última seta voltava pro
  // vizinho que já tinha ouvido, só pra quem conta vazar o escândalo pelo muro — ninguém pensa nisso. Seta da solução tem que
  // levar o boato a alguém que ainda não sabia.
  {
    const r = jogar(f, f.solucao);
    for (const [de, para] of Object.entries(f.solucao)) {
      const i = r.batidas.findIndex((ms) => ms.some((m) => m.de === de && m.para === para && !m.escuta && !m.vazou));
      const ja = r.ouviu[para];
      if (i >= 0 && ja && ja.batida < i + 1) {
        const n = (id: string) => f.vizinhos.find((v) => v.id === id)?.nome ?? id;
        erro(`a solução manda ${n(de)} contar pra ${n(para)}, que já sabia (batida ${ja.batida}): seta que não leva o boato a ninguém novo`);
      }
    }
  }
  // armadilha
  if (!f.armadilha) erro('falta a armadilha (o caminho tentador que perde)');
  else {
    if (!legal(f, f.armadilha)) erro('a armadilha usa seta que o jogador não pode desenhar');
    if (custo(f.armadilha) > f.setas) nota('a armadilha não cabe nas setas (vale como tentação, mas a melhor armadilha cabe)');
    const r = jogar(f, f.armadilha);
    if (r.vitoria && custo(f.armadilha) <= f.setas) erro('a armadilha VENCE');
    else if (r.vitoria) nota('a armadilha venceria, mas precisa de mais setas do que o jogador tem (tentação de "não cabe")');
    else nota(`armadilha perde por: ${r.motivo}${r.culpado ? ` (${f.vizinhos.find((v) => v.id === r.culpado)?.nome})` : ''}`);
  }
  // vilões: cada um pesa NO JOGO
  for (const vil of f.vizinhos.filter((v) => v.tipo === 'assunto')) {
    const regras = VILOES.filter((r) => r.tem(vil));
    for (const r of regras) {
      const g = muda(f, (v) => (v.id === vil.id ? r.tira(v) : v));
      const k2 = menorK(g, K);
      const tentacao = f.armadilha && legal(g, f.armadilha) && jogar(g, f.armadilha).vitoria;
      if (k2 < K) nota(`${vil.nome}, ${r.nome}: pesa (sem a regra, bastariam ${k2} setas)`);
      else if (tentacao) nota(`${vil.nome}, ${r.nome}: pesa (sem a regra, a armadilha venceria)`);
      else erro(`${vil.nome}, ${r.nome}: NÃO pesa no jogo — sem a regra, o mesmo número de setas e a armadilha continua perdendo`);
    }
    // o próprio vilão (ser vítima): sem ele, o caminho seria mais curto ou a armadilha venceria?
    const semVitima = muda(f, (v) => (v.id === vil.id ? { ...v, tipo: 'comum', vigia: undefined, abafa: undefined, recolhe: undefined, ronda: undefined } : v));
    const k3 = menorK(semVitima, K);
    const t3 = f.armadilha && jogar(semVitima, f.armadilha).vitoria;
    if (k3 < K) nota(`${vil.nome} (vítima): pesa — sem ele/ela, bastariam ${k3} setas`);
    else if (t3) nota(`${vil.nome} (vítima): pesa — a armadilha perde por causa dele/dela`);
    else erro(`${vil.nome} (vítima) NÃO pesa — sem ele/ela a jogada seria a mesma; está de enfeite`);
  }
  // mecânicas: cada uma muda a jogada
  const presentes = MECANICAS.filter((m) => m.tem(f));
  for (const m of presentes) {
    const g = m.tira(f);
    const sg = resolverTrilho(g, f.setas);
    const mudaSol = !mesma(resolverTrilho(g, K), f.solucao) || menorK(g, K) < K;
    const mudaArm = !!f.armadilha && legal(g, f.armadilha) && jogar(g, f.armadilha).vitoria !== jogar(f, f.armadilha).vitoria;
    if (mudaSol || mudaArm) nota(`${m.nome}: pesa`);
    else erro(`${m.nome}: NÃO pesa (tirando, a solução e a armadilha ficam iguais; ${sg.length} solução(ões) com ${f.setas})`);
  }
  // teto de leitura
  const regras = presentes.filter((m) => m.regra).length + f.vizinhos.filter((v) => v.tipo === 'assunto').reduce((s, v) => s + VILOES.filter((r) => r.tem(v)).length, 0);
  if (regras > L.regras) erro(`${regras} regras especiais; ${a.dificuldade} aceita até ${L.regras}`);
  nota(`K=${K}, setas=${f.setas}, ${W}×${H}, ${f.vizinhos.length} moradores, ${regras} regras, mecânicas: ${presentes.map((m) => m.nome).join(', ') || '—'}`);
  return { ok, linhas, K };
}

const arq = process.argv[2];
if (!arq) { console.error('uso: npx vite-node scripts/conferirAndar.ts src/desenhados/<arquivo>.ts'); process.exit(2); }
// a partir da raiz do projeto ("/src/..."): o vite-node não aceita file:// com espaço no caminho ("Meus Projetos")
const mod = await import(/* @vite-ignore */ '/' + arq.split('\\').join('/').replace(/^\.\//, '')) as { andares: AndarDesenhado[] };
let reprovados = 0;
for (const a of mod.andares) {
  const r = conferir(a);
  console.log(`${r.ok ? '✔' : '✘'} [${a.dificuldade}] ${a.fase.titulo}`);
  for (const l of r.linhas) console.log(l);
  if (!r.ok) reprovados++;
}
console.log(`\n${mod.andares.length - reprovados} de ${mod.andares.length} aprovados`);
process.exit(reprovados ? 1 : 0);
