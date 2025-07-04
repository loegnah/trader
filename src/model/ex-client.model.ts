import type {
  Candle,
  TInterval,
  TLimit,
  TOrderType,
  TQty,
  TSide,
  TSymbol,
  TTimeInForce,
  TTimeStamp,
} from "@/type/trade.type";

export abstract class ExchangeClient<T = any> {
  protected abstract client: T;

  abstract client$(): T;

  abstract getAvailableBalance: (params: {
    coinName: string;
  }) => Promise<number>;

  abstract getCandles: (args: {
    symbol: TSymbol;
    interval: TInterval;
    limit: TLimit;
    endTimeStamp?: TTimeStamp;
    withNowCandle?: boolean;
  }) => Promise<Candle[]>;

  abstract getPositionInfo: (params: {
    symbol?: string;
    settleCoin?: string;
  }) => Promise<any>;

  abstract getPositionInfos: (params: { symbol?: string }) => Promise<any[]>;

  abstract getQtyStep(params: { symbol: TSymbol }): Promise<number>;

  abstract createOrder(params: {
    side: TSide;
    orderType: TOrderType;
    symbol: TSymbol;
    qty: TQty;
    price?: number;
    tpPrice?: number;
    slPrice?: number;
    reduceOnly?: boolean;
    timeInForce?: TTimeInForce;
  }): Promise<any>;

  abstract cancelOrder(params: {
    symbol: TSymbol;
    orderId: string;
  }): Promise<any>;

  abstract cancelAllOrders(params: { symbol: TSymbol }): Promise<any>;

  abstract closePosition(params: {
    symbol: TSymbol;
    orderType?: TOrderType;
    side: TSide;
    qty: TQty;
    price?: number;
  }): Promise<any>;

  abstract closeAllPositions(params: { symbol?: string }): Promise<void>;

  abstract closePositionByPortion(params: {
    symbol: TSymbol;
    portion: number;
  }): Promise<any>;

  abstract setTpsl(params: {
    symbol: TSymbol;
    takeProfit?: number;
    stopLoss?: number;
  }): Promise<any>;

  abstract amendTpSlOrder(params: {
    symbol: string;
    orderId: string;
    price: number;
  }): Promise<any>;

  abstract getLeverage(params: { symbol: TSymbol }): Promise<number>;

  abstract setLeverage(params: {
    symbol: TSymbol;
    leverage: number;
  }): Promise<void>;
}
