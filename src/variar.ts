// Sorteia uma variação de uma fase: os mesmos vizinhos (com tipo, nome e exigência) mudam de
// apartamento e as setas apontam para outros amigos. O prédio e as passagens ficam iguais.
// Só vale a variação que o resolvedor aprova com as mesmas regras de justiça das fases fixas.

import { amigosDe, espalhar, podeSerOrigem, resolver, type Fase, type Jogada } from './motor';

// Gerador pseudoaleatório com semente (mulberry32): a mesma semente dá a mesma variação.
export function aleatorio(semente: number) {
  let a = semente >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// As mesmas regras que os testes exigem das fases desenhadas à mão.
export function justa(fase: Fase, tutorial = false): boolean {
  const sol = resolver(fase);
  if (sol.length < 1 || sol.length > 3) return false;
  // com horário, o horário tem que importar: alguma solução perderia se o Seu Zé estivesse em casa
  if (fase.vizinhos.some((v) => v.chega)) {
    const emCasa: Fase = { ...fase, vizinhos: fase.vizinhos.map(({ chega: _, ...v }) => v) };
    if (!sol.some((j) => !espalhar(emCasa, j).vitoria)) return false;
  }
  if (fase.giros > 0 && resolver({ ...fase, giros: fase.giros - 1 }).length > 0) return false;
  if (tutorial) return true;
  return fase.vizinhos.some((v) => podeSerOrigem(fase, v) && !espalhar(fase, { origem: v.id, setas: {} }).vitoria);
}

// O que separa uma fase de pensar de uma fase de "toca no vizinho dela":
// - cadeia: na solução mais curta, em que batida o último interessado fica sabendo
//   (1 = contou direto pro vizinho dele; quanto maior, mais gente no caminho)
// - armadilhas: fração das origens possíveis que perdem sem girar nada
// - envolvimento: na solução que mais espalha, fração dos moradores (sem o Seu Zé) que ouvem
export interface Qualidade { cadeia: number; armadilhas: number; envolvimento: number; origens: number }

export function qualidade(fase: Fase, sol: Jogada[] = resolver(fase)): Qualidade {
  if (!sol.length) return { cadeia: 0, armadilhas: 0, envolvimento: 0, origens: 0 };
  const interessados = fase.vizinhos.filter((v) => v.interesse);
  const gente = fase.vizinhos.filter((v) => v.tipo !== 'assunto');
  const resultados = sol.map((j) => espalhar(fase, j));
  const origens = fase.vizinhos.filter((v) => podeSerOrigem(fase, v));
  return {
    cadeia: Math.min(...resultados.map((r) => Math.max(...interessados.map((v) => r.ouviu[v.id]?.batida ?? 0)))),
    armadilhas: origens.filter((v) => !espalhar(fase, { origem: v.id, setas: {} }).vitoria).length / Math.max(1, origens.length),
    envolvimento: Math.max(...resultados.map((r) => gente.filter((v) => r.ouviu[v.id]).length / gente.length)),
    origens: origens.length,
  };
}

export function variar(base: Fase, semente: number, tutorial = false, tentativas = 300): Fase {
  const sorte = aleatorio(semente);
  // a variação nunca pode ficar mais fácil que a fase original
  const piso = qualidade(base);
  const posicoes = base.vizinhos.map((v) => v.pos);
  // ids seguem as posições: as amizades (entre ids) continuam ligando os mesmos apartamentos
  const idDaPos = new Map(base.vizinhos.map((v) => [v.pos.join(','), v.id]));

  for (let i = 0; i < tentativas; i++) {
    const ordem = [...posicoes];
    for (let j = ordem.length - 1; j > 0; j--) { // Fisher-Yates
      const k = Math.floor(sorte() * (j + 1));
      [ordem[j], ordem[k]] = [ordem[k], ordem[j]];
    }
    const novoId = new Map(base.vizinhos.map((v, k) => [v.id, idDaPos.get(ordem[k].join(','))!]));
    const fase: Fase = {
      ...base,
      vizinhos: base.vizinhos.map((v) => ({ ...v, id: novoId.get(v.id)!, pos: ordem[base.vizinhos.indexOf(v)] })),
      // quem você encontrou continua sendo a mesma pessoa, agora em outro apartamento
      origens: base.origens?.map((id) => novoId.get(id)!),
    };
    fase.vizinhos = fase.vizinhos.map((v) => {
      if (!v.seta) return v; // quem não conta pra ninguém continua assim
      const amigos = amigosDe(fase, v.id);
      return { ...v, seta: amigos.length ? amigos[Math.floor(sorte() * amigos.length)] : undefined };
    });
    if (!justa(fase, tutorial)) continue;
    const q = qualidade(fase);
    if (q.cadeia >= piso.cadeia && q.armadilhas >= Math.min(piso.armadilhas, 0.6)) return fase;
  }
  return base; // nada justo apareceu: joga a fase original
}
