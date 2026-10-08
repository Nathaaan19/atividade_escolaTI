import type { Senha, TipoSenha } from "./dominio";

export type NovaSenha = Omit<Senha, "id">;

export interface RepositorioSenhas {
  executarAtomico<T>(fn: () => T): T;

  proximaSequencia(dia: string): number;

  inserir(nova: NovaSenha): Senha;

  primeiraAguardando(tipo: TipoSenha): Senha | undefined;

  atualizar(senha: Senha): void;

  buscarPorCodigo(codigo: string): Senha | undefined;

  proximaOrdemChamada(): number;

  lerPreferenciaisSeguidas(): number;
  gravarPreferenciaisSeguidas(valor: number): void;
  ultimasChamadas(limite: number): Senha[];
}
