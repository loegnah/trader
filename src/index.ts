import { ENV } from "@/env";
import { BybitStreamPrivate } from "@/exchange/stream/bybit-private.stream";

async function main() {
  console.log({ ENV });

  const _bybitStream = new BybitStreamPrivate({
    apiKey: ENV.BYBIT_API_KEY,
    apiSecret: ENV.BYBIT_API_SECRET,
    isDemoTrading: ENV.BYBIT_IS_DEMO_TRADING,
    isTestnet: ENV.BYBIT_IS_TESTNET,
  });
}

main();
