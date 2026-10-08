export type Relogio = () => Date;

export const relogioSistema: Relogio = () => new Date();
const OFFSET_MINUTOS = -3 * 60;

/** Data/hora em ISO-8601 com fuso -03:00, ex.: 2026-10-07T22:05:13.123-03:00 */
export function formatarIso(data: Date): string {
  const local = new Date(data.getTime() + OFFSET_MINUTOS * 60_000);
  return local.toISOString().replace("Z", "-03:00");
}

/** Dia local em -03:00 (AAAA-MM-DD) — chave do reinicio diario da sequencia. */
export function diaLocal(data: Date): string {
  return formatarIso(data).slice(0, 10);
}
