export class ErroApi extends Error {
  constructor(
    public readonly status: number,
    public readonly erro: string,
  ) {
    super(erro);
    this.name = "ErroApi";
  }
}
