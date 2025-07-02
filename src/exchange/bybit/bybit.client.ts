import {
  convertBybitKlinesToCandles,
  filterEmptyPosition,
} from "@/exchange/bybit/bybit.util";
import { ExchangeClient } from "@/model/ex-client.model";
import {
  $PositionMini,
  $TSide,
  type Candle,
  type TInterval,
  type TLimit,
  type TOrderType,
  type TQty,
  type TSide,
  type TSymbol,
  type TTimeInForce,
  type TTimeStamp,
} from "@/type/trade.type";
import { logger } from "@/util/logger";
import { roundDownToUnit } from "@/util/number.util";
import { invertSide } from "@/util/side.util";
import { RestClientV5 } from "bybit-api";
import dayjs from "dayjs";
import { floor } from "es-toolkit/compat";
import { get } from "radashi";

const CATEGORY = "linear";
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

  client$ = () => this.client;

  getAvailableBalance = async ({
    coinName,
  }: {
    coinName: string; // e.g. USDT
  }): Promise<number> => {
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
  };

  // 캔들 가져옴. (0번 인덱스가 제일 최신 캔들)
  getCandles = async (args: {
    symbol: TSymbol;
    interval: TInterval;
    limit: TLimit;
    endTimeStamp?: TTimeStamp;
    withNowCandle?: boolean;
  }): Promise<Candle[]> => {
    const rawKlines = await this.client
      .getKline({
        category: CATEGORY,
        symbol: args.symbol,
        interval: args.interval,
        end: args.endTimeStamp ?? dayjs().valueOf(),
        limit: args.limit + 1, // 최신은 미완성이라서 밑에서 삭제하기 위함
      })
      .then((res) => res.result.list);
    const slicedRawKlines = args.withNowCandle ? rawKlines : rawKlines.slice(1);
    return convertBybitKlinesToCandles(slicedRawKlines);
  };

  getPositionInfo = async (params: {
    symbol?: string;
    settleCoin?: string;
  }) => {
    const data = await this.client.getPositionInfo({
      category: CATEGORY,
      symbol: params.symbol,
      settleCoin: params.settleCoin ?? "USDT",
    });
    return data.result.list.find((pos) => pos.symbol === params.symbol);
  };

  getPositionInfos = async (params: { symbol?: string }) => {
    const data = await this.client.getPositionInfo({
      category: CATEGORY,
      symbol: params.symbol,
    });
    return data.result.list;
  };

  getQtyStep = async (params: { symbol: TSymbol }): Promise<number> => {
    const info = await this.client.getInstrumentsInfo({
      category: CATEGORY,
      symbol: params.symbol,
    });
    const qtyStep = get(info.result.list, "0.lotSizeFilter.qtyStep");
    if (!qtyStep) {
      throw new Error("[getQtyStep] No qty step found");
    }
    return Number(qtyStep);
  };

  createOrder = async (params: {
    side: TSide;
    orderType: TOrderType;
    symbol: TSymbol;
    qty: TQty;
    price?: number;
    tpPrice?: number; // not percent, just base coin value
    slPrice?: number; // not percent, just base coin value
    reduceOnly?: boolean;
    timeInForce?: TTimeInForce;
  }) => {
    return this.client.submitOrder({
      category: CATEGORY,
      side: params.side,
      orderType: params.orderType,
      price: params.price?.toString(),
      symbol: params.symbol,
      qty: params.qty.toString(),
      tpslMode: "Full",
      takeProfit: params.tpPrice?.toString(),
      stopLoss: params.slPrice?.toString(),
      isLeverage: 1,
      timeInForce: params.timeInForce ?? "GTC",
      reduceOnly: params.reduceOnly ?? false,
    });
  };

  cancelOrder = async (params: { symbol: TSymbol; orderId: string }) => {
    return this.client.cancelOrder({
      category: CATEGORY,
      symbol: params.symbol,
      orderId: params.orderId,
    });
  };

  cancelAllOrders = async (params: { symbol: TSymbol }) => {
    return this.client.cancelAllOrders({
      category: CATEGORY,
      symbol: params.symbol,
    });
  };

  // ------------- position -------------
  closePosition = async (params: {
    symbol: TSymbol;
    orderType?: TOrderType;
    side: TSide;
    qty: TQty;
    price?: number;
  }) => {
    return this.client.submitOrder({
      category: CATEGORY,
      orderType: params.orderType ?? "Market",
      side: params.side,
      symbol: params.symbol,
      qty: params.qty.toString(),
      reduceOnly: true,
      price: params.price?.toString(),
    });
  };

  closeAllPositions = async (params: { symbol?: string }) => {
    const positions = await this.getPositionInfos({
      symbol: params.symbol,
    }).then((res) => res.filter(filterEmptyPosition));

    for (const pos of positions) {
      const { symbol, size, side } = $PositionMini.parse(pos);

      await this.closePosition({
        symbol,
        side,
        qty: size,
      });
    }
  };

  closePositionByPortion = async (params: {
    symbol: TSymbol;
    portion: number;
  }) => {
    const [positionInfo, qtyStep] = await Promise.all([
      this.getPositionInfo({ symbol: params.symbol }),
      this.getQtyStep({ symbol: params.symbol }),
    ]);
    if (!positionInfo) {
      throw new Error("[closePositionByPortion] No position found");
    }
    const qty = roundDownToUnit(
      Number(positionInfo.size) * params.portion,
      qtyStep,
    );
    return this.closePosition({
      symbol: params.symbol,
      side: invertSide($TSide.parse(positionInfo.side)),
      qty,
    });
  };

  // ------------- tp/sl -------------

  setTpsl = async (params: {
    symbol: TSymbol;
    takeProfit?: number;
    stopLoss?: number;
  }) => {
    const ret = await this.client.setTradingStop({
      category: CATEGORY,
      symbol: params.symbol,
      takeProfit: params.takeProfit?.toString(),
      stopLoss: params.stopLoss?.toString(),
      tpslMode: "Full",
      positionIdx: 0,
    });
    if (ret.retMsg !== "OK") {
      logger.error(ret.retMsg);
      throw new Error("[setTpsl] Failed to set tpsl");
    }
    return ret;
  };

  amendTpSlOrder = async (params: {
    symbol: string;
    orderId: string;
    price: number;
  }) => {
    return this.client.amendOrder({
      category: CATEGORY,
      symbol: params.symbol,
      orderId: params.orderId,
      triggerPrice: params.price.toString(),
    });
  };

  // ------------- leverage -------------

  getLeverage = async (params: { symbol: TSymbol }) => {
    const leverage = await this.getPositionInfo({
      symbol: params.symbol,
    }).then((res) => res?.leverage);
    if (!leverage) {
      throw new Error("[getLeverage] No leverage found");
    }
    return Number(leverage);
  };

  setLeverage = async (params: {
    symbol: TSymbol;
    leverage: number;
  }) => {
    const curLeverage = await this.getLeverage({ symbol: params.symbol });
    if (curLeverage === params.leverage) {
      return;
    }
    const ret = await this.client.setLeverage({
      category: CATEGORY,
      symbol: params.symbol,
      buyLeverage: params.leverage.toString(),
      sellLeverage: params.leverage.toString(),
    });
    if (ret.retMsg !== "OK") {
      logger.error(
        {
          errorMsg: ret.retMsg,
        },
        "[setLeverage] Failed to set leverage",
      );
      throw new Error("[setLeverage] Failed to set leverage");
    }
  };
}
