import { createApp } from "./app";

const PORTA = 8080;

const app = createApp();

const server = app.listen(PORTA, "0.0.0.0", () => {
  console.log(`API ouvindo na porta ${PORTA}`);
});

function encerrar(sinal: string): void {
  console.log(`Recebido ${sinal}, encerrando...`);
  server.close(() => process.exit(0));
}

process.on("SIGTERM", () => encerrar("SIGTERM"));
process.on("SIGINT", () => encerrar("SIGINT"));
