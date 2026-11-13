// A musiquinha de fundo: um "dubstep calmo" feito na hora pelo navegador (Web Audio), sem arquivo.
// ⚠️ Pedido do dono (2026-11-13): sem letra, sem voz, "só pra ir relaxando e jogando". Andamento lento em meio-tempo
// (bumbo no 1, caixa no 3), um baixo grave que "respira" (o filtro abre e fecha devagar — a marca do dubstep, aqui
// bem mansa), um colchão de acordes e umas notas soltas por cima. Fica no mesmo tom das notas de ritmo (som.ts, sol
// maior pentatônica), então a escadinha do boato soa afinada com a música.
// Sem arquivo não há licença pra conferir. ⚠️ Ninguém ouviu ainda quando isto foi escrito: timbre, volume e andamento
// são do ouvido do dono; os números abaixo são o primeiro palpite.
import { armazemDoNavegador, lerAjustes } from './ajustes';
import { contexto } from './som';

const BPM = 72;
export const PASSO = 60 / BPM / 4; // uma semicolcheia, em segundos
export const PASSOS_POR_COMPASSO = 16;
// Em · C · G · D: quatro compassos que giram sem fim. [baixo, tríade do colchão] em Hz.
export const ACORDES: { baixo: number; notas: number[] }[] = [
  { baixo: 82.41, notas: [329.63, 392.0, 493.88] }, // mi menor
  { baixo: 65.41, notas: [261.63, 329.63, 392.0] }, // dó
  { baixo: 98.0, notas: [293.66, 392.0, 493.88] }, // sol
  { baixo: 73.42, notas: [293.66, 369.99, 440.0] }, // ré
];
// as notas soltas (pentatônica de sol, duas oitavas acima): uma por compasso, só na 2ª metade do giro de 8 compassos
const BRILHOS = [987.77, 1174.66, 783.99, 880.0];

// O que toca em cada semicolcheia do compasso: puro, pra dar pra testar sem áudio.
export function oQueToca(passo: number) {
  const p = passo % PASSOS_POR_COMPASSO, compasso = Math.floor(passo / PASSOS_POR_COMPASSO) % 8;
  return {
    compasso,
    acorde: ACORDES[compasso % ACORDES.length],
    bumbo: p === 0 || p === 10,
    caixa: p === 8,
    chimbal: p % 4 === 2,
    baixo: p === 0 || p === 10,
    colchao: p === 0,
    brilho: compasso >= 4 && p === 4 ? BRILHOS[compasso % BRILHOS.length] : undefined,
  };
}

let mestre: GainNode | undefined, ruido: AudioBuffer | undefined;
let proximo = 0, passo = 0, relogio: ReturnType<typeof setInterval> | undefined, tocando = false;

function envelope(c: AudioContext, t: number, sobe: number, pico: number, dura: number) {
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(pico, t + sobe);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dura);
  return g;
}

function chiado(c: AudioContext, t: number, dura: number, volume: number, tipo: BiquadFilterType, freq: number) {
  ruido ??= (() => { const b = c.createBuffer(1, c.sampleRate, c.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; return b; })();
  const s = c.createBufferSource(), f = c.createBiquadFilter();
  s.buffer = ruido; f.type = tipo; f.frequency.value = freq;
  s.connect(f).connect(envelope(c, t, 0.004, volume, dura)).connect(mestre!);
  s.start(t); s.stop(t + dura + 0.02);
}

function tom(c: AudioContext, t: number, freq: number, dura: number, volume: number, onda: OscillatorType, sobe = 0.01, ate?: number) {
  const o = c.createOscillator();
  o.type = onda; o.frequency.setValueAtTime(freq, t);
  if (ate) o.frequency.exponentialRampToValueAtTime(ate, t + dura);
  o.connect(envelope(c, t, sobe, volume, dura)).connect(mestre!);
  o.start(t); o.stop(t + dura + 0.03);
}

function tocarPasso(c: AudioContext, n: number, t: number) {
  const q = oQueToca(n);
  if (q.bumbo) tom(c, t, 110, 0.28, 0.5, 'sine', 0.005, 42); // bumbo: um grave que cai
  if (q.caixa) { chiado(c, t, 0.2, 0.16, 'bandpass', 1700); tom(c, t, 190, 0.1, 0.1, 'triangle'); }
  if (q.chimbal) chiado(c, t, 0.045, 0.04, 'highpass', 7000);
  if (q.baixo) {
    // o baixo que respira: dente-de-serra por um filtro que abre e fecha devagar
    const o = c.createOscillator(), f = c.createBiquadFilter(), dura = PASSO * (n % PASSOS_POR_COMPASSO === 0 ? 9.5 : 5.5);
    o.type = 'sawtooth'; o.frequency.value = q.acorde.baixo;
    f.type = 'lowpass'; f.Q.value = 6;
    f.frequency.setValueAtTime(140, t);
    f.frequency.linearRampToValueAtTime(520, t + dura * 0.45);
    f.frequency.linearRampToValueAtTime(140, t + dura);
    o.connect(f).connect(envelope(c, t, 0.03, 0.22, dura)).connect(mestre!);
    o.start(t); o.stop(t + dura + 0.03);
  }
  if (q.colchao) for (const nota of q.acorde.notas) { tom(c, t, nota, PASSO * 17, 0.035, 'triangle', 0.7); tom(c, t, nota * 1.004, PASSO * 17, 0.03, 'sine', 0.7); }
  if (q.brilho) tom(c, t, q.brilho, 0.9, 0.035, 'sine', 0.01);
}

function agendar() {
  const c = contexto();
  if (!c || !mestre) return;
  const ligada = lerAjustes(armazemDoNavegador).musica && document.visibilityState === 'visible';
  if (ligada !== tocando) {
    tocando = ligada;
    mestre.gain.setTargetAtTime(ligada ? 0.5 : 0, c.currentTime, 0.25); // entra e sai sem estalo
    if (ligada) proximo = Math.max(proximo, c.currentTime + 0.1);
  }
  if (!tocando) return;
  if (proximo < c.currentTime) proximo = c.currentTime + 0.05; // voltou de uma pausa: não tenta recuperar o atraso
  while (proximo < c.currentTime + 0.3) { tocarPasso(c, passo, proximo); proximo += PASSO; passo++; }
}

// O navegador só deixa tocar depois de um toque na tela: a música começa no primeiro.
export function ligarMusicaNoPrimeiroToque() {
  if (typeof window === 'undefined') return;
  const comecar = () => {
    const c = contexto();
    if (!c || relogio) return;
    mestre = c.createGain(); mestre.gain.value = 0; mestre.connect(c.destination);
    relogio = setInterval(agendar, 100);
    window.removeEventListener('pointerdown', comecar);
  };
  window.addEventListener('pointerdown', comecar);
}
