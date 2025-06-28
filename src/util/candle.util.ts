import type { Candle } from "@/type/trade.type";

export function candleChangeRatio({ open, close }: Candle): number {
  return (close - open) / open;
}

export function calcOhlc(
  candle: Pick<Candle, "open" | "high" | "low" | "close">,
) {
  return (candle.open + candle.high + candle.low + candle.close) / 4;
}
