import type { Exchange } from "@/model/ex.model";
import { Subject, filter, map, share, tap } from "rxjs";

export enum ExChannelType {
  CANDLE = "candle",
  ORDER = "order",
  POSITION = "position",
}

export type ExChannelEvent<T = any> = {
  event: T;
  exchange: Exchange;
};

export class ExchangeChannel<T = any> {
  public readonly events$ = new Subject<ExChannelEvent<T>>();
  public readonly sharedEvents$ = this.events$.pipe(share());

  constructor() {
    this.init();
  }

  async init() {}

  emit(event: ExChannelEvent<T>) {
    this.events$.next(event);
  }

  on(exchange: Exchange, handler: (data: T) => void) {
    return this.sharedEvents$.pipe(
      filter((event) => event.exchange === exchange),
      map((event) => event.event),
      tap(handler),
    );
  }
}
