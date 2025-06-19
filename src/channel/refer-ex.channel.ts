import {
  BehaviorSubject,
  type Observable,
  Subject,
  type Subscription,
} from "rxjs";
import { distinctUntilChanged, filter, map, share } from "rxjs/operators";

export type Exchange = "bybit" | "binance";

// Event types
export interface CandleEvent {
  candle: {
    symbol: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    timestamp: number;
    confirm: boolean;
  };
}

export interface OrderEvent {
  order: {
    orderId: string;
    symbol: string;
    side: "buy" | "sell";
    type: "market" | "limit";
    quantity: number;
    price?: number;
    status: "new" | "filled" | "cancelled" | "rejected";
    timestamp: number;
  };
}

export interface PositionEvent {
  position: {
    symbol: string;
    side: "long" | "short";
    size: number;
    avgPrice: number;
    unrealizedPnl: number;
    timestamp: number;
  };
}

export interface WalletEvent {
  wallet: {
    coin: string;
    balance: number;
    availableBalance: number;
    timestamp: number;
  };
}

// Union type for all events
export type ExchangeEventData =
  | { type: "candle"; data: CandleEvent }
  | { type: "order"; data: OrderEvent }
  | { type: "position"; data: PositionEvent }
  | { type: "wallet"; data: WalletEvent };

// Subscription command for controlling what to subscribe to
export interface SubscriptionCommand {
  action: "subscribe" | "unsubscribe";
  eventType: ExchangeEventData["type"];
  topic: string; // e.g., "BTCUSDT", "orders", "positions"
  exchange: Exchange;
}

interface ExchangeChannelEvent {
  exchange: Exchange;
  topic: string;
  eventData: ExchangeEventData;
}

export class ExchangeEventChannel {
  private eventSubject = new Subject<ExchangeChannelEvent>();
  private subscriptionSubject = new Subject<SubscriptionCommand>();

  // Keep track of active subscriptions
  private activeSubscriptions = new BehaviorSubject<Set<string>>(new Set());

  // Hot observable for events
  public readonly events$ = this.eventSubject.asObservable().pipe(share());

  // Observable for subscription commands
  public readonly subscriptionCommands$ = this.subscriptionSubject
    .asObservable()
    .pipe(share());

  // Observable for active subscriptions
  public readonly activeSubscriptions$ = this.activeSubscriptions
    .asObservable()
    .pipe(distinctUntilChanged((prev, curr) => this.setsEqual(prev, curr)));

  private setsEqual(a: Set<string>, b: Set<string>): boolean {
    return a.size === b.size && [...a].every((x) => b.has(x));
  }

  private makeSubscriptionKey(
    exchange: Exchange,
    eventType: string,
    topic: string,
  ): string {
    return `${exchange}-${eventType}-${topic}`;
  }

  // Emit an event
  emit({
    exchange,
    topic,
    eventData,
  }: {
    exchange: Exchange;
    topic: string;
    eventData: ExchangeEventData;
  }) {
    this.eventSubject.next({
      exchange,
      topic,
      eventData,
    });
  }

  // Subscribe to a topic
  subscribe({
    exchange,
    eventType,
    topic,
  }: {
    exchange: Exchange;
    eventType: ExchangeEventData["type"];
    topic: string;
  }) {
    const key = this.makeSubscriptionKey(exchange, eventType, topic);
    const currentSubs = new Set(this.activeSubscriptions.value);
    currentSubs.add(key);
    this.activeSubscriptions.next(currentSubs);

    this.subscriptionSubject.next({
      action: "subscribe",
      eventType,
      topic,
      exchange,
    });
  }

  // Unsubscribe from a topic
  unsubscribe({
    exchange,
    eventType,
    topic,
  }: {
    exchange: Exchange;
    eventType: ExchangeEventData["type"];
    topic: string;
  }) {
    const key = this.makeSubscriptionKey(exchange, eventType, topic);
    const currentSubs = new Set(this.activeSubscriptions.value);
    currentSubs.delete(key);
    this.activeSubscriptions.next(currentSubs);

    this.subscriptionSubject.next({
      action: "unsubscribe",
      eventType,
      topic,
      exchange,
    });
  }

  // Get filtered observable for specific criteria
  getEvents$<T extends ExchangeEventData["type"]>({
    exchange,
    eventType,
    topic,
  }: {
    exchange?: Exchange;
    eventType?: T;
    topic?: string;
  }): Observable<Extract<ExchangeEventData, { type: T }>> {
    return this.events$.pipe(
      filter((event) => {
        if (exchange && event.exchange !== exchange) return false;
        if (eventType && event.eventData.type !== eventType) return false;
        if (topic && event.topic !== topic) return false;
        return true;
      }),
      map(
        (event) => event.eventData as Extract<ExchangeEventData, { type: T }>,
      ),
    );
  }

  // Subscribe to events with handler
  on<T extends ExchangeEventData["type"]>({
    exchange,
    eventType,
    topic,
    handler,
  }: {
    exchange?: Exchange;
    eventType?: T;
    topic?: string;
    handler: (event: Extract<ExchangeEventData, { type: T }>) => void;
  }): Subscription {
    return this.getEvents$({ exchange, eventType, topic }).subscribe(handler);
  }

  // Check if a subscription is active
  isSubscribed(
    exchange: Exchange,
    eventType: ExchangeEventData["type"],
    topic: string,
  ): boolean {
    const key = this.makeSubscriptionKey(exchange, eventType, topic);
    return this.activeSubscriptions.value.has(key);
  }

  // Get all active subscriptions
  getActiveSubscriptions(): string[] {
    return Array.from(this.activeSubscriptions.value);
  }

  // Close the channel
  complete() {
    this.eventSubject.complete();
    this.subscriptionSubject.complete();
    this.activeSubscriptions.complete();
  }

  // Handle errors
  error(error: Error) {
    this.eventSubject.error(error);
  }
}

// Singleton instance
export const exchangeEventChannel = new ExchangeEventChannel();
