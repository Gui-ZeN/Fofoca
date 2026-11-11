// Prova: fase 3×4 montando (origem, vítima, estrela, seleção, destinos e passagens juntos) e a derrota dela.
import { useState, type ReactNode } from 'react';
import { Ana, Cida, Davi, DonaGloria, Edu, Lia, Lu, Neide, Rita, SeuZe, TINTA } from './Moradores';
import { Balao, Botao, C, SeloEstrela, SeloOrigem, SeloVitima, Txt, TxtMedido, type Tam } from './pecas';

const X0 = 12, Y0 = 204, LA = 122, AL = 136;
const ax = (c: number) => X0 + c * LA;
const ay = (r: number) => Y0 + r * AL;
type P = [number, number]; // [andar de cima pra baixo, coluna]

type Morador = { nome: string; em: P; corpo: (derrota: boolean) => ReactNode; papel?: 'origem' | 'vitima' | 'estrela'; quer?: Tam };
const MORADORES: Morador[] = [
  { nome: 'Edu', em: [0, 0], corpo: () => <Edu /> },
  { nome: 'Lia', em: [0, 1], corpo: () => <Lia /> },
  { nome: 'Cida', em: [0, 2], corpo: () => <Cida />, papel: 'origem' },
  { nome: 'Davi', em: [1, 0], corpo: () => <Davi /> },
  { nome: 'Seu Zé', em: [1, 1], corpo: (d) => <SeuZe pose={d ? 'que' : 'espera'} />, papel: 'vitima' },
  { nome: 'Neide', em: [1, 2], corpo: (d) => <Neide pose={d ? 'que' : 'espera'} lado={-1} /> },
  { nome: 'Rita', em: [2, 0], corpo: () => <Rita /> },
  { nome: 'Lu', em: [2, 1], corpo: () => <Lu /> },
  { nome: 'Ana', em: [3, 0], corpo: () => <Ana />, papel: 'estrela', quer: 2 },
];
const PORTAS: [P, P][] = [[[0, 0], [0, 1]], [[0, 1], [0, 2]], [[1, 0], [1, 1]], [[1, 1], [1, 2]], [[2, 0], [2, 1]]];
const ESCADAS: [P, P][] = [[[0, 0], [1, 0]], [[1, 0], [2, 0]], [[2, 0], [3, 0]], [[0, 2], [1, 2]], [[1, 1], [2, 1]]];

const igual = (a: P, b: P) => a[0] === b[0] && a[1] === b[1];

// porta: a parede some e os dois cômodos se encontram (cada metade com a cor do seu lado),
// batente de madeira em volta e a folha aberta pra dentro do vizinho
function Porta({ a, cor }: { a: P; cor: (p: P) => string }) {
  const wx = ax(a[1] + 1), gy = ay(a[0]) + 54, gb = ay(a[0]) + AL - 4;
  return (
    <g>
      <rect x={wx - 5} y={gy} width={5} height={gb - gy} fill={cor(a)} />
      <rect x={wx} y={gy} width={5} height={gb - gy} fill={cor([a[0], a[1] + 1])} />
      <path d={`M${wx - 6},${gb} V${gy - 1} H${wx + 6} V${gb}`} fill="none" stroke={C.madeira} strokeWidth={3} />
      <path d={`M${wx - 7.5},${gb} V${gy - 2.5} H${wx + 7.5} V${gb}`} fill="none" stroke={TINTA} strokeWidth={1.2} />
      <polygon points={`${wx + 6},${gy + 1} ${wx + 18},${gy + 6} ${wx + 18},${gb - 4} ${wx + 6},${gb}`} fill={C.madeira} stroke={TINTA} strokeWidth={1.6} strokeLinejoin="round" />
      <path d={`M${wx + 9},${gy + 10} l6,2.5 v22 l-6,-2.5 Z`} fill="none" stroke={TINTA} strokeWidth={1} opacity={0.45} />
      <circle cx={wx + 15} cy={(gy + gb) / 2 + 6} r={1.6} fill={TINTA} />
    </g>
  );
}
// escada: um lance de verdade, do chão de baixo até o buraco na laje; fica no fundo, atrás do morador
function Escada({ a, cor }: { a: P; cor: (p: P) => string }) {
  const baixo: P = [a[0] + 1, a[1]];
  const dir = ax(a[1]) + LA - 4, chao = ay(baixo[0]) + AL - 4, topo = ay(baixo[0]) - 4;
  const n = 11, degrau = (chao - topo) / n, passo = 6;
  const x0 = dir - n * passo;
  let d = `M${x0},${chao}`;
  for (let i = 0; i < n; i++) d += ` v${-degrau} h${passo}`;
  d += ` V${chao} Z`;
  return (
    <g>
      <rect x={dir - 3 * passo - 2} y={topo} width={3 * passo + 2} height={8} fill={cor(baixo)} />
      <path d={d} fill={TINTA} fillOpacity={0.09} stroke={TINTA} strokeOpacity={0.5} strokeWidth={1.4} strokeLinejoin="round" />
      {/* corrimão */}
      <path d={`M${x0 + 2},${chao - 24} L${dir - 2},${topo - 22}`} stroke={TINTA} strokeOpacity={0.55} strokeWidth={1.6} strokeLinecap="round" />
      <path d={`M${dir - 3 * passo - 2},${topo} v-16 M${dir - 2},${topo} v-22`} stroke={TINTA} strokeOpacity={0.55} strokeWidth={1.6} />
    </g>
  );
}

function Seta({ de, para, fatal }: { de: P; para: P; fatal?: boolean }) {
  const cor = fatal ? C.vitima : C.seta;
  let x1: number, y1: number, x2: number, y2: number;
  if (de[0] === para[0]) {
    const dir = Math.sign(para[1] - de[1]);
    y1 = y2 = ay(de[0]) + 98;
    x1 = ax(de[1]) + 64 + dir * 28; x2 = ax(para[1]) + 64 - dir * 30;
  } else {
    // desce pela escada, longe do rosto de quem ouve
    x1 = x2 = ax(de[1]) + LA - 13;
    y1 = ay(de[0]) + 96; y2 = ay(para[0]) + 44;
  }
  const ang = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={C.papel} strokeWidth={10} strokeLinecap="round" />
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={cor} strokeWidth={4.5} strokeLinecap="round" />
      <polygon points="0,0 -11,-8 -8,0 -11,8" transform={`translate(${x2} ${y2}) rotate(${ang})`} fill={cor} stroke={C.papel} strokeWidth={1.5} strokeLinejoin="round" />
    </g>
  );
}

function Plaquinha({ m }: { m: Morador }) {
  const x = ax(m.em[1]) + 8, y = ay(m.em[0]) + 8;
  const selo = m.papel ? 21 : 0, quer = m.quer ? 26 : 0;
  const [nome, setNome] = useState(0);
  const w = 12 + selo + nome + quer;
  return (
    <g>
      <rect x={x} y={y} width={w} height={22} rx={3} fill={C.papel} stroke={TINTA} strokeWidth={1.6} />
      {m.papel === 'origem' && <SeloOrigem x={x + 13} y={y + 10} s={0.82} />}
      {m.papel === 'vitima' && <SeloVitima x={x + 12} y={y + 11} s={0.82} />}
      {m.papel === 'estrela' && <SeloEstrela x={x + 12} y={y + 11} s={0.82} />}
      <TxtMedido x={x + 6 + selo} y={y + 16} peso={700} tam={13} aoMedir={setNome}>{m.nome}</TxtMedido>
      {m.quer && <Balao x={x + w - 15} y={y + 11} t={m.quer} s={0.75} />}
    </g>
  );
}

function Cantoneiras({ a }: { a: P }) {
  const x = ax(a[1]) + 3, y = ay(a[0]) + 3, w = LA - 6, h = AL - 6, l = 18;
  const s = { stroke: C.seta, strokeWidth: 5, fill: 'none', strokeLinecap: 'square' as const };
  return (
    <g>
      <path d={`M${x},${y + l} V${y} H${x + l}`} {...s} />
      <path d={`M${x + w - l},${y} H${x + w} V${y + l}`} {...s} />
      <path d={`M${x},${y + h - l} V${y + h} H${x + l}`} {...s} />
      <path d={`M${x + w - l},${y + h} H${x + w} V${y + h - l}`} {...s} />
    </g>
  );
}

function Vazio({ a, tipo }: { a: P; tipo: 'gloria' | 'janela' | 'caixas' }) {
  const x = ax(a[1]), y = ay(a[0]);
  return (
    <g>
      {tipo === 'janela' && (
        <g>
          <rect x={x + 40} y={y + 34} width={42} height={36} fill="#3E5A66" stroke={TINTA} strokeWidth={2} />
          <circle cx={x + 70} cy={y + 46} r={5} fill={C.papel} /><circle cx={x + 72} cy={y + 44} r={4.5} fill="#3E5A66" />
          <path d={`M${x + 61},${y + 34} v36 M${x + 40},${y + 52} h42`} stroke={TINTA} strokeWidth={1.6} />
        </g>
      )}
      {tipo === 'caixas' && (
        <g stroke={TINTA} strokeWidth={1.6} fill="#C9A26E">
          <rect x={x + 22} y={y + 98} width={30} height={30} /><rect x={x + 54} y={y + 108} width={22} height={20} /><rect x={x + 28} y={y + 76} width={22} height={22} />
          <path d={`M${x + 37},${y + 98} v30 M${x + 65},${y + 108} v20 M${x + 39},${y + 76} v22`} />
        </g>
      )}
      {tipo === 'gloria' && (
        <g>
          <rect x={x + 44} y={y + 100} width={36} height={6} fill={C.madeira} stroke={TINTA} strokeWidth={1.6} />
          <path d={`M${x + 48},${y + 106} v22 M${x + 76},${y + 106} v22`} stroke={TINTA} strokeWidth={2.4} />
          <g transform={`translate(${x + 62} ${y + 101})`}><DonaGloria /></g>
        </g>
      )}
    </g>
  );
}

// "QUÊ?!" em letras soltas que furam a laje
function Que({ x, y }: { x: number; y: number }) {
  const letras: [string, number, number, number][] = [['Q', 0, 4, -14], ['U', 20, -6, -5], ['Ê', 39, -10, 5], ['?', 59, -6, 13], ['!', 74, 2, 20]];
  return (
    <g>
      <path d={`M${x - 10},${y - 2} l-7,-6 M${x - 8},${y + 12} l-9,1 M${x + 92},${y + 2} l8,-6 M${x + 92},${y + 16} l9,0`} stroke={TINTA} strokeWidth={2.4} strokeLinecap="round" />
      {letras.map(([l, dx, dy, r]) => (
        <text key={l} x={x + dx} y={y + dy} fontFamily="'Patua One', Georgia, serif" fontSize={29} fill={C.vitima}
          stroke={C.papel} strokeWidth={5} paintOrder="stroke" strokeLinejoin="round" transform={`rotate(${r} ${x + dx + 8} ${y + dy - 10})`}>{l}</text>
      ))}
    </g>
  );
}

function Carimbo({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(-8)`} opacity={0.92}>
      <rect x={-56} y={-24} width={112} height={48} rx={4} fill="none" stroke={C.vitima} strokeWidth={2.6} />
      <rect x={-51} y={-19} width={102} height={38} rx={2} fill="none" stroke={C.vitima} strokeWidth={1.2} />
      <Txt x={0} y={-2} peso={700} tam={13} cor={C.vitima} ancora="middle" esp={1.2}>ADVERTÊNCIA</Txt>
      <Txt x={0} y={13} peso={600} tam={11} cor={C.vitima} ancora="middle">1 de 3 · o síndico</Txt>
    </g>
  );
}

function Fundo() {
  return (
    <g>
      <rect width={390} height={844} fill={C.ceu} />
      <g fill="#B5CBC5">
        <rect x={-10} y={420} width={40} height={340} /><rect x={362} y={360} width={40} height={400} />
      </g>
      <rect y={752} width={390} height={12} fill="#D9CFB8" />
      <rect y={764} width={390} height={80} fill="#34473F" />
    </g>
  );
}

function Cabecalho({ setas, dica }: { setas: string; dica?: string }) {
  return (
    <g>
      <rect x={12} y={17} width={46} height={44} rx={6} fill={TINTA} />
      <rect x={12} y={14} width={46} height={44} rx={6} fill={C.papel} stroke={TINTA} strokeWidth={2.4} />
      <path d="M24,37 L35,27 L46,37 M28,35 V47 H42 V35" fill="none" stroke={TINTA} strokeWidth={2.4} strokeLinejoin="round" strokeLinecap="round" />
      <rect x={332} y={14} width={46} height={44} rx={6} fill="none" stroke="#7E948C" strokeWidth={2} />
      <path d="M351,28 l8,8 l-8,8" fill="none" stroke="#7E948C" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
      <Txt x={195} y={30} peso={600} tam={13} ancora="middle" cor="#3D564D">21º andar</Txt>
      <Txt x={195} y={56} patua tam={25} ancora="middle">Corredor de cima</Txt>
      {/* o boato, com o selo de origem */}
      <rect x={34} y={70} width={322} height={36} rx={4} fill={C.papel} stroke={TINTA} strokeWidth={2.4} />
      <SeloOrigem x={56} y={87} />
      <Txt x={74} y={93} peso={600} tam={15}>O Seu Zé tem medo de pombo</Txt>
      <Balao x={334} y={88} t={2} s={0.9} />
      <rect x={150} y={114} width={90} height={26} rx={3} fill={C.seta} />
      <Txt x={195} y={132} peso={700} tam={14} ancora="middle" cor={C.papel}>{setas}</Txt>
      {dica && <Txt x={195} y={164} peso={600} tam={14.5} ancora="middle">{dica}</Txt>}
    </g>
  );
}

export function TelaFase({ derrota = false }: { derrota?: boolean }) {
  const ouviram: P[] = derrota ? [[0, 2], [1, 2]] : [[0, 2], [0, 1], [0, 0]];
  const vazios: [P, 'gloria' | 'janela' | 'caixas'][] = [[[2, 2], 'gloria'], [[3, 1], 'janela'], [[3, 2], 'caixas']];
  const corDe = (p: P) => {
    if (vazios.some(([v]) => igual(v, p))) return C.vazio;
    if (derrota && igual(p, [1, 1])) return '#E8B4AA';
    return ouviram.some((o) => igual(o, p)) ? C.ouviu : C.papel;
  };
  const celulas: P[] = [];
  for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) celulas.push([r, c]);
  return (
    <svg viewBox="0 0 390 844" className="prova-tela" role="img" aria-label={derrota ? 'Derrota da fase' : 'Fase 3 por 4'}>
      <Fundo />
      <Cabecalho setas={derrota ? 'Setas 1/5' : 'Setas 2/5'} dica={derrota ? undefined : 'Edu vai contar. Toque em quem vai ouvir.'} />
      {/* caixa d'água no telhado */}
      <g stroke={TINTA} strokeWidth={2}>
        <rect x={300} y={174} width={50} height={20} fill="#8FA7B0" />
        <rect x={296} y={170} width={58} height={6} fill="#7A919A" />
      </g>
      {/* estrutura (lajes e paredes em corte) */}
      <rect x={X0 - 6} y={Y0 - 12} width={3 * LA + 12} height={4 * AL + 16} fill={TINTA} />
      {celulas.map((p) => (
        <g key={p.join()}>
          <rect x={ax(p[1]) + 4} y={ay(p[0]) + 4} width={LA - 8} height={AL - 8} fill={corDe(p)} />
          <rect x={ax(p[1]) + 4} y={ay(p[0]) + AL - 10} width={LA - 8} height={6} fill="#000" opacity={0.07} />
        </g>
      ))}
      {vazios.map(([p, t]) => <Vazio key={p.join()} a={p} tipo={t} />)}
      {PORTAS.map(([a]) => <Porta key={a.join()} a={a} cor={corDe} />)}
      {ESCADAS.map(([a]) => <Escada key={a.join()} a={a} cor={corDe} />)}
      {!derrota && <rect x={ax(0) + 9} y={ay(1) + 9} width={LA - 18} height={AL - 18} fill="none" stroke={C.seta} strokeWidth={1.8} strokeDasharray="6 4" />}
      {MORADORES.map((m) => (
        <g key={m.nome} transform={`translate(${ax(m.em[1]) + 64} ${ay(m.em[0]) + AL - 8}) scale(1.08)`}>{m.corpo(derrota)}</g>
      ))}
      {derrota ? (
        <>
          <Seta de={[0, 2]} para={[1, 2]} />
          <Seta de={[1, 2]} para={[1, 1]} fatal />
        </>
      ) : (
        <>
          <Seta de={[0, 2]} para={[0, 1]} />
          <Seta de={[0, 1]} para={[0, 0]} />
        </>
      )}
      {MORADORES.map((m) => <Plaquinha key={m.nome} m={m} />)}
      {!derrota && <Cantoneiras a={[0, 0]} />}
      {derrota && <Que x={ax(1) + 18} y={ay(1) - 4} />}
      {derrota ? (
        <g>
          <rect x={10} y={612} width={370} height={250} rx={10} fill={TINTA} />
          <rect x={10} y={606} width={370} height={250} rx={10} fill={C.papel} stroke={TINTA} strokeWidth={2.4} />
          <SeloVitima x={34} y={642} s={1.1} />
          <Txt x={52} y={650} patua tam={21}>Neide contou pro Seu Zé.</Txt>
          <Txt x={28} y={680} peso={400} tam={16}>Agora ele sabe que estão falando dele.</Txt>
          <Txt x={28} y={712} peso={700} tam={15}>Neide:</Txt>
          <Txt x={82} y={712} peso={400} tam={15}>“Eu ia te contar por último.”</Txt>
          <Carimbo x={318} y={604} />
          <Botao x={28} y={744} w={334} h={54} texto="Tentar de novo" />
        </g>
      ) : (
        <g>
          <rect x={20} y={780} width={130} height={48} rx={7} fill={C.papel} stroke={TINTA} strokeWidth={2.4} />
          <Txt x={85} y={810} peso={700} tam={17} ancora="middle">Desfazer</Txt>
          <Botao x={162} y={777} w={208} h={50} texto="Espalhar!" tam={20} />
        </g>
      )}
    </svg>
  );
}
