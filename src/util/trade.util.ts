import type { Order, TSide } from "@/type/trade.type";
import { isLongSide } from "@/util/side.util";

// -------------------- price --------------------
export function calcPrice(price: number, ratio: number, side: TSide) {
  const realRatio = isLongSide(side) ? ratio : -ratio;
  return price * (1 + realRatio);
}

// -------------------- order --------------------

export function classifyOrderData(orders: Order[]) {
  return orders.reduce(
    (acc, order) => {
      const { stopOrderType: soType, orderStatus: status, reduceOnly } = order;
      if (soType === "TakeProfit" && status === "Untriggered")
        acc.tpUntriggeredOrder = order;
      else if (soType === "TakeProfit" && status === "Filled")
        acc.tpFilledOrder = order;
      else if (soType === "StopLoss" && status === "Untriggered")
        acc.slUntriggeredOrder = order;
      else if (soType === "StopLoss" && status === "Filled")
        acc.slFilledOrder = order;
      else if (soType === "" && !reduceOnly && status === "Untriggered")
        acc.entryUntriggeredOrder = order;
      else if (soType === "" && !reduceOnly && status === "Filled")
        acc.entryFilledOrder = order;
      else acc.otherOrders.push(order);
      return acc;
    },
    {
      otherOrders: [],
    } as {
      entryUntriggeredOrder?: Order;
      entryFilledOrder?: Order;
      tpUntriggeredOrder?: Order;
      tpFilledOrder?: Order;
      slUntriggeredOrder?: Order;
      slFilledOrder?: Order;
      otherOrders: Order[];
    },
  );
}
