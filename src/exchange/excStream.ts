import { ENV } from "@/env";
import { BybitStreamPrivate } from "@/exchange/bybit/bybit-private.stream";
import { BybitStreamPublic } from "@/exchange/bybit/bybit-public.stream";
import {
  ExchangeStreamPrivate,
  ExchangeStreamPublic,
} from "@/model/ex-stream.model";
import { Exchange } from "@/type/trade.type";

const streams = new Map<
  Exchange,
  [ExchangeStreamPublic, ExchangeStreamPrivate]
>();

const streamGetter: Record<
  Exchange,
  () => [ExchangeStreamPublic, ExchangeStreamPrivate]
> = {
  [Exchange.BYBIT]: () => {
    if (!streams.has(Exchange.BYBIT)) {
      streams.set(Exchange.BYBIT, [
        new BybitStreamPublic({
          isTestnet: ENV.BYBIT_IS_TESTNET,
        }),
        new BybitStreamPrivate({
          apiKey: ENV.BYBIT_API_KEY,
          apiSecret: ENV.BYBIT_API_SECRET,
          isDemoTrading: ENV.BYBIT_IS_DEMO_TRADING,
          isTestnet: ENV.BYBIT_IS_TESTNET,
        }),
      ]);
    }
    return streams.get(Exchange.BYBIT)!;
  },
};

export async function runExcStream(exc: Exchange) {
  const [publicStream, privateStream] = streamGetter[exc]();
  await publicStream.init();
  await privateStream.init();
}
