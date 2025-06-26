import { ExchangeChannel } from "@/channel/ex.channel";
import { $Candle } from "@/type/trade.type";
import { filter } from "rxjs";
import { z } from "zod/v4";

export const $CandleChEvent = z.object({
  topic: z.string(),
  confirm: z.boolean(),
  data: $Candle,
});

export type CandleChEvent = z.infer<typeof $CandleChEvent>;

class CandleChannel extends ExchangeChannel<CandleChEvent> {
  onLive$(params: Parameters<typeof this.on$>[0]) {
    return this.on$(params).pipe(filter((event) => !event.confirm));
  }

  onConfirmed$(params: Parameters<typeof this.on$>[0]) {
    return this.on$(params).pipe(filter((event) => event.confirm));
  }
}

export const candleChannel = new CandleChannel();
