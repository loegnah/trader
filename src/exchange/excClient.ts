import { ENV } from "@/env";
import { BybitClient } from "@/exchange/bybit/bybit.client";
import type { ExchangeClient } from "@/model/ex-client.model";
import { Exchange } from "@/type/trade.type";

const clients = new Map<Exchange, ExchangeClient>();

const clientGetter: Record<Exchange, () => ExchangeClient> = {
  [Exchange.BYBIT]: () => {
    if (!clients.has(Exchange.BYBIT)) {
      clients.set(
        Exchange.BYBIT,
        new BybitClient({
          apiKey: ENV.BYBIT_API_KEY,
          apiSecret: ENV.BYBIT_API_SECRET,
          isDemoTrading: ENV.BYBIT_IS_DEMO_TRADING,
          isTestnet: ENV.BYBIT_IS_TESTNET,
        }),
      );
    }
    return clients.get(Exchange.BYBIT)!;
  },
};

export function getExcClient(exc: Exchange) {
  return clientGetter[exc]();
}
