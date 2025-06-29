import { DopamineConfig } from "@/bot/dopamine/dpm.config";
import type { DopamineMemory } from "@/bot/dopamine/dpm.memory";
import type { CandleChEvent } from "@/channel/candle.channel";
import { EventType } from "@/type/trade.type";
import { calcRsiFromGL } from "@/util/rsi";

export class DopamineHelper {
  private readonly conf: DopamineConfig;
  private readonly mem: DopamineMemory;

  constructor(params: { conf: DopamineConfig; mem: DopamineMemory }) {
    this.conf = params.conf;
    this.mem = params.mem;
  }

  saveDataToMemory = (type: EventType) => {
    switch (type) {
      case EventType.CANDLE_CONFIRMED:
        return ({ data }: CandleChEvent) => {
          this.mem.cn.candle = data;
        };
      case EventType.CANDLE_LIVE:
        return ({ data }: CandleChEvent) => {
          this.mem.lv.candle = data;
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
}
