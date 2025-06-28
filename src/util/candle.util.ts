import type { Candle, CandleCore, TSide } from "@/type/trade.type";

export function candleChangeRatio({ open, close }: Candle): number {
  return (close - open) / open;
}

export function calcOhlc(candle: CandleCore) {
  return (candle.open + candle.high + candle.low + candle.close) / 4;
}

export function convertCandles(
  candles: CandleCore[],
  type: "close" | "ohlc",
): number[] {
  return candles.map((candle) =>
    type === "close" ? candle.close : calcOhlc(candle),
  );
}

export function candleSide(candle: CandleCore): TSide {
  return candle.close > candle.open ? "Buy" : "Sell";
}
