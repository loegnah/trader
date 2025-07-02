import type { KlineIntervalV3, OrderStatusV5 } from "bybit-api";
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

export const $CandleCore = $Candle.pick({
  open: true,
  close: true,
  high: true,
  low: true,
});

export type CandleCore = z.infer<typeof $CandleCore>;

export const $CandleWithConfirm = $Candle.extend({
  confirm: z.boolean(),
});

export type CandleWithConfirm = z.infer<typeof $CandleWithConfirm>;

// -------------- position --------------
export const $Position = z.object({
  symbol: z.string(),
  side: $TSide,
  positionValue: z.coerce.number(), // 포지션 가치 (ex. 1000 USDT)
  size: z.coerce.number(), // 포지션 개수 (ex. 0.5 BTC)
  entryPrice: z.coerce.number(), // 평단가
  leverage: z.coerce.number(),
});
export type Position = z.infer<typeof $Position>;

export const $PositionData = $Position.extend({
  side: z.enum(["Buy", "Sell", ""]),
});
export type PositionData = z.infer<typeof $PositionData>;

export const $PositionMini = $PositionData
  .pick({
    symbol: true,
    size: true,
  })
  .extend({
    side: $TSide,
  });
export type PositionMini = z.infer<typeof $PositionMini>;

// -------------- order --------------
export const ORDER_STATUS = [
  "Created",
  "New",
  "Rejected",
  "PartiallyFilled",
  "PartiallyFilledCanceled",
  "Filled",
  "Cancelled",
  "Untriggered",
  "Triggered",
  "Deactivated",
  "Active",
] as const satisfies OrderStatusV5[];

export const $Order = z.object({
  symbol: z.string(),
  orderStatus: z.enum(ORDER_STATUS),
  orderId: z.string(),
  stopOrderType: z.enum(["StopLoss", "TakeProfit", ""]),
  side: $TSide,
  price: z.coerce.number(),
  avgPrice: z.coerce.number(),
  triggerPrice: z.coerce.number().optional(),
  qty: z.coerce.number(),
  cumExecQty: z.coerce.number(),
  reduceOnly: z.boolean(),
  updatedTime: z.coerce.number(),
});

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

export type PhaseMap<T extends string> = Partial<
  Record<
    T,
    {
      handler: Partial<
        Record<EventType, (...args: any[]) => Promise<void> | void>
      >;
      msgEnterPhase?: string;
    }
  >
>;

export type EventHandlerMap<T extends string> = Partial<
  Record<
    EventType,
    Partial<Record<T, ((...args: any[]) => Promise<void> | void)[]>>
  >
>;

// --------------- memory ---------------
export type MemoryCandleData = {
  candle: Candle;
  side: TSide;
  preCandle: Candle;
  preSide: TSide;
  rsi?: number;
  preRsi?: number;
};
