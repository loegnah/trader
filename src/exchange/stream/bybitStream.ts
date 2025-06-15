import { ExchangeStream } from "@/exchange/stream/exchangeStream";
import { WebsocketClient } from "bybit-api";

export class BybitStream extends ExchangeStream {
  private streamPub: WebsocketClient;
  private streamPri: WebsocketClient;

  constructor(params: {
    apiKey: string;
    apiSecret: string;
    isDemoTrading?: boolean;
    isTestnet?: boolean;
  }) {
    super();
    this.streamPub = new WebsocketClient({
      testnet: params.isTestnet,
    });
    this.streamPri = new WebsocketClient({
      key: params.apiKey,
      secret: params.apiSecret,
      demoTrading: false, // Not support in demo trading
      testnet: params.isTestnet,
    });
  }
}
