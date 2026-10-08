import type { Senha, TipoSenha } from "./dominio";
import type { NovaSenha, RepositorioSenhas } from "./repositorio";

export class RepositorioMemoria implements RepositorioSenhas {
  private senhas: Senha[] = [];
  private sequencias = new Map<string, number>();
  private ultimoId = 0;
  private preferenciaisSeguidas = 0;
  private ultimaOrdemChamada = 0;

  executarAtomico<T>(fn: () => T): T {
    return fn();
  }

  proximaSequencia(dia: string): number {
    const proxima = (this.sequencias.get(dia) ?? 0) + 1;
    this.sequencias.set(dia, proxima);
    return proxima;
  }

  inserir(nova: NovaSenha): Senha {
    this.ultimoId += 1;
    const senha: Senha = { ...nova, id: this.ultimoId };
    this.senhas.push(senha);
    return { ...senha };
  }

  primeiraAguardando(tipo: TipoSenha): Senha | undefined {
    const senha = this.senhas.find(
      (s) => s.tipo === tipo && s.status === "aguardando",
    );
    return senha ? { ...senha } : undefined;
  }

  atualizar(senha: Senha): void {
    const indice = this.senhas.findIndex((s) => s.id === senha.id);
    if (indice === -1) {
      throw new Error(`Senha id=${senha.id} nao existe no repositorio`);
    }
    this.senhas[indice] = { ...senha };
  }

  buscarPorCodigo(codigo: string): Senha | undefined {
    for (let i = this.senhas.length - 1; i >= 0; i--) {
      const senha = this.senhas[i];
      if (senha.codigo === codigo) {
        return { ...senha };
      }
    }
    return undefined;
  }

  proximaOrdemChamada(): number {
    this.ultimaOrdemChamada += 1;
    return this.ultimaOrdemChamada;
  }

  lerPreferenciaisSeguidas(): number {
    return this.preferenciaisSeguidas;
  }

  gravarPreferenciaisSeguidas(valor: number): void {
    this.preferenciaisSeguidas = valor;
  }
}
