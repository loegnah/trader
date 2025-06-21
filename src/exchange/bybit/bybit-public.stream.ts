import { streamCn } from "@/channel/stream.channel";
import { convertBybitKlineEventToCandle } from "@/exchange/bybit/bybit.util";
import { ExchangeStreamPublic } from "@/model/ex-stream.model";
import { Exchange } from "@/model/ex.model";
import { logger } from "@/util/logger";
import { WebsocketClient } from "bybit-api";

const EX = Exchange.BYBIT;

export class BybitStreamPublic extends ExchangeStreamPublic {
  private stream: WebsocketClient;

  constructor(params: {
    isTestnet?: boolean;
  }) {
    super();
    this.stream = new WebsocketClient({
      testnet: params.isTestnet,
    });
  }

  async init() {
    this.setupStreamListener();
    this.setupChannelListener();
  }

  private setupStreamListener() {
    this.stream.on("close", () => {
      logger.warn("[bybit-stream-public] connection closed");
    });
    this.stream.on("exception", (error) => {
      logger.error({ error }, "[bybit-stream-public] connection error");
    });
    this.stream.on("update", (event) => {
      if (event.topic.startsWith("kline")) {
        return this.handleKlineEvent(event);
      }
    });
  }

  private setupChannelListener() {
    streamCn.onSubscribe(EX, ({ symbol }) => {
      this.stream.subscribeV5(symbol, "linear");
      logger.info(`[bybit-stream-public] subscribed to ${symbol}`);
    });
  }

  private handleKlineEvent(event: any) {
    const candle = convertBybitKlineEventToCandle(event);
    if (!candle) {
      console.log("candle is null");
    }
    console.log(`cur price: ${candle?.close}`);
  }
}
