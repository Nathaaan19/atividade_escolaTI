export const TIPOS = ["normal", "preferencial"] as const;
export type TipoSenha = (typeof TIPOS)[number];

export type StatusSenha = "aguardando" | "chamada" | "concluida" | "cancelada";

export interface Senha {
  id: number;
  codigo: string;
  tipo: TipoSenha;
  emissao: string;
  status: StatusSenha;
  chamada_em: string | null;
  ordem_chamada: number | null;
}

export interface SenhaApi {
  codigo: string;
  tipo: TipoSenha;
  emissao: string;
  status: StatusSenha;
  chamada_em?: string;
}

export function paraApi(senha: Senha): SenhaApi {
  const saida: SenhaApi = {
    codigo: senha.codigo,
    tipo: senha.tipo,
    emissao: senha.emissao,
    status: senha.status,
  };
  if (senha.chamada_em !== null) {
    saida.chamada_em = senha.chamada_em;
  }
  return saida;
}
