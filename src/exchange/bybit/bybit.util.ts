import { $Candle, type Candle } from "@/model/candle.model";

export function convertBybitKlineEventToCandle(
  klineEventData: any,
): Candle | null {
  if (!klineEventData || !klineEventData.length) return null;
  return $Candle.safeParse(klineEventData[0]).data ?? null;
}
