import { z } from "zod/v4";

export const $Candle = z.object({
  start: z.number(),
  end: z.number(),
  timestamp: z.number(),
  open: z.coerce.number(),
  close: z.coerce.number(),
  high: z.coerce.number(),
  low: z.coerce.number(),
  volume: z.coerce.number(),
  confirm: z.boolean(),
});
export type Candle = z.infer<typeof $Candle>;
