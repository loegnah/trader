import type { Candle } from "@/model/candle.model";

export function candleChangeRatio({ open, close }: Candle): number {
  return (close - open) / open;
}
