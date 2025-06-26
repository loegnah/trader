import type { KlineIntervalV3 } from "bybit-api";
import { z } from "zod/v4";

// --------------- common ----------------
export type TSymbol = string;
export type TInterval = KlineIntervalV3;
export type TLimit = number;
export type TTimeStamp = number;

// -------------- exchange --------------
export enum Exchange {
  BYBIT = "bybit",
}

// -------------- candle --------------
export const $Candle = z.object({
  start: z.coerce.number(),
  open: z.coerce.number(),
  close: z.coerce.number(),
  high: z.coerce.number(),
  low: z.coerce.number(),
  volume: z.coerce.number(),
});

export type Candle = z.infer<typeof $Candle>;

export const $CandleWithConfirm = $Candle.extend({
  confirm: z.boolean(),
});

export type CandleWithConfirm = z.infer<typeof $CandleWithConfirm>;

// -------------- position --------------
export const $Position = z.object();

export type Position = z.infer<typeof $Position>;

// -------------- order --------------
export const $Order = z.object();

export type Order = z.infer<typeof $Order>;
