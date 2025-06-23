export abstract class ExchangeClient<T> {
  protected abstract client: T;

  abstract getClient$(): T;

  abstract getAvailableBalance(params: { coinName: string }): Promise<number>;
}
