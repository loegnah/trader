import { ExchangeChannel } from "@/channel/ex.channel";
import { $Position } from "@/type/trade.type";
import { z } from "zod/v4";

export const $PositionChEvent = z.object({
  data: $Position,
});

export type PositionChEvent = z.infer<typeof $PositionChEvent>;

export const positionChannel = new ExchangeChannel<PositionChEvent>();
