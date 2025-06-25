import { z } from "zod/v4";

// -------------- exchange --------------
export enum Exchange {
  BYBIT = "bybit",
}

// -------------- candle --------------
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

// -------------- position --------------
export const $Position = z.object();

export type Position = z.infer<typeof $Position>;

// -------------- order --------------
export const $Order = z.object();

export type Order = z.infer<typeof $Order>;
