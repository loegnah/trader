import type { DopamineConfig } from "@/bot/dopamine/dpm.config";
import type { MemoryCandleData } from "@/type/trade.type";

export class DopamineMemory {
  private readonly conf: DopamineConfig;

  cn!: MemoryCandleData;
  lv!: MemoryCandleData;
  rsiData: {
    gains: number[];
    losses: number[];
  };

  // 각 round 마다 리셋되는 데이터
  round: {
    abc?: string;
  };

  constructor(params: { conf: DopamineConfig }) {
    this.conf = params.conf;
    this.round = {};
    this.rsiData = {
      gains: [],
      losses: [],
    };
  }

  init = (params: {
    lv: MemoryCandleData;
    cn: MemoryCandleData;
    gains: number[];
    losses: number[];
  }) => {
    this.lv = params.lv;
    this.cn = params.cn;
    this.rsiData = {
      gains: params.gains,
      losses: params.losses,
    };
  };

  resetRound = () => {
    this.round = {};
  };
}
