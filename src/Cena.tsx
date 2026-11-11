import { useEffect, useLayoutEffect, useRef, useState, type ComponentProps } from 'react';
import { A, Predio, medidas } from './Predio';
import { CENARIO, urlArte } from './arte';
import { precarregar } from './Personagem';

// A rua do prédio. O desenho envolve só o prédio (mais o telhado e a calçada), então ele ocupa
// todo o palco e o céu fica pouco — a Consulta 5 cortou o céu que ocupava meia tela.
// Bairro, calçada e rua transbordam pros lados e pra baixo (overflow visível): em tela larga
// o chão continua em vez de o prédio flutuar numa caixa; embaixo, o rodapé cobre a rua.
//
// Prédio alto (5–6 andares): se, encaixado inteiro, o cômodo ficaria menor que COMODO_MIN, o prédio fica
// na largura da tela e o palco ROLA na vertical; a câmera vai até onde a fofoca está (quem conta e quem
// ouve na batida, quem está selecionado, a vítima no fim). Prédio que cabe continua igual, sem rolagem.

const TOPO = 50; // caixa d'água
const BASE = 22; // calçada e meio-fio
const MIN = 400; // ⚠️ largura mínima: sem ela, um prédio de 2 colunas crescia até cada cômodo ter ~170 px
const L = 120; // largura de um cômodo (a mesma do Predio)
// ⚠️ Abaixo disso a arte ilustrada vira borrão (com 6 andares encaixados, o cômodo cairia pra ~76 px)
const COMODO_MIN = 100;
// ⚠️ Prédio que cabe: o telhado (caixa d'água, antena, varal) fica FORA da conta e sobe pra trás dos avisos.
// Ele é só enfeite e custava ~55 px; com isso, o prédio de 5 andares cabe inteiro num celular de 390×844.
const BEIRAL = 14; // o que do telhado ainda entra na conta (a beirada das telhas)

// Silhuetas dos prédios do bairro, sem detalhe para não disputar com o tabuleiro (altura em fração do prédio).
const FUNDO: [number, number, number][] = [
  [-620, 0.5, 90], [-520, 0.7, 70], [-430, 0.4, 60], [-350, 0.6, 80], [-250, 0.45, 50], [-180, 0.75, 90], [-70, 0.55, 60],
  [40, 0.65, 70], [120, 0.5, 60], [190, 0.7, 80], [280, 0.4, 70], [360, 0.6, 90], [470, 0.5, 60], [540, 0.7, 80], [640, 0.45, 70],
];

// Céu: nas fases pequenas (1 ou 2 andares) sobra tela em cima do prédio; umas nuvens lentas e o sol
// ocupam o vazio sem disputar com o tabuleiro. Ficam acima do desenho (overflow visível): em tela baixa somem.
function Nuvem({ x, y, s, dur, atraso }: { x: number; y: number; s: number; dur: number; atraso: number }) {
  return (
    <g className="nuvem" style={{ animationDuration: `${dur}s`, animationDelay: `${-atraso}s` }}>
      <path transform={`translate(${x} ${y}) scale(${s})`} d="M0,0 q4,-16 20,-12 q8,-14 24,-6 q14,-6 18,8 q12,2 8,10 h-74 q-6,-2 4,0 Z" />
    </g>
  );
}

// Escala do desenho (px por unidade) e se rola: puro, pra dar pra testar sem tela.
export function enquadrar(W: number, H: number, larguraPx: number, alturaPx: number) {
  const encaixa = Math.min(larguraPx / W, alturaPx / H);
  if (encaixa * L >= COMODO_MIN || larguraPx <= 0 || alturaPx <= 0) return { escala: encaixa, rola: false };
  // cômodo de pelo menos COMODO_MIN, sem passar da largura da tela
  return { escala: Math.max(encaixa, Math.min(larguraPx / W, COMODO_MIN / L)), rola: true };
}

export function Cena(props: ComponentProps<typeof Predio>) {
  const { largura, altura } = medidas(props.fase);
  const W = Math.max(largura + 36, MIN);
  const x0 = (W - largura) / 2;
  const topo = CENARIO ? 66 : TOPO; // o telhado ilustrado é mais alto que a caixa d'água
  const chao = topo + altura + 4;
  const H = chao + BASE;

  // o tamanho do palco, medido (muda ao girar o celular)
  const caixa = useRef<HTMLDivElement>(null);
  const [tela, setTela] = useState({ w: 0, h: 0 });
  useLayoutEffect(() => {
    const el = caixa.current;
    if (!el) return;
    const medir = () => setTela({ w: el.clientWidth, h: el.clientHeight });
    medir();
    const ro = new ResizeObserver(medir);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const y0 = topo - BEIRAL; // sem rolar, o desenho começa na beirada do telhado
  const cabe = enquadrar(W, H - y0, tela.w, tela.h);
  const { escala, rola } = cabe.rola ? enquadrar(W, H, tela.w, tela.h) : cabe;
  // todas as poses de quem está aqui, antes de alguém precisar trocar de pose
  useEffect(() => { precarregar(props.fase.vizinhos.map((v) => v.nome)); }, [props.fase]);

  // O palco começa logo abaixo dos avisos (medidos), em vez de uma faixa fixa de ~127 px.
  // ⚠️ Só cresce dentro da mesma fase: quando o NOVO ou a dica somem (ao espalhar), o prédio NÃO aumenta —
  // senão ele pulava bem na hora de ver o boato andar. Fase nova: mede de novo.
  const [abaixo, setAbaixo] = useState<number>();
  useLayoutEffect(() => {
    const el = caixa.current, avisos = el?.parentElement?.querySelector('.sobre-o-ceu');
    setAbaixo(undefined);
    if (!el || !avisos) return;
    const medir = () => {
      const fundo = avisos.getBoundingClientRect().bottom - el.parentElement!.getBoundingClientRect().top + 6;
      setAbaixo((antes) => Math.max(antes ?? 0, fundo));
    };
    medir();
    const ro = new ResizeObserver(medir);
    ro.observe(avisos);
    return () => ro.disconnect();
  }, [props.fase]);

  // A câmera: andares que importam agora (unidades do desenho → px).
  const { fase, resultado, batida, montando, origem, trilho } = props;
  const andarDe = (id?: string) => fase.vizinhos.find((v) => v.id === id)?.pos[1];
  let foco: number[] = [];
  if (montando) foco = [andarDe(trilho?.selecionado ?? origem)].filter((r): r is number => r !== undefined);
  else if (resultado && batida > resultado.batidas.length) foco = [andarDe(resultado.culpado)].filter((r): r is number => r !== undefined);
  else if (resultado && batida > 0) foco = (resultado.batidas[batida - 1] ?? []).flatMap((m) => [andarDe(m.de), andarDe(m.para)]).filter((r): r is number => r !== undefined);
  const chaveFoco = foco.length ? `${Math.min(...foco)}-${Math.max(...foco)}` : '';
  useEffect(() => {
    const el = caixa.current;
    if (!rola || !el || !foco.length) return;
    const cima = (topo + Math.min(...foco) * A - 8) * escala;
    const baixo = (topo + (Math.max(...foco) + 1) * A + 8) * escala;
    // só mexe se o que importa não está inteiro na tela (tocar num cômodo à vista não faz a tela pular)
    if (cima >= el.scrollTop && baixo <= el.scrollTop + el.clientHeight) return;
    const alvo = baixo - cima > el.clientHeight ? cima : (cima + baixo) / 2 - el.clientHeight / 2;
    el.scrollTo({ top: Math.max(0, alvo), behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }, [chaveFoco, rola, escala]);

  return (
    <div ref={caixa} className={rola ? 'tabuleiro rola' : 'tabuleiro'} style={abaixo !== undefined ? { top: Math.max(abaixo, 0) } : undefined}>
      {/* ⚠️ assentado na calçada (YMax): preso no alto, num prédio de 3 andares sobrava um bloco de asfalto
          embaixo; o que sobra fica de céu em cima, onde a dica aparece */}
      <svg viewBox={rola ? `0 0 ${W} ${H}` : `0 ${y0} ${W} ${H - y0}`} preserveAspectRatio="xMidYMax meet" role="img" aria-label="Prédio em corte com os vizinhos"
        style={rola ? { width: W * escala, height: H * escala } : undefined}>
        <g aria-hidden="true">
          {CENARIO && !rola && (
            <g>
              <Nuvem x={20} y={-30} s={1.1} dur={90} atraso={20} />
              <Nuvem x={180} y={-190} s={0.8} dur={120} atraso={70} />
              <Nuvem x={-80} y={-320} s={0.9} dur={140} atraso={40} />
              <Nuvem x={120} y={-440} s={0.7} dur={160} atraso={110} />
            </g>
          )}
          {CENARIO ? (
            // faixa ilustrada do bairro, repetida pros lados
            [-2, -1, 0, 1].map((k) => {
              const h = 110, w = (h * CENARIO!.bairro.w) / CENARIO!.bairro.h;
              return <image key={k} href={urlArte(CENARIO!.bairro.f)} x={W / 2 + k * w} y={chao - h} width={w} height={h} />;
            })
          ) : FUNDO.map(([fx, fh, fw]) => <rect key={fx} x={W / 2 + fx} y={chao - altura * fh} width={fw} height={altura * fh} className="bairro" />)}
          {/* calçada, meio-fio e rua, largos o bastante para qualquer tela */}
          <rect x={-1200} y={chao} width={W + 2400} height={16} className="calcada" />
          <rect x={-1200} y={chao + 16} width={W + 2400} height={6} className="meiofio" />
          <rect x={-1200} y={chao + 22} width={W + 2400} height={400} className="rua" />
          {/* poste */}
          <g className="poste">
            <rect x={x0 - 30} y={chao - 150} width={6} height={150} />
            <path d={`M${x0 - 27},${chao - 150} q0,-14 18,-12`} fill="none" />
            <ellipse cx={x0 - 8} cy={chao - 160} rx={9} ry={5} className="lampada" />
          </g>
        </g>
        <g transform={`translate(${x0} ${topo})`}>
          <Predio {...props} />
        </g>
      </svg>
    </div>
  );
}
