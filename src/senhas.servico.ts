import { PREFIXO } from "./config";
import type { Senha, TipoSenha } from "./dominio";
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
}
