import { Exchange } from "@/model/ex.model";
import { Subject, share } from "rxjs";

export type ExchangeEventData<T = any> = {
  exchange: Exchange;
  data: T;
};

export type CandleData = {
  symbol: string;
};

class ExchangeChannel<T> {
  public readonly events$ = new Subject<ExchangeEventData<T>>();
  public readonly sharedEvents$ = this.events$.pipe(share());

  constructor() {
    this.init();
  }

  async init() {}

  emit(event: ExchangeEventData<T>) {
    this.events$.next(event);
  }

  on(handler: (event: ExchangeEventData<T>) => void) {
    return this.sharedEvents$.subscribe(handler);
  }
}

export const candleChannel = new ExchangeChannel<CandleData>();
