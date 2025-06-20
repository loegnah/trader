import { ENV } from "@/env";
import { BybitStreamPrivate } from "@/exchange/bybit/bybit-private.stream";
import { BybitStreamPublic } from "@/exchange/bybit/bybit-public.stream";
import { discord } from "@/lib/discord/discord";

async function main() {
  const _bybitStreamPrivate = new BybitStreamPrivate({
    apiKey: ENV.BYBIT_API_KEY,
    apiSecret: ENV.BYBIT_API_SECRET,
    isDemoTrading: ENV.BYBIT_IS_DEMO_TRADING,
    isTestnet: ENV.BYBIT_IS_TESTNET,
  });

  const bybitStreamPublic = new BybitStreamPublic({
    isTestnet: ENV.BYBIT_IS_TESTNET,
  });
  await bybitStreamPublic.init();

  await discord.init();
}

main();
