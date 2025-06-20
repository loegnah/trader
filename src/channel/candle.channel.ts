import { ExchangeChannel } from "@/channel/ex.channel";
import { $Candle } from "@/model/candle.model";
import { z } from "zod/v4";

export const $CandleChEvent = z.object({
  symbol: z.string(),
  data: $Candle,
});

export type CandleChEvent = z.infer<typeof $CandleChEvent>;

export const candleChannel = new ExchangeChannel<CandleChEvent>();
