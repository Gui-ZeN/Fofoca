// O som do jogo: só RITMO, sem voz e sem arquivo — notas curtas feitas na hora pelo navegador (Web Audio).
// ⚠️ Decisão do dono (2026-11-13): "psst" e "QUÊ?!" falados ficariam ruins; ele quer "apenas pra ter um ritmo". Cada
// batida do boato toca uma nota, um degrau acima da anterior: o ouvido acompanha a fofoca subindo o prédio.
// Sem arquivo não há licença pra conferir nem peso pra baixar (a procura por sons livres não achou o que servia).
import { armazemDoNavegador, lerAjustes } from './ajustes';

export type Toque = 'seta' | 'apaga' | 'recado' | 'estrela' | 'vitima' | 'vitoria' | 'derrota';

// pentatônica maior: qualquer sequência soa bem, e subir sem parar não desafina
const ESCALA = [0, 2, 4, 7, 9];
export const semitons = (passo: number) => ESCALA[passo % ESCALA.length] + 12 * Math.floor(passo / ESCALA.length);
export const frequencia = (passo: number, base = 392) => base * 2 ** (semitons(passo) / 12); // base: sol

let ctx: AudioContext | undefined;
// um contexto só pro jogo inteiro (a música de fundo, musica.ts, usa o mesmo)
export function contexto(): AudioContext | undefined {
  try {
    if (typeof window === 'undefined') return undefined;
    const Classe = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Classe) return undefined;
    ctx ??= new Classe();
    if (ctx.state === 'suspended') void ctx.resume(); // o navegador só libera som depois de um toque na tela
    return ctx;
  } catch { return undefined; }
}

// uma nota curta: ataque seco e queda rápida (som de tecla de xilofone)
function nota(c: AudioContext, freq: number, em: number, dura: number, volume: number, onda: OscillatorType = 'triangle', ate?: number) {
  const o = c.createOscillator(), g = c.createGain(), t = c.currentTime + em;
  o.type = onda;
  o.frequency.setValueAtTime(freq, t);
  if (ate) o.frequency.exponentialRampToValueAtTime(ate, t + dura);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(volume, t + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dura);
  o.connect(g).connect(c.destination);
  o.start(t);
  o.stop(t + dura + 0.03);
}

// O celular treme junto (pedido do dono, 2026-11-13: "pode ter vibração, mas podendo desligar"). Só nos três momentos
// que importam; iPhone e computador não têm `navigator.vibrate` e ficam quietos.
const TREMOR: Partial<Record<Toque, number | number[]>> = { estrela: 25, vitima: [70, 50, 140], vitoria: [25, 40, 25, 40, 60] };
function vibrar(toque: Toque) {
  const padrao = TREMOR[toque];
  if (!padrao || !lerAjustes(armazemDoNavegador).vibrar) return;
  try { navigator.vibrate?.(padrao); } catch { /* aparelho sem vibração */ }
}

// `passo`: a batida (0 = primeira). Não faz nada com o som desligado nos ajustes ou sem áudio no aparelho.
export function tocar(toque: Toque, passo = 0) {
  if (typeof window === 'undefined') return;
  vibrar(toque); // a vibração tem a chave dela: vale mesmo com o som desligado
  if (!lerAjustes(armazemDoNavegador).som) return;
  const c = contexto();
  if (!c) return;
  const f = frequencia(passo);
  if (toque === 'seta') nota(c, 880, 0, 0.06, 0.05, 'sine');
  else if (toque === 'apaga') nota(c, 440, 0, 0.07, 0.05, 'sine');
  else if (toque === 'recado') nota(c, f, 0, 0.22, 0.13);
  else if (toque === 'estrela') { nota(c, f, 0, 0.3, 0.13); nota(c, f * 1.5, 0.09, 0.45, 0.11, 'sine'); }
  else if (toque === 'vitima') nota(c, 196, 0, 0.5, 0.16, 'sawtooth', 82); // o tom despenca: deu ruim
  else if (toque === 'vitoria') [0, 2, 4, 5].forEach((p, i) => nota(c, frequencia(p, 523), i * 0.1, 0.4, 0.12));
  else if (toque === 'derrota') { nota(c, 330, 0, 0.25, 0.11); nota(c, 247, 0.16, 0.4, 0.11); }
}
