import { ExchangeChannel } from "@/channel/ex.channel";
import type { Exchange } from "@/model/ex.model";
import { filter, map } from "rxjs";
import { z } from "zod/v4";

const $EventData = {
  subscribe: z.object({
    symbols: z.array(z.string()),
  }),
};
type EventData = {
  [key in keyof typeof $EventData]: z.infer<(typeof $EventData)[key]>;
};

export const $StreamCnEvent = z.object({
  category: z.enum(Object.keys($EventData) as [keyof typeof $EventData]),
  data: z.any(),
});
export type StreamChEvent = z.infer<typeof $StreamCnEvent>;

class StreamChannel extends ExchangeChannel<StreamChEvent> {
  subscribe(params: { exchange: Exchange; data: EventData["subscribe"] }) {
    this.emit({
      exchange: params.exchange,
      data: {
        category: "subscribe",
        data: params.data,
      },
    });
  }

  onSubscribe$(params: Parameters<typeof this.on$>[0]) {
    return this.on$(params).pipe(
      filter((event) => event.category === "subscribe"),
      map((event) => $EventData[event.category].parse(event.data)),
    );
  }
}

export const streamCn = new StreamChannel();
