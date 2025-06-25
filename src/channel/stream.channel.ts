import { ExchangeChannel } from "@/channel/ex.channel";
import type { Exchange } from "@/type/trade.type";
import { filter, map } from "rxjs";
import { z } from "zod/v4";

const $EventData = {
  subscribe: z.object({
    topics: z.array(z.string()),
  }),
};

type EventData = {
  [key in keyof typeof $EventData]: z.infer<(typeof $EventData)[key]>;
};

export type StreamCnEvent = {
  category: keyof typeof $EventData;
  data: EventData[keyof typeof $EventData];
};

class StreamChannel extends ExchangeChannel<StreamCnEvent> {
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
