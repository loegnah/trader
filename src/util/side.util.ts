import type { TSide } from "@/type/trade.type";

export function invertSide(side: TSide): TSide {
  return side === "Buy" ? "Sell" : "Buy";
}
