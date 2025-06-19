import type { Candle } from "@/model/candle.model";
import { type Observable, Subject, type Subscription } from "rxjs";
import { filter, map, share } from "rxjs/operators";

type Exchange = "bybit";
export type CandleEvent = { candle: Candle };
export type CandleEventType = "live" | "done";

interface CandleChannelEvent {
  exchange: Exchange;
  topic: string;
  eventType: CandleEventType;
  data: CandleEvent;
}

class CandleChannel {
  private exchange: Exchange;
  private eventType: CandleEventType;
  private subject = new Subject<CandleChannelEvent>();

  // Share the observable to make it hot and multicasted
  public readonly stream$ = this.subject.pipe(share());

  constructor({
    exchange,
    eventType,
  }: { exchange: Exchange; eventType: CandleEventType }) {
    this.exchange = exchange;
    this.eventType = eventType;
  }

  private makeEventKey(topic: string) {
    return `${this.exchange}-${topic}-${this.eventType}`;
  }

  emit({
    topic,
    event,
  }: {
    topic: string;
    event: CandleEvent;
  }) {
    this.subject.next({
      exchange: this.exchange,
      topic,
      eventType: this.eventType,
      data: event,
    });
  }

  // Subscribe to specific topic
  on({
    topic,
    handler,
  }: {
    topic: string;
    handler: (event: CandleEvent) => void;
  }): Subscription {
    return this.stream$
      .pipe(
        filter(
          (event) =>
            event.topic === topic && event.eventType === this.eventType,
        ),
        map((event) => event.data),
      )
      .subscribe(handler);
  }

  // Get observable for specific topic
  getTopic$(topic: string): Observable<CandleEvent> {
    return this.stream$.pipe(
      filter(
        (event) =>
          event.exchange === this.exchange &&
          event.topic === topic &&
          event.eventType === this.eventType,
      ),
      map((event) => event.data),
    );
  }

  // Close the channel
  complete() {
    this.subject.complete();
  }

  // Handle errors
  error(error: Error) {
    this.subject.error(error);
  }
}

export const bybitLiveCandleChannel = new CandleChannel({
  exchange: "bybit",
  eventType: "live",
});

export const bybitDoneCandleChannel = new CandleChannel({
  exchange: "bybit",
  eventType: "done",
});
