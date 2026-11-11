import { useEffect, useMemo, useRef, useState } from 'react';
import { alvosDe, amigosDe, controlavel, espalhar, girosUsados, porCelular, quemContou, type Fase, type Resultado, type Vizinho } from './motor';
import { NOME_TAMANHO, TAMANHO } from './Predio';
import { Cena } from './Cena';
import { BoatoMini, Derrota, Seta, Vitoria } from './Icones';
import { custo, espelhar, fasesTrilho, jogar, type FaseTrilho, type Plano } from './trilho';
import { fasesGiros, type FaseGiros } from './comparacao';
import { fasesHora } from './horaCerta';
import { fasesOrdem } from './ordem';
import { fasesDificil } from './dificil';
import { dele, ele, o, pro, vestir } from './elenco';
import { aleatorio } from './variar';
import { PREDIO, TUTORIAL } from './campanha';
import { MAX, atualizar, cheias, falta, gastar, relogio, type Advertencias } from './advertencias';
import { CartoesAdvertencia, Menu, type Vidas } from './Menu';
import { Casa } from './Icones';
import { APRESENTACOES, Chegada } from './Chegada';

// Sem link: a campanha (menu-mapa do prédio + 28 andares intercalados + advertências do síndico).
// Com link: o teste com pessoas — ?grupo=A/B (10 fases do trilho × 4 de giros, mesmos prédios) ou
// ?bloco=hora/ordem/dificil — sempre igual pra todo mundo e sem advertências.
// (A trilha gerada da mecânica antiga continua no código, fora desta tela.)

const PASSO_MS = 850;

// Progresso local do testador. Pode falhar (aba anônima): o jogo segue sem salvar.
const ler = <T,>(chave: string, padrao: T): T => {
  try { return JSON.parse(localStorage.getItem(chave) ?? '') as T; } catch { return padrao; }
};
const gravar = (chave: string, valor: unknown) => {
  try { localStorage.setItem(chave, JSON.stringify(valor)); } catch { /* sem armazenamento */ }
};

type Item = { modo: 'trilho'; fase: FaseTrilho; rotulo: string } | { modo: 'giros'; fase: FaseGiros; rotulo: string };
// O grupo do teste escolhe a ordem e só vem do link (#grupo-a, #grupo-b ou ?grupo=A; o artifact só repassa o #).
const doLink = (location.hash.match(/grupo-([ab])/i)?.[1] ?? new URLSearchParams(location.search).get('grupo') ?? '').toUpperCase();
const GRUPO = doLink === 'A' || doLink === 'B' ? doLink : undefined;
// Blocos de mecânica (?bloco=hora / ordem / dificil, ou #hora / #ordem / #dificil): jogados numa sessão separada do
// teste trilho × giros, pra fadiga das 14 fases não se misturar com "difícil agrada ou afasta" (Consulta 3).
const BLOCOS = {
  hora: { nome: 'Hora certa', letra: 'H', fases: fasesHora },
  ordem: { nome: 'Ordem', letra: 'O', fases: fasesOrdem },
  dificil: { nome: 'Prédio cheio', letra: 'D', fases: fasesDificil },
};
type NomeBloco = keyof typeof BLOCOS;
const pedido = (new URLSearchParams(location.search).get('bloco') ?? location.hash.match(/hora|ordem|dificil/i)?.[0] ?? '').toLowerCase();
const BLOCO = pedido in BLOCOS ? BLOCOS[pedido as NomeBloco] : undefined;
const TESTE = !!GRUPO || !!BLOCO;
// Pesquisa com pessoas (?pesquisa): a campanha de verdade — menu, cenas de chegada, mesma sequência —, mas
// igual pra todo participante (sem espelho, elenco fixo por andar) e SEM advertências (decisão do usuário,
// 2026-11-11, Consulta 4: o teste mede o ciclo de jogo; não aprova as vidas). Progresso próprio, separado
// da campanha normal do aparelho. `&zerar` apaga só os dados da pesquisa, pro próximo participante.
const busca = new URLSearchParams(location.search);
const PESQUISA = !TESTE && (busca.has('pesquisa') || /pesquisa/i.test(location.hash));
if (PESQUISA && busca.has('zerar')) {
  try { Object.keys(localStorage).filter((k) => k.startsWith('fofoca.pesquisa')).forEach((k) => localStorage.removeItem(k)); } catch { /* sem armazenamento */ }
  busca.delete('zerar');
  history.replaceState(null, '', `${location.pathname}?${busca}${location.hash}`);
}
const sementeDe = (rotulo: string) => [...rotulo].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
const TRILHO: Item[] = fasesTrilho.map((fase, i) => ({ modo: 'trilho', fase, rotulo: `T${i + 1}` }));
const GIROS: Item[] = fasesGiros.map((fase, i) => ({ modo: 'giros', fase, rotulo: `G${i}` }));
const DO_BLOCO: Item[] = (BLOCO?.fases ?? []).map((fase, i) => ({ modo: 'trilho', fase, rotulo: `${BLOCO!.letra}${i + 1}` }));
const SEQ_TESTE: Item[] = BLOCO ? DO_BLOCO : GRUPO === 'A' ? [...TRILHO, ...GIROS] : [...GIROS, ...TRILHO];
const ANDARES: Item[] = PREDIO.map(({ rotulo, fase }) => ({ modo: 'trilho', fase, rotulo }));

export function App() {
  if (TESTE) return <Jogo sequencia={SEQ_TESTE} chave={BLOCO ? `fofoca.${pedido}` : `fofoca.teste.${GRUPO}`} nome={BLOCO ? BLOCO.nome : `Grupo ${GRUPO}`} fixo />;
  return <Campanha pesquisa={PESQUISA} />;
}

// Advertências guardadas no aparelho; o relógio só corre enquanto falta alguma.
const CHAVE_ADV = 'fofoca.advertencias';
function useAdvertencias(): Vidas {
  const [salvo, setSalvo] = useState<Advertencias>(() => ler(CHAVE_ADV, cheias(Date.now())));
  const [agora, setAgora] = useState(Date.now);
  const atual = atualizar(salvo, agora);
  useEffect(() => {
    if (atual.restam >= MAX) return;
    const t = setInterval(() => setAgora(Date.now()), 1000);
    return () => clearInterval(t);
  }, [atual.restam]);
  return {
    restam: atual.restam,
    falta: falta(atual, agora),
    gastar: () => {
      const novo = gastar(atual, Date.now());
      setSalvo(novo);
      gravar(CHAVE_ADV, novo);
      return novo.restam;
    },
  };
}

function Campanha({ pesquisa }: { pesquisa: boolean }) {
  const advertencias = useAdvertencias();
  const vidas = pesquisa ? undefined : advertencias; // na pesquisa, nada de advertência: nem cobra, nem aparece
  const chave = pesquisa ? 'fofoca.pesquisa' : 'fofoca.campanha';
  const [andar, setAndar] = useState<number>();
  if (andar === undefined) {
    return <Menu titulos={ANDARES.map((a) => a.fase.titulo)} liberada={ler(`${chave}.liberada`, 0)} vidas={vidas} aoJogar={setAndar} />;
  }
  return <Jogo key={andar} sequencia={ANDARES} chave={chave} nome={pesquisa ? 'Pesquisa' : 'Campanha'} inicio={andar} aoVoltar={() => setAndar(undefined)} vidas={vidas} chegadas fixo={pesquisa} />;
}

// `chegadas`: mostra as cenas de chegada (campanha). `vidas`: cobra advertências (só a campanha normal).
// ⚠️ São separados de propósito: antes as cenas dependiam de `vidas`, e desligar as vidas desligava o ensino.
// `fixo`: cada fase abre sempre igual (teste e pesquisa).
function Jogo({ sequencia: SEQUENCIA, chave: CHAVE, nome: GRUPO, inicio, aoVoltar, vidas, chegadas = false, fixo = false }: {
  sequencia: Item[]; chave: string; nome: string; inicio?: number; aoVoltar?: () => void; vidas?: Vidas; chegadas?: boolean; fixo?: boolean;
}) {
  const total = SEQUENCIA.length;
  const [liberada, setLiberada] = useState(() => Math.min(ler(`${CHAVE}.liberada`, 0), total - 1));
  const [idx, setIdx] = useState(inicio ?? liberada);
  const [tentativas, setTentativas] = useState<Record<string, number>>(() => ler(`${CHAVE}.tentativas`, {}));
  const [espelho, setEspelho] = useState(() => Math.random() < 0.5);
  const novoElenco = () => Math.floor(Math.random() * 2 ** 32);
  const [elenco, setElenco] = useState(novoElenco); // sorteio de quem é quem (nomes e vítima)
  const item = SEQUENCIA[idx];
  const girando = item.modo === 'giros';
  // No teste (link com o grupo), cada fase abre sempre igual pra todo mundo: sem espelho e com o elenco
  // de uma semente fixa por fase (nomes e vítima ainda mudam de uma fase pra outra). Assim as
  // diferenças entre testadores vêm deles, não do sorteio (Consulta 2; decisão do usuário, 2026-11-10).
  const fase: Fase & { origens: [string] } = useMemo(
    () => fixo
      ? vestir(item.fase, aleatorio(sementeDe(item.rotulo)))
      : vestir(espelho ? espelhar(item.fase) : item.fase, aleatorio(elenco)),
    [item, espelho, elenco],
  );
  const origem = fase.origens[0];
  const limite = girando ? fase.giros : (fase as FaseTrilho).setas;

  const [plano, setPlano] = useState<Plano>({});
  const [historico, setHistorico] = useState<Plano[]>([]);
  const [selecionado, setSelecionado] = useState<string | undefined>(girando ? undefined : origem);
  const [cheio, setCheio] = useState(false); // pisca o contador quando acabam as setas
  const acabouDeSelecionar = useRef(false);
  const [resultado, setResultado] = useState<Resultado>();
  const [batida, setBatida] = useState(0);

  const recomecar = () => { setPlano({}); setHistorico([]); setSelecionado(girando ? undefined : origem); setResultado(undefined); setBatida(0); };
  useEffect(() => { setEspelho(Math.random() < 0.5); setElenco(novoElenco()); }, [idx]);
  useEffect(recomecar, [fase]); // fase nova (ou espelhada): plano zerado, origem selecionada

  // Anima o espalhamento: uma batida por vez.
  useEffect(() => {
    if (!resultado || batida > resultado.batidas.length) return;
    const t = setTimeout(() => setBatida((b) => b + 1), batida === 0 ? 350 : PASSO_MS);
    return () => clearTimeout(t);
  }, [resultado, batida]);
  const terminou = resultado !== undefined && batida > resultado.batidas.length;
  const montando = resultado === undefined;

  useEffect(() => {
    if (!terminou || !resultado?.vitoria) return;
    // guarda até `total` (o menu mostra a última como feita); o estado daqui não passa da última fase
    if (idx + 1 > ler(`${CHAVE}.liberada`, 0)) gravar(`${CHAVE}.liberada`, idx + 1);
    if (idx + 1 > liberada && idx + 1 < total) setLiberada(idx + 1);
  }, [terminou]); // só reage ao fim da animação

  // Cena de chegada: na campanha, na 1ª vez que algo novo estreia (uma vez só por aparelho).
  const apresentacao = chegadas ? APRESENTACOES[item.rotulo] : undefined;
  const [vendoChegada, setVendoChegada] = useState(false);
  useEffect(() => { setVendoChegada(!!apresentacao && !ler(`${CHAVE}.visto.${item.rotulo}`, false)); }, [idx]);

  // Advertência do síndico: só na campanha, depois do tutorial, e só quando a vítima descobre.
  const cobra = !!vidas && idx >= TUTORIAL;
  const suspenso = cobra && vidas!.restam <= 0;
  const [aviso, setAviso] = useState<number>(); // quantas restam depois da advertência desta rodada
  useEffect(() => {
    if (!resultado) setAviso(undefined);
    else if (terminou && cobra && resultado.motivo === 'assunto_ouviu') setAviso(vidas!.gastar());
  }, [terminou, resultado]);

  const porId = Object.fromEntries(fase.vizinhos.map((v) => [v.id, v]));
  // ⚠️ Na troca de fase, plano e seleção da fase anterior ainda valem por um render (o reset vem
  // no efeito) e podem apontar pra quem não mora mais aqui: a tela quebrava ao entrar na fase 4.
  // Então tudo o que é desenhado ou jogado passa por este filtro.
  const valido = Object.entries(plano).every(([de, para]) => porId[de] && porId[para]);
  if (!valido || (selecionado && !porId[selecionado])) {
    const limpo = Object.fromEntries(Object.entries(plano).filter(([de, para]) => porId[de] && porId[para]));
    if (!valido) setPlano(limpo);
    if (selecionado && !porId[selecionado]) setSelecionado(undefined);
  }
  const plano_ = valido ? plano : {};
  const alvos = selecionado && porId[selecionado] ? alvosDe(fase, porId[selecionado]) : [];
  const usadas = girando ? girosUsados(fase, plano) : custo(plano);

  // Comparação: gira a seta pronta pro próximo amigo (sem giro sobrando, volta pra original).
  const girar = (v: Vizinho) => {
    if (!montando) return;
    const amigos = amigosDe(fase, v.id);
    const proxima = amigos[(amigos.indexOf(plano[v.id] ?? v.seta!) + 1) % amigos.length];
    const novo = { ...plano, [v.id]: proxima };
    if (proxima === v.seta || girosUsados(fase, novo) > fase.giros) delete novo[v.id];
    setHistorico([...historico, plano]);
    setPlano(novo);
  };

  // Desenha (ou apaga) a seta de → para. Depois de desenhar, a seleção segue pra quem vai ouvir,
  // pra dar pra montar o trilho tocando um apartamento atrás do outro.
  const ligar = (de: string, para: string) => {
    if (!alvosDe(fase, porId[de]).includes(para)) return;
    if (plano[de] === para) {
      setHistorico([...historico, plano]);
      const { [de]: _, ...sem } = plano;
      setPlano(sem);
      return;
    }
    if (!plano[de] && usadas >= limite) {
      setCheio(true);
      setTimeout(() => setCheio(false), 600);
      return;
    }
    setHistorico([...historico, plano]);
    setPlano({ ...plano, [de]: para });
    setSelecionado(controlavel(porId[para]) && !plano[para] ? para : undefined);
  };

  const apertar = (v: Vizinho) => {
    // dedo no apartamento de quem vai contar: já mostra pra quem dá
    if ((!selecionado || !alvos.includes(v.id)) && controlavel(v) && selecionado !== v.id) {
      setSelecionado(v.id);
      acabouDeSelecionar.current = true;
    }
  };
  const tocar = (v: Vizinho) => {
    if (acabouDeSelecionar.current) { acabouDeSelecionar.current = false; return; }
    // ⚠️ Tocar em quem já está selecionado não desseleciona: o gesto natural é "toco na Rita, depois
    // na Ana", e a Rita (origem) já começa selecionada; desselecionar fazia o 2º toque selecionar a Ana.
    if (selecionado === v.id) return;
    if (selecionado && alvos.includes(v.id)) ligar(selecionado, v.id);
    else setSelecionado(controlavel(v) ? v.id : undefined);
  };
  const soltar = (de: string, para: string) => { acabouDeSelecionar.current = false; ligar(de, para); };

  const desfazer = () => {
    if (!historico.length) return;
    setPlano(historico[historico.length - 1]);
    setHistorico(historico.slice(0, -1));
  };

  const espalharAgora = () => {
    const novas = { ...tentativas, [item.rotulo]: (tentativas[item.rotulo] ?? 0) + 1 };
    setTentativas(novas);
    gravar(`${CHAVE}.tentativas`, novas);
    setSelecionado(undefined);
    setResultado(girando ? espalhar(fase, { origem, setas: plano }) : jogar(fase, plano));
    setBatida(0);
  };

  const sel = selecionado ? porId[selecionado] : undefined;
  const status = !montando || !sel ? undefined
    : plano_[sel.id]
      ? `${sel.nome} ${porCelular(fase, sel.id, plano_[sel.id]) ? 'liga' : 'conta'} pra ${porId[plano_[sel.id]].nome}`
      : usadas >= limite
        ? `${sel.nome} guarda pra si. As setas acabaram: aperte Espalhar ou desfaça.`
        : sel.celular
          ? `${sel.nome} guarda pra si. Toque num vizinho ou ligue pra alguém destacado.`
          : `${sel.nome} guarda pra si. Toque em quem vai ouvir.`;

  return (
    <main>
      <header>
        {aoVoltar
          ? <button className="nav" onClick={aoVoltar} aria-label="Voltar ao prédio"><Casa /></button>
          : <button className="nav" disabled={idx === 0} onClick={() => setIdx(idx - 1)} aria-label="Fase anterior"><Seta lado="esq" /></button>}
        <div className="titulo">
          <div className="numero">{aoVoltar ? `${idx + 1}º andar` : `Fase ${idx + 1} de ${total} · ${girando ? 'Girando as setas' : 'Desenhando o trilho'}`}</div>
          <h1>{fase.titulo}</h1>
        </div>
        <button className="nav" disabled={idx >= liberada} onClick={() => setIdx(idx + 1)} aria-label="Próxima fase"><Seta lado="dir" /></button>
      </header>

      <section className="palco">
        <Cena
          fase={fase} origem={origem} setas={plano_} resultado={resultado} batida={batida} montando={montando}
          aoTocar={() => {}} aoGirar={girar}
          trilho={girando ? undefined : { selecionado, alvos, aoApertar: apertar, aoTocar: tocar, aoSoltar: soltar }}
        />
        <div className="sobre-o-ceu">
          <p className="boato"><BoatoMini tamanho={1} /> {fase.boato}</p>
          <div className="fichas">
            <span className={cheio ? 'ficha setas cheio' : 'ficha setas'}>{girando ? 'Giros' : 'Setas'} {usadas}/{limite}</span>
            {cobra && <span className="ficha advertencias"><CartoesAdvertencia restam={vidas!.restam} /></span>}
          </div>
          {/* onde o tamanho importa, a escadinha fica sempre à vista: começa em cochicho e sobe um degrau por Exagerado */}
          {fase.vizinhos.some((v) => v.tipo === 'exagerado' || v.interesse?.tamanho) && (
            <div className="escala" aria-label="Tamanhos do boato: cochicho, fofoca, escândalo">
              {([1, 2, 3] as const).map((t, i) => (
                <span key={t}>{i > 0 && <b aria-hidden="true">›</b>}<BoatoMini tamanho={t} />{NOME_TAMANHO[t]}</span>
              ))}
            </div>
          )}
          {fase.novidade && montando && <p className="novidade"><b>NOVO</b> {fase.novidade}</p>}
          {/* a dica da fase fica até a primeira seta; depois, o que o selecionado está fazendo */}
          {montando && (fase.dica && !historico.length
            ? <p className="dica">{fase.dica}</p>
            : status && <p className="dica status">{status}</p>)}
        </div>
      </section>

      {vendoChegada && apresentacao && (
        <Chegada fase={fase} apresentacao={apresentacao} aoFechar={() => { gravar(`${CHAVE}.visto.${item.rotulo}`, true); setVendoChegada(false); }} />
      )}

      <footer>
        {montando ? (
          <>
            <div className="acoes">
              <button onClick={desfazer} disabled={!historico.length}>Desfazer</button>
              {/* com 3 advertências, dá pra montar o trilho mas não espalhar até o síndico tirar uma */}
              <button className="principal" onClick={espalharAgora} disabled={suspenso}>
                {suspenso ? `Suspenso · ${relogio(vidas!.falta ?? 0)}` : 'Espalhar!'}
              </button>
            </div>
          </>
        ) : terminou ? (
          // ⚠️ O desfecho flutua por cima da rua em vez de crescer o rodapé: crescer encolhia o palco
          // e o prédio subia ~78 px bem na hora de ver o que aconteceu (Astra, Consulta 2).
          <div className="desfecho">
            <Fim
              fase={fase} resultado={resultado!} ultima={idx === total - 1} aviso={aviso} falta={vidas?.falta}
              aoRepetir={() => {
                if (resultado!.vitoria) { setEspelho(!espelho); setElenco(novoElenco()); } // repetir: outro prédio e outro elenco (no teste, a mesma fase de novo)
                else { setResultado(undefined); setBatida(0); setSelecionado(undefined); } // tentar de novo: o plano fica
              }}
              aoAvancar={() => setIdx(idx + 1)}
            />
            {resultado?.vitoria && idx === total - 1 && (
              <p className="resumo">{GRUPO} · tentativas: {SEQUENCIA.map((it) => `${it.rotulo}:${tentativas[it.rotulo] ?? 0}`).join(' · ')}</p>
            )}
          </div>
        ) : (
          <button className="principal" disabled>Espalhando… batida {Math.max(1, batida)}</button>
        )}
      </footer>
    </main>
  );
}

function Fim(props: { fase: Fase; resultado: Resultado; ultima: boolean; aviso?: number; falta?: number; aoRepetir: () => void; aoAvancar: () => void }) {
  const { fase, resultado, ultima } = props;
  const nome = (id?: string) => fase.vizinhos.find((v) => v.id === id)?.nome ?? '';
  const culpado = fase.vizinhos.find((v) => v.id === resultado.culpado);
  // a vítima pode ser o Seu Zé ou outra pessoa; sem vítima na fase, não há quem "não desconfia"
  const vitima = fase.vizinhos.find((v) => v.tipo === 'assunto')?.nome;
  // curto de propósito: o desfecho flutua sobre a rua e, com 3 linhas a 360 px, cobria o térreo
  const quem = fase.vizinhos.filter((v) => v.interesse).sort((a, b) => (a.interesse!.ordem ?? 0) - (b.interesse!.ordem ?? 0)).map((v) => v.nome);
  const lista = quem.length > 1 ? `${quem.slice(0, -1).join(', ')} e ${quem[quem.length - 1]}` : quem[0];
  const souberam = `${lista} ${quem.length > 1 ? 'ficaram' : 'ficou'} sabendo.`;
  let texto = vitima ? `${souberam} ${vitima} nem desconfia.` : souberam;
  if (resultado.motivo === 'assunto_ouviu') {
    // ⚠️ quem contou DE FATO (motor: `de`), não o primeiro envio da batida — antes podia culpar quem perdeu o desempate
    const quem = quemContou(resultado, resultado.culpado!).map(nome);
    const lista = quem.length > 1 ? `${quem.slice(0, -1).join(', ')} e ${quem[quem.length - 1]}` : quem[0];
    texto = `${lista} ${quem.length > 1 ? 'contaram' : 'contou'} ${pro(vitima!)} ${vitima}!`;
    // com a linha da advertência embaixo, a 2ª frase sai: 3 linhas cobriam o térreo
    if (props.aviso === undefined) texto += ` Agora ${ele(vitima!)} sabe que estão falando ${dele(vitima!)}.`;
  } else if (resultado.motivo === 'interessado_nao_ouviu') {
    // Hora certa: o recado chegou, mas a pessoa ainda estava na padaria (ver `chega` no motor).
    // ⚠️ Procura entre TODAS as estrelas sem notícia, não só o culpado: o motor culpa a primeira da
    // lista, e a que perdeu o recado na padaria pode ser outra (O5: a Cida "não soube" porque a Bia estava fora).
    const naPadaria = fase.vizinhos.find((v) => v.interesse && !resultado.ouviu[v.id]
      && resultado.batidas.some((ms, i) => ms.some((m) => m.para === v.id) && (v.chega ?? 0) > i + 1));
    texto = naPadaria
      ? `${naPadaria.nome} ainda estava na padaria quando o recado chegou.`
      : `${culpado?.nome} não ficou sabendo de nada.`;
  } else if (resultado.motivo === 'tamanho_errado') {
    const queria = culpado!.interesse!.tamanho ?? culpado!.interesse!.minTamanho!;
    texto = `${culpado?.nome} queria ${TAMANHO[queria]} e recebeu ${TAMANHO[resultado.ouviu[culpado!.id].tamanho]}.`;
  } else if (resultado.motivo === 'ordem_errada') {
    const antes = nome(resultado.antes), depois = culpado!.nome;
    texto = `${o(antes) === 'a' ? 'A' : 'O'} ${antes} tinha que saber antes ${o(depois) === 'a' ? 'da' : 'do'} ${depois}.`;
  } else if (resultado.motivo === 'versao_errada') {
    texto = `${culpado?.nome} ouviu a versão ao contrário e não acreditou.`;
  }

  return (
    <div className={resultado.vitoria ? 'fim vitoria' : 'fim derrota'}>
      <p>{resultado.vitoria ? <Vitoria /> : <Derrota />} {texto}</p>
      {props.aviso !== undefined && (
        <p className="aviso">
          <CartoesAdvertencia restam={props.aviso} />
          {props.aviso > 0
            ? `O síndico te deu uma advertência (${MAX - props.aviso} de ${MAX}).`
            : `Terceira advertência: suspenso por ${relogio(props.falta ?? 0)}.`}
        </p>
      )}
      <div className="acoes">
        <button onClick={props.aoRepetir}>{resultado.vitoria ? 'Repetir' : 'Tentar de novo'}</button>
        {resultado.vitoria && !ultima && <button className="principal" onClick={props.aoAvancar}>Próxima fase</button>}
        {resultado.vitoria && ultima && <p className="zerou">Fim do protótipo. Obrigado por jogar!</p>}
      </div>
    </div>
  );
}
