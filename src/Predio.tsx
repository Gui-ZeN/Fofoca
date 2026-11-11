import { useEffect, useState } from 'react';
import { girosUsados, podeGirar, podeSerOrigem, porCelular, quemContou, type Fase, type Resultado, type Tamanho, type Vizinho } from './motor';
import { Personagem, type Expressao } from './Personagem';
import { Boato, Estrela, Girar, Telefone } from './Icones';
import { Vazio } from './Vazio';
import { explicar, type Explicacao } from './explicar';

// Prédio em corte: cada célula da grade é um apartamento visto por dentro.
const L = 120; // largura e altura de um apartamento
const RAIO = 28; // de onde a seta sai, a partir do ponto de ancoragem do morador

// ⚠️ O tamanho do meio não pode se chamar "boato": é o nome da coisa toda, e o Sol (jogando por texto)
// concluiu que o boato já começava no tamanho 2 e errou as fases do Exagerado. Começa sempre em cochicho.
export const TAMANHO: Record<Tamanho, string> = { 1: 'um cochicho', 2: 'uma fofoca', 3: 'um escândalo' };
export const NOME_TAMANHO: Record<Tamanho, string> = { 1: 'cochicho', 2: 'fofoca', 3: 'escândalo' };

// O que vai em cada plaquinha da derrota (a vítima tem a seta vermelha, não plaquinha).
type Placa = { id: string; culpa: boolean; texto?: string; icones?: [Tamanho, Tamanho] };
function placasDa(e: Explicacao): Placa[] {
  if (e.tipo === 'tamanho') return [{ id: e.id, culpa: true, icones: [e.queria, e.veio] }];
  if (e.tipo === 'ordem') {
    return [
      { id: e.antes, culpa: false, texto: `ouviu na ${e.batidaAntes}` },
      { id: e.depois, culpa: true, texto: e.batidaDepois === e.batidaAntes ? `junto, na ${e.batidaDepois}` : `ouviu na ${e.batidaDepois}` },
    ];
  }
  if (e.tipo === 'padaria') return [{ id: e.id, culpa: true, texto: `recado na ${e.chegou} · volta na ${e.volta}` }];
  if (e.tipo === 'sem_noticia') return [{ id: e.id, culpa: true, texto: 'não ouviu' }];
  return [];
}

// Ponto de ancoragem do morador (altura da cabeça); o corpo desce até o piso.
const cabeca = (v: Vizinho) => ({ x: v.pos[0] * L + L / 2, y: v.pos[1] * L + 70 });

// Onde fica a passagem entre dois vizinhos: parede (lado a lado), escada (empilhados, no canto direito) ou telefone.
function passagem(a: Vizinho, b: Vizinho) {
  const [ca, ra] = a.pos, [cb, rb] = b.pos;
  if (ra === rb && Math.abs(ca - cb) === 1) return { tipo: 'parede' as const, x: Math.max(ca, cb) * L, y: ra * L + 70 };
  if (ca === cb && Math.abs(ra - rb) === 1) return { tipo: 'escada' as const, x: ca * L + L - 26, y: Math.max(ra, rb) * L };
  const pa = cabeca(a), pb = cabeca(b);
  return { tipo: 'telefone' as const, x: (pa.x + pb.x) / 2, y: (pa.y + pb.y) / 2 };
}

// Etiqueta com o nome (e o que a pessoa exige para acreditar), no canto de cima.
// No trilho o tamanho é exato e aparece com "=" ("quer exatamente um boato"); na mecânica antiga é mínimo.
function Etiqueta({ v, x0, y0, contou }: { v: Vizinho; x0: number; y0: number; contou?: boolean }) {
  const exato = v.interesse?.tamanho;
  const req = exato ?? v.interesse?.minTamanho;
  // quem você contou: a própria etiqueta fica laranja e carrega o cochicho (nada solto por cima do desenho)
  // o Exagerado leva um selo "+1" fixo: a cor do apartamento some quando ele ouve (fica amarelo)
  const mais = v.tipo === 'exagerado';
  // bloco Ordem: o número da vez fica colado na estrela ("⭐1 Bia" sabe antes de "⭐2 Cida")
  const vez = v.interesse?.ordem;
  const w = v.nome.length * 7.6 + 14 + (v.interesse ? 16 : 0) + (vez ? 10 : 0) + (req ? 26 : 0) + (exato ? 10 : 0) + (contou ? 24 : 0) + (mais ? 26 : 0);
  const textoX = x0 + 12 + (v.interesse ? 15 : 0) + (vez ? 10 : 0);
  const maisX = textoX + v.nome.length * 7.6 + 4;
  return (
    // a vítima do boato também ganha etiqueta própria (vermelha): nem sempre é o Seu Zé
    <g className={contou ? 'etiqueta contou' : v.tipo === 'assunto' ? 'etiqueta vitima' : 'etiqueta'}
      aria-label={contou ? `${v.nome}: você contou` : v.tipo === 'assunto' ? `${v.nome}: o boato é sobre essa pessoa` : undefined}>
      <rect x={x0 + 7} y={y0 + 6} width={w} height={20} rx={4} />
      {v.interesse && <g transform={`translate(${x0 + 19} ${y0 + 16})`}><Estrela r={6.5} /></g>}
      {vez && <text x={x0 + 27} y={y0 + 17} className="vez">{vez}</text>}
      <text x={textoX} y={y0 + 17}>{v.nome}</text>
      {mais && (
        <g className="exagera" aria-label="aumenta o boato um tamanho">
          <rect x={maisX} y={y0 + 9} width={22} height={14} rx={7} />
          <text x={maisX + 11} y={y0 + 16.5}>+1</text>
        </g>
      )}
      {exato && <text x={x0 + 7 + w - 33} y={y0 + 17} className="igual">=</text>}
      {req && (
        <g transform={`translate(${x0 + 7 + w - 15} ${y0 + 16}) scale(0.62)`}><Boato tamanho={req as Tamanho} /></g>
      )}
      {contou && <g transform={`translate(${x0 + 7 + w - 14} ${y0 + 16}) scale(0.62)`}><Boato tamanho={1} /></g>}
    </g>
  );
}

// Placa pendurada na porta de quem foi na padaria: um pão e quantas batidas faltam para voltar.
export function Padaria({ x, y, faltam, batendo }: { x: number; y: number; faltam: number; batendo: boolean }) {
  return (
    <g className="padaria" aria-label={`Volta em ${faltam} batida${faltam > 1 ? 's' : ''}`}>
      <path d={`M${x - 12},${y - 20} L${x},${y - 30} L${x + 12},${y - 20}`} fill="none" stroke="#5a4636" strokeWidth={1.8} />
      <rect x={x - 26} y={y - 20} width={52} height={40} rx={6} className="placa" />
      {/* pão francês */}
      <ellipse cx={x - 9} cy={y} rx={11} ry={6.5} fill="#e3a857" stroke="#2b2622" strokeWidth={1.8} transform={`rotate(-18 ${x - 9} ${y})`} />
      <path d={`M${x - 15},${y + 1} l3,-4 M${x - 10},${y + 2} l3,-5 M${x - 5},${y} l3,-4`} stroke="#9a5f22" strokeWidth={1.6} strokeLinecap="round" />
      <text x={x + 13} y={y + 1} className="faltam">{faltam}</text>
      {batendo && <text x={x + 30} y={y - 34} className="toc">toc toc</text>}
    </g>
  );
}

// Trilho: apertar, tocar e arrastar de um apartamento até outro pra desenhar quem conta pra quem.
export interface Desenho {
  selecionado?: string;
  alvos: string[]; // pra quem o selecionado pode contar (vizinhos e destinos do celular)
  aoApertar: (v: Vizinho) => void;
  aoTocar: (v: Vizinho) => void;
  aoSoltar: (de: string, para: string) => void;
}

export function Predio(props: {
  fase: Fase; origem?: string; setas: Record<string, string>; resultado?: Resultado; batida: number; montando: boolean;
  aoTocar: (v: Vizinho) => void; aoGirar: (v: Vizinho) => void; trilho?: Desenho;
}) {
  const { fase, origem, setas, resultado, batida, montando, trilho } = props;

  // Arrasto: no toque, o navegador entrega o soltar pro elemento onde o dedo começou,
  // então o destino é achado pelo ponto onde o dedo saiu.
  const [arrasto, setArrasto] = useState<{ de: string; x: number; y: number }>();
  useEffect(() => {
    if (!arrasto || !trilho) return;
    const soltar = (e: PointerEvent) => {
      const alvo = document.elementFromPoint(e.clientX, e.clientY)?.closest('[data-morador]')?.getAttribute('data-morador');
      const andou = Math.hypot(e.clientX - arrasto.x, e.clientY - arrasto.y) > 14;
      if (alvo && alvo !== arrasto.de && andou) trilho.aoSoltar(arrasto.de, alvo);
      else if (!andou || alvo === arrasto.de) trilho.aoTocar(porId[arrasto.de]);
      setArrasto(undefined);
    };
    // se o navegador tomar o gesto (pointercancel), o arrasto morre; senão o próximo toque desenhava uma seta fantasma
    const cancelar = () => setArrasto(undefined);
    window.addEventListener('pointerup', soltar);
    window.addEventListener('pointercancel', cancelar);
    return () => { window.removeEventListener('pointerup', soltar); window.removeEventListener('pointercancel', cancelar); };
  }); // re-registra a cada render pra enxergar o trilho atual
  const porId = Object.fromEntries(fase.vizinhos.map((v) => [v.id, v]));
  const colunas = Math.max(...fase.vizinhos.map((v) => v.pos[0])) + 1;
  const andares = Math.max(...fase.vizinhos.map((v) => v.pos[1])) + 1;
  const largura = colunas * L, altura = andares * L;
  const naCelula = (c: number, r: number) => fase.vizinhos.find((v) => v.pos[0] === c && v.pos[1] === r);
  const ouviuAte = (id: string) => {
    const o = resultado?.ouviu[id];
    return o && o.batida < batida ? o : undefined;
  };
  const falando = resultado?.batidas[batida - 1] ?? [];
  const ativa = (a: string, b: string) => falando.some((m) => (m.de === a && m.para === b) || (m.de === b && m.para === a));
  const fim = resultado !== undefined && batida > resultado.batidas.length;
  const explicacao = fim && resultado ? explicar(fase, resultado) : undefined;
  const semGiro = girosUsados(fase, setas) >= fase.giros;
  // Fora de casa enquanto não deu a batida da volta (no fim, todo mundo já voltou).
  const fora = (v: Vizinho) => !!v.chega && !fim && (montando || batida < v.chega);

  // direção (unitária) da passagem de quem o morador conta; quem não conta olha pra frente
  const olharPara = (v: Vizinho): [number, number] => {
    const alvo = setas[v.id] ?? v.seta;
    if (!alvo) return [0, 0];
    const p = cabeca(v), q = passagem(v, porId[alvo]);
    const d = Math.hypot(q.x - p.x, q.y - p.y) || 1;
    return [(q.x - p.x) / d, (q.y - p.y) / d];
  };

  const expressao = (v: Vizinho): Expressao => {
    const o = ouviuAte(v.id);
    if (fim && resultado.culpado === v.id && v.tipo === 'assunto') return 'bravo';
    if (falando.some((m) => m.de === v.id)) return 'contando';
    if (o && o.batida === batida - 1) return 'chocado'; // acabou de ouvir e não tem pra quem contar
    if (fim && resultado.vitoria && v.interesse) return 'chocado';
    if (montando && origem === v.id) return 'ouvindo';
    return 'neutro';
  };

  return (
    <g className="predio">
      {/* telhado e caixa d'água; o chão é da cena */}
      <rect x={largura - 64} y={-46} width={46} height={30} rx={4} className="caixa" />
      <rect x={-10} y={-16} width={largura + 20} height={16} className="telhado" />

      {/* apartamentos: acende a luz de quem já ouviu */}
      {Array.from({ length: andares }, (_, r) => Array.from({ length: colunas }, (_, c) => {
        const v = naCelula(c, r);
        const cls = ['comodo', v ? v.tipo : 'vazio', v && ouviuAte(v.id) && 'ouviu', v && fim && resultado.culpado === v.id && 'culpado'];
        return (
          <g key={`${c},${r}`}>
            <rect x={c * L} y={r * L} width={L} height={L} className={cls.filter(Boolean).join(' ')} />
            <rect x={c * L + 3} y={r * L + L - 12} width={L - 6} height={9} className={v ? 'rodape' : 'rodape apagado'} />
            {!v && <Vazio x0={c * L} y0={r * L} cena={c * 3 + r * 5 + fase.titulo.length} />}
          </g>
        );
      }))}
      <rect x={0} y={0} width={largura} height={altura} className="fachada" />

      {/* passagens */}
      {fase.amizades.map(([a, b]) => {
        const p = passagem(porId[a], porId[b]);
        // passagem por onde alguém vai contar fica contornada: o caminho se lê mesmo quando o rastro é curto (escada)
        const usada = [a, b].some((de) => (setas[de] ?? porId[de].seta) === (de === a ? b : a));
        const cls = (ativa(a, b) ? ' ativa' : '') + (usada ? ' usada' : '');
        if (p.tipo === 'parede') return <rect key={a + b} x={p.x - 9} y={p.y - 17} width={18} height={34} rx={5} className={'passagem' + cls} />;
        if (p.tipo === 'escada') {
          return (
            <g key={a + b} className={'passagem escada' + cls}>
              <rect x={p.x - 17} y={p.y - 9} width={34} height={18} rx={4} />
              <path d={`M${p.x - 8},${p.y - 6} v12 M${p.x},${p.y - 6} v12 M${p.x + 8},${p.y - 6} v12`} />
            </g>
          );
        }
        const pa = cabeca(porId[a]), pb = cabeca(porId[b]);
        return (
          <g key={a + b} className={'telefone' + cls}>
            <line x1={pa.x} y1={pa.y} x2={pb.x} y2={pb.y} />
            <g transform={`translate(${p.x} ${p.y})`}><Telefone /></g>
          </g>
        );
      })}

      {/* moradores */}
      {fase.vizinhos.map((v) => {
        const x0 = v.pos[0] * L, y0 = v.pos[1] * L;
        const { x, y } = cabeca(v);
        const perdeu = fim && resultado.culpado === v.id;
        const clicavel = montando && (trilho ? true : podeSerOrigem(fase, v));
        const cls = [
          'morador', origem === v.id && 'origem', perdeu && 'culpado', clicavel && 'clicavel',
          montando && trilho?.selecionado === v.id && 'selecionado', montando && trilho?.alvos.includes(v.id) && 'alvo',
        ];
        return (
          <g key={v.id} data-morador={v.id} className={cls.filter(Boolean).join(' ')}
            onClick={trilho ? undefined : () => props.aoTocar(v)}
            onPointerDown={trilho && montando ? (e) => { setArrasto({ de: v.id, x: e.clientX, y: e.clientY }); trilho.aoApertar(v); } : undefined}>
            <rect x={x0 + 4} y={y0 + 4} width={L - 8} height={L - 8} rx={6} className="toque" />
            {fora(v)
              ? <Padaria x={x} y={y + 6} faltam={montando ? v.chega! : v.chega! - batida} batendo={falando.some((m) => m.para === v.id)} />
              : <Personagem v={v} expressao={expressao(v)} x={x} y={y} olha={olharPara(v)} />}
            <Etiqueta v={v} x0={x0} y0={y0} contou={!!fase.origens && origem === v.id} />
            {v.celular && <g transform={`translate(${x0 + 22} ${y0 + L - 26}) scale(0.9)`} className="tem-celular"><Telefone /></g>}
          </g>
        );
      })}

      {/* setas por cima dos personagens: pra quem cada um conta */}
      {fase.vizinhos.map((v) => {
        const alvo = setas[v.id] ?? v.seta;
        if (!alvo) return null;
        const p = cabeca(v);
        if (trilho && porCelular(fase, v.id, alvo)) {
          // ligação de celular: o telefone fica com quem liga e a ponta aponta pra quem atende
          const q = cabeca(porId[alvo]);
          const d = Math.hypot(q.x - p.x, q.y - p.y), ux = (q.x - p.x) / d, uy = (q.y - p.y) / d;
          const ligando = falando.some((m) => m.de === v.id && m.para === alvo);
          const ang = (Math.atan2(uy, ux) * 180) / Math.PI;
          const [fx, fy] = [q.x - ux * 30, q.y - uy * 30];
          return (
            <g key={'s' + v.id} className={ligando ? 'seta ligacao ativa' : 'seta ligacao'}>
              <line x1={p.x + ux * 48} y1={p.y + uy * 48} x2={fx} y2={fy} />
              <path d="M-4,-6 L3,0 L-4,6" transform={`translate(${fx} ${fy}) rotate(${ang})`} />
              <g transform={`translate(${p.x + ux * 37} ${p.y + uy * 37}) scale(0.7)`}><Telefone /></g>
            </g>
          );
        }
        const q = passagem(v, porId[alvo]);
        let x1: number, y1: number, x2: number, y2: number;
        if (q.tipo === 'parede') {
          const dir = Math.sign(q.x - p.x);
          [x1, y1, x2, y2] = [p.x + dir * 24, p.y + 8, q.x - dir * 14, q.y + 8]; // na altura da boca
        } else if (q.tipo === 'escada') {
          // ao lado do corpo, não por cima: desce do ombro ou sobe da cabeça até o alçapão
          const dir = Math.sign(q.y - p.y);
          [x1, y1, x2, y2] = [q.x, dir > 0 ? p.y + 10 : p.y - 8, q.x, q.y - dir * 11];
        } else {
          const d = Math.hypot(q.x - p.x, q.y - p.y);
          const ux = (q.x - p.x) / d, uy = (q.y - p.y) / d;
          [x1, y1, x2, y2] = [p.x + ux * RAIO, p.y + uy * RAIO, q.x - ux * 16, q.y - uy * 16];
        }
        // rastro de cochicho: bolinhas que crescem na direção de quem vai ouvir
        const ang = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;
        const ponto = (t: number) => [x1 + (x2 - x1) * t, y1 + (y2 - y1) * t];
        return (
          <g key={'s' + v.id} className={setas[v.id] ? 'seta girada' : 'seta'}>
            {[[0, 2.8], [0.45, 3.6], [0.85, 4.4]].map(([t, r]) => {
              const [cx, cy] = ponto(t);
              return <circle key={t} cx={cx} cy={cy} r={r} />;
            })}
            <path d="M-3,-5 L3,0 L-3,5" transform={`translate(${x2 + Math.cos((ang * Math.PI) / 180) * 5} ${y2 + Math.sin((ang * Math.PI) / 180) * 5}) rotate(${ang})`} />
          </g>
        );
      })}

      {/* derrota pela vítima: o último elo, de quem contou de fato (inclusive a Fofoqueira) até ela, com direção.
          Fica enquanto o resultado está aberto. No empate, todos que entregaram juntos. */}
      {fim && resultado.motivo === 'assunto_ouviu' && quemContou(resultado, resultado.culpado!).map((de) => {
        const p = cabeca(porId[de]), q = cabeca(porId[resultado.culpado!]);
        const d = Math.hypot(q.x - p.x, q.y - p.y) || 1, ux = (q.x - p.x) / d, uy = (q.y - p.y) / d;
        const [x1, y1, x2, y2] = [p.x + ux * 30, p.y + uy * 30, q.x - ux * 36, q.y - uy * 36];
        const ang = (Math.atan2(uy, ux) * 180) / Math.PI;
        return (
          <g key={'fatal' + de} className="elo-fatal" aria-hidden="true">
            <line x1={x1} y1={y1} x2={x2} y2={y2} />
            <path d="M-6,-8 L5,0 L-6,8" transform={`translate(${x2} ${y2}) rotate(${ang})`} />
          </g>
        );
      })}

      {/* derrota por tamanho, ordem, padaria ou estrela sem notícia: plaquinha no pé do apartamento de quem importa */}
      {fim && explicacao && placasDa(explicacao).map((p) => {
        const v = porId[p.id];
        const x0 = v.pos[0] * L, y0 = v.pos[1] * L;
        return (
          <g key={'placa' + p.id} className={p.culpa ? 'placa-causa culpa' : 'placa-causa'} aria-hidden="true">
            <rect x={x0 + 6} y={y0 + L - 40} width={L - 12} height={24} rx={6} />
            {p.icones ? (
              <>
                <text x={x0 + 10} y={y0 + L - 27} className="curto">queria</text>
                <g transform={`translate(${x0 + 56} ${y0 + L - 28}) scale(0.5)`}><Boato tamanho={p.icones[0]} /></g>
                <text x={x0 + 67} y={y0 + L - 27} className="curto">veio</text>
                <g transform={`translate(${x0 + 101} ${y0 + L - 28}) scale(0.5)`}><Boato tamanho={p.icones[1]} /></g>
              </>
            ) : (
              <text x={x0 + L / 2} y={y0 + L - 27} className="meio">{p.texto}</text>
            )}
          </g>
        );
      })}

      {/* balões e botões de girar, sempre na camada de cima */}
      {fase.vizinhos.map((v) => {
        const x0 = v.pos[0] * L, y0 = v.pos[1] * L;
        const o = ouviuAte(v.id);
        const perdeu = fim && resultado.culpado === v.id;
        if (o && perdeu && v.tipo === 'assunto') {
          return (
            <g key={'b' + v.id} className="balao grito">
              <rect x={x0 + L - 80} y={y0 + 28} width={72} height={24} rx={12} />
              <text x={x0 + L - 44} y={y0 + 41}>QUÊ?!</text>
            </g>
          );
        }
        if (o) {
          return (
            // a animação do balão usa transform do CSS, então a posição fica num grupo de fora
            <g key={'b' + v.id} transform={`translate(${x0 + 86} ${y0 + 40}) scale(1.15)`}>
              <g className="balao"><Boato tamanho={o.tamanho} invertida={o.versao === 'invertida'} /></g>
            </g>
          );
        }
        if (montando && trilho && v.id === origem) {
          // antes de espalhar, quem você contou já mostra o tamanho com que o boato começa: cochicho
          return (
            <g key={'b' + v.id} transform={`translate(${x0 + 86} ${y0 + 40}) scale(1.15)`}>
              <g className="balao"><Boato tamanho={1} /></g>
            </g>
          );
        }
        if (montando && fase.giros > 0 && podeGirar(fase, v)) {
          return (
            <g key={'g' + v.id} className={semGiro && !setas[v.id] ? 'girar esgotado' : 'girar'}
              onClick={(e) => { e.stopPropagation(); props.aoGirar(v); }}>
              {/* canto de baixo à esquerda: o de cima à direita é o caminho das setas pra escada */}
              {/* menor e encostado no canto, fora do corpo do morador (no centro do apartamento) */}
              <circle cx={x0 + 17} cy={y0 + L - 22} r={12} />
              <g transform={`translate(${x0 + 17} ${y0 + L - 22}) scale(0.85)`}><Girar /></g>
            </g>
          );
        }
        return null;
      })}
    </g>
  );
}

// Tamanho do prédio em unidades do desenho (sem telhado, que sobe 46 acima do 0).
export const medidas = (fase: Fase) => ({
  largura: (Math.max(...fase.vizinhos.map((v) => v.pos[0])) + 1) * L,
  altura: (Math.max(...fase.vizinhos.map((v) => v.pos[1])) + 1) * L,
});
