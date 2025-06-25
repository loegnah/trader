import type { Candle } from "@/type/trade.type";

export function candleChangeRatio({ open, close }: Candle): number {
  return (close - open) / open;
}
