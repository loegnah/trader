import { ExchangeStreamPrivate } from "@/model/ex-stream.model";
import { WebsocketClient } from "bybit-api";

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

  init = async () => {};

  setupHandler = async () => {};
}
