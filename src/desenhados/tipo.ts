// Andar desenhado à mão por um designer (2026-11-17). Conferido por scripts/conferirAndar.ts antes de entrar em qualquer lugar.
import type { FaseTrilho } from '../trilho';

export interface AndarDesenhado {
  fase: FaseTrilho;
  dificuldade: 'facil' | 'medio' | 'dificil';
  referencia: string; // de que jogo de puzzle vem a ideia, e o que foi tirado de lá
  ideia: string; // o "aha" do andar, em uma frase: o que a pessoa descobre pra vencer
  vilao: string; // como o vilão atrapalha o caminho óbvio (o dono: "os vilões têm que ter impacto")
}
