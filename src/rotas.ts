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

  rotas.get("/senhas/proxima", (_req, res) => {
    const senha = servico.chamarProxima();
    res.status(200).json(paraApi(senha));
  });

  rotas.post("/senhas/:codigo/concluir", (req, res) => {
    res.status(200).json(paraApi(servico.concluir(req.params.codigo)));
  });

  rotas.post("/senhas/:codigo/rechamar", (req, res) => {
    res.status(200).json(paraApi(servico.rechamar(req.params.codigo)));
  });

  rotas.post("/senhas/:codigo/cancelar", (req, res) => {
    res.status(200).json(paraApi(servico.cancelar(req.params.codigo)));
  });

  rotas.get("/painel", (_req, res) => {
    res.status(200).json({ chamadas: servico.painel().map((s) => paraApi(s)) });
  });

  return rotas;
}
