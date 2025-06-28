import type { KlineIntervalV3 } from "bybit-api";
import { z } from "zod/v4";

// ---------------- enum ----------------
export const $TSide = z.enum(["Buy", "Sell"]);

// --------------- common ----------------
export type TSymbol = string; // ex. BTCUSDT, ETHUSDT ...
export type TInterval = KlineIntervalV3;
export type TLimit = number;
export type TTimeStamp = number;
export type TSide = z.infer<typeof $TSide>;
export type TOrderType = "Market" | "Limit";
export type TQty = number;
export type TTimeInForce = "GTC";

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

export const $PositionInfo = z.object({
  symbol: z.string(),
  size: z.coerce.number(),
  side: $TSide,
});
export type PositionInfo = z.infer<typeof $PositionInfo>;

// -------------- order --------------
export const $Order = z.object();

export type Order = z.infer<typeof $Order>;

// -------------- bot --------------
export enum EventType {
  STARTER = "starter",
  CANDLE_LIVE = "candle-live",
  CANDLE_CONFIRMED = "candle-confirmed",
  ORDER = "order",
  POSITION = "position",
  END = "end",
}

export type PhaseMap<T extends string> = Record<
  T,
  {
    handler: Partial<Record<EventType, (...args: any[]) => Promise<void>>>;
    alertMsg?: string;
  }
>;

export type EventHandlerMap<T extends string> = Partial<
  Record<
    EventType,
    Partial<Record<T, ((...args: any[]) => Promise<void> | void)[]>>
  >
>;
