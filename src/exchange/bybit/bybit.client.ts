import { ExchangeClient } from "@/model/ex-client.model";
import { RestClientV5 } from "bybit-api";
import { floor } from "es-toolkit/compat";

export class BybitClient extends ExchangeClient<RestClientV5> {
  protected client: RestClientV5;

  constructor(params: {
    apiKey: string;
    apiSecret: string;
    isDemoTrading?: boolean;
    isTestnet?: boolean;
  }) {
    super();
    this.client = new RestClientV5({
      key: params.apiKey,
      secret: params.apiSecret,
      demoTrading: params.isDemoTrading,
      testnet: params.isTestnet,
    });
  }

  getClient$() {
    return this.client;
  }

  async getAvailableBalance({
    coinName,
  }: {
    coinName: string; // e.g. USDT
  }): Promise<number> {
    const ret = await this.client.getWalletBalance({
      accountType: "UNIFIED",
      coin: coinName,
    });
    if (ret.result.list.length === 0) {
      throw new Error("[getAvailableBalance] Failed to get wallet balance");
    }
    const coins = ret.result.list[0]?.coin;
    if (!coins) {
      throw new Error("[getAvailableBalance] No coins found");
    }
    const targetCoin = coins.find((coin) => coin.coin === coinName);
    if (!targetCoin) {
      throw new Error(`[getAvailableBalance] No ${coinName} found`);
    }
    const walletBalance = Number(targetCoin.walletBalance); // (증거금까지 포함한) 코인 잔액
    const totalPositionIM = Number(targetCoin.totalPositionIM); // 전체 포지션 증거금 총합
    return floor(walletBalance - totalPositionIM, 2);
  }

  // // 캔들 가져옴. (0번 인덱스가 제일 최신 캔들)
  // async getCandles({
  //   symbol,
  //   interval,
  //   count,
  //   endTimeStamp = dayjs().valueOf(), // default 현재 (즉 최신데이터를 가져온다는 뜻)
  // }: {
  //   symbol: string;
  //   interval: KlineIntervalV3;
  //   count: number;
  //   endTimeStamp?: number;
  // }): Promise<Candle[]> {
  //   const candlesRaw = await this.bybit
  //     .getKline({
  //       category: "linear",
  //       symbol,
  //       interval,
  //       end: endTimeStamp,
  //       limit: count + 1, // 최신은 미완성이라서 밑에서 삭제하기 위함
  //     })
  //     .then((res) => res.result.list);
  //   return candlesRaw.slice(1).map((data) => ({
  //     start: Number(data[0]),
  //     open: Number(data[1]),
  //     high: Number(data[2]),
  //     low: Number(data[3]),
  //     close: Number(data[4]),
  //   }));
  // }

  // async getOhlcs({
  //   symbol,
  //   interval,
  //   count,
  //   reverse = false,
  // }: {
  //   symbol: string;
  //   interval: KlineIntervalV3;
  //   count: number;
  //   reverse?: boolean;
  // }): Promise<number[]> {
  //   const candles = await this.getCandles({ symbol, interval, count });
  //   const ohlcs = candleTool.convertCandles(candles, "ohlc");
  //   return reverse ? ohlcs.reverse() : ohlcs;
  // }

  // async createOrder(params: {
  //   side: Side;
  //   orderType: "Market" | "Limit";
  //   symbol: string;
  //   qty: string;
  //   price?: number;
  //   tpPrice?: number; // not percent, just base coin value
  //   slPrice?: number; // not percent, just base coin value
  //   reduceOnly?: boolean;
  // }) {
  //   return this.bybit.submitOrder({
  //     category: "linear",
  //     side: params.side,
  //     orderType: params.orderType,
  //     price: params.price?.toString(),
  //     symbol: params.symbol,
  //     qty: params.qty,
  //     tpslMode: "Full",
  //     takeProfit: params.tpPrice?.toString(),
  //     stopLoss: params.slPrice?.toString(),
  //     isLeverage: 1,
  //     timeInForce: "GTC", // 디폴트긴 함
  //     reduceOnly: params.reduceOnly,
  //   });
  // }

  // async amendTpSlOrder(params: {
  //   symbol: string;
  //   orderId: string;
  //   price: number;
  // }) {
  //   return this.bybit.amendOrder({
  //     category: "linear",
  //     symbol: params.symbol,
  //     orderId: params.orderId,
  //     triggerPrice: params.price.toString(),
  //   });
  // }

  // async cancelOrder({ symbol, orderId }: { symbol: string; orderId: string }) {
  //   return this.bybit.cancelOrder({ category: "linear", symbol, orderId });
  // }

  // async clearAllOrders({ symbol }: { symbol: string }) {
  //   return this.bybit.cancelAllOrders({ category: "linear", symbol });
  // }

  // async closePosition({
  //   symbol,
  //   side,
  //   qty,
  // }: {
  //   symbol: string;
  //   side: Side;
  //   qty: string;
  // }) {
  //   return this.bybit
  //     .submitOrder({
  //       category: "linear",
  //       orderType: "Market",
  //       reduceOnly: true,
  //       side,
  //       symbol,
  //       qty,
  //     })
  //     .then((ret) => {
  //       if (ret.retCode !== 0) {
  //         throw new Error(ret.retMsg);
  //       }
  //     });
  // }

  // async closePositionByPortion({
  //   symbol,
  //   portion,
  // }: {
  //   symbol: string;
  //   portion: number;
  // }) {
  //   const positionInfo = await this.getPositionInfo({ symbol });
  //   if (!positionInfo) {
  //     throw new Error("No position found");
  //   }
  //   const qtyStep = await this.getQtyStep({ symbol });
  //   const qty = roundDownToUnit(Number(positionInfo.size) * portion, qtyStep);
  //   return this.closePosition({
  //     symbol,
  //     side: getOppositeSide(positionInfo.side as Side),
  //     qty: qty.toString(),
  //   });
  // }

  // async closeAll({ symbol }: { symbol: string }) {
  //   await this.closeAllPositions({ symbol });
  //   await this.clearAllOrders({ symbol });
  // }

  // async closeAllPositions({ symbol }: { symbol?: string }) {
  //   const data = await this.bybit.getPositionInfo({
  //     symbol,
  //     category: "linear",
  //   });

  //   if (!data.result.list || data.result.list.length === 0) {
  //     return;
  //   }

  //   for (const pos of data.result.list) {
  //     if (!pos.size || Number(pos.size) === 0) continue;

  //     const symbol = pos.symbol;
  //     const side = getOppositeSide(pos.side as Side);
  //     const qty = pos.size;

  //     try {
  //       await this.closePosition({
  //         symbol,
  //         side,
  //         qty,
  //       });
  //     } catch (_e) {}
  //   }
  // }

  // async getPositionInfo({
  //   symbol,
  //   settleCoin,
  // }: {
  //   symbol?: string;
  //   settleCoin?: string;
  // }) {
  //   const data = await this.bybit.getPositionInfo({
  //     category: "linear",
  //     settleCoin,
  //     symbol,
  //   });
  //   if (data.result.list.length === 0) {
  //     return null;
  //   }
  //   return data.result.list.find((pos) => pos.symbol === symbol);
  // }

  // async getLeverage({ symbol }: { symbol: string }) {
  //   const positionInfo = await this.bybit.getPositionInfo({
  //     category: "linear",
  //     symbol,
  //   });

  //   return positionInfo.result.list.length
  //     ? positionInfo.result.list[0].leverage
  //     : null;
  // }

  // async setLeverage({
  //   symbol,
  //   leverage,
  // }: {
  //   symbol: string;
  //   leverage: number;
  // }) {
  //   const curLeverage = await this.getLeverage({ symbol });
  //   if (Number(curLeverage) === leverage) {
  //     return;
  //   }
  //   const ret = await this.bybit.setLeverage({
  //     category: "linear",
  //     symbol,
  //     buyLeverage: leverage.toString(),
  //     sellLeverage: leverage.toString(),
  //   });
  //   if (ret.retMsg !== "OK") {
  //     throw new Error(ret.retMsg);
  //   }
  //   return leverage;
  // }

  // async setTpsl({
  //   symbol,
  //   takeProfit,
  //   stopLoss,
  // }: {
  //   symbol: string;
  //   takeProfit?: number;
  //   stopLoss?: number;
  // }) {
  //   const ret = await this.bybit.setTradingStop({
  //     category: "linear",
  //     symbol,
  //     tpslMode: "Full",
  //     positionIdx: 0,
  //     takeProfit: takeProfit?.toString(),
  //     stopLoss: stopLoss?.toString(),
  //   });
  //   if (ret.retMsg !== "OK") {
  //     throw new Error(ret.retMsg);
  //   }
  //   return ret;
  // }

  // async getQtyStep({ symbol }: { symbol: string }): Promise<number> {
  //   const info = await this.bybit.getInstrumentsInfo({
  //     category: "linear",
  //     symbol,
  //   });
  //   if (
  //     !info.result.list.length ||
  //     !info.result.list[0].lotSizeFilter.qtyStep
  //   ) {
  //     throw new Error("No qty step found");
  //   }
  //   return Number(info.result.list[0].lotSizeFilter.qtyStep);
  // }
}
