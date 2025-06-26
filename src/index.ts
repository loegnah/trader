import { OutlierBot } from "@/bot/outlier/outlier.bot";
import { ENV } from "@/env";
import { BybitStreamPrivate } from "@/exchange/bybit/bybit-private.stream";
import { BybitStreamPublic } from "@/exchange/bybit/bybit-public.stream";
import { BybitClient } from "@/exchange/bybit/bybit.client";
import { discord } from "@/lib/discord/discord";
import { Exchange } from "./type/trade.type";

async function main() {
  const bybitStreamPrivate = new BybitStreamPrivate({
    apiKey: ENV.BYBIT_API_KEY,
    apiSecret: ENV.BYBIT_API_SECRET,
    isDemoTrading: ENV.BYBIT_IS_DEMO_TRADING,
    isTestnet: ENV.BYBIT_IS_TESTNET,
  });
  const bybitStreamPublic = new BybitStreamPublic({
    isTestnet: ENV.BYBIT_IS_TESTNET,
  });
  await bybitStreamPublic.init();
  await bybitStreamPrivate.init();
  // await discord.init();

  const outlierBot = new OutlierBot({ exc: Exchange.BYBIT });
  await outlierBot.init();

  const bybitClient = new BybitClient({
    apiKey: ENV.BYBIT_API_KEY,
    apiSecret: ENV.BYBIT_API_SECRET,
    isDemoTrading: ENV.BYBIT_IS_DEMO_TRADING,
    isTestnet: ENV.BYBIT_IS_TESTNET,
  });
  const availableBalance = await bybitClient.getAvailableBalance({
    coinName: "USDT",
  });
  console.log(availableBalance);
  const candles = await bybitClient.getCandles({
    symbol: "BTCUSDT",
    interval: "1",
    limit: 1,
  });
  console.log(candles);
}

main();
