import { PREFIXO, RAZAO_PREFERENCIAL } from "./config";
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
      };
      this.repo.atualizar(chamada);
      return chamada;
    });
  }
}
