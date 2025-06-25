import { $Candle } from "@/type/trade.type";
import { type Candle } from "@/type/trade.type";

export function convertBybitKlineEventToCandle(
  klineEventData: any,
): Candle | null {
  if (!klineEventData || !klineEventData.length) return null;
  return $Candle.safeParse(klineEventData[0]).data ?? null;
}
