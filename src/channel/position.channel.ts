import { ExchangeChannel } from "@/channel/ex.channel";
import { $PositionData } from "@/type/trade.type";
import { z } from "zod/v4";

export const $PositionChEvent = z.object({
  positionDatas: z.array($PositionData),
});

export type PositionChEvent = z.infer<typeof $PositionChEvent>;

export const positionChannel = new ExchangeChannel<PositionChEvent>();
