import { ENV } from "@/env";
import { BybitStream } from "@/exchange/stream/bybitStream";

async function main() {
  console.log({ ENV });

  const _bybitStream = new BybitStream({
    apiKey: ENV.BYBIT_API_KEY,
    apiSecret: ENV.BYBIT_API_SECRET,
    isDemoTrading: ENV.BYBIT_IS_DEMO_TRADING,
    isTestnet: ENV.BYBIT_IS_TESTNET,
  });
}

main();
