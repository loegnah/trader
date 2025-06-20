import { $Candle, type Candle } from "@/model/candle.model";

export function convertBybitKlineEventToCandle(event: any): Candle | null {
  if (!event.data || !event.data.length) return null;
  return $Candle.safeParse(event.data[0]).data ?? null;
}
