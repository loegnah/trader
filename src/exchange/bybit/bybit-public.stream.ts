import { candleChannel } from "@/channel/candle.channel";
import { streamCn } from "@/channel/stream.channel";
import { convertBybitKlineEventToCandle } from "@/exchange/bybit/bybit.util";
import { ExchangeStreamPublic } from "@/model/ex-stream.model";
import { Exchange } from "@/type/trade.type";
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
    streamCn.onSubscribe$({ exchange: EX }).subscribe(({ topics }) => {
      this.stream.subscribeV5(topics, "linear");
      logger.info(`[bybit-stream-public] subscribed to (${topics.join(", ")})`);
    });
  }

  private handleKlineEvent(event: any) {
    const ret = convertBybitKlineEventToCandle(event.data);
    if (!ret) {
      logger.warn("[bybit-stream-public] candle is null");
      return;
    }
    candleChannel.emit({
      exchange: EX,
      data: {
        topic: event.topic,
        data: ret.candle,
        confirm: ret.confirm,
      },
    });
  }
}
