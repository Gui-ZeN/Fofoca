// Designer 1 — "o vilão que se move e o que escuta" (2026-11-17). Seu Zé de ronda e Vera como ameaça telegrafada NO caminho natural.
// Andares achados com buscador sobre o motor (_busca/designer1) e conferidos por scripts/conferirAndar.ts.
import type { AndarDesenhado } from './tipo';

export const andares: AndarDesenhado[] = [
  {
    fase: {
      titulo: "A ronda do Seu Zé",
      boato: "O Seu Zé confere a vizinha de lanterna",
      giros: 0,
      setas: 5,
      origens: [
        "r"
      ],
      vizinhos: [
        {
          id: "r",
          nome: "Rita",
          tipo: "comum",
          pos: [
            2,
            1
          ]
        },
        {
          id: "c",
          nome: "Cida",
          tipo: "comum",
          pos: [
            2,
            3
          ],
          interesse: {}
        },
        {
          id: "z",
          nome: "Seu Zé",
          tipo: "assunto",
          pos: [
            3,
            3
          ],
          ronda: [
            "c",
            "z",
            "c",
            "q"
          ]
        },
        {
          id: "n",
          nome: "Neide",
          tipo: "fofoqueira",
          pos: [
            0,
            2
          ]
        },
        {
          id: "e",
          nome: "Edu",
          tipo: "comum",
          pos: [
            1,
            2
          ]
        },
        {
          id: "q",
          nome: "Tânia",
          tipo: "comum",
          pos: [
            1,
            3
          ]
        },
        {
          id: "o",
          nome: "Caio",
          tipo: "comum",
          pos: [
            0,
            1
          ]
        },
        {
          id: "l",
          nome: "Íris",
          tipo: "comum",
          pos: [
            1,
            1
          ]
        },
        {
          id: "p",
          nome: "Paulo",
          tipo: "comum",
          pos: [
            2,
            0
          ]
        },
        {
          id: "t",
          nome: "Otávio",
          tipo: "comum",
          pos: [
            1,
            0
          ]
        },
        {
          id: "a",
          nome: "Ana",
          tipo: "comum",
          pos: [
            0,
            0
          ]
        }
      ],
      amizades: [
        [
          "r",
          "l"
        ],
        [
          "r",
          "p"
        ],
        [
          "c",
          "z"
        ],
        [
          "c",
          "q"
        ],
        [
          "n",
          "e"
        ],
        [
          "n",
          "o"
        ],
        [
          "e",
          "q"
        ],
        [
          "e",
          "l"
        ],
        [
          "o",
          "l"
        ],
        [
          "o",
          "a"
        ],
        [
          "l",
          "t"
        ],
        [
          "p",
          "t"
        ],
        [
          "t",
          "a"
        ]
      ],
      solucao: {
        r: "l",
        l: "o",
        o: "n",
        e: "q",
        q: "c"
      },
      armadilha: {
        r: "l",
        l: "e",
        e: "q",
        q: "c"
      },
      novidade: "Ronda: o vilão anda pelo prédio, um apartamento por batida"
    },
    dificuldade: "facil",
    referencia: "Hitman GO / Lara Croft GO: o guarda tem rota fixa e visível, e você escolhe em que turno pisa na casa dele. Into the Breach: a ameaça é anunciada antes.",
    ideia: "O caminho curto passa pela Tânia justo na batida em que o Seu Zé faz a ronda ali; a Neide, fofoqueira, deixa o boato chegar na Tânia duas batidas depois, quando ele já foi embora.",
    vilao: "A ronda dele (Cida, casa, Cida, Tânia) cruza o atalho óbvio: sem ela a Rita chegaria na Cida em 4 setas, com ela só pelo desvio da Neide (5)."
  },
  {
    fase: {
      titulo: "Quem fala, ela ouve",
      boato: "A Vera anota quem cochicha no corredor",
      giros: 0,
      setas: 5,
      origens: [
        "r"
      ],
      vizinhos: [
        {
          id: "r",
          nome: "Rita",
          tipo: "comum",
          pos: [
            2,
            2
          ]
        },
        {
          id: "c",
          nome: "Cida",
          tipo: "comum",
          pos: [
            3,
            0
          ],
          interesse: {}
        },
        {
          id: "w",
          nome: "Vera",
          tipo: "assunto",
          pos: [
            3,
            1
          ],
          vigia: true
        },
        {
          id: "j",
          nome: "Jandira",
          tipo: "comum",
          pos: [
            1,
            3
          ]
        },
        {
          id: "e",
          nome: "Edu",
          tipo: "comum",
          pos: [
            1,
            1
          ]
        },
        {
          id: "m",
          nome: "Marlene",
          tipo: "comum",
          pos: [
            1,
            2
          ]
        },
        {
          id: "l",
          nome: "Íris",
          tipo: "comum",
          pos: [
            2,
            0
          ]
        },
        {
          id: "a",
          nome: "Ana",
          tipo: "comum",
          pos: [
            1,
            0
          ]
        },
        {
          id: "u",
          nome: "Rui",
          tipo: "comum",
          pos: [
            2,
            1
          ]
        },
        {
          id: "g",
          nome: "Solange",
          tipo: "comum",
          pos: [
            0,
            2
          ]
        },
        {
          id: "o",
          nome: "Caio",
          tipo: "comum",
          pos: [
            0,
            3
          ]
        }
      ],
      amizades: [
        [
          "r",
          "m"
        ],
        [
          "r",
          "u"
        ],
        [
          "c",
          "w"
        ],
        [
          "c",
          "l"
        ],
        [
          "w",
          "u"
        ],
        [
          "j",
          "o"
        ],
        [
          "e",
          "m"
        ],
        [
          "e",
          "a"
        ],
        [
          "e",
          "u"
        ],
        [
          "m",
          "g"
        ],
        [
          "l",
          "a"
        ],
        [
          "l",
          "u"
        ],
        [
          "g",
          "o"
        ]
      ],
      solucao: {
        r: "m",
        m: "e",
        e: "a",
        a: "l",
        l: "c"
      },
      armadilha: {
        r: "u",
        u: "l",
        l: "c"
      },
      novidade: "Vera: escuta quando um vizinho dela conta algo"
    },
    dificuldade: "facil",
    referencia: "Into the Breach: o perigo é visível antes do turno (o campo de escuta dela). Hitman GO: o atalho óbvio passa pelo olhar do guarda.",
    ideia: "O atalho curto passa pelo Rui, colado na Vera: receber ele pode, mas contar pra frente ela escuta. Volta-se pela esquerda, que custa 2 setas a mais.",
    vilao: "A Vera mora ao lado do corredor natural: sem a escuta dela a Rita chegaria na Cida em 3 setas."
  },
  {
    fase: {
      titulo: "Dois olhos no mesmo caminho",
      boato: "Seu Zé e a Vera trocam turnos de vigia na portaria",
      giros: 0,
      setas: 6,
      origens: [
        "r"
      ],
      vizinhos: [
        {
          id: "r",
          nome: "Rita",
          tipo: "comum",
          pos: [
            3,
            4
          ]
        },
        {
          id: "c",
          nome: "Cida",
          tipo: "comum",
          pos: [
            1,
            2
          ],
          interesse: {}
        },
        {
          id: "z",
          nome: "Seu Zé",
          tipo: "assunto",
          pos: [
            0,
            3
          ],
          ronda: [
            "c",
            "h",
            "z",
            "g"
          ]
        },
        {
          id: "w",
          nome: "Vera",
          tipo: "assunto",
          pos: [
            2,
            1
          ],
          vigia: true
        },
        {
          id: "i",
          nome: "Lia",
          tipo: "comum",
          pos: [
            3,
            3
          ]
        },
        {
          id: "h",
          nome: "Dona Zefa",
          tipo: "comum",
          pos: [
            0,
            2
          ]
        },
        {
          id: "d",
          nome: "Davi",
          tipo: "comum",
          pos: [
            1,
            4
          ]
        },
        {
          id: "t",
          nome: "Otávio",
          tipo: "comum",
          pos: [
            2,
            4
          ]
        },
        {
          id: "j",
          nome: "Jandira",
          tipo: "comum",
          pos: [
            2,
            2
          ]
        },
        {
          id: "p",
          nome: "Paulo",
          tipo: "comum",
          pos: [
            4,
            4
          ]
        },
        {
          id: "g",
          nome: "Solange",
          tipo: "comum",
          pos: [
            1,
            3
          ]
        },
        {
          id: "a",
          nome: "Ana",
          tipo: "comum",
          pos: [
            1,
            1
          ]
        },
        {
          id: "y",
          nome: "Zeca",
          tipo: "comum",
          pos: [
            2,
            3
          ]
        },
        {
          id: "e",
          nome: "Edu",
          tipo: "comum",
          pos: [
            1,
            0
          ]
        },
        {
          id: "m",
          nome: "Marlene",
          tipo: "comum",
          pos: [
            0,
            0
          ]
        }
      ],
      amizades: [
        [
          "r",
          "i"
        ],
        [
          "r",
          "t"
        ],
        [
          "r",
          "p"
        ],
        [
          "c",
          "h"
        ],
        [
          "c",
          "j"
        ],
        [
          "c",
          "g"
        ],
        [
          "c",
          "a"
        ],
        [
          "z",
          "h"
        ],
        [
          "z",
          "g"
        ],
        [
          "w",
          "j"
        ],
        [
          "w",
          "a"
        ],
        [
          "i",
          "y"
        ],
        [
          "d",
          "t"
        ],
        [
          "d",
          "g"
        ],
        [
          "t",
          "y"
        ],
        [
          "j",
          "y"
        ],
        [
          "g",
          "y"
        ],
        [
          "a",
          "e"
        ],
        [
          "e",
          "m"
        ]
      ],
      solucao: {
        r: "i",
        i: "y",
        y: "t",
        t: "d",
        d: "g",
        g: "c"
      },
      armadilha: {
        r: "i",
        i: "y",
        y: "g",
        g: "c"
      },
      novidade: "Ronda: o vilão anda. Vera: escuta quem conta perto dela"
    },
    dificuldade: "medio",
    referencia: "Hitman GO: dois guardas, um com rota fixa e outro parado com cone de visão; Crypt of the NecroDancer: o passo só vale no compasso certo.",
    ideia: "O atalho pelo meio (Zeca, Solange, Cida) cai na Solange justo quando o Seu Zé está lá; a volta por baixo (Otávio, Davi) chega na Solange depois, com ele já em casa.",
    vilao: "O Seu Zé anda pela Dona Zefa e pela Solange, na porta da Cida, e a Vera vigia os vizinhos da Cida: sem qualquer um dos dois o caminho cairia de 6 para 4 setas."
  },
  {
    fase: {
      titulo: "A Soneca no meio do caminho",
      boato: "A Vera conta os passos do Seu Zé na escada",
      giros: 0,
      setas: 7,
      origens: [
        "r"
      ],
      vizinhos: [
        {
          id: "r",
          nome: "Rita",
          tipo: "comum",
          pos: [
            0,
            3
          ]
        },
        {
          id: "c",
          nome: "Cida",
          tipo: "comum",
          pos: [
            3,
            1
          ],
          interesse: {}
        },
        {
          id: "z",
          nome: "Seu Zé",
          tipo: "assunto",
          pos: [
            4,
            1
          ],
          ronda: [
            "c",
            "t",
            "c",
            "z"
          ]
        },
        {
          id: "w",
          nome: "Vera",
          tipo: "assunto",
          pos: [
            0,
            1
          ],
          vigia: true
        },
        {
          id: "s",
          nome: "Soneca",
          tipo: "comum",
          pos: [
            2,
            0
          ],
          soneca: true
        },
        {
          id: "j",
          nome: "Jandira",
          tipo: "comum",
          pos: [
            2,
            4
          ]
        },
        {
          id: "q",
          nome: "Tânia",
          tipo: "comum",
          pos: [
            2,
            3
          ]
        },
        {
          id: "h",
          nome: "Dona Zefa",
          tipo: "comum",
          pos: [
            1,
            3
          ]
        },
        {
          id: "e",
          nome: "Edu",
          tipo: "comum",
          pos: [
            0,
            2
          ]
        },
        {
          id: "l",
          nome: "Íris",
          tipo: "comum",
          pos: [
            1,
            2
          ]
        },
        {
          id: "a",
          nome: "Ana",
          tipo: "comum",
          pos: [
            3,
            4
          ]
        },
        {
          id: "k",
          nome: "Celina",
          tipo: "comum",
          pos: [
            0,
            4
          ]
        },
        {
          id: "m",
          nome: "Marlene",
          tipo: "comum",
          pos: [
            2,
            2
          ]
        },
        {
          id: "t",
          nome: "Otávio",
          tipo: "comum",
          pos: [
            3,
            0
          ]
        },
        {
          id: "p",
          nome: "Paulo",
          tipo: "comum",
          pos: [
            2,
            1
          ]
        },
        {
          id: "g",
          nome: "Solange",
          tipo: "comum",
          pos: [
            4,
            4
          ]
        }
      ],
      amizades: [
        [
          "r",
          "h"
        ],
        [
          "r",
          "e"
        ],
        [
          "r",
          "k"
        ],
        [
          "c",
          "z"
        ],
        [
          "c",
          "t"
        ],
        [
          "c",
          "p"
        ],
        [
          "w",
          "e"
        ],
        [
          "s",
          "t"
        ],
        [
          "s",
          "p"
        ],
        [
          "j",
          "q"
        ],
        [
          "j",
          "a"
        ],
        [
          "q",
          "h"
        ],
        [
          "q",
          "m"
        ],
        [
          "e",
          "l"
        ],
        [
          "l",
          "m"
        ],
        [
          "a",
          "g"
        ],
        [
          "m",
          "p"
        ]
      ],
      solucao: {
        r: "h",
        h: "q",
        q: "m",
        m: "p",
        p: "s",
        s: "t",
        t: "c"
      },
      armadilha: {
        r: "e",
        e: "l",
        l: "m",
        m: "p",
        p: "s",
        s: "t",
        t: "c"
      },
      novidade: "Vera: escuta quem conta ao lado. Ronda: o Seu Zé anda. Soneca atrasa a vez"
    },
    dificuldade: "medio",
    referencia: "Crypt of the NecroDancer: o compasso decide, e um dos personagens atrasa o seu. Hitman GO: guarda com rota e guarda parado cobrindo o atalho.",
    ideia: "O atalho pela esquerda passa por Edu, que mora colado na Vera e fala; a volta pelo centro entra no corredor Paulo, Soneca, Otávio, Cida, e a pausa da Soneca faz o boato chegar nele sem cruzar com o Seu Zé.",
    vilao: "A Vera cobre o atalho natural e o Seu Zé faz a ronda justo pela Cida e pelo Otávio, a reta final: sem a ronda bastariam 5 setas, e sem a Vera o atalho vence."
  },
  {
    fase: {
      titulo: "O compasso da Soneca",
      boato: "O Seu Zé dá a volta no quarteirão e a Vera olha da janela",
      giros: 0,
      setas: 8,
      origens: [
        "r"
      ],
      vizinhos: [
        {
          id: "r",
          nome: "Rita",
          tipo: "comum",
          pos: [
            2,
            5
          ]
        },
        {
          id: "c",
          nome: "Cida",
          tipo: "comum",
          pos: [
            3,
            0
          ],
          interesse: {}
        },
        {
          id: "z",
          nome: "Seu Zé",
          tipo: "assunto",
          pos: [
            4,
            2
          ],
          ronda: [
            "g",
            "i",
            "s",
            "z"
          ]
        },
        {
          id: "w",
          nome: "Vera",
          tipo: "assunto",
          pos: [
            1,
            1
          ],
          vigia: true
        },
        {
          id: "s",
          nome: "Soneca",
          tipo: "comum",
          pos: [
            3,
            2
          ],
          soneca: true
        },
        {
          id: "d",
          nome: "Davi",
          tipo: "comum",
          pos: [
            1,
            4
          ]
        },
        {
          id: "k",
          nome: "Celina",
          tipo: "comum",
          pos: [
            1,
            5
          ]
        },
        {
          id: "e",
          nome: "Edu",
          tipo: "comum",
          pos: [
            4,
            3
          ]
        },
        {
          id: "i",
          nome: "Lia",
          tipo: "comum",
          pos: [
            3,
            1
          ]
        },
        {
          id: "x",
          nome: "Wesley",
          tipo: "comum",
          pos: [
            2,
            2
          ]
        },
        {
          id: "l",
          nome: "Íris",
          tipo: "comum",
          pos: [
            2,
            4
          ]
        },
        {
          id: "u",
          nome: "Rui",
          tipo: "comum",
          pos: [
            2,
            1
          ]
        },
        {
          id: "a",
          nome: "Ana",
          tipo: "comum",
          pos: [
            3,
            4
          ]
        },
        {
          id: "o",
          nome: "Caio",
          tipo: "comum",
          pos: [
            2,
            3
          ]
        },
        {
          id: "m",
          nome: "Marlene",
          tipo: "comum",
          pos: [
            0,
            5
          ]
        },
        {
          id: "g",
          nome: "Solange",
          tipo: "comum",
          pos: [
            4,
            1
          ]
        },
        {
          id: "p",
          nome: "Paulo",
          tipo: "comum",
          pos: [
            4,
            4
          ]
        },
        {
          id: "y",
          nome: "Zeca",
          tipo: "comum",
          pos: [
            0,
            4
          ]
        },
        {
          id: "t",
          nome: "Otávio",
          tipo: "comum",
          pos: [
            0,
            1
          ]
        },
        {
          id: "v",
          nome: "Ivo",
          tipo: "comum",
          pos: [
            1,
            3
          ]
        }
      ],
      amizades: [
        [
          "r",
          "k"
        ],
        [
          "r",
          "l"
        ],
        [
          "c",
          "i"
        ],
        [
          "z",
          "s"
        ],
        [
          "z",
          "e"
        ],
        [
          "z",
          "g"
        ],
        [
          "w",
          "u"
        ],
        [
          "w",
          "t"
        ],
        [
          "s",
          "i"
        ],
        [
          "s",
          "x"
        ],
        [
          "d",
          "l"
        ],
        [
          "d",
          "y"
        ],
        [
          "d",
          "v"
        ],
        [
          "k",
          "m"
        ],
        [
          "e",
          "p"
        ],
        [
          "i",
          "u"
        ],
        [
          "i",
          "g"
        ],
        [
          "x",
          "u"
        ],
        [
          "x",
          "o"
        ],
        [
          "l",
          "a"
        ],
        [
          "l",
          "o"
        ],
        [
          "a",
          "p"
        ],
        [
          "o",
          "v"
        ],
        [
          "m",
          "y"
        ]
      ],
      solucao: {
        r: "l",
        l: "d",
        d: "v",
        v: "o",
        o: "x",
        x: "s",
        s: "i",
        i: "c"
      },
      armadilha: {
        r: "l",
        l: "d",
        d: "v",
        v: "o",
        o: "x",
        x: "u",
        u: "i",
        i: "c"
      },
      novidade: "Vera: escuta quem conta ao lado. Ronda: o Seu Zé anda. Soneca atrasa a vez"
    },
    dificuldade: "dificil",
    referencia: "Crypt of the NecroDancer (ritmo) e Hitman GO (ronda previsível com um guarda vigiando o atalho); a pausa da Soneca vira o compasso extra.",
    ideia: "O caminho curto por Rui cai no olhar da Vera, e o longo precisa que a Soneca passe o boato adiante numa batida em que o Seu Zé já esteja longe da Lia e da Cida.",
    vilao: "A Vera guarda o atalho pelo Rui e o Seu Zé anda por Solange, Lia e Soneca, perto da estrela: sem a ronda bastariam 6 setas, sem a Vera o atalho vence."
  },
  {
    fase: {
      titulo: "A guarda de cinco batidas",
      boato: "O Seu Zé só vai pra casa na sexta batida",
      giros: 0,
      setas: 10,
      origens: [
        "r"
      ],
      vizinhos: [
        {
          id: "r",
          nome: "Rita",
          tipo: "comum",
          pos: [
            4,
            0
          ]
        },
        {
          id: "c",
          nome: "Cida",
          tipo: "comum",
          pos: [
            0,
            2
          ],
          interesse: {}
        },
        {
          id: "z",
          nome: "Seu Zé",
          tipo: "assunto",
          pos: [
            1,
            1
          ],
          ronda: [
            "p",
            "c",
            "p",
            "c",
            "p",
            "z"
          ]
        },
        {
          id: "w",
          nome: "Vera",
          tipo: "assunto",
          pos: [
            2,
            0
          ],
          vigia: true
        },
        {
          id: "s",
          nome: "Soneca",
          tipo: "comum",
          pos: [
            1,
            4
          ],
          soneca: true
        },
        {
          id: "u",
          nome: "Rui",
          tipo: "comum",
          pos: [
            2,
            3
          ]
        },
        {
          id: "l",
          nome: "Íris",
          tipo: "comum",
          pos: [
            0,
            3
          ]
        },
        {
          id: "i",
          nome: "Lia",
          tipo: "comum",
          pos: [
            1,
            5
          ]
        },
        {
          id: "d",
          nome: "Davi",
          tipo: "comum",
          pos: [
            4,
            5
          ]
        },
        {
          id: "q",
          nome: "Tânia",
          tipo: "comum",
          pos: [
            2,
            5
          ]
        },
        {
          id: "k",
          nome: "Celina",
          tipo: "comum",
          pos: [
            4,
            1
          ]
        },
        {
          id: "a",
          nome: "Ana",
          tipo: "comum",
          pos: [
            3,
            3
          ]
        },
        {
          id: "j",
          nome: "Jandira",
          tipo: "comum",
          pos: [
            3,
            5
          ]
        },
        {
          id: "x",
          nome: "Wesley",
          tipo: "comum",
          pos: [
            3,
            0
          ]
        },
        {
          id: "h",
          nome: "Dona Zefa",
          tipo: "comum",
          pos: [
            0,
            4
          ]
        },
        {
          id: "t",
          nome: "Otávio",
          tipo: "comum",
          pos: [
            3,
            1
          ]
        },
        {
          id: "e",
          nome: "Edu",
          tipo: "comum",
          pos: [
            3,
            2
          ]
        },
        {
          id: "p",
          nome: "Paulo",
          tipo: "comum",
          pos: [
            0,
            1
          ]
        },
        {
          id: "v",
          nome: "Ivo",
          tipo: "comum",
          pos: [
            0,
            5
          ]
        },
        {
          id: "o",
          nome: "Caio",
          tipo: "comum",
          pos: [
            1,
            3
          ]
        }
      ],
      amizades: [
        [
          "r",
          "k"
        ],
        [
          "r",
          "x"
        ],
        [
          "c",
          "l"
        ],
        [
          "c",
          "p"
        ],
        [
          "z",
          "p"
        ],
        [
          "w",
          "x"
        ],
        [
          "s",
          "i"
        ],
        [
          "s",
          "h"
        ],
        [
          "s",
          "o"
        ],
        [
          "u",
          "a"
        ],
        [
          "u",
          "o"
        ],
        [
          "l",
          "h"
        ],
        [
          "l",
          "o"
        ],
        [
          "i",
          "q"
        ],
        [
          "i",
          "v"
        ],
        [
          "d",
          "j"
        ],
        [
          "q",
          "j"
        ],
        [
          "k",
          "t"
        ],
        [
          "a",
          "e"
        ],
        [
          "x",
          "t"
        ],
        [
          "h",
          "v"
        ],
        [
          "t",
          "e"
        ]
      ],
      solucao: {
        r: "k",
        k: "t",
        t: "e",
        e: "a",
        a: "u",
        u: "o",
        o: "s",
        s: "h",
        h: "l",
        l: "c"
      },
      armadilha: {
        r: "x",
        x: "t",
        t: "e",
        e: "a",
        a: "u",
        u: "o",
        o: "s",
        s: "h",
        h: "l",
        l: "c"
      },
      novidade: "Vera: escuta quem conta ao lado. Ronda: o Seu Zé anda. Soneca atrasa a vez"
    },
    dificuldade: "dificil",
    referencia: "Crypt of the NecroDancer: um padrão longo com uma única brecha; Lara Croft GO: esperar o guarda se afastar. Into the Breach: dá pra ler a ameaça inteira antes de jogar.",
    ideia: "O Seu Zé fica rondando a porta da Cida (Paulo, Cida, Paulo, Cida, Paulo) e só uma batida em seis em casa: o boato tem que ser empurrado até ela, e o atraso da Soneca encaixa o fim na brecha. A Vera fecha o atalho do alto.",
    vilao: "O atalho curto da Rita passa pelo Wesley, colado na Vera, e o fim do caminho fica sob a ronda do Seu Zé: sem a ronda bastariam 8 setas, sem a Vera o atalho vence."
  }
];
