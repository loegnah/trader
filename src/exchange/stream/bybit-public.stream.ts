import { ExchangeStreamPublic } from "@/exchange/stream/ex-public.stream";
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

  async init() {}
}
