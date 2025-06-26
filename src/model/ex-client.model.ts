export abstract class ExchangeClient<T> {
  protected abstract client: T;

  abstract client$(): T;

  abstract getAvailableBalance(params: { coinName: string }): Promise<number>;
}
