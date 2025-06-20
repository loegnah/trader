export abstract class ExchangeStreamPrivate {
  abstract init(): Promise<void>;
}

export abstract class ExchangeStreamPublic {
  abstract init(): Promise<void>;
}
