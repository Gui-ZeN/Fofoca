# Fofoca! — o jogo inteiro

> Retrato do jogo em **12/11/2026**, tirado do código (`Fofoca/src`). Publicado em **https://gui-zen.github.io/Fofoca/**. Ninguém de fora jogou ainda.
> Plano de negócio e cronograma: `../reports/Fofoca plano de protótipo.md`. Consultas com outros modelos: vault, `Projetos/Fofoca — Consulta 1` a `6`.

---

## 1. Em uma frase

Um quebra-cabeça de **reação em cadeia** num prédio em corte: você desenha quem conta o boato pra quem, para ele chegar em quem quer saber — no tamanho, na versão e na ordem certos — **sem chegar na vítima**, que é sobre quem estão falando.

- **Público:** adultos casuais de 25 a 45 anos (forte público feminino 35+), celular em pé, partidas de 3 a 5 minutos, uma mão. Global desde o início; texto nasce em pt-BR.
- **Tom:** "**Conforme o regulamento**" — o condomínio leva as suas bobagens administrativamente a sério (aviso, placa, carimbo), e os moradores tratam cada aviso como oportunidade de pergunta. **Nunca** aparência, raça, orientação ou doença como piada; a piada nunca toma o lugar de uma instrução.
- **O momento-chave:** ver os vizinhos **encenarem** o plano — quem conta cochicha, o balão atravessa a porta, quem ouve leva susto — e a derrota engraçada, quando a vítima descobre e grita "**QUÊ?!**".

---

## 2. A história

- O lugar é o **Edifício Primavera**, um predinho brasileiro visto em corte, como casa de boneca.
- **Seu Zé é o síndico e odeia fofoca.** Às vezes ele é a vítima do boato; às vezes o boato é sobre outro morador (sorteado — "pra não parecer perseguição").
- Os **fiscais do condomínio** (Arnaldo, Vera, Dona Norma, Dr. Álvaro) são vítimas com **regra própria** — o primeiro já está em protótipo (seção 5.2).
- Quando a vítima descobre, o síndico dá uma **advertência** (com carimbo). Três e você fica **suspenso** até ele tirar uma (seção 8).
- O menu é o próprio prédio: uma janela com três andares e o elevador (seção 9).
- **Dona Glória** é a samambaia que o síndico trata como moradora (cadeira "RESERVADO" no menu, num banquinho na portaria).

---

## 3. Como se joga (o "trilho")

1. A fase abre dizendo **pra quem você contou** (a origem: selo de balão amarelo na plaquinha). Ela já começa com um **cochicho**.
2. Você **desenha setas**: toca em quem conta e depois no vizinho que vai ouvir (ou arrasta de um apartamento pro outro). Cada morador tem **no máximo uma seta de saída**. Quem fica **sem seta guarda o boato pra si**.
3. Há um limite de setas (**"Setas x/K"**). Acabou, o contador treme.
4. Aperta **Espalhar!** e assiste, **uma batida por vez** (850 ms, ou 425 ms com **×2**):
   - quem conta faz a pose de **cochicho**, virado pra quem vai ouvir;
   - um **balão do tamanho enviado** percorre a seta, atravessando a porta ou a escada;
   - quem ouve faz **susto** e a luz do apartamento acende (amarelo forte com moldura).
5. **Vence** se todas as estrelas (⭐) ouvirem — no tamanho, na versão e na ordem pedidos — e a vítima **não** ouvir.
6. No fim: **Tentar de novo** (zera as setas e volta com a origem selecionada — pedido do dono em 2026-11-12; antes mantinha o plano) / **Repetir** na vitória, **Rever** (passo a passo, uma batida por vez, com ‹ ›) e **Próxima fase**.

**Controles:**
- Tocar num apartamento seleciona quem vai contar (**4 cantoneiras** azuis) e destaca pra quem dá pra contar (contorno **tracejado**).
- Depois de desenhar uma seta, a seleção pula pra quem vai ouvir, pra continuar a corrente tocando um atrás do outro.
- Tocar de novo no mesmo destino apaga a seta. **Desfazer** volta o último passo.
- A frase azul diz o que está acontecendo: "Rita guarda pra si. Toque em quem vai ouvir." / "As setas acabaram: aperte Espalhar ou desfaça."

---

## 4. As regras (o motor)

O motor é determinístico (`src/motor.ts`, função `espalhar`): a mesma jogada dá sempre o mesmo resultado. Nada de sorte.

**Como o boato anda:**
- Cada morador **ouve uma vez só**. Depois de ouvir, na batida seguinte ele conta (se tiver pra quem). Ninguém fica esperando.
- Se duas mensagens chegam juntas na mesma pessoa, **vale a maior**; empate, vale a versão normal.
- Quem está **fora de casa** perde o recado que chegar antes da volta (padaria).
- Ordem fixa ao enviar: o **Exagerado aumenta primeiro**, o **Arnaldo reduz depois**; o **Do Contra inverte ao contar** (ele mesmo ouviu a versão certa).

**Tamanhos do boato:** **cochicho → fofoca → escândalo** (1, 2, 3). Começa sempre em cochicho. Cada um tem forma própria: cochicho achatado e pontilhado, fofoca redonda com "!", escândalo pontudo com "!!". "Boato" é o nome da coisa toda (o tamanho do meio se chamava "boato" e confundia).

**Versão:** normal ou **ao contrário** (balão azul com setinhas trocadas). A estrela que declara uma versão só acredita nela.

**Quem é quem:**

| Tipo | O que faz | Aceita seta? | Marca na plaquinha |
|---|---|---|---|
| **Comum** | conta pra quem a seta mandar; sem seta, guarda | sim | — |
| **Fofoqueira** (Neide, Lu) | conta pra **todos** os vizinhos de passagem, sozinha, na mesma batida | não | — |
| **Exagerado** (Beto, Lúcia) | conta **um tamanho maior** (máx. escândalo) | sim | **+1** |
| **Do Contra** (Nonato) | conta a **versão ao contrário** | sim | **⇄** |
| **Nando** (apressado) | **não aceita seta**: conta sozinho pra quem mora do **lado oposto** de quem contou pra ele (sem passagem do outro lado, guarda) | não | **⚡** + seta tracejada do caminho |
| **Raquel** (desconfiada) | só **acredita ouvindo de duas pessoas diferentes**; com uma, fica em dúvida e não repassa (nem conta como estrela) | sim | **2×** |
| **Arnaldo** (fiscal) | vítima; **quem mora colado nele conta um tamanho menor** (mín. cochicho) | não | **−1** em cada vizinho afetado |
| **Padre** | ouve e não conta (só no motor; fora do trilho — não muda nenhuma jogada) | não | — |
| **Vítima** (Seu Zé, sorteado ou fiscal) | se ouvir, você perde | não | octógono vermelho com "!" |
| **Estrela ⭐** | quem quer saber; pode exigir **tamanho exato** (`=` e o balão), **versão** (o balão certo ou o invertido) ou **lugar na fila** (⭐1, ⭐2) | sim | estrela |

**Como se perde** (a frase, e o que o prédio mostra):

| Motivo | Frase | No prédio |
|---|---|---|
| A vítima ouviu | "Neide contou pro Seu Zé! Agora ele sabe que estão falando dele." (se foi a fofoqueira, ela se defende: *"Eu ia te contar por último."*) | seta vermelha de quem contou, vítima **brava** com "QUÊ?!" em letras soltas; com advertência, **carimbo** do síndico |
| Estrela não ouviu | "Cida não ficou sabendo de nada." / "Cida ainda estava na padaria quando o recado chegou." | plaquinha "não ouviu" / "recado na 2 · volta na 4" |
| Tamanho errado | "Cida queria uma fofoca e recebeu um escândalo." | plaquinha "queria [balão] veio [balão]" |
| Versão errada | "Ana ouviu a versão ao contrário e não acreditou." / "…só acredita na versão ao contrário, e ouviu a certa." | plaquinha "queria / veio" com o balão invertido |
| Ordem errada | "A Bia tinha que saber antes da Cida." | "ouviu na N" nas duas estrelas ("junto, na N" no empate) |

**Vitória:** "Bia, Rita e Rui ficaram sabendo. Seu Zé nem desconfia."

---

## 5. As mecânicas

### 5.1 Na campanha (na ordem em que aparecem)

| Mecânica | Como funciona | Estreia (andar) |
|---|---|---|
| **Seta / trilho** | você desenha quem conta pra quem, até K setas | 1 |
| **Guardar** | quem fica sem seta não conta | 2 |
| **Estrela passa adiante** | quem quer saber também pode contar | 3 |
| **Fofoqueira** | conta pra todo mundo em volta sozinha — perigo perto da vítima, recurso quando longe | 4 |
| **Exagerado + tamanho exato** | +1 tamanho por Exagerado; a estrela quer exatamente aquele tamanho | 9 |
| **Padaria (fora de casa)** | placa com pão e número: recado que chega antes daquela batida se perde. Vale pra estrela e pra vítima | 10 |
| **Celular** | uma pessoa pode ligar pra alguém longe, sem passagem (linha pontilhada com telefone) | 13 (só ali) |
| **Ordem** | ⭐1 tem que saber antes da ⭐2; junto não vale | 15 |
| **Vera, a vigia** | a vítima é ela, e ela **escuta quando um vizinho dela conta algo** pra outra pessoa (os vizinhos ganham o selo "psiu"). Ouvir e guardar do lado dela pode; contar, não | 29 |

**Passagens:** **porta** (vizinhos lado a lado: a parede some, batente e folha aberta) e **escada** (um em cima do outro: um lance do chão de baixo até o buraco na laje). Só existe passagem onde está desenhada.

### 5.2 Em protótipo (fora da campanha, Consulta 6)

Pedido do Guilherme: "temos muitos que ajudam e poucos que dificultam". O Sol (Consulta 6) contestou: o problema medido é **variedade** (as 178 fases pedem o mesmo raciocínio), e cada regra nova deve **mudar a escolha de rota por um motivo compreensível**. Por isso **uma regra por vez**, cada uma com **3 fases** de funções diferentes, testada antes de entrar no gerador.

**Arnaldo, o fiscal do barulho** — `?bloco=arnaldo`. Ele é a vítima; quem mora colado nele conta um tamanho menor.

| Fase | Função | O que acontece |
|---|---|---|
| A1 · Fala baixo, Beto | reconhecer | o Beto (+1) mora colado no Arnaldo (−1): sai cochicho de novo, e a estrela quer cochicho |
| A2 · Corredor do silêncio | escolher | dois caminhos de 3 setas: pelo Rui (colado nele) a fofoca vira cochicho; pela Ana chega inteira |
| A3 · Escândalo demais | usar de propósito | Beto + Lúcia fazem escândalo; a estrela quer fofoca; só passando colado no Arnaldo o boato baixa |

Cena de chegada: "**Fiscal novo!**" — *"Psiu! Aqui ninguém grita."* (entra uma fofoca, sai um cochicho).

**Nonato, o Do Contra** — `?bloco=nonato`. Conta tudo ao contrário.

| Fase | Função | O que acontece |
|---|---|---|
| N1 · O do contra | desviar | pelo Nonato a estrela ouve ao contrário; o outro caminho entrega certa |
| N2 · Do avesso | usar de propósito | a estrela só acredita na versão ao contrário; o atalho entrega a certa |
| N3 · Cada um com a sua | acompanhar a troca | uma estrela quer a certa e a outra a ao contrário: passar pela primeira **antes** do Nonato |

Cena de chegada: "**Morador novo!**" — *"Isso aí? Foi o contrário."* Ficou de fora "dois Do Contra se anulam" (só existe um personagem do contra).

**Raquel, a desconfiada** — `?bloco=raquel` (2026-11-12; com o Yorkshire). Só acredita ouvindo de **duas pessoas diferentes**, somando batidas (duas na mesma batida já convencem). Acredita no **maior** dos recados que ouviu (empate: no primeiro) — ⚠️ antes era "o maior" na mesma batida e "o segundo" em batidas diferentes, um desempate que ninguém via (Consulta 7). Escolhida pela crítica do Fable — é a única regra que quebra "solução = um caminho só": como cada um conta pra um só, abrir dois galhos exige a Fofoqueira, e os galhos se juntam nela. Na tela: selo **2×** na plaquinha; em dúvida, o balão da 1ª fonte apagado com um **?** e a cara desconfiada; na derrota, "Raquel só ouviu da Neide e não acreditou." e a plaquinha "ouviu de 1 só".

**Nando, o apressado** — `?bloco=apressado` (2026-11-12). Não aceita seta: conta sozinho pra quem mora do **lado oposto** de quem contou pra ele (ouviu da esquerda, conta pra direita; de baixo, pra cima). Sem passagem do outro lado, ou se recebeu por celular, guarda. **Com dois recados na mesma batida, ele se atrapalha e guarda** (⚠️ antes saía pro lado de quem ganhava um desempate invisível — Consulta 7; a cena de chegada avisa). Veio do estudo do Fable (Sporos): é a única regra em que o **lado por onde o boato entra** decide pra onde ele sai. Selo **⚡** (pressa) na plaquinha — ⚠️ era **»**, e quem jogou leu "sempre pra direita"; enquanto você monta, com uma seta chegando nele, uma **seta tracejada verde** mostra pra onde ele vai passar (ensina a regra sem tirar o problema: escolher por onde entrar). Se ele entrega pro Zé, a fala é *"Ué, eu só passei reto!"*. O elenco não sorteia outro "Nando" no mesmo prédio.

| Fase | Função | O que acontece |
|---|---|---|
| P1 · Passa reto | reconhecer | entrando pela esquerda, ele passa reto pra estrela — uma seta a menos |
| P2 · Corrida no corredor | desviar | contar direto pra ele (de baixo) faz ele subir reto até o Zé; a volta é pela esquerda |
| P3 · Entrou por onde? | usar de propósito | só ele chega na estrela: pela esquerda manda pro Zé; por cima desce pra Ana |

Cena de chegada: "**Morador novo!**" — *"Tô com pressa! Conto pro primeiro que aparecer."* Testes conferidos por mutação: com a regra desligada, 4 de 15 falham.

| Fase | Função | O que acontece |
|---|---|---|
| R1 · Só acredito ouvindo duas vezes | reconhecer | ela é a estrela; a Fofoqueira conta pra ela, e a 2ª fonte vem por Ana e Bia |
| R2 · Caminho travado | desviar | o atalho passa por ela com uma fonte só e trava; a volta tem 5 setas |
| R3 · Duas bocas | usar de propósito | só ela chega na estrela: a Fofoqueira abre dois galhos que se juntam nela |

Cena de chegada: "**Moradora nova!**" — *"Hum… quem mais te contou?"* (um balão chega, fica o "?", o segundo vem do outro lado). Testes conferidos por mutação: desligando a regra, 9 de 15 falham.

**Critério pra entrar na campanha** (teste com 5 pessoas): 4/5 reconhecem quem é afetado; 4/5 preveem o tamanho/versão antes de espalhar; 3/5 resolvem a 3ª fase sem ajuda e explicam por que precisaram passar ali.

### 5.3 Ideias discutidas, ainda não construídas

- **Vera, a vigia** — `?bloco=vera` (protótipo de 2026-11-12; **na campanha desde 2026-11-13**, andares 29–31, e no estoque gerado). **Escuta quando um vizinho dela conta algo** pra outra pessoa; receber e guardar do lado dela pode. Selo "ouve". Derrota: "Vera escutou o Rui contando do lado!". Fala de chegada: *"Eu não durmo. Eu escuto."*
- **Dona Norma** — `?bloco=norma` (protótipo). Toque de recolher: **depois da batida N, quem mora colado nela não conta mais nada**. Selo "até N". Fala: *"Passou da hora, acabou a conversa."* (O rascunho era "fecha uma passagem após a batida N"; virou a vizinhança inteira, que se lê melhor. Alternativa não feita: tolerar ouvir uma vez.)
- **Dr. Álvaro** — `?bloco=alvaro` (protótipo). Lotação: **no máximo N pessoas sabendo**, contando a origem. Selo "máx N"; derrota "Ficaram 5 sabendo, e o Dr. Álvaro só tolera 4." Só morde com Fofoqueira no prédio (ela espalha demais), e todas as fases dele têm. Fala: *"Isso é assunto reservado."*
- Os três têm **3 fases cada** (`src/fiscais.ts`), achadas com buscador. As duas primeiras são "a regra atrapalha"; a 3ª da **Vera** (a estrela mora colada nela: receber e guardar pode) e da **Dona Norma** (uma Fofoqueira colada nela ouve na solução, tarde o bastante pra já estar calada) usam a regra como **ferramenta**. O **Dr. Álvaro não ganhou** fase assim: com a Fofoqueira na solução ela sai em 1–2 setas e a lotação deixa de decidir (busca sem candidatos) — as três dele seguem "desvie da Neide", motivo de o Astra sugerir adiá-lo. Na tela: selo do fiscal embaixo do nome, vizinhos marcados ("psiu" / "até N"), contador "Sabendo N/M" pro Álvaro. Testes por mutação: com as três regras desligadas, 21 de 28 falhavam.
- **Duplas** — `?bloco=duplas` (2026-11-12, pedido do dono: fases com vários especiais). Três fases, cada uma com duas regras que mudam a jogada (teste: tirando qualquer uma, a solução é outra): **Fofoqueira + Nando** (ela atinge o Nando; por qual lado?), **Nando + Raquel** (ele é uma das duas fontes dela), **Vera + Raquel** (juntar dois galhos sem ninguém falar do lado da vigia). Cabem no teto de leitura.
- **Sem nomes e plaquinha de madeira são o padrão** (2026-11-12, ideia do dono, aprovada comparando prints): na tela ficam só os símbolos de papel e de regra (origem, estrela, vítima, megafone, +1, ⚡, 2×, selo do fiscal); morador comum não mostra nada. O nome aparece em quem está selecionado e, no fim da fase, em todos (o desfecho cita nomes). Nome só em quem tem regra viraria dica, por isso é ninguém. `?nomes` mostra os nomes sempre. A plaquinha e a placa da padaria passaram do papel branco pra madeira clara com contorno marrom, na paleta do prédio.
- **Apartamento baixo é o padrão** (2026-11-12, a "terceira saída" do Astra, aprovada pelo dono): cômodo 136 → 112 de altura, morador ×0,8, largura, plaquinha e texto iguais. Medido num celular de 390×720 (barra do navegador aberta): o chefão 3×5 rolava e agora cabe (personagem 96 → 77 px). `?alto` mostra o formato antigo. O balão e o "?" da Raquel sobem menos que o chão, pra não cair em cima do nome.
- **Tela limpa é o padrão** (2026-11-13, ideia do dono: "hoje muito espaço é ocupado pra textos e botões… não seria mais fácil ter um modal?"; aprovada no celular: "gostei dela limpa"). O topo fica só com a navegação e o contador de setas. Título, fofoca e a regra nova abrem a fase num **cartão**, que some no **primeiro toque** — e esse toque já vale no prédio (um modal com "Jogar" custava um toque a mais por fase); tocar no contador reabre. No fim, o texto do desfecho vira um cartão junto dos botões, com "Ver o prédio" pra recolher. **Onde os cartões ficam:** em prédio de 4 andares ou mais, sobem do rodapé; em prédio baixo (até 3 andares, que fica no pé do palco com céu sobrando) vão pro alto — subindo do rodapé, cobriam o andar 1 inteiro. O cartão do fim também vai pro alto quando quem errou mora no térreo, pra explicação não tapar a prova. O rodapé cresce por cima do palco, sem o prédio pular. Ganho medido num celular de 390×760: o cômodo do 3×5 vai de 85×79 pra 99×92; nos prédios de até 4 andares e nos de 4 colunas o limite é a largura, e só a tela fica mais limpa. A frase de ajuda continua só no tutorial. `?classico` mostra a tela antiga.
- **Celular como recurso:** ligação de qualquer um pra qualquer um **quebra** fases (no andar 4 a Rita ligaria direto pra Cida). Se entrar como **ajuda**: uma por fase, aceitando várias soluções quando usada; nunca "ganhar por vencer de primeira". Em aberto.
- **Padre:** só valeria com regra nova ("Padre ouviu: assunto encerrado" — o boato para naquela batida).
- Mecânicas de tempo (padaria, porta com horário, "enrolado") são da mesma família: testar uma de cada vez.

---

## 6. O elenco

Arte **ilustrada** (gerada por IA a partir de uma prancha do Guilherme), uma folha de poses por pessoa: **parado** (quieto ou ouvindo), **cochicho** (contando, mão em concha, virado pro destino), **susto** (acabou de ouvir; estrela na vitória) e **bravo** (vítima pega — quem pode virar vítima tem). A imagem espelha pra pessoa olhar pra quem conta; cada pose pode ter sua própria direção (o Rui olha pra esquerda, mas cochicha pra direita). Todos "respiram", cada um no seu tempo.

| Grupo | Quem |
|---|---|
| Síndico | **Seu Zé** (braços cruzados, chaveiro) |
| Fofoqueiras | **Neide** (bobes, mão na orelha), **Lu** |
| Exagerados | **Beto** (braços abertos), **Lúcia** |
| Do Contra | **Nonato** (dedo em riste) |
| Desconfiada | **Raquel** (com o Yorkshire; em protótipo) |
| Apressado | **Nando** (em protótipo) |
| Comuns na campanha | **Cida** (xícara), **Ana**, **Bia** (com o cachorro), **Rita**, **Lia**, **Davi**, **Rui**, **Edu** |
| Fiscais | **Arnaldo** (em protótipo), **Vera**, **Dona Norma**, **Dr. Álvaro** |
| Moradores novos | **Marlene, Caio, Jandira, Otávio, Celina, Nando, Solange, Ivo** |

- 27 personagens, 114 imagens (~2,4 MB) em `public/arte/` com `manifesto.json`. O **Padre** (batina, crucifixo, bíblia) tem arte pronta, mas não aparece em nenhuma fase do trilho.
- **Sorteio:** a cada abertura, os nomes dos comuns trocam dentro do mesmo gênero (Rita, Ana, Bia, Cida, Marlene, Jandira, Celina, Solange · Davi, Rui, Edu, Caio, Otávio, Nando, Ivo), o prédio pode espelhar, e em ~35% das vezes a vítima não é o Seu Zé: metade dessas vezes um **fiscal** (Vera, Dona Norma, Dr. Álvaro — sem regra própria), metade um morador. Os textos acompanham, inclusive títulos que dizem só "Zé".
- ⚠️ O **Arnaldo** não entra no sorteio de vítima (ele tem regra; aparecer sem ela ensinaria errado) e nunca é renomeado.
- ⚠️ A volta dos **bobes da Neide** foi decisão do Guilherme, contra o corte por estereótipo da Consulta 5.
- O desenho antigo em SVG fica de reserva: pra quem não tem imagem e no link **`?vetor`**.

---

## 7. A campanha (os andares)

### 7.1 Tutorial (andares 1–5)
- Cada fase tem **uma dica de uma frase**, que diz a regra e **nunca** a jogada. Some na primeira seta. O andar 1 também diz o objetivo: "Faça o boato chegar em quem tem a estrela."
- **Não custa advertência**, mesmo perdendo.

### 7.2 Depois do tutorial
- Regra nova aparece numa **etiqueta NOVO** de uma linha e numa **cena de chegada** antes da fase (seção 10).
- **Intercalado:** fase pesada, depois uma mais leve.

### 7.3 Os 31 andares feitos à mão

| Andar | Rótulo | Nome | Moradores | Prédio | Setas | O que tem |
|---|---|---|---|---|---|---|
| 1 | T1 | Primeira ligação | 3 | 3×1 | 2 | — (sem vítima) |
| 2 | T2 | Sem seta, guarda | 4 | 3×2 | 3 | sobra seta de propósito |
| 3 | T3 | Passa adiante | 5 | 3×2 | 3 | — |
| 4 | T4 | A fofoqueira | 6 | 3×2 | 3 | Fofoqueira |
| 5 | T5 | Fofoqueira do bem | 6 | 3×2 | 2 | Fofoqueira |
| 6 | T6 | Só três setas | 7 | 3×3 | 3 | Fofoqueira |
| 7 | H1 | Fofoca de segunda mão | 8 | 3×3 | 3 | 2 Fofoqueiras |
| 8 | T7 | Recado na portaria | 7 | 3×3 | 4 | Fofoqueira |
| 9 | T8 | Boato na medida | 6 | 3×2 | 3 | Exagerado, tamanho — **NOVO** |
| 10 | H2 | Foi na padaria | 6 | 3×3 | 4 | padaria — **NOVO** |
| 11 | T9 | Escândalo na medida | 9 | 3×3 | 4 | Exagerado, Fofoqueira, tamanho |
| 12 | H3 | O Zé saiu | 6 | 3×2 | 2 | Fofoqueira, padaria (vítima fora) |
| 13 | T10 | Liga pra ela | 5 | 3×2 | 2 | celular — **NOVO** |
| 14 | H4 | Pão quentinho | 8 | 3×3 | 4 | Fofoqueira, padaria (no meio do caminho) |
| 15 | O1 | A Bia primeiro | 6 | 3×3 | 4 | ordem — **NOVO** |
| 16 | O2 | Junto não vale | 6 | 3×3 | 3 | Fofoqueira, ordem |
| 17 | H5 | Churrasco na garagem | 8 | 3×3 | 4 | Fofoqueira, Exagerado na padaria, tamanho |
| 18 | O3 | Festa na laje | 8 | 3×3 | 4 | Fofoqueira, Exagerado, ordem e tamanho |
| 19 | H6 | Aniversário no 202 | 8 | 3×3 | 3 | Fofoqueira, celular, padaria |
| 20 | O4 | Um, dois, três | 8 | 3×3 | 4 | Fofoqueira, ordem (3 na fila) |
| 21 | D1 | Síndico de férias | 10 | 3×4 | 5 | 2 Fofoqueiras, Zé no meio |
| 22 | O5 | Fila do pão | 8 | 3×3 | 4 | Fofoqueira, padaria, ordem |
| 23 | D2 | Pombo na janela | 11 | 3×4 | 5 | 2 Fofoqueiras, padaria, tamanho |
| 24 | O6 | Café da tarde | 8 | 3×3 | 5 | padaria (no meio do caminho), ordem |
| 25 | D3 | Varanda nova | 11 | 3×4 | 5 | 2 Fofoqueiras, ordem |
| 26 | D4 | Rifa do condomínio | 11 | 3×4 | 5 | 2 Fofoqueiras, 2 Exagerados, tamanho |
| 27 | D5 | Sofá novo no 201 | 10 | 3×4 | 6 | 2 Fofoqueiras, padaria, ordem |
| 28 | D6 | Reunião de condomínio | 11 | 3×4 | 6 | 2 Fofoqueiras, padaria, ordem |
| 29 | V1 | De olho no corredor | 8 | 3×3 | 3 | **Vera** — **NOVO** |
| 30 | V2 | Paredes têm ouvidos | 8 | 3×3 | 4 | Vera |
| 31 | V3 | Na ponta do pé | 8 | 3×3 | 4 | Vera, Fofoqueira (a estrela mora colada na Vera) |

**Repetidas trocadas (2026-11-12, crítica do Fable):** a H6 era a mesma ideia da H5 (Zé fora, a Neide colada nele fala à vontade) e virou celular + padaria — a Cida só volta na 4, pela porta o recado chega na 3, e a Bia liga na hora. A O3 era mais uma "a Neide fecha a fila" (como O2 e O6) e virou fila + tamanho — a 1 quer fofoca e tem que passar pelo Exagerado. As duas com o Zé fora do canto. Títulos que entregavam a resposta ("Volta comprida", "Corredor de cima", "Antes do Zé voltar", "A 2 está do lado", "Fala cedo, entrega tarde", "Na volta, por ordem", "Atalho que vaza") viraram vida de condomínio. Na mesma leva, H4, H5, D2 e D6 também deixaram o "Zé fora + Neide colada": em todas o Zé fica em casa e a padaria muda de lugar — na H4 é quem está no meio do caminho, na H5 é o Exagerado (a estrela quer fofoca), na D2 é a estrela que quer fofoca, e a D6 (final do capítulo) junta fila, padaria e a Neide espalhando no meio do caminho. Todas achadas com um buscador sobre o motor (solução única, a regra muda a jogada, o caminho óbvio perde). A D4 ("Fofoca, não escândalo") também saiu: virou "Rifa do condomínio", com o Zé em casa e a estrela querendo fofoca (o caminho óbvio chega cochicho). **Ainda fica:** a ideia só na H3, onde ela é ensinada, de propósito; e, nos andares 2 a 20, a vítima no canto em boa parte deles.

Letras: **T** = trilho, **H** = Hora certa, **O** = Ordem, **D** = Prédio cheio, **V** = Vera. (Fora da campanha: **A** = Arnaldo, **N** = Nonato, **R** = Raquel, **P** = Nando.)

**Garantias de toda fase feita à mão** (testes): uma única solução dentro das setas; com uma seta a menos não dá (exceto a T2); a armadilha registrada perde pelo motivo certo; espelhada continua o mesmo quebra-cabeça; **desligar a regra da fase muda a jogada**.

### 7.4 Prédio sem fim (andar 32 em diante)
- **150 andares gerados** (`src/andares.json`), em blocos de **25**: leve → média → pesada… e um **chefão** no 25º.

| Peso | Prédio | Moradores | Setas | Extra |
|---|---|---|---|---|
| Leve | 3×3 | 6–7 | 3–4 (+1) | 1 Fofoqueira longe do Zé; Zé fora do canto com 2+ portas |
| Média | 3×4 | 8–10 | 4–5 (+1) | idem |
| Pesada | 3×5 | 10–12 | 5–6 (+1) | 2 Fofoqueiras (a 1ª longe do Zé), Zé no meio com 3+ portas |
| Chefão | 3×5 | 11–12 | 6–7 (+1) | 2 Fofoqueiras, Zé no meio, 2 estrelas |

**O "quaseee" e a Consulta 8 (Astra, 2026-11-12):** a fábrica exige que cada andar tenha ≥ 3 **quases de verdade** (`src/quase.ts`): resultados diferentes em que o plano erra por UM detalhe — tamanho, ordem, vítima ouvindo só no fim, gente demais, ou a estrela barrada por uma regra (padaria, dúvida da Raquel, toque de recolher), conferido por contrafactual (tira a regra, joga o mesmo plano: se a estrela ouve, foi a regra). "Estrela sem notícia" pura não conta. A armadilha (caminho óbvio) também tem que ser um quase. O Astra achou e foram corrigidos: falso positivo do "chegou cedo", planos redundantes contando em dobro, a exigência de 2 tipos (retirada), o empate da Raquel (vale o primeiro recado), a derrota que não dizia onde o boato parou, a seta do Nando só por seta direta, e o elenco que ensinava errado (Nando como comum; fiscais como vítima sem regra — os dois saíram do sorteio). ⚠️ É filtro auxiliar: quase medido não prova diversão; só o teste com pessoas diz. Pendente dele: 3×5 ainda rola em navegador com barra (saída sugerida: achatar a altura do apartamento); folga fixa de 1 vira "contador menos um". 2 andares em 5 tentam a Fofoqueira-armadilha.

**Passo 1 da Consulta 7 (equipe de 20 designers, 2026-11-12):**
- **Chefão em 3×5, sem rolar** (era 3×6 e rolava — 20 de 20 designers contra): a altura extra não comprava quebra-cabeça (o 3×6 tinha a mesma rede que o 3×5) e o clímax do capítulo era jogado sem ver origem, estrela e Zé juntos. **Teto do tabuleiro: 3 colunas × 5 andares, sem rolagem enquanto se monta o plano.** A rolagem só fica nos protótipos (`?bloco=alto`).
- **Régua de raciocínio** (`src/assinatura.ts`): cada andar ganha uma assinatura — as regras que, tiradas, mudam a solução (a padaria diz de quem: Zé, estrela ou meio do caminho), o papel da Fofoqueira e se a solução é uma corrente ou tem galho. Na fábrica, dentro do capítulo, um andar não repete a assinatura dos 2 anteriores e nenhuma passa de 6 (25%). Calibrada nas versões antigas: reprovava 18, 19 e 20 (o grupo que o Fable achou); nos feitos à mão de hoje sobram 6, 8 (fixação da Fofoqueira, aceito) e o **24 "Café da tarde"**, que repetia a 22 e foi refeito (o Davi, no meio do caminho e colado no Zé, está na padaria; sem Fofoqueira; a fila decide o fim). Um teste trava essa lista.
- **Teto de leitura** (teste): no máximo a Fofoqueira + 2 regras especiais por andar (padaria, ordem, tamanho, celular, versão, Arnaldo, Raquel, Nando) e no máximo 2 selos numa plaquinha — campanha, estoque e protótipos. É o antídoto do "muita informação" do Rumor Mill.
- Estoque regerado com isso: Fofoqueira de atalho 73% / armadilha 27%; assinatura mais comum em ~20% dos andares.

**Folga e variedade (2026-11-12, a partir da crítica do Fable jogando):** "Setas" é o mínimo K; o jogador recebe **K + 1** (`FOLGA`), pra contar as setas deixar de entregar o tamanho do caminho. A 1ª Fofoqueira **mora longe do Zé** e precisa mudar a jogada, e o Zé nunca fica no canto do prédio desenhado. **Papel da Fofoqueira:** 2 andares em 3 ela é atalho; 1 em 3 (`fofArmadilha`) é **armadilha** — ninguém dela ouve na solução, e ela pega quem passar por ela com ordem, tamanho ou padaria; onde nenhum tema dá armadilha, o andar fica com o atalho. ⚠️ Só longe do Zé ela vira o atalho em 92% ("é sempre por ela"); armadilha deixada onde cair voltava a ser a colada no Zé (54 de 58). Antes → depois, medido nos 150: setas = caminho 100% → 0%; Fofoqueira colada no Zé 100% → 15%; Fofoqueira de atalho 27% → 75%, de armadilha 73% → 25%; solução que é só uma corrente de setas 73% → 25%; Zé no canto 43% → 0%; Zé com uma porta só 43% → 0%.

**O vazio é parede (2026-11-12, pergunta do dono: "qual a pegada dos apartamentos vazios?"):** os cômodos vazios eram sobra do sorteio numa grade cheia — furos que não decidiam nada. Agora a fábrica sorteia uma **planta** (`src/planta.ts`) e os moradores a preenchem, sobrando no máximo 1 cômodo (nunca uma coluna inteira, o alto ou o térreo): **L** (bloco embaixo e uma torre), **U** (duas torres ligadas por baixo), **poço** (anel em volta de um vão), **H** (duas torres com ponte) e **degraus** (escadaria). Sem regra nova: o jogador lê "por aqui não dá, tem que contornar". No estoque de 2026-11-13: degraus 79, L 48, H 6, U 3, poço 1, e 13 em grade com furos — só o 3×4 ainda aceita a grade, porque ali, com o vilão pesando, das plantas só os degraus rendem. ⚠️ O zigue-zague ficou de fora: vira uma árvore, o caminho é um só, e o certificado recusou 1,4 milhão de tentativas. ⚠️ Degraus e L dominam; U, poço e H rendem pouco. ⚠️ "Gargalo" (um morador por onde o boato é obrigado a passar) deixou de ser meta: subiu pra 88 com as plantas e caiu pra 33 quando o vilão passou a pesar — vilão que pesa pede caminho alternativo, o contrário de gargalo.

**O vilão tem que pesar (2026-11-13, o dono jogando: "o nosso vilão é um pedaço de nada… geralmente tá na ponta"):** medido, o Seu Zé era **enfeite em 111 dos 150** andares gerados e em 20 dos 28 feitos à mão — tirando a ameaça dele, a solução era a mesma. Motivo: morador só conta pra quem a seta aponta, então o Zé só ouve sem querer pela Fofoqueira, e ela tinha sido afastada dele. Agora o certificado refaz a conta com a vítima virando um morador comum (`papelDoZe`, `src/fabrica.ts`) e só aceita o andar se algo muda: aparece solução com menos setas (**desvio**, 42 andares) ou outras soluções com as mesmas setas (**corta**, 108). Enfeite: **0**. Vilão na coluna da borda: 129 → 75. ⚠️ Exigir "o vilão bloqueia TODO caminho curto" zera a produção: a volta vira o único caminho e a fase fica óbvia. ⚠️ O tema "só Fofoqueira" quase some com o Zé (ele só pesa junto de padaria, ordem ou tamanho); volta com a Vera. Os 28 feitos à mão **não** foram refeitos.

**Vera no estoque:** 1 andar em 3 tenta sair com a **Vera** de vítima no lugar do Zé (`vera` no molde); só vale se a escuta dela muda a jogada, e se não sair no prazo o andar fica com o Zé. Saíram **45 de 150**. Com ela o tema padaria+ordem não entra (seriam 3 regras; o teto de leitura é 2).

**Prédio de 4 colunas (2026-11-13, o dono: "será que não teremos que expandir o prédio pros lados?" e, vendo o protótipo, "ainda tá bem legível"):** o 3×3 era onde tudo quebrava (a Vera não rendia nenhum andar; o Zé só pesava com a padaria). Medido com a máquina livre, só plantas, vilão pesando, andares aceitos em 16–20 s: leve **4×3** 127 com o Zé e 65 com a Vera (L, H, degraus) contra 45 e 3 no 3×4 (só degraus); médio 4×4 65/31 (L, U, degraus) contra 115/19 no 3×4 (degraus); pesado 4×4 46/15 (U, poço, degraus) contra 86/19 no 3×5 (L, degraus); 4×5 e chefão largo não compensam. Daí o estoque: **leve 4×3** (8–10 moradores), **médio** alternando 4×4 e 3×4 a cada 5 andares, **pesado** alternando 4×4 e 3×5, **chefão 3×5**. Hoje: 60 em 4×3, 42 em 4×4, 27 em 3×4, 21 em 3×5. Num celular de 390 de largura o cômodo cai pra ~93 e os selos pequenos ficam no limite — 4 colunas é o teto (teste). ⚠️ Medição de rendimento só vale com o gerador parado: feita junto com ele, a conta tinha saído ao contrário (3×4 melhor que 4×3).

Regerado em 2026-11-11 com **prédios maiores** e só nomes com arte ilustrada (antes havia Gil, Tião e Juca, sem desenho, e um teto de 7 moradores comuns). Regerado de novo em 2026-11-12 (folga e variedade, abaixo): 60 leves de 3 andares, 54 médias de 4, 30 pesadas de 5, 6 chefões de 6 — nenhum precisou descer de peso. Os 150 saem em ~3 min com 6 processos em paralelo.

- Temas sorteados: corrente de Fofoqueiras, padaria, ordem, tamanho, padaria+ordem.
- Acabou o estoque, **recomeça** — espelhado numa volta sim, outra não. O prédio vai até o andar **3.028**.

### 7.5 Capítulos, ★ e Fofoca do dia

- **Capítulos** (`src/capitulos.ts`): os 31 feitos à mão viram 5 — *Primeiros boatos* (1–5), *Vizinhos novos* (6–14), *Fila da fofoca* (15–20), *Reunião de condomínio* (21–28), *A vigia do terceiro* (29–31, a Vera); depois, **um a cada 25 andares**, sempre terminando num chefão de 6 andares, com temas de condomínio que se repetem (*A encomenda misteriosa*, *A festa surpresa*, *O bolo desaparecido*, *A obra no 302*, *O apagão*…).
- **Abertura:** no 1º andar do capítulo (uma vez por aparelho, antes da cena de chegada), "Capítulo 5 · A encomenda misteriosa", o Seu Zé e o aviso da administração do tema. **Fechamento:** no último andar, o desfecho diz "Capítulo 5 concluído · ★ 18 de 25" e o botão vira **Próximo capítulo**.
- **Desafio opcional = ★ de primeira:** o andar vencido na primeira tentativa **e sem seta além do mínimo** ganha ★ ("★ De primeira!" no desfecho; ★ no índice). Venceu de primeira gastando a folga: "Sem ★: dava com 4 setas." (`ganhaEstrela`, capitulos.ts). O "sem seta além" entrou com a folga dos andares gerados (2026-11-12): sem ele, a folga barateava a ★.
- **Fofoca do dia:** botão no menu (fora do `?pesquisa`). Um andar leve ou médio do estoque, **o mesmo pra todo mundo no dia** (escolhido pela data do aparelho, elenco fixo pela data), sem advertência. Vencendo, **Compartilhar** manda o dia e o resultado ("espalhei de primeira ★ sem a vítima descobrir"), nunca a solução. O menu mostra "feita" (e "de primeira ★").

---

## 8. Advertências do síndico (as vidas)

- **3 advertências.** Deixar a **vítima descobrir** dá uma. Errar tamanho, versão, ordem ou esquecer uma estrela **não custa nada**.
- Na **terceira**, você fica **suspenso**: dá pra montar o trilho, mas o botão vira "Suspenso · 14:49" até o síndico tirar uma (uma a cada 15 minutos).
- **Tutorial não cobra.** No teste com pessoas (`?pesquisa`) **não existem**.
- Aparecem: no topo da fase, no desfecho (carimbo "ADVERTÊNCIA · 1 de 3 · o síndico") e no menu (papéis de aviso e o relógio; o aviso do mural vira "TRÊS ADVERTÊNCIAS = SUSPENSÃO." / "E quatro?").
- ⚠️ Decisão do Guilherme contra o conselho do Sol. Testar com jogadores antes de manter.

---

## 9. Menu: o prédio

- Topo: o letreiro **"Fofoca!"** · EDIFÍCIO PRIMAVERA, e as advertências.
- **Aviso da administração** com a resposta de um morador colada por cima, um por vez: "PROIBIDO OUVIR ATRÁS DA PORTA." / "Na frente pode?" · "A REUNIÃO SERÁ BREVE." / "Trouxe o jantar." · "ASSUNTO ENCERRADO." / "Qual assunto?" · "A PLANTA NÃO TEM DIREITO A VOTO." / "Ela pediu a palavra." · "FAVOR NÃO COMENTAR ESTE AVISO." / "Comentaram."
- **Uma janela no prédio em corte:** três andares, cada um com três apartamentos (os mesmos fundos do jogo); o **elevador** com visor fica no andar escolhido. Andar **feito** = visto azul e um morador em cena; o **atual** tem a Neide ouvindo *na frente* da porta; **trancado** = de noite, porta fechada com a plaquinha "Trancado". Acima do último, o telhado; abaixo do 1º, a **portaria** (Seu Zé no balcão, cobogó, Dona Glória).
- Tocar num andar liberado escolhe ele; **"Ver andares"** abre o índice **por capítulo** (★ de primeira em cada andar, "★ 3 de 25") e o "Ir ao andar N". A placa mostra "9º andar · capítulo 2".
- Placa esmaltada com o andar e o nome; botão de elevador **"Jogar · 9º andar"**. Dentro da fase, a **casinha** volta ao prédio.
- No `?pesquisa`, embaixo: "Participante P-XXXX · exportar registro".
- **Ajustes** (engrenagem no topo): velocidade do espalhar (normal ou ×2, que o botão ×2 da fase também grava), **menos animação** (vale além do "movimento reduzido" do sistema), **apagar progresso** com confirmação na própria tela (volta ao 1º andar; **não** zera as advertências; não existe no `?pesquisa`) e a versão do jogo. Guardado em `fofoca.ajustes`.

---

## 10. Cenas de chegada

Na **primeira vez** que algo novo aparece, antes da fase. Usa o morador da própria fase. **"Bora!"** pula a qualquer momento. Uma vez por aparelho. Com "movimento reduzido", aparece já pronta.

| Onde | Título | O que acontece | Fala |
|---|---|---|---|
| andar 4 | Moradora nova! | a Neide chega; balõezinhos voam dela pros lados | "Cheguei! E já tô sabendo de tudo." |
| andar 9 | Morador novo! | o Beto chega; entra um cochicho, sai uma fofoca | "Cochicho? Comigo vira fofoca!" |
| andar 10 | Hora do pão | um morador sai e deixa a placa com o pão e o "3" | "Vou ali na padaria e já volto!" |
| andar 13 | Celular novo | o telefone toca na mão de quem vai poder ligar | "Agora eu ligo pra quem eu quiser!" |
| andar 15 | Fila da fofoca | quem chega ganha o ⭐1, a ⭐2 espera na porta | "Eu primeiro, viu?" |
| `?bloco=arnaldo` | Fiscal novo! | o Arnaldo bravo; entra uma fofoca, sai um cochicho | "Psiu! Aqui ninguém grita." |
| `?bloco=nonato` | Morador novo! | entra a versão certa, sai a ao contrário | "Isso aí? Foi o contrário." |
| `?bloco=raquel` | Moradora nova! | a Raquel desconfiada; um balão, o "?", e o segundo balão | "Hum… quem mais te contou?" |
| `?bloco=apressado` | Morador novo! | o Nando; o balão entra por um lado e sai pelo outro | "Tô com pressa! Conto pro primeiro que aparecer." |

---

## 11. Visual

Direção **"Conforme o regulamento"** (Consulta 5), com a arte **ilustrada** como padrão.

- **Prédio montado com peças ilustradas:** 4 fundos de apartamento (verde, rosa, listrado, azul, cada um com seu móvel), 4 vazios à noite (aluga-se, mudança, lençol, gato), telhado (telhas, caixa d'água, antena, varal) e bairro ao fundo. O que muda durante o jogo (paredes, portas, escadas, setas, plaquinhas, luz) é desenhado em código por cima.
- **Leitura por forma, não só cor:** origem = selo de balão; vítima = octógono com "!"; estrela; selecionado = 4 cantoneiras; pode ouvir = tracejado azul (**todo** destino possível acende igual, inclusive a vítima — sem ela, o destaque virava dica); ouviu = luz amarela forte com moldura; vítima pega = vermelho, "QUÊ?!" e seta vermelha; +1 / −1 / ⇄ nas plaquinhas.
- **Arrasto com retorno** (2026-11-13, o dono no celular: "meio travado"): enquanto o dedo arrasta, uma linha pontilhada azul sai de quem conta e o segue, e o destino debaixo do dedo acende cheio. Antes a seta só aparecia ao soltar. A linha e o destaque são mexidos direto no desenho, sem redesenhar o prédio; e saiu o `drop-shadow` dos destinos e das cantoneiras, que o celular refazia a cada quadro.
- **A plaquinha mede o nome de verdade** (não chuta por letra): cabe com fonte nova e tradução.
- **Cores e letras:** tinta marrom e tons quentes; botão mostarda com texto escuro (botão de elevador, afunda ao apertar). **Patua One** (marca e títulos) + **Asap** (interface).
- **Céu pouco:** o prédio ocupa o palco; nas fases pequenas, sol e nuvens lentas no que sobra.
- **Prédio alto (5–6 andares) rola na vertical:** se, encaixado inteiro, o cômodo ficaria com menos de 100 px, o prédio fica na largura da tela e o palco rola; a câmera vai até onde a fofoca está (quem está selecionado, quem conta e quem ouve em cada batida, a vítima no fim). Prédio que cabe não muda. **Topo enxuto (2026-11-11):** o telhado fica fora da conta e sobe pra trás dos avisos; setas, advertências e a escadinha de tamanhos (só ícones) dividem uma linha; a frase de estado só aparece no tutorial. Com isso o prédio de **5 andares cabe sem rolar** num celular de 390×844; o de 6 ainda rola.
- **Plaquinha do nome na laje:** subiu 11 unidades e fica meio em cima da laje entre os andares — antes tapava a testa (e às vezes o olho) do morador.
- **Leitura da tela (2026-11-12, crítica do Fable):**
  - **Fofoqueira com marca:** megafone na plaquinha (antes não tinha marca nenhuma).
  - **Tamanho exigido maior** na plaquinha (0,62 → 0,82); plaquinha que não cabe no cômodo **encolhe inteira** até caber (a da Marlene com estrela, "=" e tamanho invadia o vizinho).
  - **Escadas de madeira**, como as portas: em traço fraco sumiam no desenho do cômodo.
  - **Vítima sem tracejado de alvo:** dá pra mandar seta pra ela, mas o tracejado parecia convite.
  - **Prédio que rola avisa:** seta ▲/▼ na borda direita enquanto houver andar escondido.
  - **Desfecho no alto:** o texto fica por cima dos avisos e os botões vão pro rodapé, no lugar de Desfazer/Espalhar. Antes o quadro inteiro cobria o térreo, onde muitas vezes está quem perdeu.
- **Arte nítida e sem piscar:** sprites recortados a 460 px de altura (eram 300, borravam em tela 3×) e fundos a 420 px; todas as poses de quem está na fase são pré-carregadas (antes o morador sumia por um instante ao trocar de pose no celular).
- **Espalhar desligado sem nenhuma seta** (era derrota certa, e um toque duplo em "Próxima fase" caía nele); **Tentar de novo** volta com a origem selecionada.
- **Movimento:** cochicho e susto nas poses, balão viajando pela seta, luz acendendo, padaria balançando, "QUÊ?!" estourando. Tudo some com "movimento reduzido" (o balão aparece direto no destino).
- **O desfecho** flutua por cima da rua, sem empurrar o prédio.
- **Se algo quebrar:** em vez de tela branca, "O elevador travou." com o botão **Voltar ao prédio** (no `?pesquisa`, o erro vai pro registro).

---

## 12. Links

| Link | O que abre |
|---|---|
| https://gui-zen.github.io/Fofoca/ | a campanha |
| `?pesquisa` / `?pesquisa&zerar` | **teste com pessoas**: campanha igual pra todos, sem advertências, com registro exportável; `&zerar` = participante novo |
| `?bloco=arnaldo` / `?bloco=nonato` / `?bloco=raquel` / `?bloco=apressado` | os protótipos de mecânica (com cena de chegada) |
| `?bloco=alto` | dois prédios de 5 e 6 andares feitos pela fábrica, pra ver a rolagem |
| `?bloco=largo` | três prédios de **4 colunas** (4×3, 4×4 e 4×4 com a Vera) — o experimento que virou formato do estoque |
| `?bloco=hora` / `ordem` / `dificil` | blocos de 6 fases (diagnóstico) |
| `?grupo=A` / `?grupo=B` | o antigo teste trilho × giros (diagnóstico) |
| `?vetor` | o jogo com o desenho antigo em SVG |
| `?prova` | a prova estática da direção visual (5 telas) |

Protocolo do teste com 5 pessoas: `README.md` (entregar sem explicar; pedir pra apontar origem, vítima, objetivo; separar erro de leitura de erro de plano; exportar o registro). **Ainda não rodou.**

---

## 13. Por dentro (técnico)

**Stack:** React + TypeScript + SVG, Vite, Vitest. Sem servidor: tudo no aparelho. Publicado no GitHub Pages a cada push no `main` (testes → build → deploy).

| Arquivo | O que faz |
|---|---|
| `src/motor.ts` | regras puras: `espalhar`, avaliação, `abafados` (Arnaldo), `quemContou` |
| `src/explicar.ts` | a causa da derrota pro prédio desenhar (vítima, tamanho, versão, ordem, padaria, sem notícia) |
| `src/trilho.ts` | as 10 fases T, `jogar`, `resolverTrilho` (todas as soluções), `espelhar` |
| `src/horaCerta.ts`, `ordem.ts`, `dificil.ts`, `arnaldo.ts`, `nonato.ts` | blocos H, O, D, A, N |
| `src/campanha.ts`, `src/andares.json`, `src/fabrica.ts` | a campanha, o estoque gerado e a fábrica de fases |
| `src/advertencias.ts`, `src/registro.ts`, `src/elenco.ts` | vidas, registro da pesquisa, troca de nomes e vítima |
| `src/arte.ts` | carrega o manifesto da arte ilustrada (`?vetor` desliga) |
| `src/ajustes.ts`, `src/Protecao.tsx` | ajustes do jogador (puro, testado) e a tela de erro no lugar da tela branca |
| `src/App.tsx` | campanha, links de teste, a tela da fase, ×2, Rever, o desfecho |
| `src/Menu.tsx`, `src/Chegada.tsx` | o prédio-menu e as cenas de chegada |
| `src/Predio.tsx`, `Cena.tsx`, `Personagem.tsx`, `Vazio.tsx`, `Icones.tsx`, `estilo.css` | o desenho |
| `src/prova/` | a prova estática da direção visual |
| `src/comparacao.ts`, `gerador.ts`, `trilha.ts`, `variar.ts`, `fases.ts` | mecânica antiga (giros), só no diagnóstico e nos testes |

**Certificado da fábrica:** uma única solução no menor número de setas (K); com as K + 1 que o jogador recebe, no máximo 2; o caminho mais curto perde, mesmo com a folga; nas pesadas, "não cutucar o Zé nem a Fofoqueira colada nele" também perde; cada regra presente (inclusive a Fofoqueira) muda a jogada.

**Números de hoje:** **1152 testes em 27 arquivos** (o teste do teto roda por andar: campanha, estoque e protótipos), todos passando (os de Arnaldo e Nonato conferidos por mutação: desligando a regra, 9/15 e 7/13 falham). Pacote do jogo **381 KB** (95 KB comprimido) + arte **3,6 MB** (só as poses de quem está na fase são baixadas).

**Guardado no aparelho:** `fofoca.campanha.*` (andar liberado, tentativas, cenas vistas), `fofoca.advertencias`, `fofoca.pesquisa.*`, `fofoca.registro`, `fofoca.participante`; nos blocos, `fofoca.<bloco>.*`.

**Como rodar** (pasta `Fofoca`):
```bash
npm install
npm run dev
npm test
npm run build
```
⚠️ Não use `npm run dev -- --host` (alerta de segurança no servidor de desenvolvimento). Pra jogar no celular, use o site publicado.

---

## 14. O que aprendemos medindo

- **Com origem livre, sempre havia vitória de um toque** (399 de 399) → nasceu o trilho (Consulta 1).
- **Em prédios aleatórios, o caminho mais curto ganha 98% das vezes**: a dificuldade vem de armadilha, não de regra a mais (Consulta 3).
- **Nas 178 fases:** mediana de 8 moradores, 5 ouvem, 4 setas, 1 estrela, 4 batidas. **Solução única em 178/178**, e ela já é a que faz **menos gente ouvir** → teto de ouvintes e "desafio de menos setas" não mudam nada nas fases atuais.
- **A Fofoqueira é mais perigo que ajuda:** está em 171 fases; no caminho de uma estrela em 39; a armadilha perde por ela contar pra vítima em 83.
- **Celular em 2 fases** (andares 13 e 19; conferido pelo Astra na Consulta 9). Tamanho em 37, padaria em 55, ordem em 54. Última estreia no andar 15.
- **Diagnóstico do Sol (Consulta 6):** falta **variedade** de raciocínio, não necessariamente dificuldade — e só gente jogando separa as duas coisas.

---

## 15. O que ainda falta

**Jogo**
- **Jogar** o Arnaldo, o Nonato e a Raquel e decidir se entram na campanha (e no gerador).
- **Próximas mecânicas** (Fable, estudos de 2026-11-12; o Apressado já virou o Nando): **Comadres** (duas estrelas que só valem na mesma batida), **Psiu!** (calar um morador uma vez por fase), **Linguarudo** (com escândalo, vira fofoqueiro), **Dois boatos** (corrida e barreira), **Boato cansa** (perde um tamanho a cada N repasses, como condição de capítulo). ⚠️ Concorrente direto: *Rumor Mill: Village Gossip Sim* (Google Play, Crystl Labs) — premissa quase igual; pareceu confuso de cara ("muita informação") — a clareza do Fofoca! é a vantagem a proteger: uma regra nova por vez, legível por um ícone e uma frase.
- **Arrastar no celular** (2026-11-12): o tabuleiro estava com `touch-action: manipulation` e o navegador tratava o arrasto como rolagem (cancelava o gesto); agora arrastar de quem conta até quem ouve desenha a seta, e um toque na seta apaga. No prédio que rola, a vertical continua rolando (o toque-toque vale sempre).
- Próximo fiscal (Dona Norma), uma regra por vez. A Vera já entrou.
- Decidir o **celular** (peça do quebra-cabeça ou ajuda).
- **Som** ("psst" a cada batida, "QUÊ?!" na derrota).
- Mais adiante: álbum dos moradores, variação visual por capítulo (chuva, festa junina, noite).

**Produto e lançamento**
- O **teste com 5 pessoas** (publicado; falta recrutar e rodar).
- Analytics, app Android (Capacitor), Google Play, nome global e tradução, criativos.
- Monetização ainda sem desenho que funcione com solução única.

**Casa**
- Repositório público https://github.com/Gui-ZeN/Fofoca, sem licença definida. `PRODUCT.md` fica fora do repo.
- Imagens geradas por IA no repositório público: conferir os termos da ferramenta.
- Nota do projeto no vault: `Projetos/Fofoca.md` e `Projetos/Fofoca — Devlog.md` (desde 12/11/2026).
- A página `?prova` e a mecânica antiga (giros) ainda no código.
