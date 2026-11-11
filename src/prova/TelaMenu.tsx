// Prova: o menu como uma janela no prédio (elevador à esquerda, três andares, cada um uma situação).
import type { ReactNode } from 'react';
import { Cida, DonaGloria, Neide, Rita, SeuZe, TINTA } from './Moradores';
import { Botao, C, Placa, Txt } from './pecas';

const JX = 10, JW = 370, POCO = 54, TOPO = 172, ANDAR = 142, LAJE = 6;
const fy = (i: number) => TOPO + i * (ANDAR + LAJE); // i = 0 é o andar de cima

function Porta({ x, y, numero, cor = '#7E9C90' }: { x: number; y: number; numero: string; cor?: string }) {
  return (
    <g>
      <rect x={x - 4} y={y - 4} width={56} height={98} fill="#CFC3A6" stroke={TINTA} strokeWidth={2} />
      <rect x={x} y={y} width={48} height={94} fill={cor} stroke={TINTA} strokeWidth={2} />
      <rect x={x + 8} y={y + 10} width={32} height={30} fill="none" stroke={TINTA} strokeWidth={1.2} opacity={0.5} />
      <rect x={x + 8} y={y + 48} width={32} height={36} fill="none" stroke={TINTA} strokeWidth={1.2} opacity={0.5} />
      <circle cx={x + 40} cy={y + 50} r={2.6} fill={C.botao} stroke={TINTA} strokeWidth={1.2} />
      <rect x={x + 24 - (numero.length * 2.6 + 4)} y={y - 16} width={numero.length * 5.2 + 8} height={10} rx={2} fill={C.botao} stroke={TINTA} strokeWidth={1.2} />
      <Txt x={x + 24} y={y - 8} peso={700} tam={8} ancora="middle">{numero}</Txt>
    </g>
  );
}

// placa de andar no poço do elevador: número + visto (vencido) ou nada (trancado)
function NumeroAndar({ i, n, vencido }: { i: number; n: number; vencido?: boolean }) {
  const y = fy(i) + 24;
  return (
    <g>
      <rect x={JX + 8} y={y - 14} width={POCO - 16} height={22} rx={11} fill={C.papel} stroke={TINTA} strokeWidth={1.6} />
      <Txt x={JX + POCO / 2} y={y + 2} peso={700} tam={n > 99 ? 11 : 13} ancora="middle">{n}</Txt>
      {vencido && (
        <g transform={`translate(${JX + POCO - 8} ${y + 8})`}>
          <circle r={7} fill={C.seta} stroke={C.papel} strokeWidth={1.5} />
          <path d="M-3,0 l2,2.4 l4,-4.6" fill="none" stroke={C.papel} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
        </g>
      )}
    </g>
  );
}

function Corredor({ i, tom = '#EFE7D3', children }: { i: number; tom?: string; children?: ReactNode }) {
  const y = fy(i), x = JX + POCO;
  return (
    <g>
      <rect x={x} y={y} width={JW - POCO} height={ANDAR} fill={tom} />
      <rect x={x} y={y + ANDAR - 34} width={JW - POCO} height={34} fill="#000" opacity={0.035} />
      <rect x={x} y={y + ANDAR - 8} width={JW - POCO} height={8} fill="#C9BB98" />
      <path d={`M${x},${y + ANDAR - 8} h${JW - POCO}`} stroke={TINTA} strokeWidth={1.4} />
      {/* luminária do corredor */}
      <rect x={x + 150} y={y} width={26} height={7} fill="#F6E9B8" stroke={TINTA} strokeWidth={1.4} />
      {children}
    </g>
  );
}

// o elevador mora no andar atual: cabine com porta aberta e visor
function Elevador({ i, n }: { i: number; n: number }) {
  const y = fy(i);
  return (
    <g>
      <rect x={JX + 6} y={y + 30} width={POCO - 12} height={ANDAR - 30} fill="#E4D9BE" stroke={TINTA} strokeWidth={2} />
      <rect x={JX + 6} y={y + 30} width={9} height={ANDAR - 30} fill="#9FB3AA" stroke={TINTA} strokeWidth={1.4} />
      <rect x={JX + POCO - 15} y={y + 30} width={9} height={ANDAR - 30} fill="#9FB3AA" stroke={TINTA} strokeWidth={1.4} />
      <rect x={JX + 10} y={y + 6} width={POCO - 20} height={18} rx={2} fill={TINTA} />
      <Txt x={JX + POCO / 2} y={y + 20} peso={700} tam={13} ancora="middle" cor={C.botao}>{n}</Txt>
    </g>
  );
}

function Aviso() {
  return (
    <g>
      <rect x={18} y={80} width={354} height={80} rx={3} fill={C.metal} stroke={TINTA} strokeWidth={2} />
      <rect x={26} y={88} width={338} height={64} fill={C.papel} stroke={TINTA} strokeWidth={1.2} />
      <Txt x={38} y={104} peso={700} tam={10.5} esp={1.4} cor={C.vitima}>AVISO DA ADMINISTRAÇÃO</Txt>
      <Txt x={38} y={125} peso={700} tam={18}>PROIBIDO OUVIR</Txt>
      <Txt x={38} y={145} peso={700} tam={18}>ATRÁS DA PORTA.</Txt>
      {/* a resposta de um morador, colada por cima */}
      <g transform="rotate(5 300 128)">
        <rect x={254} y={104} width={98} height={46} fill={C.ouviu} stroke={TINTA} strokeWidth={1.4} />
        <rect x={286} y={98} width={34} height={11} fill="#FFFFFF" opacity={0.55} />
        <Txt x={303} y={124} peso={600} tam={15} ancora="middle">Na frente</Txt>
        <Txt x={303} y={142} peso={600} tam={15} ancora="middle">pode?</Txt>
      </g>
    </g>
  );
}

function Topo() {
  const cartao = (x: number) => (
    <g key={x}>
      <rect x={x} y={24} width={14} height={19} rx={2} fill={C.papel} stroke={TINTA} strokeWidth={1.5} />
      <path d={`M${x + 3},${30} h8 M${x + 3},${34} h8 M${x + 3},${38} h5`} stroke={TINTA} strokeWidth={1} />
    </g>
  );
  return (
    <g>
      <Txt x={18} y={46} patua tam={36}>Fofoca!</Txt>
      <Txt x={20} y={66} peso={700} tam={10.5} esp={1.6} cor="#3D564D">EDIFÍCIO PRIMAVERA</Txt>
      {[316, 334, 352].map(cartao)}
      <Txt x={370} y={60} peso={600} tam={11} ancora="end" cor="#3D564D">advertências</Txt>
    </g>
  );
}

type Cena = { n: number; estado: 'vencido' | 'atual' | 'trancado'; corpo: ReactNode };

export function TelaMenu({ alto = false }: { alto?: boolean }) {
  const n = alto ? 178 : 9;
  const cenas: Cena[] = alto
    ? [
        { n: 179, estado: 'trancado', corpo: null },
        { n: 178, estado: 'atual', corpo: null },
        { n: 177, estado: 'vencido', corpo: <g transform={`translate(170 ${fy(2) + ANDAR - 6}) scale(1.12)`}><Rita /></g> },
      ]
    : [
        { n: 10, estado: 'trancado', corpo: null },
        { n: 9, estado: 'atual', corpo: null },
        {
          n: 8, estado: 'vencido', corpo: (
            <g>
              <g transform={`translate(150 ${fy(2) + ANDAR - 6}) scale(1.12)`}><SeuZe /></g>
              {/* a cadeira reservada da Dona Glória */}
              <g transform={`translate(262 ${fy(2) + ANDAR - 6})`}>
                <rect x={-18} y={-30} width={36} height={6} fill={C.madeira} stroke={TINTA} strokeWidth={1.6} />
                <path d="M-15,-24 v22 M15,-24 v22 M15,-30 v-34" stroke={TINTA} strokeWidth={2.4} />
                <rect x={14} y={-66} width={6} height={36} fill={C.madeira} stroke={TINTA} strokeWidth={1.4} />
                <g transform="translate(0 -29)"><DonaGloria /></g>
                <rect x={10} y={-62} width={62} height={17} fill={C.papel} stroke={TINTA} strokeWidth={1.2} />
                <Txt x={41} y={-50} peso={700} tam={9} ancora="middle" esp={0.6}>RESERVADO</Txt>
              </g>
            </g>
          ),
        },
      ];
  return (
    <svg viewBox="0 0 390 844" className="prova-tela" role="img" aria-label={`Menu no andar ${n}`}>
      <rect width={390} height={844} fill={C.reboco} />
      <Topo />
      <Aviso />
      {/* a janela: o prédio em corte */}
      <rect x={JX - 4} y={TOPO - 8} width={JW + 8} height={3 * ANDAR + 3 * LAJE + 10} fill={TINTA} />
      <rect x={JX} y={TOPO} width={POCO} height={3 * ANDAR + 2 * LAJE} fill="#3A4F48" />
      <path d={`M${JX + 14},${TOPO} V${TOPO + 3 * ANDAR + 2 * LAJE} M${JX + POCO - 14},${TOPO} V${TOPO + 3 * ANDAR + 2 * LAJE}`} stroke="#56695F" strokeWidth={2} />
      {cenas.map((c, i) => (
        <g key={c.n}>
          <Corredor i={i} tom={c.estado === 'trancado' ? '#D3C8AC' : '#EFE7D3'}>
            {c.estado === 'trancado' && (
              <g>
                <Porta x={226} y={fy(i) + 40} numero={`${c.n}01`} cor="#8C9A8F" />
                {/* plaquinha de maçaneta: "Trancado" */}
                <g transform={`rotate(-6 266 ${fy(i) + 92})`}>
                  <path d={`M266,${fy(i) + 90} l-8,10 h16 Z`} fill="none" stroke={TINTA} strokeWidth={1.2} />
                  <rect x={240} y={fy(i) + 100} width={58} height={22} rx={3} fill={C.papel} stroke={TINTA} strokeWidth={1.4} />
                  <Txt x={269} y={fy(i) + 115} peso={700} tam={11} ancora="middle">Trancado</Txt>
                </g>
                <rect x={JX + POCO} y={fy(i)} width={JW - POCO} height={ANDAR} fill={TINTA} opacity={0.1} />
              </g>
            )}
            {c.estado === 'atual' && (
              <g>
                <Porta x={262} y={fy(i) + 40} numero={`${c.n}02`} />
                {/* tapete */}
                <rect x={252} y={fy(i) + ANDAR - 12} width={68} height={6} rx={2} fill="#A86B4F" stroke={TINTA} strokeWidth={1.2} />
                {/* som saindo pela porta */}
                <path d={`M256,${fy(i) + 66} q-6,6 0,12 M249,${fy(i) + 62} q-9,10 0,20`} fill="none" stroke={TINTA} strokeWidth={1.8} strokeLinecap="round" />
                <g transform={`translate(${alto ? 200 : 205} ${fy(i) + ANDAR - 6}) scale(1.12)`}>
                  {alto ? <Cida /> : <Neide pose="ouvindo" />}
                </g>
              </g>
            )}
            {c.corpo}
          </Corredor>
          {/* no andar atual quem mostra o número é o visor do elevador */}
          {c.estado === 'atual' ? <Elevador i={i} n={c.n} /> : <NumeroAndar i={i} n={c.n} vencido={c.estado === 'vencido'} />}
          {i < 2 && <rect x={JX} y={fy(i) + ANDAR} width={JW} height={LAJE} fill={TINTA} />}
        </g>
      ))}
      {/* placa do andar e o índice */}
      <Placa x={18} y={628} w={250} h={54}>
        <Txt x={32} y={649} peso={600} tam={12} cor="#D8D2C2">{n}º andar</Txt>
        <Txt x={32} y={672} patua tam={20} cor={C.papel}>{alto ? 'Recado na portaria' : 'Boato na medida'}</Txt>
      </Placa>
      <rect x={278} y={634} width={94} height={42} rx={6} fill={C.papel} stroke={TINTA} strokeWidth={2.2} />
      <Txt x={325} y={660} peso={700} tam={14} ancora="middle">Ver andares</Txt>
      <Botao x={18} y={704} w={354} h={62} texto={`Jogar · ${n}º andar`} tam={21} />
      {alto && <Indice />}
    </svg>
  );
}

// "Ver andares" aberto: dezenas numa faixa, os dez andares da dezena, e o botão de ir
function Indice() {
  const dezenas = ['141–150', '151–160', '161–170', '171–180'];
  return (
    <g>
      <rect width={390} height={844} fill={TINTA} opacity={0.45} />
      <rect x={0} y={430} width={390} height={430} rx={12} fill={C.papel} stroke={TINTA} strokeWidth={2.4} />
      <Txt x={22} y={468} patua tam={22}>Ver andares</Txt>
      <Txt x={368} y={466} peso={700} tam={15} ancora="end" cor={C.seta}>Fechar</Txt>
      {dezenas.map((d, k) => {
        const x = 18 + k * 89, atual = k === 3;
        return (
          <g key={d}>
            <rect x={x} y={486} width={83} height={34} rx={5} fill={atual ? TINTA : C.papel} stroke={TINTA} strokeWidth={1.8} />
            <Txt x={x + (atual ? 41.5 : 36)} y={508} peso={700} tam={13} ancora="middle" cor={atual ? C.papel : TINTA}>{d}</Txt>
            {!atual && <path d={`M${x + 66},${503} l3,3 l6,-7`} fill="none" stroke={C.seta} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />}
          </g>
        );
      })}
      {Array.from({ length: 10 }, (_, k) => {
        const n = 171 + k, x = 18 + (k % 5) * 72, y = 538 + Math.floor(k / 5) * 72;
        const vencido = n < 178, atual = n === 178;
        return (
          <g key={n}>
            <rect x={x} y={y} width={66} height={64} rx={5} fill={atual ? C.ouviu : vencido ? '#F3EBD8' : '#D3C8AC'} stroke={TINTA} strokeWidth={1.8} />
            {/* portinha */}
            <rect x={x + 24} y={y + 30} width={18} height={26} fill={vencido || atual ? '#7E9C90' : '#8C9A8F'} stroke={TINTA} strokeWidth={1.4} />
            <circle cx={x + 38} cy={y + 44} r={1.4} fill={TINTA} />
            <Txt x={x + 33} y={y + 22} peso={700} tam={15} ancora="middle" cor={vencido || atual ? TINTA : '#5C6E66'}>{n}</Txt>
            {vencido && <path d={`M${x + 48},${y + 44} l3,3 l7,-8`} fill="none" stroke={C.seta} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />}
            {atual && (
              <g stroke={C.seta} strokeWidth={4} fill="none" strokeLinecap="square">
                <path d={`M${x - 3},${y + 10} V${y - 3} H${x + 10}`} /><path d={`M${x + 56},${y - 3} H${x + 69} V${y + 10}`} />
                <path d={`M${x - 3},${y + 54} V${y + 67} H${x + 10}`} /><path d={`M${x + 56},${y + 67} H${x + 69} V${y + 54}`} />
              </g>
            )}
          </g>
        );
      })}
      <Botao x={18} y={706} w={354} h={58} texto="Ir ao andar 178" tam={20} />
    </g>
  );
}
