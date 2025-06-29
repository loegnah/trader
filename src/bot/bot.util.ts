import type { Candle, MemoryCandleData } from "@/type/trade.type";
import { candleSide } from "@/util/candle.util";

export function makeMemoryCandleData(params: {
  candle: Candle;
  preCandle: Candle;
  rsi?: number;
}): MemoryCandleData {
  return {
    candle: params.candle,
    side: candleSide(params.candle),
    preCandle: params.preCandle,
    preSide: candleSide(params.preCandle),
    rsi: params.rsi,
  };
}
