import { ExchangeChannel } from "@/channel/ex.channel";
import { $Order } from "@/type/trade.type";
import { z } from "zod/v4";

export const $OrderChEvent = z.object({
  orders: z.array($Order),
});

export type OrderChEvent = z.infer<typeof $OrderChEvent>;

export const orderChannel = new ExchangeChannel<OrderChEvent>();
