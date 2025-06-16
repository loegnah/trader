import { ExchangeStreamPublic } from "@/exchange/stream/ex-public.stream";
import { convertBybitKlineEventToCandle } from "@/lib/bybit.lib";
import { logger } from "@/util/logger";
import { WebsocketClient } from "bybit-api";

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
    this.setupHandler();
    this.stream.subscribeV5("kline.1.BTCUSDT", "linear");
  }

  setupHandler() {
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

  handleKlineEvent(event: any) {
    const candle = convertBybitKlineEventToCandle(event);
    if (!candle) {
      console.log("candle is null");
    }
    console.log(candle);
  }
}
