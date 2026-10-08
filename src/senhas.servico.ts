import { PREFIXO, RAZAO_PREFERENCIAL, TAMANHO_PAINEL } from "./config";
import type { Senha, TipoSenha } from "./dominio";
import { ErroApi } from "./erros";
import type { RepositorioSenhas } from "./repositorio";
import { diaLocal, formatarIso, type Relogio } from "./tempo";

export function formatarCodigo(sequencia: number): string {
  return PREFIXO + String(sequencia).padStart(3, "0");
}

export class ServicoSenhas {
  constructor(
    private readonly repo: RepositorioSenhas,
    private readonly relogio: Relogio,
  ) {}

  emitir(tipo: TipoSenha): Senha {
    return this.repo.executarAtomico(() => {
      const agora = this.relogio();
      const sequencia = this.repo.proximaSequencia(diaLocal(agora));
      return this.repo.inserir({
        codigo: formatarCodigo(sequencia),
        tipo,
        emissao: formatarIso(agora),
        status: "aguardando",
        chamada_em: null,
        ordem_chamada: null,
      });
    });
  }

  chamarProxima(): Senha {
    return this.repo.executarAtomico(() => {
      const preferencial = this.repo.primeiraAguardando("preferencial");
      const normal = this.repo.primeiraAguardando("normal");
      const seguidas = this.repo.lerPreferenciaisSeguidas();

      let escolhida: Senha;
      if (preferencial && (!normal || seguidas < RAZAO_PREFERENCIAL)) {
        escolhida = preferencial;
        this.repo.gravarPreferenciaisSeguidas(
          Math.min(seguidas + 1, RAZAO_PREFERENCIAL),
        );
      } else if (normal) {
        escolhida = normal;
        this.repo.gravarPreferenciaisSeguidas(0);
      } else {
        throw new ErroApi(404, "fila_vazia");
      }

      const chamada: Senha = {
        ...escolhida,
        status: "chamada",
        chamada_em: formatarIso(this.relogio()),
        ordem_chamada: this.repo.proximaOrdemChamada(),
      };
      this.repo.atualizar(chamada);
      return chamada;
    });
  }

  concluir(codigo: string): Senha {
    return this.repo.executarAtomico(() => {
      const senha = this.buscarOuFalhar(codigo);
      if (senha.status !== "chamada") {
        throw new ErroApi(409, "senha_nao_chamada");
      }
      const concluida: Senha = { ...senha, status: "concluida" };
      this.repo.atualizar(concluida);
      return concluida;
    });
  }

  rechamar(codigo: string): Senha {
    return this.repo.executarAtomico(() => {
      const senha = this.buscarOuFalhar(codigo);
      if (senha.status !== "chamada") {
        throw new ErroApi(409, "senha_nao_chamada");
      }
      const rechamada: Senha = {
        ...senha,
        chamada_em: formatarIso(this.relogio()),
        ordem_chamada: this.repo.proximaOrdemChamada(),
      };
      this.repo.atualizar(rechamada);
      return rechamada;
    });
  }

  cancelar(codigo: string): Senha {
    return this.repo.executarAtomico(() => {
      const senha = this.buscarOuFalhar(codigo);
      if (senha.status !== "aguardando") {
        throw new ErroApi(409, "senha_nao_aguardando");
      }
      const cancelada: Senha = { ...senha, status: "cancelada" };
      this.repo.atualizar(cancelada);
      return cancelada;
    });
  }

  painel(): Senha[] {
    return this.repo.ultimasChamadas(TAMANHO_PAINEL);
  }

  private buscarOuFalhar(codigo: string): Senha {
    const senha = this.repo.buscarPorCodigo(codigo);
    if (!senha) {
      throw new ErroApi(404, "senha_nao_encontrada");
    }
    return senha;
  }
}
