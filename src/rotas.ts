import { Router } from "express";
import { paraApi } from "./dominio";
import { esquemaEmitirSenha } from "./schemas";
import type { ServicoSenhas } from "./senhas.servico";

export function criarRotasSenhas(servico: ServicoSenhas): Router {
  const rotas = Router();

  rotas.post("/senhas", (req, res) => {
    const resultado = esquemaEmitirSenha.safeParse(req.body);
    if (!resultado.success) {
      res.status(422).json({ erro: "tipo_invalido" });
      return;
    }
    const senha = servico.emitir(resultado.data.tipo);
    res.status(201).json(paraApi(senha));
  });

  return rotas;
}
