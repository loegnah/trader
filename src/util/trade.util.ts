import type { TSide } from "@/type/trade.type";
import { isLongSide } from "@/util/side.util";

// -------------------- price --------------------
export function calcPrice(price: number, ratio: number, side: TSide) {
  const realRatio = isLongSide(side) ? ratio : -ratio;
  return price * (1 + realRatio);
}
