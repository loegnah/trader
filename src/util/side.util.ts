import type { Candle, TSide } from "@/type/trade.type";
import { calcOhlc } from "@/util/candle.util";

export function isLongSide(side: TSide) {
  return side === "Buy";
}

export function isShortSide(side: TSide) {
  return side === "Sell";
}

export function invertSide(side: TSide): TSide {
  return side === "Buy" ? "Sell" : "Buy";
}

export function isOut(value: number, top: number, bottom: number) {
  return value > top || value < bottom;
}

export function isOutWithSide(
  value: number,
  top: number,
  bottom: number,
  side: TSide,
) {
  if (top < bottom) {
    return isOutWithSide(value, bottom, top, side);
  }
  return side === "Buy" ? value > top : value < bottom;
}

export function getSideFromTwoCandles(
  candle: Candle,
  preCandle: Candle,
  isOhlc?: boolean,
) {
  const a = isOhlc ? calcOhlc(candle) : candle.close;
  const b = isOhlc ? calcOhlc(preCandle) : preCandle.close;

  return a > b ? "Buy" : "Sell";
}
