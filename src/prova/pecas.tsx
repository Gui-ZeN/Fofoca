// Peças comuns da prova: paleta, tipos, botão físico, selos de papel e balões por tamanho.
import { useLayoutEffect, useRef, type ReactNode } from 'react';

export const C = {
  tinta: '#283C36', reboco: '#E8DFC9', papel: '#FBF4E5', pastilha: '#90ABA0', botao: '#E5B74F',
  ouviu: '#F0D58B', seta: '#245A73', vitima: '#A53D3D', ceu: '#C7DAD5',
  metal: '#6F8E83', madeira: '#B98F62', sombraReboco: '#D6CCB4', vazio: '#B4AA94',
};
export const PATUA = "'Patua One', Georgia, serif";
export const ASAP = "Asap, 'Segoe UI', sans-serif";

type PropsTxt = {
  x: number; y: number; patua?: boolean; peso?: 400 | 600 | 700; tam?: number; cor?: string;
  ancora?: 'start' | 'middle' | 'end'; esp?: number; rot?: number; children: ReactNode;
};
export function Txt({ x, y, patua, peso = 600, tam = 15, cor = C.tinta, ancora = 'start', esp, rot, children }: PropsTxt) {
  return (
    <text x={x} y={y} fontFamily={patua ? PATUA : ASAP} fontWeight={patua ? 400 : peso} fontSize={tam} fill={cor}
      textAnchor={ancora} letterSpacing={esp} transform={rot ? `rotate(${rot} ${x} ${y})` : undefined}>
      {children}
    </text>
  );
}

// texto que informa a própria largura (mede de novo quando a fonte chega).
// ⚠️ substitui o `nome.length * 7.6` do jogo: chute por caractere quebra com fonte nova e com tradução.
export function TxtMedido({ aoMedir, ...props }: PropsTxt & { aoMedir: (largura: number) => void }) {
  const ref = useRef<SVGTextElement>(null);
  useLayoutEffect(() => {
    const medir = () => { if (ref.current) aoMedir(ref.current.getComputedTextLength()); };
    medir();
    document.fonts.ready.then(medir);
  }, [props.children, aoMedir]);
  return (
    <text ref={ref} x={props.x} y={props.y} fontFamily={props.patua ? PATUA : ASAP} fontWeight={props.patua ? 400 : props.peso ?? 600}
      fontSize={props.tam ?? 15} fill={props.cor ?? C.tinta}>{props.children}</text>
  );
}

// botão retangular com bloco de sombra: parece que afunda quando aperta
export function Botao({ x, y, w, h, texto, cor = C.botao, tam = 19, sombra = 5 }: {
  x: number; y: number; w: number; h: number; texto: string; cor?: string; tam?: number; sombra?: number;
}) {
  return (
    <g>
      <rect x={x} y={y + sombra} width={w} height={h} rx={7} fill={C.tinta} />
      <rect x={x} y={y} width={w} height={h} rx={7} fill={cor} stroke={C.tinta} strokeWidth={2.4} />
      <Txt x={x + w / 2} y={y + h / 2 + tam * 0.36} peso={700} tam={tam} ancora="middle">{texto}</Txt>
    </g>
  );
}

// placa esmaltada (tinta com letra de papel) com parafusos
export function Placa({ x, y, w, h, children }: { x: number; y: number; w: number; h: number; children: ReactNode }) {
  const p = (px: number, py: number) => <circle cx={px} cy={py} r={1.8} fill={C.pastilha} />;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={4} fill={C.tinta} />
      <rect x={x + 3} y={y + 3} width={w - 6} height={h - 6} rx={2.5} fill="none" stroke={C.pastilha} strokeWidth={1} />
      {p(x + 8, y + 8)}{p(x + w - 8, y + 8)}{p(x + 8, y + h - 8)}{p(x + w - 8, y + h - 8)}
      {children}
    </g>
  );
}

// ---------- selos por papel (forma, não só cor) ----------
// origem: balão de fala
export const SeloOrigem = ({ x, y, s = 1 }: { x: number; y: number; s?: number }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M-5,6.9 L-9,12 L0.5,8 A10,8 0 1 0 -5,6.9 Z" fill={C.botao} stroke={C.tinta} strokeWidth={1.8} strokeLinejoin="round" />
    <circle cx={-4} cy={0} r={1.4} fill={C.tinta} /><circle cx={0} cy={0} r={1.4} fill={C.tinta} /><circle cx={4} cy={0} r={1.4} fill={C.tinta} />
  </g>
);
const oct = Array.from({ length: 8 }, (_, k) => {
  const a = (Math.PI / 4) * k + Math.PI / 8;
  return `${(10 * Math.cos(a)).toFixed(2)},${(10 * Math.sin(a)).toFixed(2)}`;
}).join(' ');
// vítima: octógono com "!"
export const SeloVitima = ({ x, y, s = 1 }: { x: number; y: number; s?: number }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <polygon points={oct} fill={C.vitima} stroke={C.tinta} strokeWidth={1.6} strokeLinejoin="round" />
    <rect x={-1.6} y={-6} width={3.2} height={7.5} rx={1.4} fill={C.papel} />
    <circle cx={0} cy={4.4} r={1.7} fill={C.papel} />
  </g>
);
const estrela = Array.from({ length: 10 }, (_, k) => {
  const a = (Math.PI / 5) * k - Math.PI / 2, r = k % 2 ? 4.6 : 10.5;
  return `${(r * Math.cos(a)).toFixed(2)},${(r * Math.sin(a) + 1).toFixed(2)}`;
}).join(' ');
export const SeloEstrela = ({ x, y, s = 1 }: { x: number; y: number; s?: number }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <polygon points={estrela} fill={C.botao} stroke={C.tinta} strokeWidth={1.8} strokeLinejoin="round" />
  </g>
);

// ---------- balão por tamanho: cochicho achatado e pontilhado, fofoca redonda, escândalo pontudo ----------
export type Tam = 1 | 2 | 3;
const ponta = Array.from({ length: 14 }, (_, k) => {
  const a = (Math.PI / 7) * k, r = k % 2 ? 7 : 11.5;
  return `${(r * 1.15 * Math.cos(a)).toFixed(2)},${(r * 0.85 * Math.sin(a)).toFixed(2)}`;
}).join(' ');
export const Balao = ({ x, y, t, s = 1 }: { x: number; y: number; t: Tam; s?: number }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} stroke={C.tinta} strokeLinejoin="round">
    {t === 1 && <rect x={-11} y={-5} width={22} height={10} rx={5} fill={C.papel} strokeWidth={1.6} strokeDasharray="1.5 2.4" strokeLinecap="round" />}
    {t === 2 && <path d="M-5,6.9 L-8,11 L0.5,8 A11,8 0 1 0 -5,6.9 Z" fill={C.papel} strokeWidth={1.8} />}
    {t === 3 && <polygon points={ponta} fill={C.papel} strokeWidth={1.6} />}
  </g>
);
