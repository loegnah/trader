import { ExchangeChannel } from "@/channel/ex.channel";
import { $Candle } from "@/model/candle.model";
import { filter } from "rxjs";
import { z } from "zod/v4";

export const $CandleChEvent = z.object({
  topic: z.string(),
  data: $Candle,
});

export type CandleChEvent = z.infer<typeof $CandleChEvent>;

class CandleChannel extends ExchangeChannel<CandleChEvent> {
  onLive$(params: Parameters<typeof this.on$>[0]) {
    return this.on$(params).pipe(filter((event) => !event.data.confirm));
  }

  onConfirmed$(params: Parameters<typeof this.on$>[0]) {
    return this.on$(params).pipe(filter((event) => event.data.confirm));
  }
}

export const candleChannel = new CandleChannel();
