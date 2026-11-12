// Gerador de fases: monta um prédio do zero (apartamentos, passagens, moradores e setas),
// passa pelo resolvedor e só aceita fases justas. Entre as justas, escolhe a que tem a nota de
// dificuldade mais perto do alvo daquela posição da trilha.

import { espalhar, resolver, type Fase, type Interesse, type Tipo, type Vizinho } from './motor';
import { aleatorio, justa } from './variar';

export interface Pedido {
  vizinhos: number; // quantos moradores (contando o Seu Zé)
  giros: number;
  tipos: Tipo[]; // tipos liberados além de comum e assunto
  obrigatorio?: Tipo; // a novidade do bloco precisa aparecer
  interessados: number;
  alvo: number; // nota de dificuldade desejada
  horario?: boolean; // o Seu Zé está na padaria e volta numa batida certa
}

// Elenco fixo: o mesmo personagem volta em várias fases (o desenho depende do nome).
const ELENCO: Record<Tipo, string[]> = {
  assunto: ['Seu Zé'],
  fofoqueira: ['Neide'],
  tumulo: ['Padre'],
  exagerado: ['Beto', 'Lúcia'],
  docontra: ['Edu', 'Rita'],
  apressado: ['Nando'], // o gerador antigo (giros) não sorteia esse tipo; só pra fechar o Record
  comum: ['Cida', 'Ana', 'Bia', 'Lia', 'Davi', 'Rui'],
};
const PESO: Partial<Record<Tipo, number>> = { fofoqueira: 1, exagerado: 1.4, docontra: 1.4, tumulo: 1 };

const TITULOS = [
  'Hora do cafezinho', 'Dia de feira', 'Faxina geral', 'Conversa no hall', 'Sábado de sol', 'Festa no 202',
  'Falta d’água', 'Entrega errada', 'O elevador quebrou', 'Noite de bingo', 'Varal cheio', 'Obra no vizinho',
  'Chegou carta', 'Reunião extraordinária', 'Domingo de chuva', 'Aniversário surpresa', 'Pizza às onze',
  'Cachorro solto', 'Mudança nova', 'Luz piscando', 'Correio atrasado', 'Churrasco na laje',
];
const BOATOS = [
  'O Seu Zé pinta o bigode', 'O Seu Zé dorme de touca', 'O Seu Zé chorou na novela', 'O Seu Zé canta no chuveiro',
  'O Seu Zé tem medo de pombo', 'O Seu Zé usa peruca aos domingos', 'O Seu Zé ganhou na rifa e não contou',
  'O Seu Zé dança forró escondido', 'O Seu Zé conversa com as plantas', 'O Seu Zé torce pro time rival',
  'O Seu Zé faz aula de violino', 'O Seu Zé tem uma tartaruga chamada Dona Flor', 'O Seu Zé come pizza com garfo',
  'O Seu Zé dá nome pros mosquitos', 'O Seu Zé ensaia discurso no espelho', 'O Seu Zé coleciona tampinhas',
  'O Seu Zé ronca em dó maior', 'O Seu Zé quer ser síndico', 'O Seu Zé escreve poesia para a vizinha',
  'O Seu Zé perdeu no dominó para o neto',
];

const embaralhar = <T,>(xs: T[], sorte: () => number) => {
  const a = [...xs];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(sorte() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
const escolher = <T,>(xs: T[], sorte: () => number) => xs[Math.floor(sorte() * xs.length)];

// Quanto mais giros, armadilhas e cadeia longa, mais difícil; muitas soluções facilitam.
export function dificuldade(fase: Fase): number {
  const sol = resolver(fase);
  if (!sol.length) return Infinity;
  const origens = fase.vizinhos.filter((v) => v.tipo !== 'assunto' && !v.interesse);
  const perdem = origens.filter((v) => !espalhar(fase, { origem: v.id, setas: {} }).vitoria).length;
  const cadeia = Math.min(...sol.map((j) => espalhar(fase, j).batidas.length));
  return fase.giros * 1.6 + fase.vizinhos.length * 0.35 + (perdem / Math.max(1, origens.length)) * 2 + cadeia * 0.5 + (3 - sol.length) * 0.4;
}

function montar(p: Pedido, sorte: () => number): Fase | undefined {
  const colunas = p.vizinhos <= 4 ? 2 : 3;
  const andares = Math.min(4, Math.ceil(p.vizinhos / colunas) + (sorte() < 0.5 ? 1 : 0));
  if (colunas * andares < p.vizinhos) return;
  const celulas = embaralhar(Array.from({ length: colunas * andares }, (_, i) => [i % colunas, Math.floor(i / colunas)] as [number, number]), sorte).slice(0, p.vizinhos);
  // prédio sem buraco no térreo nem colunas soltas: toda coluna e todo andar ocupados
  if (new Set(celulas.map((c) => c[0])).size < colunas || new Set(celulas.map((c) => c[1])).size < andares) return;

  const ids = celulas.map((_, i) => `v${i}`);
  const idx = (c: number, r: number) => celulas.findIndex(([x, y]) => x === c && y === r);
  // passagens possíveis: parede ou escada (vizinhos de porta) e telefone (na diagonal, uma por quadrado)
  const retas: [number, number][] = [];
  const diagonais: [number, number][] = [];
  celulas.forEach(([c, r], i) => {
    for (const [dc, dr, lista] of [[1, 0, retas], [0, 1, retas], [1, 1, diagonais], [-1, 1, diagonais]] as const) {
      const j = idx(c + dc, r + dr);
      if (j >= 0) lista.push([i, j]);
    }
  });
  // árvore que liga todo mundo (prefere paredes e escadas), depois algumas passagens extras
  const ligado = new Set([0]);
  const amizades: [number, number][] = [];
  const candidatos = [...embaralhar(retas, sorte), ...embaralhar(diagonais, sorte)];
  while (ligado.size < celulas.length) {
    const e = candidatos.find(([a, b]) => ligado.has(a) !== ligado.has(b));
    if (!e) return; // não dá pra ligar todo mundo
    amizades.push(e);
    ligado.add(e[0]).add(e[1]);
  }
  for (const e of candidatos) {
    if (amizades.includes(e) || sorte() > (diagonais.includes(e) ? 0.15 : 0.35)) continue;
    amizades.push(e);
  }
  // duas diagonais no mesmo quadrado se cruzariam
  const cruzam = amizades.some(([a, b]) => amizades.some(([c, d]) => {
    if (!diagonais.some(([x, y]) => x === a && y === b) || !diagonais.some(([x, y]) => x === c && y === d) || a === c) return false;
    const [ax, ay] = celulas[a], [bx, by] = celulas[b], [cx, cy] = celulas[c], [dx, dy] = celulas[d];
    return Math.min(ax, bx) === Math.min(cx, dx) && Math.min(ay, by) === Math.min(cy, dy);
  }));
  if (cruzam) return;

  // quem mora onde
  const tipos: Tipo[] = ['assunto'];
  if (p.obrigatorio) tipos.push(p.obrigatorio);
  const pesos = p.tipos.map((t) => [t, PESO[t] ?? 1] as const);
  const total = pesos.reduce((s, [, w]) => s + w, 0) + 2.6; // 2.6 = peso do comum
  const usados = (t: Tipo) => tipos.filter((x) => x === t).length;
  while (tipos.length < p.vizinhos) {
    let r = sorte() * total;
    let t: Tipo = 'comum';
    for (const [tipo, w] of pesos) if ((r -= w) < 0) { t = tipo; break; }
    if (usados(t) >= ELENCO[t].length) t = 'comum';
    tipos.push(t);
  }
  const comuns = tipos.filter((t) => t === 'comum').length;
  if (comuns < p.interessados || comuns > ELENCO.comum.length) return;
  const ordem = embaralhar(tipos, sorte);
  const nomes = Object.fromEntries(Object.entries(ELENCO).map(([t, n]) => [t, embaralhar(n, sorte)]));
  let interessados = p.interessados;
  const calados = new Set<string>(); // interessados que ouvem e guardam pra si

  const vizinhos: Vizinho[] = ordem.map((tipo, i) => {
    const v: Vizinho = { id: ids[i], nome: nomes[tipo].shift()!, tipo, pos: celulas[i] };
    if (tipo === 'comum' && interessados > 0) {
      interessados--;
      const interesse: Interesse = {};
      if (p.tipos.includes('exagerado') && sorte() < 0.6) interesse.minTamanho = sorte() < 0.5 ? 2 : 3;
      else if (p.tipos.includes('docontra') && sorte() < 0.5) interesse.versao = 'normal';
      v.interesse = interesse;
      if (sorte() < 0.5) calados.add(v.id);
    }
    return v;
  });
  const amigos = (i: number) => amizades.flatMap(([a, b]) => (a === i ? [b] : b === i ? [a] : []));
  vizinhos.forEach((v, i) => {
    const comSeta = v.tipo === 'comum' || v.tipo === 'exagerado' || v.tipo === 'docontra';
    if (comSeta && !calados.has(v.id)) v.seta = ids[escolher(amigos(i), sorte)];
  });
  if (p.horario) {
    // padaria: o horário só importa se alguém perto do Seu Zé pode contar pra ele
    const z = vizinhos.findIndex((v) => v.tipo === 'assunto');
    const perto = amigos(z).map((i) => vizinhos[i]);
    const dedoDuro = perto.find((v) => v.seta !== undefined) ?? (perto.some((v) => v.tipo === 'fofoqueira') ? null : undefined);
    if (dedoDuro === undefined) return;
    if (dedoDuro) dedoDuro.seta = ids[z];
  }

  return {
    titulo: escolher(TITULOS, sorte),
    boato: escolher(BOATOS, sorte),
    giros: p.giros,
    vizinhos,
    amizades: amizades.map(([a, b]) => [ids[a], ids[b]]),
  };
}

// ~0,5 ms por prédio testado; nas fases grandes da padaria só ~1 em 100 sai justo, daí o limite.
export function gerar(p: Pedido, semente: number, candidatos = 12, limite = 900): Fase | undefined {
  const sorte = aleatorio(semente);
  let melhor: Fase | undefined, distancia = Infinity;
  for (let i = 0, achadas = 0; i < limite && achadas < candidatos; i++) {
    let f = montar(p, sorte);
    // padaria: em vez de sortear a volta do Seu Zé às cegas, testa 2, 3 e 4 no mesmo prédio
    if (f && p.horario) {
      const base = f;
      f = embaralhar([2, 3, 4], sorte)
        .map((chega) => ({ ...base, vizinhos: base.vizinhos.map((v) => (v.tipo === 'assunto' ? { ...v, chega } : v)) }))
        .find((c) => justa(c));
      if (!f) continue;
    } else if (!f || !justa(f)) continue;
    // ⚠️ Gerador da mecânica antiga (origem livre + giros). Exigir cadeia longa aqui não funciona:
    // com origem livre sempre dá pra começar no vizinho da ⭐ (Consulta 1 com o Sol, 2026-11-10).
    // Ele fica até o gerador do trilho substituí-lo; `qualidade` serve só para medir.
    achadas++;
    const d = Math.abs(dificuldade(f) - p.alvo);
    if (d < distancia) [melhor, distancia] = [f, d];
  }
  return melhor;
}
