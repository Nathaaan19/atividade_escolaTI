import express, {
  type Express,
  type NextFunction,
  type Request,
  type Response,
} from "express";
import { ErroApi } from "./erros";
import type { RepositorioSenhas } from "./repositorio";
import { RepositorioMemoria } from "./repositorio.memoria";
import { criarRotasSenhas } from "./rotas";
import { ServicoSenhas } from "./senhas.servico";
import { relogioSistema, type Relogio } from "./tempo";

export interface DependenciasApp {
  repositorio?: RepositorioSenhas;
  relogio?: Relogio;
}

function ehErroDeJson(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "type" in err &&
    err.type === "entity.parse.failed"
  );
}

export function createApp(deps: DependenciasApp = {}): Express {
  const repositorio = deps.repositorio ?? new RepositorioMemoria();
  const relogio = deps.relogio ?? relogioSistema;
  const servico = new ServicoSenhas(repositorio, relogio);

  const app = express();
  app.disable("x-powered-by");
  app.use(express.json());

  app.get("/healthz", (_req: Request, res: Response) => {
    res.status(200).json({ status: "ok" });
  });

  app.use(criarRotasSenhas(servico));

  app.use((err: unknown, req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof ErroApi) {
      res.status(err.status).json({ erro: err.erro });
      return;
    }
    if (ehErroDeJson(err)) {
      if (req.method === "POST" && req.path === "/senhas") {
        res.status(422).json({ erro: "tipo_invalido" });
        return;
      }
      res.status(400).json({ erro: "json_invalido" });
      return;
    }
    console.error(err);
    res.status(500).json({ erro: "erro_interno" });
  });

  return app;
}
