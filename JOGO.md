# Fofoca! — o jogo inteiro

> Retrato do jogo em **11/11/2026** (commit `fdcb7bf`), tirado do código (`Fofoca/src`). Publicado em **https://gui-zen.github.io/Fofoca/**. Ninguém de fora jogou ainda.
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
6. No fim: **Tentar de novo** (mantém as setas, pra corrigir só o trecho errado) / **Repetir** na vitória, **Rever** (passo a passo, uma batida por vez, com ‹ ›) e **Próxima fase**.

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

**Critério pra entrar na campanha** (teste com 5 pessoas): 4/5 reconhecem quem é afetado; 4/5 preveem o tamanho/versão antes de espalhar; 3/5 resolvem a 3ª fase sem ajuda e explicam por que precisaram passar ali.

### 5.3 Ideias discutidas, ainda não construídas

- **Vera, a vigia:** ouve quando um vizinho de passagem **conta** algo (não quando só recebe); orelha em cada cômodo afetado. A estrela colada nela pode receber e guardar.
- **Dona Norma:** "**fecha após a batida N**" uma passagem (prazo). "Tranca até N" não funciona: ninguém espera porta abrir.
- **Dr. Álvaro:** teto de pessoas sabendo só morde em fases **novas** (Fofoqueira barata que espalha demais) — nas atuais a solução já é o mínimo de ouvintes. Alternativa: **procedência** (a estrela só acredita vindo de quem tem o mesmo carimbo).
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

### 7.3 Os 28 andares feitos à mão

| Andar | Rótulo | Nome | Moradores | Prédio | Setas | O que tem |
|---|---|---|---|---|---|---|
| 1 | T1 | Primeira ligação | 3 | 3×1 | 2 | — (sem vítima) |
| 2 | T2 | Sem seta, guarda | 4 | 3×2 | 3 | sobra seta de propósito |
| 3 | T3 | Passa adiante | 5 | 3×2 | 3 | — |
| 4 | T4 | A fofoqueira | 6 | 3×2 | 3 | Fofoqueira |
| 5 | T5 | Fofoqueira do bem | 6 | 3×2 | 2 | Fofoqueira |
| 6 | T6 | Só três setas | 7 | 3×3 | 3 | Fofoqueira |
| 7 | H1 | Fofoca de segunda mão | 8 | 3×3 | 3 | 2 Fofoqueiras |
| 8 | T7 | Atalho que vaza | 7 | 3×3 | 4 | Fofoqueira |
| 9 | T8 | Boato na medida | 6 | 3×2 | 3 | Exagerado, tamanho — **NOVO** |
| 10 | H2 | Foi na padaria | 6 | 3×3 | 4 | padaria — **NOVO** |
| 11 | T9 | Escândalo na medida | 9 | 3×3 | 4 | Exagerado, Fofoqueira, tamanho |
| 12 | H3 | O Zé saiu | 6 | 3×2 | 2 | Fofoqueira, padaria (vítima fora) |
| 13 | T10 | Liga pra ela | 5 | 3×2 | 2 | celular — **NOVO** |
| 14 | H4 | Fala cedo, entrega tarde | 7 | 3×3 | 3 | Fofoqueira, padaria |
| 15 | O1 | A Bia primeiro | 6 | 3×3 | 4 | ordem — **NOVO** |
| 16 | O2 | Junto não vale | 6 | 3×3 | 3 | Fofoqueira, ordem |
| 17 | H5 | Volta às quatro | 8 | 3×3 | 3 | Fofoqueira, padaria |
| 18 | O3 | A Neide por último | 9 | 3×3 | 4 | Fofoqueira, ordem |
| 19 | H6 | Na hora do pão | 8 | 3×3 | 3 | Fofoqueira, padaria |
| 20 | O4 | Um, dois, três | 8 | 3×3 | 4 | Fofoqueira, ordem (3 na fila) |
| 21 | D1 | Corredor de cima | 10 | 3×4 | 5 | 2 Fofoqueiras, Zé no meio |
| 22 | O5 | Fila do pão | 8 | 3×3 | 4 | Fofoqueira, padaria, ordem |
| 23 | D2 | Antes do Zé voltar | 10 | 3×4 | 5 | 2 Fofoqueiras, padaria |
| 24 | O6 | Na volta, por ordem | 8 | 3×3 | 4 | Fofoqueira, padaria, ordem |
| 25 | D3 | A 2 está do lado | 11 | 3×4 | 5 | 2 Fofoqueiras, ordem |
| 26 | D4 | Fofoca, não escândalo | 11 | 3×4 | 5 | 2 Exagerados, 2 Fofoqueiras, padaria, tamanho |
| 27 | D5 | Volta comprida | 10 | 3×4 | 6 | 2 Fofoqueiras, padaria, ordem |
| 28 | D6 | Reunião de condomínio | 11 | 3×4 | 6 | 2 Fofoqueiras, padaria, ordem |

Letras: **T** = trilho, **H** = Hora certa, **O** = Ordem, **D** = Prédio cheio. (Fora da campanha: **A** = Arnaldo, **N** = Nonato.)

**Garantias de toda fase feita à mão** (testes): uma única solução dentro das setas; com uma seta a menos não dá (exceto a T2); a armadilha registrada perde pelo motivo certo; espelhada continua o mesmo quebra-cabeça; **desligar a regra da fase muda a jogada**.

### 7.4 Prédio sem fim (andar 29 em diante)
- **150 andares gerados** (`src/andares.json`), em blocos de **25**: leve → média → pesada… e um **chefão** no 25º.

| Peso | Prédio | Moradores | Setas | Extra |
|---|---|---|---|---|
| Leve | 3×3 | 6–7 | 3–4 | 1 Fofoqueira |
| Média | 3×4 | 8–10 | 4–5 | 1 Fofoqueira |
| Pesada | 3×5 (rola) | 10–12 | 5–6 | 2 Fofoqueiras, Zé no meio com 3+ portas |
| Chefão | 3×6 (rola) | 11–13 | 6–7 | 2 Fofoqueiras, Zé no meio, 2 estrelas |

Regerado em 2026-11-11 com **prédios maiores** e só nomes com arte ilustrada (antes havia Gil, Tião e Juca, sem desenho, e um teto de 7 moradores comuns). Hoje: 59 leves de 3 andares, 54 médias de 4, 28 pesadas de 5 (2 saíram com 4), 6 chefões de 6. Os 150 saem em ~20 s com 10 processos em paralelo.

- Temas sorteados: corrente de Fofoqueiras, padaria, ordem, tamanho, padaria+ordem.
- Acabou o estoque, **recomeça** — espelhado numa volta sim, outra não. O prédio vai até o andar **3.028**.

### 7.5 Capítulos, ★ e Fofoca do dia

- **Capítulos** (`src/capitulos.ts`): os 28 feitos à mão viram 4 — *Primeiros boatos* (1–5), *Vizinhos novos* (6–14), *Fila da fofoca* (15–20), *Reunião de condomínio* (21–28); depois, **um a cada 25 andares**, sempre terminando num chefão de 6 andares, com temas de condomínio que se repetem (*A encomenda misteriosa*, *A festa surpresa*, *O bolo desaparecido*, *A obra no 302*, *O apagão*…).
- **Abertura:** no 1º andar do capítulo (uma vez por aparelho, antes da cena de chegada), "Capítulo 5 · A encomenda misteriosa", o Seu Zé e o aviso da administração do tema. **Fechamento:** no último andar, o desfecho diz "Capítulo 5 concluído · ★ 18 de 25" e o botão vira **Próximo capítulo**.
- **Desafio opcional = ★ de primeira:** o andar vencido na primeira tentativa ganha ★ ("★ De primeira!" no desfecho; ★ no índice). ⚠️ Não é "menos setas": toda fase tem solução única e mínima, então nunca aconteceria.
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

---

## 11. Visual

Direção **"Conforme o regulamento"** (Consulta 5), com a arte **ilustrada** como padrão.

- **Prédio montado com peças ilustradas:** 4 fundos de apartamento (verde, rosa, listrado, azul, cada um com seu móvel), 4 vazios à noite (aluga-se, mudança, lençol, gato), telhado (telhas, caixa d'água, antena, varal) e bairro ao fundo. O que muda durante o jogo (paredes, portas, escadas, setas, plaquinhas, luz) é desenhado em código por cima.
- **Leitura por forma, não só cor:** origem = selo de balão; vítima = octógono com "!"; estrela; selecionado = 4 cantoneiras; pode ouvir = tracejado; ouviu = luz amarela forte com moldura; vítima pega = vermelho, "QUÊ?!" e seta vermelha; +1 / −1 / ⇄ nas plaquinhas.
- **A plaquinha mede o nome de verdade** (não chuta por letra): cabe com fonte nova e tradução.
- **Cores e letras:** tinta marrom e tons quentes; botão mostarda com texto escuro (botão de elevador, afunda ao apertar). **Patua One** (marca e títulos) + **Asap** (interface).
- **Céu pouco:** o prédio ocupa o palco; nas fases pequenas, sol e nuvens lentas no que sobra.
- **Prédio alto (5–6 andares) rola na vertical:** se, encaixado inteiro, o cômodo ficaria com menos de 100 px, o prédio fica na largura da tela e o palco rola; a câmera vai até onde a fofoca está (quem está selecionado, quem conta e quem ouve em cada batida, a vítima no fim). Prédio que cabe (até 3×4) não muda.
- **Movimento:** cochicho e susto nas poses, balão viajando pela seta, luz acendendo, padaria balançando, "QUÊ?!" estourando. Tudo some com "movimento reduzido" (o balão aparece direto no destino).
- **O desfecho** flutua por cima da rua, sem empurrar o prédio.
- **Se algo quebrar:** em vez de tela branca, "O elevador travou." com o botão **Voltar ao prédio** (no `?pesquisa`, o erro vai pro registro).

---

## 12. Links

| Link | O que abre |
|---|---|
| https://gui-zen.github.io/Fofoca/ | a campanha |
| `?pesquisa` / `?pesquisa&zerar` | **teste com pessoas**: campanha igual pra todos, sem advertências, com registro exportável; `&zerar` = participante novo |
| `?bloco=arnaldo` / `?bloco=nonato` | os protótipos de mecânica (com cena de chegada) |
| `?bloco=alto` | dois prédios de 5 e 6 andares feitos pela fábrica, pra ver a rolagem |
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

**Certificado da fábrica:** uma única solução no menor número de setas; com uma seta a mais, no máximo 2; o caminho mais curto perde; nas pesadas, "não cutucar o Zé nem a Fofoqueira colada nele" também perde; cada regra presente muda a jogada.

**Números de hoje:** **633 testes em 20 arquivos**, todos passando (os de Arnaldo e Nonato conferidos por mutação: desligando a regra, 9/15 e 7/13 falham). Pacote do jogo **361 KB** (89 KB comprimido) + arte **2,4 MB**.

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
- **Celular em 1 fase** (andar 13). Tamanho em 37, padaria em 55, ordem em 54. Última estreia no andar 15.
- **Diagnóstico do Sol (Consulta 6):** falta **variedade** de raciocínio, não necessariamente dificuldade — e só gente jogando separa as duas coisas.

---

## 15. O que ainda falta

**Jogo**
- **Jogar** o Arnaldo e o Nonato e decidir se entram na campanha (e no gerador).
- Próximo fiscal (Vera ou Dona Norma), uma regra por vez.
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
- Sem nota do projeto no vault (`Projetos/Fofoca.md`); só as consultas.
- A página `?prova` e a mecânica antiga (giros) ainda no código.
