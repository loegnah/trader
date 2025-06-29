import type { Candle, MemoryCandleData } from "@/type/trade.type";
import { candleSide } from "@/util/candle.util";

export function makeMemoryCandleData(params: {
  candle: Candle;
  rsi?: number;
}): MemoryCandleData {
  return {
    candle: params.candle,
    side: candleSide(params.candle),
    rsi: params.rsi,
  };
}
