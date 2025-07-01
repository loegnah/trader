import { DopamineConfig } from "@/bot/dopamine/dpm.config";
import type { DopamineMemory } from "@/bot/dopamine/dpm.memory";
import type { CandleChEvent } from "@/channel/candle.channel";
import type { OrderChEvent } from "@/channel/order.channel";
import type { PositionChEvent } from "@/channel/position.channel";
import type { ExchangeClient } from "@/model/ex-client.model";
import {
  type Candle,
  EventType,
  type Position,
  type TSide,
} from "@/type/trade.type";
import { roundDownToUnit } from "@/util/number.util";
import { calcRsiFromGL } from "@/util/rsi";
import { isOut } from "@/util/side.util";
import { calcPrice } from "@/util/trade.util";

export class DopamineHelper {
  private readonly conf: DopamineConfig;
  private readonly mem: DopamineMemory;
  private readonly client: ExchangeClient;

  constructor(params: {
    conf: DopamineConfig;
    mem: DopamineMemory;
    client: ExchangeClient;
  }) {
    this.conf = params.conf;
    this.mem = params.mem;
    this.client = params.client;
  }

  saveDataToMemory = (type: EventType) => {
    switch (type) {
      case EventType.CANDLE_CONFIRMED:
        return ({ data }: CandleChEvent) => {
          this.mem.cn.candle = data;
        };
      case EventType.POSITION:
        return ({ position }: { position: Position }) => {
          this.mem.position = position;
        };
      case EventType.ORDER:
        return ({ orders }: OrderChEvent) => {
          this.mem.orders = orders;
        };
    }
  };

  makeRsi = (params: { candleType: "cn" | "lv" }) => () => {
    const candleData = this.mem[params.candleType];
    const { candle, preCandle } = candleData;
    const { gains: preGains, losses: preLosses } = this.mem.rsiData;

    const { rsi, gains, losses } = calcRsiFromGL({
      change: candle.close - preCandle.close,
      preGains,
      preLosses,
    });
    this.mem.rsiData = { gains, losses };
    candleData.preRsi = candleData.rsi;
    candleData.rsi = rsi;
  };

  checkTriggerLevel = (params: { candle: Candle; rsi: number }): {
    triggerLevel: number;
    side: TSide;
  } => {
    const { rsi_trigger_top, rsi_trigger_btm } = this.conf;

    let triggerLevel = 0;
    for (let i = rsi_trigger_top.length - 1; i >= 0; i--) {
      const top = rsi_trigger_top[i]!;
      const btm = rsi_trigger_btm[i]!;
      if (isOut(params.rsi, top, btm)) {
        triggerLevel = i + 1;
        break;
      }
    }
    return { triggerLevel, side: params.rsi > 50 ? "Sell" : "Buy" };
  };

  checkPoint = (params: { candle: Candle }) => {
    const { pointTop, pointBtm } = this.mem.round;
    this.mem.round.pointTop = Math.max(pointTop, params.candle.high);
    this.mem.round.pointBtm = Math.min(pointBtm, params.candle.low);
  };

  getOrderRequirements = async () => {
    const [totalBalance, qtyStep] = await Promise.all([
      this.client.getAvailableBalance({
        coinName: "USDT",
      }),
      this.client.getQtyStep({
        symbol: this.conf.symbol,
      }),
    ]);
    return {
      totalBalance,
      qtyStep,
    };
  };

  reqEntryOrder = async ({ price, side }: { price: number; side: TSide }) => {
    const { totalBalance, qtyStep } = await this.getOrderRequirements();
    const qty = roundDownToUnit(
      (totalBalance *
        this.conf.balanceRatio *
        this.conf.leverage *
        this.conf.portionEntry1st) /
        price,
      qtyStep,
    );
    await this.client.createOrder({
      symbol: this.conf.symbol,
      orderType: "Market",
      side,
      qty,
    });
  };
}
