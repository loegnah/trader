import { ExchangeChannel } from "@/channel/ex.channel";
import type { Exchange } from "@/model/ex.model";
import { filter, map } from "rxjs";
import { z } from "zod/v4";

const $EventData = {
  subscribe: z.object({
    symbol: z.string(),
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
  subscribe(exchange: Exchange, data: EventData["subscribe"]) {
    this.emit({
      exchange,
      data: {
        category: "subscribe",
        data,
      },
    });
  }

  onSubscribe(
    exchange: Exchange,
    handler: (data: EventData["subscribe"]) => void,
  ) {
    return this.get$(exchange)
      .pipe(
        filter((event) => event.category === "subscribe"),
        map((event) => $EventData[event.category].parse(event.data)),
      )
      .subscribe(handler);
  }
}

export const streamCn = new StreamChannel();
