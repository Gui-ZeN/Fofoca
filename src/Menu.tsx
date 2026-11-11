import { useEffect, useRef, useState, type ReactNode } from 'react';
import { MAX, relogio } from './advertencias';
import { Cartao } from './Icones';
import { DonaGloria, Personagem, type Expressao } from './Personagem';
import type { Tipo, Vizinho } from './motor';
import { capituloDe, estrelas, type Capitulo } from './capitulos';
import { ARTE, CENARIO, urlArte } from './arte';
import { aplicarMovimento, armazemDoNavegador, gravarAjustes, lerAjustes, type Ajustes as ValoresAjustes } from './ajustes';

declare const __VERSAO__: string; // vite.config: commit no GitHub, "local" no computador

export interface Vidas { restam: number; falta?: number; gastar: () => number }

// Os cartões mostram as advertências RECEBIDAS (papel vermelho); 3 recebidas = suspenso até o síndico tirar uma.
export function CartoesAdvertencia({ restam }: { restam: number }) {
  const recebidas = MAX - restam;
  return (
    <span className="cartoes" aria-label={`${recebidas} de ${MAX} advertências do síndico`}>
      {Array.from({ length: MAX }, (_, i) => <Cartao key={i} recebido={i < recebidas} />)}
    </span>
  );
}

// O aviso do síndico e a resposta de um morador (bíblia do humor, Consulta 5): um por vez.
// A piada nunca é aparência, idade, gênero, doença; e nunca toma o lugar de uma instrução.
const AVISOS: [string, string][] = [
  ['PROIBIDO OUVIR ATRÁS DA PORTA.', 'Na frente pode?'],
  ['A REUNIÃO SERÁ BREVE.', 'Trouxe o jantar.'],
  ['ASSUNTO ENCERRADO.', 'Qual assunto?'],
  ['A PLANTA NÃO TEM DIREITO A VOTO.', 'Ela pediu a palavra.'],
  ['FAVOR NÃO COMENTAR ESTE AVISO.', 'Comentaram.'],
];
function avisoDo(liberada: number, vidas?: Vidas): [string, string] {
  if (vidas && vidas.restam <= 0) return ['MORADOR SUSPENSO.', 'Até quando?'];
  if (vidas && vidas.restam < MAX) return ['TRÊS ADVERTÊNCIAS = SUSPENSÃO.', 'E quatro?'];
  return AVISOS[liberada % AVISOS.length];
}

// ---------- a janela: três andares do prédio em corte, elevador à esquerda ----------
const T = ARTE ? '#2B1E16' : '#283C36'; // arte ilustrada: tinta marrom, como a ilustração
const JW = 370, POCO = 54, ANDAR = 142, LAJE = 6;
const fy = (i: number) => i * (ANDAR + LAJE); // i = 0 é o andar de cima da janela
const gente = (nome: string, tipo: Tipo = 'comum') => ({ id: nome, nome, tipo, pos: [0, 0] }) as Vizinho;
const morador = (nome: string, x: number, y: number, e: Expressao = 'neutro', tipo?: Tipo) =>
  <Personagem v={gente(nome, tipo)} expressao={e} x={x} y={y} escala={1.08} />;

function Porta({ x, y, numero, trancada }: { x: number; y: number; numero: string; trancada?: boolean }) {
  return (
    <g>
      <rect x={x - 4} y={y - 4} width={56} height={98} fill={ARTE ? '#8A5A3B' : '#CFC3A6'} stroke={T} strokeWidth={2} />
      <rect x={x} y={y} width={48} height={94} fill={ARTE ? (trancada ? '#7A5A42' : '#B98552') : trancada ? '#8C9A8F' : '#7E9C90'} stroke={T} strokeWidth={2} />
      <rect x={x + 8} y={y + 10} width={32} height={30} fill="none" stroke={T} strokeWidth={1.2} opacity={0.5} />
      <rect x={x + 8} y={y + 48} width={32} height={36} fill="none" stroke={T} strokeWidth={1.2} opacity={0.5} />
      <circle cx={x + 40} cy={y + 50} r={2.6} fill="#E5B74F" stroke={T} strokeWidth={1.2} />
      <rect x={x + 24 - (numero.length * 2.8 + 4)} y={y - 16} width={numero.length * 5.6 + 8} height={11} rx={2} fill="#E5B74F" stroke={T} strokeWidth={1.2} />
      <text x={x + 24} y={y - 7.5} className="porta-num">{numero}</text>
    </g>
  );
}

// uma situação por andar já feito (o elenco fixo, cada um no seu canto)
const CENAS: ((chao: number) => ReactNode)[] = [
  (chao) => (
    <g>
      {morador('Seu Zé', 150, chao, 'neutro', 'assunto')}
      {/* a cadeira reservada da Dona Glória */}
      <g transform={`translate(262 ${chao})`}>
        <rect x={-18} y={-30} width={36} height={6} fill="#B98F62" stroke={T} strokeWidth={1.6} />
        <path d="M-15,-24 v22 M15,-24 v22 M15,-30 v-34" stroke={T} strokeWidth={2.4} />
        <rect x={14} y={-66} width={6} height={36} fill="#B98F62" stroke={T} strokeWidth={1.4} />
        <g transform="translate(0 -29)"><DonaGloria /></g>
        <rect x={10} y={-62} width={62} height={17} fill="#FBF4E5" stroke={T} strokeWidth={1.2} />
        <text x={41} y={-50} className="reservado">RESERVADO</text>
      </g>
    </g>
  ),
  (chao) => <g><Porta x={250} y={chao - 98} numero="02" />{morador('Rita', 160, chao)}</g>,
  (chao) => <g><Porta x={110} y={chao - 98} numero="01" />{morador('Davi', 250, chao)}</g>,
  (chao) => <g>{morador('Cida', 170, chao)}<g transform={`translate(262 ${chao})`}><DonaGloria /></g></g>,
  (chao) => <g><Porta x={240} y={chao - 98} numero="03" />{morador('Bia', 170, chao)}</g>,
  (chao) => <g><Porta x={110} y={chao - 98} numero="04" />{morador('Rui', 250, chao)}</g>,
  (chao) => <g><Porta x={250} y={chao - 98} numero="02" />{morador('Lia', 160, chao)}</g>,
  (chao) => <g><Porta x={110} y={chao - 98} numero="01" />{morador('Edu', 250, chao)}</g>,
];

// térreo: a portaria, com o Seu Zé no balcão e o cobogó no fundo (o cobogó só mora aqui: nas passagens
// do jogo ele prometeria uma regra que não existe)
function Portaria({ y }: { y: number }) {
  const x = POCO, chao = y + ANDAR - 6;
  return (
    <g>
      <rect x={x} y={y} width={JW - POCO} height={ANDAR} fill="#E4D6BC" />
      <g fill="none" stroke="#C9B994" strokeWidth={2}>
        {Array.from({ length: 4 }, (_, r) => Array.from({ length: 11 }, (_, c) => (
          <g key={`${r},${c}`}>
            <rect x={x + 8 + c * 28} y={y + 8 + r * 28} width={24} height={24} />
            <circle cx={x + 20 + c * 28} cy={y + 20 + r * 28} r={7} />
          </g>
        )))}
      </g>
      <rect x={x} y={y + ANDAR - 8} width={JW - POCO} height={8} fill="#C9BB98" />
      {morador('Seu Zé', 168, chao, 'neutro', 'assunto')}
      {/* balcão na frente das pernas */}
      <rect x={110} y={chao - 44} width={120} height={44} fill="#B98F62" stroke={T} strokeWidth={2} />
      <rect x={104} y={chao - 50} width={132} height={8} fill="#8A5A3B" stroke={T} strokeWidth={2} />
      <rect x={140} y={chao - 34} width={60} height={16} fill="#FBF4E5" stroke={T} strokeWidth={1.2} />
      <text x={170} y={chao - 22.5} className="reservado">PORTARIA</text>
      <g transform={`translate(290 ${chao})`}><DonaGloria /></g>
    </g>
  );
}

function Andar({ i, n, estado, elevador, aoEscolher }: {
  i: number; n: number; estado: 'feito' | 'atual' | 'trancado' | 'fora'; elevador: boolean; aoEscolher?: () => void;
}) {
  const y = fy(i), chao = y + ANDAR - 6, x = POCO;
  const numero = `${n}0${(n % 3) + 1}`;
  return (
    <g className={`andar-janela ${estado}${aoEscolher ? ' escolhivel' : ''}`} onClick={aoEscolher}
      role={aoEscolher ? 'button' : undefined} aria-label={aoEscolher ? `${n}º andar` : undefined}>
      {CENARIO && estado !== 'fora' ? (
        // arte ilustrada: o andar em corte com três apartamentos (os mesmos fundos do jogo); trancado = de noite
        <g>
          {[0, 1, 2].map((k) => {
            const lista = estado === 'trancado' ? CENARIO!.vazios : CENARIO!.quartos;
            const w = (JW - POCO) / 3;
            return <image key={k} href={urlArte(lista[(n + k) % lista.length].f)} x={x + k * w} y={y} width={w} height={ANDAR} preserveAspectRatio="xMidYMax slice" />;
          })}
          <rect x={x + (JW - POCO) / 3 - 3} y={y} width={6} height={ANDAR} fill={T} />
          <rect x={x + (2 * (JW - POCO)) / 3 - 3} y={y} width={6} height={ANDAR} fill={T} />
        </g>
      ) : (
        <g>
          <rect x={x} y={y} width={JW - POCO} height={ANDAR} className="corredor" />
          <rect x={x} y={y + ANDAR - 34} width={JW - POCO} height={34} fill="#000" opacity={0.035} />
          <rect x={x} y={y + ANDAR - 8} width={JW - POCO} height={8} fill="#C9BB98" />
          <path d={`M${x},${y + ANDAR - 8} h${JW - POCO}`} stroke={T} strokeWidth={1.4} />
          <rect x={x + 150} y={y} width={26} height={7} fill="#F6E9B8" stroke={T} strokeWidth={1.4} />
        </g>
      )}
      {estado === 'trancado' && (
        <g>
          <Porta x={226} y={y + 40} numero={numero} trancada />
          {/* plaquinha de maçaneta: "Trancado" */}
          <g transform={`rotate(-6 266 ${y + 92})`}>
            <path d={`M266,${y + 90} l-8,10 h16 Z`} fill="none" stroke={T} strokeWidth={1.2} />
            <rect x={240} y={y + 100} width={58} height={22} rx={3} fill="#FBF4E5" stroke={T} strokeWidth={1.4} />
            <text x={269} y={y + 115} className="trancado-txt">Trancado</text>
          </g>
          <rect x={x} y={y} width={JW - POCO} height={ANDAR} fill={T} opacity={0.1} />
        </g>
      )}
      {estado === 'atual' && (
        // a Neide em flagrante: NA FRENTE da porta (o aviso só proíbe atrás)
        <g>
          <Porta x={262} y={y + 40} numero={numero} />
          <rect x={252} y={y + ANDAR - 12} width={68} height={6} rx={2} fill="#A86B4F" stroke={T} strokeWidth={1.2} />
          <path d={`M256,${y + 66} q-6,6 0,12 M249,${y + 62} q-9,10 0,20`} fill="none" stroke={T} strokeWidth={1.8} strokeLinecap="round" />
          {morador('Neide', 205, chao, 'ouvindo', 'fofoqueira')}
        </g>
      )}
      {estado === 'feito' && CENAS[(n - 1) % CENAS.length](chao)}
      {estado === 'fora' && (n === 0 ? <Portaria y={y} /> : (
        // acima do último andar: o céu, e o telhado ilustrado
        <g>
          <rect x={x} y={y} width={JW - POCO} height={ANDAR} fill={ARTE ? '#F3E1C0' : '#C7DAD5'} />
          {CENARIO && <image href={urlArte(CENARIO.telhado.f)} x={x} y={y + ANDAR - ((JW - POCO) * CENARIO.telhado.h) / CENARIO.telhado.w}
            width={JW - POCO} height={((JW - POCO) * CENARIO.telhado.h) / CENARIO.telhado.w} preserveAspectRatio="none" />}
        </g>
      ))}
      {/* placa do andar no poço do elevador (no andar do elevador, quem mostra o número é o visor) */}
      {estado !== 'fora' && !elevador && (
        <g>
          <rect x={8} y={y + 10} width={POCO - 16} height={22} rx={11} fill="#FBF4E5" stroke={T} strokeWidth={1.6} />
          <text x={POCO / 2} y={y + 26} className={n > 99 ? 'num-andar longo' : 'num-andar'}>{n}</text>
          {estado === 'feito' && (
            <g transform={`translate(${POCO - 8} ${y + 32})`}>
              <circle r={7} fill="#245A73" stroke="#FBF4E5" strokeWidth={1.5} />
              <path d="M-3,0 l2,2.4 l4,-4.6" fill="none" stroke="#FBF4E5" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
            </g>
          )}
        </g>
      )}
      {elevador && (
        <g>
          <rect x={6} y={y + 30} width={POCO - 12} height={ANDAR - 30} fill="#E4D9BE" stroke={T} strokeWidth={2} />
          <rect x={6} y={y + 30} width={9} height={ANDAR - 30} fill="#9FB3AA" stroke={T} strokeWidth={1.4} />
          <rect x={POCO - 15} y={y + 30} width={9} height={ANDAR - 30} fill="#9FB3AA" stroke={T} strokeWidth={1.4} />
          <rect x={10} y={y + 6} width={POCO - 20} height={18} rx={2} fill={T} />
          <text x={POCO / 2} y={y + 20} className={n > 99 ? 'visor longo' : 'visor'}>{n}</text>
        </g>
      )}
    </g>
  );
}

// Menu = uma janela no prédio: três andares, o elevador parado no escolhido. Andar feito = visto;
// trancado = porta fechada com plaquinha. Pra ir longe, "Ver andares" (dezenas).
// Sem `vidas` (pesquisa com pessoas), nada de advertência no menu.
// `pesquisa`: pro observador do teste, o código do participante e o botão de baixar o registro das jogadas.
export function Menu({ titulos, liberada, vidas, aoJogar, pesquisa, aoApagar, capitulos, primeira, rotulos, dia }: {
  titulos: string[]; liberada: number; vidas?: Vidas; aoJogar: (andar: number) => void; aoApagar?: () => void;
  capitulos: Capitulo[]; primeira: Set<string>; rotulos: string[];
  dia?: { feita: number; aoJogar: () => void }; // Fofoca do dia (feita = em quantas tentativas; 0 = ainda não)
  pesquisa?: { participante: string; aoExportar: () => void };
}) {
  const zerou = liberada >= titulos.length;
  const atual = zerou ? 0 : liberada;
  const [sel, setSel] = useState(atual);
  const [indice, setIndice] = useState(false);
  const [ajustes, setAjustes] = useState(false);
  const suspenso = !!vidas && vidas.restam <= 0;
  const [aviso, resposta] = avisoDo(liberada, vidas);
  const estado = (i: number) => (i < 0 || i >= titulos.length ? 'fora' : i === liberada ? 'atual' : i < liberada ? 'feito' : 'trancado');
  const escolher = (i: number) => (i >= 0 && i < titulos.length && i <= liberada ? () => setSel(i) : undefined);

  return (
    <main className="menu">
      <header className="menu-topo">
        <div>
          <h1 className="marca">Fofoca!</h1>
          <div className="predio-nome">EDIFÍCIO PRIMAVERA</div>
        </div>
        <div className="menu-direita">
        {vidas && (
          <div className="menu-advertencias">
            <CartoesAdvertencia restam={vidas.restam} />
            <span className="rotulo">advertências</span>
            {vidas.falta !== undefined && <span className="volta">{suspenso ? 'suspenso' : '−1'} em {relogio(vidas.falta)}</span>}
          </div>
        )}
        <button className="engrenagem" onClick={() => setAjustes(true)} aria-label="Ajustes">
          <svg width={22} height={22} viewBox="-12 -12 24 24" aria-hidden="true">
            <path d="M-1.6,-10 h3.2 l.6,2.6 2,.9 2.3,-1.4 2.2,2.2 -1.4,2.3 .9,2 2.6,.6 v3.2 l-2.6,.6 -.9,2 1.4,2.3 -2.2,2.2 -2.3,-1.4 -2,.9 -.6,2.6 h-3.2 l-.6,-2.6 -2,-.9 -2.3,1.4 -2.2,-2.2 1.4,-2.3 -.9,-2 -2.6,-.6 v-3.2 l2.6,-.6 .9,-2 -1.4,-2.3 2.2,-2.2 2.3,1.4 2,-.9 Z" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinejoin="round" />
            <circle r={3.2} fill="none" stroke="currentColor" strokeWidth={1.8} />
          </svg>
        </button>
        </div>
      </header>

      <div className="mural" aria-label="Aviso da administração">
        <div className="papel-aviso">
          <span className="de">AVISO DA ADMINISTRAÇÃO</span>
          <p>{aviso}</p>
        </div>
        <p className="resposta">{resposta}</p>
      </div>

      <section className="janela" aria-label="Andares do prédio">
        <svg viewBox={`0 -8 ${JW} ${3 * ANDAR + 2 * LAJE + 16}`} preserveAspectRatio="xMidYMid meet">
          <rect x={-4} y={-8} width={JW + 8} height={3 * ANDAR + 2 * LAJE + 16} fill={T} />
          <rect x={0} y={0} width={POCO} height={3 * ANDAR + 2 * LAJE} fill={ARTE ? '#4A3426' : '#3A4F48'} />
          <path d={`M14,0 V${3 * ANDAR + 2 * LAJE} M${POCO - 14},0 V${3 * ANDAR + 2 * LAJE}`} stroke={ARTE ? '#6B4F3A' : '#56695F'} strokeWidth={2} />
          {[sel + 1, sel, sel - 1].map((andar, i) => (
            <Andar key={andar} i={i} n={andar + 1} estado={estado(andar)} elevador={andar === sel} aoEscolher={escolher(andar)} />
          ))}
        </svg>
      </section>

      <div className="placa-linha">
        <div className="placa-andar">
          <span>{sel + 1}º andar · capítulo {capituloDe(capitulos, sel)?.numero}</span>
          <strong>{titulos[sel]}</strong>
        </div>
        <button className="ver-andares" onClick={() => setIndice(true)}>Ver andares</button>
      </div>

      <footer>
        <button className="principal" onClick={() => aoJogar(sel)}>
          {zerou && sel === 0 ? 'Jogar de novo · 1º andar' : `Jogar · ${sel + 1}º andar`}
        </button>
        {dia && (
          <button className={dia.feita ? 'dia feita' : 'dia'} onClick={dia.aoJogar}>
            Fofoca do dia{dia.feita ? ` · feita${dia.feita === 1 ? ' de primeira ★' : ''}` : ''}
          </button>
        )}
        {pesquisa && (
          <button className="exportar" onClick={pesquisa.aoExportar}>
            Participante {pesquisa.participante} · exportar registro
          </button>
        )}
      </footer>

      {ajustes && <Ajustes aoFechar={() => setAjustes(false)} aoApagar={aoApagar} />}
      {indice && (
        <Indice total={titulos.length} liberada={liberada} sel={sel} capitulos={capitulos} primeira={primeira} rotulos={rotulos}
          aoIr={(i) => { setSel(i); setIndice(false); }} aoFechar={() => setIndice(false)} />
      )}
    </main>
  );
}

// "Ver andares": os capítulos numa faixa, os andares do capítulo (★ = vencido de primeira) e o botão de ir
function Indice({ total, liberada, sel, aoIr, aoFechar, capitulos, primeira, rotulos }: {
  total: number; liberada: number; sel: number; aoIr: (i: number) => void; aoFechar: () => void;
  capitulos: Capitulo[]; primeira: Set<string>; rotulos: string[];
}) {
  const atual = capituloDe(capitulos, sel) ?? capitulos[0];
  const [numero, setNumero] = useState(atual.numero);
  const [marcado, setMarcado] = useState(sel);
  // a faixa mostra os capítulos até o da vez e o próximo (trancado), como o prédio que "cresce"
  const ultimo = Math.min((capituloDe(capitulos, Math.min(liberada, total - 1))?.numero ?? 1) + 1, capitulos.length);
  const cap = capitulos[numero - 1];
  const faixa = useRef<HTMLDivElement>(null);
  // ⚠️ com chaves: no Chromium novo scrollIntoView devolve uma Promise, e o React a tomava por limpeza
  useEffect(() => { faixa.current?.querySelector('.atual')?.scrollIntoView({ inline: 'center', block: 'nearest' }); }, []);
  return (
    <div className="indice-fundo" onClick={aoFechar}>
      <div className="indice" role="dialog" aria-label="Ver andares" onClick={(e) => e.stopPropagation()}>
        <div className="indice-topo">
          <h2>Ver andares</h2>
          <button className="fechar" onClick={aoFechar}>Fechar</button>
        </div>
        <div className="dezenas" ref={faixa}>
          {capitulos.slice(0, ultimo).map((c) => (
            <button key={c.numero} className={c.numero === numero ? 'atual' : undefined} disabled={c.inicio > liberada} onClick={() => setNumero(c.numero)}>
              Cap. {c.numero}{c.fim <= liberada && <span aria-label=", concluído"> ✓</span>}
            </button>
          ))}
        </div>
        <p className="cap-indice"><b>{cap.titulo}</b> · ★ {estrelas(cap, rotulos, primeira)} de {cap.fim - cap.inicio} de primeira</p>
        <div className="andares-grade">
          {Array.from({ length: cap.fim - cap.inicio }, (_, k) => {
            const i = cap.inicio + k;
            const cls = i === marcado ? 'marcado' : i < liberada ? 'feito' : i === liberada ? 'proximo' : 'trancado';
            const estrela = primeira.has(rotulos[i]);
            return (
              <button key={i} className={cls} disabled={i > liberada} onClick={() => setMarcado(i)}
                aria-label={`${i + 1}º andar${estrela ? ', de primeira' : i < liberada ? ', feito' : i > liberada ? ', trancado' : ''}`}>
                <b>{i + 1}</b>
                <span className="portinha" aria-hidden="true" />
                {i < liberada && <span className={estrela ? 'visto estrela' : 'visto'} aria-hidden="true">{estrela ? '★' : '✓'}</span>}
              </button>
            );
          })}
        </div>
        <button className="principal" onClick={() => aoIr(marcado)}>Ir ao andar {marcado + 1}</button>
      </div>
    </div>
  );
}

// Ajustes: velocidade do espalhar, menos animação, apagar progresso (com confirmação na própria tela) e versão.
function Ajustes({ aoFechar, aoApagar }: { aoFechar: () => void; aoApagar?: () => void }) {
  const [a, setA] = useState<ValoresAjustes>(() => lerAjustes(armazemDoNavegador));
  const [confirmar, setConfirmar] = useState(false);
  const mudar = (novo: ValoresAjustes) => { setA(novo); gravarAjustes(armazemDoNavegador, novo); aplicarMovimento(novo.reduzir); };
  return (
    <div className="indice-fundo" onClick={aoFechar}>
      <div className="indice ajustes" role="dialog" aria-label="Ajustes" onClick={(e) => e.stopPropagation()}>
        <div className="indice-topo">
          <h2>Ajustes</h2>
          <button className="fechar" onClick={aoFechar}>Fechar</button>
        </div>

        <div className="ajuste">
          <span className="rotulo-ajuste">Velocidade do espalhar</span>
          <div className="segmentos" role="radiogroup" aria-label="Velocidade do espalhar">
            <button role="radio" aria-checked={!a.rapido} className={a.rapido ? '' : 'marcado'} onClick={() => mudar({ ...a, rapido: false })}>Normal</button>
            <button role="radio" aria-checked={a.rapido} className={a.rapido ? 'marcado' : ''} onClick={() => mudar({ ...a, rapido: true })}>Rápida ×2</button>
          </div>
        </div>

        <label className="ajuste alternar">
          <span>
            <span className="rotulo-ajuste">Menos animação</span>
            <span className="nota-ajuste">Sem balão voando nem personagens se mexendo.</span>
          </span>
          <input type="checkbox" checked={a.reduzir} onChange={(e) => mudar({ ...a, reduzir: e.target.checked })} />
        </label>

        {aoApagar && (
          <div className="ajuste">
            <span className="rotulo-ajuste">Progresso</span>
            {/* depois de apagar, o menu se remonta já no 1º andar (e esta folha fecha): esse é o retorno */}
            {confirmar ? (
              <div className="confirmar">
                <span className="nota-ajuste">Apagar mesmo? Você volta pro 1º andar. As advertências continuam.</span>
                <div className="acoes">
                  <button onClick={() => setConfirmar(false)}>Cancelar</button>
                  <button className="perigo" onClick={aoApagar}>Apagar</button>
                </div>
              </div>
            ) : (
              <button className="secundario" onClick={() => setConfirmar(true)}>Apagar progresso</button>
            )}
          </div>
        )}

        <p className="versao">Versão {typeof __VERSAO__ === 'string' ? __VERSAO__ : 'local'}</p>
      </div>
    </div>
  );
}
