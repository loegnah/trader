export abstract class ExchangeClient<T> {
  protected abstract client: T;

  abstract getClient$(): T;
}
