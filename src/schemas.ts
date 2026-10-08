import { z } from "zod";
import { TIPOS } from "./dominio";

export const esquemaEmitirSenha = z.object({
  tipo: z.enum(TIPOS),
});
