// Designer 5 — "gente difícil e dois vilões" (2026-11-17). Nando, Raquel e Fofoqueira + andares com dois vilões ao mesmo tempo.
// Achados com o buscador em _busca/designer5 (busca local sobre o motor) e conferidos por scripts/conferirAndar.ts.
// Os dois difíceis são para jogar em SEQUÊNCIA: o 2º reaproveita o que o 1º ensinou, com uma virada.
import type { Vizinho } from '../motor';
import type { AndarDesenhado } from './tipo';

const v = (id: string, nome: string, tipo: Vizinho['tipo'], pos: [number, number], extra: Partial<Vizinho> = {}): Vizinho =>
  ({ id, nome, tipo, pos, ...extra });

export const andares: AndarDesenhado[] = [
  // Passa reto, não passa por mim (facil). A Rita chega na Davi (estrela) em 4 setas: Ivo, Bia, Marlene e Nando, que entra por cima e desce reto pra Davi. O atalho óbvio é Ivo → Lia → Davi, mas a Lia mora colada na Dona Norma e já está calada na batida 3.
  // Prédio (* = estrela, ! = vilão, F = Fofoqueira, N = Nando, R = Raquel, -- e | = porta):
  //    .     b -- m
  //         |    |
  //    r -- i -- pN
  //    |    |    |
  //    w!-- l --*d
  {
    dificuldade: "facil",
    referencia: "Portal / Baba Is You: o jeito de entrar numa peça decide pra onde ela te manda; aqui, o lado por onde o boato entra no Nando.",
    ideia: "O Nando só passa reto: o boato tem que entrar nele por cima pra descer até a Davi, e o atalho pela Lia está calado.",
    vilao: "A Dona Norma cala quem mora colado nela depois da batida 1: a Lia, o passo do atalho de 3 setas, fica muda; sem ela a solução seria de 3 setas.",
    fase: {
      titulo: "Passa reto, não passa por mim",
      boato: "A Dona Norma ensaia a bronca da reunião de condomínio",
      novidade: "Nando: conta sozinho pra quem está do outro lado",
      giros: 0, setas: 4, origens: ['r'],
      vizinhos: [
      v("r", "Rita", "comum", [0,1]),
      v("p", "Nando", "apressado", [2,1]),
      v("w", "Dona Norma", "assunto", [0,2], {"recolhe":1}),
      v("i", "Ivo", "comum", [1,1]),
      v("d", "Davi", "comum", [2,2], {"interesse":{}}),
      v("m", "Marlene", "comum", [2,0]),
      v("l", "Lia", "comum", [1,2]),
      v("b", "Bia", "comum", [1,0]),
      ],
      amizades: [["p","m"],["i","b"],["r","i"],["p","d"],["m","b"],["w","l"],["d","l"],["r","w"],["p","i"],["i","l"]],
      solucao: {"r":"i","i":"b","b":"m","m":"p"},
      armadilha: {"r":"i","i":"l","l":"d"},
    },
  },
  // A Vera ouviu o corredor (facil). O caminho curto pelo Rui passa colado na Vera: ele conta pra Jandira e ela escuta. A volta é pela Dudu e Jandira até a Neide, que espalha pro Edu (estrela).
  // Prédio (* = estrela, ! = vilão, F = Fofoqueira, N = Nando, R = Raquel, -- e | = porta):
  //   *e -- c    v!
  //    |         |
  //    nF-- j -- u
  //    |    |    |
  //    qR-- g -- r
  {
    dificuldade: "facil",
    referencia: "Into the Breach: a ameaça ocupa o caminho mais curto; é preciso ler onde ela vai agir antes de mover.",
    ideia: "Quem fala perto da Vera é escutado: o atalho por quem mora colado nela perde, a volta pela Dudu vence.",
    vilao: "A Vera fica no caminho curto (Rui, que mora colado nela): sem a escuta, o atalho Rui → Jandira → Neide venceria.",
    fase: {
      titulo: "A Vera ouviu o corredor",
      boato: "A Vera conta quantos passos a vizinha dá até o elevador",
      novidade: "Vera: escuta quando um vizinho dela conta algo",
      giros: 0, setas: 3, origens: ['r'],
      vizinhos: [
      v("r", "Rita", "comum", [2,2]),
      v("q", "Raquel", "comum", [0,2], {"desconfia":true}),
      v("n", "Neide", "fofoqueira", [0,1]),
      v("v", "Vera", "assunto", [2,0], {"vigia":true}),
      v("g", "Dudu", "comum", [1,2]),
      v("j", "Jandira", "comum", [1,1]),
      v("e", "Edu", "comum", [0,0], {"interesse":{}}),
      v("u", "Rui", "comum", [2,1]),
      v("c", "Cida", "comum", [1,0]),
      ],
      amizades: [["g","j"],["n","e"],["r","g"],["v","u"],["r","u"],["j","u"],["n","j"],["q","g"],["e","c"],["q","n"]],
      solucao: {"r":"g","g":"j","j":"n"},
      armadilha: {"r":"u","u":"j","j":"n"},
    },
  },
  // Reto até a Vera (medio). Duas estrelas (Rui e Celina). A Rita conta pro Ivo, que conta pro Nando: ele entra por baixo-esquerda e passa reto pra Neide, que espalha pra Jandira. Dali o boato vai Davi → Celina → Rui. O atalho Jandira → Tânia → Celina passa por quem mora colado na Vera.
  // Prédio (* = estrela, ! = vilão, F = Fofoqueira, N = Nando, R = Raquel, -- e | = porta):
  //    i -- pN-- nF   .
  //    |         |
  //    r    d -- j -- e
  //         |    |
  //    .    *h -- t -- v!
  //         |
  //    .    *u    .     .
  {
    dificuldade: "medio",
    referencia: "Into the Breach + Portal: duas peças com regras próprias (a que passa reto, a que escuta) e só uma ordem de entrada funciona.",
    ideia: "O Nando e a Neide abrem o caminho sozinhos; o que a pessoa descobre é que o último trecho tem que desviar da Tânia, a vizinha da Vera.",
    vilao: "A Vera escuta a Tânia, a passagem natural pra Celina; sem ela a armadilha por ali venceria.",
    fase: {
      titulo: "Reto até a Vera",
      boato: "A Vera confere o relógio do porteiro",
      giros: 0, setas: 5, origens: ['r'],
      vizinhos: [
      v("r", "Rita", "comum", [0,1]),
      v("v", "Vera", "assunto", [3,2], {"vigia":true}),
      v("p", "Nando", "apressado", [1,0]),
      v("n", "Neide", "fofoqueira", [2,0]),
      v("e", "Edu", "comum", [3,1]),
      v("u", "Rui", "comum", [1,3], {"interesse":{}}),
      v("t", "Tânia", "comum", [2,2]),
      v("j", "Jandira", "comum", [2,1]),
      v("h", "Celina", "comum", [1,2], {"interesse":{}}),
      v("d", "Davi", "comum", [1,1]),
      v("i", "Ivo", "comum", [0,0]),
      ],
      amizades: [["p","i"],["p","n"],["v","t"],["j","d"],["h","d"],["u","h"],["r","i"],["n","j"],["e","j"],["t","j"],["t","h"]],
      solucao: {"r":"i","i":"p","j":"d","d":"h","h":"u"},
      armadilha: {"r":"i","i":"p","j":"t","t":"h","h":"u"},
    },
  },
  // Duas vezes pra acreditar (medio). A Bia é estrela e só chega pela Neide. O atalho Rita → Tânia → Otávio → Neide é curto, mas o Otávio conta pra Neide na batida 3, justo quando o Seu Zé está de visita na casa dela. A volta, por Jandira e Ana, gasta mais duas setas e chega à Neide quando ele já voltou pra casa.
  // Prédio (* = estrela, ! = vilão, F = Fofoqueira, N = Nando, R = Raquel, -- e | = porta):
  //    j -- a    .     m
  //    |    |
  //    r -- t -- o    .
  //    |    |    |
  //    s    qR-- nF--*b
  //    |
  //    i -- z!   .     g
  {
    dificuldade: "medio",
    referencia: "Into the Breach: o inimigo anda em padrão fixo; é preciso agir no tempo certo.",
    ideia: "O caminho certo é o mais longo: chegar na Neide duas batidas depois, quando o Seu Zé já voltou pra casa.",
    vilao: "A ronda do Seu Zé está na casa da Neide justo na batida do atalho: sem ela bastariam 3 setas.",
    fase: {
      titulo: "Duas vezes pra acreditar",
      boato: "O Seu Zé guarda o troco da padaria num pote",
      novidade: "Seu Zé: anda pelo prédio e escuta quem conta perto dele",
      giros: 0, setas: 5, origens: ['r'],
      vizinhos: [
      v("r", "Rita", "comum", [0,1]),
      v("z", "Seu Zé", "assunto", [1,3], {"ronda":["z","i","n","r"]}),
      v("q", "Raquel", "comum", [1,2], {"desconfia":true}),
      v("n", "Neide", "fofoqueira", [2,2]),
      v("b", "Bia", "comum", [3,2], {"interesse":{}}),
      v("s", "Solange", "comum", [0,2]),
      v("t", "Tânia", "comum", [1,1]),
      v("o", "Otávio", "comum", [2,1]),
      v("i", "Ivo", "comum", [0,3]),
      v("a", "Ana", "comum", [1,0]),
      v("g", "Dudu", "comum", [3,3]),
      v("j", "Jandira", "comum", [0,0]),
      v("m", "Marlene", "comum", [3,0]),
      ],
      amizades: [["t","o"],["n","b"],["r","t"],["a","j"],["r","j"],["t","a"],["n","o"],["s","i"],["z","i"],["q","t"],["r","s"],["q","n"]],
      solucao: {"r":"j","j":"a","a":"t","t":"o","o":"n"},
      armadilha: {"r":"t","t":"o","o":"n"},
    },
  },
  // Quem acredita em quem (dificil). Duas estrelas: Edu e a própria Raquel, que só acredita ouvindo de duas pessoas (Edu e Rui). A Neide (Fofoqueira) espalha pra Celina e pra Lia; Celina conta pro Edu e a Lia pro Rui, e os dois contam pra Raquel na mesma batida. O Seu Zé faz a ronda Dudu, Caio, Celina e volta pra casa.
  // Prédio (* = estrela, ! = vilão, F = Fofoqueira, N = Nando, R = Raquel, -- e | = porta):
  //    .    *e --*qR   .
  //         |    |
  //    .     h -- u -- o
  //         |    |
  //    r -- nF-- l    g
  //    |    |    |    |
  //    j -- s    k    z!
  {
    dificuldade: "dificil",
    referencia: "Into the Breach (ameaça que anda) + Baba Is You (a regra que muda o que conta como 'ouviu').",
    ideia: "Mandar o boato direto pra Neide é rápido, mas a Celina conta pro Edu na batida em que o Seu Zé visita a Celina; a volta por Jandira e Solange chega na Neide uma batida depois da ronda passar.",
    vilao: "A ronda visita a Celina, o nó central do prédio, na batida do atalho: sem ela a solução teria 5 setas.",
    fase: {
      titulo: "Quem acredita em quem",
      boato: "O Seu Zé faz a ronda atrás do porteiro",
      giros: 0, setas: 7, origens: ['r'],
      vizinhos: [
      v("r", "Rita", "comum", [0,2]),
      v("z", "Seu Zé", "assunto", [3,3], {"ronda":["g","k","h","z"]}),
      v("q", "Raquel", "comum", [2,0], {"desconfia":true,"interesse":{}}),
      v("n", "Neide", "fofoqueira", [1,2]),
      v("h", "Celina", "comum", [1,1]),
      v("g", "Dudu", "comum", [3,2]),
      v("e", "Edu", "comum", [1,0], {"interesse":{}}),
      v("l", "Lia", "comum", [2,2]),
      v("u", "Rui", "comum", [2,1]),
      v("o", "Otávio", "comum", [3,1]),
      v("s", "Solange", "comum", [1,3]),
      v("k", "Caio", "comum", [2,3]),
      v("j", "Jandira", "comum", [0,3]),
      ],
      amizades: [["s","j"],["n","h"],["r","n"],["n","s"],["h","e"],["r","j"],["n","l"],["k","l"],["h","u"],["q","u"],["z","g"],["u","o"],["q","e"],["l","u"]],
      solucao: {"r":"j","j":"s","s":"n","h":"e","l":"u","e":"q","u":"q"},
      armadilha: {"r":"n","h":"e","l":"u","e":"q","u":"q"},
    },
  },
  // Dois fiscais, uma Raquel (dificil). Continuação do andar anterior, agora com DOIS vilões: o Seu Zé ainda faz a ronda (Edu, Dudu, casa) e entra a Dona Norma (recolhe depois da batida 3). A Lia ouve cedo, mas o Caio, a outra estrela, só chega pela Raquel, que exige duas fontes: Rui e Edu. O atalho Rui → Dudu → Caio morre porque o Dudu mora colado na Dona Norma e já está calado. Sobra a Raquel, e as duas fontes precisam chegar com o Seu Zé fora de vista: o Rui na batida 4, e o Edu, empurrado pelo Nando (Solange → Nando passa reto pro Otávio → Edu), só na batida 6, quando o Seu Zé já voltou pra casa.
  // Prédio (* = estrela, ! = vilão, F = Fofoqueira, N = Nando, R = Raquel, -- e | = porta):
  //    o -- e -- qR--*k
  //    |    |    |    |
  //    pN   h    u -- g
  //    |    |    |    |
  //    s -- nF--*l -- w!
  //    |    |
  //    j -- r    .     .
  //    .     .     .     z!
  {
    dificuldade: "dificil",
    referencia: "Into the Breach (ameaças simultâneas: fugir de uma empurra pra outra) + Baba Is You (a regra da Raquel, que no andar anterior era sua aliada, agora é o único caminho entre dois fiscais).",
    ideia: "O atalho pelo Dudu morre calado pela Dona Norma, então o caminho certo vai pela Raquel; ela só acredita com duas fontes, e a segunda tem que ser atrasada pelo Nando pra chegar quando o Seu Zé não está olhando.",
    vilao: "A Dona Norma cala o Dudu, o atalho pro Caio, e o Seu Zé fica no Edu justo na batida em que a 2ª fonte chegaria rápido: sem a ronda ou sem a Norma bastariam 6 setas, e sem um dos dois a armadilha deixa de ser a única saída.",
    fase: {
      titulo: "Dois fiscais, uma Raquel",
      boato: "A Dona Norma e o Seu Zé combinaram quem vigia o corredor",
      giros: 0, setas: 7, origens: ['r'],
      vizinhos: [
      v("r", "Rita", "comum", [1,3]),
      v("z", "Seu Zé", "assunto", [3,4], {"ronda":["e","g","z"]}),
      v("q", "Raquel", "comum", [2,0], {"desconfia":true}),
      v("n", "Neide", "fofoqueira", [1,2]),
      v("h", "Celina", "comum", [1,1]),
      v("g", "Dudu", "comum", [3,1]),
      v("e", "Edu", "comum", [1,0]),
      v("l", "Lia", "comum", [2,2], {"interesse":{}}),
      v("u", "Rui", "comum", [2,1]),
      v("o", "Otávio", "comum", [0,0]),
      v("s", "Solange", "comum", [0,2]),
      v("k", "Caio", "comum", [3,0], {"interesse":{}}),
      v("j", "Jandira", "comum", [0,3]),
      v("p", "Nando", "apressado", [0,1]),
      v("w", "Dona Norma", "assunto", [3,2], {"recolhe":3}),
      ],
      amizades: [["n","h"],["r","n"],["n","s"],["h","e"],["r","j"],["n","l"],["q","u"],["q","e"],["l","u"],["g","k"],["q","k"],["o","e"],["s","p"],["o","p"],["g","w"],["l","w"],["s","j"],["g","u"]],
      solucao: {"r":"n","l":"u","s":"p","u":"q","o":"e","e":"q","q":"k"},
      armadilha: {"r":"n","l":"u","u":"g","g":"k"},
    },
  },
];
