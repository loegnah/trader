import type { Exchange } from "@/model/ex.model";
import { Observable, Subject, filter, map, share } from "rxjs";

export enum ExChannelType {
  CANDLE = "candle",
  ORDER = "order",
  POSITION = "position",
}

export type ExChannelEvent<T = any> = {
  data: T;
  exchange: Exchange;
};

export class ExchangeChannel<T = any> {
  protected readonly events$ = new Subject<ExChannelEvent<T>>();
  protected readonly sharedEvents$ = this.events$.pipe(share());

  emit(event: ExChannelEvent<T>) {
    this.events$.next(event);
  }

  on$(params: { exchange: Exchange }): Observable<T> {
    return this.sharedEvents$.pipe(
      filter((event) => event.exchange === params.exchange),
      map((event) => event.data),
    );
  }
}
