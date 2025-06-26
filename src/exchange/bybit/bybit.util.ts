import { $Candle, $CandleWithConfirm, type Candle } from "@/type/trade.type";
import type { OHLCVKlineV5 } from "bybit-api";
import { zipObject } from "es-toolkit";
import { z } from "zod/v4";

const KLINE_KEYS = [
  "start",
  "open",
  "high",
  "low",
  "close",
  "volume",
  "turnover",
];
export function convertBybitKlinesToCandles(
  rawKlines: OHLCVKlineV5[],
): Candle[] {
  const candles = rawKlines.map((rk) => zipObject(KLINE_KEYS, rk));
  return z.array($Candle).parse(candles);
}

export function convertBybitKlineEventToCandle(klineEventData: any) {
  if (!klineEventData || !klineEventData.length) return null;
  const candleWithConfirm = $CandleWithConfirm.parse(klineEventData[0]);
  return {
    candle: candleWithConfirm,
    confirm: candleWithConfirm.confirm,
  };
}
