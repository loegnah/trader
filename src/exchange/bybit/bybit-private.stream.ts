import { orderChannel } from "@/channel/order.channel";
import { positionChannel } from "@/channel/position.channel";
import { ExchangeStreamPrivate } from "@/model/ex-stream.model";
import { $Order, $Position, Exchange } from "@/type/trade.type";
import { logger } from "@/util/logger";
import { WebsocketClient } from "bybit-api";
import { z } from "zod/v4";

export class BybitStreamPrivate extends ExchangeStreamPrivate {
  private stream: WebsocketClient;

  constructor(params: {
    apiKey: string;
    apiSecret: string;
    isDemoTrading?: boolean;
    isTestnet?: boolean;
  }) {
    super();
    this.stream = new WebsocketClient({
      key: params.apiKey,
      secret: params.apiSecret,
      demoTrading: params.isDemoTrading,
      testnet: params.isTestnet,
    });
  }

  init = async () => {
    this.subscribe();
    this.setupStreamListener();
  };

  private subscribe = () => {
    this.stream.subscribeV5("order", "linear");
    this.stream.subscribeV5("position", "linear");
  };

  private setupStreamListener = () => {
    this.stream.on("close", () => {
      logger.warn("[bybit-stream-private] connection closed");
    });
    this.stream.on("exception", (error) => {
      logger.error({ error }, "[bybit-stream-private] connection error");
    });
    this.stream.on("update", (event) => {
      if (event.topic.startsWith("order")) {
        return this.handleOrderEvent(event);
      }
      if (event.topic.startsWith("position")) {
        return this.handlePositionEvent(event);
      }
    });
  };

  // ---------------- event handler ----------------

  private handleOrderEvent = (event: any) => {
    const { error, data } = z.array($Order).safeParse(event.data);
    if (error) {
      logger.warn({ error }, "[bybit-stream-private] order event error");
      return;
    }
    orderChannel.emit({
      exchange: Exchange.BYBIT,
      data: {
        orders: data,
      },
    });
  };

  private handlePositionEvent = (event: any) => {
    const { error, data } = z.array($Position).safeParse(event.data);
    if (error) {
      logger.warn({ error }, "[bybit-stream-private] position event error");
      return;
    }
    positionChannel.emit({
      exchange: Exchange.BYBIT,
      data: {
        positions: data,
      },
    });
  };
}
