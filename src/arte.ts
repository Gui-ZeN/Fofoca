// A arte do jogo: personagens e peças do prédio em imagem ilustrada (geradas por IA a partir da prancha
// do Guilherme; decidido em 2026-11-11: "Sim, virar padrão"). As imagens ficam em public/arte/.
// O desenho em SVG continua de reserva: pra quem não tem imagem, se o manifesto não carregar,
// e no link ?vetor (pra comparar).

// ⚠️ `typeof location`: nos testes (node) não há página, e sem isso o chegada.test nem carregava
export const ARTE = typeof location !== 'undefined' && !new URLSearchParams(location.search).has('vetor');

export type PoseArte = { f: string; w: number; h: number; olha?: 1 | -1 }; // olha: quando a pose vira pro lado contrário do resto da folha
export type Sprite = { olha: 1 | -1; alt: number; poses: Record<string, PoseArte> };
export let SPRITES: Record<string, Sprite> = {};
// peças do prédio: fundo de cada apartamento (com a cor dominante, pra porta e escada emendarem), vazios à noite, telhado e bairro
export type Fundo = { f: string; cor: string };
export type Cenario = { quartos: Fundo[]; vazios: Fundo[]; telhado: PoseArte; bairro: PoseArte };
export let CENARIO: Cenario | undefined;
// relativo à página: o site usa base "./" (GitHub Pages numa subpasta)
export const urlArte = (f: string) => `arte/${f}`;

export async function carregarArte() {
  try {
    const m = await (await fetch(urlArte('manifesto.json'))).json();
    CENARIO = m._cenario;
    delete m._cenario;
    SPRITES = m;
  } catch {
    SPRITES = {}; // sem as imagens, cai no desenho em SVG
  }
}
